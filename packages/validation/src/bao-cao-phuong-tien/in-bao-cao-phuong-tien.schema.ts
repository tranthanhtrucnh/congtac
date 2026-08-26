import { z } from "zod";
import { tanSuatPhuongTienSchema } from "./tan-suat-phuong-tien.schema";

/** In "Bao cao phuong tien" (A4 ngang, gop ca 2 phan Trang thai hien tai +
 * Thong ke tan suat vao 1 ban in) - dung GET + query string (mo qua
 * XemTruocPdfDialog), giong het quy uoc inSoCongLenhSchema. Phan "Trang
 * thai hien tai" trong ban in KHONG co bo loc rieng (luon lay toan bo xe
 * dang hoat dong tai thoi diem in) - CHI phan "Thong ke tan suat" dung bo
 * loc khoang ngay/tieu chi sap xep (ke thua tanSuatPhuongTienSchema). Them
 * nguoiLapSo (Van thu tu go, mac dinh la ten nguoi dang dang nhap) - "Nguoi
 * ky duyet" KHONG chon o day, luon lay Nguoi ky dang "chinh thuc" giong quy
 * uoc chung toan bo ung dung. Xem NHAT_KY_QUYET_DINH.md muc "Bao cao phuong
 * tien". */
export const inBaoCaoPhuongTienSchema = tanSuatPhuongTienSchema.extend({
  nguoiLapSo: z.string().trim().min(1, "Chưa nhập tên người lập báo cáo"),
});

export type InBaoCaoPhuongTienInput = z.infer<typeof inBaoCaoPhuongTienSchema>;
