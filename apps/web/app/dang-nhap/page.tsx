"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "lucide-react";
import { dangNhapSchema, type DangNhapInput } from "@congtac/validation";
import { goiApi, LoiApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

export default function TrangDangNhap() {
  const router = useRouter();
  const [loiChung, setLoiChung] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DangNhapInput>({ resolver: zodResolver(dangNhapSchema) });

  async function xuLySubmit(duLieu: DangNhapInput) {
    setLoiChung(null);
    try {
      const ketQua = await goiApi<{ nguoiDung: { phaiDoiMatKhau: boolean } }>(
        "/auth/dang-nhap",
        { method: "POST", body: JSON.stringify(duLieu) },
      );
      router.push(ketQua.nguoiDung.phaiDoiMatKhau ? "/doi-mat-khau" : "/");
      router.refresh();
    } catch (loi) {
      setLoiChung(loi instanceof LoiApi ? loi.message : "Không thể đăng nhập, vui lòng thử lại");
    }
  }

  return (
    <div className="relative flex flex-1 flex-col md:flex-row">
      {/*
        Đường xé lỗ tròn giữa 2 panel - mô phỏng cuống vé số bị xé đôi. Đây là
        chi tiết đặc trưng riêng cho công ty xổ số, không phải viền thẳng
        thông thường. Ẩn trên mobile (2 panel xếp chồng, không có "đường xé").
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-[45%] z-10 hidden md:block lg:left-1/2"
      >
        <div className="flex h-full -translate-x-1/2 flex-col justify-evenly py-8">
          {Array.from({ length: 16 }).map((_, i) => (
            <span
              key={i}
              className="block size-3 rounded-full bg-background shadow-[inset_0_1px_2px_rgba(0,0,0,0.18)]"
            />
          ))}
        </div>
      </div>

      {/* Panel thương hiệu - ẩn trên màn hình nhỏ, giữ trang gọn cho mobile */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary to-[#010419] p-10 text-primary-foreground md:flex md:w-[45%] md:flex-col md:items-center md:justify-center lg:w-1/2">
        <div
          aria-hidden
          className="absolute -left-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 -right-10 size-72 rounded-full bg-black/20 blur-3xl"
        />
        {/* Vầng sáng vàng riêng sau logo - tạo điểm nhấn ấm, tách bạch khỏi
            2 quầng sáng nền phía trên, không chạm vào biểu tượng. */}
        <div
          aria-hidden
          className="absolute left-1/2 top-[32%] size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e8b23d]/[0.12] blur-[64px]"
        />

        <p
          aria-hidden
          className="absolute right-5 top-1/2 hidden -translate-y-1/2 text-[10px] font-medium uppercase tracking-[0.3em] text-[#e8b23d]/40 [writing-mode:vertical-rl] lg:block"
        >
          Công ty XSKT An Giang — Nội bộ
        </p>

        <div className="relative flex flex-col items-center text-center">
          {/* Nhóm "letterhead": tên công ty gắn liền sát logo, đọc như 1 con
              dấu duy nhất - thay vì logo bị kẹp giữa 2 lớp chữ tách rời. */}
          <div className="animate-hien-len flex flex-col items-center" style={{ animationDelay: "0s" }}>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary-foreground/70">
              Công ty TNHH MTV
            </p>
            <span aria-hidden className="mt-2 h-px w-8 bg-[#e8b23d]/50" />
            <img
              src="/logo/logo-cong-ty-600.png"
              alt="Logo Công ty TNHH MTV Xổ số Kiến thiết An Giang"
              className="mt-4 size-36 object-contain drop-shadow-xl lg:size-40"
            />
          </div>

          {/* Nhóm "wordmark": tên rút gọn, tách hẳn khỏi logo bằng khoảng
              cách lớn để không còn đọc như bị logo chen giữa. */}
          <div
            className="animate-hien-len mt-8 flex flex-col items-center"
            style={{ animationDelay: "0.1s" }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-primary-foreground/70">
              Xổ số Kiến thiết
            </p>
            <h2 className="-mt-0.5 text-5xl font-extrabold uppercase leading-[0.95] tracking-tight lg:text-6xl">
              An Giang
            </h2>
          </div>

          {/* Chi tiết đặc trưng: dải bi số như bảng kết quả quay số thu nhỏ -
              thay cho 3 chấm trang trí chung chung, và tách bi khỏi logo. */}
          <div
            aria-hidden
            className="animate-hien-len mt-7 flex items-center gap-2.5 rounded-full border border-[#e8b23d]/25 bg-white/[0.06] px-4 py-2 shadow-lg backdrop-blur-sm"
            style={{ animationDelay: "0.2s" }}
          >
            <img
              src="/bi/bi-6-110.png"
              alt=""
              className="animate-bi-roi size-8 drop-shadow"
              style={{ animationDelay: "0.32s", "--goc-nghi": "-6deg" } as React.CSSProperties}
            />
            <img
              src="/bi/bi-3-110.png"
              alt=""
              className="animate-bi-roi size-8 drop-shadow"
              style={{ animationDelay: "0.42s", "--goc-nghi": "5deg" } as React.CSSProperties}
            />
            <img
              src="/bi/bi-9-110.png"
              alt=""
              className="animate-bi-roi size-8 drop-shadow"
              style={{ animationDelay: "0.52s", "--goc-nghi": "-4deg" } as React.CSSProperties}
            />
          </div>

          <div
            className="animate-hien-len mt-7"
            style={{ animationDelay: "0.3s" }}
          >
            <p className="max-w-xs text-sm text-primary-foreground/85">
              Hệ thống Lệnh công tác - Công lệnh - Điều xe
            </p>
            <p className="mt-1 text-xs text-primary-foreground/60">Phòng Tổ chức - Hành chính</p>
          </div>
        </div>
      </div>

      {/* Panel đăng nhập */}
      <div className="flex flex-1 items-center justify-center bg-background p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center md:items-start md:text-left">
            <img
              src="/logo/logo-cong-ty-96.png"
              alt="Logo Công ty TNHH MTV Xổ số Kiến thiết An Giang"
              className="mb-4 h-14 w-auto md:hidden"
            />
            <h1 className="text-2xl font-semibold text-foreground">Đăng nhập</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Đăng nhập bằng tài khoản được Quản trị hệ thống cấp
            </p>
          </div>

          <form onSubmit={handleSubmit(xuLySubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="tenDangNhap">Tên đăng nhập</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="tenDangNhap"
                  autoComplete="username"
                  autoFocus
                  aria-invalid={!!errors.tenDangNhap}
                  className="pl-9"
                  {...register("tenDangNhap")}
                />
              </div>
              {errors.tenDangNhap && (
                <p className="text-sm text-destructive">{errors.tenDangNhap.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="matKhau">Mật khẩu</Label>
              <PasswordInput
                id="matKhau"
                autoComplete="current-password"
                aria-invalid={!!errors.matKhau}
                {...register("matKhau")}
              />
              {errors.matKhau && (
                <p className="text-sm text-destructive">{errors.matKhau.message}</p>
              )}
            </div>

            {loiChung && (
              <div
                role="alert"
                className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {loiChung}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground md:text-left">
            Ứng dụng nội bộ — không có chức năng tự đăng ký tài khoản.
          </p>
        </div>
      </div>
    </div>
  );
}
