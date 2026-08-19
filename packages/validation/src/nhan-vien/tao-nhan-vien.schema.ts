import { z } from "zod";

export const cccdSchema = z
  .string()
  .trim()
  .regex(/^\d{9}$|^\d{12}$/, "CCCD/CMND phải gồm 9 hoặc 12 chữ số");

export const taoNhanVienSchema = z.object({
  hoTen: z.string().trim().min(2, "Vui lòng nhập họ tên"),
  ngaySinh: z.coerce.date({ invalid_type_error: "Ngày sinh không hợp lệ" }),
  cccd: cccdSchema,
  // Trong khi de trong -> tu gan "Nhan vien" theo dung QUY_TAC_NGHIEP_VU.md.
  chucVu: z
    .string()
    .trim()
    .optional()
    .transform((giaTri) => (giaTri && giaTri.length > 0 ? giaTri : "Nhân viên")),
  donViCongTac: z.string().trim().optional(),
  laTaiXe: z.boolean().optional().default(false),
});

export type TaoNhanVienInput = z.infer<typeof taoNhanVienSchema>;
