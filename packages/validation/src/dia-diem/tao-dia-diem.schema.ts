import { z } from "zod";

export const taoDiaDiemSchema = z.object({
  tenDayDu: z.string().trim().min(1, "Vui lòng nhập tên địa điểm"),
  // Loc bo phan tu rong/trung khi nguoi dung go nhieu dau phay lien tiep.
  cacTenTat: z
    .array(z.string().trim().min(1))
    .optional()
    .default([])
    .transform((ds) => Array.from(new Set(ds))),
  ghiChu: z.string().trim().optional(),
  thuongDung: z.boolean().optional().default(false),
  diemDiMacDinh: z.boolean().optional().default(false),
});

export type TaoDiaDiemInput = z.infer<typeof taoDiaDiemSchema>;
