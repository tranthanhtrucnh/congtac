"use client";

import { useState, type MouseEvent } from "react";
import { goiApi, LoiApi } from "@/lib/api";
import { useLamMoiDanhSachLenhDieuCongTac, type LenhDieuCongTac } from "@/hooks/use-danh-sach-lenh-dieu-cong-tac";
import { useLamMoiDanhSachLenhDieuXe } from "@/hooks/use-danh-sach-lenh-dieu-xe";
import { useLamMoiDanhSachGiayDiDuong } from "@/hooks/use-danh-sach-giay-di-duong";
import { useLamMoiDanhSachSoCongLenh } from "@/hooks/use-danh-sach-so-cong-lenh";
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

export function HuyLenhDieuCongTacDialog({
  open,
  onOpenChange,
  lenhDieuCongTac,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lenhDieuCongTac: LenhDieuCongTac | null;
}) {
  const lamMoiDanhSach = useLamMoiDanhSachLenhDieuCongTac();
  // Huy LDCT cascade huy luon GDD + LDX lien ket (xem AlertDialogDescription
  // ngay duoi) - phai lam moi ca 3 danh sach nay. Xem giai thich day du o
  // sua-lenh-dieu-cong-tac-dialog.tsx va NHAT_KY_QUYET_DINH.md muc "GDD/LDX
  // khong cap nhat sau khi sua LDCT".
  const lamMoiLenhDieuXe = useLamMoiDanhSachLenhDieuXe();
  const lamMoiGiayDiDuong = useLamMoiDanhSachGiayDiDuong();
  const lamMoiSoCongLenh = useLamMoiDanhSachSoCongLenh();
  const [lyDoHuy, setLyDoHuy] = useState("");
  const [dangXuLy, setDangXuLy] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  if (!lenhDieuCongTac) return null;

  function dong(o: boolean) {
    onOpenChange(o);
    if (!o) {
      setLyDoHuy("");
      setLoi(null);
    }
  }

  async function xacNhan(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!lenhDieuCongTac) return;
    if (!lyDoHuy.trim()) {
      setLoi("Vui lòng nhập lý do hủy");
      return;
    }
    setDangXuLy(true);
    setLoi(null);
    try {
      await goiApi(`/lenh-dieu-cong-tac/${lenhDieuCongTac.id}/huy`, {
        method: "POST",
        body: JSON.stringify({ lyDoHuy: lyDoHuy.trim() }),
      });
      await Promise.all([lamMoiDanhSach(), lamMoiLenhDieuXe(), lamMoiGiayDiDuong(), lamMoiSoCongLenh()]);
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
          <AlertDialogTitle>Hủy lệnh điều công tác {lenhDieuCongTac.soHieu}?</AlertDialogTitle>
          <AlertDialogDescription>
            Toàn bộ công lệnh/giấy đi đường của từng thành viên và lệnh điều xe liên kết (nếu có) cũng sẽ bị
            hủy theo. Số hiệu đã cấp sẽ không được dùng lại. Thao tác này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="lyDoHuyLdct">Lý do hủy</Label>
          <Textarea
            id="lyDoHuyLdct"
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
            {dangXuLy ? "Đang hủy..." : "Hủy toàn bộ chứng từ"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
