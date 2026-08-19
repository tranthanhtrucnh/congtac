import { z } from "zod";

// Danh sach ma quyen (Quyen.ma) can gan cho 1 vai tro - thay THE TOAN BO tap
// quyen hien co cua vai tro do (khong phai them/bot tung phan). Cho phep mang
// rong (bo het quyen cua vai tro). Xem
// docs/superpowers/specs/2026-08-17-vai-tro-phan-quyen-design.md muc 3.3-3.4.
export const suaQuyenVaiTroSchema = z.object({
  quyenMa: z.array(z.string().trim().min(1)),
});

export type SuaQuyenVaiTroInput = z.infer<typeof suaQuyenVaiTroSchema>;
