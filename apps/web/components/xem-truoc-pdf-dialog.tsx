"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface XemTruocPdfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** URL PDF - null khi chua co gi de xem (dialog se khong hien iframe). */
  url: string | null;
  tieuDe: string;
}

function themThamSo(url: string, thamSo: string): string {
  return `${url}${url.includes("?") ? "&" : "?"}${thamSo}`;
}

/**
 * Hop thoai xem truoc PDF NGAY TRONG TRANG cho moi nut "Xem/In" chung tu
 * (LDCT/LDX/GDD) - thay cho window.open(url, "_blank") truoc day nhay sang
 * tab moi, nguoi dung phan anh bat tien (2026-08-17). PDF van sinh o backend
 * qua headless browser nhu cu (CLAUDE.md quy tac #2) - dialog nay chi NHUNG
 * file PDF da sinh san vao iframe de xem, In thuc hien qua nut in co san
 * tren thanh cong cu trinh xem PDF cua trinh duyet (khong goi window.print()).
 * Van co nut "Mo tab moi" du phong cho truong hop trinh duyet chan xem PDF
 * nhung (hiem, hau het Chrome/Edge/Firefox deu ho tro san).
 *
 * Nut "Cỡ chữ" (Ruler) - CHE DO DEV: chuyen iframe sang xem HTML that (them
 * ?xemHtml=1 vao URL) thay vi PDF, cho hien box theo doi chuot voi font-size
 * cua phan tu dang tro toi - dung khi chinh CSS mau in ma khong biet dang la
 * size may (2026-08-17, nguoi dung yeu cau). Xem chenCongCuXemPhongChu() o
 * apps/api/src/common/mau-in/mau-in-dung-chung.ts.
 */
export function XemTruocPdfDialog({ open, onOpenChange, url, tieuDe }: XemTruocPdfDialogProps) {
  const [dangTai, setDangTai] = useState(true);
  const [xemPhongChu, setXemPhongChu] = useState(false);

  useEffect(() => {
    if (!open) {
      setDangTai(true);
      setXemPhongChu(false);
    }
  }, [open]);

  const urlThucTe = url ? (xemPhongChu ? themThamSo(url, "xemHtml=1") : url) : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setDangTai(true);
          setXemPhongChu(false);
        }
      }}
    >
      <DialogContent className="flex h-[90vh] max-w-4xl flex-col gap-0 p-0">
        {/* pr-12 (thay vi px-4 deu 2 ben) - DialogContent dung p-0 nen nut
            dong "X" mac dinh cua Dialog (absolute right-4 top-4, xem
            components/ui/dialog.tsx) nam ngay canh phai/tren CUA CA HOP
            THOAI, chong len nhom nut Ruler/ExternalLink o day vi ca 2 cung
            bi day sat canh phai qua justify-between - danh du khoang trong
            48px de nhom nut khong con de duoi vung bam cua nut X (nguoi
            dung phan hoi kem anh chup 2026-08-17, xem NHAT_KY_QUYET_DINH.md). */}
        <DialogHeader className="flex-row items-center justify-between gap-2 border-b border-border py-3 pl-4 pr-12 text-left">
          <DialogTitle className="truncate pr-6 text-base">{tieuDe}</DialogTitle>
          <div className="flex items-center gap-1">
            {url && (
              <Button
                variant={xemPhongChu ? "default" : "ghost"}
                size="icon"
                aria-label="Xem cỡ chữ (chế độ kiểm tra font-size, không phải bản in thật)"
                title="Xem cỡ chữ (chế độ kiểm tra font-size, không phải bản in thật)"
                onClick={() => {
                  setDangTai(true);
                  setXemPhongChu((truoc) => !truoc);
                }}
              >
                <Ruler className="size-4" />
              </Button>
            )}
            {urlThucTe && (
              <Button variant="ghost" size="icon" aria-label="Mở ở tab mới" title="Mở ở tab mới" asChild>
                <a href={urlThucTe} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            )}
          </div>
        </DialogHeader>
        <div className="relative flex-1 bg-muted/30">
          {dangTai && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {urlThucTe && (
            <iframe
              key={urlThucTe}
              src={urlThucTe}
              title={tieuDe}
              className="size-full border-0"
              onLoad={() => setDangTai(false)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
