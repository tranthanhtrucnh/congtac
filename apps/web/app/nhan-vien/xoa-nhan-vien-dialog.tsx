"use client";

import { useState } from "react";
import { goiApi, LoiApi } from "@/lib/api";
import { useLamMoiDanhSachNhanVien, type NhanVien } from "@/hooks/use-danh-sach-nhan-vien";
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

export type MucTieuXoa = { loai: "mot"; nhanVien: NhanVien } | { loai: "nhieu"; ids: string[] };

export function XoaNhanVienDialog({
  open,
  onOpenChange,
  muc,
  onXoaXong,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  muc: MucTieuXoa | null;
  /** Goi sau khi xoa nhieu thanh cong - dung de bo chon cac dong da xoa. */
  onXoaXong?: () => void;
}) {
  const lamMoiDanhSach = useLamMoiDanhSachNhanVien();
  const [dangXuLy, setDangXuLy] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  if (!muc) return null;

  async function xacNhan() {
    if (!muc) return;
    setDangXuLy(true);
    setLoi(null);
    try {
      if (muc.loai === "mot") {
        await goiApi(`/nhan-vien/${muc.nhanVien.id}`, { method: "DELETE" });
      } else {
        await goiApi("/nhan-vien/xoa-nhieu", {
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
            {muc.loai === "mot" ? "Xóa nhân viên?" : `Xóa ${muc.ids.length} nhân viên đã chọn?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {muc.loai === "mot" ? (
              <>
                Nhân viên <strong className="text-foreground">{muc.nhanVien.hoTen}</strong> (
                {muc.nhanVien.cccd}) sẽ bị xóa khỏi danh mục. Thao tác này không thể hoàn tác — nếu
                nhân viên đã nghỉ việc, cân nhắc dùng trạng thái "Ngừng làm việc" thay vì xóa.
              </>
            ) : (
              <>
                {muc.ids.length} nhân viên đã chọn sẽ bị xóa khỏi danh mục. Thao tác này không thể
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
