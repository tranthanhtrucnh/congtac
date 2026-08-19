import { z } from "zod";

export const danhSachDiaDiemSchema = z.object({
  trang: z.coerce.number().int().min(1).default(1),
  kichThuoc: z.coerce
    .number()
    .int()
    .refine((n) => [20, 50, 100].includes(n), {
      message: "Kích thước trang phải là 20, 50 hoặc 100",
    })
    .default(20),
  tuKhoa: z.string().trim().optional(),
  trangThai: z.enum(["DANG_DUNG", "NGUNG_DUNG"]).optional(),
  chiThuongDung: z
    .string()
    .optional()
    .transform((giaTri) => giaTri === "true"),
  sapXepTheo: z.enum(["tenDayDu", "trangThai"]).optional(),
  huongSapXep: z.enum(["asc", "desc"]).default("asc"),
});

export type DanhSachDiaDiemInput = z.infer<typeof danhSachDiaDiemSchema>;

export const xoaNhieuDiaDiemSchema = z.object({
  ids: z.array(z.string()).min(1, "Chọn ít nhất 1 địa điểm"),
});

export type XoaNhieuDiaDiemInput = z.infer<typeof xoaNhieuDiaDiemSchema>;
