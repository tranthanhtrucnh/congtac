import { z } from "zod";
import { bienSoSchema } from "./chuan-hoa-bien-so";

export const suaPhuongTienSchema = z.object({
  bienSo: bienSoSchema.optional(),
  nhanHieu: z.string().trim().min(1, "Nhãn hiệu/dòng xe không được để trống").optional(),
  loaiXe: z.string().trim().optional(),
  soCho: z.coerce.number().int().positive("Số chỗ phải là số dương").optional(),
  ghiChu: z.string().trim().optional(),
  // null -> bo gan tai xe thuong dung; undefined -> giu nguyen.
  taiXeThuongDungId: z.string().trim().min(1).nullable().optional(),
  trangThai: z.enum(["DANG_SU_DUNG", "NGUNG_SU_DUNG"]).optional(),
});

export type SuaPhuongTienInput = z.infer<typeof suaPhuongTienSchema>;
