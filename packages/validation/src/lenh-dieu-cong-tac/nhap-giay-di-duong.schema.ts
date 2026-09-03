import { z } from "zod";

/**
 * "Mẫu in nháp" Công lệnh (kiêm) Giấy đi đường - xem doc comment đầy đủ ở
 * nhap-lenh-dieu-cong-tac.schema.ts (cùng tính năng, 2026-08-26). Số hiệu
 * nhập tay, không lưu CSDL, không cấp số. Truyền qua GET query string (các
 * trường đều phẳng, không cần đóng gói JSON như LDCT). Xem NHAT_KY_QUYET_DINH.md.
 */
export const nhapGiayDiDuongSchema = z
  .object({
    soHieu: z.string().trim().min(1, "Vui lòng nhập số hiệu"),
    ngayKy: z.coerce.date({ invalid_type_error: "Ngày lập không hợp lệ" }),
    hoTen: z.string().trim().min(1, "Vui lòng nhập họ tên"),
    chucVu: z.string().trim().min(1, "Vui lòng nhập chức vụ"),
    noiDi: z.string().trim().min(1, "Vui lòng nhập nơi đi"),
    noiDen: z.string().trim().min(1, "Vui lòng nhập nơi đến"),
    ngayDi: z.coerce.date({ invalid_type_error: "Ngày đi không hợp lệ" }),
    ngayVe: z.coerce.date({ invalid_type_error: "Ngày về không hợp lệ" }),
  })
  .refine((d) => d.ngayVe >= d.ngayDi, {
    message: "Ngày về không được sớm hơn ngày đi",
    path: ["ngayVe"],
  });

export type NhapGiayDiDuongInput = z.infer<typeof nhapGiayDiDuongSchema>;
