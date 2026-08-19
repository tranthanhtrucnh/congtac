import { z } from "zod";

export const huyLenhDieuXeSchema = z.object({
  lyDoHuy: z.string().trim().min(1, "Vui lòng nhập lý do hủy"),
});

export type HuyLenhDieuXeInput = z.infer<typeof huyLenhDieuXeSchema>;
