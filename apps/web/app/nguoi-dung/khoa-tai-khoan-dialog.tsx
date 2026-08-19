"use client";

import { useState } from "react";
import { goiApi, LoiApi } from "@/lib/api";
import { useLamMoiDanhSachNguoiDung } from "@/hooks/use-danh-sach-nguoi-dung";
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

export function KhoaTaiKhoanDialog({
  open,
  onOpenChange,
  nguoiDung,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nguoiDung: { id: string; hoTen: string; tenDangNhap: string; trangThai: "HOAT_DONG" | "KHOA" } | null;
}) {
  const lamMoiDanhSach = useLamMoiDanhSachNguoiDung();
  const [dangXuLy, setDangXuLy] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  if (!nguoiDung) return null;
  const dangKhoa = nguoiDung.trangThai === "HOAT_DONG"; // hanh dong sap thuc hien la khoa

  async function xacNhan() {
    if (!nguoiDung) return;
    setDangXuLy(true);
    setLoi(null);
    try {
      await goiApi(`/nguoi-dung/${nguoiDung.id}/${dangKhoa ? "khoa" : "mo-khoa"}`, {
        method: "PATCH",
      });
      await lamMoiDanhSach();
      onOpenChange(false);
    } catch (loiGoi) {
      setLoi(loiGoi instanceof LoiApi ? loiGoi.message : "Không thể thực hiện, vui lòng thử lại");
    } finally {
      setDangXuLy(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dangKhoa ? "Khóa tài khoản?" : "Mở khóa tài khoản?"}</AlertDialogTitle>
          <AlertDialogDescription>
            {dangKhoa ? (
              <>
                Tài khoản <strong className="text-foreground">{nguoiDung.hoTen}</strong> (
                {nguoiDung.tenDangNhap}) sẽ không thể đăng nhập cho đến khi được mở khóa lại. Các
                phiên đăng nhập hiện tại của tài khoản này cũng bị thu hồi ngay.
              </>
            ) : (
              <>
                Tài khoản <strong className="text-foreground">{nguoiDung.hoTen}</strong> (
                {nguoiDung.tenDangNhap}) sẽ đăng nhập lại được bình thường.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {loi && <p className="text-sm text-destructive">{loi}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={dangXuLy}>Hủy</AlertDialogCancel>
          <AlertDialogAction disabled={dangXuLy} onClick={xacNhan}>
            {dangXuLy ? "Đang xử lý..." : dangKhoa ? "Khóa tài khoản" : "Mở khóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
