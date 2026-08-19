import { z } from "zod";
import { cccdSchema } from "./tao-nhan-vien.schema";

export const dongXacNhanNhapSchema = z.object({
  hoTen: z.string().trim().min(2, "Thiếu họ tên"),
  ngaySinh: z.coerce.date({ invalid_type_error: "Ngày sinh không hợp lệ" }),
  cccd: cccdSchema,
  chucVu: z
    .string()
    .trim()
    .optional()
    .transform((giaTri) => (giaTri && giaTri.length > 0 ? giaTri : "Nhân viên")),
  donViCongTac: z.string().trim().optional(),
});

export const xacNhanNhapNhanVienSchema = z.object({
  dongDuLieu: z.array(dongXacNhanNhapSchema).min(1, "Không có dòng nào để nhập"),
});

export type XacNhanNhapNhanVienInput = z.infer<typeof xacNhanNhapNhanVienSchema>;
