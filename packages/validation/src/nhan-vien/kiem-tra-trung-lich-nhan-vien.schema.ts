import { z } from "zod";

/**
 * Query cho GET /nhan-vien/:id/trung-lich - kiem tra 1 nhan vien co dang la
 * thanh vien (chua loai khoi doan) cua doan cong tac (LenhDieuCongTac) KHAC
 * co khoang ngay hieu luc giao nhau voi [ngayDi, ngayVe] truyen vao khong.
 * loaiTruLenhId: id LenhDieuCongTac dang thao tac (form Sua) - loai tru
 * chinh no khoi ket qua, tranh tu bao trung voi ban than.
 */
export const kiemTraTrungLichNhanVienSchema = z
  .object({
    ngayDi: z.coerce.date({ invalid_type_error: "Ngày đi không hợp lệ" }),
    ngayVe: z.coerce.date({ invalid_type_error: "Ngày về không hợp lệ" }),
    loaiTruLenhId: z.string().trim().optional(),
  })
  .refine((d) => d.ngayVe >= d.ngayDi, {
    message: "Ngày về không được sớm hơn ngày đi",
    path: ["ngayVe"],
  });

export type KiemTraTrungLichNhanVienInput = z.infer<typeof kiemTraTrungLichNhanVienSchema>;
