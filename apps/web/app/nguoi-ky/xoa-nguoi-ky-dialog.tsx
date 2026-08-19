"use client";

import { useState } from "react";
import { goiApi, LoiApi } from "@/lib/api";
import { useLamMoiDanhSachNguoiKy, type NguoiKy } from "@/hooks/use-danh-sach-nguoi-ky";
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

export function XoaNguoiKyDialog({
  open,
  onOpenChange,
  nguoiKy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nguoiKy: NguoiKy | null;
}) {
  const lamMoiDanhSach = useLamMoiDanhSachNguoiKy();
  const [dangXuLy, setDangXuLy] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  if (!nguoiKy) return null;

  async function xacNhan() {
    if (!nguoiKy) return;
    setDangXuLy(true);
    setLoi(null);
    try {
      await goiApi(`/nguoi-ky/${nguoiKy.id}`, { method: "DELETE" });
      await lamMoiDanhSach();
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
          <AlertDialogTitle>Xóa người ký?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong className="text-foreground">{nguoiKy.nhanVien.hoTen}</strong> sẽ bị xóa khỏi danh mục
            người ký. Thao tác này không thể hoàn tác — nếu chỉ tạm không dùng, cân nhắc đổi trạng thái
            "Ngừng sử dụng" thay vì xóa.
            {nguoiKy.trangThai === "DANG_KY_CHINH_THUC" && (
              <p className="mt-2 font-medium text-destructive">
                Người này đang là người ký chính thức — hãy đặt người khác làm chính thức trước khi xóa.
              </p>
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
