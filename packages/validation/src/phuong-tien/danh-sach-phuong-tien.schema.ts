import { z } from "zod";

export const danhSachPhuongTienSchema = z.object({
  trang: z.coerce.number().int().min(1).default(1),
  kichThuoc: z.coerce
    .number()
    .int()
    .refine((n) => [20, 50, 100].includes(n), {
      message: "Kích thước trang phải là 20, 50 hoặc 100",
    })
    .default(20),
  tuKhoa: z.string().trim().optional(),
  trangThai: z.enum(["DANG_SU_DUNG", "NGUNG_SU_DUNG"]).optional(),
  sapXepTheo: z.enum(["bienSo", "nhanHieu", "loaiXe", "soCho", "trangThai"]).optional(),
  huongSapXep: z.enum(["asc", "desc"]).default("asc"),
});

export type DanhSachPhuongTienInput = z.infer<typeof danhSachPhuongTienSchema>;

export const xoaNhieuPhuongTienSchema = z.object({
  ids: z.array(z.string()).min(1, "Chọn ít nhất 1 phương tiện"),
});

export type XoaNhieuPhuongTienInput = z.infer<typeof xoaNhieuPhuongTienSchema>;
