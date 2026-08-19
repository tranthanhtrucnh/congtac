"use client";

import { useState, type MouseEvent } from "react";
import { goiApi, LoiApi } from "@/lib/api";
import { useLamMoiDanhSachLenhDieuXe, type LenhDieuXe } from "@/hooks/use-danh-sach-lenh-dieu-xe";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export function HuyLenhDieuXeDialog({
  open,
  onOpenChange,
  lenhDieuXe,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lenhDieuXe: LenhDieuXe | null;
}) {
  const lamMoiDanhSach = useLamMoiDanhSachLenhDieuXe();
  const [lyDoHuy, setLyDoHuy] = useState("");
  const [dangXuLy, setDangXuLy] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  if (!lenhDieuXe) return null;

  function dong(o: boolean) {
    onOpenChange(o);
    if (!o) {
      setLyDoHuy("");
      setLoi(null);
    }
  }

  async function xacNhan(e: MouseEvent<HTMLButtonElement>) {
    // AlertDialogAction (Radix) tu dong dong dialog ngay khi bam, khong doi
    // ket qua async - phai preventDefault() de tu kiem soat luc dong, vi o
    // day co o nhap bat buoc (ly do huy) can validate/gui API truoc.
    e.preventDefault();
    if (!lenhDieuXe) return;
    if (!lyDoHuy.trim()) {
      setLoi("Vui lòng nhập lý do hủy");
      return;
    }
    setDangXuLy(true);
    setLoi(null);
    try {
      await goiApi(`/lenh-dieu-xe/${lenhDieuXe.id}/huy`, {
        method: "POST",
        body: JSON.stringify({ lyDoHuy: lyDoHuy.trim() }),
      });
      await lamMoiDanhSach();
      dong(false);
    } catch (loiGoi) {
      setLoi(loiGoi instanceof LoiApi ? loiGoi.message : "Không thể hủy, vui lòng thử lại");
    } finally {
      setDangXuLy(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={dong}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hủy lệnh điều xe {lenhDieuXe.soHieu}?</AlertDialogTitle>
          <AlertDialogDescription>
            Số hiệu <strong className="text-foreground">{lenhDieuXe.soHieu}</strong> sẽ không được dùng
            lại. Thao tác này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="lyDoHuyLdx">Lý do hủy</Label>
          <Textarea
            id="lyDoHuyLdx"
            rows={2}
            value={lyDoHuy}
            onChange={(e) => setLyDoHuy(e.target.value)}
            placeholder="Vd: lập nhầm, đổi kế hoạch công tác..."
          />
        </div>

        {loi && <p className="text-sm text-destructive">{loi}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={dangXuLy}>Đóng</AlertDialogCancel>
          <AlertDialogAction disabled={dangXuLy} onClick={xacNhan}>
            {dangXuLy ? "Đang hủy..." : "Hủy chứng từ"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
