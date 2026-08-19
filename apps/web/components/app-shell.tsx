"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NoiDungSidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { useCauHinhDonVi } from "@/hooks/use-cau-hinh-don-vi";

const DUONG_DAN_KHONG_HIEN_SHELL = ["/dang-nhap", "/doi-mat-khau"];

/**
 * Khung ung dung chung: sidebar co dinh tren desktop, thu gon thanh menu
 * off-canvas tren man hinh nho. An hoan toan o trang dang nhap / doi mat
 * khau bat buoc - hai trang do can toan man hinh, khong can dieu huong.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [moMenuMobile, setMoMenuMobile] = useState(false);
  const anShell = DUONG_DAN_KHONG_HIEN_SHELL.some((duongDan) => pathname.startsWith(duongDan));
  // Tat query khi dang o trang dang nhap/doi mat khau - chua dang nhap, goi
  // se chi nhan 401 vo ich.
  const { data: cauHinh } = useCauHinhDonVi({ enabled: !anShell });

  useEffect(() => {
    setMoMenuMobile(false);
  }, [pathname]);

  if (anShell) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full flex-1">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-background md:block">
        <div className="fixed h-screen w-64">
          <NoiDungSidebar />
        </div>
      </aside>

      {/* Sidebar mobile - off-canvas */}
      {moMenuMobile && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            aria-hidden
            className="absolute inset-0 bg-black/40"
            onClick={() => setMoMenuMobile(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-background shadow-xl">
            <div className="flex justify-end p-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Đóng menu"
                onClick={() => setMoMenuMobile(false)}
              >
                <X />
              </Button>
            </div>
            <NoiDungSidebar onDieuHuong={() => setMoMenuMobile(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Thanh tren - chi hien tren mobile de mo menu */}
        <header className="flex items-center gap-3 border-b border-border px-4 py-3 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Mở menu"
            onClick={() => setMoMenuMobile(true)}
          >
            <Menu />
          </Button>
          <span className="text-sm font-semibold text-foreground">{cauHinh?.tenNgan ?? "XSKT An Giang"}</span>
        </header>

        <main className="flex flex-1 flex-col bg-muted/30">{children}</main>
      </div>
    </div>
  );
}
