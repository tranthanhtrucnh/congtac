import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { TrangThaiPhuongTienInput, TanSuatPhuongTienInput, TanSuatTaiXeInput } from "@congtac/validation";

/** Tra ve "hom nay" theo gio Viet Nam, quy ve 00:00:00 UTC cung ngay - DUNG
 * QUY UOC voi cach cac truong "chi ngay" (ngayDi, ngayVe, ...) duoc luu: form
 * <input type="date"> gui chuoi "YYYY-MM-DD", `new Date(chuoi)` parse thanh
 * 00:00:00 UTC. Neu dung thang `new Date()` (thoi diem thuc) de so sanh voi
 * cac gia tri "chi ngay" nay se sai lech theo gio (xem giai thich chi tiet o
 * cho goi ham). KHONG dung thu vien timezone rieng (du an chua co dayjs/
 * date-fns) - `Intl.DateTimeFormat` voi timeZone co san trong Node du de lay
 * dung ngay-thang-nam theo gio VN bat ke server chay o timezone nao. */
export function ngayHomNayTheoGioVietNam(): Date {
  const ngayVN = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date()); // dang "YYYY-MM-DD"
  return new Date(ngayVN);
}

/**
 * "Bao cao phuong tien" - trang bao cao TU SINH (khong co bang du lieu rieng,
 * khong CRUD) gom 3 phan doc lap, xem NHAT_KY_QUYET_DINH.md muc "Bao cao
 * phuong tien":
 *   1. Trang thai su dung HIEN TAI - xe nao dang di, tai xe nao, di dau, tu
 *      ngay nao - suy tu Lenh dieu xe (LenhDieuXe) chua huy co khoang
 *      [ngayDi, ngayVe] TRUM len thoi diem goi (dung logic overlap giong
 *      LenhDieuXeService.kiemTraTrungLich()).
 *   2. Thong ke tan suat su dung PHUONG TIEN theo khoang ngay DI tuy chon -
 *      so luot di + tong so ngay su dung cho TUNG xe (ke ca xe chua co luot
 *      nao trong ky).
 *   3. Thong ke tan suat CONG TAC cua TAI XE - cung y nghia nhu (2) nhung
 *      dem theo NhanVien.laiXeId thay vi phuongTienId (them
 *      2026-08-27, xem thongKeTanSuatTaiXe()).
 */
@Injectable()
export class BaoCaoPhuongTienService {
  constructor(private readonly prisma: PrismaService) {}

  /** "Dang di" = co 1 LenhDieuXe chua huy voi ngayDi <= thoiDiem <= ngayVe.
   * Chi xet xe dang HOAT DONG (DANG_SU_DUNG) - xe da NGUNG_SU_DUNG khong the
   * dang duoc dieu di, khong can hien trong bao cao "hien tai" nay. */
  async trangThaiHienTai(truyVan: TrangThaiPhuongTienInput) {
    // QUAN TRONG: ngayDi/ngayVe la truong "chi ngay" - form nhap <input
    // type="date"> tao chuoi "YYYY-MM-DD" roi `new Date(chuoi)` parse thanh
    // 00:00:00 UTC cua ngay do (quy uoc co dinh cua JS voi chuoi ngay khong
    // co gio). Neu dung `new Date()` (thoi diem thuc, vd 15:00 gio VN =
    // 08:00 UTC) de so sanh truc tiep, thi tu ~7h sang gio VN moi ngay tro
    // di, dieu kien `ngayVe >= thoiDiem` da SAI cho chinh ngay ve (00:00 UTC
    // cua ngay do da nho hon 08:00 UTC), khien xe bi bao "dang ranh" ngay
    // trong luc van dang di. Fix: quy doi "hien tai" ve cung quy uoc "chi
    // ngay, 00:00 UTC" nhu du lieu luu, dua tren ngay theo gio Viet Nam (khong
    // phai gio UTC/gio may chu) - luc do so sanh <=/>= tro thanh so sanh
    // NGAY LICH, dung y nghia "hom nay nam trong khoang ngay di - ngay ve".
    const thoiDiem = ngayHomNayTheoGioVietNam();
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

  /** Tra ve phuong tien DANG SU DUNG (khong tinh xe da NGUNG_SU_DUNG - nguoi
   * dung yeu cau 2026-08-28: xe ngung su dung khong nen dua vao bao cao thong
   * ke, xem NHAT_KY_QUYET_DINH.md muc "Bao cao phuong tien - loai xe ngung su
   * dung khoi thong ke tan suat". TRUOC DAY (2026-08-26) lay TOAN BO xe ke ca
   * da ngung su dung "de giu gia tri lich su" - nguoi dung sau khi dung thu
   * thay khong phu hop, doi lai chi con xe dang hoat dong, dong nhat voi
   * Phan I (trang thai hien tai) cung chi xet xe DANG_SU_DUNG), van tinh ca
   * xe DANG SU DUNG nhung chua tung co luot di nao trong ky (de thay ro xe
   * "khong dung toi"). Sap xep theo tieu chi da chon. KHONG phan trang - dung
   * CHUNG cho ca xem man hinh/in/xuat Excel (giong cach
   * SoCongLenhService.layTatCaDeXuatExcel() dung chung cho excel+in, o day
   * con dung ca cho man hinh vi ban than da la "lay het" - danh muc phuong
   * tien thuong chi vai chuc xe, khong can phan trang). */
  async thongKeTanSuat(truyVan: TanSuatPhuongTienInput) {
    const { tuNgay, denNgay, sapXepTheo, huongSapXep } = truyVan;

    const [phuongTiens, chuyenDi] = await Promise.all([
      this.prisma.phuongTien.findMany({ where: { trangThai: "DANG_SU_DUNG" }, orderBy: { bienSo: "asc" } }),
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

  /** Tra ve TOAN BO nhan vien co laTaiXe=true (ke ca da NGHI VIEC - van co
   * gia tri thong ke lich su, va ke ca chua tung duoc dieu di lan nao trong
   * ky - de thay ro tai xe "khong duoc dieu di"), sap xep theo tieu chi da
   * chon. Cung cau truc/y nghia voi thongKeTanSuat() o tren, chi khac doi
   * tuong dem: gom theo LenhDieuXe.laiXeId (khoa ngoai toi NhanVien, KHONG
   * dung laiXeHoTen vi do la chuoi "chup lai luc tao" - co the trung ten
   * nhung khac nguoi, hoac sai lech chinh ta giua cac lan nhap) thay vi
   * phuongTienId. Lenh co laiXeId = null (tai xe da bi xoa khoi Danh muc
   * Nhan vien sau khi lap lenh) khong tinh cho ai - chap nhan gioi han nay,
   * giong cach phuongTienId null cung bi bo qua o thongKeTanSuat(). */
  async thongKeTanSuatTaiXe(truyVan: TanSuatTaiXeInput) {
    const { tuNgay, denNgay, sapXepTheo, huongSapXep } = truyVan;

    const [taiXes, chuyenDi] = await Promise.all([
      this.prisma.nhanVien.findMany({ where: { laTaiXe: true }, orderBy: { hoTen: "asc" } }),
      this.prisma.lenhDieuXe.findMany({
        where: {
          daHuy: false,
          laiXeId: { not: null },
          ...(tuNgay || denNgay
            ? {
                ngayDi: {
                  ...(tuNgay ? { gte: tuNgay } : {}),
                  ...(denNgay ? { lte: denNgay } : {}),
                },
              }
            : {}),
        },
        select: { laiXeId: true, ngayDi: true, ngayVe: true },
      }),
    ]);

    const thongKeTheoTaiXe = new Map<string, { luotDi: number; tongNgaySuDung: number }>();
    for (const c of chuyenDi) {
      if (!c.laiXeId) continue;
      // +1 vi ca ngay di va ngay ve deu tinh la 1 ngay cong tac (giong quy
      // uoc o thongKeTanSuat() cho phuong tien).
      const soNgay = Math.round((c.ngayVe.getTime() - c.ngayDi.getTime()) / 86_400_000) + 1;
      const hienTai = thongKeTheoTaiXe.get(c.laiXeId) ?? { luotDi: 0, tongNgaySuDung: 0 };
      hienTai.luotDi += 1;
      hienTai.tongNgaySuDung += soNgay;
      thongKeTheoTaiXe.set(c.laiXeId, hienTai);
    }

    const ketQua = taiXes.map((nv) => {
      const tk = thongKeTheoTaiXe.get(nv.id) ?? { luotDi: 0, tongNgaySuDung: 0 };
      return {
        id: nv.id,
        hoTen: nv.hoTen,
        chucVu: nv.chucVu,
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
