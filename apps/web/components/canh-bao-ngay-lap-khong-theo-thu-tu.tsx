"use client";

import { AlertTriangle } from "lucide-react";
import { useChungTuSoLonNhat } from "@/hooks/use-chung-tu-so-lon-nhat";

function dinhDangNgay(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

/**
 * Canh bao (khong chan luu) khi "Ngay lap" dang nhap SOM HON ngay lap cua
 * chung tu CUNG loai/nam dang giu so hieu LON NHAT hien co - vi so hieu duoc
 * cap TUAN TU THEO THU TU TAO (xem DanhSoService.capSo()), hoan toan khong
 * lien quan gia tri "Ngay lap" nguoi dung tu go/sua, nen co the xay ra tinh
 * trang so hieu tang dan nhung ngay lap khong tang theo dung thu tu do.
 * Nguoi dung yeu cau 2026-08-27 (chon "chi canh bao mem", giong cach da chon
 * cho tinh nang canh bao trung lich 2026-08-19) - xem NHAT_KY_QUYET_DINH.md.
 */
export function CanhBaoNgayLapKhongTheoThuTu({
  loaiChungTu,
  ngayKy,
  loaiTruId,
}: {
  loaiChungTu: "LDCT" | "LDX";
  ngayKy: Date | undefined;
  loaiTruId?: string;
}) {
  const nam = ngayKy?.getFullYear();
  const { data: soLonNhat } = useChungTuSoLonNhat(loaiChungTu, nam, loaiTruId);

  if (!ngayKy || !soLonNhat) return null;
  if (ngayKy.getTime() >= new Date(soLonNhat.ngayKy).getTime()) return null;

  return (
    <p className="flex w-full items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
      <span>
        Sớm hơn ngày lập của {soLonNhat.soHieu} ({dinhDangNgay(soLonNhat.ngayKy)}) — chứng từ đang giữ số hiệu
        lớn nhất trong năm. Số hiệu vẫn cấp tăng dần theo thứ tự lập, không theo ngày lập bạn nhập.
      </span>
    </p>
  );
}
