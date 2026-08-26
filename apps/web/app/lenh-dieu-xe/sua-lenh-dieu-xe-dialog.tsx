"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { suaLenhDieuXeSchema, type SuaLenhDieuXeInput } from "@congtac/validation";
import { goiApi, LoiApi } from "@/lib/api";
import { useLamMoiDanhSachLenhDieuXe, type LenhDieuXe } from "@/hooks/use-danh-sach-lenh-dieu-xe";
import { useDanhSachNhanVien } from "@/hooks/use-danh-sach-nhan-vien";
import { useDanhSachPhuongTien } from "@/hooks/use-danh-sach-phuong-tien";
import { useDanhSachDiaDiem } from "@/hooks/use-danh-sach-dia-diem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { ComboboxVanBan } from "@/components/ui/combobox-van-ban";
import { CanhBaoTrungLichLenhDieuXe } from "@/components/canh-bao-trung-lich-lenh-dieu-xe";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function SuaLenhDieuXeDialog({
  open,
  onOpenChange,
  lenhDieuXe,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lenhDieuXe: LenhDieuXe | null;
}) {
  const lamMoiDanhSach = useLamMoiDanhSachLenhDieuXe();
  const [loiChung, setLoiChung] = useState<string | null>(null);

  const { data: laiXeDs } = useDanhSachNhanVien({
    trang: 1,
    kichThuoc: 100,
    tuKhoa: "",
    chiTaiXe: true,
    trangThai: "DANG_LAM_VIEC",
  });
  const { data: phuongTienDs } = useDanhSachPhuongTien({
    trang: 1,
    kichThuoc: 100,
    tuKhoa: "",
    trangThai: "DANG_SU_DUNG",
  });
  const { data: diaDiemDs } = useDanhSachDiaDiem({ trang: 1, kichThuoc: 100, tuKhoa: "" });

  const goiYDiaDiem =
    diaDiemDs?.duLieu.map((dd) => ({
      value: dd.tenDayDu,
      phu: dd.cacTenTat.length > 0 ? dd.cacTenTat.join(", ") : undefined,
    })) ?? [];

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SuaLenhDieuXeInput>({ resolver: zodResolver(suaLenhDieuXeSchema) });

  // Gioi han "min" cua o Ngay ve theo Ngay di dang nhap - xem tao-lenh-dieu-xe-dialog.tsx.
  const ngayDiDangNhap = watch("ngayDi");
  const ngayVeDangNhap = watch("ngayVe");
  const ngayDiMin = ngayDiDangNhap ? new Date(ngayDiDangNhap).toISOString().slice(0, 10) : undefined;
  const laiXeDaChon = watch("laiXeId");
  const phuongTienDaChon = watch("phuongTienId");

  // Doi Ngay di sang SAU Ngay ve dang co thi tu keo Ngay ve theo bang Ngay
  // di - xem giai thich trong tao-lenh-dieu-xe-dialog.tsx. Dat SAU useEffect
  // reset(...) o duoi trong file nay - chi kich hoat khi nguoi dung tu tay
  // doi Ngay di, khong chay luc dialog vua mo/nap du lieu.
  useEffect(() => {
    if (ngayDiDangNhap && ngayVeDangNhap && new Date(ngayVeDangNhap) < new Date(ngayDiDangNhap)) {
      setValue("ngayVe", ngayDiDangNhap, { shouldValidate: true, shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ngayDiDangNhap]);

  // Doi lai xe thi tu dien bien so xe thuong dung cua lai xe do (neu co) -
  // van sua lai duoc binh thuong, chi la goi y cho nhanh (giong dialog Tao).
  function chonLaiXe(laiXeId: string) {
    setValue("laiXeId", laiXeId, { shouldValidate: true, shouldDirty: true });
    const xeThuongDung = phuongTienDs?.duLieu.find((pt) => pt.taiXeThuongDungId === laiXeId);
    if (xeThuongDung) {
      setValue("phuongTienId", xeThuongDung.id, { shouldValidate: true, shouldDirty: true });
    }
  }

  useEffect(() => {
    if (open && lenhDieuXe) {
      reset({
        laiXeId: lenhDieuXe.laiXeId ?? undefined,
        phuongTienId: lenhDieuXe.phuongTienId ?? undefined,
        noiDi: lenhDieuXe.noiDi,
        noiDen: lenhDieuXe.noiDen,
        mucDich: lenhDieuXe.mucDich,
        ngayDi: new Date(lenhDieuXe.ngayDi),
        ngayVe: new Date(lenhDieuXe.ngayVe),
        ngayKy: new Date(lenhDieuXe.ngayKy),
      });
      setLoiChung(null);
    }
  }, [open, lenhDieuXe, reset]);

  if (!lenhDieuXe) return null;

  async function xuLySubmit(duLieu: SuaLenhDieuXeInput) {
    if (!lenhDieuXe) return;
    setLoiChung(null);
    try {
      await goiApi(`/lenh-dieu-xe/${lenhDieuXe.id}`, { method: "PATCH", body: JSON.stringify(duLieu) });
      await lamMoiDanhSach();
      onOpenChange(false);
    } catch (loi) {
      setLoiChung(loi instanceof LoiApi ? loi.message : "Không thể lưu thay đổi, vui lòng thử lại");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sửa lệnh điều xe {lenhDieuXe.soHieu}</DialogTitle>
          <DialogDescription>Sửa được đến khi chứng từ bị hủy.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(xuLySubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="laiXeSuaLdx">Lái xe</Label>
              <Controller
                control={control}
                name="laiXeId"
                render={({ field }) => (
                  <Combobox
                    id="laiXeSuaLdx"
                    value={field.value ?? ""}
                    onChange={chonLaiXe}
                    ariaInvalid={!!errors.laiXeId}
                    placeholder="-- Chọn lái xe --"
                    searchPlaceholder="Gõ tên để tìm..."
                    emptyText="Không tìm thấy lái xe nào."
                    options={
                      laiXeDs?.duLieu.map((nv) => ({
                        value: nv.id,
                        label: nv.hoTen,
                        moTa: nv.chucVu,
                      })) ?? []
                    }
                  />
                )}
              />
              {errors.laiXeId && <p className="text-sm text-destructive">{errors.laiXeId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phuongTienSuaLdx">Biển số xe</Label>
              <Controller
                control={control}
                name="phuongTienId"
                render={({ field }) => (
                  <Combobox
                    id="phuongTienSuaLdx"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    ariaInvalid={!!errors.phuongTienId}
                    placeholder="-- Chọn biển số --"
                    searchPlaceholder="Gõ biển số để tìm..."
                    emptyText="Không tìm thấy phương tiện nào."
                    options={
                      phuongTienDs?.duLieu.map((pt) => ({
                        value: pt.id,
                        label: pt.bienSo,
                        moTa: pt.nhanHieu,
                      })) ?? []
                    }
                  />
                )}
              />
              {errors.phuongTienId && (
                <p className="text-sm text-destructive">{errors.phuongTienId.message}</p>
              )}
            </div>
          </div>

          <CanhBaoTrungLichLenhDieuXe
            laiXeId={laiXeDaChon}
            phuongTienId={phuongTienDaChon}
            ngayDi={ngayDiDangNhap}
            ngayVe={ngayVeDangNhap}
            loaiTruId={lenhDieuXe?.id}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="noiDiSuaLdx">Nơi đi</Label>
              <Controller
                control={control}
                name="noiDi"
                render={({ field }) => (
                  <ComboboxVanBan
                    id="noiDiSuaLdx"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    ariaInvalid={!!errors.noiDi}
                    goiY={goiYDiaDiem}
                  />
                )}
              />
              {errors.noiDi && <p className="text-sm text-destructive">{errors.noiDi.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="noiDenSuaLdx">Nơi đến</Label>
              <Controller
                control={control}
                name="noiDen"
                render={({ field }) => (
                  <ComboboxVanBan
                    id="noiDenSuaLdx"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    ariaInvalid={!!errors.noiDen}
                    goiY={goiYDiaDiem}
                  />
                )}
              />
              {errors.noiDen && <p className="text-sm text-destructive">{errors.noiDen.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mucDichSuaLdx">Mục đích</Label>
            <Textarea
              id="mucDichSuaLdx"
              rows={2}
              aria-invalid={!!errors.mucDich}
              {...register("mucDich")}
            />
            {errors.mucDich && <p className="text-sm text-destructive">{errors.mucDich.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ngayKySuaLdx">Ngày lập</Label>
              <Controller
                control={control}
                name="ngayKy"
                render={({ field }) => (
                  <Input
                    id="ngayKySuaLdx"
                    type="date"
                    aria-invalid={!!errors.ngayKy}
                    value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                )}
              />
              {errors.ngayKy && <p className="text-sm text-destructive">{errors.ngayKy.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ngayDiSuaLdx">Ngày đi</Label>
              <Controller
                control={control}
                name="ngayDi"
                render={({ field }) => (
                  <Input
                    id="ngayDiSuaLdx"
                    type="date"
                    aria-invalid={!!errors.ngayDi}
                    value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                )}
              />
              {errors.ngayDi && <p className="text-sm text-destructive">{errors.ngayDi.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ngayVeSuaLdx">Ngày về</Label>
              <Controller
                control={control}
                name="ngayVe"
                render={({ field }) => (
                  <Input
                    id="ngayVeSuaLdx"
                    type="date"
                    min={ngayDiMin}
                    aria-invalid={!!errors.ngayVe}
                    value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                )}
              />
              {errors.ngayVe && <p className="text-sm text-destructive">{errors.ngayVe.message}</p>}
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
