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
 *
 * Xac nhan: go chu "Y" (khong phan biet hoa/thuong) - doi 2026-08-28 tu ban
 * cu bat go LAI DUNG so hieu chung tu day du, vi nguoi dung phan hoi khong
 * xoa duoc (rat co the do chuoi so hieu dinh dang phuc tap kho go khop tuyet
 * doi). Xem NHAT_KY_QUYET_DINH.md.
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
  const [xacNhanXoa, setXacNhanXoa] = useState("");
  const [dangXuLy, setDangXuLy] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  if (!lenhDieuCongTac) return null;

  // Xac nhan go chu "Y" (khong phan biet hoa/thuong) - doi 2026-08-28 tu ban
  // cu "go lai dung so hieu chung tu" (nguoi dung phan hoi khong xoa duoc,
  // rat co the do chuoi so hieu that co dinh dang phuc tap (dau /, chu viet
  // tat, vd "459/LĐCT-XSKT") de go sai/khong khop tuyet doi). Van giu duoc
  // muc dich "phai chu dong go them 1 buoc rieng" de tranh bam nham nut Xoa
  // (khac voi cac dialog xac nhan thuong chi can 1 click), chi don gian hoa
  // NOI DUNG can go. Xem NHAT_KY_QUYET_DINH.md.
  const daXacNhanDung = xacNhanXoa.trim().toUpperCase() === "Y";

  function dong(o: boolean) {
    onOpenChange(o);
    if (!o) {
      setXacNhanXoa("");
      setLoi(null);
    }
  }

  async function xacNhan(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!lenhDieuCongTac) return;
    if (!daXacNhanDung) {
      setLoi('Vui lòng gõ chữ "Y" để xác nhận đồng ý xóa');
      return;
    }
    setDangXuLy(true);
    setLoi(null);
    try {
      await goiApi(`/lenh-dieu-cong-tac/${lenhDieuCongTac.id}`, {
        method: "DELETE",
        body: JSON.stringify({ xacNhanXoa: xacNhanXoa.trim() }),
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

        {/* Canh bao lo hong day so - hien khi cong lenh/lenh dieu xe cua LDCT
            nay KHONG phai so moi nhat cua day tuong ung (coCanhBaoKhoangTrong,
            server tinh san o danhSach()) - tu 2026-08-28 xoa cung KHONG con bi
            chan boi dieu kien nay nua (nguoi dung yeu cau noi long), nhung van
            can bao truoc de nguoi dung biet so cong lenh/lenh dieu xe cua
            chung tu nay se KHONG lui bo dem duoc, de lai 1 lo hong vinh vien
            trong day so. Xem NHAT_KY_QUYET_DINH.md muc "Noi long dieu kien Xoa
            cung LDCT - 2026-08-28". */}
        {lenhDieuCongTac.coCanhBaoKhoangTrong && (
          <div className="flex gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            <AlertTriangle className="size-4 shrink-0 translate-y-0.5" />
            <p>
              Công lệnh hoặc lệnh điều xe của lệnh này không phải là số mới nhất trong dãy (có thể do đã sửa một
              lệnh điều công tác khác để thêm thành viên). Xóa vẫn được, nhưng số công lệnh/lệnh điều xe của lệnh
              này sẽ để lại một khoảng trống vĩnh viễn trong dãy số, không lùi được bộ đếm về số này.
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="xacNhanXoaLdct">
            Gõ chữ <span className="font-mono font-semibold text-foreground">Y</span> để xác nhận đồng ý xóa
          </Label>
          <Input
            id="xacNhanXoaLdct"
            value={xacNhanXoa}
            onChange={(e) => setXacNhanXoa(e.target.value)}
            placeholder="Y"
            autoComplete="off"
            className="w-20"
          />
        </div>

        {loi && <p className="text-sm text-destructive">{loi}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={dangXuLy}>Đóng</AlertDialogCancel>
          <AlertDialogAction
            disabled={dangXuLy || !daXacNhanDung}
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
