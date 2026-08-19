import { z } from "zod";

export const taoLenhDieuXeSchema = z
  .object({
    laiXeId: z.string().trim().min(1, "Vui lòng chọn lái xe"),
    phuongTienId: z.string().trim().min(1, "Vui lòng chọn biển số xe"),
    noiDi: z.string().trim().min(1, "Vui lòng nhập nơi đi"),
    noiDen: z.string().trim().min(1, "Vui lòng nhập nơi đến"),
    mucDich: z.string().trim().min(1, "Vui lòng nhập mục đích"),
    ngayDi: z.coerce.date({ invalid_type_error: "Ngày đi không hợp lệ" }),
    ngayVe: z.coerce.date({ invalid_type_error: "Ngày về không hợp lệ" }),
    ngayKy: z.coerce.date({ invalid_type_error: "Ngày lập không hợp lệ" }),
  })
  // Kiem tra o day (khong phai tung truong rieng) de gan loi dung vao truong
  // ngayVe - ngay ve khong duoc som hon ngay di.
  .refine((duLieu) => duLieu.ngayVe >= duLieu.ngayDi, {
    message: "Ngày về không được sớm hơn ngày đi",
    path: ["ngayVe"],
  });

export type TaoLenhDieuXeInput = z.infer<typeof taoLenhDieuXeSchema>;
