"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Minus, Plus, RotateCcw, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface XemTruocPdfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** URL PDF - null khi chua co gi de xem (dialog se khong hien iframe). */
  url: string | null;
  tieuDe: string;
}

const KHOA_LUU_CHIEU_CAO_HANG = "congtac_gdd_chieu_cao_hang_mm";
const CHIEU_CAO_HANG_KHOI_TAO = 17;
const CHIEU_CAO_TOI_THIEU = 9;
const CHIEU_CAO_TOI_DA = 30;

const KHOA_LUU_CO_CHU = "congtac_gdd_co_chu_pt";
const CO_CHU_MAC_DINH = 9;
const CO_CHU_TOI_THIEU = 7;
const CO_CHU_TOI_DA = 14;

function capNhatThamSoUrl(url: string, param: string, value: string | number | null | undefined): string {
  const [base, query] = url.split("?");
  const searchParams = new URLSearchParams(query || "");
  if (value === null || value === undefined || value === "") {
    searchParams.delete(param);
  } else {
    searchParams.set(param, String(value));
  }
  const qStr = searchParams.toString();
  return qStr ? `${base}?${qStr}` : base;
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
  const [chieuCaoHang, setChieuCaoHang] = useState<number | null>(null);
  const [coChu, setCoChu] = useState<number | null>(null);

  const laCongLenh = Boolean(
    url &&
      (url.includes("/giay-di-duong/") ||
        url.includes("/pdf-giay-di-duong") ||
        tieuDe.toLowerCase().includes("công lệnh") ||
        tieuDe.toLowerCase().includes("giấy đi đường")),
  );

  useEffect(() => {
    if (open) {
      try {
        const luuCao = localStorage.getItem(KHOA_LUU_CHIEU_CAO_HANG);
        if (luuCao) {
          const so = parseInt(luuCao, 10);
          if (!isNaN(so) && so >= CHIEU_CAO_TOI_THIEU && so <= CHIEU_CAO_TOI_DA) {
            setChieuCaoHang(so);
          } else {
            setChieuCaoHang(null);
          }
        } else {
          setChieuCaoHang(null);
        }

        const luuChu = localStorage.getItem(KHOA_LUU_CO_CHU);
        if (luuChu) {
          const so = parseFloat(luuChu);
          if (!isNaN(so) && so >= CO_CHU_TOI_THIEU && so <= CO_CHU_TOI_DA) {
            setCoChu(so);
          } else {
            setCoChu(null);
          }
        } else {
          setCoChu(null);
        }
      } catch {
        setChieuCaoHang(null);
        setCoChu(null);
      }
    } else {
      setDangTai(true);
      setXemPhongChu(false);
    }
  }, [open]);

  function thayDoiChieuCaoHang(delta: number) {
    const hienTai = chieuCaoHang ?? CHIEU_CAO_HANG_KHOI_TAO;
    const moi = Math.max(CHIEU_CAO_TOI_THIEU, Math.min(CHIEU_CAO_TOI_DA, hienTai + delta));
    setChieuCaoHang(moi);
    try {
      localStorage.setItem(KHOA_LUU_CHIEU_CAO_HANG, String(moi));
    } catch {}
    setDangTai(true);
  }

  function datLaiChieuCaoHang() {
    setChieuCaoHang(null);
    try {
      localStorage.removeItem(KHOA_LUU_CHIEU_CAO_HANG);
    } catch {}
    setDangTai(true);
  }

  function thayDoiCoChu(delta: number) {
    const hienTai = coChu ?? CO_CHU_MAC_DINH;
    const moi = Math.round(Math.max(CO_CHU_TOI_THIEU, Math.min(CO_CHU_TOI_DA, hienTai + delta)) * 10) / 10;
    setCoChu(moi);
    try {
      localStorage.setItem(KHOA_LUU_CO_CHU, String(moi));
    } catch {}
    setDangTai(true);
  }

  function datLaiCoChu() {
    setCoChu(null);
    try {
      localStorage.removeItem(KHOA_LUU_CO_CHU);
    } catch {}
    setDangTai(true);
  }

  let urlThucTe = url;
  if (urlThucTe) {
    if (xemPhongChu) {
      urlThucTe = capNhatThamSoUrl(urlThucTe, "xemHtml", "1");
    } else {
      urlThucTe = capNhatThamSoUrl(urlThucTe, "xemHtml", null);
    }
    if (laCongLenh && chieuCaoHang !== null) {
      urlThucTe = capNhatThamSoUrl(urlThucTe, "chieuCaoHang", chieuCaoHang);
    } else {
      urlThucTe = capNhatThamSoUrl(urlThucTe, "chieuCaoHang", null);
    }
    if (laCongLenh && coChu !== null) {
      urlThucTe = capNhatThamSoUrl(urlThucTe, "coChu", coChu);
    } else {
      urlThucTe = capNhatThamSoUrl(urlThucTe, "coChu", null);
    }
  }

  const chieuCaoHienTai = chieuCaoHang ?? CHIEU_CAO_HANG_KHOI_TAO;
  const coChuHienTai = coChu ?? CO_CHU_MAC_DINH;

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
          <DialogTitle className="truncate pr-4 text-base">{tieuDe}</DialogTitle>
          <div className="flex shrink-0 items-center gap-1.5">
            {laCongLenh && (
              <>
                <div
                  className="flex items-center gap-0.5 rounded-md border border-border bg-muted/40 p-0.5 text-xs text-muted-foreground"
                  title="Tăng/giảm chiều cao 4 hàng nơi đi/đến (mặc định: tự động chia đều sát mép in A5, hoặc tùy chỉnh 9-30mm)"
                >
                  <span className="px-1.5 font-medium text-foreground whitespace-nowrap">
                    Cao 4 hàng:{" "}
                    <strong className={chieuCaoHang !== null ? "text-primary" : "text-emerald-700 dark:text-emerald-400"}>
                      {chieuCaoHang !== null ? `${chieuCaoHang}mm` : "Tự động (sát lề)"}
                    </strong>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    disabled={chieuCaoHienTai <= CHIEU_CAO_TOI_THIEU}
                    aria-label="Giảm chiều cao hàng"
                    title="Giảm chiều cao hàng (-1mm)"
                    onClick={() => thayDoiChieuCaoHang(-1)}
                  >
                    <Minus className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    disabled={chieuCaoHienTai >= CHIEU_CAO_TOI_DA}
                    aria-label="Tăng chiều cao hàng"
                    title="Tăng chiều cao hàng (+1mm)"
                    onClick={() => thayDoiChieuCaoHang(1)}
                  >
                    <Plus className="size-3.5" />
                  </Button>
                  {chieuCaoHang !== null && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-foreground"
                      aria-label="Đặt lại tự động chia sát lề"
                      title="Đặt lại tự động chia sát lề"
                      onClick={datLaiChieuCaoHang}
                    >
                      <RotateCcw className="size-3.5" />
                    </Button>
                  )}
                </div>

                <div
                  className="flex items-center gap-0.5 rounded-md border border-border bg-muted/40 p-0.5 text-xs text-muted-foreground"
                  title="Tăng/giảm cỡ chữ bảng 4 hàng (mặc định: 9pt, phạm vi: 7-14pt)"
                >
                  <span className="px-1.5 font-medium text-foreground whitespace-nowrap">
                    Cỡ chữ:{" "}
                    <strong className={coChu !== null ? "text-primary" : "text-foreground"}>
                      {coChu !== null ? `${coChu}pt` : "9pt (chuẩn)"}
                    </strong>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    disabled={coChuHienTai <= CO_CHU_TOI_THIEU}
                    aria-label="Giảm cỡ chữ"
                    title="Giảm cỡ chữ (-0.5pt)"
                    onClick={() => thayDoiCoChu(-0.5)}
                  >
                    <Minus className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    disabled={coChuHienTai >= CO_CHU_TOI_DA}
                    aria-label="Tăng cỡ chữ"
                    title="Tăng cỡ chữ (+0.5pt)"
                    onClick={() => thayDoiCoChu(0.5)}
                  >
                    <Plus className="size-3.5" />
                  </Button>
                  {coChu !== null && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-foreground"
                      aria-label="Đặt lại cỡ chữ chuẩn"
                      title="Đặt lại cỡ chữ chuẩn (9pt)"
                      onClick={datLaiCoChu}
                    >
                      <RotateCcw className="size-3.5" />
                    </Button>
                  )}
                </div>
              </>
            )}
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
