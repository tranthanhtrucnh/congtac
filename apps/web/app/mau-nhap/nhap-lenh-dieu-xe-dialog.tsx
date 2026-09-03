"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { nhapLenhDieuXeSchema, type NhapLenhDieuXeInput } from "@congtac/validation";
import { API_BASE_URL } from "@/lib/api";
import { useDanhSachNhanVien } from "@/hooks/use-danh-sach-nhan-vien";
import { useDanhSachPhuongTien } from "@/hooks/use-danh-sach-phuong-tien";
import { useDanhSachDiaDiem } from "@/hooks/use-danh-sach-dia-diem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const GIA_TRI_MAC_DINH: NhapLenhDieuXeInput = {
  soHieu: "",
  ngayKy: new Date(ngayHomNay()),
  laiXeHoTen: "",
  bienSo: "",
  nhanHieu: "",
  noiDi: "",
  noiDen: "",
  mucDich: "Công tác",
  ngayDi: new Date(ngayMai()),
  ngayVe: new Date(ngayMai()),
};

/**
 * "Mẫu in nháp" Lệnh điều xe - xem doc comment đầy đủ ở
 * nhap-lenh-dieu-cong-tac-dialog.tsx (cùng tính năng, cùng lần sửa lại
 * 2026-08-26 để "y như form thật"). Tái dùng đúng các mảnh UI của
 * tao-lenh-dieu-xe-dialog.tsx - chọn Lái xe/Biển số từ Danh mục Nhân
 * viên/Phương tiện qua Combobox (tự điền biển số thường dùng của lái xe nếu
 * có, giống hệt hành vi thật), gợi ý Nơi đi/Nơi đến từ Danh mục Địa điểm -
 * nhưng vẫn cho sửa tay tự do (không bắt buộc phải có trong Danh mục, vì bản
 * nháp không cần gắn với dữ liệu thật). Không kiểm tra trùng lịch. Thêm ô
 * "Số hiệu" gõ tay (form thật không có). Xem NHAT_KY_QUYET_DINH.md muc
 * "Mau in nhap".
 */
export function NhapLenhDieuXeDialog({
  open,
  onOpenChange,
  onXemTruoc,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onXemTruoc: (url: string, tieuDe: string) => void;
}) {
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
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<NhapLenhDieuXeInput>({
    resolver: zodResolver(nhapLenhDieuXeSchema),
    defaultValues: GIA_TRI_MAC_DINH,
  });

  function chonLaiXe(nhanVienId: string) {
    const nv = (laiXeDs?.duLieu ?? []).find((n) => n.id === nhanVienId);
    if (!nv) return;
    setValue("laiXeHoTen", nv.hoTen, { shouldValidate: true });
    const xeThuongDung = phuongTienDs?.duLieu.find((pt) => pt.taiXeThuongDungId === nhanVienId);
    if (xeThuongDung) {
      setValue("bienSo", xeThuongDung.bienSo, { shouldValidate: true });
      setValue("nhanHieu", xeThuongDung.nhanHieu, { shouldValidate: true });
    }
  }

  function chonPhuongTien(phuongTienId: string) {
    const pt = (phuongTienDs?.duLieu ?? []).find((p) => p.id === phuongTienId);
    if (!pt) return;
    setValue("bienSo", pt.bienSo, { shouldValidate: true });
    setValue("nhanHieu", pt.nhanHieu, { shouldValidate: true });
  }

  function dong() {
    onOpenChange(false);
    reset(GIA_TRI_MAC_DINH);
  }

  function xuLySubmit(duLieu: NhapLenhDieuXeInput) {
    const thamSo = new URLSearchParams({
      soHieu: duLieu.soHieu,
      ngayKy: duLieu.ngayKy.toISOString(),
      laiXeHoTen: duLieu.laiXeHoTen,
      bienSo: duLieu.bienSo,
      nhanHieu: duLieu.nhanHieu,
      noiDi: duLieu.noiDi,
      noiDen: duLieu.noiDen,
      mucDich: duLieu.mucDich,
      ngayDi: duLieu.ngayDi.toISOString(),
      ngayVe: duLieu.ngayVe.toISOString(),
    });
    onXemTruoc(`${API_BASE_URL}/lenh-dieu-xe/nhap-pdf?${thamSo.toString()}`, `Nháp lệnh điều xe ${duLieu.soHieu}`);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : dong())}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nháp Lệnh điều xe</DialogTitle>
          <DialogDescription>
            Y như form Lập lệnh thật - chỉ khác Số hiệu gõ tay và không lưu vào hệ thống. Người ký lấy theo người
            ký chính thức hiện tại.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(xuLySubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="laiXeLdxNhap">Lái xe</Label>
              <Combobox
                id="laiXeLdxNhap"
                value=""
                onChange={chonLaiXe}
                placeholder="-- Chọn lái xe từ Danh mục --"
                searchPlaceholder="Gõ tên để tìm..."
                emptyText="Không tìm thấy lái xe nào."
                options={(laiXeDs?.duLieu ?? []).map((nv) => ({ value: nv.id, label: nv.hoTen, moTa: nv.chucVu }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phuongTienLdxNhap">Chọn nhanh biển số</Label>
              <Combobox
                id="phuongTienLdxNhap"
                value=""
                onChange={chonPhuongTien}
                placeholder="-- Chọn biển số từ Danh mục --"
                searchPlaceholder="Gõ biển số để tìm..."
                emptyText="Không tìm thấy phương tiện nào."
                options={(phuongTienDs?.duLieu ?? []).map((pt) => ({
                  value: pt.id,
                  label: pt.bienSo,
                  moTa: pt.nhanHieu,
                }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="soHieuLdxNhap">Số hiệu</Label>
              <Input
                id="soHieuLdxNhap"
                placeholder="Ví dụ: 08/LĐX"
                aria-invalid={!!errors.soHieu}
                {...register("soHieu")}
              />
              {errors.soHieu && <p className="text-sm text-destructive">{errors.soHieu.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ngayKyLdxNhap">Ngày lập</Label>
              <Controller
                control={control}
                name="ngayKy"
                render={({ field }) => (
                  <Input
                    id="ngayKyLdxNhap"
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

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="laiXeHoTenLdxNhap">Họ tên lái xe</Label>
              <Input id="laiXeHoTenLdxNhap" aria-invalid={!!errors.laiXeHoTen} {...register("laiXeHoTen")} />
              {errors.laiXeHoTen && <p className="text-sm text-destructive">{errors.laiXeHoTen.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bienSoLdxNhap">Biển số</Label>
              <Input id="bienSoLdxNhap" aria-invalid={!!errors.bienSo} {...register("bienSo")} />
              {errors.bienSo && <p className="text-sm text-destructive">{errors.bienSo.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nhanHieuLdxNhap">Nhãn hiệu</Label>
              <Input id="nhanHieuLdxNhap" aria-invalid={!!errors.nhanHieu} {...register("nhanHieu")} />
              {errors.nhanHieu && <p className="text-sm text-destructive">{errors.nhanHieu.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="noiDiLdxNhap">Nơi đi</Label>
              <Controller
                control={control}
                name="noiDi"
                render={({ field }) => (
                  <ComboboxVanBan
                    id="noiDiLdxNhap"
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
              <Label htmlFor="noiDenLdxNhap">Nơi đến</Label>
              <Controller
                control={control}
                name="noiDen"
                render={({ field }) => (
                  <ComboboxVanBan
                    id="noiDenLdxNhap"
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
            <Label htmlFor="mucDichLdxNhap">Mục đích</Label>
            <Textarea id="mucDichLdxNhap" rows={2} aria-invalid={!!errors.mucDich} {...register("mucDich")} />
            {errors.mucDich && <p className="text-sm text-destructive">{errors.mucDich.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ngayDiLdxNhap">Ngày đi</Label>
              <Controller
                control={control}
                name="ngayDi"
                render={({ field }) => (
                  <Input
                    id="ngayDiLdxNhap"
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
              <Label htmlFor="ngayVeLdxNhap">Ngày về</Label>
              <Controller
                control={control}
                name="ngayVe"
                render={({ field }) => (
                  <Input
                    id="ngayVeLdxNhap"
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
