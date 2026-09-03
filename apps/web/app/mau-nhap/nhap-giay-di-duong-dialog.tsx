"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { nhapGiayDiDuongSchema, type NhapGiayDiDuongInput } from "@congtac/validation";
import { API_BASE_URL } from "@/lib/api";
import { useDanhSachNhanVien } from "@/hooks/use-danh-sach-nhan-vien";
import { useDanhSachDiaDiem } from "@/hooks/use-danh-sach-dia-diem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { ComboboxVanBan } from "@/components/ui/combobox-van-ban";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

function ngayHomNay() {
  return new Date().toISOString().slice(0, 10);
}

function ngayMai() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

const GIA_TRI_MAC_DINH: NhapGiayDiDuongInput = {
  soHieu: "",
  ngayKy: new Date(ngayHomNay()),
  hoTen: "",
  chucVu: "",
  noiDi: "",
  noiDen: "",
  ngayDi: new Date(ngayMai()),
  ngayVe: new Date(ngayMai()),
};

/**
 * "Mẫu in nháp" Công lệnh (kiêm) Giấy đi đường - xem doc comment đầy đủ ở
 * nhap-lenh-dieu-cong-tac-dialog.tsx (cùng tính năng, cùng lần sửa lại
 * 2026-08-26 để "y như thật"). GDD không có form tạo độc lập trong hệ thống
 * thật (luôn sinh tự động theo từng thành viên của 1 LĐCT) nên không có "form
 * thật" để tái dùng y hệt - ở đây chỉ nâng cấp phần có thể: chọn Họ tên/Chức
 * vụ từ Danh mục Nhân viên qua Combobox (tự điền, vẫn sửa tay được), gợi ý
 * Nơi đi/Nơi đến từ Danh mục Địa điểm - giống hệt cách các form thật khác
 * đang làm. Người ký lấy tự động theo người ký chính thức hiện tại. Xem
 * NHAT_KY_QUYET_DINH.md muc "Mau in nhap".
 */
export function NhapGiayDiDuongDialog({
  open,
  onOpenChange,
  onXemTruoc,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onXemTruoc: (url: string, tieuDe: string) => void;
}) {
  const { data: nhanVienDs } = useDanhSachNhanVien({
    trang: 1,
    kichThuoc: 100,
    tuKhoa: "",
    chiTaiXe: false,
    trangThai: "DANG_LAM_VIEC",
  });
  const { data: diaDiemDs } = useDanhSachDiaDiem({ trang: 1, kichThuoc: 100, tuKhoa: "" });

  const goiYDiaDiem =
    diaDiemDs?.duLieu.map((dd) => ({
      value: dd.tenDayDu,
      phu: dd.cacTenTat.length > 0 ? dd.cacTenTat.join(", ") : undefined,
    })) ?? [];

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<NhapGiayDiDuongInput>({
    resolver: zodResolver(nhapGiayDiDuongSchema),
    defaultValues: GIA_TRI_MAC_DINH,
  });

  function chonNhanVien(nhanVienId: string) {
    const nv = (nhanVienDs?.duLieu ?? []).find((n) => n.id === nhanVienId);
    if (!nv) return;
    setValue("hoTen", nv.hoTen, { shouldValidate: true });
    setValue("chucVu", nv.chucVu, { shouldValidate: true });
  }

  function dong() {
    onOpenChange(false);
    reset(GIA_TRI_MAC_DINH);
  }

  function xuLySubmit(duLieu: NhapGiayDiDuongInput) {
    const thamSo = new URLSearchParams({
      soHieu: duLieu.soHieu,
      ngayKy: duLieu.ngayKy.toISOString(),
      hoTen: duLieu.hoTen,
      chucVu: duLieu.chucVu,
      noiDi: duLieu.noiDi,
      noiDen: duLieu.noiDen,
      ngayDi: duLieu.ngayDi.toISOString(),
      ngayVe: duLieu.ngayVe.toISOString(),
    });
    onXemTruoc(`${API_BASE_URL}/giay-di-duong/nhap-pdf?${thamSo.toString()}`, `Nháp công lệnh ${duLieu.soHieu}`);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : dong())}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Nháp Công lệnh / Giấy đi đường</DialogTitle>
          <DialogDescription>
            Số hiệu gõ tay, không lưu vào hệ thống. Người ký lấy theo người ký chính thức hiện tại.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(xuLySubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="chonNhanVienGddNhap">Chọn nhanh từ Danh mục Nhân viên</Label>
            <Combobox
              id="chonNhanVienGddNhap"
              value=""
              onChange={chonNhanVien}
              placeholder="-- Gõ tên để điền sẵn Họ tên/Chức vụ --"
              searchPlaceholder="Gõ tên để tìm..."
              emptyText="Không tìm thấy nhân viên nào."
              options={(nhanVienDs?.duLieu ?? []).map((nv) => ({ value: nv.id, label: nv.hoTen, moTa: nv.chucVu }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="soHieuGddNhap">Số hiệu</Label>
              <Input
                id="soHieuGddNhap"
                placeholder="Ví dụ: 12/CL"
                aria-invalid={!!errors.soHieu}
                {...register("soHieu")}
              />
              {errors.soHieu && <p className="text-sm text-destructive">{errors.soHieu.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ngayKyGddNhap">Ngày lập</Label>
              <Controller
                control={control}
                name="ngayKy"
                render={({ field }) => (
                  <Input
                    id="ngayKyGddNhap"
                    type="date"
                    aria-invalid={!!errors.ngayKy}
                    value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                )}
              />
              {errors.ngayKy && <p className="text-sm text-destructive">{errors.ngayKy.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="hoTenGddNhap">Cấp cho Anh (Chị)</Label>
              <Input id="hoTenGddNhap" aria-invalid={!!errors.hoTen} {...register("hoTen")} />
              {errors.hoTen && <p className="text-sm text-destructive">{errors.hoTen.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="chucVuGddNhap">Chức vụ</Label>
              <Input id="chucVuGddNhap" aria-invalid={!!errors.chucVu} {...register("chucVu")} />
              {errors.chucVu && <p className="text-sm text-destructive">{errors.chucVu.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="noiDiGddNhap">Nơi đi</Label>
              <Controller
                control={control}
                name="noiDi"
                render={({ field }) => (
                  <ComboboxVanBan
                    id="noiDiGddNhap"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    ariaInvalid={!!errors.noiDi}
                    placeholder="Trụ sở công ty..."
                    goiY={goiYDiaDiem}
                  />
                )}
              />
              {errors.noiDi && <p className="text-sm text-destructive">{errors.noiDi.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="noiDenGddNhap">Nơi đến</Label>
              <Controller
                control={control}
                name="noiDen"
                render={({ field }) => (
                  <ComboboxVanBan
                    id="noiDenGddNhap"
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ngayDiGddNhap">Ngày đi</Label>
              <Controller
                control={control}
                name="ngayDi"
                render={({ field }) => (
                  <Input
                    id="ngayDiGddNhap"
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
              <Label htmlFor="ngayVeGddNhap">Ngày về</Label>
              <Controller
                control={control}
                name="ngayVe"
                render={({ field }) => (
                  <Input
                    id="ngayVeGddNhap"
                    type="date"
                    aria-invalid={!!errors.ngayVe}
                    value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                )}
              />
              {errors.ngayVe && <p className="text-sm text-destructive">{errors.ngayVe.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={dong}>
              Đóng
            </Button>
            <Button type="submit">Xem/In nháp</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
