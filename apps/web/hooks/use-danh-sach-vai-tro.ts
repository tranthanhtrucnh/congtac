"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { goiApi } from "@/lib/api";

export interface QuyenCuaVaiTro {
  ma: string;
  nhom: string;
  moTa: string | null;
}

export interface VaiTro {
  id: string;
  ma: string;
  ten: string;
  moTa: string | null;
  heThong: boolean;
  soNguoiDung: number;
  quyen: QuyenCuaVaiTro[];
}

const KHOA_VAI_TRO = ["vai-tro"] as const;
const KHOA_TOAN_BO_QUYEN = ["vai-tro", "quyen"] as const;

export function useDanhSachVaiTro() {
  return useQuery({
    queryKey: KHOA_VAI_TRO,
    queryFn: () => goiApi<VaiTro[]>("/vai-tro"),
  });
}

/** Toan bo danh muc quyen (ke ca quyen chua vai tro nao co) - dung lam HANG
 * cua bang ma tran quyen x vai tro tai /vai-tro. */
export function useToanBoQuyen() {
  return useQuery({
    queryKey: KHOA_TOAN_BO_QUYEN,
    queryFn: () => goiApi<QuyenCuaVaiTro[]>("/vai-tro/quyen"),
  });
}

/** Thay THE TOAN BO tap quyen cua 1 vai tro (khong phai them/bot tung phan).
 * Backend tu chan sua quyen cua Quan tri he thong (400) - xem
 * docs/superpowers/specs/2026-08-17-vai-tro-phan-quyen-design.md. */
export function useSuaQuyenVaiTro() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bien: { vaiTroId: string; quyenMa: string[] }) =>
      goiApi<VaiTro>(`/vai-tro/${bien.vaiTroId}/quyen`, {
        method: "PATCH",
        body: JSON.stringify({ quyenMa: bien.quyenMa }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KHOA_VAI_TRO });
    },
  });
}
