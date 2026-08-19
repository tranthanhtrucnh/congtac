# Đặc tả ứng dụng — Lệnh công tác, Công lệnh, Điều xe

Bản markdown dùng cho phát triển. Chi tiết nghiệp vụ: `QUY_TAC_NGHIEP_VU.md`. Chi tiết giao diện: `QUY_TAC_GIAO_DIEN.md`. Lịch sử quyết định kỹ thuật: `NHAT_KY_QUYET_DINH.md`. Bản đầy đủ có định dạng hành chính (dùng để trình lãnh đạo) là file .docx cùng tên trong thư mục gốc dự án.

## 1. Mục tiêu

Xây dựng ứng dụng web phục vụ lập, kiểm tra, in và quản lý chứng từ công tác (Văn thư lập và in trực tiếp, không qua bước phê duyệt — xem `NHAT_KY_QUYET_DINH.md` muc "Bỏ luồng phê duyệt"), đồng thời quản lý các danh mục dùng chung:

- Lệnh điều công tác (LĐCT), Công lệnh (GĐĐ), Lệnh điều xe (LĐX).
- Danh mục cán bộ/nhân viên, danh mục phương tiện.
- Người dùng, vai trò và phân quyền.

## 2. Phạm vi và giai đoạn

- **Giai đoạn phát triển ban đầu:** code và test trên máy cá nhân của người phát triển bằng localhost; chỉ bàn giao và chạy trên máy tại bộ phận Văn thư khi một phần việc đã hoàn chỉnh. Không có hạn chót cứng — xem `NHAT_KY_QUYET_DINH.md`.
- **Giai đoạn chính thức:** chuyển sang mạng nội bộ công ty hoặc hosting ngoài.

## 3. Kiến trúc tổng thể

**Modular Monolith** trong một monorepo — một hệ thống thống nhất, mã nguồn chia theo module nghiệp vụ. Không dùng microservices ở giai đoạn này (xem lý do trong `NHAT_KY_QUYET_DINH.md`).

Luồng xử lý: `Trình duyệt → Next.js Frontend → REST API → NestJS Backend → (PostgreSQL, module tạo PDF, phân quyền, nhật ký hệ thống, lưu file đính kèm)`.

Danh sách module nghiệp vụ: Xác thực, Người dùng, Vai trò và phân quyền, Nhân viên, Phương tiện, Địa điểm, Tuyến công tác, Người ký, Đánh số chứng từ, Lệnh điều xe, Lệnh điều công tác, Công lệnh, Mẫu in, Nhật ký hệ thống. (Không có module "Phê duyệt" — Văn thư lập và in trực tiếp, xem `NHAT_KY_QUYET_DINH.md`.)

Stack công nghệ và lý do chọn: xem `CLAUDE.md` (tóm tắt) và `NHAT_KY_QUYET_DINH.md` (lý do chi tiết).

## 4. Cấu trúc mã nguồn

```
conglenh/
├─ apps/
│  ├─ web/            # Next.js
│  └─ api/             # NestJS — module hóa theo mục 3
├─ packages/
│  ├─ shared/          # kiểu dữ liệu & enum dùng chung (vd. LoaiChungTu, MA_QUYEN)
│  ├─ validation/       # schema Zod dùng chung
│  ├─ ui/               # component giao diện dùng chung
│  └─ config/           # ESLint, TypeScript config dùng chung
├─ docs/                # thư mục chứa các file .md này
├─ infrastructure/{docker,nginx}/
├─ docker-compose.yml
└─ pnpm-workspace.yaml
```

Dùng chung enum/kiểu dữ liệu qua `packages/shared`, không định nghĩa lại ở nhiều nơi (vd `MA_QUYEN`, `LoaiChungTu`). Chứng từ không có trường "trạng thái" nhiều nấc — chỉ có cờ `daHuy` (boolean) trên từng model, vì không có luồng phê duyệt (xem `NHAT_KY_QUYET_DINH.md` mục "Bỏ luồng phê duyệt").

### Giai đoạn phát triển ban đầu

Chạy PostgreSQL + NestJS + Next.js trực tiếp bằng npm/pnpm trên máy Văn thư để dễ debug. Docker Compose không bắt buộc ở giai đoạn này (dùng nếu tiện).

### Giai đoạn triển khai chính thức

`Internet hoặc mạng nội bộ → Nginx/Caddy → Next.js + NestJS → PostgreSQL`, đóng gói bằng Docker Compose. Có thể triển khai trên máy chủ nội bộ công ty, VPS riêng, hosting hỗ trợ Docker, hoặc trung tâm dữ liệu. Không chọn shared hosting PHP thông thường vì cần môi trường Node.js và Chromium phù hợp. **Cần thẩm định lại ngân sách hosting thực tế trước khi lên chính thức** — ước tính ban đầu trong tờ trình (~50–72k/tháng) dựa trên hosting tĩnh, nhiều khả năng không đủ.

## 5. Kế hoạch kiểm thử

**Backend (Jest + Supertest):** cấp số đồng thời không trùng, không trùng CCCD/biển số, người không có quyền không thực hiện được hành động, chứng từ đã hủy không sửa được, chứng từ hủy không tái dùng số, nhật ký ghi đúng.

**Toàn hệ thống (Playwright):** luồng Đăng nhập → Tạo chứng từ → Tạo PDF (Xem/In) → Đóng dấu (ngoài hệ thống). Kiểm tra trên desktop/laptop/tablet/điện thoại, theme sáng/tối, khổ A5/A4, nội dung ngắn/dài.

**Phân kỳ:** giai đoạn phát triển ban đầu ưu tiên các luồng rủi ro cao ở trên; bao phủ đầy đủ (toàn bộ thiết bị/khổ giấy/theme) ở giai đoạn chính thức.

## 6. Thứ tự module nên làm tiếp

1. Dựng khung dự án theo cấu trúc monorepo và stack đã chốt.
2. Danh mục Nhân viên (bao gồm đánh dấu tài xế) và Danh mục Phương tiện — cả 3 loại chứng từ đều tham chiếu Nhân viên, 2 loại tham chiếu Phương tiện, nên phải có trước các bước dưới.
3. Danh mục địa điểm công tác.
4. Thiết lập ba dãy số LĐCT/GĐĐ/LĐX theo năm (kèm cơ chế transaction).
5. Danh mục người ký và thể thức ký.
6. Module lập Lệnh điều xe.
7. Xem trước và in Lệnh điều xe A5.
8. Module Lệnh điều công tác.
9. Module Công lệnh A5 hai mặt.
10. Nhật ký xử lý chứng từ.
11. Quản lý phiên bản mẫu in.
12. Cơ chế sao lưu dữ liệu.
13. Thẩm định lại ngân sách hosting thực tế.
14. Triển khai mạng nội bộ hoặc hosting.

(Không còn bước "luồng trình duyệt và phê duyệt" — đã bỏ, xem `NHAT_KY_QUYET_DINH.md` mục "Bỏ luồng phê duyệt".)

## 7. Việc chưa chốt

Xem danh sách đầy đủ trong `CLAUDE.md` — mục "Việc chưa chốt". Khi chốt được điều gì, ghi lại vào `NHAT_KY_QUYET_DINH.md` và cập nhật `CLAUDE.md`.
