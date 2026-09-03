"use client";

import { useQuery } from "@tanstack/react-query";
import { goiApi } from "@/lib/api";

/** Xem giai thich cong thuc kiem tra o DanhSoService.layChungTuSoLonNhat()
 * (apps/api/src/danh-so/danh-so.service.ts). */
export interface ChungTuSoLonNhat {
  soHieu: string;
  ngayKy: string;
}

/**
 * Lay chung tu (LDCT hoac LDX) DANG GIU so hieu LON NHAT hien co trong 1 nam
 * - dung khi Van thu dang nhap "Ngay lap" tren form Lap/Sua LDCT/LDX, de
 * canh bao MEM (khong chan luu) neu ngay lap dang nhap SOM HON ngay lap cua
 * chung tu do (xem CanhBaoNgayLapKhongTheoThuTu). Chi kich hoat khi da co
 * `nam` (tuc da chon Ngay lap) - tranh goi API thua luc form chua nhap xong.
 */
export function useChungTuSoLonNhat(loaiChungTu: "LDCT" | "LDX", nam: number | undefined, loaiTruId?: string) {
  const kichHoat = !!nam;

  const query = new URLSearchParams();
  query.set("loaiChungTu", loaiChungTu);
  if (nam) query.set("nam", String(nam));
  if (loaiTruId) query.set("loaiTruId", loaiTruId);

  return useQuery({
    queryKey: ["danh-so", "chung-tu-so-lon-nhat", loaiChungTu, nam, loaiTruId],
    queryFn: () => goiApi<ChungTuSoLonNhat | null>(`/danh-so/chung-tu-so-lon-nhat?${query.toString()}`),
    enabled: kichHoat,
    staleTime: 30_000,
  });
}
