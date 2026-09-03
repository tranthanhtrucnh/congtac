"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taoLenhDieuXeSchema, type TaoLenhDieuXeInput } from "@congtac/validation";
import { goiApi, LoiApi } from "@/lib/api";
import { useLamMoiDanhSachLenhDieuXe } from "@/hooks/use-danh-sach-lenh-dieu-xe";
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
import { CanhBaoNgayLapKhongTheoThuTu } from "@/components/canh-bao-ngay-lap-khong-theo-thu-tu";
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

export function TaoLenhDieuXeDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const lamMoiDanhSach = useLamMoiDanhSachLenhDieuXe();
  const [loiChung, setLoiChung] = useState<string | null>(null);

  // Lay toi da 100 de loc ngay trong Combobox/ComboboxVanBan (go tim tai
  // cho, khong goi API rieng cho tung ky tu go) - giong cach lam o Nguoi ky.
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
  } = useForm<TaoLenhDieuXeInput>({
    resolver: zodResolver(taoLenhDieuXeSchema),
    defaultValues: { ngayKy: new Date(ngayHomNay()), mucDich: "Công tác" },
  });

  // Gioi han "min" cua o Ngay ve theo Ngay di dang nhap - chan tu luc chon
  // ngay tren giao dien, khong doi nguoi dung bam Luu moi thay loi (Zod van
  // kiem tra lai o server, xem tao-lenh-dieu-xe.schema.ts).
  const ngayKyDangNhap = watch("ngayKy");
  const ngayDiDangNhap = watch("ngayDi");
  const ngayVeDangNhap = watch("ngayVe");
  const ngayDiMin = ngayDiDangNhap ? new Date(ngayDiDangNhap).toISOString().slice(0, 10) : undefined;
  const laiXeDaChon = watch("laiXeId");
  const phuongTienDaChon = watch("phuongTienId");

  // Doi Ngay di sang SAU Ngay ve dang co (vd doi Ngay di tu 5/8 -> 10/8 nhung
  // Ngay ve van dang la 7/8) thi tu keo Ngay ve theo bang Ngay di - "min" o
  // input chi chan chon ngay MOI sai, khong tu sua gia tri CU da nhap truoc do.
  useEffect(() => {
    if (ngayDiDangNhap && ngayVeDangNhap && new Date(ngayVeDangNhap) < new Date(ngayDiDangNhap)) {
      setValue("ngayVe", ngayDiDangNhap, { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ngayDiDangNhap]);

  // Chon lai xe xong thi tu dien bien so xe thuong dung cua lai xe do (neu
  // co) - van sua duoc binh thuong sau, chi la goi y cho nhanh.
  function chonLaiXe(laiXeId: string) {
    setValue("laiXeId", laiXeId, { shouldValidate: true });
    const xeThuongDung = phuongTienDs?.duLieu.find((pt) => pt.taiXeThuongDungId === laiXeId);
    if (xeThuongDung) {
      setValue("phuongTienId", xeThuongDung.id, { shouldValidate: true });
    }
  }

  async function xuLySubmit(duLieu: TaoLenhDieuXeInput) {
    setLoiChung(null);
    try {
      await goiApi("/lenh-dieu-xe", { method: "POST", body: JSON.stringify(duLieu) });
      await lamMoiDanhSach();
      dong();
    } catch (loi) {
      setLoiChung(loi instanceof LoiApi ? loi.message : "Không thể tạo lệnh điều xe, vui lòng thử lại");
    }
  }

  function dong() {
    onOpenChange(false);
    reset({ ngayKy: new Date(ngayHomNay()), mucDich: "Công tác" });
    setLoiChung(null);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : dong())}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Lập lệnh điều xe</DialogTitle>
          <DialogDescription>
            Số hiệu tự cấp theo năm lập. Sửa được cho đến khi hủy, không cần chờ duyệt.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(xuLySubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="laiXeLdx">Lái xe</Label>
              <Controller
                control={control}
                name="laiXeId"
                render={({ field }) => (
                  <Combobox
                    id="laiXeLdx"
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
              <Label htmlFor="phuongTienLdx">Biển số xe</Label>
              <Controller
                control={control}
                name="phuongTienId"
                render={({ field }) => (
                  <Combobox
                    id="phuongTienLdx"
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
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="noiDiLdx">Nơi đi</Label>
              <Controller
                control={control}
                name="noiDi"
                render={({ field }) => (
                  <ComboboxVanBan
                    id="noiDiLdx"
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
              <Label htmlFor="noiDenLdx">Nơi đến</Label>
              <Controller
                control={control}
                name="noiDen"
                render={({ field }) => (
                  <ComboboxVanBan
                    id="noiDenLdx"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    ariaInvalid={!!errors.noiDen}
                    placeholder="..."
                    goiY={goiYDiaDiem}
                  />
                )}
              />
              {errors.noiDen && <p className="text-sm text-destructive">{errors.noiDen.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mucDichLdx">Mục đích</Label>
            <Textarea
              id="mucDichLdx"
              rows={2}
              aria-invalid={!!errors.mucDich}
              {...register("mucDich")}
            />
            {errors.mucDich && <p className="text-sm text-destructive">{errors.mucDich.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ngayKyLdx">Ngày lập</Label>
              <Controller
                control={control}
                name="ngayKy"
                render={({ field }) => (
                  <Input
                    id="ngayKyLdx"
                    type="date"
                    aria-invalid={!!errors.ngayKy}
                    value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                )}
              />
              {errors.ngayKy && <p className="text-sm text-destructive">{errors.ngayKy.message}</p>}
              <p className="text-xs text-muted-foreground">Quyết định năm cấp số hiệu.</p>
              <CanhBaoNgayLapKhongTheoThuTu loaiChungTu="LDX" ngayKy={ngayKyDangNhap} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ngayDiLdx">Ngày đi</Label>
              <Controller
                control={control}
                name="ngayDi"
                render={({ field }) => (
                  <Input
                    id="ngayDiLdx"
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
              <Label htmlFor="ngayVeLdx">Ngày về</Label>
              <Controller
                control={control}
                name="ngayVe"
                render={({ field }) => (
                  <Input
                    id="ngayVeLdx"
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
            <Button type="button" variant="outline" onClick={dong}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang tạo..." : "Lập lệnh điều xe"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
