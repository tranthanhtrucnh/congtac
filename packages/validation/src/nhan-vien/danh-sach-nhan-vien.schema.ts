import { z } from "zod";

export const danhSachNhanVienSchema = z.object({
  trang: z.coerce.number().int().min(1).default(1),
  kichThuoc: z.coerce.number().int().refine((n) => [20, 50, 100].includes(n), {
    message: "Kích thước trang phải là 20, 50 hoặc 100",
  }).default(20),
  tuKhoa: z.string().trim().optional(),
  trangThai: z.enum(["DANG_LAM_VIEC", "NGUNG_LAM_VIEC"]).optional(),
  // "true"/"false" tu query string qua z.coerce.boolean se coi moi chuoi
  // khac rong la true - nen tu xu ly rieng thay vi dung coerce.boolean().
  chiTaiXe: z
    .string()
    .optional()
    .transform((giaTri) => giaTri === "true"),
  sapXepTheo: z.enum(["hoTen", "ngaySinh", "cccd", "chucVu", "trangThai"]).optional(),
  huongSapXep: z.enum(["asc", "desc"]).default("asc"),
});

export type DanhSachNhanVienInput = z.infer<typeof danhSachNhanVienSchema>;

export const xoaNhieuNhanVienSchema = z.object({
  ids: z.array(z.string()).min(1, "Chọn ít nhất 1 nhân viên"),
});

export type XoaNhieuNhanVienInput = z.infer<typeof xoaNhieuNhanVienSchema>;
