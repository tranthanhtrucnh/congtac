"use client";

import { useState } from "react";
import { goiApi, LoiApi } from "@/lib/api";
import { useLamMoiDanhSachPhuongTien, type PhuongTien } from "@/hooks/use-danh-sach-phuong-tien";
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

export type MucTieuXoaPhuongTien =
  | { loai: "mot"; phuongTien: PhuongTien }
  | { loai: "nhieu"; ids: string[] };

export function XoaPhuongTienDialog({
  open,
  onOpenChange,
  muc,
  onXoaXong,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  muc: MucTieuXoaPhuongTien | null;
  onXoaXong?: () => void;
}) {
  const lamMoiDanhSach = useLamMoiDanhSachPhuongTien();
  const [dangXuLy, setDangXuLy] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  if (!muc) return null;

  async function xacNhan() {
    if (!muc) return;
    setDangXuLy(true);
    setLoi(null);
    try {
      if (muc.loai === "mot") {
        await goiApi(`/phuong-tien/${muc.phuongTien.id}`, { method: "DELETE" });
      } else {
        await goiApi("/phuong-tien/xoa-nhieu", {
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
            {muc.loai === "mot" ? "Xóa phương tiện?" : `Xóa ${muc.ids.length} phương tiện đã chọn?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {muc.loai === "mot" ? (
              <>
                Phương tiện biển số{" "}
                <strong className="text-foreground">{muc.phuongTien.bienSo}</strong> sẽ bị xóa khỏi
                danh mục. Thao tác này không thể hoàn tác — nếu xe ngừng hoạt động, cân nhắc dùng
                trạng thái "Ngừng sử dụng" thay vì xóa.
              </>
            ) : (
              <>
                {muc.ids.length} phương tiện đã chọn sẽ bị xóa khỏi danh mục. Thao tác này không thể
                hoàn tác.
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
