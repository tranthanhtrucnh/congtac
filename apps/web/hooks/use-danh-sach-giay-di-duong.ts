"use client";

import { useQuery } from "@tanstack/react-query";
import { goiApi } from "@/lib/api";

/** GDD DOC LAP (khong qua 1 LDCT cu the) - dung cho trang /giay-di-duong.
 * Xem NHAT_KY_QUYET_DINH.md muc "Phuc hoi menu Cong lenh/Giay di duong". */
export interface GiayDiDuongDocLap {
  id: string;
  nam: number;
  soThuTu: number;
  soHieu: string;
  daHuy: boolean;
  lyDoHuy: string | null;
  thanhVien: { hoTen: string; chucVu: string };
  lenhDieuCongTac: {
    id: string;
    soHieu: string;
    diaDiemCongTac: string;
    ngayDi: string;
    ngayVe: string;
    // Them 2026-08-13 - dung de to mau chu dong bo voi danh sach LDCT cha.
    // Xem NHAT_KY_QUYET_DINH.md.
    loaiMauIn: "TUYEN_THUONG" | "TRAM" | "PHAT_HANH_THU_HOI_VE_E";
  };
}

export interface DanhSachGiayDiDuong {
  duLieu: GiayDiDuongDocLap[];
  tong: number;
  trang: number;
  kichThuoc: number;
}

export type CotSapXepGiayDiDuong = "soHieu" | "nguoiDuocCap" | "diaDiem";

export interface BoLocGiayDiDuong {
  trang: number;
  kichThuoc: number;
  tuKhoa: string;
  daHuy?: boolean;
  nam?: number;
  sapXepTheo?: CotSapXepGiayDiDuong;
  huongSapXep?: "asc" | "desc";
}

export function useDanhSachGiayDiDuong(boLoc: BoLocGiayDiDuong) {
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
    queryKey: ["giay-di-duong", boLoc] as const,
    queryFn: () => goiApi<DanhSachGiayDiDuong>(`/giay-di-duong?${query.toString()}`),
    placeholderData: (dataTruoc) => dataTruoc,
  });
}
