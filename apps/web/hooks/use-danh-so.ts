"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { goiApi } from "@/lib/api";

export type LoaiChungTu = "LDCT" | "GDD" | "LDX";

export interface DanhSoTheoLoai {
  id: string | null;
  loaiChungTu: LoaiChungTu;
  nam: number;
  soBatDau: number;
  soHienTai: number;
  /** Ky hieu DA AP DUNG (uu tien gia tri ghi de trong DB, roi moi fallback mac dinh) - luon co gia tri, khong bao gio null. */
  kyHieu: string;
  daThietLap: boolean;
  /** true neu day so nay da co chung tu su dung (khong the doi so bat dau nua). */
  daCapSo: boolean;
}

function khoaTruyVan(nam: number) {
  return ["danh-so", nam] as const;
}

export function useDanhSachDanhSo(nam: number) {
  return useQuery({
    queryKey: khoaTruyVan(nam),
    queryFn: () => goiApi<DanhSoTheoLoai[]>(`/danh-so?nam=${nam}`),
    placeholderData: (dataTruoc) => dataTruoc,
  });
}

export function useLamMoiDanhSo() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["danh-so"] });
}
