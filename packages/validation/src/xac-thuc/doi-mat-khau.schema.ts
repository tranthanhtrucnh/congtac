import { z } from "zod";

/**
 * Mat khau toi thieu 8 ky tu, co it nhat 1 chu va 1 so.
 * Ap dung cho doi mat khau lan dau va doi mat khau tu chon sau nay.
 */
const matKhauMoiSchema = z
  .string()
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
  .regex(/[a-zA-Z]/, "Mật khẩu phải có ít nhất 1 chữ cái")
  .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 chữ số");

export const doiMatKhauSchema = z
  .object({
    matKhauHienTai: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    matKhauMoi: matKhauMoiSchema,
    xacNhanMatKhauMoi: z.string().min(1, "Vui lòng nhập lại mật khẩu mới"),
  })
  .refine((du) => du.matKhauMoi === du.xacNhanMatKhauMoi, {
    message: "Mật khẩu mới nhập lại không khớp",
    path: ["xacNhanMatKhauMoi"],
  })
  .refine((du) => du.matKhauHienTai !== du.matKhauMoi, {
    message: "Mật khẩu mới phải khác mật khẩu hiện tại",
    path: ["matKhauMoi"],
  });

export type DoiMatKhauInput = z.infer<typeof doiMatKhauSchema>;
