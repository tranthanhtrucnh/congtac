"use client";

import { useQuery } from "@tanstack/react-query";
import { goiApi } from "@/lib/api";

/**
 * Goi y "Noi den" tu LICH SU cac lenh dieu cong tac da lap truoc day - BO
 * SUNG cho goi y tu Danh muc Dia diem (useDanhSachDiaDiem), khong thay the.
 * Xem doc comment day du o LenhDieuCongTacService.goiYDiaDiemLichSu()
 * (backend) va NHAT_KY_QUYET_DINH.md. Nguoi dung yeu cau 2026-09-04.
 *
 * staleTime dai (5 phut) vi danh sach nay chi doi khi co lenh MOI voi 1 cum
 * dia diem CHUA TUNG xuat hien - khong can lam moi lien tuc nhu du lieu giao
 * dich thong thuong.
 */
export function useGoiYDiaDiemLichSu() {
  return useQuery({
    queryKey: ["lenh-dieu-cong-tac", "goi-y-dia-diem"],
    queryFn: () => goiApi<string[]>("/lenh-dieu-cong-tac/goi-y-dia-diem"),
    staleTime: 5 * 60 * 1000,
  });
}
