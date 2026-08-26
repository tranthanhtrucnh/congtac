# Ứng dụng Lệnh công tác - Công lệnh - Điều xe

Xem `CLAUDE.md` và `docs/` để biết ngữ cảnh, quy tắc nghiệp vụ và quyết định kỹ thuật.

## Yêu cầu môi trường

- Node.js >= 20
- pnpm 9 (`corepack enable` hoặc `npm install -g pnpm@9`)
- PostgreSQL đang chạy cục bộ (mặc định `localhost:5432`)

## Cài đặt lần đầu

```bash
pnpm install
```

`pnpm install` tự chạy `prisma generate` cho `apps/api` (script `postinstall`).

Sao chép `apps/api/.env.example` thành `apps/api/.env` (đã có sẵn giá trị mặc định) và chỉnh `DATABASE_URL` cho đúng PostgreSQL thật trên máy:

```bash
cp apps/api/.env.example apps/api/.env
```

Tạo bảng dữ liệu và seed 4 vai trò + tài khoản `quantri` mặc định:

```bash
pnpm --filter @congtac/api exec prisma migrate dev --name khoi_tao_xac_thuc
pnpm --filter @congtac/api run prisma:seed
```

Mật khẩu tạm của tài khoản `quantri` được in ra terminal sau khi seed (lấy từ
`ADMIN_DEFAULT_PASSWORD` trong `.env`) — bắt buộc đổi ngay khi đăng nhập lần đầu.

## Chạy phát triển

```bash
pnpm dev
```

- Web: http://localhost:3000 (trang đăng nhập: `/dang-nhap`)
- API: http://localhost:3001/api/health

## Cấu trúc

```
apps/web            Next.js App Router (giao diện)
apps/api            NestJS (REST API, Prisma <-> PostgreSQL)
packages/shared      enum/type dùng chung (vd. TrangThaiChungTu)
packages/validation  schema Zod dùng chung
packages/ui          component giao diện dùng chung (shadcn/ui)
packages/config      tsconfig/eslint/prettier dùng chung
```

## Build

```bash
pnpm build
```

## Chạy bản chính thức (production) trên máy Văn thư

Khác với `pnpm dev` (chế độ phát triển — chậm hơn, phải mở terminal cả ngày),
chế độ production build sẵn rồi chạy, nhanh và ổn định hơn cho việc dùng
hàng ngày.

**Cài lần đầu trên máy Văn thư** (sau khi đã làm xong "Cài đặt lần đầu" ở trên):

```bash
pnpm build
```

**Chạy hàng ngày:** bấm đúp `chay-san-xuat.bat`. Mở 2 cửa sổ thu nhỏ (API,
WEB) dưới taskbar để xem log khi cần — đóng 2 cửa sổ đó là tắt ứng dụng.

**Tự khởi động khi mở máy (khỏi bấm gì):** đặt shortcut trỏ tới `chay-nen.vbs`
vào thư mục Startup của Windows — xem hướng dẫn chi tiết ngay trong file
`chay-nen.vbs` (mở bằng Notepad để đọc).

**Khi có code mới cần cập nhật:** chạy `cap-nhat-ung-dung.bat` (không phải
`chay-san-xuat.bat`) — file này tự dừng app, `git pull`, cài lại thư viện,
cập nhật cấu trúc database nếu có, build lại, rồi khởi động lại. Chạy thủ
công khi có bản mới, không cần chạy hàng ngày.
