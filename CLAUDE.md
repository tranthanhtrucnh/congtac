# CLAUDE.md — Ứng dụng Lệnh công tác – Công lệnh – Điều xe

Ngữ cảnh nền cho Claude Code. Đọc file này đầu mỗi phiên. Chi tiết đầy đủ nằm ở các file trong `docs/` — chỉ mở khi cần, đừng tải hết vào mỗi lần:

- `docs/DAC_TA_UNG_DUNG.md` — đặc tả tổng thể, mục tiêu, module.
- `docs/QUY_TAC_NGHIEP_VU.md` — quy trình, cấp số chứng từ, cấu trúc dữ liệu 3 loại chứng từ, phân quyền.
- `docs/QUY_TAC_GIAO_DIEN.md` — nhận diện thương hiệu, màu sắc, theme, responsive, khả năng tiếp cận.
- `docs/NHAT_KY_QUYET_DINH.md` — lịch sử quyết định kỹ thuật; thêm mục mới khi chốt điều gì đó chưa có trong đặc tả.

## Bối cảnh

- Công ty TNHH MTV Xổ số Kiến thiết An Giang, Phòng TC-HC. Một người phát triển kiêm toàn bộ IT công ty — ưu tiên dễ bảo trì lâu dài hơn tối ưu kỹ thuật cầu kỳ.
- Thay quy trình thủ công (Word mẫu × Word mẫu × sổ viết tay) bằng web app nội bộ.
- **Giai đoạn phát triển ban đầu:** chạy localhost trên máy Văn thư. **Không có hạn chót cứng** — làm đúng và chắc quan trọng hơn tốc độ; không cắt kiểm thử hay bỏ quy tắc nghiệp vụ để chạy nhanh hơn.
- **Giai đoạn chính thức (sau này):** mạng nội bộ hoặc hosting ngoài.

## Stack đã chốt (chi tiết: xem NHAT_KY_QUYET_DINH.md)

TypeScript toàn dự án · Next.js (App Router) · NestJS (REST) · PostgreSQL · Prisma · Tailwind CSS + shadcn/ui · React Hook Form + Zod · TanStack Query · JWT + cookie HttpOnly · RBAC + quyền theo hành động · PDF qua trình duyệt headless (không dùng `window.print()`) · Jest/Supertest + Playwright · Modular Monolith, monorepo pnpm.

Chưa dùng ở giai đoạn này: Redis, Kafka/RabbitMQ, GraphQL, Elasticsearch, Firebase, Electron, Kubernetes, AI/LLM trong nghiệp vụ.

## Ba loại chứng từ

| Ký hiệu | Tên | Khổ in |
|---|---|---|
| LĐCT | Lệnh điều công tác | A5 (A4 nếu nhiều thành viên/nội dung dài) |
| GĐĐ | Công lệnh kiêm Giấy đi đường | A5, 2 mặt |
| LĐX | Lệnh điều xe | A5 |

## Quy tắc TUYỆT ĐỐI không vi phạm

1. **Cấp số chứng từ phải qua transaction ở database** (khóa dòng → đọc → tăng → tạo chứng từ → ghi lịch sử → commit). Không cấp số kiểu đọc-rồi-cộng-1 ở frontend.
2. **In ấn qua PDF (HTML/CSS → headless browser), không dùng `window.print()`.**
3. **Backend luôn tự kiểm tra quyền** — không chỉ ẩn nút ở giao diện.
4. **Không có chức năng tự đăng ký tài khoản.** Ứng dụng nội bộ, chỉ người có quyền `nguoi-dung.them` (thường là Quản trị hệ thống) mới tạo được tài khoản mới — không làm trang/API đăng ký công khai.
5. Giao diện 100% tiếng Việt, phông Be Vietnam Pro, không dùng `alert()`/`confirm()` mặc định.
6. Không cho trùng CCCD, không trùng biển số. **Hủy** (đánh dấu `daHuy=true`, giữ nguyên trong CSDL) không tái sử dụng số. **Ngoại lệ có kiểm soát:** chức năng **Xóa cứng** lệnh điều công tác (quyền riêng `chung-tu.xoa`, chỉ Văn thư + Quản trị hệ thống, bắt gõ chữ "Y" để xác nhận, ghi nhật ký đầy đủ) — CHỈ cho xóa khi chính lệnh điều công tác đó đang giữ số MỚI NHẤT của dãy LĐCT (từ 2026-08-28 KHÔNG còn bắt buộc công lệnh/lệnh điều xe của nó cũng phải là số mới nhất — nếu không phải, vẫn cho xóa nhưng cảnh báo trước rằng số công lệnh/lệnh điều xe đó sẽ để lại một khoảng trống vĩnh viễn trong dãy số, không lùi được bộ đếm) — xóa hẳn khỏi CSDL rồi TỰ ĐỘNG lùi bộ đếm về đúng số lớn nhất còn tồn tại nếu có thể (không dùng bảng "số trống" riêng), chứng từ lập tiếp theo tự nhiên nhận lại đúng số đó khi bộ đếm lùi được. Xem `NHAT_KY_QUYET_DINH.md` mục "Xóa cứng chứng từ - đơn giản hóa 2026-08-20", mục "Đổi xác nhận Xóa cứng sang gõ chữ Y - 2026-08-28", và mục "Nới lỏng điều kiện Xóa cứng LĐCT - 2026-08-28".
7. Mọi thao tác quan trọng (tạo/sửa/xóa/duyệt/in/ký/đóng dấu/cấp số/hủy số) phải ghi nhật ký hệ thống.

## Việc chưa chốt — hỏi lại, đừng tự đoán

- Tần suất/nơi lưu bản sao lưu dữ liệu.
- Thời gian lưu trữ tối thiểu của nhật ký hệ thống.
- Ngân sách hosting chính thức (ước tính ban đầu ~50–72k/tháng dựa trên hosting tĩnh, khả năng không đủ cho Postgres + NestJS + Next.js + Chromium headless — cần thẩm định lại).
- **Module "Phân công lịch công tác" (Trạm, Tuyến, trực hủy vé ế) — chưa build, chưa xếp lịch.** Phát hiện qua file lịch công tác thật do người dùng cung cấp (06/2026): công ty có lịch phân công định kỳ hàng tháng phức tạp hơn nhiều so với Danh mục Địa điểm hiện có — gồm (1) "Trạm" ở tỉnh khác (vd TP.HCM) với đội trực luân phiên theo tuần cho 4 mảng nghiệp vụ + trực cuối tuần riêng; (2) "Tuyến" 1-4 là tuyến cố định theo thứ trong tuần, đi qua nhiều địa điểm cùng lúc, có tài xế cố định, nhân sự đổi theo tuần; (3) lịch trực hủy vé ế các tỉnh theo ngày, luân phiên theo Ban Giám đốc phụ trách. Xem `NHAT_KY_QUYET_DINH.md` mục liên quan. Khi nào làm module này cần hỏi lại người dùng.
