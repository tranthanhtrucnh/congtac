import { z } from "zod";

/**
 * "Mẫu in nháp" Lệnh điều xe - xem doc comment đầy đủ ở
 * nhap-lenh-dieu-cong-tac.schema.ts (cùng tính năng, 2026-08-26). Số hiệu
 * nhập tay, không lưu CSDL, không cấp số, không gắn với lái xe/phương tiện
 * thật trong Danh mục (gõ tự do). Xem NHAT_KY_QUYET_DINH.md.
 */
export const nhapLenhDieuXeSchema = z
  .object({
    soHieu: z.string().trim().min(1, "Vui lòng nhập số hiệu"),
    ngayKy: z.coerce.date({ invalid_type_error: "Ngày lập không hợp lệ" }),
    laiXeHoTen: z.string().trim().min(1, "Vui lòng nhập họ tên lái xe"),
    bienSo: z.string().trim().min(1, "Vui lòng nhập biển số"),
    nhanHieu: z.string().trim().min(1, "Vui lòng nhập nhãn hiệu xe"),
    noiDi: z.string().trim().min(1, "Vui lòng nhập nơi đi"),
    noiDen: z.string().trim().min(1, "Vui lòng nhập nơi đến"),
    mucDich: z.string().trim().min(1, "Vui lòng nhập mục đích"),
    ngayDi: z.coerce.date({ invalid_type_error: "Ngày đi không hợp lệ" }),
    ngayVe: z.coerce.date({ invalid_type_error: "Ngày về không hợp lệ" }),
  })
  .refine((d) => d.ngayVe >= d.ngayDi, {
    message: "Ngày về không được sớm hơn ngày đi",
    path: ["ngayVe"],
  });

export type NhapLenhDieuXeInput = z.infer<typeof nhapLenhDieuXeSchema>;
