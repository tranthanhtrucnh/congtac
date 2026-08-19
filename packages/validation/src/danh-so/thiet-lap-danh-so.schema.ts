import { z } from "zod";

export const thietLapDanhSoSchema = z.object({
  loaiChungTu: z.enum(["LDCT", "GDD", "LDX"]),
  nam: z.coerce
    .number()
    .int()
    .min(2000, "Năm không hợp lệ")
    .max(2100, "Năm không hợp lệ"),
  soBatDau: z.coerce.number().int().positive("Số bắt đầu phải là số dương"),
  // De trong (chuoi rong) = xoa ghi de, quay lai dung mac dinh tu
  // KY_HIEU_LOAI_CHUNG_TU (packages/shared).
  kyHieu: z
    .string()
    .trim()
    .max(20, "Ký hiệu tối đa 20 ký tự")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

export type ThietLapDanhSoInput = z.infer<typeof thietLapDanhSoSchema>;
