"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronsLeft, ChevronsRight } from "lucide-react";
import { MUC_TONG_QUAN, NHOM_MENU, type MucMenu, type NhomMenu } from "@/lib/menu";
import { MAU_NHOM_SIDEBAR } from "@/lib/mau-nhom-sidebar";
import { useNguoiDungHienTai, coQuyen } from "@/hooks/use-nguoi-dung-hien-tai";
import { useCauHinhDonVi } from "@/hooks/use-cau-hinh-don-vi";
import { Badge } from "@/components/ui/badge";
import { TaiKhoanMenu } from "@/components/tai-khoan-menu";
import { cn } from "@/lib/utils";

/**
 * Sidebar "Modern Enterprise Dashboard - Card Based Navigation" (redesign
 * 2026-08-26, yeu cau nguoi dung - xem NHAT_KY_QUYET_DINH.md). Thiet ke
 * lai lan 2 cung ngay: moi nhom co 1 mau NHAN DIEN rieng (xem
 * lib/mau-nhom-sidebar.ts) NHUNG chi gioi han o nen tint cuc nhat cua card
 * + mau accent cua tieu de nhom/chevron - trang thai active/hover cua TUNG
 * MUC MENU van dung CHUNG 1 mau xanh duy nhat (--primary/bg-primary-10) de
 * dieu huong nhat quan, icon/chu muc menu binh thuong van mau trung tinh.
 * KHONG dung MAU_NHOM (mau-nhom-menu.ts) - token do van giu nguyen, chi
 * phuc vu rieng trang Tong quan (app/page.tsx), khong dong den. Moi nhom
 * menu hien thanh 1 "card", co the thu gon/mo rong rieng (dac biet nhom He
 * thong - nhieu muc nhat). Ho tro thu gon toan bo sidebar ve dang "rail"
 * chi con icon (prop thuGon, dieu khien tu AppShell).
 */

// Hover dung 1 lop phu den/trang mo (thay vi 1 mau nen co dinh) de LUON
// tuong phan duoc voi nen phia duoi du la nen sidebar trung tinh hay nen
// tint mau cua tung card (vd tint xanh #F8FAFF gan nhu trung voi
// --sidebar-bg #F8FAFC - neu dung 1 mau nen co dinh se co truong hop hover
// gan nhu vo hinh).
const HOVER_MUC = "hover:bg-black/[0.035] dark:hover:bg-white/[0.06]";

function MucDieuHuong({
  muc,
  dangChon,
  thuGon,
  onClick,
}: {
  muc: MucMenu;
  dangChon: boolean;
  /** true khi sidebar dang o dang "rail" thu gon - chi hien icon. */
  thuGon: boolean;
  onClick?: () => void;
}) {
  const Icon = muc.icon;

  if (muc.sapCo) {
    return (
      <div
        aria-disabled
        title={thuGon ? muc.nhan : undefined}
        className={cn(
          "flex h-10 cursor-not-allowed items-center gap-2.5 rounded-lg border-l-[3px] border-transparent px-2.5 text-sm text-muted-foreground/60",
          thuGon && "justify-center px-0",
        )}
      >
        <Icon className="size-[18px] shrink-0" />
        {!thuGon && (
          <>
            <span className="flex-1 truncate">{muc.nhan}</span>
            <Badge variant="muted" className="shrink-0 text-[10px]">
              Sắp có
            </Badge>
          </>
        )}
      </div>
    );
  }

  return (
    <Link
      href={muc.href}
      onClick={onClick}
      title={thuGon ? muc.nhan : undefined}
      aria-current={dangChon ? "page" : undefined}
      className={cn(
        "flex h-10 items-center gap-2.5 rounded-lg border-l-[3px] px-2.5 text-sm transition-colors",
        thuGon && "justify-center px-0",
        dangChon
          ? "border-primary bg-primary/10 font-semibold text-primary"
          : cn("border-transparent text-foreground", HOVER_MUC),
      )}
    >
      <Icon className="size-[18px] shrink-0" />
      {!thuGon && <span className="truncate">{muc.nhan}</span>}
    </Link>
  );
}

function CardNhom({
  nhom,
  mucHienThi,
  pathname,
  thuGon,
  onClick,
}: {
  nhom: NhomMenu;
  mucHienThi: MucMenu[];
  pathname: string;
  thuGon: boolean;
  onClick?: () => void;
}) {
  const [moRong, setMoRong] = useState(true);
  // Mau nhan dien RIENG cua nhom nay - CHI dung cho nen tint cua card +
  // accent tieu de/chevron duoi day, xem lib/mau-nhom-sidebar.ts.
  const mau = MAU_NHOM_SIDEBAR[nhom.nhomMau];

  return (
    <div className={cn("rounded-xl border border-sidebar-card-border p-1.5 shadow-sm", mau.nenCard)}>
      {!thuGon && (
        <button
          type="button"
          onClick={() => setMoRong((truoc) => !truoc)}
          aria-expanded={moRong}
          className={cn(
            "flex w-full items-center justify-between gap-1.5 rounded-md px-1.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-opacity hover:opacity-75",
            mau.accent,
          )}
        >
          {nhom.tieuDe}
          <ChevronDown
            className={cn("size-3.5 shrink-0 transition-transform", !moRong && "-rotate-90")}
            aria-hidden
          />
        </button>
      )}
      {(thuGon || moRong) && (
        <div className="space-y-0.5">
          {mucHienThi.map((muc) => (
            <MucDieuHuong
              key={muc.href}
              muc={muc}
              dangChon={pathname === muc.href}
              thuGon={thuGon}
              onClick={onClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function NoiDungSidebar({
  onDieuHuong,
  thuGon = false,
  onToggleThuGon,
}: {
  onDieuHuong?: () => void;
  /** true = dang o dang "rail" thu gon (~72px, chi icon). Chi anh huong
   * desktop - AppShell khong truyen prop nay cho ban mobile (drawer luon mo
   * rong day du). */
  thuGon?: boolean;
  /** An/hien nut thu gon - chi truyen o ban desktop. */
  onToggleThuGon?: () => void;
}) {
  const pathname = usePathname();
  const { data: nguoiDung } = useNguoiDungHienTai();
  // Fallback "XSKT An Giang" chi dung khi cau hinh chua tai xong (tranh
  // nhap nhay/rong o lan render dau) - gia tri that luon lay tu DB, xem
  // /cau-hinh-don-vi va NHAT_KY_QUYET_DINH.md.
  const { data: cauHinh } = useCauHinhDonVi();

  return (
    <div className="flex h-full flex-col bg-sidebar-bg">
      <div
        className={cn(
          "flex items-center gap-2.5 border-b border-sidebar-card-border px-4 py-4",
          thuGon && "flex-col gap-2 px-2",
        )}
      >
        <img src="/logo/logo-cong-ty-96.png" alt="" className="size-9 shrink-0 object-contain" />
        {!thuGon && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold leading-tight text-foreground">
              {cauHinh?.tenNgan ?? "XSKT An Giang"}
            </p>
            <p className="truncate text-[11px] leading-tight text-muted-foreground">
              Lệnh công tác - Điều xe
            </p>
          </div>
        )}
        {onToggleThuGon && (
          <button
            type="button"
            onClick={onToggleThuGon}
            aria-label={thuGon ? "Mở rộng menu" : "Thu gọn menu"}
            className={cn(
              "hidden shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground md:flex",
              HOVER_MUC,
            )}
          >
            {thuGon ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-3 overflow-y-auto p-3">
        <MucDieuHuong
          muc={MUC_TONG_QUAN}
          dangChon={pathname === "/"}
          thuGon={thuGon}
          onClick={onDieuHuong}
        />

        {NHOM_MENU.map((nhom) => {
          const mucHienThi = nhom.mucs.filter(
            (muc) => !muc.quyenCanCo || coQuyen(nguoiDung, muc.quyenCanCo),
          );
          if (mucHienThi.length === 0) return null;

          return (
            <CardNhom
              key={nhom.tieuDe}
              nhom={nhom}
              mucHienThi={mucHienThi}
              pathname={pathname}
              thuGon={thuGon}
              onClick={onDieuHuong}
            />
          );
        })}
      </nav>

      <TaiKhoanMenu thuGon={thuGon} />
    </div>
  );
}
