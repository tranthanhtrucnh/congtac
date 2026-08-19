import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        // "default" = trang thai hoat dong/tich cuc (Dang lam viec, Dang
        // dung, Chinh thuc...) - CO CHU DINH dung --success (xanh la) chu
        // KHONG dung --primary (da doi sang xanh duong 2026-08-10, xem
        // NHAT_KY_QUYET_DINH.md) de giu dung quy tac "Trang thai hoat dong =
        // Xanh la" trong QUY_TAC_GIAO_DIEN.md du mau chu dao doi.
        default: "border-transparent bg-success text-success-foreground",
        outline: "border-border text-foreground",
        destructive: "border-transparent bg-destructive/10 text-destructive",
        muted: "border-transparent bg-muted text-muted-foreground",
        // "info" (xanh dương) va "warning" (vang, dung tiet che theo
        // QUY_TAC_GIAO_DIEN.md) - cung 1 cap mau da dung cho chip "Tai xe"
        // o trang /nhan-vien, dung lai de dong bo he thong.
        info: "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        warning: "border-transparent bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
