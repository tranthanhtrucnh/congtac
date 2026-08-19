"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { goiApi, LoiApi } from "@/lib/api";
import { useLamMoiDanhSachNguoiDung } from "@/hooks/use-danh-sach-nguoi-dung";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface KetQuaDatLai {
  tenDangNhap: string;
  matKhauTam: string;
}

/**
 * Quan tri dat lai mat khau cho nguoi khac - KHONG cho tu chon mat khau moi
 * (tranh dat mat khau yeu), luon sinh mat khau tam ngau nhien va bat buoc
 * doi ngay lan dang nhap ke tiep, giong het luong tao tai khoan.
 */
export function DatLaiMatKhauDialog({
  open,
  onOpenChange,
  nguoiDung,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nguoiDung: { id: string; hoTen: string; tenDangNhap: string } | null;
}) {
  const lamMoiDanhSach = useLamMoiDanhSachNguoiDung();
  const [dangXuLy, setDangXuLy] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const [ketQua, setKetQua] = useState<KetQuaDatLai | null>(null);

  if (!nguoiDung) return null;

  async function xacNhan() {
    if (!nguoiDung) return;
    setDangXuLy(true);
    setLoi(null);
    try {
      const res = await goiApi<{ matKhauTam: string }>(
        `/nguoi-dung/${nguoiDung.id}/dat-lai-mat-khau`,
        { method: "POST" },
      );
      setKetQua({ tenDangNhap: nguoiDung.tenDangNhap, matKhauTam: res.matKhauTam });
      await lamMoiDanhSach();
    } catch (loiGoi) {
      setLoi(loiGoi instanceof LoiApi ? loiGoi.message : "Không thể đặt lại mật khẩu, vui lòng thử lại");
    } finally {
      setDangXuLy(false);
    }
  }

  function dong() {
    onOpenChange(false);
    setKetQua(null);
    setLoi(null);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : dong())}>
      <DialogContent>
        {ketQua ? (
          <>
            <DialogHeader>
              <DialogTitle>Đã đặt lại mật khẩu</DialogTitle>
              <DialogDescription>
                Ghi lại mật khẩu tạm bên dưới và gửi cho người dùng — mật khẩu này chỉ hiển thị
                một lần. Các phiên đăng nhập trước đó của tài khoản này đã bị thu hồi, và người
                dùng sẽ phải đổi mật khẩu ngay lần đăng nhập kế tiếp.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 rounded-md border border-border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Tên đăng nhập</p>
              <p className="font-mono text-sm font-medium text-foreground">{ketQua.tenDangNhap}</p>
              <p className="pt-2 text-sm text-muted-foreground">Mật khẩu tạm</p>
              <p className="font-mono text-base font-semibold text-foreground">{ketQua.matKhauTam}</p>
            </div>
            <DialogFooter>
              <Button type="button" onClick={dong}>
                Đã lưu, đóng
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Đặt lại mật khẩu?</DialogTitle>
              <DialogDescription>
                Hệ thống sẽ sinh một mật khẩu tạm mới cho{" "}
                <strong className="text-foreground">{nguoiDung.hoTen}</strong> ({nguoiDung.tenDangNhap}
                ). Mật khẩu cũ sẽ không còn dùng được, các phiên đăng nhập hiện tại của tài khoản
                này cũng bị thu hồi ngay.
              </DialogDescription>
            </DialogHeader>
            {loi && (
              <div role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {loi}
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={dong} disabled={dangXuLy}>
                Hủy
              </Button>
              <Button type="button" onClick={xacNhan} disabled={dangXuLy}>
                <KeyRound />
                {dangXuLy ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
