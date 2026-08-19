"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taoPhuongTienSchema, type TaoPhuongTienInput } from "@congtac/validation";
import { goiApi, LoiApi } from "@/lib/api";
import { useLamMoiDanhSachPhuongTien } from "@/hooks/use-danh-sach-phuong-tien";
import { useDanhSachNhanVien } from "@/hooks/use-danh-sach-nhan-vien";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function TaoPhuongTienDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const lamMoiDanhSach = useLamMoiDanhSachPhuongTien();
  const [loiChung, setLoiChung] = useState<string | null>(null);

  const { data: taiXe } = useDanhSachNhanVien({
    trang: 1,
    kichThuoc: 100,
    tuKhoa: "",
    chiTaiXe: true,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaoPhuongTienInput>({ resolver: zodResolver(taoPhuongTienSchema) });

  async function xuLySubmit(duLieu: TaoPhuongTienInput) {
    setLoiChung(null);
    try {
      await goiApi("/phuong-tien", { method: "POST", body: JSON.stringify(duLieu) });
      await lamMoiDanhSach();
      dong();
    } catch (loi) {
      setLoiChung(loi instanceof LoiApi ? loi.message : "Không thể thêm phương tiện, vui lòng thử lại");
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
          <DialogTitle>Thêm phương tiện</DialogTitle>
          <DialogDescription>Biển số không phân biệt cách gõ dấu chấm/gạch ngang.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(xuLySubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bienSoPt">Biển số</Label>
              <Input
                id="bienSoPt"
                placeholder="67C1-123.45"
                aria-invalid={!!errors.bienSo}
                {...register("bienSo")}
              />
              {errors.bienSo && <p className="text-sm text-destructive">{errors.bienSo.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nhanHieuPt">Nhãn hiệu / dòng xe</Label>
              <Input
                id="nhanHieuPt"
                placeholder="Toyota Innova"
                aria-invalid={!!errors.nhanHieu}
                {...register("nhanHieu")}
              />
              {errors.nhanHieu && (
                <p className="text-sm text-destructive">{errors.nhanHieu.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="loaiXePt">Loại xe</Label>
              <Input id="loaiXePt" placeholder="Xe con 7 chỗ" {...register("loaiXe")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="soChoPt">Số chỗ</Label>
              <Input
                id="soChoPt"
                type="number"
                min={1}
                {...register("soCho", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
              />
              {errors.soCho && <p className="text-sm text-destructive">{errors.soCho.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="taiXePt">Tài xế thường dùng</Label>
            <Controller
              control={control}
              name="taiXeThuongDungId"
              render={({ field }) => (
                <Select
                  id="taiXePt"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value || undefined)}
                >
                  <option value="">Chưa gán</option>
                  {taiXe?.duLieu.map((nv) => (
                    <option key={nv.id} value={nv.id}>
                      {nv.hoTen}
                    </option>
                  ))}
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ghiChuPt">Ghi chú</Label>
            <Input id="ghiChuPt" {...register("ghiChu")} />
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
              {isSubmitting ? "Đang thêm..." : "Thêm phương tiện"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
