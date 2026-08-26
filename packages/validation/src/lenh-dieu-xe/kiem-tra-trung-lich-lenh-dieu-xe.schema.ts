import { z } from "zod";

/**
 * Query cho GET /lenh-dieu-xe/trung-lich - kiem tra tai xe va/hoac phuong
 * tien co dang gan voi 1 LenhDieuXe KHAC (chua huy) co khoang ngay giao nhau
 * voi [ngayDi, ngayVe] truyen vao khong. Cho phep chi truyen 1 trong 2
 * (laiXeId/phuongTienId) - vd form chi vua chon xong lai xe, chua chon bien
 * so - van kiem tra duoc rieng phan da chon.
 * loaiTruId: id LenhDieuXe dang thao tac (form Sua) - loai tru chinh no.
 */
export const kiemTraTrungLichLenhDieuXeSchema = z
  .object({
    laiXeId: z.string().trim().optional(),
    phuongTienId: z.string().trim().optional(),
    ngayDi: z.coerce.date({ invalid_type_error: "Ngày đi không hợp lệ" }),
    ngayVe: z.coerce.date({ invalid_type_error: "Ngày về không hợp lệ" }),
    loaiTruId: z.string().trim().optional(),
  })
  .refine((d) => !!d.laiXeId || !!d.phuongTienId, {
    message: "Cần truyền ít nhất laiXeId hoặc phuongTienId để kiểm tra",
    path: ["laiXeId"],
  })
  .refine((d) => d.ngayVe >= d.ngayDi, {
    message: "Ngày về không được sớm hơn ngày đi",
    path: ["ngayVe"],
  });

export type KiemTraTrungLichLenhDieuXeInput = z.infer<typeof kiemTraTrungLichLenhDieuXeSchema>;
