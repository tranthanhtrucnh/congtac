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

export function DatChinhThucDialog({
  open,
  onOpenChange,
  nguoiKy,
  nguoiDangChinhThuc,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nguoiKy: NguoiKy | null;
  /** Nguoi dang giu trang thai chinh thuc hien tai (neu co) - chi de hien thi trong loi nhac. */
  nguoiDangChinhThuc?: NguoiKy | null;
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
      await goiApi(`/nguoi-ky/${nguoiKy.id}/dat-chinh-thuc`, { method: "POST" });
      await lamMoiDanhSach();
      onOpenChange(false);
    } catch (loiGoi) {
      setLoi(loiGoi instanceof LoiApi ? loiGoi.message : "Không thể đổi, vui lòng thử lại");
    } finally {
      setDangXuLy(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Đặt làm người ký chính thức?</AlertDialogTitle>
          <AlertDialogDescription>
            Từ lúc này, các chứng từ tạo mới (LĐCT/GĐĐ/LĐX) sẽ dùng{" "}
            <strong className="text-foreground">{nguoiKy.nhanVien.hoTen}</strong> ({nguoiKy.chucDanhKy}) làm
            người ký.
            {nguoiDangChinhThuc && nguoiDangChinhThuc.id !== nguoiKy.id && (
              <>
                {" "}
                <strong className="text-foreground">{nguoiDangChinhThuc.nhanVien.hoTen}</strong> sẽ tự
                chuyển sang trạng thái Dự phòng.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {loi && <p className="text-sm text-destructive">{loi}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={dangXuLy}>Hủy</AlertDialogCancel>
          <AlertDialogAction disabled={dangXuLy} onClick={xacNhan}>
            {dangXuLy ? "Đang xử lý..." : "Đặt làm chính thức"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
