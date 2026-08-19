"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taoNguoiKySchema, type TaoNguoiKyInput } from "@congtac/validation";
import { goiApi, LoiApi } from "@/lib/api";
import { useLamMoiDanhSachNguoiKy } from "@/hooks/use-danh-sach-nguoi-ky";
import { useDanhSachNhanVien } from "@/hooks/use-danh-sach-nhan-vien";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function TaoNguoiKyDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const lamMoiDanhSach = useLamMoiDanhSachNguoiKy();
  const [loiChung, setLoiChung] = useState<string | null>(null);

  // Lay ca danh sach (toi da 100) de loc ngay trong Combobox (go tim, khong
  // can goi API rieng cho tung ky tu go).
  const { data: nhanVien } = useDanhSachNhanVien({
    trang: 1,
    kichThuoc: 100,
    tuKhoa: "",
    chiTaiXe: false,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaoNguoiKyInput>({
    resolver: zodResolver(taoNguoiKySchema),
    defaultValues: { theThucKy: "TL. GIÁM ĐỐC" },
  });

  async function xuLySubmit(duLieu: TaoNguoiKyInput) {
    setLoiChung(null);
    try {
      await goiApi("/nguoi-ky", { method: "POST", body: JSON.stringify(duLieu) });
      await lamMoiDanhSach();
      dong();
    } catch (loi) {
      setLoiChung(loi instanceof LoiApi ? loi.message : "Không thể thêm người ký, vui lòng thử lại");
    }
  }

  function dong() {
    onOpenChange(false);
    reset({ theThucKy: "TL. GIÁM ĐỐC" });
    setLoiChung(null);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : dong())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm người ký</DialogTitle>
          <DialogDescription>
            Người mới thêm mặc định ở trạng thái Dự phòng — vào danh sách rồi bấm "Đặt làm người ký
            chính thức" khi cần dùng.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(xuLySubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="nhanVienNk">Cán bộ</Label>
            <Controller
              control={control}
              name="nhanVienId"
              render={({ field }) => (
                <Combobox
                  id="nhanVienNk"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  ariaInvalid={!!errors.nhanVienId}
                  placeholder="-- Chọn cán bộ --"
                  searchPlaceholder="Gõ tên để tìm..."
                  emptyText="Không tìm thấy cán bộ nào."
                  options={
                    nhanVien?.duLieu.map((nv) => ({
                      value: nv.id,
                      label: nv.hoTen,
                      moTa: nv.chucVu,
                    })) ?? []
                  }
                />
              )}
            />
            {errors.nhanVienId && <p className="text-sm text-destructive">{errors.nhanVienId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="chucDanhKyNk">Chức danh khi ký</Label>
            <Input
              id="chucDanhKyNk"
              placeholder="Trưởng phòng Tổ chức - Hành chính"
              aria-invalid={!!errors.chucDanhKy}
              {...register("chucDanhKy")}
            />
            {errors.chucDanhKy && <p className="text-sm text-destructive">{errors.chucDanhKy.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="theThucKyNk">Thể thức ký</Label>
            <Input id="theThucKyNk" aria-invalid={!!errors.theThucKy} {...register("theThucKy")} />
            {errors.theThucKy && <p className="text-sm text-destructive">{errors.theThucKy.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ghiChuNk">Ghi chú</Label>
            <Input id="ghiChuNk" {...register("ghiChu")} />
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
              {isSubmitting ? "Đang thêm..." : "Thêm người ký"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
