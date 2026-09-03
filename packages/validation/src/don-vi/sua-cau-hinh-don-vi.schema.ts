import { z } from "zod";

// Gioi han do dai theo kha nang hien thi tren mau in A5 (cot header ~57-62mm,
// font 9pt) - tranh nguoi dung nhap chuoi qua dai lam vo layout mau in da
// duoc can chinh ky (xem lenh-dieu-xe-mau-in.ts, NHAT_KY_QUYET_DINH.md).
const chuoiBatBuoc = (nhan: string, doDaiToiDa: number) =>
  z
    .string()
    .trim()
    .min(1, `${nhan} không được để trống`)
    .max(doDaiToiDa, `${nhan} tối đa ${doDaiToiDa} ký tự`);

// Gioi han ~2MB anh goc, tinh ra do dai chuoi base64 (he so ~1.37 do encode
// base64 + 1 chut du cho phan dau "data:image/...;base64,") - tranh anh qua
// nang lam phinh CSDL/ban sao luu. Nguoi dung yeu cau 2026-08-17, xem
// NHAT_KY_QUYET_DINH.md.
const DUNG_LUONG_LOGO_TOI_DA_KY_TU = 2_900_000;

export const suaCauHinhDonViSchema = z.object({
  donViChuQuan: chuoiBatBuoc("Cơ quan chủ quản", 80),
  tenCoQuanDong1: chuoiBatBuoc("Tên cơ quan (dòng 1)", 80),
  tenCoQuanDong2: chuoiBatBuoc("Tên cơ quan (dòng 2)", 80),
  tenNgan: chuoiBatBuoc("Tên rút gọn", 40),
  diaDanh: chuoiBatBuoc("Địa danh", 40),
  // Cac dong "Can cu ...;" rieng cho mau in LDCT Tram TP.HCM - khong bat
  // buoc, moi dong 1 can cu (xem canCuHtml trong lenh-dieu-cong-tac-mau-in.ts).
  canCuMauTram: z
    .string()
    .trim()
    .max(2000, "Căn cứ mẫu Trạm tối đa 2000 ký tự")
    .optional()
    .or(z.literal("")),
  // Muc dich mac dinh GOI Y rieng cho mau in LDCT "Phat hanh, thu hoi ve e" -
  // khong bat buoc, dialog Tao dung de dien san khi chon loai nay (xem
  // lenh-dieu-cong-tac-mau-in.ts, tao-lenh-dieu-cong-tac-dialog.tsx).
  mucDichMacDinhVeE: z
    .string()
    .trim()
    .max(300, "Mục đích mặc định tối đa 300 ký tự")
    .optional()
    .or(z.literal("")),
  // Logo watermark - data URL base64 ("data:image/png;base64,...") hoac
  // chuoi rong/undefined = giu nguyen/xoa de dung anh mac dinh cua he thong
  // (xem doc comment CauHinhDonVi.logoBase64 trong schema.prisma). Kiem tra
  // dung dinh dang data URL anh (khong nhan chuoi tuy y) de tranh du lieu
  // rac vao CSDL.
  logoBase64: z
    .string()
    .trim()
    .max(DUNG_LUONG_LOGO_TOI_DA_KY_TU, "Ảnh logo quá lớn (tối đa khoảng 2MB), vui lòng chọn ảnh nhỏ hơn")
    .regex(/^data:image\/(png|jpeg|jpg|webp);base64,/, "Tệp phải là ảnh (PNG/JPEG/WEBP)")
    .optional()
    .or(z.literal("")),
  // Phan tram (khong phai thap phan CSS opacity 0-1) - de nguoi dung nhap
  // de hieu hon, quy doi luc dung mau in (xem trangMoHinh()).
  logoOpacityPhanTram: z
    .number()
    .int("Độ mờ phải là số nguyên")
    .min(0, "Độ mờ tối thiểu 0%")
    .max(100, "Độ mờ tối đa 100%"),
  // Canh vuong (mm) - gioi han hop ly de tranh nhap sai lam logo qua nho
  // (khong thay) hoac qua to (tran het trang, che noi dung).
  logoKichThuocMm: z
    .number()
    .int("Kích thước phải là số nguyên")
    .min(20, "Kích thước tối thiểu 20mm")
    .max(250, "Kích thước tối đa 250mm"),
  // Danh sach goi y nhap nhanh "Noi den" cho LDCT loai "Phat hanh, thu hoi
  // ve e" - xem doc comment CauHinhDonVi.chuoiDiaDiemThuongDungVeE trong
  // schema.prisma. max 50 muc (du dung, tranh danh sach phinh to qua muc
  // can thiet o 1 dropdown chon nhanh).
  chuoiDiaDiemThuongDungVeE: z
    .array(
      z.object({
        nhan: chuoiBatBuoc("Nhãn", 80),
        noiDung: chuoiBatBuoc("Nội dung", 500),
      }),
    )
    .max(50, "Tối đa 50 chuỗi địa điểm thường dùng")
    .optional()
    .default([]),
  // Phong chu dung cho THAN NOI DUNG moi mau in PDF (LDX/LDCT/GDD/So theo
  // doi/Bao cao phuong tien) - xem doc comment day du o
  // CauHinhDonVi.phongChuMauIn (schema.prisma) va MA_PHONG_CHU_MAU_IN trong
  // apps/api/src/common/mau-in/mau-in-dung-chung.ts (danh sach ma phai khop
  // CHINH XAC voi enum nay - khong dung chung 1 hang so qua package rieng vi
  // packages/validation khong phu thuoc nguoc lai apps/api). .optional() vi
  // cot co @default o Prisma - khong gui truong nay (vd form cu chua co
  // truong) thi Prisma update() bo qua, giu nguyen gia tri dang co. Nguoi
  // dung yeu cau 2026-08-28, xem NHAT_KY_QUYET_DINH.md.
  phongChuMauIn: z.enum(["BE_VIETNAM_PRO", "ROBOTO", "ROBOTO_CONDENSED", "TIMES_NEW_ROMAN"]).optional(),
  // Ty le x-height dung cho CSS `font-size-adjust` tren than mau in - bu
  // chenh lech cach hien "to/nho" giua cac phong chu (xem giai thich day du
  // + so lieu do dac thuc te o TY_LE_X_HEIGHT_CHUAN_MAU_IN,
  // apps/api/src/common/mau-in/mau-in-dung-chung.ts). Khoang 0.3-0.8 khop
  // voi moi font Latin thong thuong - ngoai khoang gan nhu chac chan la nhap
  // nham. Nguoi dung yeu cau 2026-08-28 (dua hang so co dinh thanh cau hinh
  // sua duoc qua giao dien), xem NHAT_KY_QUYET_DINH.md.
  tyLeXHeightMauIn: z
    .number()
    .min(0.3, "Tối thiểu 0.3")
    .max(0.8, "Tối đa 0.8")
    .optional(),
});

export type SuaCauHinhDonViInput = z.infer<typeof suaCauHinhDonViSchema>;
