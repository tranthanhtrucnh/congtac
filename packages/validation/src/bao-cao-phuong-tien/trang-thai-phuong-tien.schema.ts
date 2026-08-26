import { z } from "zod";

/** Truy van cho phan "Trang thai su dung hien tai" cua trang Bao cao phuong
 * tien - luon tinh tuc thoi tai thoi diem goi (khong phan trang, danh sach
 * toan bo xe DANG_SU_DUNG - so luong nho, xem het 1 luot cho de nam tinh
 * hinh). tuKhoa CHI dung cho man hinh xem (tim nhanh bien so/nhan hieu),
 * KHONG dung cho ban in/xuat Excel (ca 2 luon lay TOAN BO xe dang hoat dong,
 * giong tinh than "bao cao day du" cua Sổ theo dõi công lệnh). Xem
 * NHAT_KY_QUYET_DINH.md muc "Bao cao phuong tien".
 */
export const trangThaiPhuongTienSchema = z.object({
  tuKhoa: z.string().trim().optional(),
});

export type TrangThaiPhuongTienInput = z.infer<typeof trangThaiPhuongTienSchema>;
