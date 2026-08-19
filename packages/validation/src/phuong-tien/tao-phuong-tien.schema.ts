import { z } from "zod";
import { bienSoSchema } from "./chuan-hoa-bien-so";

export const taoPhuongTienSchema = z.object({
  bienSo: bienSoSchema,
  nhanHieu: z.string().trim().min(1, "Vui lòng nhập nhãn hiệu/dòng xe"),
  loaiXe: z.string().trim().optional(),
  soCho: z.coerce.number().int().positive("Số chỗ phải là số dương").optional(),
  ghiChu: z.string().trim().optional(),
  taiXeThuongDungId: z.string().trim().min(1).optional(),
});

export type TaoPhuongTienInput = z.infer<typeof taoPhuongTienSchema>;
