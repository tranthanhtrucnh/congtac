"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { goiApi } from "@/lib/api";

/** 1 dong = 1 Cong lenh/Giay di duong dang hoat dong, gop voi LDCT cha va
 * thanh vien tuong ung - dung cho trang /so-cong-lenh (bao cao tu sinh thay
 * so ghi tay cua Van thu). Xem NHAT_KY_QUYET_DINH.md muc "So cong lenh". */
export interface DongSoCongLenh {
  id: string;
  lenhDieuCongTacId: string;
  ngayLap: string;
  soLdct: string;
  soCongLenh: string;
  hoTen: string;
  diaDiem: string;
  mucDich: string;
  ngayDi: string;
  ngayVe: string;
  ghiChu: string | null;
}

export interface DanhSachSoCongLenh {
  duLieu: DongSoCongLenh[];
  tong: number;
  trang: number;
  kichThuoc: number;
}

export interface BoLocSoCongLenh {
  trang: number;
  kichThuoc: number;
  tuKhoa: string;
  // Chuoi dd theo dinh dang input type="date" (yyyy-MM-dd) - rong = khong loc.
  tuNgay?: string;
  denNgay?: string;
}

export function xayQuerySoCongLenh(boLoc: Omit<BoLocSoCongLenh, "trang" | "kichThuoc">) {
  const query = new URLSearchParams();
  if (boLoc.tuKhoa) query.set("tuKhoa", boLoc.tuKhoa);
  if (boLoc.tuNgay) query.set("tuNgay", boLoc.tuNgay);
  if (boLoc.denNgay) query.set("denNgay", boLoc.denNgay);
  return query;
}

export function useDanhSachSoCongLenh(boLoc: BoLocSoCongLenh) {
  const query = xayQuerySoCongLenh(boLoc);
  query.set("trang", String(boLoc.trang));
  query.set("kichThuoc", String(boLoc.kichThuoc));

  return useQuery({
    queryKey: ["so-cong-lenh", boLoc] as const,
    queryFn: () => goiApi<DanhSachSoCongLenh>(`/so-cong-lenh?${query.toString()}`),
    placeholderData: (dataTruoc) => dataTruoc,
  });
}

// Danh sach nay gop tu LDCT + GDD - phai goi kem theo
// useLamMoiDanhSachLenhDieuCongTac() o noi nao sua LDCT de trang
// /so-cong-lenh khong hien du lieu cu. Xem NHAT_KY_QUYET_DINH.md muc
// "GDD/LDX khong cap nhat sau khi sua LDCT".
export function useLamMoiDanhSachSoCongLenh() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["so-cong-lenh"] });
}
