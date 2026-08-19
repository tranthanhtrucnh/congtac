import { z } from "zod";

export const suaDiaDiemSchema = z.object({
  tenDayDu: z.string().trim().min(1, "Tên địa điểm không được để trống").optional(),
  cacTenTat: z
    .array(z.string().trim().min(1))
    .optional()
    .transform((ds) => (ds ? Array.from(new Set(ds)) : undefined)),
  ghiChu: z.string().trim().optional(),
  thuongDung: z.boolean().optional(),
  diemDiMacDinh: z.boolean().optional(),
  trangThai: z.enum(["DANG_DUNG", "NGUNG_DUNG"]).optional(),
});

export type SuaDiaDiemInput = z.infer<typeof suaDiaDiemSchema>;
