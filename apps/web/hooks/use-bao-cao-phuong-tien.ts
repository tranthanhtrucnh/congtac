"use client";

import { useQuery } from "@tanstack/react-query";
import { goiApi } from "@/lib/api";
import type { TieuChiSapXepTanSuat } from "@congtac/validation";

/** 1 dong = 1 phuong tien dang hoat dong, kem thong tin Lenh dieu xe "dang
 * di" (null = xe dang ranh) - dung cho phan I trang /bao-cao-phuong-tien.
 * Xem NHAT_KY_QUYET_DINH.md muc "Bao cao phuong tien". */
export interface DongTrangThaiPhuongTien {
  id: string;
  bienSo: string;
  nhanHieu: string;
  loaiXe: string | null;
  dangDi: boolean;
  lenhDieuXeDangDi: {
    id: string;
    soHieu: string;
    laiXeHoTen: string;
    noiDen: string;
    ngayDi: string;
    ngayVe: string;
  } | null;
}

/** 1 dong = 1 phuong tien (ke ca chua co luot di nao trong ky) kem so lieu
 * thong ke tan suat - dung cho phan II. */
export interface DongTanSuatPhuongTien {
  id: string;
  bienSo: string;
  nhanHieu: string;
  luotDi: number;
  tongNgaySuDung: number;
}

export function useTrangThaiPhuongTien(tuKhoa: string) {
  const query = new URLSearchParams();
  if (tuKhoa) query.set("tuKhoa", tuKhoa);

  return useQuery({
    queryKey: ["bao-cao-phuong-tien", "trang-thai", tuKhoa] as const,
    queryFn: () => goiApi<DongTrangThaiPhuongTien[]>(`/bao-cao-phuong-tien/trang-thai?${query.toString()}`),
  });
}

export interface BoLocTanSuatPhuongTien {
  tuNgay?: string;
  denNgay?: string;
  sapXepTheo: TieuChiSapXepTanSuat;
  huongSapXep: "asc" | "desc";
}

export function xayQueryTanSuatPhuongTien(boLoc: BoLocTanSuatPhuongTien) {
  const query = new URLSearchParams();
  if (boLoc.tuNgay) query.set("tuNgay", boLoc.tuNgay);
  if (boLoc.denNgay) query.set("denNgay", boLoc.denNgay);
  query.set("sapXepTheo", boLoc.sapXepTheo);
  query.set("huongSapXep", boLoc.huongSapXep);
  return query;
}

export function useTanSuatPhuongTien(boLoc: BoLocTanSuatPhuongTien) {
  const query = xayQueryTanSuatPhuongTien(boLoc);

  return useQuery({
    queryKey: ["bao-cao-phuong-tien", "tan-suat", boLoc] as const,
    queryFn: () => goiApi<DongTanSuatPhuongTien[]>(`/bao-cao-phuong-tien/tan-suat?${query.toString()}`),
    placeholderData: (dataTruoc) => dataTruoc,
  });
}
