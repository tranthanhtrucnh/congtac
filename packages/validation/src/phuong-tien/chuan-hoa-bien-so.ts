import { z } from "zod";

/**
 * Chuan hoa bien so xe: viet hoa, bo khoang trang va cac ky tu phan cach
 * (-, ., v.v.) - dung lam gia tri kiem tra trung va tim kiem, khong phu
 * thuoc cach nguoi dung go (co dau cham/gach ngang hay khong). Dung chung
 * ca frontend (xem truoc) va backend (luu cot bienSoChuan).
 */
export function chuanHoaBienSo(bienSo: string): string {
  return bienSo.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export const bienSoSchema = z
  .string()
  .trim()
  .min(1, "Vui lòng nhập biển số")
  .refine((giaTri) => chuanHoaBienSo(giaTri).length >= 6, {
    message: "Biển số không hợp lệ",
  });
