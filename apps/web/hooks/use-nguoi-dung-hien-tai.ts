"use client";

import { useQuery } from "@tanstack/react-query";
import { goiApi } from "@/lib/api";

export interface NguoiDungHienTai {
  id: string;
  tenDangNhap: string;
  hoTen: string;
  quyen: string[];
  phaiDoiMatKhau: boolean;
}

export const KHOA_TRUY_VAN_NGUOI_DUNG_HIEN_TAI = ["nguoi-dung-hien-tai"] as const;

/** Thong tin + quyen cua nguoi dang dang nhap - dung de an/hien nut theo quyen. */
export function useNguoiDungHienTai() {
  return useQuery({
    queryKey: KHOA_TRUY_VAN_NGUOI_DUNG_HIEN_TAI,
    queryFn: () => goiApi<{ nguoiDung: NguoiDungHienTai }>("/auth/toi").then((r) => r.nguoiDung),
    retry: false,
  });
}

export function coQuyen(nguoiDung: NguoiDungHienTai | undefined, ...maQuyen: string[]): boolean {
  if (!nguoiDung) return false;
  return maQuyen.every((ma) => nguoiDung.quyen.includes(ma));
}
