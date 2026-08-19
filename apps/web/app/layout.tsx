import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  // 800 rieng cho tieu de dam kieu bang ket qua o trang dang nhap - phan
  // con lai cua giao dien van dung 400-700 nhu truoc, khong doi.
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Lệnh công tác - Công lệnh - Điều xe",
  description:
    "Ứng dụng nội bộ lập, kiểm tra, phê duyệt và in chứng từ công tác - Công ty TNHH MTV Xổ số Kiến thiết An Giang",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
