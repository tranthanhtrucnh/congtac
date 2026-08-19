import { z } from "zod";

export const dangNhapSchema = z.object({
  tenDangNhap: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
  matKhau: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export type DangNhapInput = z.infer<typeof dangNhapSchema>;
