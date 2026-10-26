import { z } from "zod";

export const changCongTacSchema = z.object({
  noiDi: z.string().trim().min(1, "Nơi đi không được để trống"),
  noiDen: z.string().trim().min(1, "Nơi đến không được để trống"),
  ngay: z.preprocess(
    (val) => (val instanceof Date ? val.toISOString().slice(0, 10) : val),
    z.string().trim().optional().nullable(),
  ),
});

export type ChangCongTacInput = z.infer<typeof changCongTacSchema>;

export const suaLoTrinhGiayDiDuongSchema = z.object({
  cacChang: z.array(changCongTacSchema).max(4, "Tối đa 4 chặng").nullable().optional(),
});

export type SuaLoTrinhGiayDiDuongInput = z.infer<typeof suaLoTrinhGiayDiDuongSchema>;
