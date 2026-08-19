"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taoNhanVienSchema, type TaoNhanVienInput } from "@congtac/validation";
import { goiApi, LoiApi } from "@/lib/api";
import { useLamMoiDanhSachNhanVien } from "@/hooks/use-danh-sach-nhan-vien";
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

export function TaoNhanVienDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const lamMoiDanhSach = useLamMoiDanhSachNhanVien();
  const [loiChung, setLoiChung] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaoNhanVienInput>({ resolver: zodResolver(taoNhanVienSchema) });

  async function xuLySubmit(duLieu: TaoNhanVienInput) {
    setLoiChung(null);
    try {
      await goiApi("/nhan-vien", { method: "POST", body: JSON.stringify(duLieu) });
      await lamMoiDanhSach();
      dong();
    } catch (loi) {
      setLoiChung(loi instanceof LoiApi ? loi.message : "Không thể thêm nhân viên, vui lòng thử lại");
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
          <DialogTitle>Thêm nhân viên</DialogTitle>
          <DialogDescription>Để trống chức vụ sẽ tự gán "Nhân viên".</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(xuLySubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="hoTenNv">Họ tên</Label>
            <Input id="hoTenNv" aria-invalid={!!errors.hoTen} {...register("hoTen")} />
            {errors.hoTen && <p className="text-sm text-destructive">{errors.hoTen.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ngaySinhNv">Ngày sinh</Label>
              <Input
                id="ngaySinhNv"
                type="date"
                aria-invalid={!!errors.ngaySinh}
                {...register("ngaySinh")}
              />
              {errors.ngaySinh && (
                <p className="text-sm text-destructive">{errors.ngaySinh.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cccdNv">CCCD/CMND</Label>
              <Input id="cccdNv" aria-invalid={!!errors.cccd} {...register("cccd")} />
              {errors.cccd && <p className="text-sm text-destructive">{errors.cccd.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="chucVuNv">Chức vụ</Label>
              <Input id="chucVuNv" placeholder="Nhân viên" {...register("chucVu")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="donViNv">Đơn vị công tác</Label>
              <Input id="donViNv" {...register("donViCongTac")} />
            </div>
          </div>

          <Controller
            control={control}
            name="laTaiXe"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} />
                Đánh dấu là tài xế
              </label>
            )}
          />

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
              {isSubmitting ? "Đang thêm..." : "Thêm nhân viên"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
