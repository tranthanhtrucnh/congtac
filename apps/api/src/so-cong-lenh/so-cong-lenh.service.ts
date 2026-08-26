import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { TruyVanSoCongLenhInput, DanhSachSoCongLenhInput } from "@congtac/validation";

/**
 * "So cong lenh" - bao cao tu sinh thay the so ghi tay cua Van thu (xem
 * NHAT_KY_QUYET_DINH.md muc "So cong lenh"). KHONG co bang du lieu rieng -
 * moi dong la 1 GiayDiDuong dang hoat dong (daHuy=false), gop voi LenhDieuCongTac
 * cha va ThanhVienLenhDieuCongTac tuong ung. KHONG co API sua rieng - sua qua
 * form LenhDieuCongTac (truong ghiChu) nhu binh thuong.
 */
@Injectable()
export class SoCongLenhService {
  constructor(private readonly prisma: PrismaService) {}

  private xayDungWhere(truyVan: TruyVanSoCongLenhInput): Prisma.GiayDiDuongWhereInput {
    const { tuNgay, denNgay, tuKhoa } = truyVan;
    const tuKhoaSach = tuKhoa?.trim();
    return {
      daHuy: false,
      lenhDieuCongTac: {
        ...(tuNgay || denNgay
          ? {
              ngayKy: {
                ...(tuNgay ? { gte: tuNgay } : {}),
                ...(denNgay ? { lte: denNgay } : {}),
              },
            }
          : {}),
      },
      ...(tuKhoaSach
        ? {
            OR: [
              { soHieu: { contains: tuKhoaSach, mode: "insensitive" } },
              { lenhDieuCongTac: { soHieu: { contains: tuKhoaSach, mode: "insensitive" } } },
              { lenhDieuCongTac: { diaDiemCongTac: { contains: tuKhoaSach, mode: "insensitive" } } },
              { lenhDieuCongTac: { mucDich: { contains: tuKhoaSach, mode: "insensitive" } } },
              { thanhVien: { hoTen: { contains: tuKhoaSach, mode: "insensitive" } } },
            ],
          }
        : {}),
    };
  }

  private readonly include = {
    lenhDieuCongTac: true,
    thanhVien: true,
  } satisfies Prisma.GiayDiDuongInclude;

  // Gop nhom theo LDCT nhu so tay: sap theo ngay lap + so hieu LDCT (chung tu
  // cung 1 LDCT nam lien nhau), trong 1 LDCT thi theo thu tu thanh vien luc lap.
  private readonly orderBy: Prisma.GiayDiDuongOrderByWithRelationInput[] = [
    { lenhDieuCongTac: { ngayKy: "desc" } },
    { lenhDieuCongTac: { soThuTu: "desc" } },
    { thanhVien: { thuTu: "asc" } },
  ];

  private thanhDong(gdd: {
    id: string;
    soHieu: string;
    lenhDieuCongTacId: string;
    lenhDieuCongTac: {
      soHieu: string;
      ngayKy: Date;
      diaDiemCongTac: string;
      mucDich: string;
      ngayDi: Date;
      ngayVe: Date;
      ghiChu: string | null;
    };
    thanhVien: { hoTen: string; ngayDiRieng: Date | null; ngayVeRieng: Date | null };
  }) {
    return {
      id: gdd.id,
      lenhDieuCongTacId: gdd.lenhDieuCongTacId,
      ngayLap: gdd.lenhDieuCongTac.ngayKy,
      soLdct: gdd.lenhDieuCongTac.soHieu,
      soCongLenh: gdd.soHieu,
      hoTen: gdd.thanhVien.hoTen,
      diaDiem: gdd.lenhDieuCongTac.diaDiemCongTac,
      mucDich: gdd.lenhDieuCongTac.mucDich,
      ngayDi: gdd.thanhVien.ngayDiRieng ?? gdd.lenhDieuCongTac.ngayDi,
      ngayVe: gdd.thanhVien.ngayVeRieng ?? gdd.lenhDieuCongTac.ngayVe,
      ghiChu: gdd.lenhDieuCongTac.ghiChu,
    };
  }

  async danhSach(truyVan: DanhSachSoCongLenhInput) {
    const { trang, kichThuoc } = truyVan;
    const where = this.xayDungWhere(truyVan);
    const [duLieuTho, tong] = await this.prisma.$transaction([
      this.prisma.giayDiDuong.findMany({
        where,
        include: this.include,
        orderBy: this.orderBy,
        skip: (trang - 1) * kichThuoc,
        take: kichThuoc,
      }),
      this.prisma.giayDiDuong.count({ where }),
    ]);
    return { duLieu: duLieuTho.map((gdd) => this.thanhDong(gdd)), tong, trang, kichThuoc };
  }

  /** Lay TOAN BO (khong phan trang) - dung cho xuat Excel VA mau in "So theo
   * doi cong lenh" (ca 2 deu can XUAT DUNG du lieu dang loc tren man hinh,
   * khong bi cat boi phan trang). */
  async layTatCaDeXuatExcel(truyVan: TruyVanSoCongLenhInput) {
    const where = this.xayDungWhere(truyVan);
    const duLieuTho = await this.prisma.giayDiDuong.findMany({
      where,
      include: this.include,
      orderBy: this.orderBy,
    });
    return duLieuTho.map((gdd) => this.thanhDong(gdd));
  }

  /** Nguoi ky dang "chinh thuc" tai thoi diem in mau "So theo doi cong lenh" -
   * dung CHUNG quy uoc voi luc lap LDCT/GDD/LDX (chi 1 nguoi chinh thuc tai 1
   * thoi diem, khong chon rieng cho tung lan in - xem
   * lenh-dieu-cong-tac.service.ts). Tra ve null neu chua thiet lap - controller
   * tu bao loi ro rang cho nguoi dung. */
  async layNguoiKyChinhThuc() {
    return this.prisma.nguoiKy.findFirst({
      where: { trangThai: "DANG_KY_CHINH_THUC" },
      include: { nhanVien: { select: { hoTen: true } } },
    });
  }
}
