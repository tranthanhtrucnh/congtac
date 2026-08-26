# Quy tắc giao diện

## Nhận diện thương hiệu

- Tên đơn vị: CÔNG TY TNHH MTV XỔ SỐ KIẾN THIẾT AN GIANG. Dùng logo chính thức.
- **Xanh dương = màu chủ đạo** (đổi từ xanh lá, 2026-08-10 — xem `NHAT_KY_QUYET_DINH.md` mục "Đổi màu chủ đạo sang xanh dương"); đỏ = cảnh báo; xanh lá riêng cho trạng thái hoạt động/thành công (token `--success`, tách khỏi màu chủ đạo); vàng dùng tiết chế.
- Hình trái bi xổ số chỉ dùng làm chi tiết minh họa, không lạm dụng.

## Phông chữ

Toàn bộ giao diện dùng **Be Vietnam Pro** — tiêu đề, nội dung, input, select, textarea, button, dialog. Không dùng phông có chân.

## Bố cục

- Ưu tiên nội dung quan trọng, không dành khoảng trống lớn chỉ để hiển thị tài khoản.
- Thông tin tài khoản đặt cuối menu trái; nhấp vào mới hiện đổi theme và đăng xuất.
- Nhóm chức năng Hệ thống và Danh mục dùng chung rõ ràng.

## Responsive và danh sách

Ưu tiên giữ dạng danh sách trên màn hình nhỏ, không tự ép sang dạng thẻ.

**Chế độ thu gọn:** tự động ẩn cột ít quan trọng, giữ cột chính; không làm chữ quá nhỏ hoặc bẻ tiêu đề thành từng ký tự; nút Sửa/Xóa chuyển thành icon, vùng bấm tối thiểu 34×34px, có nhãn trợ năng.

**Hiển thị đầy đủ:** có nút "Hiển thị tất cả" / "Thu gọn thông tin"; khi mở đầy đủ, khôi phục cột và cho cuộn ngang có chủ đích; ghi nhớ lựa chọn trên trình duyệt. Áp dụng thống nhất cho mọi danh sách (người dùng, nhân sự, phương tiện, và các danh sách sau này).

## Biểu mẫu

- Nhãn và ô nhập cùng hàng phải thẳng nhau.
- Input và select cao thống nhất **46px**.
- Nội dung trợ giúp không làm trường bên cạnh lệch hàng.
- Textarea dùng phông chung, màu, viền, khoảng đệm, focus thống nhất.
- Trên mobile, biểu mẫu chuyển thành một cột.

## Màu sắc thao tác

| Hành động | Màu |
|---|---|
| Thêm/Lưu/Xác nhận | Xanh dương (màu chủ đạo, token `--primary`) |
| Sửa | Xanh dương (cùng họ với màu chủ đạo — chỉ dùng ở icon/nút outline, không xung đột vì không đứng cạnh nút Lưu dạng khối màu) |
| Xóa/Khóa/Hủy dữ liệu | Đỏ cảnh báo (token `--destructive`) |
| Hủy đóng hộp thoại | Trung tính |
| Trạng thái hoạt động | Xanh lá (token `--success` — **không** dùng `--primary`, xem ghi chú dưới) |
| Trạng thái ngừng sử dụng | Xám hoặc đỏ nhạt |
| Tài xế (đánh dấu) | Xanh dương |

Icon Xóa: màu đỏ, nền/viền đỏ nhạt, hover rõ hơn. Theme tối có bảng màu riêng.

**Màu nhóm menu (sidebar + trang Tổng quan):** mỗi nhóm trong menu bên trái có 1 màu riêng để dễ phân biệt trực quan — token `--group-shared` (ngọc lam/teal), `--group-system` (tím/violet), khai báo tại `apps/web/app/globals.css`, ánh xạ qua `apps/web/lib/mau-nhom-menu.ts`. Nhóm "Chứng từ" dùng lại `--primary` (không có token riêng). Đây là màu PHÂN LOẠI, không mang nghĩa trạng thái — **không được dùng đỏ (`--destructive`) hay xanh lá (`--success`) làm màu nhóm**, vì 2 màu đó đã cố định nghĩa cảnh báo/thành công ở trên; nhóm mới thêm sau này phải chọn màu khác 4 màu đã dùng (xanh dương, ngọc lam, tím, đỏ, xanh lá) để không trùng nghĩa.

**Tiêu đề bảng (thead):** nền xanh dương (`--primary`), chữ trắng (`--primary-foreground`), in đậm, viết hoa — áp dụng thống nhất qua component `Table`/`TableHead` dùng chung (`apps/web/components/ui/table.tsx`), không style riêng lẻ từng trang. Nút sắp xếp cột và checkbox "chọn tất cả" bên trong tiêu đề dùng biến thể màu trắng/xanh đảo ngược (`text-primary-foreground`, `data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary`) để không chìm vào nền.

**Vì sao có `--success` riêng:** trước 2026-08-10, màu chủ đạo (`--primary`) chính là xanh lá nên "trạng thái hoạt động" dùng luôn `--primary`. Sau khi đổi màu chủ đạo sang xanh dương, `--success` tách ra làm token riêng để `Badge` mặc định (Đang làm việc, Đang dùng, Chính thức...) và các chấm trạng thái vẫn xanh lá — không tự động chuyển xanh dương theo màu chủ đạo mới.

## Theme sáng/tối

Cho phép chọn và ghi nhớ lựa chọn. Nút, input, bảng, dialog, thông báo phải phù hợp theme. Bảo đảm độ tương phản, màu cảnh báo dễ nhận biết. Không dùng màu quá chói hoặc hiệu ứng phát sáng mạnh.

## Dialog, cảnh báo, ngôn ngữ

- **Không dùng `alert()` hoặc `confirm()` mặc định của trình duyệt.**
- Dialog tùy chỉnh có tiêu đề, nội dung, nút hành động rõ ràng.
- Hành động nguy hiểm phải nêu rõ đối tượng bị ảnh hưởng.
- Toàn bộ cảnh báo, điều hướng, lỗi, trạng thái dùng tiếng Việt — không để trình duyệt hiện lỗi tiếng Anh, ứng dụng tự kiểm tra và thông báo.
- **Bấm ra ngoài vùng hộp thoại KHÔNG tự đóng** (mặc định của `components/ui/dialog.tsx`, áp dụng chung mọi nơi) — tránh mất dữ liệu đang nhập do lỡ tay. Đóng hộp thoại chỉ qua nút X, nút Hủy, hoặc phím Escape (các thao tác có chủ đích).

## Khả năng tiếp cận

- Input có label liên kết đúng; icon thao tác có `aria-label`.
- Thông báo lỗi dùng vùng thông báo phù hợp.
- Điều khiển được bằng bàn phím, có trạng thái focus rõ.
- Không khóa phóng to của trình duyệt; tôn trọng tùy chọn giảm chuyển động.
- Không dùng màu sắc làm dấu hiệu duy nhất.

## Mẫu in (PDF)

- **Logo mờ (watermark) giữa trang chỉ mang tính minh họa, không được che chữ chính.** Độ mờ, kích thước, vị trí định nghĩa DUY NHẤT tại `.hinh-mo` trong `apps/api/src/common/mau-in/mau-in-dung-chung.ts` (hiện tại: `opacity: 0.08`, `80mm × 80mm`, canh giữa trang) — mọi mẫu in (LĐX, LĐCT, GĐĐ mặt trước/mặt sau, và các mẫu sau này như Trạm/Tuyến) đều gọi `trangMoHinh()` để chèn logo, KHÔNG viết CSS `.hinh-mo` riêng ở từng file mẫu in. Nhờ vậy đổi độ mờ 1 chỗ là áp dụng đồng loạt, không lệch nhau giữa các mẫu.
- Nội dung chữ luôn bọc trong `.noi-dung` (`z-index: 1`), cao hơn logo (`z-index: 0`) — đảm bảo logo luôn nằm dưới chữ.
- **Không đặt nền đặc màu (`background: #xxxxxx`) lên phần tử nằm trên vùng có logo** (ví dụ tiêu đề bảng `th`) — nền đặc sẽ che kín logo phía sau dù logo có mờ đến đâu. Nếu cần nền phân biệt (như tiêu đề bảng), dùng màu bán trong suốt (`rgba(...)`) để logo vẫn xuyên qua được.
- Đường kẻ chấm/gạch dùng `background-image: repeating/linear-gradient` với `background-size` cố định theo mm, không dùng `border-style: dotted/dashed` — tránh hiển thị lệch giữa bản xem trước và bản PDF in (xem `NHAT_KY_QUYET_DINH.md`).

## shadcn/ui — component nên dùng

Button, Input, Select, Dialog, Alert Dialog, Table, Dropdown Menu, Tabs, Toast, Calendar, Command (tìm kiếm), Checkbox, Badge. shadcn/ui đưa mã nguồn component trực tiếp vào dự án — chủ động chỉnh sửa được, phù hợp yêu cầu không dùng dialog mặc định và cần tiếng Việt hóa toàn bộ.

## Tiêu chí áp dụng cho module mới

Danh sách + tìm kiếm tự động + lọc + sắp xếp + phân trang · thêm/sửa/xóa hoặc ngừng sử dụng (xóa nhiều nếu phù hợp) · kiểm tra trùng dữ liệu · thông báo hoàn toàn tiếng Việt · phân quyền và nhật ký khi cần · theme sáng/tối + responsive · chế độ thu gọn/hiển thị tất cả cột · dialog tùy chỉnh · kiểm thử chức năng và giao diện.
