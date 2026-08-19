import { z } from "zod";

export const taoNguoiKySchema = z.object({
  nhanVienId: z.string().trim().min(1, "Vui lòng chọn nhân viên"),
  chucDanhKy: z.string().trim().min(1, "Vui lòng nhập chức danh khi ký"),
  theThucKy: z.string().trim().min(1, "Vui lòng nhập thể thức ký").default("TL. GIÁM ĐỐC"),
  ghiChu: z.string().trim().optional(),
  // Khong cho tao moi voi trang thai DANG_KY_CHINH_THUC - phai dung hanh
  // dong rieng "dat lam nguoi ky chinh thuc" de dam bao tinh duy nhat (xem
  // NguoiKyService.datChinhThuc).
});

export type TaoNguoiKyInput = z.infer<typeof taoNguoiKySchema>;
