import { z } from "zod";

export const suaNguoiDungSchema = z.object({
  hoTen: z.string().min(2, "Vui lòng nhập họ tên").optional(),
  vaiTroIds: z.array(z.string()).min(1, "Chọn ít nhất 1 vai trò").optional(),
  // Quyen gan RIENG cho ca nhan nay, CONG THEM vao quyen suy tu vaiTroIds -
  // mang MA quyen (vd "chung-tu.in-nhap"), khong phai id. Cho phep mang rong
  // (= bo het quyen rieng, chi con quyen tu vai tro). Xem
  // NguoiDungService.sua() va NHAT_KY_QUYET_DINH.md muc "Phan quyen rieng
  // theo nguoi dung".
  quyenRieng: z.array(z.string()).optional(),
});

export type SuaNguoiDungInput = z.infer<typeof suaNguoiDungSchema>;
