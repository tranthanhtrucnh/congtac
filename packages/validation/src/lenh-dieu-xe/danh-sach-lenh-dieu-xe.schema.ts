import { z } from "zod";

export const danhSachLenhDieuXeSchema = z.object({
  trang: z.coerce.number().int().min(1).default(1),
  kichThuoc: z.coerce
    .number()
    .int()
    .refine((n) => [20, 50, 100].includes(n), {
      message: "Kích thước trang phải là 20, 50 hoặc 100",
    })
    .default(20),
  tuKhoa: z.string().trim().optional(),
  // Khong truyen = xem tat ca (ca da huy lan chua huy). true/false de loc rieng.
  // KHONG dung z.coerce.boolean() - Boolean("false") = true trong JS, se
  // hieu sai chuoi query "false" thanh true.
  daHuy: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  nam: z.coerce.number().int().min(2000).max(2100).optional(),
  // Khong truyen = mac dinh (nam+soThuTu giam dan, chung tu moi nhat len dau).
  sapXepTheo: z.enum(["soHieu", "laiXe", "bienSo", "ngayDi", "ngayVe"]).optional(),
  huongSapXep: z.enum(["asc", "desc"]).default("asc"),
});

export type DanhSachLenhDieuXeInput = z.infer<typeof danhSachLenhDieuXeSchema>;
