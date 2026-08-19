"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { suaNhanVienSchema, type SuaNhanVienInput } from "@congtac/validation";
import { goiApi, LoiApi } from "@/lib/api";
import { useLamMoiDanhSachNhanVien, type NhanVien } from "@/hooks/use-danh-sach-nhan-vien";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function SuaNhanVienDialog({
  open,
  onOpenChange,
  nhanVien,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nhanVien: NhanVien | null;
}) {
  const lamMoiDanhSach = useLamMoiDanhSachNhanVien();
  const [loiChung, setLoiChung] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SuaNhanVienInput>({ resolver: zodResolver(suaNhanVienSchema) });

  useEffect(() => {
    if (open && nhanVien) {
      reset({
        hoTen: nhanVien.hoTen,
        ngaySinh: new Date(nhanVien.ngaySinh),
        cccd: nhanVien.cccd,
        chucVu: nhanVien.chucVu,
        donViCongTac: nhanVien.donViCongTac ?? "",
        laTaiXe: nhanVien.laTaiXe,
        trangThai: nhanVien.trangThai,
      });
      setLoiChung(null);
    }
  }, [open, nhanVien, reset]);

  if (!nhanVien) return null;

  async function xuLySubmit(duLieu: SuaNhanVienInput) {
    if (!nhanVien) return;
    setLoiChung(null);
    try {
      await goiApi(`/nhan-vien/${nhanVien.id}`, { method: "PATCH", body: JSON.stringify(duLieu) });
      await lamMoiDanhSach();
      onOpenChange(false);
    } catch (loi) {
      setLoiChung(loi instanceof LoiApi ? loi.message : "Không thể lưu thay đổi, vui lòng thử lại");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sửa thông tin nhân viên</DialogTitle>
          <DialogDescription>Cập nhật thông tin, đổi trạng thái làm việc nếu cần.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(xuLySubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="hoTenSuaNv">Họ tên</Label>
            <Input id="hoTenSuaNv" aria-invalid={!!errors.hoTen} {...register("hoTen")} />
            {errors.hoTen && <p className="text-sm text-destructive">{errors.hoTen.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ngaySinhSuaNv">Ngày sinh</Label>
              <Controller
                control={control}
                name="ngaySinh"
                render={({ field }) => (
                  <Input
                    id="ngaySinhSuaNv"
                    type="date"
                    value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                )}
              />
              {errors.ngaySinh && (
                <p className="text-sm text-destructive">{errors.ngaySinh.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cccdSuaNv">CCCD/CMND</Label>
              <Input id="cccdSuaNv" aria-invalid={!!errors.cccd} {...register("cccd")} />
              {errors.cccd && <p className="text-sm text-destructive">{errors.cccd.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="chucVuSuaNv">Chức vụ</Label>
              <Input id="chucVuSuaNv" {...register("chucVu")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="donViSuaNv">Đơn vị công tác</Label>
              <Input id="donViSuaNv" {...register("donViCongTac")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-end pb-2">
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
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trangThaiSuaNv">Trạng thái</Label>
              <Controller
                control={control}
                name="trangThai"
                render={({ field }) => (
                  <Select id="trangThaiSuaNv" value={field.value} onChange={(e) => field.onChange(e.target.value)}>
                    <option value="DANG_LAM_VIEC">Đang làm việc</option>
                    <option value="NGUNG_LAM_VIEC">Ngừng làm việc</option>
                  </Select>
                )}
              />
            </div>
          </div>

          {loiChung && (
            <div role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {loiChung}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
