"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "lucide-react";
import { dangNhapSchema, type DangNhapInput } from "@congtac/validation";
import { goiApi, LoiApi } from "@/lib/api";
import { duongDanSauDangNhap } from "@/lib/dieu-huong-sau-dang-nhap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

/**
 * Lop hoa tiet "Modern Technology" phia sau panel thuong hieu trang dang
 * nhap (2026-08-26, yeu cau nguoi dung - xem NHAT_KY_QUYET_DINH.md). THUAN
 * TRANG TRI (aria-hidden, pointer-events-none) - dat lam con dau tien trong
 * panel de LUON nam duoi logo/chu/dai bi so/2 quang sang goc da co san (thu
 * tu DOM quyet dinh lop ve trong 1 the cha `relative`, khong dung z-index
 * rieng de khong xung dot voi cac phan tu hien co). Khong dong den bat ky
 * noi dung/bo cuc/logo/chu/bi so nao - chi them moi lop nay.
 *
 * Gom: circuit trace 2 ben (co 1 diem sang chay doc), dot matrix, node
 * connection, vong HUD tinh (KHONG xoay - yeu cau rieng cua nguoi dung) phia
 * sau logo, 2 hexagon outline, vai diem sang/particle troi rat nhe, luoi
 * perspective va digital wave o day panel. Tat ca dung mau trang
 * (currentColor/bg-white) opacity thap (~0.05-0.16), animation rat cham -
 * xem cac @keyframes circuit-flow/glow-pulse/wave-drift/particle-float
 * trong globals.css (deu tat khi prefers-reduced-motion).
 */
function HoaTietCongNgheDangNhap() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Circuit trace ben trai + 1 diem sang chay doc duong mach */}
      <svg
        className="absolute left-0 top-0 h-full w-14 text-white"
        viewBox="0 0 56 400"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M12,-10 L12,90 L28,110 L28,230 L14,250 L14,410"
          stroke="currentColor"
          strokeOpacity="0.14"
          strokeWidth="1.5"
        />
        <path
          d="M12,-10 L12,90 L28,110 L28,230 L14,250 L14,410"
          stroke="currentColor"
          strokeOpacity="0.45"
          strokeWidth="1.5"
          strokeDasharray="4 300"
          className="animate-circuit-flow"
        />
        <rect x="9" y="87" width="6" height="6" fill="currentColor" fillOpacity="0.14" />
        <rect x="25" y="227" width="6" height="6" fill="currentColor" fillOpacity="0.14" />
      </svg>

      {/* Circuit trace ben phai */}
      <svg
        className="absolute right-0 top-0 h-full w-14 text-white"
        viewBox="0 0 56 400"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M44,410 L44,300 L26,280 L26,150 L40,130 L40,-10"
          stroke="currentColor"
          strokeOpacity="0.14"
          strokeWidth="1.5"
        />
        <path
          d="M44,410 L44,300 L26,280 L26,150 L40,130 L40,-10"
          stroke="currentColor"
          strokeOpacity="0.45"
          strokeWidth="1.5"
          strokeDasharray="4 300"
          className="animate-circuit-flow"
          style={{ animationDelay: "3.5s" }}
        />
        <rect x="41" y="297" width="6" height="6" fill="currentColor" fillOpacity="0.14" />
        <rect x="23" y="147" width="6" height="6" fill="currentColor" fillOpacity="0.14" />
      </svg>

      {/* Digital dot matrix - goc tren phai, mo dan ra ngoai bang mask */}
      <div
        className="absolute right-6 top-10 size-28 opacity-[0.14] md:size-36"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1.5px)",
          backgroundSize: "14px 14px",
          maskImage: "radial-gradient(circle, black, transparent 75%)",
          WebkitMaskImage: "radial-gradient(circle, black, transparent 75%)",
        }}
      />

      {/* Node connection nho - vung trong giua quang sang goc va logo */}
      <svg
        className="absolute left-8 top-14 size-40 text-white opacity-[0.14] md:size-48"
        viewBox="0 0 160 160"
        fill="none"
      >
        <g stroke="currentColor" strokeWidth="1">
          <line x1="20" y1="30" x2="70" y2="15" />
          <line x1="70" y1="15" x2="120" y2="45" />
          <line x1="70" y1="15" x2="55" y2="75" />
          <line x1="120" y1="45" x2="140" y2="100" />
          <line x1="55" y1="75" x2="20" y2="100" />
        </g>
        <g fill="currentColor">
          <circle cx="20" cy="30" r="2.5" />
          <circle cx="70" cy="15" r="2.5" />
          <circle cx="120" cy="45" r="2.5" />
          <circle cx="55" cy="75" r="2.5" />
          <circle cx="140" cy="100" r="2.5" />
          <circle cx="20" cy="100" r="2.5" />
        </g>
      </svg>

      {/* Vong HUD TINH (khong xoay theo yeu cau) phia sau logo - dung tam
          voi quang sang vang da co san (left-1/2 top-[32%]) */}
      <svg
        className="absolute left-1/2 top-[32%] size-72 -translate-x-1/2 -translate-y-1/2 text-white opacity-[0.1] md:size-80"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle cx="100" cy="100" r="98" stroke="currentColor" strokeWidth="0.75" />
        <circle cx="100" cy="100" r="82" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 6" />
        <circle cx="100" cy="100" r="66" stroke="currentColor" strokeWidth="0.75" />
        <path
          d="M100,2 L100,14 M100,186 L100,198 M2,100 L14,100 M186,100 L198,100"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>

      {/* Hexagon outline trang tri o 2 vung trong */}
      <svg className="absolute right-12 top-28 size-10 text-white opacity-[0.14]" viewBox="0 0 40 40" fill="none">
        <path d="M20 2 L36 11 V29 L20 38 L4 29 V11 Z" stroke="currentColor" strokeWidth="1.25" />
      </svg>
      <svg className="absolute left-14 bottom-40 size-8 text-white opacity-[0.12]" viewBox="0 0 40 40" fill="none">
        <path d="M20 2 L36 11 V29 L20 38 L4 29 V11 Z" stroke="currentColor" strokeWidth="1.25" />
      </svg>

      {/* Vai diem sang nho, pulse rat cham - tao chieu sau */}
      <span
        className="animate-glow-pulse absolute right-16 top-1/3 size-2 rounded-full bg-white blur-[3px]"
        style={{ animationDelay: "0s" }}
      />
      <span
        className="animate-glow-pulse absolute left-10 top-1/2 size-2 rounded-full bg-white blur-[3px]"
        style={{ animationDelay: "1.8s" }}
      />
      <span
        className="animate-glow-pulse absolute right-24 bottom-28 size-1.5 rounded-full bg-white blur-[2px]"
        style={{ animationDelay: "3.2s" }}
      />

      {/* Vai particle nho troi rat nhe */}
      <span
        className="animate-particle-float absolute left-1/4 top-1/4 size-1 rounded-full bg-white"
        style={{ animationDelay: "0s" }}
      />
      <span
        className="animate-particle-float absolute right-1/3 top-2/3 size-1 rounded-full bg-white"
        style={{ animationDelay: "2s" }}
      />
      <span
        className="animate-particle-float absolute left-1/3 bottom-24 size-1 rounded-full bg-white"
        style={{ animationDelay: "4s" }}
      />

      {/* Perspective grid rat nhe o day panel - "san" cong nghe mo dan len tren */}
      <div
        className="absolute inset-x-0 bottom-0 h-28 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, white 0, white 1px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, white 0, white 1px, transparent 1px, transparent 24px)",
          transform: "perspective(220px) rotateX(58deg)",
          transformOrigin: "bottom",
          maskImage: "linear-gradient(to top, black, transparent)",
          WebkitMaskImage: "linear-gradient(to top, black, transparent)",
        }}
      />

      {/* Digital wave o day panel - troi ngang rat cham */}
      <div className="absolute inset-x-0 bottom-0 h-20 overflow-hidden opacity-[0.12] md:h-24">
        <svg
          className="animate-wave-drift h-full w-[130%] text-white"
          viewBox="0 0 480 100"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0,60 C60,30 120,90 180,60 C240,30 300,90 360,60 C420,30 460,50 480,55 L480,100 L0,100 Z"
            fill="currentColor"
            fillOpacity="0.5"
          />
          <path
            d="M0,70 C60,50 120,90 180,70 C240,50 300,90 360,70 C420,50 460,65 480,68"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
        </svg>
      </div>
    </div>
  );
}

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
      const ketQua = await goiApi<{ nguoiDung: { phaiDoiMatKhau: boolean; quyen: string[] } }>(
        "/auth/dang-nhap",
        { method: "POST", body: JSON.stringify(duLieu) },
      );
      router.push(
        ketQua.nguoiDung.phaiDoiMatKhau ? "/doi-mat-khau" : duongDanSauDangNhap(ketQua.nguoiDung.quyen),
      );
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

      {/* Panel thương hiệu - ẩn trên màn hình nhỏ, giữ trang gọn cho mobile.
          Nền gradient HỒNG (2026-08-26, người dùng yêu cầu) - CHỈ riêng
          trang trí panel này, dùng mã màu cứng thay vì token --primary (vẫn
          giữ nguyên "Xanh dương = màu chủ đạo" cho toàn bộ phần còn lại của
          ứng dụng theo QUY_TAC_GIAO_DIEN.md, không đổi token dùng chung).
          Ban dau dung tong tram/toi (#d6336c -> #1a0512), sau doi sang tong
          SANG hon (#ff8ab3 -> #e11d74). Cap nhat 2026-08-26 (redesign
          "Modern Technology" - xem NHAT_KY_QUYET_DINH.md): doi sang gradient
          3 diem dung (#F472A5 -> #EC407A -> #D81B60) theo hex nguoi dung gui
          de co chieu sau hon, kem lop hoa tiet cong nghe trang tri
          (HoaTietCongNgheDangNhap ben duoi - circuit/dot matrix/HUD/hexagon/
          wave/grid, thuan trang tri opacity thap). CHUA xem duoc tren trinh
          duyet that (sandbox khong render duoc) - can luu y: vung goc tren
          sang co the lam giam do tuong phan cua chu trang/70% opacity dat
          len tren - neu chu kho doc bao lai de dieu chinh. */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#F472A5] via-[#EC407A] to-[#D81B60] p-10 text-primary-foreground md:flex md:w-[45%] md:flex-col md:items-center md:justify-center lg:w-1/2">
        <HoaTietCongNgheDangNhap />
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
            {/* animationDelay 2 gia tri (cach nhau dau phay) khop voi 2
                animation trong .animate-bi-roi (bi-roi-vao, bi-noi) - gia tri
                thu 2 = delay roi vao + 0.85s (thoi luong bi-roi-vao) de bi
                troi nhe LIEN TUC chi bat dau NGAY SAU KHI da roi vao xong,
                khong chong lan gay giat. Nguoi dung yeu cau 2026-08-26, xem
                NHAT_KY_QUYET_DINH.md. */}
            <img
              src="/bi/bi-6-110.png"
              alt=""
              className="animate-bi-roi size-8 drop-shadow"
              style={{ animationDelay: "0.32s, 1.17s", "--goc-nghi": "-6deg" } as React.CSSProperties}
            />
            <img
              src="/bi/bi-3-110.png"
              alt=""
              className="animate-bi-roi size-8 drop-shadow"
              style={{ animationDelay: "0.42s, 1.27s", "--goc-nghi": "5deg" } as React.CSSProperties}
            />
            <img
              src="/bi/bi-9-110.png"
              alt=""
              className="animate-bi-roi size-8 drop-shadow"
              style={{ animationDelay: "0.52s, 1.37s", "--goc-nghi": "-4deg" } as React.CSSProperties}
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
