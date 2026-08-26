"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronUp, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "@/app/theme-provider";
import { useNguoiDungHienTai } from "@/hooks/use-nguoi-dung-hien-tai";
import { useDangXuat } from "@/hooks/use-dang-xuat";
import { cn } from "@/lib/utils";

function layChuCaiDauTien(hoTen: string) {
  const phan = hoTen.trim().split(/\s+/);
  return (phan[phan.length - 1]?.[0] ?? "?").toUpperCase();
}

/**
 * Khu vuc tai khoan cuoi menu trai - theo dung docs/QUY_TAC_GIAO_DIEN.md:
 * "Thong tin tai khoan dat cuoi menu trai; nhap vao moi hien doi theme va
 * dang xuat." Khong dung Dropdown Menu cua Radix (chua co trong du an) -
 * tu dung mot popover nho, dong khi bam ra ngoai hoac nhan Escape.
 *
 * Redesign 2026-08-26 (Card Based Navigation, xem NHAT_KY_QUYET_DINH.md):
 * boc thanh 1 "soft card" trang bo vien nhe thay vi hang phang co border-top
 * nhu truoc, dong bo voi cac card nhom menu o tren. Ho tro thu gon
 * (thuGon) khi sidebar o dang "rail" - chi hien avatar, an ten/username.
 */
export function TaiKhoanMenu({ thuGon = false }: { thuGon?: boolean }) {
  const { data: nguoiDung } = useNguoiDungHienTai();
  const { theme, doiTheme } = useTheme();
  const dangXuat = useDangXuat();
  const [mo, setMo] = useState(false);
  const vungRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mo) return;
    function xuLyClickNgoai(e: MouseEvent) {
      if (vungRef.current && !vungRef.current.contains(e.target as Node)) {
        setMo(false);
      }
    }
    function xuLyPhim(e: KeyboardEvent) {
      if (e.key === "Escape") setMo(false);
    }
    document.addEventListener("mousedown", xuLyClickNgoai);
    document.addEventListener("keydown", xuLyPhim);
    return () => {
      document.removeEventListener("mousedown", xuLyClickNgoai);
      document.removeEventListener("keydown", xuLyPhim);
    };
  }, [mo]);

  if (!nguoiDung) return null;

  return (
    <div className="border-t border-sidebar-card-border p-3">
      <div ref={vungRef} className="relative">
        {mo && (
          <div
            role="menu"
            className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-lg border border-sidebar-card-border bg-background shadow-md"
          >
            <button
              role="menuitem"
              type="button"
              onClick={doiTheme}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-foreground hover:bg-sidebar-bg"
            >
              {theme === "toi" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              {theme === "toi" ? "Giao diện sáng" : "Giao diện tối"}
            </button>
            <button
              role="menuitem"
              type="button"
              disabled={dangXuat.isPending}
              onClick={() => dangXuat.mutate()}
              className="flex w-full items-center gap-2.5 border-t border-sidebar-card-border px-3 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
            >
              <LogOut className="size-4" />
              {dangXuat.isPending ? "Đang đăng xuất..." : "Đăng xuất"}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setMo((truoc) => !truoc)}
          aria-expanded={mo}
          title={thuGon ? nguoiDung.hoTen : undefined}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-xl border border-sidebar-card-border bg-background p-2 text-left shadow-sm transition-colors hover:bg-sidebar-bg",
            thuGon && "justify-center",
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {layChuCaiDauTien(nguoiDung.hoTen)}
          </span>
          {!thuGon && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">{nguoiDung.hoTen}</span>
                <span className="block truncate text-xs text-muted-foreground">@{nguoiDung.tenDangNhap}</span>
              </span>
              <ChevronUp
                className={cn("size-4 shrink-0 text-muted-foreground transition-transform", mo && "rotate-180")}
              />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
