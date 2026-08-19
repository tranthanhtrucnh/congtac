"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { goiApi } from "@/lib/api";

export interface NhanVien {
  id: string;
  hoTen: string;
  ngaySinh: string;
  cccd: string;
  chucVu: string;
  donViCongTac: string | null;
  laTaiXe: boolean;
  trangThai: "DANG_LAM_VIEC" | "NGUNG_LAM_VIEC";
  ngayTao: string;
  ngayCapNhat: string;
}

export interface DanhSachNhanVien {
  duLieu: NhanVien[];
  tong: number;
  trang: number;
  kichThuoc: number;
}

export type CotSapXepNhanVien = "hoTen" | "ngaySinh" | "cccd" | "chucVu" | "trangThai";

export interface BoLocNhanVien {
  trang: number;
  kichThuoc: number;
  tuKhoa: string;
  trangThai?: "DANG_LAM_VIEC" | "NGUNG_LAM_VIEC";
  chiTaiXe: boolean;
  /** Khong dat -> dung sap xep mac dinh (nhom theo phong ban, cap bac chuc vu). */
  sapXepTheo?: CotSapXepNhanVien;
  huongSapXep?: "asc" | "desc";
}

function khoaTruyVan(boLoc: BoLocNhanVien) {
  return ["nhan-vien", boLoc] as const;
}

export function useDanhSachNhanVien(boLoc: BoLocNhanVien) {
  const query = new URLSearchParams({
    trang: String(boLoc.trang),
    kichThuoc: String(boLoc.kichThuoc),
  });
  if (boLoc.tuKhoa) query.set("tuKhoa", boLoc.tuKhoa);
  if (boLoc.trangThai) query.set("trangThai", boLoc.trangThai);
  if (boLoc.chiTaiXe) query.set("chiTaiXe", "true");
  if (boLoc.sapXepTheo) {
    query.set("sapXepTheo", boLoc.sapXepTheo);
    query.set("huongSapXep", boLoc.huongSapXep ?? "asc");
  }

  return useQuery({
    queryKey: khoaTruyVan(boLoc),
    queryFn: () => goiApi<DanhSachNhanVien>(`/nhan-vien?${query.toString()}`),
    placeholderData: (dataTruoc) => dataTruoc,
  });
}

export function useLamMoiDanhSachNhanVien() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["nhan-vien"] });
}
