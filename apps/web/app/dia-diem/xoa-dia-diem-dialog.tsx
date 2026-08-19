"use client";

import { useState } from "react";
import { goiApi, LoiApi } from "@/lib/api";
import { useLamMoiDanhSachDiaDiem, type DiaDiem } from "@/hooks/use-danh-sach-dia-diem";
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

export type MucTieuXoaDiaDiem = { loai: "mot"; diaDiem: DiaDiem } | { loai: "nhieu"; ids: string[] };

export function XoaDiaDiemDialog({
  open,
  onOpenChange,
  muc,
  onXoaXong,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  muc: MucTieuXoaDiaDiem | null;
  onXoaXong?: () => void;
}) {
  const lamMoiDanhSach = useLamMoiDanhSachDiaDiem();
  const [dangXuLy, setDangXuLy] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  if (!muc) return null;

  async function xacNhan() {
    if (!muc) return;
    setDangXuLy(true);
    setLoi(null);
    try {
      if (muc.loai === "mot") {
        await goiApi(`/dia-diem/${muc.diaDiem.id}`, { method: "DELETE" });
      } else {
        await goiApi("/dia-diem/xoa-nhieu", {
          method: "POST",
          body: JSON.stringify({ ids: muc.ids }),
        });
      }
      await lamMoiDanhSach();
      onXoaXong?.();
      onOpenChange(false);
    } catch (loiGoi) {
      setLoi(loiGoi instanceof LoiApi ? loiGoi.message : "Không thể xóa, vui lòng thử lại");
    } finally {
      setDangXuLy(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {muc.loai === "mot" ? "Xóa địa điểm?" : `Xóa ${muc.ids.length} địa điểm đã chọn?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {muc.loai === "mot" ? (
              <>
                Địa điểm <strong className="text-foreground">{muc.diaDiem.tenDayDu}</strong> sẽ bị xóa
                khỏi danh mục. Thao tác này không thể hoàn tác — nếu không còn dùng nữa, cân nhắc dùng
                trạng thái "Ngừng dùng" thay vì xóa.
              </>
            ) : (
              <>
                {muc.ids.length} địa điểm đã chọn sẽ bị xóa khỏi danh mục. Thao tác này không thể hoàn
                tác.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {loi && <p className="text-sm text-destructive">{loi}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={dangXuLy}>Hủy</AlertDialogCancel>
          <AlertDialogAction disabled={dangXuLy} onClick={xacNhan}>
            {dangXuLy ? "Đang xóa..." : "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
