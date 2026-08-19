import { z } from "zod";

export const suaNguoiDungSchema = z.object({
  hoTen: z.string().min(2, "Vui lòng nhập họ tên").optional(),
  vaiTroIds: z.array(z.string()).min(1, "Chọn ít nhất 1 vai trò").optional(),
});

export type SuaNguoiDungInput = z.infer<typeof suaNguoiDungSchema>;
