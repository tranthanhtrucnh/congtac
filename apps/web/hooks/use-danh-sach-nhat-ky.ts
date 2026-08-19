"use client";

import { useQuery } from "@tanstack/react-query";
import type { MaNhomHanhDong } from "@congtac/shared";
import { goiApi } from "@/lib/api";

/** 1 dong = 1 ban ghi NhatKyHeThong - dung cho trang /nhat-ky (chi Quan tri
 * he thong xem, quyen nhat-ky.xem). Xem NHAT_KY_QUYET_DINH.md muc "Nhat ky
 * he thong". */
export interface DongNhatKy {
  id: string;
  nguoiDungId: string | null;
  nguoiDung: { hoTen: string; tenDangNhap: string } | null;
  hanhDong: string;
  doiTuong: string;
  doiTuongId: string | null;
  giaTriTruoc: unknown;
  giaTriSau: unknown;
  // Rut tu giaTriSau/giaTriTruoc (vd so hieu chung tu, ten dang nhap...) -
  // tinh san o backend, xem NhatKyXemService.
  tomTat: string | null;
  diaChiIp: string | null;
  thoiGian: string;
}

export interface DanhSachNhatKy {
  duLieu: DongNhatKy[];
  tong: number;
  trang: number;
  kichThuoc: number;
}

export interface BoLocNhatKy {
  trang: number;
  kichThuoc: number;
  tuKhoa: string;
  // Chuoi dd theo dinh dang input type="date" (yyyy-MM-dd) - rong = khong loc.
  tuNgay?: string;
  denNgay?: string;
  nguoiDungId?: string;
  nhom?: MaNhomHanhDong;
}

export function xayQueryNhatKy(boLoc: Omit<BoLocNhatKy, "trang" | "kichThuoc">) {
  const query = new URLSearchParams();
  if (boLoc.tuKhoa) query.set("tuKhoa", boLoc.tuKhoa);
  if (boLoc.tuNgay) query.set("tuNgay", boLoc.tuNgay);
  if (boLoc.denNgay) query.set("denNgay", boLoc.denNgay);
  if (boLoc.nguoiDungId) query.set("nguoiDungId", boLoc.nguoiDungId);
  if (boLoc.nhom) query.set("nhom", boLoc.nhom);
  return query;
}

export function useDanhSachNhatKy(boLoc: BoLocNhatKy) {
  const query = xayQueryNhatKy(boLoc);
  query.set("trang", String(boLoc.trang));
  query.set("kichThuoc", String(boLoc.kichThuoc));

  return useQuery({
    queryKey: ["nhat-ky", boLoc] as const,
    queryFn: () => goiApi<DanhSachNhatKy>(`/nhat-ky?${query.toString()}`),
    placeholderData: (dataTruoc) => dataTruoc,
  });
}
