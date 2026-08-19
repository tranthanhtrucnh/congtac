import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Ban khong dau, chu thuong cua 1 chuoi - ban song sinh phia frontend cua
 * apps/api/src/common/utils/bo-dau.util.ts, dung de loc/tim kiem gan dung
 * ngay trong trinh duyet (vd Combobox chon Can bo) ma khong can goi API.
 */
export function boDauTiengViet(chuoi: string): string {
  return chuoi
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export type LoaiMauInLdct = "TUYEN_THUONG" | "TRAM" | "PHAT_HANH_THU_HOI_VE_E";

/**
 * Mau chu DUNG CHUNG cho ca 3 danh sach Lenh dieu cong tac/Cong lenh-Giay di
 * duong/Lenh dieu xe theo loai mau in cua LDCT lien quan (LDCT: loaiMauIn
 * cua chinh no; GDD/LDX: loaiMauIn cua LDCT CHA sinh ra no, null neu LDX doc
 * lap khong qua LDCT nao) - ap dung cho toan bo cac cot chinh cua 1 ban ghi
 * (so hieu, dia diem, ngay...), khong chi rieng 1 cot, de nguoi dung quet
 * mat nhanh biet ngay 1 dong thuoc loai nao xuyen suot ca 3 man hinh, khong
 * chi trong danh sach LDCT. TUYEN_THUONG (mac dinh, pho bien nhat) VA
 * null/undefined (LDX doc lap) GIU MAU TRUNG TINH (chuoi rong, noi goi tu
 * fallback ve mau mac dinh cua tung cot) de khong canh tranh voi mau xanh
 * duong chu dao cua giao dien - chi TRAM/VE_E (2 loai it gap hon) moi to
 * mau, dung 2 mau amber/violet da gan voi nen hang + nhan/icon cua tung loai
 * o danh sach LDCT, giu nhat quan "1 loai = 1 mau" xuyen suot du an. Nguoi
 * dung yeu cau 2026-08-13, xem NHAT_KY_QUYET_DINH.md. */
export function mauChuTheoLoaiMauIn(loaiMauIn: LoaiMauInLdct | null | undefined): string {
  if (loaiMauIn === "TRAM") return "text-amber-700 dark:text-amber-400";
  if (loaiMauIn === "PHAT_HANH_THU_HOI_VE_E") return "text-violet-700 dark:text-violet-400";
  return "";
}

/**
 * Phan SO (truoc dau "/") cua soHieu day du (vd "05/LĐCT" -> "05") - dung
 * de hien thi GON trong cot "Số hiệu" cua ca 3 danh sach (LDCT/GDD/LDX),
 * nhuong khong gian ngang cho cac cot khac. KHONG dung cho mau in/PDF/xuat
 * Excel - nhung noi do van phai hien FULL soHieu (co ky hieu) dung chuan
 * NĐ30, chi ap dung cho bang danh sach xem nhanh tren giao dien. Neu soHieu
 * khong co dau "/" (truong hop la, khong dung dinh dang mong doi) tra ve
 * nguyen ban khong cat. Nguoi dung yeu cau 2026-08-17, xem NHAT_KY_QUYET_DINH.md. */
export function soHieuChiSo(soHieu: string): string {
  const viTriGach = soHieu.indexOf("/");
  return viTriGach === -1 ? soHieu : soHieu.slice(0, viTriGach);
}
