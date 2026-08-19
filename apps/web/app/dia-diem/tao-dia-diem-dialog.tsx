"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taoDiaDiemSchema, type TaoDiaDiemInput } from "@congtac/validation";
import { goiApi, LoiApi } from "@/lib/api";
import { useLamMoiDanhSachDiaDiem } from "@/hooks/use-danh-sach-dia-diem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Chuyen chuoi go tay "CL, MT, Sa Đéc" -> mang ["CL","MT","Sa Đéc"] va nguoc lai.
function chuoiThanhMang(chuoi: string): string[] {
  return chuoi
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function TaoDiaDiemDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const lamMoiDanhSach = useLamMoiDanhSachDiaDiem();
  const [loiChung, setLoiChung] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaoDiaDiemInput>({ resolver: zodResolver(taoDiaDiemSchema) });

  async function xuLySubmit(duLieu: TaoDiaDiemInput) {
    setLoiChung(null);
    try {
      await goiApi("/dia-diem", { method: "POST", body: JSON.stringify(duLieu) });
      await lamMoiDanhSach();
      dong();
    } catch (loi) {
      setLoiChung(loi instanceof LoiApi ? loi.message : "Không thể thêm địa điểm, vui lòng thử lại");
    }
  }

  function dong() {
    onOpenChange(false);
    reset();
    setLoiChung(null);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : dong())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm địa điểm</DialogTitle>
          <DialogDescription>Đây là nơi đến cho Lệnh điều công tác, không phải chi nhánh/đại lý.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(xuLySubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="tenDayDuDd">Tên đầy đủ</Label>
            <Input
              id="tenDayDuDd"
              placeholder="Đồng Tháp"
              aria-invalid={!!errors.tenDayDu}
              {...register("tenDayDu")}
            />
            {errors.tenDayDu && <p className="text-sm text-destructive">{errors.tenDayDu.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cacTenTatDd">Các cách ghi tắt khác</Label>
            <Controller
              control={control}
              name="cacTenTat"
              render={({ field }) => (
                <Input
                  id="cacTenTatDd"
                  placeholder="CL, MT, Sa Đéc"
                  value={(field.value ?? []).join(", ")}
                  onChange={(e) => field.onChange(chuoiThanhMang(e.target.value))}
                />
              )}
            />
            <p className="text-xs text-muted-foreground">
              Cách nhau bằng dấu phẩy - dùng khi cần khớp chỗ trống trên mẫu in giấy.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ghiChuDd">Ghi chú</Label>
            <Input id="ghiChuDd" {...register("ghiChu")} />
          </div>

          <div className="flex flex-wrap gap-4">
            <Controller
              control={control}
              name="thuongDung"
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} />
                  Đánh dấu thường dùng
                </label>
              )}
            />
            <Controller
              control={control}
              name="diemDiMacDinh"
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} />
                  Đánh dấu điểm đi mặc định
                </label>
              )}
            />
          </div>

          {loiChung && (
            <div role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {loiChung}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={dong}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang thêm..." : "Thêm địa điểm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
