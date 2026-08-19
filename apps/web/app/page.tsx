"use client";

import Link from "next/link";
import { Layers, ShieldCheck, Users } from "lucide-react";
import { useNguoiDungHienTai, coQuyen } from "@/hooks/use-nguoi-dung-hien-tai";
import { useDanhSachNguoiDung } from "@/hooks/use-danh-sach-nguoi-dung";
import { useDanhSachVaiTro } from "@/hooks/use-danh-sach-vai-tro";
import { NHOM_MENU } from "@/lib/menu";
import { MAU_NHOM, type MauNhom } from "@/lib/mau-nhom-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function TheThongKe({
  icon: Icon,
  nhan,
  giaTri,
  nhomMau,
}: {
  icon: React.ComponentType<{ className?: string }>;
  nhan: string;
  giaTri: string;
  nhomMau: MauNhom;
}) {
  const mau = MAU_NHOM[nhomMau];
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <span
        className={cn(
          "mb-3 flex size-10 shrink-0 items-center justify-center rounded-lg",
          mau.nenNhat,
          mau.chu,
        )}
      >
        <Icon className="size-5" />
      </span>
      <p className="text-2xl font-semibold leading-tight text-foreground">{giaTri}</p>
      <p className="truncate text-xs text-muted-foreground">{nhan}</p>
    </div>
  );
}

export default function TrangTongQuan() {
  const { data: nguoiDung } = useNguoiDungHienTai();
  const { data: dsNguoiDung } = useDanhSachNguoiDung(1, "");
  const { data: dsVaiTro } = useDanhSachVaiTro();

  const tatCaMucModule = NHOM_MENU.flatMap((nhom) => nhom.mucs);
  const soModuleHoanThanh = tatCaMucModule.filter((muc) => !muc.sapCo).length;

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">
          Chào {nguoiDung?.hoTen ?? "bạn"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tổng quan hệ thống Lệnh công tác - Công lệnh - Điều xe.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TheThongKe
          icon={Users}
          nhan="Tổng số người dùng"
          giaTri={String(dsNguoiDung?.tong ?? "—")}
          nhomMau="primary"
        />
        <TheThongKe
          icon={ShieldCheck}
          nhan="Tổng số vai trò"
          giaTri={String(dsVaiTro?.length ?? "—")}
          nhomMau="system"
        />
        <TheThongKe
          icon={Layers}
          nhan="Module đã hoàn thành"
          giaTri={`${soModuleHoanThanh}/${tatCaMucModule.length}`}
          nhomMau="shared"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {NHOM_MENU.map((nhom) => {
          const mucHienThi = nhom.mucs.filter(
            (muc) => !muc.quyenCanCo || coQuyen(nguoiDung, muc.quyenCanCo),
          );
          if (mucHienThi.length === 0) return null;

          const mau = MAU_NHOM[nhom.nhomMau];

          return (
            <div
              key={nhom.tieuDe}
              className={cn(
                "rounded-xl border border-border border-t-[3px] bg-background p-4",
                mau.vienTren,
              )}
            >
              <div className="mb-3 flex items-center gap-2">
                <span className={cn("size-1.5 shrink-0 rounded-full", mau.cham)} aria-hidden />
                <h2 className={cn("text-sm font-semibold", mau.chu)}>{nhom.tieuDe}</h2>
              </div>
              <div className="space-y-1">
                {mucHienThi.map((muc) => {
                  const Icon = muc.icon;
                  const noiDung = (
                    <>
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-md",
                          muc.sapCo ? "bg-muted text-muted-foreground/60" : cn(mau.nenNhat, mau.chu),
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate text-sm font-medium",
                          muc.sapCo ? "text-muted-foreground/70" : "text-foreground",
                        )}
                      >
                        {muc.nhan}
                      </span>
                      {muc.sapCo && (
                        <Badge variant="muted" className="shrink-0 text-[10px]">
                          Sắp có
                        </Badge>
                      )}
                    </>
                  );

                  return muc.sapCo ? (
                    <div
                      key={muc.href}
                      aria-disabled
                      className="flex cursor-not-allowed items-center gap-3 rounded-lg p-2 opacity-70"
                    >
                      {noiDung}
                    </div>
                  ) : (
                    <Link
                      key={muc.href}
                      href={muc.href}
                      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/60"
                    >
                      {noiDung}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
