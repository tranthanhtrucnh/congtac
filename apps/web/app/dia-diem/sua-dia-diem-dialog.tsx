"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { suaDiaDiemSchema, type SuaDiaDiemInput } from "@congtac/validation";
import { goiApi, LoiApi } from "@/lib/api";
import { useLamMoiDanhSachDiaDiem, type DiaDiem } from "@/hooks/use-danh-sach-dia-diem";
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

function chuoiThanhMang(chuoi: string): string[] {
  return chuoi
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function SuaDiaDiemDialog({
  open,
  onOpenChange,
  diaDiem,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  diaDiem: DiaDiem | null;
}) {
  const lamMoiDanhSach = useLamMoiDanhSachDiaDiem();
  const [loiChung, setLoiChung] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SuaDiaDiemInput>({ resolver: zodResolver(suaDiaDiemSchema) });

  useEffect(() => {
    if (open && diaDiem) {
      reset({
        tenDayDu: diaDiem.tenDayDu,
        cacTenTat: diaDiem.cacTenTat,
        ghiChu: diaDiem.ghiChu ?? "",
        thuongDung: diaDiem.thuongDung,
        diemDiMacDinh: diaDiem.diemDiMacDinh,
        trangThai: diaDiem.trangThai,
      });
      setLoiChung(null);
    }
  }, [open, diaDiem, reset]);

  if (!diaDiem) return null;

  async function xuLySubmit(duLieu: SuaDiaDiemInput) {
    if (!diaDiem) return;
    setLoiChung(null);
    try {
      await goiApi(`/dia-diem/${diaDiem.id}`, { method: "PATCH", body: JSON.stringify(duLieu) });
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
          <DialogTitle>Sửa địa điểm</DialogTitle>
          <DialogDescription>Cập nhật thông tin, đổi trạng thái sử dụng nếu cần.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(xuLySubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="tenDayDuSuaDd">Tên đầy đủ</Label>
            <Input id="tenDayDuSuaDd" aria-invalid={!!errors.tenDayDu} {...register("tenDayDu")} />
            {errors.tenDayDu && <p className="text-sm text-destructive">{errors.tenDayDu.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cacTenTatSuaDd">Các cách ghi tắt khác</Label>
            <Controller
              control={control}
              name="cacTenTat"
              render={({ field }) => (
                <Input
                  id="cacTenTatSuaDd"
                  placeholder="CL, MT, Sa Đéc"
                  value={(field.value ?? []).join(", ")}
                  onChange={(e) => field.onChange(chuoiThanhMang(e.target.value))}
                />
              )}
            />
            <p className="text-xs text-muted-foreground">Cách nhau bằng dấu phẩy.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="ghiChuSuaDd">Ghi chú</Label>
              <Input id="ghiChuSuaDd" {...register("ghiChu")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trangThaiSuaDd">Trạng thái</Label>
              <Controller
                control={control}
                name="trangThai"
                render={({ field }) => (
                  <Select
                    id="trangThaiSuaDd"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    <option value="DANG_DUNG">Đang dùng</option>
                    <option value="NGUNG_DUNG">Ngừng dùng</option>
                  </Select>
                )}
              />
            </div>
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
