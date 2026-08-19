"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { suaNguoiDungSchema, type SuaNguoiDungInput } from "@congtac/validation";
import { goiApi, LoiApi } from "@/lib/api";
import { useDanhSachVaiTro } from "@/hooks/use-danh-sach-vai-tro";
import { useLamMoiDanhSachNguoiDung } from "@/hooks/use-danh-sach-nguoi-dung";
import type { NguoiDung } from "@/hooks/use-danh-sach-nguoi-dung";
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

export function SuaNguoiDungDialog({
  open,
  onOpenChange,
  nguoiDung,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nguoiDung: NguoiDung | null;
}) {
  const { data: danhSachVaiTro } = useDanhSachVaiTro();
  const lamMoiDanhSach = useLamMoiDanhSachNguoiDung();
  const [loiChung, setLoiChung] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SuaNguoiDungInput>({ resolver: zodResolver(suaNguoiDungSchema) });

  // Nap lai gia tri form moi khi mo dialog cho 1 nguoi dung khac.
  useEffect(() => {
    if (open && nguoiDung) {
      reset({ hoTen: nguoiDung.hoTen, vaiTroIds: nguoiDung.vaiTro.map((v) => v.id) });
      setLoiChung(null);
    }
  }, [open, nguoiDung, reset]);

  if (!nguoiDung) return null;

  async function xuLySubmit(duLieu: SuaNguoiDungInput) {
    if (!nguoiDung) return;
    setLoiChung(null);
    try {
      await goiApi(`/nguoi-dung/${nguoiDung.id}`, {
        method: "PATCH",
        body: JSON.stringify(duLieu),
      });
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
          <DialogTitle>Sửa thông tin người dùng</DialogTitle>
          <DialogDescription>
            Tài khoản <span className="font-mono">{nguoiDung.tenDangNhap}</span> — tên đăng nhập
            không thay đổi được.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(xuLySubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="hoTenSua">Họ tên</Label>
            <Input id="hoTenSua" aria-invalid={!!errors.hoTen} {...register("hoTen")} />
            {errors.hoTen && <p className="text-sm text-destructive">{errors.hoTen.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Vai trò</Label>
            <Controller
              control={control}
              name="vaiTroIds"
              render={({ field }) => (
                <div className="space-y-2">
                  {danhSachVaiTro?.map((vaiTro) => {
                    const daChon = field.value?.includes(vaiTro.id) ?? false;
                    return (
                      <label key={vaiTro.id} className="flex items-center gap-2 text-sm text-foreground">
                        <Checkbox
                          checked={daChon}
                          onCheckedChange={(checked) => {
                            const giaTri = field.value ?? [];
                            field.onChange(
                              checked ? [...giaTri, vaiTro.id] : giaTri.filter((id) => id !== vaiTro.id),
                            );
                          }}
                        />
                        {vaiTro.ten}
                      </label>
                    );
                  })}
                </div>
              )}
            />
            {errors.vaiTroIds && (
              <p className="text-sm text-destructive">{errors.vaiTroIds.message}</p>
            )}
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
