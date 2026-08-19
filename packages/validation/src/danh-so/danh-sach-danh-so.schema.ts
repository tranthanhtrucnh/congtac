import { z } from "zod";

export const danhSachDanhSoSchema = z.object({
  nam: z.coerce.number().int().min(2000).max(2100),
});

export type DanhSachDanhSoInput = z.infer<typeof danhSachDanhSoSchema>;
