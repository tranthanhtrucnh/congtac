"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { goiApi } from "@/lib/api";

export type TrangThaiNguoiKy = "DANG_KY_CHINH_THUC" | "DU_PHONG" | "NGUNG_SU_DUNG";

export interface NguoiKy {
  id: string;
  nhanVienId: string;
  nhanVien: {
    id: string;
    hoTen: string;
    chucVu: string;
    donViCongTac: string | null;
  };
  chucDanhKy: string;
  theThucKy: string;
  ghiChu: string | null;
  trangThai: TrangThaiNguoiKy;
  ngayTao: string;
  ngayCapNhat: string;
}

export interface DanhSachNguoiKy {
  duLieu: NguoiKy[];
  tong: number;
  trang: number;
  kichThuoc: number;
}

export interface BoLocNguoiKy {
  trang: number;
  kichThuoc: number;
  tuKhoa: string;
  trangThai?: TrangThaiNguoiKy;
}

function khoaTruyVan(boLoc: BoLocNguoiKy) {
  return ["nguoi-ky", boLoc] as const;
}

export function useDanhSachNguoiKy(boLoc: BoLocNguoiKy) {
  const query = new URLSearchParams({
    trang: String(boLoc.trang),
    kichThuoc: String(boLoc.kichThuoc),
  });
  if (boLoc.tuKhoa) query.set("tuKhoa", boLoc.tuKhoa);
  if (boLoc.trangThai) query.set("trangThai", boLoc.trangThai);

  return useQuery({
    queryKey: khoaTruyVan(boLoc),
    queryFn: () => goiApi<DanhSachNguoiKy>(`/nguoi-ky?${query.toString()}`),
    placeholderData: (dataTruoc) => dataTruoc,
  });
}

export function useLamMoiDanhSachNguoiKy() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["nguoi-ky"] });
}
