import { z } from "zod";

/** Truy van danh sach GDD DOC LAP (khong qua 1 LDCT cu the) - dung cho trang
 * /giay-di-duong. Tim theo ten nguoi duoc cap hoac so hieu GDD/LDCT lien ket. */
export const danhSachGiayDiDuongSchema = z.object({
  trang: z.coerce.number().int().min(1).default(1),
  kichThuoc: z.coerce
    .number()
    .int()
    .refine((n) => [20, 50, 100].includes(n), {
      message: "Kích thước trang phải là 20, 50 hoặc 100",
    })
    .default(20),
  tuKhoa: z.string().trim().optional(),
  // KHONG dung z.coerce.boolean() - Boolean("false") = true trong JS.
  daHuy: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  nam: z.coerce.number().int().min(2000).max(2100).optional(),
  // Khong truyen = mac dinh (nam+soThuTu giam dan, chung tu moi nhat len dau).
  sapXepTheo: z.enum(["soHieu", "nguoiDuocCap", "diaDiem"]).optional(),
  huongSapXep: z.enum(["asc", "desc"]).default("asc"),
});

export type DanhSachGiayDiDuongInput = z.infer<typeof danhSachGiayDiDuongSchema>;
