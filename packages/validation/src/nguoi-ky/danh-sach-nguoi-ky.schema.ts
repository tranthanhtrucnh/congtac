import { z } from "zod";

export const danhSachNguoiKySchema = z.object({
  trang: z.coerce.number().int().min(1).default(1),
  kichThuoc: z.coerce
    .number()
    .int()
    .refine((n) => [20, 50, 100].includes(n), {
      message: "Kích thước trang phải là 20, 50 hoặc 100",
    })
    .default(20),
  tuKhoa: z.string().trim().optional(),
  trangThai: z.enum(["DANG_KY_CHINH_THUC", "DU_PHONG", "NGUNG_SU_DUNG"]).optional(),
});

export type DanhSachNguoiKyInput = z.infer<typeof danhSachNguoiKySchema>;
