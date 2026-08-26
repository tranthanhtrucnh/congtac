"use client";

import { useQuery } from "@tanstack/react-query";
import { goiApi } from "@/lib/api";

export interface LenhDieuXeTrungLich {
  id: string;
  soHieu: string;
  laiXeHoTen: string;
  bienSo: string;
  ngayDi: string;
  ngayVe: string;
}

export interface KetQuaTrungLichLenhDieuXe {
  trungTaiXe: LenhDieuXeTrungLich[];
  trungPhuongTien: LenhDieuXeTrungLich[];
}

/**
 * Kiem tra tai xe/phuong tien co dang gan voi LDX khac trung khoang ngay
 * khong - dung khi Van thu dang chon tai xe/bien so tren form LDX (doc lap
 * hoac sinh kem tu LDCT). Chi canh bao, KHONG chan luu. Co the truyen chi 1
 * trong 2 (laiXeId/phuongTienId) - vd form moi chon xong tai xe, chua chon
 * bien so - van kiem tra duoc phan da co. Nguoi dung yeu cau 2026-08-19, xem
 * NHAT_KY_QUYET_DINH.md.
 */
export function useKiemTraTrungLichLenhDieuXe(
  laiXeId: string | undefined,
  phuongTienId: string | undefined,
  ngayDi: Date | undefined,
  ngayVe: Date | undefined,
  loaiTruId?: string,
) {
  const kichHoat = (!!laiXeId || !!phuongTienId) && !!ngayDi && !!ngayVe;

  const query = new URLSearchParams();
  if (laiXeId) query.set("laiXeId", laiXeId);
  if (phuongTienId) query.set("phuongTienId", phuongTienId);
  if (ngayDi) query.set("ngayDi", ngayDi.toISOString());
  if (ngayVe) query.set("ngayVe", ngayVe.toISOString());
  if (loaiTruId) query.set("loaiTruId", loaiTruId);

  return useQuery({
    queryKey: [
      "lenh-dieu-xe",
      "trung-lich",
      laiXeId,
      phuongTienId,
      ngayDi?.toISOString(),
      ngayVe?.toISOString(),
      loaiTruId,
    ],
    queryFn: () => goiApi<KetQuaTrungLichLenhDieuXe>(`/lenh-dieu-xe/trung-lich?${query.toString()}`),
    enabled: kichHoat,
    staleTime: 30_000,
  });
}
