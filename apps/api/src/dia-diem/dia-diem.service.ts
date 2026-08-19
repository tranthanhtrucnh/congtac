import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { NhatKyService } from "../common/nhat-ky/nhat-ky.service";
import { boDauTiengViet } from "../common/utils/bo-dau.util";
import type {
  DanhSachDiaDiemInput,
  TaoDiaDiemInput,
  SuaDiaDiemInput,
  XoaNhieuDiaDiemInput,
} from "@congtac/validation";
import type { DiaDiem } from "@prisma/client";

/**
 * Danh muc Dia diem quy mo nho (vai chuc ban ghi thuc te) - loc/sap/phan
 * trang deu lam o tang ung dung sau khi lay theo dieu kien trangThai tu DB,
 * don gian hon la viet dieu kien OR phuc tap cho mang cacTenTat trong Prisma
 * (xem NHAT_KY_QUYET_DINH.md).
 */
function khopTuKhoa(diaDiem: DiaDiem, tuKhoaKhongDau: string, tuKhoaGoc: string): boolean {
  if (boDauTiengViet(diaDiem.tenDayDu).includes(tuKhoaKhongDau)) return true;
  return diaDiem.cacTenTat.some((ten) => ten.toLowerCase().includes(tuKhoaGoc.toLowerCase()));
}

@Injectable()
export class DiaDiemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nhatKy: NhatKyService,
  ) {}

  async danhSach(truyVan: DanhSachDiaDiemInput) {
    const { trang, kichThuoc, tuKhoa, trangThai, chiThuongDung, sapXepTheo, huongSapXep } = truyVan;

    const where: Prisma.DiaDiemWhereInput = {
      ...(trangThai ? { trangThai } : {}),
      ...(chiThuongDung ? { thuongDung: true } : {}),
    };

    let ketQua = await this.prisma.diaDiem.findMany({ where });

    if (tuKhoa && tuKhoa.trim()) {
      const tuKhoaKhongDau = boDauTiengViet(tuKhoa);
      ketQua = ketQua.filter((dd) => khopTuKhoa(dd, tuKhoaKhongDau, tuKhoa.trim()));
    }

    const huong = huongSapXep === "desc" ? -1 : 1;
    if (sapXepTheo === "trangThai") {
      ketQua.sort((a, b) => huong * a.trangThai.localeCompare(b.trangThai));
    } else {
      ketQua.sort((a, b) => huong * a.tenDayDu.localeCompare(b.tenDayDu, "vi"));
    }

    const tong = ketQua.length;
    const duLieu = ketQua.slice((trang - 1) * kichThuoc, trang * kichThuoc);

    return { duLieu, tong, trang, kichThuoc };
  }

  async chiTiet(id: string) {
    const diaDiem = await this.prisma.diaDiem.findUnique({ where: { id } });
    if (!diaDiem) {
      throw new NotFoundException("Không tìm thấy địa điểm");
    }
    return diaDiem;
  }

  async tao(duLieu: TaoDiaDiemInput, nguoiThucHienId: string) {
    const diaDiem = await this.prisma.diaDiem.create({
      data: {
        tenDayDu: duLieu.tenDayDu,
        cacTenTat: duLieu.cacTenTat,
        ghiChu: duLieu.ghiChu,
        thuongDung: duLieu.thuongDung,
        diemDiMacDinh: duLieu.diemDiMacDinh,
      },
    });

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiThucHienId,
      hanhDong: "TAO_DIA_DIEM",
      doiTuong: "DiaDiem",
      doiTuongId: diaDiem.id,
      giaTriSau: { tenDayDu: diaDiem.tenDayDu },
    });

    return diaDiem;
  }

  async sua(id: string, duLieu: SuaDiaDiemInput, nguoiThucHienId: string) {
    const truoc = await this.chiTiet(id);

    const sau = await this.prisma.diaDiem.update({
      where: { id },
      data: duLieu,
    });

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiThucHienId,
      hanhDong: "SUA_DIA_DIEM",
      doiTuong: "DiaDiem",
      doiTuongId: id,
      giaTriTruoc: truoc,
      giaTriSau: sau,
    });

    return sau;
  }

  async xoa(id: string, nguoiThucHienId: string) {
    const diaDiem = await this.chiTiet(id);
    await this.prisma.diaDiem.delete({ where: { id } });

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiThucHienId,
      hanhDong: "XOA_DIA_DIEM",
      doiTuong: "DiaDiem",
      doiTuongId: id,
      giaTriTruoc: { tenDayDu: diaDiem.tenDayDu },
    });
  }

  async xoaNhieu(duLieu: XoaNhieuDiaDiemInput, nguoiThucHienId: string) {
    const danhSachXoa = await this.prisma.diaDiem.findMany({
      where: { id: { in: duLieu.ids } },
      select: { id: true, tenDayDu: true },
    });

    await this.prisma.diaDiem.deleteMany({ where: { id: { in: duLieu.ids } } });

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiThucHienId,
      hanhDong: "XOA_NHIEU_DIA_DIEM",
      doiTuong: "DiaDiem",
      giaTriTruoc: { danhSach: danhSachXoa },
    });

    return { soLuongDaXoa: danhSachXoa.length };
  }
}
