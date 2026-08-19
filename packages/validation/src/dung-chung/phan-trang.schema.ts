import { z } from "zod";

export const phanTrangSchema = z.object({
  trang: z.coerce.number().int().min(1).default(1),
  kichThuoc: z.coerce.number().int().min(1).max(100).default(20),
  tuKhoa: z.string().trim().optional(),
});

export type PhanTrangInput = z.infer<typeof phanTrangSchema>;
