"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useKiemTraTrungLichNhanVien } from "@/hooks/use-kiem-tra-trung-lich-nhan-vien";

function dinhDangNgay(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

/**
 * Canh bao (khong chan luu) khi 1 nhan vien dang duoc them vao doan cong tac
 * nay CUNG luc dang o 1 doan cong tac KHAC (chua huy, chua bi loai khoi
 * doan) co khoang ngay giao nhau - dat ngay duoi dong thanh vien tren form
 * Lap/Sua Lenh dieu cong tac. Tach thanh component rieng (khong goi hook
 * truc tiep trong vong lap .map() cua component cha) de tuan thu quy tac
 * Hooks cua React - moi dong thanh vien la 1 instance component rieng, hook
 * ben trong no goi 1 lan on dinh moi render, khong vi pham "khong goi hook
 * trong vong lap". Nguoi dung yeu cau 2026-08-19, xem NHAT_KY_QUYET_DINH.md.
 */
export function CanhBaoTrungLichNhanVien({
  nhanVienId,
  ngayDi,
  ngayVe,
  loaiTruLenhId,
}: {
  nhanVienId: string | undefined;
  ngayDi: Date | undefined;
  ngayVe: Date | undefined;
  loaiTruLenhId?: string;
}) {
  const { data: trungLich } = useKiemTraTrungLichNhanVien(nhanVienId, ngayDi, ngayVe, loaiTruLenhId);

  if (!trungLich || trungLich.length === 0) return null;

  return (
    <p className="flex w-full items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
      <span>
        Trùng lịch với{" "}
        {trungLich.map((lenh, i) => (
          <span key={lenh.id}>
            {i > 0 && ", "}
            <Link href={`/lenh-dieu-cong-tac/${lenh.id}`} target="_blank" className="underline hover:no-underline">
              {lenh.soHieu}
            </Link>{" "}
            ({dinhDangNgay(lenh.ngayDi)} – {dinhDangNgay(lenh.ngayVe)}, {lenh.diaDiemCongTac})
          </span>
        ))}
      </span>
    </p>
  );
}
