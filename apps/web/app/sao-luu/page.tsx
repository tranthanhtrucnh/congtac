"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, DatabaseBackup, Download, Loader2, Upload, XCircle } from "lucide-react";
import { LoiApi } from "@/lib/api";
import { useChaySaoLuu, useTienTrinhSaoLuu, taiXuongSaoLuu } from "@/hooks/use-sao-luu";
import { Button } from "@/components/ui/button";
import { PhucHoiDialog } from "./phuc-hoi-dialog";

function nhanLoaiCongViec(loai: "sao-luu" | "phuc-hoi" | null) {
  if (loai === "sao-luu") return "Đang sao lưu";
  if (loai === "phuc-hoi") return "Đang phục hồi";
  return "Đang xử lý";
}

// Sao luu / phuc hoi du lieu - chi Quan tri he thong (quyen sao-luu.quan-ly).
// Khong luu danh sach ban sao luu trong app - sao luu la TAI FILE XUONG may
// nguoi dung, phuc hoi la CHON FILE tu may nguoi dung roi tai len - xem
// docs/superpowers/specs/2026-08-14-sao-luu-phuc-hoi-du-lieu-design.md.
export default function TrangSaoLuu() {
  const { data: tienTrinh } = useTienTrinhSaoLuu();
  const chaySaoLuu = useChaySaoLuu();
  const [moDialogPhucHoi, setMoDialogPhucHoi] = useState(false);
  const [daTuTaiXuong, setDaTuTaiXuong] = useState(false);

  const dangChay = tienTrinh?.dangChay ?? false;
  const sanSangTai = tienTrinh?.sanSangTai ?? false;

  // Tu dong kich hoat tai file xuong ngay khi sao luu vua xong (khong can
  // nguoi dung bam them 1 lan nua) - chi kich 1 lan cho moi ban sao luu.
  useEffect(() => {
    if (sanSangTai && !daTuTaiXuong) {
      taiXuongSaoLuu();
      setDaTuTaiXuong(true);
    }
    if (!sanSangTai && daTuTaiXuong) {
      setDaTuTaiXuong(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sanSangTai]);

  const phanTramTienTrinh =
    tienTrinh && tienTrinh.tong > 0 ? Math.round((tienTrinh.daXong / tienTrinh.tong) * 100) : 0;

  async function bamSaoLuu() {
    setDaTuTaiXuong(false);
    try {
      await chaySaoLuu.mutateAsync();
    } catch {
      // Loi hien qua chaySaoLuu.error ben duoi.
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Sao lưu & phục hồi</h1>
        <p className="text-sm text-muted-foreground">
          Sao lưu tải file dữ liệu về máy đang dùng. Phục hồi ghi đè toàn bộ dữ liệu hiện tại bằng 1 file đã
          sao lưu trước đó.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="mb-3 flex items-center gap-2">
            <DatabaseBackup className="size-5 text-primary" />
            <h2 className="font-medium text-foreground">Sao lưu</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Tạo file .sql chứa toàn bộ dữ liệu hiện tại và tự tải xuống máy đang dùng.
          </p>
          <Button onClick={bamSaoLuu} disabled={dangChay || chaySaoLuu.isPending} className="w-full">
            {dangChay && tienTrinh?.loaiCongViec === "sao-luu" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Download />
            )}
            Sao lưu
          </Button>
          {chaySaoLuu.error && (
            <p className="mt-2 text-sm text-destructive">
              {chaySaoLuu.error instanceof LoiApi ? chaySaoLuu.error.message : "Có lỗi xảy ra"}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-background p-4">
          <div className="mb-3 flex items-center gap-2">
            <Upload className="size-5 text-primary" />
            <h2 className="font-medium text-foreground">Phục hồi</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Chọn 1 file .sql đã sao lưu trước đó từ máy đang dùng để ghi đè dữ liệu hiện tại.
          </p>
          <Button
            variant="destructive"
            onClick={() => setMoDialogPhucHoi(true)}
            disabled={dangChay}
            className="w-full"
          >
            <Upload />
            Phục hồi
          </Button>
        </div>
      </div>

      {dangChay && tienTrinh && (
        <div className="mt-4 rounded-lg border border-border bg-background p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-foreground">
              <Loader2 className="size-4 animate-spin" />
              {nhanLoaiCongViec(tienTrinh.loaiCongViec)}...
            </span>
            <span className="text-muted-foreground">
              {tienTrinh.tong > 0 ? `${tienTrinh.daXong}/${tienTrinh.tong} bảng (${phanTramTienTrinh}%)` : "Đang chuẩn bị..."}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${phanTramTienTrinh}%` }}
            />
          </div>
        </div>
      )}

      {!dangChay && tienTrinh?.loi && (
        <div className="mt-4 flex gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <XCircle className="mt-0.5 size-4 shrink-0" />
          <p>{tienTrinh.loi}</p>
        </div>
      )}

      {!dangChay && !tienTrinh?.loi && tienTrinh?.thongBaoHoanTat && (
        <div className="mt-4 flex gap-2 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <p>{tienTrinh.thongBaoHoanTat}</p>
        </div>
      )}

      <PhucHoiDialog open={moDialogPhucHoi} onOpenChange={setMoDialogPhucHoi} />
    </div>
  );
}
