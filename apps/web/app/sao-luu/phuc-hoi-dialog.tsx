"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Upload } from "lucide-react";
import { LoiApi } from "@/lib/api";
import { useChayPhucHoi } from "@/hooks/use-sao-luu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Chon file .sql tu may nguoi dung, roi canh bao 1 lan nua qua AlertDialog
 * truoc khi ghi de toan bo du lieu hien tai - KHONG con bat go lai ten file
 * (bo theo yeu cau nguoi dung 2026-08-14), thay bang hop thoai xac nhan
 * riêng. Backend van yeu cau field xacNhan khop ten file (khong doi) - frontend
 * tu dien gia tri nay khi nguoi dung bam Xac nhan trong AlertDialog, khong
 * can nguoi dung tu go. Xem docs/superpowers/specs/
 * 2026-08-14-sao-luu-phuc-hoi-du-lieu-design.md muc 7. */
export function PhucHoiDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [moCanhBao, setMoCanhBao] = useState(false);
  const phucHoi = useChayPhucHoi();

  function dongVaReset(o: boolean) {
    onOpenChange(o);
    if (!o) {
      setFile(null);
      setMoCanhBao(false);
      phucHoi.reset();
    }
  }

  async function guiPhucHoi() {
    if (!file) return;
    setMoCanhBao(false);
    try {
      await phucHoi.mutateAsync({ file, xacNhan: file.name });
      dongVaReset(false);
    } catch {
      // Loi da duoc luu trong phucHoi.error, hien ben duoi form - khong dong dialog.
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={dongVaReset}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Phục hồi dữ liệu</DialogTitle>
            <DialogDescription>
              Thao tác này GHI ĐÈ TOÀN BỘ dữ liệu hiện tại bằng nội dung trong file sao lưu đã chọn — không thể
              hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>Chỉ phục hồi khi thật sự chắc chắn. Sau khi xong, ứng dụng sẽ tự thoát và cần khởi động lại.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="filePhucHoi">File sao lưu (.sql)</Label>
            <Input
              id="filePhucHoi"
              type="file"
              accept=".sql"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {phucHoi.error && (
            <p className="text-sm text-destructive">
              {phucHoi.error instanceof LoiApi ? phucHoi.error.message : "Có lỗi xảy ra, vui lòng thử lại"}
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => dongVaReset(false)} disabled={phucHoi.isPending}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => setMoCanhBao(true)}
              disabled={!file || phucHoi.isPending}
            >
              {phucHoi.isPending ? <Loader2 className="animate-spin" /> : <Upload />}
              Phục hồi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={moCanhBao} onOpenChange={setMoCanhBao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận phục hồi dữ liệu</AlertDialogTitle>
            <AlertDialogDescription>
              Sắp ghi đè TOÀN BỘ dữ liệu hiện tại bằng file{" "}
              <span className="font-mono text-foreground">{file?.name}</span>. Thao tác này không thể hoàn
              tác — dữ liệu hiện tại sẽ mất hoàn toàn nếu không có bản sao lưu khác. Bạn có chắc chắn không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={guiPhucHoi}>Phục hồi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
