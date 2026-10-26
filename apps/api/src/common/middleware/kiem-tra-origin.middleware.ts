import type { NextFunction, Request, Response } from "express";

const PHUONG_THUC_CAN_KIEM_TRA = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Kiem tra mot hostname co phai la dia chi mang noi bo / ca nhan hop le khong:
 * - Loopback: localhost, 127.0.0.1, ::1, [::1]
 * - Ten may tinh trong mang noi bo khong co dau cham (NetBIOS / Single Label Domain - vd "mydell", "desktop-123")
 * - Ten mDNS / mang cuc bo: *.local
 * - Ten mien mesh Tailscale: *.ts.net
 * - Cac dai dia chi IPv4 private chuẩn RFC 1918 & Loopback:
 *   + 10.0.0.0/8 (10.0.0.0 - 10.255.255.255)
 *   + 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
 *   + 192.168.0.0/16 (192.168.0.0 - 192.255.255.255)
 *   + 127.0.0.0/8 (127.0.0.1 - 127.255.255.255)
 */
export function laHostNoiBo(hostname: string): boolean {
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "[::1]"
  ) {
    return true;
  }

  // Ten may cuc bo khong chua dau cham (NetBIOS hostname / single label)
  if (!hostname.includes(".")) {
    return true;
  }

  // mDNS hoac Tailscale mesh
  if (hostname.endsWith(".local") || hostname.endsWith(".ts.net")) {
    return true;
  }

  // Kiem tra IPv4 private & Tailscale CGNAT
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = hostname.match(ipv4Regex);
  if (match) {
    const [, p1, p2, p3, p4] = match.map(Number);
    if ([p1, p2, p3, p4].some((o) => o < 0 || o > 255)) {
      return false;
    }
    if (p1 === 10) return true;
    if (p1 === 192 && p2 === 168) return true;
    if (p1 === 172 && p2 >= 16 && p2 <= 31) return true;
    if (p1 === 127) return true;
    // Dai IP Tailscale CGNAT (RFC 6598: 100.64.0.0/10, tu 100.64.0.0 den 100.127.255.255)
    if (p1 === 100 && p2 >= 64 && p2 <= 127) return true;
  }

  return false;
}

/**
 * Kiem tra Origin co hop le khong:
 * 1. Khop voi bat ky origin nao trong danh sach cau hinh (WEB_ORIGIN tu .env).
 * 2. Hoac la mot dia chi thuoc mang noi bo (LAN, Tailscale, localhost, ten may...).
 */
export function laOriginHopLe(origin: string, dsChoPhep: string[]): boolean {
  if (dsChoPhep.includes(origin)) {
    return true;
  }
  try {
    const u = new URL(origin);
    return laHostNoiBo(u.hostname);
  } catch {
    return false;
  }
}

/**
 * Chan CSRF o muc toi thieu: voi cac request lam thay doi du lieu, header
 * Origin (trinh duyet luon tu gui kem tren fetch/XHR) phai khop 1 trong cac
 * origin duoc phep hoac thuoc mang noi bo (LAN, Tailscale, localhost).
 * Ket hop voi cookie SameSite=Lax + httpOnly da khai bao o auth.constants.ts.
 * Phu hop quy mo noi bo (xem NHAT_KY_QUYET_DINH.md).
 *
 * `webOrigin` nhan 1 CHUOI (nhu truoc) hoac 1 MANG nhieu origin duoc phep
 * cung luc - dung khi truy cap web tu nhieu dia chi khac nhau (vd vua
 * localhost luc dang phat trien, vua dia chi Tailscale khi truy cap tu xa).
 */
export function kiemTraOrigin(webOrigin: string | string[]) {
  const dsChoPhep = Array.isArray(webOrigin) ? webOrigin : [webOrigin];
  return (req: Request, res: Response, next: NextFunction) => {
    if (!PHUONG_THUC_CAN_KIEM_TRA.has(req.method)) {
      next();
      return;
    }
    const origin = req.headers.origin;
    if (origin && !laOriginHopLe(origin, dsChoPhep)) {
      res.status(403).json({ message: "Yêu cầu bị từ chối (Origin không hợp lệ)" });
      return;
    }
    next();
  };
}
