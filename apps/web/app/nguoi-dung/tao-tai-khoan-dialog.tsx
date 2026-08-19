"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taoNguoiDungSchema, type TaoNguoiDungInput } from "@congtac/validation";
import { goiApi, LoiApi } from "@/lib/api";
import { useDanhSachVaiTro } from "@/hooks/use-danh-sach-vai-tro";
import { useLamMoiDanhSachNguoiDung } from "@/hooks/use-danh-sach-nguoi-dung";
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

interface KetQuaTao {
  tenDangNhap: string;
  matKhauTam: string;
}

export function TaoTaiKhoanDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: danhSachVaiTro } = useDanhSachVaiTro();
  const lamMoiDanhSach = useLamMoiDanhSachNguoiDung();
  const [loiChung, setLoiChung] = useState<string | null>(null);
  const [ketQuaTao, setKetQuaTao] = useState<KetQuaTao | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaoNguoiDungInput>({
    resolver: zodResolver(taoNguoiDungSchema),
    defaultValues: { vaiTroIds: [] },
  });

  async function xuLySubmit(duLieu: TaoNguoiDungInput) {
    setLoiChung(null);
    try {
      const ketQua = await goiApi<{ nguoiDung: { tenDangNhap: string }; matKhauTam: string }>(
        "/nguoi-dung",
        { method: "POST", body: JSON.stringify(duLieu) },
      );
      setKetQuaTao({ tenDangNhap: ketQua.nguoiDung.tenDangNhap, matKhauTam: ketQua.matKhauTam });
      await lamMoiDanhSach();
    } catch (loi) {
      setLoiChung(loi instanceof LoiApi ? loi.message : "Không thể tạo tài khoản, vui lòng thử lại");
    }
  }

  function dongDialog() {
    onOpenChange(false);
    reset();
    setKetQuaTao(null);
    setLoiChung(null);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : dongDialog())}>
      <DialogContent>
        {ketQuaTao ? (
          <>
            <DialogHeader>
              <DialogTitle>Đã tạo tài khoản</DialogTitle>
              <DialogDescription>
                Ghi lại mật khẩu tạm bên dưới và gửi cho người dùng — mật khẩu này chỉ hiển thị
                một lần. Người dùng sẽ phải đổi mật khẩu ngay lần đăng nhập đầu.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 rounded-md border border-border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Tên đăng nhập</p>
              <p className="font-mono text-sm font-medium text-foreground">
                {ketQuaTao.tenDangNhap}
              </p>
              <p className="pt-2 text-sm text-muted-foreground">Mật khẩu tạm</p>
              <p className="font-mono text-base font-semibold text-foreground">
                {ketQuaTao.matKhauTam}
              </p>
            </div>
            <DialogFooter>
              <Button type="button" onClick={dongDialog}>
                Đã lưu, đóng
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Tạo tài khoản</DialogTitle>
              <DialogDescription>
                Không có đăng ký công khai — chỉ Quản trị hệ thống tạo tài khoản tại đây.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(xuLySubmit)} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="tenDangNhap">Tên đăng nhập</Label>
                <Input
                  id="tenDangNhap"
                  aria-invalid={!!errors.tenDangNhap}
                  {...register("tenDangNhap")}
                />
                {errors.tenDangNhap && (
                  <p className="text-sm text-destructive">{errors.tenDangNhap.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hoTen">Họ tên</Label>
                <Input id="hoTen" aria-invalid={!!errors.hoTen} {...register("hoTen")} />
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
                          <label
                            key={vaiTro.id}
                            className="flex items-center gap-2 text-sm text-foreground"
                          >
                            <Checkbox
                              checked={daChon}
                              onCheckedChange={(checked) => {
                                const gia_tri = field.value ?? [];
                                field.onChange(
                                  checked
                                    ? [...gia_tri, vaiTro.id]
                                    : gia_tri.filter((id) => id !== vaiTro.id),
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
                <div
                  role="alert"
                  className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {loiChung}
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={dongDialog}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Đang tạo..." : "Tạo tài khoản"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
