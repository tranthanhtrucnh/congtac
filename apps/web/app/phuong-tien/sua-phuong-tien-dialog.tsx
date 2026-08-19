"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { suaPhuongTienSchema, type SuaPhuongTienInput } from "@congtac/validation";
import { goiApi, LoiApi } from "@/lib/api";
import { useLamMoiDanhSachPhuongTien, type PhuongTien } from "@/hooks/use-danh-sach-phuong-tien";
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

export function SuaPhuongTienDialog({
  open,
  onOpenChange,
  phuongTien,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phuongTien: PhuongTien | null;
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
  } = useForm<SuaPhuongTienInput>({ resolver: zodResolver(suaPhuongTienSchema) });

  useEffect(() => {
    if (open && phuongTien) {
      reset({
        bienSo: phuongTien.bienSo,
        nhanHieu: phuongTien.nhanHieu,
        loaiXe: phuongTien.loaiXe ?? "",
        soCho: phuongTien.soCho ?? undefined,
        ghiChu: phuongTien.ghiChu ?? "",
        taiXeThuongDungId: phuongTien.taiXeThuongDungId,
        trangThai: phuongTien.trangThai,
      });
      setLoiChung(null);
    }
  }, [open, phuongTien, reset]);

  if (!phuongTien) return null;

  async function xuLySubmit(duLieu: SuaPhuongTienInput) {
    if (!phuongTien) return;
    setLoiChung(null);
    try {
      await goiApi(`/phuong-tien/${phuongTien.id}`, {
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
          <DialogTitle>Sửa thông tin phương tiện</DialogTitle>
          <DialogDescription>Cập nhật thông tin, đổi trạng thái sử dụng nếu cần.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(xuLySubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bienSoSuaPt">Biển số</Label>
              <Input id="bienSoSuaPt" aria-invalid={!!errors.bienSo} {...register("bienSo")} />
              {errors.bienSo && <p className="text-sm text-destructive">{errors.bienSo.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nhanHieuSuaPt">Nhãn hiệu / dòng xe</Label>
              <Input id="nhanHieuSuaPt" aria-invalid={!!errors.nhanHieu} {...register("nhanHieu")} />
              {errors.nhanHieu && (
                <p className="text-sm text-destructive">{errors.nhanHieu.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="loaiXeSuaPt">Loại xe</Label>
              <Input id="loaiXeSuaPt" {...register("loaiXe")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="soChoSuaPt">Số chỗ</Label>
              <Input
                id="soChoSuaPt"
                type="number"
                min={1}
                {...register("soCho", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
              />
              {errors.soCho && <p className="text-sm text-destructive">{errors.soCho.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="taiXeSuaPt">Tài xế thường dùng</Label>
              <Controller
                control={control}
                name="taiXeThuongDungId"
                render={({ field }) => (
                  <Select
                    id="taiXeSuaPt"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
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
              <Label htmlFor="trangThaiSuaPt">Trạng thái</Label>
              <Controller
                control={control}
                name="trangThai"
                render={({ field }) => (
                  <Select
                    id="trangThaiSuaPt"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    <option value="DANG_SU_DUNG">Đang sử dụng</option>
                    <option value="NGUNG_SU_DUNG">Ngừng sử dụng</option>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ghiChuSuaPt">Ghi chú</Label>
            <Input id="ghiChuSuaPt" {...register("ghiChu")} />
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
