import { z } from "zod";

export const danhSachLenhDieuCongTacSchema = z.object({
  trang: z.coerce.number().int().min(1).default(1),
  kichThuoc: z.coerce
    .number()
    .int()
    .refine((n) => [20, 50, 100].includes(n), {
      message: "Kích thước trang phải là 20, 50 hoặc 100",
    })
    .default(20),
  tuKhoa: z.string().trim().optional(),
  // KHONG dung z.coerce.boolean() - Boolean("false") = true trong JS.
  daHuy: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  nam: z.coerce.number().int().min(2000).max(2100).optional(),
  // Loc theo loai mau in (Tuyen thuong/Tram/Phat hanh-thu hoi ve e) - dung
  // cho cac tag loc o danh sach /lenh-dieu-cong-tac, khong truyen = tat ca.
  loaiMauIn: z.enum(["TUYEN_THUONG", "TRAM", "PHAT_HANH_THU_HOI_VE_E"]).optional(),
  // Loc rieng "to chi co 1 minh tai xe" (xem laLenhTaiXeRieng() o frontend,
  // NHAT_KY_QUYET_DINH.md) - la 1 dac diem TACH BIET voi loaiMauIn (khong
  // phai 1 gia tri cua enum LoaiMauInLenhDieuCongTac, vi 1 lenh Tuyen thuong
  // van co the roi vao truong hop nay), nen dung param rieng, khong nhap vao
  // loaiMauIn. Tag nay o giao dien loai tru voi tag loaiMauIn (chi chon 1
  // trong 2 nhom tai 1 thoi diem), nhung backend van xu ly doc lap.
  chiTaiXeRieng: z
    .enum(["true"])
    .optional()
    .transform((v) => v === "true"),
  // Khong truyen = mac dinh (nam+soThuTu giam dan, chung tu moi nhat len dau).
  // "ngayKy" = "Ngay lap" hien tren giao dien (ngay ban hanh chung tu, khac
  // ngayTao la thoi diem tao ban ghi trong CSDL) - them 2026-08-31, nguoi
  // dung yeu cau them cot nay vao danh sach LDCT.
  sapXepTheo: z.enum(["soHieu", "diaDiemCongTac", "ngayDi", "ngayVe", "ngayKy"]).optional(),
  huongSapXep: z.enum(["asc", "desc"]).default("asc"),
});

export type DanhSachLenhDieuCongTacInput = z.infer<typeof danhSachLenhDieuCongTacSchema>;
