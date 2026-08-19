import { z } from "zod";

/** Truy van GET cho in nhieu GDD cung luc (nut "In da chon" o trang
 * /giay-di-duong). ids truyen qua query string dang chuoi phan cach dau
 * phay - KHONG dung POST body vi mo tab moi bang window.open() la dieu
 * huong GET don gian, khong gui duoc body. Xem NHAT_KY_QUYET_DINH.md. */
export const inNhieuGiayDiDuongSchema = z.object({
  ids: z
    .string()
    .min(1, "Chưa chọn công lệnh nào")
    .transform((v) =>
      v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    )
    .refine((ds) => ds.length > 0, { message: "Chưa chọn công lệnh nào" }),
});

export type InNhieuGiayDiDuongInput = z.infer<typeof inNhieuGiayDiDuongSchema>;
