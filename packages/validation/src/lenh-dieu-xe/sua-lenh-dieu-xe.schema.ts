import { z } from "zod";

// Sua duoc bat cu luc nao, chi chan khi chung tu da huy (kiem tra o service,
// khong phai o schema) - khong co luong duyet, xem NHAT_KY_QUYET_DINH.md.
// Cho sua ca lai xe/phuong tien - khong han che tuy tien.
export const suaLenhDieuXeSchema = z
  .object({
    laiXeId: z.string().trim().min(1, "Vui lòng chọn lái xe").optional(),
    phuongTienId: z.string().trim().min(1, "Vui lòng chọn biển số xe").optional(),
    noiDi: z.string().trim().min(1, "Nơi đi không được để trống").optional(),
    noiDen: z.string().trim().min(1, "Nơi đến không được để trống").optional(),
    mucDich: z.string().trim().min(1, "Mục đích không được để trống").optional(),
    ngayDi: z.coerce.date({ invalid_type_error: "Ngày đi không hợp lệ" }).optional(),
    ngayVe: z.coerce.date({ invalid_type_error: "Ngày về không hợp lệ" }).optional(),
    ngayKy: z.coerce.date({ invalid_type_error: "Ngày lập không hợp lệ" }).optional(),
  })
  // Chi kiem tra khi CA HAI cung co mat trong payload (form o giao dien luon
  // gui ca 2, nen bat duoc truong hop thuc te) - truong hop chi gui 1 trong 2
  // truong (goi API truc tiep, khong qua form) duoc kiem tra bo sung o
  // service (so sanh voi gia tri dang luu trong DB).
  .refine((duLieu) => !duLieu.ngayDi || !duLieu.ngayVe || duLieu.ngayVe >= duLieu.ngayDi, {
    message: "Ngày về không được sớm hơn ngày đi",
    path: ["ngayVe"],
  });

export type SuaLenhDieuXeInput = z.infer<typeof suaLenhDieuXeSchema>;
