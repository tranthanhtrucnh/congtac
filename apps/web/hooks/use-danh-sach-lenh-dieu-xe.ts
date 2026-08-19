"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { goiApi } from "@/lib/api";

export interface LenhDieuXe {
  id: string;
  nam: number;
  soThuTu: number;
  soHieu: string;

  laiXeId: string | null;
  laiXeHoTen: string;

  phuongTienId: string | null;
  bienSo: string;
  nhanHieu: string;

  noiDi: string;
  noiDen: string;
  mucDich: string;

  ngayDi: string;
  ngayVe: string;
  ngayKy: string;

  nguoiKyId: string | null;
  nguoiKyHoTen: string;
  nguoiKyChucDanh: string;
  nguoiKyTheThuc: string;

  daHuy: boolean;
  lyDoHuy: string | null;

  // Co gia tri = LDX nay sinh kem tu 1 LDCT (nut Luu doan co tai xe) - khong
  // cho huy rieng le, phai dong bo qua LDCT (xem NHAT_KY_QUYET_DINH.md).
  lenhDieuCongTacId: string | null;
  // Chi co gia tri khi lenhDieuCongTacId khac null (LDX sinh kem tu 1 LDCT) -
  // dung de to mau chu dong bo voi danh sach LDCT cha. Them 2026-08-13, xem
  // NHAT_KY_QUYET_DINH.md.
  lenhDieuCongTac: { loaiMauIn: "TUYEN_THUONG" | "TRAM" | "PHAT_HANH_THU_HOI_VE_E" } | null;

  ngayTao: string;
  ngayCapNhat: string;
}

export interface DanhSachLenhDieuXe {
  duLieu: LenhDieuXe[];
  tong: number;
  trang: number;
  kichThuoc: number;
}

export type CotSapXepLenhDieuXe = "soHieu" | "laiXe" | "bienSo" | "ngayDi" | "ngayVe";

export interface BoLocLenhDieuXe {
  trang: number;
  kichThuoc: number;
  tuKhoa: string;
  daHuy?: boolean;
  nam?: number;
  sapXepTheo?: CotSapXepLenhDieuXe;
  huongSapXep?: "asc" | "desc";
}

function khoaTruyVan(boLoc: BoLocLenhDieuXe) {
  return ["lenh-dieu-xe", boLoc] as const;
}

export function useDanhSachLenhDieuXe(boLoc: BoLocLenhDieuXe) {
  const query = new URLSearchParams({
    trang: String(boLoc.trang),
    kichThuoc: String(boLoc.kichThuoc),
  });
  if (boLoc.tuKhoa) query.set("tuKhoa", boLoc.tuKhoa);
  if (boLoc.daHuy !== undefined) query.set("daHuy", String(boLoc.daHuy));
  if (boLoc.nam) query.set("nam", String(boLoc.nam));
  if (boLoc.sapXepTheo) query.set("sapXepTheo", boLoc.sapXepTheo);
  if (boLoc.huongSapXep) query.set("huongSapXep", boLoc.huongSapXep);

  return useQuery({
    queryKey: khoaTruyVan(boLoc),
    queryFn: () => goiApi<DanhSachLenhDieuXe>(`/lenh-dieu-xe?${query.toString()}`),
    placeholderData: (dataTruoc) => dataTruoc,
  });
}

export function useLamMoiDanhSachLenhDieuXe() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["lenh-dieu-xe"] });
}
