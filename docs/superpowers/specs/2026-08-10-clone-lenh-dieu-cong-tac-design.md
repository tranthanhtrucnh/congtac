# Thiết kế: Nút "Sao chép" Lệnh điều công tác

Ngày: 2026-08-10
Trạng thái: Đã triển khai

**Cập nhật sau khi code (xem NHAT_KY_QUYET_DINH.md mục cùng tên để biết chi tiết):** mục "Được sao chép" bên dưới ban đầu có liệt kê `taiXeNhanVienId`/`phuongTienId`, nhưng lúc code phát hiện backend yêu cầu tài xế phải là 1 thành viên trong `thanhVien` gửi lên (không tìm thấy sẽ lỗi) — vì `thanhVien` luôn để trống khi sao chép, 2 trường này đã bị loại khỏi phạm vi sao chép để tránh trạng thái ẩn gây lỗi. Bản triển khai thật KHÔNG copy `taiXeNhanVienId`/`phuongTienId`.

## Bối cảnh / mục tiêu

Người dùng thường lập nhiều Lệnh điều công tác (LĐCT) tương tự nhau (cùng địa điểm, mục đích, tài xế/xe) chỉ khác ngày đi/về hoặc thành viên. Hiện tại mỗi lần lập phải gõ lại toàn bộ từ đầu. Mục tiêu: thêm nút "Sao chép" ở danh sách LĐCT, mở sẵn form Lập với dữ liệu điền sẵn từ lệnh gốc, giúp lập nhanh hơn.

## Phạm vi dữ liệu được sao chép

Dựa trên khảo sát `taoLenhDieuCongTacSchema` (`packages/validation/src/lenh-dieu-cong-tac/tao-lenh-dieu-cong-tac.schema.ts`) và `ThanhVienLenhDieuCongTac`:

**Được sao chép** (điền sẵn vào form Tạo, người dùng có thể sửa lại trước khi lưu):
- `diaDiemCongTac` (Địa điểm công tác)
- `mucDich` (Mục đích)
- `canCu` (Căn cứ)
- `ngayDi`, `ngayVe` (Ngày đi, Ngày về)
- `taiXeNhanVienId`, `phuongTienId` — lấy từ `LenhDieuXe` đang hoạt động (`daHuy=false`) gắn với LĐCT gốc, nếu có
- `mauInTram` (Loại mẫu in)

**KHÔNG sao chép** (giữ hành vi mặc định của form Tạo mới):
- `ngayKy` — luôn mặc định = hôm nay (giống Tạo mới bình thường), vì lệnh mới được ký vào ngày hiện tại, không phải ngày ký của lệnh cũ.
- `thanhVien` — luôn để mảng rỗng, người dùng tự chọn lại thành viên. Lý do: đây là quyết định người dùng đã chọn rõ ràng khi làm rõ yêu cầu — thành viên thay đổi thường xuyên hơn thông tin chuyến đi.
- Số hiệu — không áp dụng, đây không phải trường input (luôn cấp số mới qua transaction ở `tao()`, đúng CLAUDE.md quy tắc #1).

## Vị trí và điều kiện hiển thị nút

- Icon button "Sao chép" (icon `Copy` từ `lucide-react`) trong nhóm nút thao tác ở mỗi hàng bảng danh sách `/lenh-dieu-cong-tac` (`page.tsx`), đặt cạnh các nút hiện có (In riêng, Xem chi tiết, Hủy).
- Điều kiện quyền: hiển thị khi `coQuyen(nguoiDungHienTai, MA_QUYEN.CHUNG_TU_TAO)` — đúng quyền đang dùng cho nút "Lập lệnh điều công tác" ở đầu trang, vì sao chép về bản chất là tạo mới 1 chứng từ.
- Hiển thị cho MỌI lệnh, kể cả lệnh đã hủy (`daHuy=true`) — nội dung lệnh đã hủy vẫn có giá trị tham khảo để lập lệnh mới tương tự, không có lý do nghiệp vụ để chặn.

## Luồng tương tác

1. Người dùng bấm nút "Sao chép" ở 1 hàng.
2. Trang danh sách lưu bản ghi `LenhDieuCongTac` đó vào 1 state (ví dụ `ldctDangSaoChep`), mở `TaoLenhDieuCongTacDialog` với prop mới `duLieuSaoChep` = bản ghi đó.
3. Dialog Tạo mở lên với form đã điền sẵn các trường ở mục "Được sao chép" phía trên — thành viên trống, ngày ký = hôm nay.
4. Người dùng xem lại, chỉnh sửa (thêm thành viên, đổi ngày nếu cần...) như 1 lần Lập bình thường, rồi bấm Lưu.
5. Submit đi qua ĐÚNG luồng tạo mới hiện có (`POST /lenh-dieu-cong-tac`) — không có endpoint hay logic backend mới. Cấp số, validate đều dùng lại y hệt code hiện tại.
6. Đóng dialog (hủy hoặc lưu thành công) → xóa state `ldctDangSaoChep` về `null`, để lần mở dialog tiếp theo (qua nút "Lập lệnh điều công tác" ở đầu trang) không bị dính dữ liệu sao chép cũ.

## Thay đổi kỹ thuật

**Không đổi**: backend (`lenh-dieu-cong-tac.service.ts`, controller), Zod schema (`packages/validation`), Prisma schema. Toàn bộ validate/transaction cấp số giữ nguyên.

**`apps/web/app/lenh-dieu-cong-tac/tao-lenh-dieu-cong-tac-dialog.tsx`**:
- Thêm prop tùy chọn: `duLieuSaoChep?: LenhDieuCongTac | null`.
- Thêm `useEffect` theo dõi `[open, duLieuSaoChep]`: khi dialog mở VÀ có `duLieuSaoChep`, gọi `reset(...)` với các trường ở mục "Được sao chép" (tương tự cách `sua-lenh-dieu-cong-tac-dialog.tsx` đã map `taiXeNhanVienId`/`phuongTienId` từ `lenhDieuXe` đang hoạt động — tái dùng logic mapping này, không viết lại). Khi mở KHÔNG có `duLieuSaoChep` (bấm "Lập lệnh điều công tác" bình thường), giữ nguyên hành vi `reset()` hiện tại.

**`apps/web/app/lenh-dieu-cong-tac/page.tsx`**:
- Thêm state `ldctDangSaoChep: LenhDieuCongTac | null`.
- Thêm nút icon "Sao chép" (Copy icon) trong nhóm thao tác mỗi hàng, gated bằng `MA_QUYEN.CHUNG_TU_TAO`. `onClick`: set `ldctDangSaoChep` = bản ghi hàng đó, rồi mở dialog Tạo bằng CHÍNH state `moDialogTao` (boolean) đã dùng cho nút "Lập lệnh điều công tác" ở đầu trang — không thêm state mở riêng, vì cả 2 nút cùng mở 1 dialog duy nhất, chỉ khác ở việc `duLieuSaoChep` có giá trị hay không.
- Truyền `duLieuSaoChep={ldctDangSaoChep}` vào `<TaoLenhDieuCongTacDialog>`.
- Khi dialog đóng, reset `ldctDangSaoChep` về `null`.

## Trường hợp biên

- **Tài xế/phương tiện của lệnh gốc không còn hợp lệ** (đã bị khóa/xóa khỏi danh mục sau khi lệnh gốc được tạo): logic hiện có trong `tao-lenh-dieu-cong-tac-dialog.tsx` đã tự động xóa lựa chọn tài xế/phương tiện không còn nằm trong danh sách ứng viên hợp lệ (`useEffect` kiểm tra `taiXeUngVien.some(...)`) — áp dụng đúng như cũ cho giá trị được sao chép, không cần code thêm.
- **Ngày đi/về của lệnh gốc đã qua**: không chặn ở tầng validate (giống hành vi Tạo mới hiện tại không giới hạn ngày trong quá khứ) — người dùng tự chỉnh lại nếu cần, đúng tinh thần "vẫn là form Tạo bình thường, chỉ điền sẵn".
- **Sao chép nhiều lần liên tiếp các lệnh khác nhau mà không đóng dialog**: không xảy ra vì dialog phải đóng (hủy hoặc lưu xong) trước khi thao tác tiếp ở danh sách.

## Kiểm thử

- Test thủ công (giai đoạn hiện tại theo CLAUDE.md, ưu tiên luồng rủi ro cao hơn): bấm Sao chép → kiểm tra đúng các trường được điền sẵn, ngày ký = hôm nay, thành viên trống → thêm thành viên → Lưu → xác nhận lệnh mới có số hiệu mới, không ảnh hưởng lệnh gốc.
- Không cần test đồng thời/transaction riêng cho tính năng này vì không đổi logic cấp số.
