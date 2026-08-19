"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MUC_TONG_QUAN, NHOM_MENU, type MucMenu } from "@/lib/menu";
import { MAU_NHOM } from "@/lib/mau-nhom-menu";
import { useNguoiDungHienTai, coQuyen } from "@/hooks/use-nguoi-dung-hien-tai";
import { useCauHinhDonVi } from "@/hooks/use-cau-hinh-don-vi";
import { Badge } from "@/components/ui/badge";
import { TaiKhoanMenu } from "@/components/tai-khoan-menu";
import { cn } from "@/lib/utils";

function MucDieuHuong({
  muc,
  dangChon,
  mau,
  onClick,
}: {
  muc: MucMenu;
  dangChon: boolean;
  mau: (typeof MAU_NHOM)[keyof typeof MAU_NHOM];
  onClick?: () => void;
}) {
  const Icon = muc.icon;

  if (muc.sapCo) {
    return (
      <div
        aria-disabled
        className="flex cursor-not-allowed items-center gap-2.5 rounded-md border-l-[3px] border-transparent px-2.5 py-2 text-sm text-muted-foreground/60"
      >
        <Icon className="size-4 shrink-0" />
        <span className="flex-1 truncate">{muc.nhan}</span>
        <Badge variant="muted" className="shrink-0 text-[10px]">
          Sắp có
        </Badge>
      </div>
    );
  }

  return (
    <Link
      href={muc.href}
      onClick={onClick}
      aria-current={dangChon ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-md border-l-[3px] px-2.5 py-2 text-sm font-medium transition-colors",
        dangChon
          ? cn(mau.nenNhat, mau.chu, mau.vachTrai)
          : "border-transparent text-foreground hover:bg-muted",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{muc.nhan}</span>
    </Link>
  );
}

export function NoiDungSidebar({ onDieuHuong }: { onDieuHuong?: () => void }) {
  const pathname = usePathname();
  const { data: nguoiDung } = useNguoiDungHienTai();
  // Fallback "XSKT An Giang" chi dung khi cau hinh chua tai xong (tranh
  // nhap nhay/rong o lan render dau) - gia tri that luon lay tu DB, xem
  // /cau-hinh-don-vi va NHAT_KY_QUYET_DINH.md.
  const { data: cauHinh } = useCauHinhDonVi();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-4">
        <img src="/logo/logo-cong-ty-96.png" alt="" className="size-9 object-contain" />
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold leading-tight text-foreground">
            {cauHinh?.tenNgan ?? "XSKT An Giang"}
          </p>
          <p className="truncate text-[11px] leading-tight text-muted-foreground">
            Lệnh công tác - Điều xe
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        <MucDieuHuong
          muc={MUC_TONG_QUAN}
          dangChon={pathname === "/"}
          mau={MAU_NHOM.primary}
          onClick={onDieuHuong}
        />

        {NHOM_MENU.map((nhom) => {
          const mucHienThi = nhom.mucs.filter(
            (muc) => !muc.quyenCanCo || coQuyen(nguoiDung, muc.quyenCanCo),
          );
          if (mucHienThi.length === 0) return null;

          const mau = MAU_NHOM[nhom.nhomMau];

          return (
            <div key={nhom.tieuDe}>
              <p className="mb-1.5 flex items-center gap-1.5 px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span className={cn("size-1.5 shrink-0 rounded-full", mau.cham)} aria-hidden />
                {nhom.tieuDe}
              </p>
              <div className="space-y-0.5">
                {mucHienThi.map((muc) => (
                  <MucDieuHuong
                    key={muc.href}
                    muc={muc}
                    dangChon={pathname === muc.href}
                    mau={mau}
                    onClick={onDieuHuong}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <TaiKhoanMenu />
    </div>
  );
}
