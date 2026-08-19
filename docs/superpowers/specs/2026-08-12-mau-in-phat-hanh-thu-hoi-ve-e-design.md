# Thiết kế: mẫu in "Phát hành, thu hồi vé ế" cho Lệnh điều công tác

Ngày: 2026-08-12

## Bối cảnh

Người dùng gửi 9 ảnh chụp các Lệnh điều công tác (LĐCT) thật đã dùng trong thực tế công ty (làm thủ công bằng Word trước khi có app), phát hiện có 1 loại mẫu in thứ 3 chưa được app hỗ trợ — bên cạnh "Tuyến thường" và "Trạm" đã có sẵn (`mauInTram: boolean` trên `LenhDieuCongTac`).

Loại mẫu thứ 3 này dùng cho các chuyến đi tỉnh khác để **phát hành vé, thu tiền, nhận vé trúng và thu hồi vé ế** — khác về nội dung in với "Tuyến thường" ở 2 điểm: có thêm 1 đoạn phụ đề dưới tiêu đề "LỆNH ĐIỀU CÔNG TÁC" (nêu mục đích + nơi đến), và câu văn thân bài có nhắc mục đích chuyến đi (mẫu Tuyến thường hiện tại hoàn toàn không in trường "Mục đích" ở đâu cả, dù form đã thu thập từ trước).

Nhân tiện, người dùng cũng nhắc tới khái niệm "Lệnh điều công tác riêng cho tài xế (trạm TPHCM)" — sau khi hỏi làm rõ, xác nhận đây **không phải tính năng mới cần làm**: chỉ cần lập 1 LĐCT riêng (hoặc dùng nút Sao chép có sẵn) với tài xế là thành viên duy nhất, để trống Căn cứ — công cụ hiện có đã đủ đáp ứng. Mục này ghi nhận nhưng không nằm trong phạm vi triển khai của spec này.

## Phạm vi

**Trong phạm vi:**
- Đổi `LenhDieuCongTac.mauInTram: boolean` thành `loaiMauIn` enum 3 giá trị.
- Mẫu in mới "Phát hành, thu hồi vé ế": phụ đề dưới tiêu đề + câu văn thân bài có mục đích, bảng thành viên giữ nguyên 3 cột (không có cột "Ngày đi – về riêng").
- Combobox "Loại lệnh điều công tác" ở dialog Tạo (đã có, đổi 2→3 lựa chọn) và dialog Sửa (hiện chưa có, cần thêm mới).
- Trang danh sách LĐCT: nhãn/màu phân biệt thêm loại thứ 3.
- Trưởng đoàn: mở rộng áp dụng được cho cả loại "Phát hành, thu hồi vé ế" (không chỉ riêng Trạm).

**Ngoài phạm vi:**
- "Lệnh điều công tác riêng cho tài xế" — không cần tính năng mới, dùng công cụ hiện có (xem Bối cảnh).
- Module "Phân công lịch công tác" đầy đủ (Trạm/Tuyến/trực vé ế theo lịch định kỳ) — vẫn giữ nguyên trạng thái CHƯA BUILD như đã ghi trong `CLAUDE.md`. Spec này chỉ thêm 1 loại mẫu in cho luồng lập LĐCT thủ công hiện có, không phải hệ thống xếp lịch tự động.
- Không sửa dữ liệu các LĐCT cũ đã lập.

## Thiết kế dữ liệu

Prisma: thêm enum mới, đổi tên cột

```prisma
enum LoaiMauInLenhDieuCongTac {
  TUYEN_THUONG
  TRAM
  PHAT_HANH_THU_HOI_VE_E
}
```

Cột `LenhDieuCongTac.loaiMauIn LoaiMauInLenhDieuCongTac @default(TUYEN_THUONG)` thay cho `mauInTram Boolean`. Migration SQL viết tay (theo đúng quy ước dự án — xem các migration Trạm/canCuMauTram trước đó): tạo enum, thêm cột mới, backfill từ cột cũ (`mauInTram = true` → `TRAM`, `false` → `TUYEN_THUONG`), rồi xóa cột `mauInTram`.

Mọi nơi trong code hiện đang đọc/ghi `mauInTram` (Zod schema `tao`/`sua`, `lenh-dieu-cong-tac.service.ts`, `lenh-dieu-cong-tac-mau-in.ts`, hook `use-danh-sach-lenh-dieu-cong-tac.ts`, 2 dialog Tạo/Sửa, trang danh sách) đổi sang đọc/ghi `loaiMauIn`.

## Thiết kế mẫu in

Hàm điều phối `noiDungTrangLenhDieuCongTac()` rẽ theo 3 nhánh thay vì 2 (nhánh `TRAM` giữ nguyên `noiDungTrangLenhDieuCongTacTram()` không đổi).

Nhánh `TUYEN_THUONG` và `PHAT_HANH_THU_HOI_VE_E` dùng **chung 1 hàm** (`noiDungTrangLenhDieuCongTacTuyenThuong`, nhận thêm tham số `loaiMauIn`) vì cấu trúc bảng/cột/khối ký giống hệt nhau, chỉ khác phần tiêu đề + câu mở đầu — tách hẳn thành hàm riêng sẽ trùng lặp phần lớn code (khác cách làm với Trạm, nơi cấu trúc bảng thực sự khác biệt lớn nên xứng đáng tách hàm riêng).

Khi `loaiMauIn === "PHAT_HANH_THU_HOI_VE_E"`:

1. **Phụ đề dưới tiêu đề** (chỉ hiện khi loại này, `TUYEN_THUONG` không có): 2 dòng, lấy **nguyên văn** ô Mục đích (dòng 1) và ô Nơi đến (dòng 2) đã có sẵn trong form — không thêm ô nhập mới, không hardcode câu chữ (người dùng chọn "lấy từ ô Mục đích gõ tay" thay vì hardcode, để linh hoạt cho cả trường hợp chỉ "phát hành" hoặc chỉ "thu hồi vé ế" mà không cần đúng y chang 1 câu cố định).
2. **Câu văn thân bài** đổi từ "Giám đốc {tên cơ quan} phân công nhiệm vụ đi công tác tại {Nơi đến}." (nguyên trạng, dùng cho `TUYEN_THUONG`) thành "Giám đốc {tên cơ quan} điều động và phân công nhiệm vụ đi công tác {Mục đích, chữ đầu viết thường} tại {Nơi đến}." — dùng lại đúng giá trị Mục đích (không tự rút gọn khác đi so với phụ đề, dù ảnh mẫu thật có sai khác nhỏ giữa 2 câu — không lặp lại sự thiếu nhất quán đó, cùng tinh thần với bản vá "chuẩn hóa Nơi đến" vừa làm). Tên cơ quan vẫn lấy động từ `cauHinhDonVi.tenCoQuanDong1/2` như `TUYEN_THUONG` hiện tại (không hardcode như mẫu Trạm — vì đây không phải yêu cầu, giữ nhất quán với mẫu Thường mà loại này dựa trên).
3. **Bảng thành viên**: giữ đúng 3 cột (STT / Họ và tên / Chức vụ), **bỏ cột "Ngày đi – về (riêng)"** kể cả khi có dữ liệu ngày riêng — khớp đúng ảnh mẫu thật, đơn giản hóa. Nếu sau này phát sinh nhu cầu ngày riêng cho loại vé ế, thêm lại cột này là thay đổi nhỏ, không phải thiết kế lại.
4. **Trưởng đoàn**: dùng lại field `laTruongDoan` có sẵn — nếu 1 thành viên được đánh dấu, in đậm cả dòng đó (`font-weight:700` như mẫu Trạm đang làm), nhưng cột Chức vụ vẫn hiện chức vụ thật của người đó (không ghi đè thành nhãn "Trưởng đoàn"/"Thành viên" như mẫu Trạm) — vì mẫu này đang hiển thị chức vụ thật, ghi đè sẽ mất thông tin.

`TUYEN_THUONG` giữ nguyên 100% hành vi hiện tại (không phụ đề, câu văn ngắn như cũ, có cột Ngày đi-về riêng) — không có LĐCT cũ nào bị đổi output khi migration.

## Thiết kế giao diện

Combobox "Loại lệnh điều công tác" (đã có ở dialog Tạo, tên field đổi sang `loaiMauIn`) — 3 lựa chọn:

```
<option value="TUYEN_THUONG">Tuyến thường</option>
<option value="TRAM">Trạm (có trưởng đoàn + CCCD trong mẫu in)</option>
<option value="PHAT_HANH_THU_HOI_VE_E">Phát hành, thu hồi vé ế (có thêm tiêu đề dưới tên lệnh)</option>
```

Thêm combobox tương tự vào dialog **Sửa** (`sua-lenh-dieu-cong-tac-dialog.tsx`) — hiện dialog này hoàn toàn không có ô chọn loại mẫu in (khoảng trống có từ trước, không phải do spec này gây ra, nhưng tiện sửa cùng lúc vì đang đổi kiểu dữ liệu `mauInTram`→`loaiMauIn` chạm cả 2 dialog).

Điều kiện hiện checkbox "Trưởng đoàn" cạnh mỗi thành viên: đổi từ `mauInTram &&` thành `(loaiMauIn === "TRAM" || loaiMauIn === "PHAT_HANH_THU_HOI_VE_E") &&`.

Trang danh sách `/lenh-dieu-cong-tac`: nhãn/màu hiện đang phân biệt Trạm (badge riêng) — thêm 1 badge màu khác cho `PHAT_HANH_THU_HOI_VE_E` (ví dụ badge cam/vàng, khác xanh dương của Trạm — chọn màu cụ thể lúc code, không phải quyết định thiết kế cần chốt trước).

Nút "Sao chép" LĐCT: copy nguyên `loaiMauIn` từ lệnh gốc (giữ đúng hành vi hiện tại đang copy `mauInTram`, chỉ đổi tên field).

## Kiểm thử / xác minh

- Không có môi trường build trong sandbox (đã ghi nhận từ đầu dự án) — cần chạy `pnpm typecheck`/`pnpm build`/`pnpm dev` trên máy thật sau khi code xong.
- Sau khi migrate, kiểm tra bằng mắt: các LĐCT Trạm cũ vẫn in ra y hệt như trước (không bị lẫn sang loại mới); tạo thử 1 LĐCT "Phát hành, thu hồi vé ế" với Mục đích + Nơi đến giống 1 trong 9 ảnh mẫu, so khớp bố cục phụ đề + câu văn.
