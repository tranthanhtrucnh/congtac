import { z } from "zod";

/** Truy van GET cho in nhieu LDCT cung luc (checkbox chon dong + nut "In da
 * chon" o trang /lenh-dieu-cong-tac). ids truyen qua query string dang chuoi
 * phan cach dau phay - KHONG dung POST body vi mo tab moi bang
 * XemTruocPdfDialog la dieu huong GET don gian, khong gui duoc body. Giong
 * het pattern da dung cho GDD/LDX (in-nhieu-giay-di-duong.schema.ts,
 * in-nhieu-lenh-dieu-xe.schema.ts), nguoi dung yeu cau 2026-08-28, xem
 * NHAT_KY_QUYET_DINH.md. */
export const inNhieuLenhDieuCongTacSchema = z.object({
  ids: z
    .string()
    .min(1, "Chưa chọn lệnh điều công tác nào")
    .transform((v) =>
      v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    )
    .refine((ds) => ds.length > 0, { message: "Chưa chọn lệnh điều công tác nào" }),
});

export type InNhieuLenhDieuCongTacInput = z.infer<typeof inNhieuLenhDieuCongTacSchema>;
