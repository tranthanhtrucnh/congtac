import { z } from "zod";
import { cccdSchema } from "./tao-nhan-vien.schema";

export const suaNhanVienSchema = z.object({
  hoTen: z.string().trim().min(2, "Vui lòng nhập họ tên").optional(),
  ngaySinh: z.coerce.date({ invalid_type_error: "Ngày sinh không hợp lệ" }).optional(),
  cccd: cccdSchema.optional(),
  chucVu: z.string().trim().min(1, "Chức vụ không được để trống").optional(),
  donViCongTac: z.string().trim().optional(),
  laTaiXe: z.boolean().optional(),
  trangThai: z.enum(["DANG_LAM_VIEC", "NGUNG_LAM_VIEC"]).optional(),
});

export type SuaNhanVienInput = z.infer<typeof suaNhanVienSchema>;
