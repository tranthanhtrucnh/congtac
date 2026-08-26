import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { TrangThaiPhuongTienInput, TanSuatPhuongTienInput } from "@congtac/validation";

/**
 * "Bao cao phuong tien" - trang bao cao TU SINH (khong co bang du lieu rieng,
 * khong CRUD) gom 2 phan doc lap, xem NHAT_KY_QUYET_DINH.md muc "Bao cao
 * phuong tien":
 *   1. Trang thai su dung HIEN TAI - xe nao dang di, tai xe nao, di dau, tu
 *      ngay nao - suy tu Lenh dieu xe (LenhDieuXe) chua huy co khoang
 *      [ngayDi, ngayVe] TRUM len thoi diem goi (dung logic overlap giong
 *      LenhDieuXeService.kiemTraTrungLich()).
 *   2. Thong ke tan suat su dung theo khoang ngay DI tuy chon - so luot di +
 *      tong so ngay su dung cho TUNG xe (ke ca xe chua co luot nao trong ky).
 */
@Injectable()
export class BaoCaoPhuongTienService {
  constructor(private readonly prisma: PrismaService) {}

  /** "Dang di" = co 1 LenhDieuXe chua huy voi ngayDi <= thoiDiem <= ngayVe.
   * Chi xet xe dang HOAT DONG (DANG_SU_DUNG) - xe da NGUNG_SU_DUNG khong the
   * dang duoc dieu di, khong can hien trong bao cao "hien tai" nay. */
  async trangThaiHienTai(truyVan: TrangThaiPhuongTienInput) {
    const thoiDiem = new Date();
    const tuKhoaSach = truyVan.tuKhoa?.trim();

    const where: Prisma.PhuongTienWhereInput = {
      trangThai: "DANG_SU_DUNG",
      ...(tuKhoaSach
        ? {
            OR: [
              { bienSo: { contains: tuKhoaSach, mode: "insensitive" } },
              { nhanHieu: { contains: tuKhoaSach, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [phuongTiens, dangDiDanhSach] = await Promise.all([
      this.prisma.phuongTien.findMany({ where, orderBy: { bienSo: "asc" } }),
      this.prisma.lenhDieuXe.findMany({
        where: {
          daHuy: false,
          phuongTienId: { not: null },
          ngayDi: { lte: thoiDiem },
          ngayVe: { gte: thoiDiem },
        },
        select: {
          id: true,
          soHieu: true,
          laiXeHoTen: true,
          noiDen: true,
          ngayDi: true,
          ngayVe: true,
          phuongTienId: true,
        },
      }),
    ]);

    // Ve ly thuyet 1 xe chi nen co toi da 1 LDX "dang di" tai 1 thoi diem
    // (canh bao trung lich da nhac Van thu luc lap), nhung canh bao do
    // KHONG chan luu - neu thuc te van co >1, Map chi giu ban ghi CUOI CUNG
    // trong danh sach (du de hien thi 1 dong, khong can xu ly phuc tap hon).
    const dangDiTheoXe = new Map(
      dangDiDanhSach.filter((l) => l.phuongTienId).map((l) => [l.phuongTienId as string, l]),
    );

    return phuongTiens.map((xe) => {
      const dangDi = dangDiTheoXe.get(xe.id) ?? null;
      return {
        id: xe.id,
        bienSo: xe.bienSo,
        nhanHieu: xe.nhanHieu,
        loaiXe: xe.loaiXe,
        dangDi: !!dangDi,
        lenhDieuXeDangDi: dangDi
          ? {
              id: dangDi.id,
              soHieu: dangDi.soHieu,
              laiXeHoTen: dangDi.laiXeHoTen,
              noiDen: dangDi.noiDen,
              ngayDi: dangDi.ngayDi,
              ngayVe: dangDi.ngayVe,
            }
          : null,
      };
    });
  }

  /** Tra ve TOAN BO phuong tien (ke ca da NGUNG_SU_DUNG - van co gia tri
   * thong ke lich su, va ke ca chua tung co luot di nao trong ky - de thay
   * ro xe "khong dung toi"), sap xep theo tieu chi da chon. KHONG phan
   * trang - dung CHUNG cho ca xem man hinh/in/xuat Excel (giong cach
   * SoCongLenhService.layTatCaDeXuatExcel() dung chung cho excel+in, o day
   * con dung ca cho man hinh vi ban than da la "lay het" - danh muc phuong
   * tien thuong chi vai chuc xe, khong can phan trang). */
  async thongKeTanSuat(truyVan: TanSuatPhuongTienInput) {
    const { tuNgay, denNgay, sapXepTheo, huongSapXep } = truyVan;

    const [phuongTiens, chuyenDi] = await Promise.all([
      this.prisma.phuongTien.findMany({ orderBy: { bienSo: "asc" } }),
      this.prisma.lenhDieuXe.findMany({
        where: {
          daHuy: false,
          phuongTienId: { not: null },
          ...(tuNgay || denNgay
            ? {
                ngayDi: {
                  ...(tuNgay ? { gte: tuNgay } : {}),
                  ...(denNgay ? { lte: denNgay } : {}),
                },
              }
            : {}),
        },
        select: { phuongTienId: true, ngayDi: true, ngayVe: true },
      }),
    ]);

    const thongKeTheoXe = new Map<string, { luotDi: number; tongNgaySuDung: number }>();
    for (const c of chuyenDi) {
      if (!c.phuongTienId) continue;
      // +1 vi ca ngay di va ngay ve deu tinh la 1 ngay su dung (vd di sang
      // 05, ve sang 05 = 1 ngay, khong phai 0).
      const soNgay = Math.round((c.ngayVe.getTime() - c.ngayDi.getTime()) / 86_400_000) + 1;
      const hienTai = thongKeTheoXe.get(c.phuongTienId) ?? { luotDi: 0, tongNgaySuDung: 0 };
      hienTai.luotDi += 1;
      hienTai.tongNgaySuDung += soNgay;
      thongKeTheoXe.set(c.phuongTienId, hienTai);
    }

    const ketQua = phuongTiens.map((xe) => {
      const tk = thongKeTheoXe.get(xe.id) ?? { luotDi: 0, tongNgaySuDung: 0 };
      return {
        id: xe.id,
        bienSo: xe.bienSo,
        nhanHieu: xe.nhanHieu,
        luotDi: tk.luotDi,
        tongNgaySuDung: tk.tongNgaySuDung,
      };
    });

    const heSo = huongSapXep === "asc" ? 1 : -1;
    ketQua.sort((a, b) => heSo * (a[sapXepTheo] - b[sapXepTheo]));
    return ketQua;
  }

  /** Nguoi ky dang "chinh thuc" tai thoi diem in - dung CHUNG quy uoc voi
   * moi mau in khac trong ung dung (xem so-cong-lenh.service.ts). */
  async layNguoiKyChinhThuc() {
    return this.prisma.nguoiKy.findFirst({
      where: { trangThai: "DANG_KY_CHINH_THUC" },
      include: { nhanVien: { select: { hoTen: true } } },
    });
  }
}
