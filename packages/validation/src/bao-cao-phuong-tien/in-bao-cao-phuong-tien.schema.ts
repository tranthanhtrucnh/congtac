import { z } from "zod";
import { tanSuatPhuongTienSchema, TIEU_CHI_SAP_XEP_TAN_SUAT } from "./tan-suat-phuong-tien.schema";

/** In "Bao cao phuong tien" (A4 ngang, gop ca 3 phan Trang thai hien tai +
 * Thong ke tan suat phuong tien + Thong ke tan suat tai xe vao 1 ban in) -
 * dung GET + query string (mo qua XemTruocPdfDialog), giong het quy uoc
 * inSoCongLenhSchema. Phan "Trang thai hien tai" trong ban in KHONG co bo
 * loc rieng (luon lay toan bo xe dang hoat dong tai thoi diem in) - 2 phan
 * "Thong ke tan suat" (phuong tien + tai xe) DUNG CHUNG 1 khoang ngay
 * tuNgay/denNgay (ke thua tanSuatPhuongTienSchema - cung dai dien 1 khoang
 * thoi gian bao cao) nhung MOI phan co tieu chi/huong sap xep RIENG
 * (sapXepTheo/huongSapXep cho phuong tien, sapXepTheoTaiXe/huongSapXepTaiXe
 * cho tai xe) vi 2 bang doc lap, nguoi dung co the muon sap xep khac nhau.
 * Them nguoiLapSo (Van thu tu go, mac dinh la ten nguoi dang dang nhap) -
 * "Nguoi ky duyet" KHONG chon o day, luon lay Nguoi ky dang "chinh thuc"
 * giong quy uoc chung toan bo ung dung. Xem NHAT_KY_QUYET_DINH.md muc "Bao
 * cao phuong tien". */
export const inBaoCaoPhuongTienSchema = tanSuatPhuongTienSchema.extend({
  nguoiLapSo: z.string().trim().min(1, "Chưa nhập tên người lập báo cáo"),
  sapXepTheoTaiXe: z.enum(TIEU_CHI_SAP_XEP_TAN_SUAT).default("luotDi"),
  huongSapXepTaiXe: z.enum(["asc", "desc"]).default("desc"),
});

export type InBaoCaoPhuongTienInput = z.infer<typeof inBaoCaoPhuongTienSchema>;
