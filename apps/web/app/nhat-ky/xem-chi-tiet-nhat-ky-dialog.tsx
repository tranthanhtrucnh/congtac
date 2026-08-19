"use client";

import { nhanHanhDong } from "@congtac/shared";
import type { DongNhatKy } from "@/hooks/use-danh-sach-nhat-ky";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

function dinhDangGiaTri(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

/** So sanh NONG (cap 1, khong de quy) giua giaTriTruoc/giaTriSau - du dung vi
 * day la snapshot PHANG cua 1 ban ghi Prisma (khong long object/mang phuc
 * tap). Chi liet ke truong THUC SU khac nhau. Ten truong hien nguyen dang
 * (camelCase ky thuat) - CHUA co bang anh xa sang tieng Viet cho tung loai
 * doi tuong (qua nhieu loai de lam du ngay ban dau, xem
 * docs/superpowers/specs/2026-08-14-nhat-ky-he-thong-design.md muc 7). */
function soSanhTruocSau(giaTriTruoc: unknown, giaTriSau: unknown) {
  const truoc = (giaTriTruoc && typeof giaTriTruoc === "object" ? giaTriTruoc : {}) as Record<string, unknown>;
  const sau = (giaTriSau && typeof giaTriSau === "object" ? giaTriSau : {}) as Record<string, unknown>;
  const tatCaKhoa = Array.from(new Set([...Object.keys(truoc), ...Object.keys(sau)])).sort();
  return tatCaKhoa
    .filter((khoa) => JSON.stringify(truoc[khoa]) !== JSON.stringify(sau[khoa]))
    .map((khoa) => ({ truong: khoa, truoc: dinhDangGiaTri(truoc[khoa]), sau: dinhDangGiaTri(sau[khoa]) }));
}

export function XemChiTietNhatKyDialog({
  open,
  onOpenChange,
  dong,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dong: DongNhatKy | null;
}) {
  if (!dong) return null;

  const cacTruongDoi = soSanhTruocSau(dong.giaTriTruoc, dong.giaTriSau);
  const chiCoMotChieu = !dong.giaTriTruoc && !dong.giaTriSau;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{nhanHanhDong(dong.hanhDong)}</DialogTitle>
          <DialogDescription>
            {dong.nguoiDung ? `${dong.nguoiDung.hoTen} (${dong.nguoiDung.tenDangNhap})` : "Hệ thống"} —{" "}
            {new Date(dong.thoiGian).toLocaleString("vi-VN")}
            {dong.tomTat ? ` — ${dong.doiTuong}: ${dong.tomTat}` : ` — ${dong.doiTuong}`}
          </DialogDescription>
        </DialogHeader>

        {chiCoMotChieu ? (
          <p className="py-4 text-sm text-muted-foreground">
            Hành động này không lưu giá trị trước/sau (vd xem/in, đăng nhập/đăng xuất).
          </p>
        ) : cacTruongDoi.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">Không có trường nào thay đổi.</p>
        ) : (
          <div className="max-h-[60vh] overflow-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trường</TableHead>
                  <TableHead>Trước</TableHead>
                  <TableHead>Sau</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cacTruongDoi.map((d) => (
                  <TableRow key={d.truong}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{d.truong}</TableCell>
                    <TableCell className="max-w-[14rem] whitespace-pre-wrap text-sm">{d.truoc}</TableCell>
                    <TableCell className="max-w-[14rem] whitespace-pre-wrap text-sm">{d.sau}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
