"use client";

import { Fragment, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { suaNguoiDungSchema, type SuaNguoiDungInput } from "@congtac/validation";
import { goiApi, LoiApi } from "@/lib/api";
import { useDanhSachVaiTro, useToanBoQuyen, type QuyenCuaVaiTro } from "@/hooks/use-danh-sach-vai-tro";
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

// Giong het NHAN_NHOM_QUYEN o /vai-tro/page.tsx - copy lai (khong tach dung
// chung) vi chi 2 noi dung, danh sach ngan, don gian, xem NHAT_KY_QUYET_DINH.md
// muc "Phan quyen rieng theo nguoi dung".
const NHAN_NHOM_QUYEN: Record<string, string> = {
  "nguoi-dung": "Người dùng",
  "nhan-vien": "Nhân viên",
  "phuong-tien": "Phương tiện",
  "dia-diem": "Địa điểm",
  "chung-tu": "Chứng từ",
  "danh-so": "Đánh số chứng từ",
  "nguoi-ky": "Người ký",
  "don-vi": "Thông tin đơn vị",
  "nhat-ky": "Nhật ký hệ thống",
  "sao-luu": "Sao lưu / phục hồi",
  "vai-tro": "Vai trò & phân quyền",
};

function nhomQuyen(danhSach: QuyenCuaVaiTro[]) {
  const theoNhom = new Map<string, QuyenCuaVaiTro[]>();
  for (const q of danhSach) {
    const ds = theoNhom.get(q.nhom) ?? [];
    ds.push(q);
    theoNhom.set(q.nhom, ds);
  }
  return Array.from(theoNhom.entries()).sort(([a], [b]) =>
    (NHAN_NHOM_QUYEN[a] ?? a).localeCompare(NHAN_NHOM_QUYEN[b] ?? b, "vi"),
  );
}

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
  const { data: toanBoQuyen } = useToanBoQuyen();
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
      reset({
        hoTen: nguoiDung.hoTen,
        vaiTroIds: nguoiDung.vaiTro.map((v) => v.id),
        quyenRieng: nguoiDung.quyenRieng.map((q) => q.ma),
      });
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

          <div className="space-y-1.5">
            <Label>Quyền bổ sung riêng</Label>
            <p className="text-xs text-muted-foreground">
              Chỉ dùng khi cần cấp THÊM cho riêng người này 1 vài quyền lẻ mà vai trò ở trên chưa có — quyền
              này CỘNG THÊM vào quyền từ vai trò, không thay thế và không thể dùng để bớt quyền vai trò đã cấp.
            </p>
            <Controller
              control={control}
              name="quyenRieng"
              render={({ field }) => (
                <div className="max-h-56 space-y-3 overflow-y-auto rounded-md border border-border p-3">
                  {toanBoQuyen &&
                    nhomQuyen(toanBoQuyen).map(([nhom, dsQuyen]) => (
                      <Fragment key={nhom}>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {NHAN_NHOM_QUYEN[nhom] ?? nhom}
                        </p>
                        <div className="space-y-1.5 pl-1">
                          {dsQuyen.map((q) => {
                            const daChon = field.value?.includes(q.ma) ?? false;
                            return (
                              <label key={q.ma} className="flex items-center gap-2 text-sm text-foreground">
                                <Checkbox
                                  checked={daChon}
                                  onCheckedChange={(checked) => {
                                    const giaTri = field.value ?? [];
                                    field.onChange(
                                      checked ? [...giaTri, q.ma] : giaTri.filter((ma) => ma !== q.ma),
                                    );
                                  }}
                                />
                                {q.moTa ?? q.ma}
                              </label>
                            );
                          })}
                        </div>
                      </Fragment>
                    ))}
                </div>
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
