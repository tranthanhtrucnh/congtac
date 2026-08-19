"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { goiApi } from "@/lib/api";

export type CotSapXepPhuongTien = "bienSo" | "nhanHieu" | "loaiXe" | "soCho" | "trangThai";

export interface PhuongTien {
  id: string;
  bienSo: string;
  nhanHieu: string;
  loaiXe: string | null;
  soCho: number | null;
  ghiChu: string | null;
  trangThai: "DANG_SU_DUNG" | "NGUNG_SU_DUNG";
  taiXeThuongDungId: string | null;
  taiXeThuongDung: { id: string; hoTen: string } | null;
  ngayTao: string;
  ngayCapNhat: string;
}

export interface DanhSachPhuongTien {
  duLieu: PhuongTien[];
  tong: number;
  trang: number;
  kichThuoc: number;
}

export interface BoLocPhuongTien {
  trang: number;
  kichThuoc: number;
  tuKhoa: string;
  trangThai?: "DANG_SU_DUNG" | "NGUNG_SU_DUNG";
  sapXepTheo?: CotSapXepPhuongTien;
  huongSapXep?: "asc" | "desc";
}

function khoaTruyVan(boLoc: BoLocPhuongTien) {
  return ["phuong-tien", boLoc] as const;
}

export function useDanhSachPhuongTien(boLoc: BoLocPhuongTien) {
  const query = new URLSearchParams({
    trang: String(boLoc.trang),
    kichThuoc: String(boLoc.kichThuoc),
  });
  if (boLoc.tuKhoa) query.set("tuKhoa", boLoc.tuKhoa);
  if (boLoc.trangThai) query.set("trangThai", boLoc.trangThai);
  if (boLoc.sapXepTheo) {
    query.set("sapXepTheo", boLoc.sapXepTheo);
    query.set("huongSapXep", boLoc.huongSapXep ?? "asc");
  }

  return useQuery({
    queryKey: khoaTruyVan(boLoc),
    queryFn: () => goiApi<DanhSachPhuongTien>(`/phuong-tien?${query.toString()}`),
    placeholderData: (dataTruoc) => dataTruoc,
  });
}

export function useLamMoiDanhSachPhuongTien() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["phuong-tien"] });
}
