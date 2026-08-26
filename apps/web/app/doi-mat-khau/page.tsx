"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { doiMatKhauSchema, type DoiMatKhauInput } from "@congtac/validation";
import { goiApi, LoiApi } from "@/lib/api";
import { duongDanSauDangNhap } from "@/lib/dieu-huong-sau-dang-nhap";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

export default function TrangDoiMatKhau() {
  const router = useRouter();
  const [loiChung, setLoiChung] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DoiMatKhauInput>({ resolver: zodResolver(doiMatKhauSchema) });

  async function xuLySubmit(duLieu: DoiMatKhauInput) {
    setLoiChung(null);
    try {
      const ketQua = await goiApi<{ quyen: string[] }>("/auth/doi-mat-khau", {
        method: "POST",
        body: JSON.stringify(duLieu),
      });
      router.push(duongDanSauDangNhap(ketQua.quyen));
      router.refresh();
    } catch (loi) {
      setLoiChung(loi instanceof LoiApi ? loi.message : "Không thể đổi mật khẩu, vui lòng thử lại");
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-background p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-foreground">Đổi mật khẩu</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Bạn cần đổi mật khẩu trước khi tiếp tục sử dụng hệ thống.
        </p>

        <form onSubmit={handleSubmit(xuLySubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="matKhauHienTai">Mật khẩu hiện tại</Label>
            <PasswordInput
              id="matKhauHienTai"
              autoComplete="current-password"
              aria-invalid={!!errors.matKhauHienTai}
              {...register("matKhauHienTai")}
            />
            {errors.matKhauHienTai && (
              <p className="text-sm text-destructive">{errors.matKhauHienTai.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="matKhauMoi">Mật khẩu mới</Label>
            <PasswordInput
              id="matKhauMoi"
              autoComplete="new-password"
              aria-invalid={!!errors.matKhauMoi}
              {...register("matKhauMoi")}
            />
            {errors.matKhauMoi && (
              <p className="text-sm text-destructive">{errors.matKhauMoi.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="xacNhanMatKhauMoi">Nhập lại mật khẩu mới</Label>
            <PasswordInput
              id="xacNhanMatKhauMoi"
              autoComplete="new-password"
              aria-invalid={!!errors.xacNhanMatKhauMoi}
              {...register("xacNhanMatKhauMoi")}
            />
            {errors.xacNhanMatKhauMoi && (
              <p className="text-sm text-destructive">{errors.xacNhanMatKhauMoi.message}</p>
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu..." : "Đổi mật khẩu"}
          </Button>
        </form>
      </div>
    </div>
  );
}
