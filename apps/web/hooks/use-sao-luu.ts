"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL, goiApi } from "@/lib/api";

/** Trang thai tien trinh sao luu/phuc hoi - xem apps/api/src/sao-luu/sao-luu.service.ts. */
export interface TienTrinhSaoLuu {
  dangChay: boolean;
  loaiCongViec: "sao-luu" | "phuc-hoi" | null;
  daXong: number;
  tong: number;
  loi: string | null;
  sanSangTai: boolean;
  thongBaoHoanTat: string | null;
}

const KHOA_TIEN_TRINH_SAO_LUU = ["sao-luu-tien-trinh"] as const;

/** Poll tien trinh moi 1.5s KHI dang co viec chay (sao luu hoac phuc hoi) -
 * tat poll khi ranh de khong goi API thua. */
export function useTienTrinhSaoLuu() {
  return useQuery({
    queryKey: KHOA_TIEN_TRINH_SAO_LUU,
    queryFn: () => goiApi<TienTrinhSaoLuu>("/sao-luu/tien-trinh"),
    refetchInterval: (query) => (query.state.data?.dangChay ? 1500 : false),
  });
}

export function useChaySaoLuu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => goiApi<{ dangChay: boolean }>("/sao-luu/chay", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KHOA_TIEN_TRINH_SAO_LUU });
    },
  });
}

/** Khong qua goiApi() - dieu huong thang toi API de trinh duyet tu xu ly tai
 * file xuong (giong cach /nhat-ky xuat Excel), cookie phien dang nhap tu
 * dinh kem theo dieu huong trinh duyet thong thuong. */
export function taiXuongSaoLuu() {
  window.open(`${API_BASE_URL}/sao-luu/tai-xuong`, "_blank");
}

export function useChayPhucHoi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bien: { file: File; xacNhan: string }) => {
      const form = new FormData();
      form.append("file", bien.file);
      form.append("xacNhan", bien.xacNhan);
      return goiApi<{ dangChay: boolean }>("/sao-luu/phuc-hoi", { method: "POST", body: form });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KHOA_TIEN_TRINH_SAO_LUU });
    },
  });
}
