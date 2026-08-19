import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { THONG_TIN_HANH_DONG } from "@congtac/shared";
import type { TruyVanNhatKyInput, DanhSachNhatKyInput } from "@congtac/validation";

// Uu tien truong nao de tom tat "doi tuong bi tac dong" thanh 1 chuoi de doc
// (thay vi hien nguyen id kho doc) - lay tu chinh JSON giaTriSau/giaTriTruoc
// da luu san, KHONG can join them bang nao. Xem docs/superpowers/specs/
// 2026-08-14-nhat-ky-he-thong-design.md muc 6.
const TRUONG_TOM_TAT_DOI_TUONG: Record<string, string[]> = {
  LenhDieuCongTac: ["soHieu"],
  GiayDiDuong: ["soHieu"],
  LenhDieuXe: ["soHieu"],
  NguoiDung: ["tenDangNhap", "hoTen"],
  DiaDiem: ["tenDayDu"],
  PhuongTien: ["bienSo"],
  NguoiKy: ["hoTen"],
  NhanVien: ["hoTen"],
};

function tomTatDoiTuong(doiTuong: string, giaTriSau: unknown, giaTriTruoc: unknown): string | null {
  const giaTri = (giaTriSau ?? giaTriTruoc) as Record<string, unknown> | null | undefined;
  if (!giaTri || typeof giaTri !== "object") return null;
  for (const truong of TRUONG_TOM_TAT_DOI_TUONG[doiTuong] ?? []) {
    const gt = giaTri[truong];
    if (typeof gt === "string" && gt.trim()) return gt;
  }
  return null;
}

/**
 * "Nhat ky he thong" - CHI XEM (khong Tao/Sua/Xoa qua API, dung ban ghi da co
 * san tu NhatKyService.ghiNhan() goi rai rac khap cac module - xem
 * docs/QUY_TAC_NGHIEP_VU.md muc "Nhat ky he thong": "khong duoc sua/xoa boi
 * nguoi dung thuong; chi Quan tri he thong xem toan bo"). Dat module RIENG
 * (khong trung ten voi common/nhat-ky/nhat-ky.service.ts - noi do la duong
 * GHI, con day la duong DOC/xem, tach biet co chu dich).
 */
@Injectable()
export class NhatKyXemService {
  constructor(private readonly prisma: PrismaService) {}

  // Tra nguoc so hieu chung tu (LDCT/GDD/LDX) -> (doiTuong, doiTuongId) vi
  // NhatKyHeThong.doiTuongId luu id noi bo (cuid), khong phai so hieu - xem
  // spec muc 6.
  private async timNhomTheoSoHieu(tuKhoa: string): Promise<{ doiTuong: string; doiTuongId: { in: string[] } }[]> {
    const dieuKien = { soHieu: { contains: tuKhoa, mode: "insensitive" as const } };
    const [ldct, gdd, ldx] = await Promise.all([
      this.prisma.lenhDieuCongTac.findMany({ where: dieuKien, select: { id: true } }),
      this.prisma.giayDiDuong.findMany({ where: dieuKien, select: { id: true } }),
      this.prisma.lenhDieuXe.findMany({ where: dieuKien, select: { id: true } }),
    ]);
    return [
      { doiTuong: "LenhDieuCongTac", ids: ldct.map((x) => x.id) },
      { doiTuong: "GiayDiDuong", ids: gdd.map((x) => x.id) },
      { doiTuong: "LenhDieuXe", ids: ldx.map((x) => x.id) },
    ]
      .filter((n) => n.ids.length > 0)
      .map((n) => ({ doiTuong: n.doiTuong, doiTuongId: { in: n.ids } }));
  }

  private async xayDungWhere(truyVan: TruyVanNhatKyInput): Promise<Prisma.NhatKyHeThongWhereInput> {
    const { tuNgay, denNgay, nguoiDungId, nhom, tuKhoa } = truyVan;

    const where: Prisma.NhatKyHeThongWhereInput = {
      ...(tuNgay || denNgay
        ? {
            thoiGian: {
              ...(tuNgay ? { gte: tuNgay } : {}),
              ...(denNgay ? { lte: denNgay } : {}),
            },
          }
        : {}),
      ...(nguoiDungId ? { nguoiDungId } : {}),
      ...(nhom
        ? {
            hanhDong: {
              in: Object.entries(THONG_TIN_HANH_DONG)
                .filter(([, thongTin]) => thongTin.nhom === nhom)
                .map(([ma]) => ma),
            },
          }
        : {}),
    };

    if (tuKhoa && tuKhoa.trim()) {
      const nhomTheoSoHieu = await this.timNhomTheoSoHieu(tuKhoa.trim());
      // Khong khop so hieu nao ca - ep where ve khong co ket qua, tranh tra
      // nham toan bo danh sach (im lang bo qua tu khoa) khi nguoi dung go
      // nham/chua co chung tu do.
      where.id = nhomTheoSoHieu.length > 0 ? undefined : "__khong_khop__";
      if (nhomTheoSoHieu.length > 0) {
        where.OR = nhomTheoSoHieu;
      }
    }

    return where;
  }

  private readonly include = {
    nguoiDung: { select: { hoTen: true, tenDangNhap: true } },
  } satisfies Prisma.NhatKyHeThongInclude;

  private thanhDong<
    T extends {
      giaTriSau: unknown;
      giaTriTruoc: unknown;
      doiTuong: string;
      nguoiDung: { hoTen: string; tenDangNhap: string } | null;
    },
  >(dong: T) {
    return {
      ...dong,
      tomTat: tomTatDoiTuong(dong.doiTuong, dong.giaTriSau, dong.giaTriTruoc),
    };
  }

  async danhSach(truyVan: DanhSachNhatKyInput) {
    const { trang, kichThuoc } = truyVan;
    const where = await this.xayDungWhere(truyVan);
    const [duLieuTho, tong] = await this.prisma.$transaction([
      this.prisma.nhatKyHeThong.findMany({
        where,
        include: this.include,
        orderBy: { thoiGian: "desc" },
        skip: (trang - 1) * kichThuoc,
        take: kichThuoc,
      }),
      this.prisma.nhatKyHeThong.count({ where }),
    ]);
    return { duLieu: duLieuTho.map((d) => this.thanhDong(d)), tong, trang, kichThuoc };
  }

  /** Lay TOAN BO (khong phan trang) theo dung bo loc dang ap dung - dung cho
   * xuat Excel, giong pattern cua so-cong-lenh.service.ts. */
  async layTatCaDeXuatExcel(truyVan: TruyVanNhatKyInput) {
    const where = await this.xayDungWhere(truyVan);
    const duLieuTho = await this.prisma.nhatKyHeThong.findMany({
      where,
      include: this.include,
      orderBy: { thoiGian: "desc" },
    });
    return duLieuTho.map((d) => this.thanhDong(d));
  }
}
