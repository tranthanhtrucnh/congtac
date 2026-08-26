import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { NhatKyService } from "../common/nhat-ky/nhat-ky.service";
import { boDauTiengViet } from "../common/utils/bo-dau.util";
import { xepHangChucVu } from "./xep-hang-chuc-vu.util";
import type {
  DanhSachNhanVienInput,
  TaoNhanVienInput,
  SuaNhanVienInput,
  XoaNhieuNhanVienInput,
} from "@congtac/validation";
import type { NhanVien } from "@prisma/client";

/**
 * Tim theo nhieu tu, khong phan biet thu tu (vd "van a" khop "Nguyen Van A"
 * va ca "A Van Nguyen"), thay vi chi khop 1 chuoi con lien tuc nhu truoc.
 * Neu tu khoa co chua chu so thi cung thu khop them theo CCCD/CMND.
 */
function xayDieuKienTimKiem(tuKhoa?: string): Prisma.NhanVienWhereInput | null {
  if (!tuKhoa || !tuKhoa.trim()) return null;
  const tuKhoaChuan = tuKhoa.trim();
  const tuNgu = boDauTiengViet(tuKhoaChuan).split(/\s+/).filter(Boolean);

  const dieuKienOr: Prisma.NhanVienWhereInput[] = [];

  if (tuNgu.length > 0) {
    dieuKienOr.push({ AND: tuNgu.map((tu) => ({ hoTenKhongDau: { contains: tu } })) });
  }

  const chuSo = tuKhoaChuan.replace(/\D/g, "");
  if (chuSo.length > 0) {
    dieuKienOr.push({ cccd: { contains: chuSo } });
  }

  if (dieuKienOr.length === 0) return null;
  return { OR: dieuKienOr };
}

/**
 * Sap xep mac dinh: nhom theo don vi cong tac, nhom nao co nguoi chuc vu cao
 * nhat thi len truoc; trong 1 nhom sap theo cap bac chuc vu roi ho ten.
 */
function sapXepMacDinh(danhSach: NhanVien[]): NhanVien[] {
  const nhom = new Map<string, NhanVien[]>();
  for (const nv of danhSach) {
    const khoa = nv.donViCongTac?.trim() || "";
    const ds = nhom.get(khoa) ?? [];
    ds.push(nv);
    nhom.set(khoa, ds);
  }

  const nhomDaSapXep = [...nhom.entries()].sort(([tenA, dsA], [tenB, dsB]) => {
    const hangA = Math.min(...dsA.map((nv) => xepHangChucVu(nv.chucVu)));
    const hangB = Math.min(...dsB.map((nv) => xepHangChucVu(nv.chucVu)));
    if (hangA !== hangB) return hangA - hangB;
    return tenA.localeCompare(tenB, "vi");
  });

  const ketQua: NhanVien[] = [];
  for (const [, ds] of nhomDaSapXep) {
    ds.sort((a, b) => {
      const hieu = xepHangChucVu(a.chucVu) - xepHangChucVu(b.chucVu);
      return hieu !== 0 ? hieu : a.hoTen.localeCompare(b.hoTen, "vi");
    });
    ketQua.push(...ds);
  }
  return ketQua;
}

@Injectable()
export class NhanVienService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nhatKy: NhatKyService,
  ) {}

  async danhSach(truyVan: DanhSachNhanVienInput) {
    const { trang, kichThuoc, tuKhoa, trangThai, chiTaiXe, sapXepTheo, huongSapXep } = truyVan;

    const where: Prisma.NhanVienWhereInput = {
      ...(xayDieuKienTimKiem(tuKhoa) ?? {}),
      ...(trangThai ? { trangThai } : {}),
      ...(chiTaiXe ? { laTaiXe: true } : {}),
    };

    // Co chon sap xep theo 1 cot cu the -> sap xep + phan trang o database nhu binh thuong.
    if (sapXepTheo) {
      const [duLieu, tong] = await this.prisma.$transaction([
        this.prisma.nhanVien.findMany({
          where,
          orderBy: { [sapXepTheo]: huongSapXep },
          skip: (trang - 1) * kichThuoc,
          take: kichThuoc,
        }),
        this.prisma.nhanVien.count({ where }),
      ]);
      return { duLieu, tong, trang, kichThuoc };
    }

    // Mac dinh: nhom theo phong ban (nhom co chuc vu cao nhat len truoc), trong
    // nhom sap theo cap bac chuc vu roi ho ten. Cap bac la suy doan tu chuoi
    // chuc vu tu do nen phai sap xep o ung dung, khong the dung orderBy cua
    // Prisma - lay het ket qua khop dieu kien loc roi phan trang o bo nho
    // (quy mo nhan su cua 1 don vi chi vai tram nguoi, khong anh huong hieu nang).
    const tatCa = await this.prisma.nhanVien.findMany({ where });
    const daSapXep = sapXepMacDinh(tatCa);
    const tong = daSapXep.length;
    const duLieu = daSapXep.slice((trang - 1) * kichThuoc, trang * kichThuoc);

    return { duLieu, tong, trang, kichThuoc };
  }

  async chiTiet(id: string) {
    const nhanVien = await this.prisma.nhanVien.findUnique({ where: { id } });
    if (!nhanVien) {
      throw new NotFoundException("Không tìm thấy nhân viên");
    }
    return nhanVien;
  }

  /**
   * Kiem tra 1 nhan vien co dang la thanh vien (chua bi loai khoi doan) cua
   * DOAN CONG TAC KHAC (LenhDieuCongTac chua huy) co khoang ngay HIEU LUC
   * (ngayDiRieng/ngayVeRieng cua chinh nguoi do neu co, khong thi moi ve
   * ngay chung cua doan - dung CHINH cong thuc da dung o layChiTietGiayDiDuong()/
   * danhSachGiayDiDuong() ben lenh-dieu-cong-tac.service.ts) GIAO NHAU voi
   * [ngayDi, ngayVe] truyen vao khong - dung khi Van thu dang chon them 1
   * nhan vien vao doan (canh bao truoc khi luu, KHONG chan luu - nguoi dung
   * yeu cau 2026-08-19, xem NHAT_KY_QUYET_DINH.md).
   *
   * Tinh effective date + kiem tra giao nhau NGAY TRONG APP (khong loc bang
   * where cua Prisma) vi effective date phu thuoc dieu kien (ngay rieng hay
   * khong) khong the bieu dien truc tiep bang 1 dieu kien where - so luong
   * doan cong tac cua 1 nhan vien thuong nho (vai chuc ban ghi), khong can
   * toi uu SQL phuc tap cho truong hop nay.
   */
  async kiemTraTrungLich(nhanVienId: string, ngayDi: Date, ngayVe: Date, loaiTruLenhId?: string) {
    const danhSachThamGia = await this.prisma.thanhVienLenhDieuCongTac.findMany({
      where: {
        nhanVienId,
        daLoaiKhoiDoan: false,
        lenhDieuCongTac: {
          daHuy: false,
          ...(loaiTruLenhId ? { id: { not: loaiTruLenhId } } : {}),
        },
      },
      select: {
        ngayDiRieng: true,
        ngayVeRieng: true,
        lenhDieuCongTac: {
          select: { id: true, soHieu: true, diaDiemCongTac: true, ngayDi: true, ngayVe: true },
        },
      },
    });

    return danhSachThamGia
      .map((tv) => ({
        id: tv.lenhDieuCongTac.id,
        soHieu: tv.lenhDieuCongTac.soHieu,
        diaDiemCongTac: tv.lenhDieuCongTac.diaDiemCongTac,
        ngayDi: tv.ngayDiRieng ?? tv.lenhDieuCongTac.ngayDi,
        ngayVe: tv.ngayVeRieng ?? tv.lenhDieuCongTac.ngayVe,
      }))
      .filter((lenh) => lenh.ngayDi <= ngayVe && lenh.ngayVe >= ngayDi);
  }

  async tao(duLieu: TaoNhanVienInput, nguoiThucHienId: string) {
    try {
      const nhanVien = await this.prisma.nhanVien.create({
        data: {
          hoTen: duLieu.hoTen,
          hoTenKhongDau: boDauTiengViet(duLieu.hoTen),
          ngaySinh: duLieu.ngaySinh,
          cccd: duLieu.cccd,
          chucVu: duLieu.chucVu ?? "Nhân viên",
          donViCongTac: duLieu.donViCongTac,
          laTaiXe: duLieu.laTaiXe ?? false,
        },
      });

      await this.nhatKy.ghiNhan({
        nguoiDungId: nguoiThucHienId,
        hanhDong: "TAO_NHAN_VIEN",
        doiTuong: "NhanVien",
        doiTuongId: nhanVien.id,
        giaTriSau: { hoTen: nhanVien.hoTen, cccd: nhanVien.cccd },
      });

      return nhanVien;
    } catch (loi) {
      if (loi instanceof Prisma.PrismaClientKnownRequestError && loi.code === "P2002") {
        throw new ConflictException("Số CCCD/CMND này đã tồn tại trong danh mục");
      }
      throw loi;
    }
  }

  async sua(id: string, duLieu: SuaNhanVienInput, nguoiThucHienId: string) {
    const truoc = await this.chiTiet(id);

    try {
      const sau = await this.prisma.nhanVien.update({
        where: { id },
        data: {
          ...duLieu,
          hoTenKhongDau: duLieu.hoTen ? boDauTiengViet(duLieu.hoTen) : undefined,
        },
      });

      await this.nhatKy.ghiNhan({
        nguoiDungId: nguoiThucHienId,
        hanhDong: "SUA_NHAN_VIEN",
        doiTuong: "NhanVien",
        doiTuongId: id,
        giaTriTruoc: truoc,
        giaTriSau: sau,
      });

      return sau;
    } catch (loi) {
      if (loi instanceof Prisma.PrismaClientKnownRequestError && loi.code === "P2002") {
        throw new ConflictException("Số CCCD/CMND này đã tồn tại trong danh mục");
      }
      throw loi;
    }
  }

  async xoa(id: string, nguoiThucHienId: string) {
    const nhanVien = await this.chiTiet(id);
    await this.prisma.nhanVien.delete({ where: { id } });

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiThucHienId,
      hanhDong: "XOA_NHAN_VIEN",
      doiTuong: "NhanVien",
      doiTuongId: id,
      giaTriTruoc: { hoTen: nhanVien.hoTen, cccd: nhanVien.cccd },
    });
  }

  async xoaNhieu(duLieu: XoaNhieuNhanVienInput, nguoiThucHienId: string) {
    const danhSachXoa = await this.prisma.nhanVien.findMany({
      where: { id: { in: duLieu.ids } },
      select: { id: true, hoTen: true, cccd: true },
    });

    await this.prisma.nhanVien.deleteMany({ where: { id: { in: duLieu.ids } } });

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiThucHienId,
      hanhDong: "XOA_NHIEU_NHAN_VIEN",
      doiTuong: "NhanVien",
      giaTriTruoc: { danhSach: danhSachXoa },
    });

    return { soLuongDaXoa: danhSachXoa.length };
  }
}
