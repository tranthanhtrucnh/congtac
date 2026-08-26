import type { NextConfig } from "next";

// Proxy /api/* sang backend NestJS NGAY TRONG server Next.js (server-to-server,
// khong qua trinh duyet) - giup trinh duyet luon goi API cung-origin voi
// trang web (vd "/api/...") thay vi mot URL tuyet doi gan cung "localhost"
// luc build. Nho vay web truy cap duoc tu BAT KY thiet bi/hostname nao (may
// khac trong mang LAN, qua Tailscale, domain that sau nay...) ma KHONG can
// build lai rieng cho tung dia chi - chi backend (API_INTERNAL_URL, luon la
// dia chi noi bo cua chinh may dang chay web) la co dinh. Xem
// NHAT_KY_QUYET_DINH.md muc "Truy cap tu xa qua Tailscale".
const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:3001";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_INTERNAL_URL}/api/:path*` }];
  },
};

export default nextConfig;
