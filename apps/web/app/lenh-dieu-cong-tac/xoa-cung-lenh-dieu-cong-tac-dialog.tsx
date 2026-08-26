"use client";

import { useState, type MouseEvent } from "react";
import { AlertTriangle } from "lucide-react";
import { goiApi, LoiApi } from "@/lib/api";
import { useLamMoiDanhSachLenhDieuCongTac, type LenhDieuCongTac } from "@/hooks/use-danh-sach-lenh-dieu-cong-tac";
import { useLamMoiDanhSachLenhDieuXe } from "@/hooks/use-danh-sach-lenh-dieu-xe";
import { useLamMoiDanhSachGiayDiDuong } from "@/hooks/use-danh-sach-giay-di-duong";
import { useLamMoiDanhSachSoCongLenh } from "@/hooks/use-danh-sach-so-cong-lenh";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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

/**
 * Xoa CUNG (mat han khoi CSDL, khac Huy) - chi hien nut nay o trang danh
 * sach khi lenh dang la SO MOI NHAT (laSoMoiNhat, xem
 * use-danh-sach-lenh-dieu-cong-tac.ts) - server van tu kiem tra lai dieu
 * kien nay (khong tin rieng frontend, dung CLAUDE.md quy tac TUYET DOI #3).
 * Ban DON GIAN HOA 2026-08-20: xoa xong bo dem TU DONG lui ve dung so con
 * lai, chung tu lap TIEP THEO se tu nhien nhan lai dung so nay - khong con
 * man hinh "Dung so trong" chon thu cong nhu ban dau. Xem
 * NHAT_KY_QUYET_DINH.md muc "Xoa cung chung tu - don gian hoa 2026-08-20".
 */
export function XoaCungLenhDieuCongTacDialog({
  open,
  onOpenChange,
  lenhDieuCongTac,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lenhDieuCongTac: LenhDieuCongTac | null;
}) {
  const lamMoiDanhSach = useLamMoiDanhSachLenhDieuCongTac();
  const lamMoiLenhDieuXe = useLamMoiDanhSachLenhDieuXe();
  const lamMoiGiayDiDuong = useLamMoiDanhSachGiayDiDuong();
  const lamMoiSoCongLenh = useLamMoiDanhSachSoCongLenh();
  const [xacNhanSoHieu, setXacNhanSoHieu] = useState("");
  const [dangXuLy, setDangXuLy] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  if (!lenhDieuCongTac) return null;

  function dong(o: boolean) {
    onOpenChange(o);
    if (!o) {
      setXacNhanSoHieu("");
      setLoi(null);
    }
  }

  async function xacNhan(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!lenhDieuCongTac) return;
    if (xacNhanSoHieu.trim() !== lenhDieuCongTac.soHieu) {
      setLoi("Số hiệu gõ vào chưa khớp - vui lòng gõ lại đúng số hiệu chứng từ để xác nhận");
      return;
    }
    setDangXuLy(true);
    setLoi(null);
    try {
      await goiApi(`/lenh-dieu-cong-tac/${lenhDieuCongTac.id}`, {
        method: "DELETE",
        body: JSON.stringify({ xacNhanSoHieu: xacNhanSoHieu.trim() }),
      });
      await Promise.all([lamMoiDanhSach(), lamMoiLenhDieuXe(), lamMoiGiayDiDuong(), lamMoiSoCongLenh()]);
      dong(false);
    } catch (loiGoi) {
      setLoi(loiGoi instanceof LoiApi ? loiGoi.message : "Không thể xóa, vui lòng thử lại");
    } finally {
      setDangXuLy(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={dong}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5 shrink-0" />
            Xóa cứng lệnh điều công tác {lenhDieuCongTac.soHieu}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Khác với Hủy: thao tác này XÓA HẲN lệnh điều công tác này khỏi hệ thống, cùng toàn bộ công lệnh/giấy
            đi đường của từng thành viên và lệnh điều xe liên kết (nếu có) — không xem lại được nữa. Vì đây đang
            là số mới nhất, số hiệu sẽ tự động được cấp lại cho chứng từ lập tiếp theo. Không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="xacNhanSoHieuXoaLdct">
            Gõ lại số hiệu <span className="font-mono font-semibold text-foreground">{lenhDieuCongTac.soHieu}</span>{" "}
            để xác nhận
          </Label>
          <Input
            id="xacNhanSoHieuXoaLdct"
            value={xacNhanSoHieu}
            onChange={(e) => setXacNhanSoHieu(e.target.value)}
            placeholder={lenhDieuCongTac.soHieu}
            autoComplete="off"
          />
        </div>

        {loi && <p className="text-sm text-destructive">{loi}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={dangXuLy}>Đóng</AlertDialogCancel>
          <AlertDialogAction
            disabled={dangXuLy || xacNhanSoHieu.trim() !== lenhDieuCongTac.soHieu}
            onClick={xacNhan}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {dangXuLy ? "Đang xóa..." : "Xóa cứng toàn bộ chứng từ"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
