"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import {
  useKiemTraTrungLichLenhDieuXe,
  type LenhDieuXeTrungLich,
} from "@/hooks/use-kiem-tra-trung-lich-lenh-dieu-xe";

function dinhDangNgay(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function DongCanhBao({ nhan, danhSach }: { nhan: string; danhSach: LenhDieuXeTrungLich[] }) {
  if (danhSach.length === 0) return null;
  return (
    <p className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
      <span>
        {nhan} trùng lịch với{" "}
        {danhSach.map((lenh, i) => (
          <span key={lenh.id}>
            {i > 0 && ", "}
            <Link href={`/lenh-dieu-xe`} target="_blank" className="underline hover:no-underline">
              {lenh.soHieu}
            </Link>{" "}
            ({dinhDangNgay(lenh.ngayDi)} – {dinhDangNgay(lenh.ngayVe)}, {lenh.laiXeHoTen} · {lenh.bienSo})
          </span>
        ))}
      </span>
    </p>
  );
}

/**
 * Canh bao (khong chan luu) khi tai xe/phuong tien dang chon tren form Lap/
 * Sua Lenh dieu xe (doc lap hoac sinh kem tu LDCT) CUNG luc dang gan voi 1
 * LDX KHAC (chua huy) co khoang ngay giao nhau. Nguoi dung yeu cau 2026-08-19,
 * xem NHAT_KY_QUYET_DINH.md.
 */
export function CanhBaoTrungLichLenhDieuXe({
  laiXeId,
  phuongTienId,
  ngayDi,
  ngayVe,
  loaiTruId,
}: {
  laiXeId: string | undefined;
  phuongTienId: string | undefined;
  ngayDi: Date | undefined;
  ngayVe: Date | undefined;
  loaiTruId?: string;
}) {
  const { data } = useKiemTraTrungLichLenhDieuXe(laiXeId, phuongTienId, ngayDi, ngayVe, loaiTruId);

  if (!data) return null;

  return (
    <div className="space-y-1">
      <DongCanhBao nhan="Lái xe" danhSach={data.trungTaiXe} />
      <DongCanhBao nhan="Phương tiện" danhSach={data.trungPhuongTien} />
    </div>
  );
}
