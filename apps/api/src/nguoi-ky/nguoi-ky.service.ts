import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, TrangThaiNguoiKy } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { NhatKyService } from "../common/nhat-ky/nhat-ky.service";
import { boDauTiengViet } from "../common/utils/bo-dau.util";
import type { DanhSachNguoiKyInput, TaoNguoiKyInput, SuaNguoiKyInput } from "@congtac/validation";

const NHAN_VIEN_CHON = { select: { id: true, hoTen: true, chucVu: true, donViCongTac: true } } as const;

// Danh muc nho (vai chuc ban ghi) - loc/sap/phan trang o tang ung dung, dung
// pattern da chon cho Dia diem (xem NHAT_KY_QUYET_DINH.md).
const THU_TU_TRANG_THAI: Record<TrangThaiNguoiKy, number> = {
  DANG_KY_CHINH_THUC: 0,
  DU_PHONG: 1,
  NGUNG_SU_DUNG: 2,
};

@Injectable()
export class NguoiKyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nhatKy: NhatKyService,
  ) {}

  async danhSach(truyVan: DanhSachNguoiKyInput) {
    const { trang, kichThuoc, tuKhoa, trangThai } = truyVan;

    const where: Prisma.NguoiKyWhereInput = {
      ...(trangThai ? { trangThai } : {}),
    };

    let ketQua = await this.prisma.nguoiKy.findMany({ where, include: { nhanVien: NHAN_VIEN_CHON } });

    if (tuKhoa && tuKhoa.trim()) {
      const tuKhoaKhongDau = boDauTiengViet(tuKhoa);
      ketQua = ketQua.filter((nk) => boDauTiengViet(nk.nhanVien.hoTen).includes(tuKhoaKhongDau));
    }

    ketQua.sort((a, b) => {
      const chenhLech = THU_TU_TRANG_THAI[a.trangThai] - THU_TU_TRANG_THAI[b.trangThai];
      if (chenhLech !== 0) return chenhLech;
      return a.nhanVien.hoTen.localeCompare(b.nhanVien.hoTen, "vi");
    });

    const tong = ketQua.length;
    const duLieu = ketQua.slice((trang - 1) * kichThuoc, trang * kichThuoc);

    return { duLieu, tong, trang, kichThuoc };
  }

  async chiTiet(id: string) {
    const nguoiKy = await this.prisma.nguoiKy.findUnique({
      where: { id },
      include: { nhanVien: NHAN_VIEN_CHON },
    });
    if (!nguoiKy) {
      throw new NotFoundException("Không tìm thấy người ký");
    }
    return nguoiKy;
  }

  async tao(duLieu: TaoNguoiKyInput, nguoiThucHienId: string) {
    try {
      const nguoiKy = await this.prisma.nguoiKy.create({
        data: {
          nhanVienId: duLieu.nhanVienId,
          chucDanhKy: duLieu.chucDanhKy,
          theThucKy: duLieu.theThucKy,
          ghiChu: duLieu.ghiChu,
        },
        include: { nhanVien: NHAN_VIEN_CHON },
      });

      await this.nhatKy.ghiNhan({
        nguoiDungId: nguoiThucHienId,
        hanhDong: "TAO_NGUOI_KY",
        doiTuong: "NguoiKy",
        doiTuongId: nguoiKy.id,
        giaTriSau: { hoTen: nguoiKy.nhanVien.hoTen, chucDanhKy: nguoiKy.chucDanhKy },
      });

      return nguoiKy;
    } catch (loi) {
      if (loi instanceof Prisma.PrismaClientKnownRequestError && loi.code === "P2002") {
        throw new ConflictException("Nhân viên này đã có trong danh mục người ký");
      }
      throw loi;
    }
  }

  async sua(id: string, duLieu: SuaNguoiKyInput, nguoiThucHienId: string) {
    const truoc = await this.chiTiet(id);

    const sau = await this.prisma.nguoiKy.update({
      where: { id },
      data: duLieu,
      include: { nhanVien: NHAN_VIEN_CHON },
    });

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiThucHienId,
      hanhDong: "SUA_NGUOI_KY",
      doiTuong: "NguoiKy",
      doiTuongId: id,
      giaTriTruoc: truoc,
      giaTriSau: sau,
    });

    return sau;
  }

  async xoa(id: string, nguoiThucHienId: string) {
    const nguoiKy = await this.chiTiet(id);
    await this.prisma.nguoiKy.delete({ where: { id } });

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiThucHienId,
      hanhDong: "XOA_NGUOI_KY",
      doiTuong: "NguoiKy",
      doiTuongId: id,
      giaTriTruoc: { hoTen: nguoiKy.nhanVien.hoTen, chucDanhKy: nguoiKy.chucDanhKy },
    });
  }

  /**
   * Dat 1 nguoi ky thanh "Dang ky chinh thuc" - THEO THIET KE da chot voi
   * nguoi dung (xem NHAT_KY_QUYET_DINH.md muc "Danh muc Nguoi ky"): chi dung
   * 1 ban ghi co trang thai nay tai 1 thoi diem, dung chung cho ca 3 loai
   * chung tu. Ha nguoi dang giu xuong DU_PHONG va nang nguoi moi len trong
   * CUNG 1 transaction de khong bao gio co 2 nguoi (hoac 0 nguoi so voi
   * truoc do) cung "dang ky chinh thuc" giua chung.
   */
  async datChinhThuc(id: string, nguoiThucHienId: string) {
    // Doc "truoc" chi phuc vu MO TA trong nhat ky, KHONG dung de quyet dinh
    // logic update (tranh doc-roi-quyet-dinh gay write skew khi 2 nguoi cung
    // bam dat-chinh-thuc gan nhu dong thoi cho 2 nguoi ky khac nhau).
    const truoc = await this.prisma.nguoiKy.findFirst({
      where: { trangThai: TrangThaiNguoiKy.DANG_KY_CHINH_THUC },
      include: { nhanVien: NHAN_VIEN_CHON },
    });

    const sau = await this.prisma.$transaction(async (tx) => {
      const banGhi = await tx.nguoiKy.findUnique({ where: { id } });
      if (!banGhi) {
        throw new NotFoundException("Không tìm thấy người ký");
      }

      // Ha TAT CA nguoi dang "DANG_KY_CHINH_THUC" khac xuong DU_PHONG bang 1
      // UPDATE co dieu kien (khong phai ghi de theo id da doc truoc do). Neu
      // co giao dich dong thoi khac dang giu khoa dong nay, cau UPDATE nay se
      // cho, roi TU DANH GIA LAI dieu kien WHERE tren du lieu MOI NHAT sau
      // khi khoa duoc nha - Postgres dam bao dung 1 nguoi DANG_KY_CHINH_THUC
      // sau khi ca 2 giao dich hoan tat, khong bao gio ra 2 nguoi cung luc.
      await tx.nguoiKy.updateMany({
        where: { trangThai: TrangThaiNguoiKy.DANG_KY_CHINH_THUC, id: { not: id } },
        data: { trangThai: TrangThaiNguoiKy.DU_PHONG },
      });

      return tx.nguoiKy.update({
        where: { id },
        data: { trangThai: TrangThaiNguoiKy.DANG_KY_CHINH_THUC },
        include: { nhanVien: NHAN_VIEN_CHON },
      });
    });

    if (truoc?.id !== sau.id) {
      await this.nhatKy.ghiNhan({
        nguoiDungId: nguoiThucHienId,
        hanhDong: "DAT_NGUOI_KY_CHINH_THUC",
        doiTuong: "NguoiKy",
        doiTuongId: sau.id,
        giaTriTruoc: truoc ? { id: truoc.id, hoTen: truoc.nhanVien.hoTen } : null,
        giaTriSau: { id: sau.id, hoTen: sau.nhanVien.hoTen },
      });
    }

    return sau;
  }
}
