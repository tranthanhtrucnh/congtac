import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DUONG_DAN_CONG_KHAI = ["/dang-nhap"];

/**
 * Chi kiem tra su xuat hien cua cookie access_token de dieu huong nhanh o
 * UI - KHONG phai lop bao mat that su. Lop bao mat that su la backend tu
 * kiem tra JWT + quyen tren moi request API (JwtAuthGuard/PermissionsGuard),
 * dung theo CLAUDE.md quy tac #3.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const laDuongDanCongKhai = DUONG_DAN_CONG_KHAI.some((duongDan) => pathname.startsWith(duongDan));
  const coPhienDangNhap = request.cookies.has("access_token");

  if (!coPhienDangNhap && !laDuongDanCongKhai) {
    const url = request.nextUrl.clone();
    url.pathname = "/dang-nhap";
    return NextResponse.redirect(url);
  }

  if (coPhienDangNhap && laDuongDanCongKhai) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Bo qua file tinh trong /public (logo, anh trai bi, favicon, v.v.) - neu
  // khong, request anh khi CHUA dang nhap se bi redirect ve /dang-nhap (tra
  // ve HTML thay vi anh), lam trinh duyet hien icon anh loi.
  //
  // Bo qua ca "/api/*" (them 2026-08-20) - kem tu luc API duoc goi qua duong
  // dan tuong doi "/api/..." CUNG origin voi web (proxy trong next.config.ts,
  // xem NHAT_KY_QUYET_DINH.md muc "Truy cap tu xa qua Tailscale") thay vi 1
  // URL tuyet doi khac cong nhu truoc, cac request API GIO MOI thuc su di
  // qua middleware nay - va vi "/api/auth/dang-nhap" khong khop
  // DUONG_DAN_CONG_KHAI (chi khai bao "/dang-nhap"), middleware tu y
  // redirect ca request POST dang nhap sang trang /dang-nhap (chi nhan GET)
  // -> loi 405. Middleware nay CHI danh cho dieu huong UI (trang), khong
  // phai lop bao mat that su cho API (backend da tu kiem tra JWT rieng,
  // dung comment tren ham proxy()) nen loai han /api/* la dung, khong lam
  // giam bao mat.
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg)$).*)"],
};
