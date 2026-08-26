"use client";

import { useQuery } from "@tanstack/react-query";
import { goiApi } from "@/lib/api";

/** Xem giai thich cong thuc kiem tra o NhanVienService.kiemTraTrungLich()
 * (apps/api/src/nhan-vien/nhan-vien.service.ts). */
export interface ChungTuTrungLich {
  id: string;
  soHieu: string;
  diaDiemCongTac: string;
  ngayDi: string;
  ngayVe: string;
}

/**
 * Kiem tra 1 nhan vien co dang o doan cong tac khac trung khoang ngay khong
 * - dung khi Van thu dang chon them thanh vien tren form Lap/Sua LDCT. Chi
 * canh bao, KHONG chan luu (nguoi dung yeu cau 2026-08-19, xem
 * NHAT_KY_QUYET_DINH.md).
 *
 * `enabled` chi bat khi da co du nhanVienId + ngayDi + ngayVe - tranh goi API
 * thua luc form chua nhap xong.
 */
export function useKiemTraTrungLichNhanVien(
  nhanVienId: string | undefined,
  ngayDi: Date | undefined,
  ngayVe: Date | undefined,
  loaiTruLenhId?: string,
) {
  const kichHoat = !!nhanVienId && !!ngayDi && !!ngayVe;

  const query = new URLSearchParams();
  if (ngayDi) query.set("ngayDi", ngayDi.toISOString());
  if (ngayVe) query.set("ngayVe", ngayVe.toISOString());
  if (loaiTruLenhId) query.set("loaiTruLenhId", loaiTruLenhId);

  return useQuery({
    queryKey: ["nhan-vien", nhanVienId, "trung-lich", ngayDi?.toISOString(), ngayVe?.toISOString(), loaiTruLenhId],
    queryFn: () => goiApi<ChungTuTrungLich[]>(`/nhan-vien/${nhanVienId}/trung-lich?${query.toString()}`),
    enabled: kichHoat,
    staleTime: 30_000,
  });
}
