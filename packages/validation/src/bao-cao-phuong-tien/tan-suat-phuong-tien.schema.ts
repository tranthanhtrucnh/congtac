import { z } from "zod";

/** 2 tieu chi co the sap xep bang thong ke tan suat - "luotDi" (dem so Lenh
 * dieu xe chua huy co ngay di roi trong khoang loc), "tongNgaySuDung" (cong
 * don ngayVe - ngayDi + 1 cua cac lenh do). Nguoi dung yeu cau ca 2 (khong
 * chon 1), cho phep doi tieu chi sap xep tren man hinh - xem
 * NHAT_KY_QUYET_DINH.md muc "Bao cao phuong tien". */
export const TIEU_CHI_SAP_XEP_TAN_SUAT = ["luotDi", "tongNgaySuDung"] as const;
export type TieuChiSapXepTanSuat = (typeof TIEU_CHI_SAP_XEP_TAN_SUAT)[number];

/** Truy van cho phan "Thong ke tan suat su dung" - loc theo khoang ngay DI
 * (khong phai ngay lap/ngay ky nhu So theo doi cong lenh, vi ban chat la
 * thong ke CHUYEN DI thuc te). Bo trong (khong tuNgay/denNgay) = tinh toan
 * bo lich su, giong quy uoc cua truyVanSoCongLenhSchema. Dung CHUNG cho ca
 * 3 endpoint (xem man hinh/in/xuat Excel) - khong phan trang, tra ve TOAN
 * BO phuong tien (ke ca chua co luot di nao trong ky, de thay ro xe nao
 * "khong dung toi"). */
export const tanSuatPhuongTienSchema = z.object({
  tuNgay: z.coerce.date({ invalid_type_error: "Từ ngày không hợp lệ" }).optional(),
  denNgay: z.coerce.date({ invalid_type_error: "Đến ngày không hợp lệ" }).optional(),
  sapXepTheo: z.enum(TIEU_CHI_SAP_XEP_TAN_SUAT).default("luotDi"),
  huongSapXep: z.enum(["asc", "desc"]).default("desc"),
});

export type TanSuatPhuongTienInput = z.infer<typeof tanSuatPhuongTienSchema>;
