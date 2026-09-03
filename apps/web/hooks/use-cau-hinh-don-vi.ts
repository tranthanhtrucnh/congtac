"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { goiApi } from "@/lib/api";
import type { SuaCauHinhDonViInput } from "@congtac/validation";

// Phai khop CHINH XAC voi enum trong sua-cau-hinh-don-vi.schema.ts va
// MA_PHONG_CHU_MAU_IN o apps/api/src/common/mau-in/mau-in-dung-chung.ts -
// khong dung chung 1 hang so qua package rieng (xem ghi chu trong 2 file
// do). Khai bao rieng (khong phai `string`) de TypeScript bat loi luc bien
// dich neu form gui gia tri sai kieu vao SuaCauHinhDonViInput (phat hien qua
// loi build thuc te 2026-08-28: `pnpm -r run build` bao "Type 'string' is
// not assignable to type '\"BE_VIETNAM_PRO\" | ...'").
export type MaPhongChuMauIn = "BE_VIETNAM_PRO" | "ROBOTO" | "ROBOTO_CONDENSED" | "TIMES_NEW_ROMAN";

export interface CauHinhDonVi {
  id: string;
  donViChuQuan: string;
  tenCoQuanDong1: string;
  tenCoQuanDong2: string;
  tenNgan: string;
  diaDanh: string;
  canCuMauTram: string | null;
  mucDichMacDinhVeE: string | null;
  logoBase64: string | null;
  logoOpacityPhanTram: number;
  logoKichThuocMm: number;
  chuoiDiaDiemThuongDungVeE: { nhan: string; noiDung: string }[];
  // Phong chu than noi dung moi mau in PDF - xem MA_PHONG_CHU_MAU_IN o
  // apps/api/src/common/mau-in/mau-in-dung-chung.ts (danh sach ma hop le).
  phongChuMauIn: MaPhongChuMauIn;
  // Ty le x-height dung cho CSS font-size-adjust - bu chenh lech "to/nho"
  // giua cac phong chu (xem TY_LE_X_HEIGHT_CHUAN_MAU_IN cung file tren).
  tyLeXHeightMauIn: number;
  ngayCapNhat: string;
}

const KHOA_TRUY_VAN = ["cau-hinh-don-vi"] as const;

/**
 * Thong tin don vi (ten UBND/cong ty dung tren mau in + sidebar) - doc tu
 * DB, khong hardcode trong code nua de doi ten don vi (vd sap nhap) chi can
 * sua qua giao dien /cau-hinh-don-vi. Xem NHAT_KY_QUYET_DINH.md.
 */
export function useCauHinhDonVi(tuyChon?: { enabled?: boolean }) {
  return useQuery({
    queryKey: KHOA_TRUY_VAN,
    queryFn: () => goiApi<CauHinhDonVi>("/cau-hinh-don-vi"),
    // Gan nhu khong bao gio doi trong 1 phien lam viec - giu du lieu cu khi
    // dieu huong qua lai thay vi nhap nhay loading moi lan vao trang.
    staleTime: 5 * 60 * 1000,
    // enabled: false o trang dang nhap/doi mat khau (chua dang nhap, goi se
    // chi nhan 401 vo ich) - xem AppShell.
    enabled: tuyChon?.enabled,
    retry: false,
  });
}

export function useLuuCauHinhDonVi() {
  const queryClient = useQueryClient();
  return async (duLieu: SuaCauHinhDonViInput) => {
    const ketQua = await goiApi<CauHinhDonVi>("/cau-hinh-don-vi", {
      method: "PATCH",
      body: JSON.stringify(duLieu),
    });
    queryClient.setQueryData(KHOA_TRUY_VAN, ketQua);
    return ketQua;
  };
}
