import { z } from "zod";

/** Truy van GET cho in nhieu LDX cung luc (checkbox chon dong + nut "In da
 * chon" o trang /lenh-dieu-xe). ids truyen qua query string dang chuoi phan
 * cach dau phay - KHONG dung POST body vi mo tab moi bang window.open()/
 * XemTruocPdfDialog la dieu huong GET don gian, khong gui duoc body. Giong
 * het pattern da dung cho GDD (in-nhieu-giay-di-duong.schema.ts), nguoi dung
 * yeu cau 2026-08-26, xem NHAT_KY_QUYET_DINH.md. */
export const inNhieuLenhDieuXeSchema = z.object({
  ids: z
    .string()
    .min(1, "Chưa chọn lệnh điều xe nào")
    .transform((v) =>
      v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    )
    .refine((ds) => ds.length > 0, { message: "Chưa chọn lệnh điều xe nào" }),
});

export type InNhieuLenhDieuXeInput = z.infer<typeof inNhieuLenhDieuXeSchema>;
