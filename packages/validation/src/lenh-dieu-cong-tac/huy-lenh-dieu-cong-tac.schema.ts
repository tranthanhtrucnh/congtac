import { z } from "zod";

// Huy ca LDCT se cascade huy toan bo GiayDiDuong con + LenhDieuXe lien ket
// chua huy, dung chung ly do nay - xem NHAT_KY_QUYET_DINH.md.
export const huyLenhDieuCongTacSchema = z.object({
  lyDoHuy: z.string().trim().min(1, "Vui lòng nhập lý do hủy"),
});

export type HuyLenhDieuCongTacInput = z.infer<typeof huyLenhDieuCongTacSchema>;
