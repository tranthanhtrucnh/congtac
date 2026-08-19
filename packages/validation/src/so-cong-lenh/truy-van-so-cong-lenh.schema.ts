import { z } from "zod";

/** Truy van cho trang "So cong lenh" (bao cao tu sinh, khong co API sua rieng
 * - xem NHAT_KY_QUYET_DINH.md). Loc theo khoang "Ngay lap" (LenhDieuCongTac.
 * ngayKy) + tu khoa (so LDCT/GDD, ho ten, dia diem, muc dich). Dung chung cho
 * ca 2 endpoint: xem tren man hinh (co phan trang) va xuat Excel (lay het,
 * khong phan trang - xem xuatExcelSoCongLenhSchema ben duoi). */
export const truyVanSoCongLenhSchema = z.object({
  tuNgay: z.coerce.date({ invalid_type_error: "Từ ngày không hợp lệ" }).optional(),
  denNgay: z.coerce.date({ invalid_type_error: "Đến ngày không hợp lệ" }).optional(),
  tuKhoa: z.string().trim().optional(),
});

export type TruyVanSoCongLenhInput = z.infer<typeof truyVanSoCongLenhSchema>;

/** Rieng man hinh xem: co phan trang (Excel dung truyVanSoCongLenhSchema,
 * lay toan bo khong phan trang - xuat het du lieu dang loc). */
export const danhSachSoCongLenhSchema = truyVanSoCongLenhSchema.extend({
  trang: z.coerce.number().int().min(1).default(1),
  kichThuoc: z.coerce
    .number()
    .int()
    .refine((n) => [20, 50, 100].includes(n), {
      message: "Kích thước trang phải là 20, 50 hoặc 100",
    })
    .default(50),
});

export type DanhSachSoCongLenhInput = z.infer<typeof danhSachSoCongLenhSchema>;
