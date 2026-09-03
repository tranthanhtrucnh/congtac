"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { goiApi } from "@/lib/api";
import type { VaiTro, QuyenCuaVaiTro } from "./use-danh-sach-vai-tro";

export interface NguoiDung {
  id: string;
  tenDangNhap: string;
  hoTen: string;
  trangThai: "HOAT_DONG" | "KHOA";
  phaiDoiMatKhau: boolean;
  ngayTao: string;
  vaiTro: VaiTro[];
  /** Quyen gan RIENG cho ca nhan nay, CONG THEM vao quyen suy tu vaiTro (xem
   * NguoiDungService.chiTiet() va NHAT_KY_QUYET_DINH.md muc "Phan quyen
   * rieng theo nguoi dung"). */
  quyenRieng: QuyenCuaVaiTro[];
}

export interface DanhSachNguoiDung {
  duLieu: NguoiDung[];
  tong: number;
  trang: number;
  kichThuoc: number;
}

export function khoaTruyVanNguoiDung(trang: number, tuKhoa: string) {
  return ["nguoi-dung", { trang, tuKhoa }] as const;
}

export function useDanhSachNguoiDung(trang: number, tuKhoa: string) {
  const query = new URLSearchParams({ trang: String(trang), kichThuoc: "20" });
  if (tuKhoa) query.set("tuKhoa", tuKhoa);

  return useQuery({
    queryKey: khoaTruyVanNguoiDung(trang, tuKhoa),
    queryFn: () => goiApi<DanhSachNguoiDung>(`/nguoi-dung?${query.toString()}`),
    placeholderData: (dataTruoc) => dataTruoc,
  });
}

export function useLamMoiDanhSachNguoiDung() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["nguoi-dung"] });
}
