"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { goiApi } from "@/lib/api";

export type CotSapXepDiaDiem = "tenDayDu" | "trangThai";

export interface DiaDiem {
  id: string;
  tenDayDu: string;
  cacTenTat: string[];
  ghiChu: string | null;
  trangThai: "DANG_DUNG" | "NGUNG_DUNG";
  thuongDung: boolean;
  diemDiMacDinh: boolean;
  ngayTao: string;
  ngayCapNhat: string;
}

export interface DanhSachDiaDiem {
  duLieu: DiaDiem[];
  tong: number;
  trang: number;
  kichThuoc: number;
}

export interface BoLocDiaDiem {
  trang: number;
  kichThuoc: number;
  tuKhoa: string;
  trangThai?: "DANG_DUNG" | "NGUNG_DUNG";
  chiThuongDung?: boolean;
  sapXepTheo?: CotSapXepDiaDiem;
  huongSapXep?: "asc" | "desc";
}

function khoaTruyVan(boLoc: BoLocDiaDiem) {
  return ["dia-diem", boLoc] as const;
}

export function useDanhSachDiaDiem(boLoc: BoLocDiaDiem) {
  const query = new URLSearchParams({
    trang: String(boLoc.trang),
    kichThuoc: String(boLoc.kichThuoc),
  });
  if (boLoc.tuKhoa) query.set("tuKhoa", boLoc.tuKhoa);
  if (boLoc.trangThai) query.set("trangThai", boLoc.trangThai);
  if (boLoc.chiThuongDung) query.set("chiThuongDung", "true");
  if (boLoc.sapXepTheo) {
    query.set("sapXepTheo", boLoc.sapXepTheo);
    query.set("huongSapXep", boLoc.huongSapXep ?? "asc");
  }

  return useQuery({
    queryKey: khoaTruyVan(boLoc),
    queryFn: () => goiApi<DanhSachDiaDiem>(`/dia-diem?${query.toString()}`),
    placeholderData: (dataTruoc) => dataTruoc,
  });
}

export function useLamMoiDanhSachDiaDiem() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["dia-diem"] });
}
