import { z } from "zod";

export const tenDangNhapSchema = z
  .string()
  .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
  .max(32, "Tên đăng nhập tối đa 32 ký tự")
  .regex(
    /^[a-z0-9._-]+$/,
    "Tên đăng nhập chỉ gồm chữ thường không dấu, số, dấu chấm, gạch dưới, gạch ngang",
  );

export const taoNguoiDungSchema = z.object({
  tenDangNhap: tenDangNhapSchema,
  hoTen: z.string().min(2, "Vui lòng nhập họ tên"),
  vaiTroIds: z.array(z.string()).min(1, "Chọn ít nhất 1 vai trò"),
});

export type TaoNguoiDungInput = z.infer<typeof taoNguoiDungSchema>;
