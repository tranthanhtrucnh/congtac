import { z } from "zod";

export const suaNguoiKySchema = z.object({
  chucDanhKy: z.string().trim().min(1, "Chức danh khi ký không được để trống").optional(),
  theThucKy: z.string().trim().min(1, "Thể thức ký không được để trống").optional(),
  ghiChu: z.string().trim().optional(),
  // Chi cho chuyen ve DU_PHONG/NGUNG_SU_DUNG qua duong sua thuong. Chuyen
  // sang DANG_KY_CHINH_THUC bat buoc di qua API rieng /nguoi-ky/:id/dat-chinh-thuc
  // (co transaction dam bao chi 1 nguoi dang chinh thuc).
  trangThai: z.enum(["DU_PHONG", "NGUNG_SU_DUNG"]).optional(),
});

export type SuaNguoiKyInput = z.infer<typeof suaNguoiKySchema>;
