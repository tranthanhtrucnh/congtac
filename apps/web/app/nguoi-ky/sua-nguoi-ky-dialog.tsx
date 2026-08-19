"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { suaNguoiKySchema, type SuaNguoiKyInput } from "@congtac/validation";
import { goiApi, LoiApi } from "@/lib/api";
import { useLamMoiDanhSachNguoiKy, type NguoiKy } from "@/hooks/use-danh-sach-nguoi-ky";
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

export function SuaNguoiKyDialog({
  open,
  onOpenChange,
  nguoiKy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nguoiKy: NguoiKy | null;
}) {
  const lamMoiDanhSach = useLamMoiDanhSachNguoiKy();
  const [loiChung, setLoiChung] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SuaNguoiKyInput>({ resolver: zodResolver(suaNguoiKySchema) });

  useEffect(() => {
    if (open && nguoiKy) {
      reset({
        chucDanhKy: nguoiKy.chucDanhKy,
        theThucKy: nguoiKy.theThucKy,
        ghiChu: nguoiKy.ghiChu ?? "",
        // Chi cho chon lai giua Du phong/Ngung su dung o day - chuyen sang
        // Dang ky chinh thuc bat buoc qua nut rieng tren trang danh sach.
        trangThai: nguoiKy.trangThai === "DANG_KY_CHINH_THUC" ? undefined : nguoiKy.trangThai,
      });
      setLoiChung(null);
    }
  }, [open, nguoiKy, reset]);

  if (!nguoiKy) return null;

  async function xuLySubmit(duLieu: SuaNguoiKyInput) {
    if (!nguoiKy) return;
    setLoiChung(null);
    try {
      await goiApi(`/nguoi-ky/${nguoiKy.id}`, { method: "PATCH", body: JSON.stringify(duLieu) });
      await lamMoiDanhSach();
      onOpenChange(false);
    } catch (loi) {
      setLoiChung(loi instanceof LoiApi ? loi.message : "Không thể lưu thay đổi, vui lòng thử lại");
    }
  }

  const dangChinhThuc = nguoiKy.trangThai === "DANG_KY_CHINH_THUC";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sửa thông tin người ký</DialogTitle>
          <DialogDescription>
            {nguoiKy.nhanVien.hoTen}
            {dangChinhThuc && " — đang là người ký chính thức."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(xuLySubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="chucDanhKySuaNk">Chức danh khi ký</Label>
            <Input id="chucDanhKySuaNk" aria-invalid={!!errors.chucDanhKy} {...register("chucDanhKy")} />
            {errors.chucDanhKy && <p className="text-sm text-destructive">{errors.chucDanhKy.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="theThucKySuaNk">Thể thức ký</Label>
            <Input id="theThucKySuaNk" aria-invalid={!!errors.theThucKy} {...register("theThucKy")} />
            {errors.theThucKy && <p className="text-sm text-destructive">{errors.theThucKy.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ghiChuSuaNk">Ghi chú</Label>
            <Input id="ghiChuSuaNk" {...register("ghiChu")} />
          </div>

          {!dangChinhThuc && (
            <div className="space-y-1.5">
              <Label htmlFor="trangThaiSuaNk">Trạng thái</Label>
              <Controller
                control={control}
                name="trangThai"
                render={({ field }) => (
                  <Select
                    id="trangThaiSuaNk"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    <option value="DU_PHONG">Dự phòng</option>
                    <option value="NGUNG_SU_DUNG">Ngừng sử dụng</option>
                  </Select>
                )}
              />
            </div>
          )}
          {dangChinhThuc && (
            <p className="text-xs text-muted-foreground">
              Đang là người ký chính thức — muốn đổi trạng thái, hãy đặt người khác làm chính thức trước
              (ở trang danh sách).
            </p>
          )}

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
