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
  // khong, request anh khi CHUA dang nhap se bi redirect ve /dang-nhap
  // (tra ve HTML thay vi anh), lam trinh duyet hien icon anh loi.
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg)$).*)"],
};
