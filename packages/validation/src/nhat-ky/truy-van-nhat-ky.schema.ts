import { z } from "zod";
import { TAT_CA_NHOM_HANH_DONG } from "@congtac/shared";

/** Truy van cho trang "/nhat-ky" (chi Quan tri he thong xem duoc - quyen
 * nhat-ky.xem). Loc theo khoang "Thoi gian" + nguoi thuc hien + nhom hanh
 * dong (tag loc, xem NHOM_HANH_DONG o @congtac/shared) + tu khoa theo so
 * hieu chung tu (LDCT/GDD/LDX). Dung chung cho ca xem man hinh (co phan
 * trang) va xuat Excel (lay het, khong phan trang). */
export const truyVanNhatKySchema = z.object({
  tuNgay: z.coerce.date({ invalid_type_error: "Từ ngày không hợp lệ" }).optional(),
  denNgay: z.coerce.date({ invalid_type_error: "Đến ngày không hợp lệ" }).optional(),
  nguoiDungId: z.string().trim().optional(),
  nhom: z.enum(TAT_CA_NHOM_HANH_DONG as [string, ...string[]]).optional(),
  tuKhoa: z.string().trim().optional(),
});

export type TruyVanNhatKyInput = z.infer<typeof truyVanNhatKySchema>;

export const danhSachNhatKySchema = truyVanNhatKySchema.extend({
  trang: z.coerce.number().int().min(1).default(1),
  kichThuoc: z.coerce
    .number()
    .int()
    .refine((n) => [20, 50, 100].includes(n), {
      message: "Kích thước trang phải là 20, 50 hoặc 100",
    })
    .default(50),
});

export type DanhSachNhatKyInput = z.infer<typeof danhSachNhatKySchema>;
