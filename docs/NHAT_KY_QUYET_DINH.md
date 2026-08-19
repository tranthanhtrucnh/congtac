# Nhật ký quyết định kỹ thuật

Ghi lại các quyết định kỹ thuật quan trọng và lý do — để không phải tranh luận lại từ đầu mỗi khi có phiên làm việc mới hoặc người mới tham gia. Thêm mục mới ở cuối file theo mẫu:

```
## [YYYY-MM-DD] Tên quyết định
Bối cảnh: ...
Quyết định: ...
Lý do: ...
Phương án khác đã cân nhắc: ...
```

---

## Cơ sở dữ liệu: PostgreSQL thay vì SQLite

Bối cảnh: ứng dụng nội bộ quy mô nhỏ, ban đầu chỉ chạy trên một máy.
Quyết định: dùng PostgreSQL ngay từ đầu, không dùng SQLite.
Lý do: yêu cầu cấp số chứng từ không được trùng khi nhiều Văn thư thao tác đồng thời cần transaction + khóa dòng ở tầng database — SQLite xử lý ghi đồng thời kém hơn hẳn. Việc chuyển database sau này (SQLite → Postgres) cũng là rủi ro kỹ thuật không cần thiết nếu chốt đúng ngay từ đầu.

## Kiến trúc: Next.js + NestJS tách rời (Phương án A) thay vì Next.js full-stack (Phương án B)

Bối cảnh: cân nhắc giữa một ứng dụng Next.js full-stack duy nhất và tách frontend/backend riêng.
Quyết định: chọn Phương án A — Next.js (frontend) + NestJS (backend) tách rời, kiến trúc Modular Monolith trong một monorepo.
Lý do: dễ mở rộng phê duyệt ngoài mạng, dễ tích hợp app di động hoặc hệ thống khác sau này, phân quyền và audit rõ ràng hơn, phù hợp triển khai lâu dài. Đánh đổi: nhiều mã nguồn hơn, cần cấu hình xác thực giữa frontend/backend — chấp nhận được vì ứng dụng có nhiều nghiệp vụ (cấp số, phê duyệt, ký/đóng dấu, mẫu in, nhật ký).
Không dùng microservices: sẽ tăng độ phức tạp hạ tầng (Docker, xác thực giữa dịch vụ, log) mà chưa mang lại lợi ích thực tế ở quy mô này.

## In ấn: PDF qua trình duyệt headless, không dùng `window.print()`

Quyết định: dựng mẫu bằng HTML/CSS, chuyển thành PDF qua trình duyệt headless (Chromium), Văn thư luôn xem trước PDF trước khi in.
Lý do: in trực tiếp bằng `window.print()` cho bố cục khác nhau tùy trình duyệt, máy tính, driver máy in, tỷ lệ thu phóng — không chấp nhận được cho chứng từ hành chính cần đúng khổ A5/A4 và Công lệnh in 2 mặt.

## ORM: Prisma thay vì TypeORM

Quyết định: dùng Prisma.
Lý do: schema tập trung một chỗ, ít file entity trang trí bằng decorator, dễ nhìn quan hệ dữ liệu, migration và kiểu dữ liệu rõ ràng — dễ đọc và duy trì hơn cho một người phụ trách, và dễ để công cụ AI hỗ trợ lập trình đọc đúng cấu trúc dự án.

## Timeline: không có hạn chót cứng

Bối cảnh: tờ trình gửi Giám đốc có nêu mốc tham khảo 4 tuần.
Quyết định: mốc 4 tuần chỉ là tham khảo, không phải hạn chót bắt buộc. Ưu tiên làm đúng và chắc — không cắt kiểm thử hay bỏ qua quy tắc nghiệp vụ quan trọng (đặc biệt cơ chế cấp số bằng transaction) chỉ để chạy kịp thời gian.

## Docker Compose: không bắt buộc ở giai đoạn phát triển ban đầu

Quyết định: giai đoạn đầu chạy PostgreSQL + NestJS + Next.js trực tiếp bằng npm/pnpm trên máy Văn thư. Docker Compose dùng khi chuyển sang giai đoạn triển khai chính thức (VPS/mạng nội bộ).
Lý do: giảm một lớp phức tạp khi mới bắt đầu, dễ xem log và gỡ lỗi trực tiếp.

## Kiểm thử: phân kỳ theo giai đoạn

Quyết định: giai đoạn đầu ưu tiên kiểm thử các luồng nghiệp vụ rủi ro cao (cấp số đồng thời, không trùng CCCD/biển số, phân quyền chặn đúng, chứng từ đã duyệt không sửa được, chứng từ hủy không tái dùng số). Bộ kiểm thử đầy đủ (đa thiết bị, đa khổ giấy, theme) mở rộng ở giai đoạn chính thức.
Lý do: cân bằng giữa chất lượng và tốc độ phát triển ban đầu, không bỏ hẳn kiểm thử.

## Tài khoản người dùng: không có đăng ký công khai

Bối cảnh: đây là ứng dụng nội bộ công ty, không phải sản phẩm mở cho công chúng.
Quyết định: không làm chức năng tự đăng ký. Chỉ người có quyền `nguoi-dung.them` (thường là Quản trị hệ thống) mới tạo được tài khoản mới, qua trang quản lý người dùng trong ứng dụng.
Lý do: giảm bề mặt tấn công (không có endpoint đăng ký công khai để dò/tấn công), phù hợp thực tế công ty có danh sách nhân sự cố định — không cần ai tự tạo tài khoản.

## Tài khoản người dùng: không có chức năng xóa thật, chỉ Khóa/Mở khóa

Bối cảnh: được hỏi khi cân nhắc thêm chức năng "xóa người dùng". Nhật ký hệ thống và (sau này) các chứng từ LĐCT/GĐĐ/LĐX đều gắn với người dùng đã tạo/duyệt/ký — xóa thật một tài khoản có nguy cơ làm mất dấu vết ai đã làm gì trên các chứng từ hành chính, vốn cần lưu vết đầy đủ theo quy định.
Quyết định: không xây chức năng xóa tài khoản. Chỉ dùng Khóa/mở khóa (`nguoi-dung.khoa`) — khóa đã đủ ngăn đăng nhập mà vẫn giữ nguyên vẹn lịch sử/nhật ký gắn với tài khoản đó.
Lý do: ưu tiên toàn vẹn dấu vết kiểm toán hơn là gọn danh sách người dùng; nếu sau này thực sự cần dọn tài khoản tạo nhầm, sẽ cân nhắc lại như một chức năng riêng, có điều kiện chặt (ví dụ chỉ cho xóa nếu tài khoản chưa từng xuất hiện trong nhật ký hệ thống).

## Danh mục Nhân viên: xếp hạng chức vụ bằng suy đoán từ chuỗi tự do, không thêm trường "cấp bậc"

Bối cảnh: cần sắp xếp mặc định danh sách nhân viên theo "chức vụ cao nhất lên đầu, nhóm theo phòng ban". Trường `chucVu` trong CSDL là chuỗi tự do (nhập tay hoặc từ file Excel/Word), không phải enum có sẵn thứ tự.
Quyết định: suy đoán cấp bậc bằng một hàm so khớp từ khóa (`xep-hang-chuc-vu.util.ts`) trên chuỗi `chucVu` — Chủ tịch > Giám đốc > Phó Giám đốc > Trưởng phòng/Kế toán trưởng > Phó trưởng phòng > mặc định (Nhân viên...). Không thêm trường `capBac` số nguyên vào schema `NhanVien`.
Lý do: tránh phải sửa 2 dialog Thêm/Sửa + màn nhập Excel/Word để thu thập thêm 1 trường mới cho một nhu cầu chỉ phục vụ sắp xếp hiển thị; danh sách chức danh thực tế của đơn vị khá ổn định, hàm so khớp bao được các biến thể đã thấy trong dữ liệu thật.
Phương án khác đã cân nhắc: thêm trường `capBac` do người dùng chọn khi thêm/sửa nhân viên — chính xác hơn nhưng tốn công sức nhập liệu và sửa nhiều màn hình chỉ để phục vụ sắp xếp; có thể làm sau nếu hàm suy đoán không còn đúng khi xuất hiện chức danh mới lạ.
Lưu ý kỹ thuật liên quan: khi người dùng chọn sắp xếp theo 1 cột cụ thể (bấm tiêu đề cột), sắp xếp+phân trang thực hiện ở database như bình thường; sắp xếp mặc định (nhóm phòng ban + cấp bậc) lấy toàn bộ kết quả khớp bộ lọc rồi sắp xếp/phân trang ở tầng ứng dụng, vì Prisma không hỗ trợ orderBy theo biểu thức suy đoán tùy ý — chấp nhận được vì quy mô nhân sự một đơn vị chỉ vài trăm người.

## Danh mục Địa điểm: gộp "Tuyến công tác" vào Địa điểm, không tách bảng riêng

Bối cảnh: đặc tả gốc gộp "địa điểm, đơn vị, tuyến công tác" dưới 1 mục nhưng không rõ quan hệ. Đọc các file Công lệnh/Giấy đi đường thật do người dùng cung cấp cho thấy: trường "Địa điểm công tác" trong LĐCT chỉ tham chiếu 1 địa điểm rời rạc (không phải cặp đi-đến hay chuỗi nhiều điểm dừng); "tuyến thường dùng" trong đặc tả gốc chỉ mang nghĩa "nơi hay đến, hiện lên đầu danh sách gợi ý" chứ không phải 1 hành trình có thứ tự điểm dừng riêng.

Quyết định: không tạo bảng Tuyến công tác riêng. "Tuyến" chỉ là 1 cờ boolean `thuongDung` trên chính Địa điểm. Danh mục Địa điểm có: tên đầy đủ, danh sách các cách ghi tắt khác (mảng chuỗi — thực tế 1 địa điểm có thể có nhiều cách viết tắt khác nhau để khớp chỗ trống trên mẫu in giấy, vd Đồng Tháp ghi tắt "CL", "MT"), ghi chú, trạng thái, cờ thường dùng, cờ điểm đi mặc định (dùng tự động điền "Nơi đi" trong GĐĐ). Không đưa chi nhánh/đại lý vé số/cơ quan liên quan vào phạm vi này.

Lý do: cấu trúc dữ liệu LĐCT/GĐĐ hiện tại không đòi hỏi mô hình hành trình nhiều chặng — việc ghép nhiều địa điểm thành 1 câu (khi 1 chuyến công tác đi nhiều tỉnh) là việc của module lập LĐCT/GĐĐ sau này, không phải của danh mục nền tảng. Giữ danh mục đơn giản, dễ bảo trì hơn.

Ghi chú bối cảnh phát hiện được khi đọc file thật: công ty có các chuyến công tác liên tỉnh thường xuyên đến TP.HCM, Cần Thơ, Đồng Tháp, Vĩnh Long, Cà Mau, Tây Ninh và trong nội tỉnh An Giang (sau sáp nhập 2025, An Giang bao gồm cả địa bàn Kiên Giang cũ như Rạch Giá) đến Tri Tôn, Châu Đốc, Tịnh Biên. Đã thêm sẵn 12 địa điểm này qua script tương tự `phuong-tien:them-mau`.

## Phát hiện: cần module "Phân công lịch công tác" riêng (Trạm/Tuyến/trực hủy vé ế) — CHƯA BUILD

Bối cảnh: sau khi Danh mục Địa điểm đã xong, người dùng cung cấp file Excel thật "Lịch công tác tháng 06-2026" (4 sheet: CT, HV và 2 sheet lưu tháng trước CT7/HV7) để giải thích khái niệm "tuyến đi thường trong tuần". Đọc file cho thấy đây là lịch phân công định kỳ hàng tháng, phức tạp hơn nhiều so với giả định ban đầu, gồm 3 phần khác nhau:

1. **Công tác Trạm** (vd "Trạm thành phố Hồ Chí Minh"): mỗi tuần (thứ Từ-đến) phân công người phụ trách 4 mảng nghiệp vụ cố định (Kế hoạch, Kế toán, Trả thưởng, Kho quỹ), "Trưởng đoàn" luân phiên theo mảng (không phải 1 người cố định). Có thêm bảng riêng "Trực trạm cuối tuần" — 2 người/đợt cuối tuần, ngày đi/về khác với đợt công tác thường trong tuần → xác nhận thành viên trong cùng 1 đoàn có thể có ngày giờ đi/về khác nhau.
2. **Tuyến 1-4**: đây mới đúng nghĩa "Tuyến" ban đầu người dùng hỏi — mỗi tuyến có thứ cố định trong tuần (vd Tuyến 1 luôn thứ Năm), đi qua NHIỀU địa điểm cùng lúc (vd "Tuyến 1: Đồng Tháp (P.Sa Đéc), Vĩnh Long (P.Tân Hạnh, P.Trà Vinh)"), có tài xế cố định theo tuyến, nhân sự đi cùng đổi theo từng tuần. Đây xác nhận "CL/MT" trong Danh mục Địa điểm chính là viết tắt của "phường Cao Lãnh"/"phường Mỹ Tho" (Tuyến 3).
3. **Phân công trực hủy vé ế các tỉnh**: lịch trực nội bộ khác hẳn (không phải đi công tác xa) — theo ngày trong tuần, nhóm theo đợt do 1 thành viên Ban Giám đốc phụ trách luân phiên.

Quyết định: **CHƯA build module này.** Chỉ ghi nhận 2 điều để áp dụng khi làm module LĐCT sau này (xem `QUY_TAC_NGHIEP_VU.md` mục "Lệnh điều công tác (LĐCT)" đã cập nhật):
- Ngày giờ đi/về trong LĐCT phải cho sửa riêng theo từng thành viên, không chỉ 1 cặp ngày dùng chung cho cả đoàn.
- Quyết định trước đó "gộp Tuyến vào cờ thường dùng trên Địa điểm" (mục phía trên) **không đủ** cho nhu cầu "Tuyến" thật — khi build module Phân công lịch công tác sau này, Tuyến cần là thực thể riêng: tên/số tuyến, thứ cố định trong tuần, danh sách nhiều địa điểm, tài xế cố định, nhân sự đổi theo tuần. Không sửa lại Danh mục Địa điểm ngay bây giờ vì LĐCT (nơi thực sự cần Tuyến) chưa tới lượt làm.

Lý do không build ngay: quy mô lớn (3 loại lịch khác nhau), chưa nằm trong 16 bước lộ trình gốc, ưu tiên đi đúng thứ tự đã chốt (Địa điểm → dãy số chứng từ → người ký → LĐX → LĐCT...) thay vì rẽ nhánh giữa chừng. Sẽ quay lại thiết kế kỹ (dùng brainstorming) khi tới lượt hoặc khi người dùng yêu cầu.

## [2026-08-06] Định dạng số chứng từ: đệm số 0 tối thiểu 2 chữ số

Bối cảnh: vừa xây xong module Đánh số (thiết lập số bắt đầu theo năm cho LĐCT/GĐĐ/LĐX). Người dùng cho biết số chứng từ theo chuẩn hành chính công ty đang dùng là "01" chứ không phải "1".

Quyết định: bộ đếm trong CSDL (`CauHinhDanhSo.soBatDau`/`soHienTai`) vẫn giữ nguyên là số nguyên thuần — không đổi kiểu dữ liệu hay logic `capSo()`/`thietLap()`. Chỉ thêm tiện ích dùng chung `dinhDangSoChungTu(so: number): string` (`packages/shared/src/dinh-dang/dinh-dang-so-chung-tu.ts`) đệm số 0 tối thiểu 2 chữ số (`padStart(2, "0")`) — dùng ở MỌI nơi hiển thị/in số chứng từ, bắt đầu từ cột "Số đã cấp gần nhất" và phần xem trước ở trang `/danh-so`.

Lý do: tách biệt tầng lưu trữ (int, dùng cho phép so sánh/tăng nguyên tử) khỏi tầng hiển thị (string, theo thể thức văn bản hành chính) — đúng nguyên tắc đã áp dụng cho các trường "Số LĐCT/GĐĐ/LĐX" trong `QUY_TAC_NGHIEP_VU.md` (khai là "Chuỗi, tự sinh" chứ không phải số). Khi làm module LĐCT/GĐĐ/LĐX sau này, ghép chuỗi số hiệu đầy đủ (vd "01/LĐCT-XSKT") sẽ dùng lại đúng hàm này, không viết lại logic đệm số ở nhiều nơi.

Phương án khác đã cân nhắc: đệm cố định độ rộng lớn hơn (vd 3-4 chữ số như "001") — không chọn vì người dùng chỉ nêu ví dụ "01", và công ty ít khi vượt quá 99 chứng từ/năm cho từng loại; nếu sau này cần đổi độ rộng đệm chỉ cần sửa 1 chỗ trong `dinhDangSoChungTu()`.

## [2026-08-06] Tách ký hiệu in trên chứng từ khỏi mã nội bộ LDCT/GDD/LDX

Bối cảnh: người dùng hỏi "nếu sau này ký hiệu mã chứng từ thay đổi thì sao? Ví dụ LĐCT đổi thành ký hiệu khác" — lo ngại hợp lý vì enum `LoaiChungTu` (LDCT/GDD/LDX) trong Prisma là khóa CSDL cho 3 dãy số độc lập.

Quyết định: 2 khái niệm tách biệt hoàn toàn:
1. **Mã nội bộ** (`LDCT`/`GDD`/`LDX`, kiểu Prisma enum `LoaiChungTu`) — chỉ dùng làm khóa xác định "đây là dãy số nào" trong `CauHinhDanhSo`. Cố định, gắn với việc có đúng 3 loại chứng từ (đã chốt ở đầu `CLAUDE.md`), đổi sẽ cần migration nhưng gần như không có lý do nghiệp vụ để đổi (số lượng/bản chất 3 loại chứng từ không đổi, chỉ tên gọi có thể đổi).
2. **Ký hiệu in** (vd "LĐCT") — hằng số text thuần `KY_HIEU_LOAI_CHUNG_TU` (`packages/shared/src/dinh-dang/ky-hieu-chung-tu.ts`), không lưu trong CSDL. Đổi ký hiệu chỉ sửa 1 dòng trong file này, không cần migration, áp dụng ngay cho các chứng từ tạo mới.

Quan trọng (ghi rõ trong `QUY_TAC_NGHIEP_VU.md` để không quên khi build LĐCT/GĐĐ/LĐX): khi tạo chứng từ, phải LƯU chuỗi số hiệu đầy đủ đã ghép sẵn (vd "01/LĐCT-XSKT") vào bản ghi chứng từ ngay lúc tạo — không ghép động từ `KY_HIEU_LOAI_CHUNG_TU` + số mỗi lần hiển thị. Nếu ghép động, đổi ký hiệu sau này sẽ làm sai lệch số hiệu hiển thị của các chứng từ cũ đã phát hành/in giấy trước đó (trong khi tờ giấy đã in ra không đổi).

Lý do: đây là nguyên tắc chuẩn khi thiết kế số hiệu văn bản hành chính — số hiệu là dữ liệu bất biến tại thời điểm phát hành, không phải giá trị suy ra động từ cấu hình hiện tại.

## [2026-08-06] Cho sửa Ký hiệu qua giao diện /danh-so (không chỉ qua code)

Bối cảnh: ngay sau quyết định trên (ký hiệu là hằng số code `KY_HIEU_LOAI_CHUNG_TU`), người dùng phản hồi trang `/danh-so` chưa có chỗ nhập ký hiệu — muốn sửa được qua giao diện, không phải nhờ sửa code mỗi lần.

Quyết định: thêm cột `kyHieu String?` (nullable) vào `CauHinhDanhSo` — để trống thì dùng mặc định từ `KY_HIEU_LOAI_CHUNG_TU`, nhập giá trị thì ghi đè riêng cho từng (loại chứng từ, năm). Trang `/danh-so` thêm cột "Ký hiệu" sửa được độc lập với "Số bắt đầu": không bị khóa khi `daCapSo` (vì ký hiệu chỉ ảnh hưởng chứng từ tạo mới sau này, không ảnh hưởng chứng từ cũ — xem quyết định "chuỗi số hiệu phải lưu sẵn lúc tạo" phía trên), chỉ khóa theo quyền `danh-so.thiet-lap`.

Sửa kèm 1 lỗi tiềm ẩn phát hiện khi làm việc này: `thietLap()` trước đó luôn ghi `soHienTai = soBatDau - 1` mỗi lần gọi, kể cả khi không đổi `soBatDau` — nếu sau này gọi lại chỉ để đổi ký hiệu thì sẽ vô tình "tua lại" bộ đếm, gây cấp trùng số ở lần cấp tiếp theo. Đã sửa: chỉ ghi lại `soBatDau`/`soHienTai` khi `soBatDau` thực sự đổi so với giá trị đang lưu; đổi riêng ký hiệu không đụng tới bộ đếm.

Phương án khác đã cân nhắc: tạo bảng cấu hình ký hiệu riêng (không theo năm, vì ký hiệu hiếm khi đổi và về bản chất không cần "thiết lập lại mỗi năm" như số bắt đầu) — không chọn vì thêm 1 bảng cho 1 trường hợp hiếm, trong khi gắn vào `CauHinhDanhSo` (đã có sẵn 1 dòng/loại/năm) tái dùng được ngay UI và API hiện có, không cần thiết kế thêm.

## [2026-08-06] Danh mục Người ký: 1 người ký dùng chung 3 loại chứng từ, chuyển bằng cờ trạng thái

Bối cảnh: bắt đầu làm bước 5 lộ trình ("Danh mục người ký và thể thức ký"). Đặc tả gốc trong `QUY_TAC_NGHIEP_VU.md` liệt kê trường "loại chứng từ áp dụng" và "trạng thái ủy quyền" nhưng chưa rõ cơ chế chuyển đổi khi người ký mặc định vắng mặt. Dùng skill brainstorming, hỏi người dùng 3 câu:

1. Cơ chế chuyển sang người ký tạm thời: chọn thủ công mỗi chứng từ, tự động theo ngày ủy quyền, hay đổi trực tiếp trong danh mục? → Người dùng chọn: **đổi trực tiếp trong danh mục** (không phải 2 phương án đề xuất ban đầu).
2. Xác nhận: chỉ 1 người "đang ký chính thức" tại 1 thời điểm, dùng chung cho cả 3 loại chứng từ (không tách theo từng loại)? → **Đúng**.
3. Ai được đổi người ký chính thức: chỉ Quản trị, hay cả Quản trị và Lãnh đạo Phòng TC-HC? → **Cả 2**.

Quyết định (mô hình dữ liệu): bảng `NguoiKy` tham chiếu `NhanVien`, có `chucDanhKy`, `theThucKy`, và 1 trường `trangThai` duy nhất 3 giá trị: `DANG_KY_CHINH_THUC` (chỉ 1 bản ghi tại 1 thời điểm, ứng dụng tự đảm bảo tính duy nhất khi đặt mới) / `DU_PHONG` / `NGUNG_SU_DUNG`. Bỏ hẳn trường "loại chứng từ áp dụng" khỏi đặc tả gốc vì không cần nữa sau câu hỏi 2. Thêm quyền riêng `nguoi-ky.dat-chinh-thuc` (tách khỏi `.sua`) để gán cho cả Quản trị hệ thống và Lãnh đạo Phòng TC-HC, còn CRUD đầy đủ (thêm/sửa thông tin/xóa) vẫn chỉ Quản trị hệ thống.

Lý do: đơn giản hóa tối đa theo YAGNI — thực tế hiện tại cả 3 loại chứng từ đều do cùng 1 lãnh đạo TC-HC ký, nên không cần mô hình phức tạp (theo ngày hiệu lực, theo từng loại chứng từ riêng). Cờ trạng thái đơn (thay vì 2 trường riêng "đang dùng" + "ủy quyền") khớp đúng 1 trường "trạng thái ủy quyền" mà đặc tả gốc đã liệt kê, không phát sinh trường thừa.

Ghi chú cho tương lai: nếu sau này công ty cần người ký khác nhau theo từng loại chứng từ (vd Trưởng phòng ký LĐCT/GĐĐ, Phó trưởng phòng ký LĐX), mô hình "1 cờ chính thức dùng chung" này không đủ — cần thiết kế lại (thêm chiều "loại chứng từ" vào bảng). Chưa có nhu cầu này nên không làm trước.

**Bổ sung kỹ thuật khi code `datChinhThuc()`:** cách làm ban đầu (đọc ai đang chính thức → hạ người đó → nâng người mới, trong 1 transaction) có nguy cơ "write skew" nếu 2 người cùng bấm "Đặt làm chính thức" cho 2 người khác nhau gần như đồng thời — mỗi giao dịch đọc snapshot cũ, có thể dẫn tới cả 2 người cùng được đánh dấu chính thức. Đã đổi sang cách an toàn hơn: `UPDATE ... WHERE trangThai = 'DANG_KY_CHINH_THUC' AND id <> :id` (hạ tất cả người khác xuống Dự phòng bằng 1 câu UPDATE có điều kiện, không dựa vào ID đã đọc trước) rồi mới `UPDATE` người được chọn lên chính thức — tận dụng cơ chế Postgres tự đánh giá lại điều kiện `WHERE` trên dữ liệu mới nhất sau khi một giao dịch đồng thời khác vừa commit xong dòng đang khóa, đảm bảo luôn đúng 1 người chính thức kể cả khi có tranh chấp đồng thời. Đã mô phỏng bằng Node độc lập để xác nhận.

## [2026-08-07] Module Lệnh điều xe (LĐX) — phạm vi bước này chỉ Tạo/Sửa/Hủy

Bối cảnh: bắt đầu bước 6 lộ trình. Dùng skill brainstorming, hỏi người dùng nhiều câu vì đặc tả LĐX có phần chồng lấn với LĐCT/GĐĐ (theo đúng nhận xét của người dùng) và có phụ thuộc vào các bước khác trong lộ trình.

Quyết định:
1. **Phạm vi trạng thái:** chỉ code Tạo (→NHAP), Sửa (chỉ khi NHAP), Hủy (→DA_HUY, bắt buộc lý do). Dùng enum `TrangThaiChungTu` đã khai báo sẵn ở `packages/shared` (đủ 7 giá trị) nhưng chưa code nút chuyển cho CHO_DUYET/DA_DUYET/TU_CHOI/DA_IN/DA_DONG_DAU — dành cho bước 7 (xem trước/in A5) và bước 10 (luồng phê duyệt).
2. **Nơi đi/Nơi đến:** lưu văn bản thuần, không bắt buộc khớp Danh mục địa điểm — ô nhập kiểu gõ-tìm gợi ý nhưng cho gõ tự do (giống cách LĐCT sẽ làm). Cần thêm biến thể ô nhập mới (`ComboboxVanBan`) khác với `Combobox` đã làm cho Người ký (Combobox chỉ cho chọn trong danh sách, không cho gõ tự do).
3. **LĐCT liên kết:** bỏ qua ở bước này, không tạo cột/quan hệ treo tới bảng LĐCT chưa tồn tại. Thêm khi build LĐCT (bước 8) — người dùng xác nhận các trường LĐX sẽ tự động lấy từ LĐCT khi có liên kết, ghi nhận cho lúc đó.
4. **Chụp lại dữ liệu lúc tạo (snapshot):** áp dụng nhất quán nguyên tắc đã dùng cho số chứng từ và người ký — số hiệu đầy đủ, biển số, nhãn hiệu xe, họ tên lái xe, người ký/chức danh/thể thức ký đều chụp lại vào chính bản ghi LĐX lúc tạo, không tham chiếu động tới Phương tiện/Nhân viên/Người ký. Vẫn giữ khóa ngoại song song để tra cứu/báo cáo.
5. **Chặn tạo nếu chưa có người ký chính thức** — báo lỗi rõ ràng thay vì tạo chứng từ thiếu người ký.
6. **Không xóa cứng** — chỉ hủy (đổi trạng thái), đúng CLAUDE.md quy tắc #6.
7. **Phân quyền:** dùng lại `chung-tu.tao/.sua/.huy` đã có sẵn, không thêm quyền mới.

Xác minh bằng ảnh mẫu Word LĐX thật người dùng cung cấp (đã dùng trước đây): thứ tự trường (Họ tên lái xe → Biển số → Nhãn hiệu → Nơi đi → Nơi đến → Mục đích → Ngày đi/về) khớp đúng thiết kế, không phải đổi gì. Mẫu ảnh có 2 điểm khác với quy tắc đã chốt trước đó (số hiệu đệm 3 chữ số "003" thay vì 2 "01"; thể thức ký ghi "GIÁM ĐỐC" thay vì "TL. GIÁM ĐỐC") — người dùng xác nhận đây là mẫu Word cũ chưa cập nhật, **giữ nguyên** quy tắc đã chốt (đệm 2 chữ số, thể thức "TL. GIÁM ĐỐC"), không sửa lại theo ảnh.

**Phát hiện thiếu khi code:** bảng `MA_QUYEN` khai báo nhóm `chung-tu.*` từ trước khi có module chứng từ nào (chỉ có `.tao/.sua/.trinh-duyet/.phe-duyet/.tu-choi/.in/.huy`, thiếu `.xem` riêng). Nếu gán `.xem` = `.tao` cho route GET thì Lãnh đạo Phòng TC-HC (chỉ có `.phe-duyet`, không có `.tao`) sẽ không xem được danh sách/chi tiết chứng từ — chặn nhầm người cần xem để duyệt sau này. Đã thêm `CHUNG_TU_XEM` riêng, gán cho cả Văn thư/Lãnh đạo TC-HC/Người xem; route GET của `LenhDieuXeController` dùng quyền này thay vì `.tao`. Nhân tiện cũng thêm `CHUNG_TU_HUY` vào vai trò Văn thư (bị thiếu, cần để Văn thư tự hủy chứng từ mình lập).

**Bổ sung UX sau khi có form thật (2026-08-07):** người dùng yêu cầu 2 điều chỉnh nhỏ cho form Tạo/Sửa LĐX:
1. Trường "Mục đích" mặc định điền sẵn "Công tác", vẫn sửa được — người dùng xác nhận đây là **quy ước dùng chung cho cả 3 loại chứng từ** (LĐCT/GĐĐ sau này build cũng mặc định "Công tác" cho trường tương ứng), không phải riêng LĐX.
2. Chọn "Lái xe" xong thì tự gợi ý "Biển số xe" theo xe *thường dùng* của lái xe đó, dựa trên quan hệ có sẵn `PhuongTien.taiXeThuongDungId` (đã có từ Danh mục phương tiện, chưa dùng tới trước đây) — vẫn là gợi ý, người dùng chọn lại biển số khác bình thường nếu cần. Áp dụng ở cả dialog Tạo và Sửa (khi đổi lái xe trong lúc sửa).

## [2026-08-07] Bước 7 lộ trình: Xem trước và in Lệnh điều xe A5

Bối cảnh: người dùng nhận xét trang `/lenh-dieu-xe` "chưa có nút xem, in" — đúng bước 7 lộ trình (`DAC_TA_UNG_DUNG.md` mục 6). Dùng skill brainstorming, hỏi 3 câu trước khi code:

1. "Xem" và "In" là 1 hành động hay 2 hành động riêng? → Người dùng chọn **1 nút duy nhất** ("Xem/In"): bấm là mở file PDF thật ở tab mới, xem và in đều qua trình xem PDF của trình duyệt — đúng tinh thần quyết định đã ghi trước đó ("Văn thư luôn xem trước PDF trước khi in").
2. Thư viện dựng PDF: Playwright hay Puppeteer? → **Playwright** (đã có sẵn trong stack để test e2e theo CLAUDE.md, dùng luôn cho PDF để không phát sinh thư viện/Chromium tải riêng).
3. Thiết kế mẫu in: người dùng gửi ảnh chụp thiết kế mẫu LĐX A5 thật (khác ảnh Word cũ đã dùng trước đây) — bám sát ảnh này để dựng mẫu.

Quyết định (kiến trúc): thêm `PdfService` dùng chung trong `apps/api/src/common/pdf` (`@Global`, giữ 1 Chromium headless sống suốt vòng đời app thay vì mở mới mỗi lần in — tránh tốn ~1-2s mở trình duyệt mỗi lần). Endpoint `GET /lenh-dieu-xe/:id/pdf` (quyền `chung-tu.in`, tái dùng quyền có sẵn — hiện chỉ Văn thư có) trả `StreamableFile` PDF tạo theo yêu cầu, không lưu file. HTML mẫu (`lenh-dieu-xe-mau-in.ts`) tự chứa toàn bộ CSS + logo dạng base64 inline — không tham chiếu URL/font ngoài, để không phụ thuộc mạng lúc in.

Quyết định (mẫu in, theo ảnh): khổ A5 dọc; header 2 cột (trái: UBND tỉnh + tên công ty + số hiệu; phải: quốc hiệu tiêu ngữ + ngày ký); tiêu đề "LỆNH ĐIỀU XE" lớn giữa trang; khung viền nổi bật chứa biển số ngay dưới tiêu đề; danh sách trường có chấm (Họ tên lái xe/Biển số/Nhãn hiệu/Nơi đi/Nơi đến/Mục đích/Ngày đi-về); logo công ty (`apps/api/assets/logo-cong-ty.png`, copy từ `apps/web/public/logo/logo-cong-ty-600.png`) làm hình mờ giữa trang. 2 điểm chỉnh so với ảnh mẫu, đã xác nhận với người dùng: (a) khối ký lấy **động** theo `nguoiKyTheThuc` (mặc định "TL. GIÁM ĐỐC" từ Danh mục người ký) thay vì in cứng "GIÁM ĐỐC" như ảnh minh họa; (b) có in thêm họ tên người ký dưới chức danh (ảnh không có dòng này, nhưng dữ liệu đã chụp lại sẵn từ lúc tạo chứng từ). Phông dùng font hệ thống an toàn (Arial/Helvetica) thay vì Be Vietnam Pro của giao diện — tránh phụ thuộc tải font qua mạng lúc in.

Phương án khác đã cân nhắc: tách "Xem chi tiết" (trong app, không cần PDF) và "In" (xuất PDF) thành 2 hành động riêng — không chọn vì phức tạp hơn không cần thiết ở bước này, người dùng xác nhận 1 nút là đủ.

**Cần làm 1 lần trên máy người dùng sau khi code xong:** `pnpm install` (thêm dependency `playwright`) rồi `pnpm --filter @congtac/api playwright:cai-trinh-duyet` (tải Chromium cho Playwright) — thiếu bước này backend sẽ lỗi biên dịch `Cannot find module 'playwright'`, kéo theo sập luôn cả đăng nhập giống 2 lần trước (module Prisma Client chưa sinh lại).

**Sửa lỗi sau khi thử thật (cùng ngày):**
1. `Content-Disposition` không cho ký tự có dấu — tên file tải về lấy từ số hiệu ("01/LĐX" có chữ "Đ") làm Node báo `ERR_INVALID_CHAR`. Đã bỏ dấu tên file bằng `boDauTiengViet()` (tiện ích có sẵn) trước khi đưa vào header.
2. Nội dung tràn sang trang 2 (rớt dòng) — 2 cột header (tên công ty/quốc hiệu tiêu ngữ) quá hẹp so với cỡ chữ ban đầu (9.5-10pt), khiến các dòng dài tự xuống dòng giữa chừng, đội chiều cao header lên và đẩy toàn bộ nội dung tràn quá 1 trang A5. Đã giảm cỡ chữ header (còn 8-8.5pt) + `white-space: nowrap` cho các dòng 1 hàng, thu hẹp khoảng cách/đệm toàn mẫu (padding, margin, gap) để nội dung nằm gọn trong 210mm với biên an toàn ~40-50mm. Đổi `.trang` từ `min-height` sang `height: 210mm; overflow: hidden` — nếu lỡ vẫn tính sai, mẫu sẽ cắt bớt thay vì lặng lẽ tràn sang trang 2 (dễ phát hiện lỗi hơn khi kiểm tra).

Chưa render thử được bằng Playwright thật trong môi trường làm việc của Claude (mạng sandbox chặn tải Chromium) — chỉ tính toán bằng ước lượng chiều cao dòng/cỡ chữ, cần người dùng xác nhận lại sau khi chạy thật.

**Bổ sung sau phản hồi lần 2 (cùng ngày):**
1. Khối "tên cơ quan ban hành" / "quốc hiệu tiêu ngữ" trình bày lại theo đúng thể thức Nghị định 30/2020/NĐ-CP (công tác văn thư): dòng cơ quan chủ quản (UBND tỉnh) chữ thường không đậm; dòng cơ quan ban hành (tên công ty) in hoa đậm, có gạch chân bên dưới; "CỘNG HÒA..." in hoa đậm; "Độc lập - Tự do - Hạnh phúc" chữ thường đậm, gạch chân dài đúng bằng dòng chữ đó (dùng `border-bottom` trên `inline-block` để tự khớp độ dài, không cố định mm). Đổi phông riêng khối này (thật ra cả trang) sang Times New Roman — đúng phông chuẩn công văn hành chính Việt Nam, đồng thời là phông hệ thống có sẵn trên Windows nên không phát sinh phụ thuộc mạng như lo ngại trước đó với Be Vietnam Pro. Cỡ chữ giữ tỷ lệ nhỏ hơn mức 12-13 nghị định quy định (vì đó là mức tính cho khổ A4 đầy trang) để vừa cột hẹp khi trình bày 2 cột trên khổ A5 — không đổi tỷ lệ đậm/nhạt/viết hoa/gạch chân.
2. Xử lý trường hợp dữ liệu tự do quá dài (vd Nơi đến dài): bỏ `overflow: hidden` và `height` cố định của `.trang` (đổi lại `min-height`) — nếu nội dung thật sự vượt 1 trang A5 thì tràn tự nhiên sang trang 2 giống máy in thật, **không bao giờ cắt mất dữ liệu**. Thêm `overflow-wrap`/`word-break` cho các ô giá trị để chữ dài tự xuống dòng gọn trong cột thay vì tràn ngang ra ngoài trang. Hình mờ logo đổi từ `position: absolute` sang `position: fixed` để tự lặp lại trên mọi trang nếu lỡ tràn sang trang 2.

**Bổ sung sau phản hồi lần 3 (cùng ngày) — chỉnh đúng chi tiết Nghị định 30 + đổi phông:**
1. Dòng "Độc lập - Tự do - Hạnh phúc" tăng lên **lớn hơn 1 nấc** so với dòng "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM" (10pt so với 9pt) — đúng quy định, lần trước chênh lệch chỉ 0.5pt nên gần như không thấy khác biệt.
2. Đường gạch chân dưới tên công ty (dòng "XỔ SỐ KIẾN THIẾT AN GIANG") đổi từ ước lượng % theo cột sang **đúng 2/3 độ dài thật của chính dòng chữ đó** — dùng kỹ thuật `inline-block` bọc dòng chữ (tự co theo độ rộng chữ thật) + `position: absolute; width: 66.667%` bên trong, canh giữa — không phụ thuộc cỡ chữ/font đổi sau này vẫn tự đúng tỷ lệ.
3. Đổi phông toàn mẫu in từ Times New Roman sang **Be Vietnam Pro** (không chân, chuẩn tiếng Việt, cùng phông với giao diện web theo `QUY_TAC_GIAO_DIEN.md`) — nhúng trực tiếp file `.ttf` dạng base64 vào CSS (`@font-face`), không tải qua mạng lúc in. Cần 4 file đặt tại `apps/api/assets/fonts/`: `BeVietnamPro-Regular.ttf`, `BeVietnamPro-Italic.ttf`, `BeVietnamPro-Bold.ttf`, `BeVietnamPro-ExtraBold.ttf` (tải từ fonts.google.com/specimen/Be+Vietnam+Pro, nút "Download family", lấy đúng 4 file static TTF trên trong thư mục giải nén). Nếu thiếu file nào, `@font-face` tương ứng tự bị bỏ qua lúc dựng HTML — không lỗi, chỉ tự rớt về phông hệ thống (Arial) cho tới khi có đủ file.

## [2026-08-07] Canh lề mẫu in LĐX theo Nghị định 30

Bối cảnh: người dùng hỏi quy định canh lề khổ A5. Tra cứu web (luatvietnam.vn, tổng hợp từ nhiều nguồn) xác nhận Nghị định 30/2020/NĐ-CP quy định **1 bộ số chung cho mọi khổ giấy** (không có bảng riêng cho A5): lề trên 20-25mm, lề dưới 20-25mm, lề trái 30-35mm, lề phải 15-20mm; khổ A5 chỉ được nêu là dùng cho giấy giới thiệu/biên nhận hồ sơ/phiếu chuyển, không đi kèm số đo lề riêng.

Lưu ý đã nêu với người dùng: "Lệnh điều xe" không nằm trong danh mục văn bản hành chính Nghị định 30 liệt kê cụ thể (nghị quyết, quyết định, công văn, giấy giới thiệu...) — đây là chứng từ nội bộ, việc áp thể thức/canh lề theo nghị định là tự nguyện làm cho trang trọng, không bắt buộc.

Quyết định: người dùng chọn **áp đúng mức tối thiểu của nghị định** — trên 20mm, dưới 20mm, trái 30mm, phải 15mm (`padding: 20mm 15mm 20mm 30mm`). Lề trái/phải lệch nhau (30 vs 15) là đúng ý nghị định (chừa lề đóng tập/lưu trữ), không phải lỗi — nội dung vẫn tự căn giữa cân đối trong phần diện tích còn lại (103mm/148mm bề ngang), không bị lệch mất cân đối.

Hệ quả kỹ thuật: bề rộng nội dung mỗi cột header co lại còn ~50mm (từ ~62mm trước đó) — phải giảm thêm cỡ chữ khối "tên cơ quan"/"quốc hiệu tiêu ngữ" xuống 7-8pt (từ 9-10pt) để không tái phát lỗi rớt dòng đã sửa trước đó, vẫn giữ đúng tỷ lệ "Độc lập - Tự do - Hạnh phúc" lớn hơn "CỘNG HÒA..." 1pt theo yêu cầu trước. Các phần khác (trường thông tin, khối ký) không đổi cỡ chữ, chỉ co nhẹ vài khoảng cách (margin/gap) để bù lại ~24mm chiều cao mất đi do lề trên/dưới tăng từ 8mm lên 20mm mỗi bên.

**Rút lại (cùng ngày):** người dùng xem thử bản canh lề đúng Nghị định 30, phản hồi "không ổn" — chữ 7-8pt quá nhỏ, khó đọc dù không còn rớt dòng. Quay lại lề gọn ban đầu (`padding: 8mm 10mm`) và cỡ chữ 9-10pt như trước khi thử. Bài học: với khổ A5 nhỏ và bố cục 2 cột, ưu tiên chữ đọc được rõ ràng hơn là bám tuyệt đối trị số lề của Nghị định 30 (vốn tính cho khổ A4) — nhất quán với ghi chú "Lệnh điều xe không thuộc danh mục văn bản Nghị định 30 liệt kê cụ thể" đã nêu ở trên.

## [2026-08-10] Thông tin đơn vị (tên UBND/công ty) chuyển vào DB thay vì hardcode

Bối cảnh: người dùng hỏi hệ thống xử lý ra sao khi công ty đổi tên (khả năng sáp nhập trong tương lai gần) hoặc cần sửa tiêu đề mẫu in. Rà lại code phát hiện tên đơn vị đang hardcode rải rác ở nhiều nơi độc lập: `lenh-dieu-xe-mau-in.ts` (5-6 chuỗi trong mẫu in PDF: UBND TỈNH AN GIANG, CÔNG TY TNHH MỘT THÀNH VIÊN, XỔ SỐ KIẾN THIẾT AN GIANG, "An Giang" trong dòng ngày ký), `sidebar.tsx` và `app-shell.tsx` (mỗi file 1 chuỗi "XSKT An Giang" độc lập). Khi LĐCT/GĐĐ được build tiếp, mẫu in của chúng gần như chắc chắn sẽ copy lại đúng các chuỗi này — càng để lâu càng nhiều chỗ phải sửa khi đổi tên.

Quyết định: tạo bảng `CauHinhDonVi` — CHỈ 1 dòng duy nhất (id cố định `"mac-dinh"`), gồm `donViChuQuan`, `tenCoQuanDong1`, `tenCoQuanDong2`, `tenNgan`, `diaDanh`. Sửa qua giao diện `/cau-hinh-don-vi` (form 5 ô nhập), chỉ Quản trị hệ thống sửa được (`don-vi.sua`), tất cả vai trò xem được (`don-vi.xem` — sidebar cần đọc). Mẫu in LĐX (`taoHtmlLenhDieuXe`) và sidebar/app-shell đều đọc từ đây qua `CauHinhDonViService.layCauHinh()` (backend) / `useCauHinhDonVi()` (frontend), không còn hardcode chuỗi nào liên quan tên đơn vị trong các file đó.

Lý do: người dùng chọn rõ ràng "cho vào quyền quản trị, có textbox để nhập tên đơn vị" thay vì phương án hằng số trong code — dù ứng dụng hiện chỉ 1 người vừa code vừa vận hành (sửa hằng số + deploy lại không tốn nhiều công), việc sáp nhập là sự kiện đã biết trước sẽ xảy ra, và có giao diện sửa trực tiếp giúp xử lý ngay lúc cần mà không phải dừng để sửa code/deploy giữa lúc bận (đặc biệt nếu về sau chuyển sang hosting ngoài, không còn quyền truy cập máy chủ tức thời như localhost hiện tại).

Cố tình KHÔNG đưa vào bảng cấu hình này: quốc hiệu tiêu ngữ ("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM" / "Độc lập - Tự do - Hạnh phúc") — thể thức quốc gia, không đổi theo đơn vị, vẫn hardcode cố định trong mẫu in. Tiêu đề từng loại chứng từ (vd "LỆNH ĐIỀU XE") — gắn liền với mẫu in riêng của từng loại chứng từ (LĐCT/GĐĐ/LĐX có tiêu đề khác nhau), không có ý nghĩa gộp chung.

Phương án khác đã cân nhắc: hằng số trong `packages/shared` (sửa code + deploy lại khi đổi tên) — đơn giản hơn về mặt kỹ thuật nhưng người dùng không chọn, vì lý do nêu trên.

## [2026-08-10] Bỏ luồng phê duyệt — Văn thư lập và in trực tiếp

Bối cảnh: đặc tả ban đầu (mục 1 DAC_TA_UNG_DUNG.md, quy trình chung trong QUY_TAC_NGHIEP_VU.md) hình dung mỗi chứng từ đi qua bước "Văn thư trình lãnh đạo Phòng TC-HC phê duyệt" trước khi in — mô hình `TrangThaiChungTu` (NHAP/CHO_DUYET/DA_DUYET/TU_CHOI/DA_IN/DA_DONG_DAU/DA_HUY) và các quyền `chung-tu.trinh-duyet`/`.phe-duyet`/`.tu-choi` được dựng sẵn khung cho luồng này ngay từ đầu, dù ở bước build LĐX (module đầu tiên) mới chỉ code Tạo/Sửa (khi NHAP)/Hủy — phần duyệt để dành "bước 10" làm sau.

Quyết định: **bỏ hẳn khái niệm phê duyệt khỏi toàn bộ hệ thống** (áp dụng cho cả LĐX hiện tại lẫn LĐCT/GĐĐ sẽ build sau này, không chỉ riêng LĐX). Văn thư lập chứng từ xong là in được ngay, không cần trình ai duyệt. Cụ thể:

- Model chứng từ (LenhDieuXe, và LĐCT/GĐĐ sau này) bỏ trường `trangThai` (enum nhiều nấc), thay bằng 1 cờ duy nhất `daHuy: Boolean` — chỉ còn phân biệt "chưa hủy" / "đã hủy".
- Bỏ 3 quyền `chung-tu.trinh-duyet`, `chung-tu.phe-duyet`, `chung-tu.tu-choi` khỏi `MA_QUYEN` — chỉ còn `.xem`, `.tao`, `.sua`, `.in`, `.huy`.
- Quy tắc sửa: sửa được bất cứ lúc nào cho đến khi hủy (không còn khóa sửa sau khi "đã in" như dự kiến ban đầu — Văn thư có thể in nháp nhiều lần, sửa lại, in lại, miễn chưa hủy).
- Vai trò **Lãnh đạo Phòng TC-HC vẫn giữ lại** (không xóa) dù mất lý do tồn tại ban đầu (phê duyệt) — có thể dùng cho việc khác sau này (xem báo cáo, thay người ký chính thức khi vắng mặt — quyền `nguoi-ky.dat-chinh-thuc` vẫn giữ cho vai trò này).
- Bỏ luôn mục "16. Bổ sung bảo mật cho phê duyệt ngoài mạng nội bộ" khỏi lộ trình module và mục "Cơ chế OTP/2FA cụ thể cho phê duyệt ngoài mạng nội bộ" khỏi danh sách "chưa chốt" trong CLAUDE.md — không còn gì để duyệt từ xa nữa nên câu hỏi này tự động không còn áp dụng.
- Giao diện `/lenh-dieu-xe`: bỏ cột "Trạng thái" và bộ lọc trạng thái nhiều nấc khỏi bảng danh sách; chỉ còn bộ lọc "Tất cả / Chưa hủy / Đã hủy" và dòng "· Đã hủy" nhỏ cạnh số hiệu (không dùng Badge màu) cho các chứng từ đã hủy, để không đánh mất hoàn toàn khả năng nhận biết record nào đã hủy dù không hiển thị badge trạng thái.

Lý do: người dùng xác nhận trực tiếp quy trình thực tế của Phòng TC-HC không cần bước phê duyệt nội bộ trong hệ thống — Văn thư là người trực tiếp lập và chịu trách nhiệm, việc ký/đóng dấu (là bước "duyệt" thực chất) đã có ở ngoài hệ thống (trên giấy). Giữ nguyên khung phê duyệt cũ sẽ tạo ra các trường/quyền/vai trò không bao giờ dùng tới, gây khó hiểu cho người bảo trì sau này (đúng tinh thần CLAUDE.md: một người vừa code vừa vận hành, ưu tiên đơn giản/dễ hiểu hơn tính năng dự phòng chưa chắc cần).

Phương án khác đã cân nhắc: giữ trường trạng thái nhưng rút gọn còn Nháp → Đã in → Đã hủy (không có bước duyệt nhưng vẫn khóa sửa sau khi in) — không chọn, vì người dùng chọn rõ "bỏ hẳn trường trạng thái", ưu tiên đơn giản tối đa (chỉ còn cờ hủy).

## [2026-08-10] LĐCT sinh kèm GĐĐ và LĐX — 1 form, 1 nút Lưu, 3 loại chứng từ

Bối cảnh: bắt đầu bước 8 lộ trình (LĐCT). Đề xuất ban đầu của tôi là "lập LĐCT trước, sau đó bấm nút riêng 'Lập lệnh điều xe từ chuyến này' khi cần" — người dùng bác bỏ, mô tả đúng quy trình thực tế: Văn thư lập LĐCT (điền nơi đi/đến, ngày, mục đích), chọn danh sách nhân viên đi công tác (tìm-chọn-nhiều, mỗi người có thể có ngày đi/về riêng), nếu trong đoàn có tài xế thì chọn thêm biển số — bấm **Lưu** một lần là xong cả 3 chứng từ, không phải thao tác nhiều bước rời rạc.

Quyết định — kiến trúc dữ liệu và luồng:

1. **Model mới:** `LenhDieuCongTac` (trường chung đoàn: địa điểm, nhiệm vụ, ngày đi/về mặc định, người ký, đã hủy...), bảng con `ThanhVienLenhDieuCongTac` (tham chiếu Nhân viên, ngày đi/về riêng nullable, cờ đã hủy riêng cho GĐĐ của người đó), model `GiayDiDuong` (GĐĐ, tham chiếu LenhDieuCongTac + thành viên). `LenhDieuXe` thêm cột `lenhDieuCongTacId` nullable.
2. **1 transaction duy nhất khi Lưu** (đúng CLAUDE.md quy tắc TUYỆT ĐỐI #1): cấp số LĐCT → tạo bản ghi + thành viên → cấp số GĐĐ cho từng thành viên (N lần, dùng lại `DanhSoService.capSo()` đã có, chỉ đổi `LoaiChungTu`) → nếu có tài xế + biển số thì cấp thêm số LĐX, gán `lenhDieuCongTacId` ngược lại. Lỗi ở bất kỳ bước nào thì rollback toàn bộ, không tạo dở dang.
3. **GĐĐ không snapshot cứng như LĐX** — các trường "tự động theo LĐCT" (nơi đi/đến, ngày, phương tiện, người ký) tính động theo dữ liệu LĐCT/thành viên hiện tại lúc xem/in, không lưu bản sao tĩnh. Sửa LĐCT sau khi tạo → GĐĐ liên quan tự cập nhật theo. Đây là khác biệt có chủ đích so với LĐX (đã snapshot lái xe/biển số/người ký lúc tạo) — vì GĐĐ về bản chất là "bản trích của LĐCT cho từng người", không phải chứng từ độc lập.
4. **LĐX sinh kèm chỉ đồng bộ phần liên quan đến tài xế:** thay đổi ảnh hưởng trực tiếp đến tài xế đó (ngày riêng của tài xế, nơi đi/đến/mục đích chung đoàn, đổi biển số) thì LĐX cập nhật theo; thay đổi không liên quan (vd thành viên khác đổi ngày) không ảnh hưởng gì đến LĐX. LĐX tạo độc lập (không qua LĐCT, dùng trang `/lenh-dieu-xe` như hiện tại) không có liên kết này, hoạt động y nguyên như trước — không đổi hành vi cũ.
5. **Xóa thành viên khỏi đoàn sau khi đã lưu:** hỏi xác nhận có hủy GĐĐ của người đó không — không tự hủy âm thầm (số đã cấp không tái sử dụng, đúng CLAUDE.md quy tắc TUYỆT ĐỐI #6).
6. **Hủy cả LĐCT:** hỏi xác nhận, đồng ý thì hủy cascade toàn bộ GĐĐ con + LĐX liên kết chưa hủy, dùng chung 1 lý do hủy — không hủy rời rạc từng chứng từ.
7. **Ngày đi/về của LĐCT/GĐĐ:** ban đầu đặc tả ghi "Ngày giờ" (có giờ), người dùng xác nhận bỏ giờ, chỉ dùng Ngày như LĐX — đơn giản hơn, đồng bộ giao diện.
8. **In ấn tách 2 file PDF:** LĐCT + LĐX in 1 mặt, GĐĐ in 2 mặt (mặt sau để trống điền tay) — một máy in chỉ đặt được 1 chế độ mặt/lần in nên không gộp chung 1 file. Trang chi tiết LĐCT có 2 nút: "In LĐCT + LĐX" và "In toàn bộ GĐĐ" (PDF nhiều trang, mỗi thành viên 2 trang). LĐCT tự động A5→A4 khi nội dung tràn quá 1 trang; GĐĐ cố định A5 2 mặt.

Lý do: người dùng mô tả rõ quy trình thực tế của Phòng TC-HC — Văn thư không lập từng chứng từ rời rạc rồi tự nhớ liên kết bằng tay, mà lập 1 lần cho cả chuyến công tác. Gộp thành 1 luồng giảm sai sót (quên tạo GĐĐ cho 1 thành viên, gõ lại tay ngày/nơi đi trùng lặp) và đúng cách người dùng thật sự làm việc.

Phương án khác đã cân nhắc: (a) 3 module độc lập, liên kết thủ công bằng nút "tạo từ..." sau khi đã lưu từng cái — không chọn, vì người dùng xác nhận đây không đúng quy trình thật, tạo thêm bước thừa. (b) GĐĐ snapshot cứng như LĐX — không chọn, vì người dùng chọn rõ "sửa LĐCT thì GĐĐ tự cập nhật theo", hợp lý hơn vì GĐĐ vốn là bản trích xuất phụ thuộc LĐCT chứ không phải chứng từ gốc độc lập. (c) Gộp 1 file PDF in tất cả — không chọn vì xung đột chế độ in 1 mặt/2 mặt trên cùng 1 lần in, người dùng xác nhận vấn đề này khi được hỏi lại.

## [2026-08-10] Chỉnh UI dialog Lập/Sửa LĐCT sau khi xem ảnh chụp thật

Bối cảnh: người dùng chạy thử form Lập LĐCT vừa build, gửi ảnh chụp màn hình kèm 5 phản hồi: form dài quá 1 khung nhìn, đổi tên trường "Nhiệm vụ / nội dung" thành "Mục đích" (ngắn gọn hơn), bỏ hẳn "Căn cứ" khỏi form, ngày đi/về riêng của từng thành viên nên mặc định theo ngày chung thay vì để trống nhìn như hỏng, và khi thêm 1 người có cờ tài xế vào đoàn thì tự động chọn người đó làm tài xế + tự điền xe thường dùng của họ (giống hành vi `chonLaiXe()` đã có ở LĐX).

Quyết định:

1. **Đổi tên trường CSDL** `LenhDieuCongTac.nhiemVu` → `mucDich` (kèm migration) — đồng nhất cách gọi với `LenhDieuXe.mucDich` đã có, áp dụng xuyên suốt schema/Zod/service/hook/giao diện.
2. **Ẩn "Căn cứ" khỏi form Lập/Sửa** — vẫn giữ cột `canCu` trong CSDL (không bắt buộc, không xóa migration) phòng khi cần dùng lại, chỉ bỏ khỏi giao diện nhập liệu để form ngắn lại.
3. **`DialogContent` của 2 dialog này thêm `max-h-[85vh] overflow-y-auto`** (không sửa component `Dialog` dùng chung, chỉ áp riêng cho 2 dialog LĐCT vì đây là form dài nhất từ trước đến nay — có bảng thành viên động).
4. **Ngày đi/về riêng mặc định hiển thị trùng ngày chung của đoàn** — khi thêm 1 thành viên mới (dialog Lập), hoặc khi nạp lại 1 thành viên chưa từng có ngày riêng (dialog Sửa), ô ngày riêng được điền sẵn = ngày chung hiện tại thay vì để trống. Để giữ đúng ý nghĩa "riêng = ngoại lệ" (và để GĐĐ vẫn tự cập nhật đúng theo `NHAT_KY_QUYET_DINH.md` mục "LĐCT sinh kèm GĐĐ và LĐX" #3 khi sau này sửa ngày chung), ngay trước khi gửi lên server, giá trị nào vẫn còn TRÙNG với ngày chung thì tự động đổi lại thành "không gửi" (`undefined`) — chỉ gửi lên như 1 override thật sự khi người dùng chủ động sửa khác đi.
5. **Thêm 1 thành viên mang cờ tài xế mà đoàn chưa có ai được chọn làm tài xế** → tự động set người đó vào ô "Tài xế" + tìm biển số xe thường dùng của họ (`PhuongTien.taiXeThuongDungId`) để tự điền vào ô "Biển số xe" nếu có — người dùng vẫn sửa lại được bình thường.

Lý do: phản hồi trực tiếp từ người dùng sau khi chạy thử giao diện thật — ưu tiên gọn màn hình và giảm thao tác thủ công lặp lại (đa số chuyến công tác cả đoàn đi về cùng ngày, và tài xế duy nhất trong đoàn hầu như luôn dùng đúng xe thường lái của họ).

Phương án khác đã cân nhắc cho mục 4: lưu thẳng giá trị đã điền sẵn làm override thật (đơn giản hơn về code) — không chọn vì sẽ làm mọi thành viên luôn có `ngayDiRieng`/`ngayVeRieng` cụ thể, vô hiệu hóa khả năng "tự cập nhật theo ngày chung khi sửa LĐCT sau này" đã chốt trước đó cho GĐĐ.

## [2026-08-10] Mẫu in LĐCT + GĐĐ dựng từ 5 mẫu Công lệnh kiêm giấy đi đường thật

Bối cảnh: người dùng gửi 10 file (.doc + .docx, 5 mẫu) là Công lệnh kiêm giấy đi đường thật đã dùng trong công ty ("CONG LENH ĐOÀN TP.HCM", "CONG LENH le (Quốc) 2025 - Rạch Giá", "CONG LENH le", "CONG LENH VA LENH DIEU TINH (Quốc) mới - 2026", "CONG LENH VA LENH DIEU TRAM TP.HCM - Tài xế"). Đã chuyển từng file sang PDF (LibreOffice headless) rồi ảnh hóa từng trang (pdftoppm) để xem trực tiếp bố cục thật, đối chiếu với đặc tả A5 2 mặt trong CLAUDE.md.

Quyết định — nội dung/bố cục mẫu in (`apps/api/src/lenh-dieu-cong-tac/lenh-dieu-cong-tac-mau-in.ts`):

1. **Mặt trước "CÔNG LỆNH (KIÊM) GIẤY ĐI ĐƯỜNG"** (trên xuống): letterhead 2 cột (giống LĐX) → tiêu đề → "Cấp cho Anh (Chị)" → "Chức vụ" → "Được cử đi công tác tại" → "Từ ngày...Đến ngày" → khối ký → bảng "NƠI ĐI VÀ ĐẾN | NGÀY | CHỨNG NHẬN CỦA CƠ QUAN" (4 dòng: 2 dòng đầu điền sẵn theo lượt đi/về thật, 2 dòng cuối để trống cho chặng phát sinh điền tay).
2. **Mặt sau "PHẦN KÊ THANH TOÁN"**: 4 mục I-IV để trống điền tay (tiền tàu xe, phụ cấp lưu trú, chi khác, tổng cộng) → chữ ký 2 cột (Người đi công tác / Xác nhận Phòng TV-KT) → letterhead lặp lại ở **cuối trang** (khác mặt trước — mặt trước letterhead ở đầu trang, xác nhận nhất quán qua nhiều mẫu).
3. **Số hiệu hiển thị trên letterhead của GĐĐ**: dùng số hiệu RIÊNG của GĐĐ (`GiayDiDuong.soHieu`) trên CẢ 2 mặt. Các mẫu cũ hơn không nhất quán — 1-2 mẫu cũ cho tài xế ghi số LĐCT ở mặt trước thay vì số GĐĐ — nhưng mẫu mới nhất công ty cung cấp ("... mới - 2026") dùng số GĐĐ riêng nhất quán cả 2 mặt, chọn mẫu này làm chuẩn vì mới nhất và nhất quán hơn.
4. **Trang "LỆNH ĐIỀU CÔNG TÁC"** (đi kèm LĐX khi in gộp): giữ đúng nội dung mẫu thật (đoạn văn "Giám đốc [công ty] phân công nhiệm vụ đi công tác tại [địa điểm]. Ngày/Từ ngày...đến ngày... gồm có các Đ/c sau đây:" + bảng STT/Họ và tên/Chức vụ + khối ký) nhưng **có thêm letterhead** ở đầu trang dù mẫu thật không in letterhead trên trang này (mẫu thật xem trang này như phụ lục đi kèm GĐĐ/LĐX đã có letterhead riêng) — LĐCT trong hệ thống có số hiệu riêng và được GĐĐ dùng làm căn cứ, nên in letterhead + số hiệu để chứng từ có giá trị độc lập, tránh phụ thuộc hoàn toàn vào tài liệu khác khi lưu trữ/tra cứu sau này. Bảng thành viên thêm 1 cột "Ngày đi – về (riêng)" so với mẫu thật (chỉ hiện giá trị khi thành viên đó có ngày riêng khác đoàn) vì hệ thống hỗ trợ ngày riêng theo người — mẫu giấy cũ không có field này nên không thể hiện được.
5. **Khổ giấy LĐCT tự động A5→A4**: chuyển A4 khi đoàn > 10 người HOẶC tổng độ dài "mục đích" + "địa điểm công tác" > 90 ký tự (`chonKhoGiayLenhDieuCongTac()`). Ngưỡng chọn theo ước lượng thủ công (không đo pixel thật) — có thể cần chỉnh lại sau khi thấy đoàn đông thật ngoài đời.
6. **File "LĐCT + LĐX" dùng chung 1 khổ giấy cho cả 2 trang** (khổ theo LĐCT quyết định) — khi hiếm khi LĐCT phải lên A4, trang LĐX đi kèm trong CÙNG file cũng in trên khổ A4 (thừa lề, không phải khổ chuẩn A5 của LĐX độc lập) để tránh phải trộn 2 khổ giấy khác nhau trong 1 file PDF (kỹ thuật phức tạp hơn nhiều, rủi ro không đáng với trường hợp hiếm). In LĐX ĐỘC LẬP qua `/lenh-dieu-xe/:id/pdf` (không qua LĐCT) không đổi, luôn A5.
7. **Tách chung 1 module tiện ích in** `apps/api/src/common/mau-in/mau-in-dung-chung.ts` (logo/font/thoát HTML/định dạng ngày) — trước đó các hàm này nằm riêng trong `lenh-dieu-xe-mau-in.ts`; tách ra khi bắt đầu có mẫu in thứ 2 để không chép lại y nguyên qua từng file mẫu in mới sau này.

Endpoint: `GET /lenh-dieu-cong-tac/:id/pdf-lenh` (LĐCT + LĐX, 1 mặt) và `GET /lenh-dieu-cong-tac/:id/pdf-giay-di-duong` (toàn bộ GĐĐ đang hoạt động, 2 mặt/người) — cùng quyền `chung-tu.in` như LĐX. Trang chi tiết LĐCT có 2 nút tương ứng, mở PDF ở tab mới (giống hành vi nút Xem/In của LĐX).

Lý do: dựng đúng theo mẫu giấy thật đang dùng thay vì suy đoán, để chứng từ in ra đúng như Văn thư quen thuộc và dùng được ngay khi nộp/lưu trữ.

Phương án khác đã cân nhắc: trộn khổ giấy A4/A5 trong cùng 1 file PDF bằng CSS `@page` named-page (Chromium hỗ trợ) khi LĐCT cần A4 nhưng LĐX cần A5 — không chọn vì phức tạp hơn nhiều so với lợi ích (trường hợp đoàn > 10 người hiếm), và không kiểm thử được Chromium thật trong sandbox hiện tại; ưu tiên phương án đơn giản, dễ bảo trì hơn.

## [2026-08-10] Sửa mẫu in LĐX bị viết lại sai khi ghép trong LĐCT + phục hồi menu Công lệnh/Giấy đi đường

Bối cảnh: sau khi chạy thử mẫu in LĐCT/GĐĐ vừa build, người dùng phản hồi 2 việc: (1) mẫu Lệnh điều xe khi hiện ra kèm trong file "LĐCT + LĐX" (nút in ở trang chi tiết LĐCT) hiển thị không đúng — nguyên nhân: lúc build `lenh-dieu-cong-tac-mau-in.ts` tôi viết TAY LẠI một bản đơn giản hóa cho phần LĐX (`div style=...` rời rạc) thay vì tái sử dụng đúng mẫu LĐX thật (`taoHtmlLenhDieuXe`), khiến 2 nơi hiển thị LĐX (mẫu độc lập vs mẫu ghép trong LĐCT) lệch nhau; (2) mục menu "Công lệnh/Giấy đi đường" vẫn không thấy dù đã có 2 nút in hoạt động ở trang chi tiết LĐCT — người dùng xác nhận lại lần 2 là vẫn muốn có 1 mục menu/danh sách riêng, không chỉ xem qua LĐCT.

Quyết định:

1. **Tách phần nội dung mẫu in LĐX thành hàm dùng chung** `noiDungLenhDieuXe()` (xuất từ `lenh-dieu-xe-mau-in.ts`, nhận `LenhDieuXeNoiDungDeIn` — kiểu dữ liệu tối thiểu, không bắt buộc phải là 1 bản ghi `LenhDieuXe` thật trong CSDL) — dùng CHUNG cho cả bản in LĐX độc lập (`taoHtmlLenhDieuXe`) lẫn bản ghép trong file "LĐCT + LĐX". Từ nay chỉ có 1 nơi định nghĩa nội dung/khối trường LĐX, không thể viết lại rời rạc gây lệch nhau nữa.
2. **Gộp thêm phần letterhead/khối ký** (`khoiLetterhead()`, `khoiKy()`, `trangMoHinh()`, CSS `cssLetterheadVaKy()`) vào `common/mau-in/mau-in-dung-chung.ts` — trước đó `lenh-dieu-cong-tac-mau-in.ts` cũng tự định nghĩa lại các hàm này (dù có vẻ giống hệt bằng mắt) — cùng nguyên nhân gốc với mục 1, gộp về 1 chỗ để không lặp lại lỗi này cho các mẫu in phát sinh sau này (LĐCT trạm/tuyến...).
3. **Phục hồi mục menu "Công lệnh / Giấy đi đường"** (`apps/web/lib/menu.ts`) trỏ đến trang mới `/giay-di-duong` — danh sách GDD DOC LẬP (không phải qua từng LĐCT), có tìm kiếm theo tên người/số hiệu, lọc đã hủy, cột "Lệnh điều công tác" liên kết ngược về trang chi tiết LĐCT, nút in riêng 1 người (endpoint mới `GET /giay-di-duong/:id/pdf`, chỉ in đúng công lệnh của người đó — không phải cả đoàn). Đây là thay đổi hướng so với quyết định "không có menu riêng cho GDD" ghi ngày 2026-08-10 trước đó trong mục "LĐCT sinh kèm GĐĐ và LĐX" — người dùng xác nhận lại 2 lần là vẫn cần, nên phục hồi thay vì giữ nguyên thiết kế cũ.
4. **`GiayDiDuongController` đặt RIÊNG** (không nhét route vào `LenhDieuCongTacController`) để tránh xung đột thứ tự route Nest với `@Get(":id")` sẵn có của controller đó (`GET /lenh-dieu-cong-tac/giay-di-duong` sẽ bị `:id` bắt nhầm nếu khai báo sau).

Lý do: (1) nguyên tắc "1 nơi định nghĩa duy nhất" — lặp lại markup/CSS cho cùng 1 nội dung ở 2 file là nguồn lỗi trực tiếp vừa xảy ra, sẽ còn tái diễn với các mẫu in LĐCT biến thể (trạm/tuyến) nếu không sửa gốc ngay bây giờ. (2) người dùng xác nhận rõ ràng 2 lần muốn có danh sách/menu riêng cho GDD — không nên tiếp tục cho rằng "xem qua LĐCT là đủ" khi người dùng đã phản hồi ngược lại.

Phương án khác đã cân nhắc cho mục 3: chỉ đổi tên nút ở trang chi tiết LĐCT cho rõ hơn thay vì làm hẳn 1 trang danh sách mới — không chọn vì người dùng cụ thể nói "chưa hiển thị MENU", tức muốn 1 điểm truy cập độc lập trong điều hướng, không phải chỉ rõ hơn ở nơi cũ.

## [2026-08-10] Ghi nhận yêu cầu tương lai: LĐCT có nhiều mẫu cố định hàng tuần (Trạm/Tuyến)

Bối cảnh: người dùng báo trước "Lệnh điều công tác sẽ có các mẫu cố định hàng tuần như Lệnh điều công tác trạm TPHCM (mẫu khác), lệnh điều công tác các tuyến mỗi tuần, lệnh điều công tác khác...". Đây trùng với mục "Việc chưa chốt" trong `CLAUDE.md` — module "Phân công lịch công tác" (Trạm/Tuyến/trực hủy vé ế) — đã ghi nhận là **chưa build, chưa xếp lịch, cần hỏi lại người dùng khi bắt đầu làm**.

Quyết định: **không tự ý bắt đầu thiết kế/build module này trong phiên hiện tại** — chỉ ghi nhận lại yêu cầu ở đây để không quên, chờ người dùng chủ động yêu cầu bắt đầu (đúng như CLAUDE.md đã ghi). Mẫu in LĐCT hiện tại (`lenh-dieu-cong-tac-mau-in.ts`) chỉ phục vụ luồng LĐCT "thường" (1 form/1 lần lập, tự do nhập địa điểm/mục đích) - CHƯA xử lý các mẫu Trạm/Tuyến có cấu trúc lặp lại theo tuần với đội trực luân phiên.

Lý do: module Trạm/Tuyến có độ phức tạp nghiệp vụ cao hơn nhiều so với LĐCT hiện tại (lịch phân công định kỳ, đội trực luân phiên theo tuần cho nhiều mảng nghiệp vụ, tuyến cố định theo thứ trong tuần với tài xế cố định/nhân sự đổi theo tuần, lịch trực hủy vé ế luân phiên theo Ban Giám đốc) — cần 1 vòng brainstorm/hỏi đáp riêng như các module trước (Lệnh điều xe, LĐCT...), không nên lồng vào giữa lúc đang sửa lỗi mẫu in.

## [2026-08-10] Đổi màu chủ đạo sang xanh dương

Bối cảnh: người dùng cài skill bên thứ ba `ui-ux-pro-max` (từ GitHub `nextlevelbuilder/ui-ux-pro-max-skill`) và yêu cầu dùng skill này thiết kế lại toàn bộ màu sắc giao diện. Hỏi lại xác nhận: muốn đổi hẳn tông màu chủ đạo (không chỉ tinh chỉnh xanh lá hiện có). Dùng CSV màu của skill để đề xuất 3 phương án phối màu, trình bày so sánh trực quan — người dùng chọn phương án B: **"Xanh dương công vụ"** (Government Portal / Civic Services) — Primary `#1E40AF` xanh dương, Accent `#16A34A` xanh lá, Destructive `#DC2626` đỏ.

Quyết định:
1. Token `--primary` trong `apps/web/app/globals.css` đổi từ xanh lá sang xanh dương (`oklch(0.424 0.181 265.6)` sáng / `oklch(0.714 0.143 254.6)` tối, quy đổi từ `#1E40AF` bằng `coloraide`). `--muted`/`--border`/`--input`/`--ring` đổi theo tông xanh dương nhạt để đồng bộ (trước đó trung tính xám thuần).
2. Thêm token MỚI `--success`/`--success-foreground` (xanh lá, quy đổi từ `#15803D`) — **tách hẳn khỏi `--primary`**. Trước khi đổi màu, `--primary` chính là xanh lá nên "trạng thái hoạt động = xanh lá" (quy tắc đã ghi ở `QUY_TAC_GIAO_DIEN.md`) dùng chung luôn `--primary`; nếu không tách, đổi `--primary` sang xanh dương sẽ vô tình biến mọi trạng thái "Đang hoạt động/Đang dùng/Chính thức" thành xanh dương, sai quy tắc đã chốt.
3. Cập nhật các nơi đang ngầm định `--primary` = trạng thái tích cực để trỏ sang `--success`: biến thể `default` của component `Badge` (`apps/web/components/ui/badge.tsx`) — ảnh hưởng toàn bộ chip trạng thái đang dùng khắp app (Đang làm việc, Đang dùng, Chính thức...) vì không nơi nào truyền `variant` tường minh; chấm trạng thái "Hoạt động" ở trang `/nguoi-dung`. Không cần sửa các badge `info`/`warning` (đã tách riêng từ trước) hay các chỗ dùng `text-blue-600` hardcode cho icon Sửa/nhãn "(riêng)" — những chỗ này giờ tự nhiên hài hòa với màu chủ đạo mới, không xung đột ý nghĩa.
4. Gradient nền trang đăng nhập (`apps/web/app/dang-nhap/page.tsx`) đổi điểm cuối từ `#07211a` (xanh lá đậm) sang `#010419` (xanh dương đậm gần đen) để khớp tông `--primary` mới.
5. `docs/QUY_TAC_GIAO_DIEN.md` cập nhật mục "Nhận diện thương hiệu" và bảng "Màu sắc thao tác" phản ánh đúng quy tắc mới: Thêm/Lưu/Xác nhận dùng xanh dương (`--primary`), Trạng thái hoạt động dùng xanh lá (`--success`, không phải `--primary`).

Lý do: người dùng chủ động muốn đổi hẳn nhận diện màu (không phải yêu cầu kỹ thuật bắt buộc), quyết định thẩm mỹ do người dùng chọn qua so sánh trực quan 3 phương án. Giữ nguyên tắc "1 nơi định nghĩa duy nhất" bằng CSS custom properties (token hóa) nên đổi màu chủ đạo chỉ cần sửa `globals.css` — không phải sửa hardcode rải rác; điểm rủi ro duy nhất là các chỗ ngầm định "primary = tích cực/xanh lá", đã rà và tách bằng token `--success` mới.

Chưa kiểm tra được: build/dev server thật (sandbox không chạy được Next.js dev), cần người dùng chạy `pnpm dev` để xác nhận màu hiển thị đúng ở cả theme sáng/tối trước khi xem là hoàn tất.

**Bổ sung sau khi xem thử (cùng ngày):** người dùng thêm 1 yêu cầu — tiêu đề bảng (`thead`) nên dùng nền xanh dương/chữ trắng cho nổi bật thay vì chỉ nền xám nhạt như bản chỉnh sửa trước đó. Đã sửa `TableHeader`/`TableHead` dùng chung (`apps/web/components/ui/table.tsx`) sang `bg-primary`/`text-primary-foreground`, kèm sửa 3 trang có sort cột cục bộ (Nhân viên, Phương tiện, Địa điểm — hàm `TieuDeSapXep` lặp lại y hệt ở cả 3 file) đổi màu icon mũi tên sắp xếp và checkbox "chọn tất cả" sang biến thể trắng/xanh đảo ngược để không chìm vào nền mới.

Ngay sau đó người dùng phản hồi tiếp "cho màu xanh dương nhẹ lại chút" — vì nền tiêu đề bảng dùng nguyên `--primary` (#1E40AF, khá đậm/tối khi phủ cả 1 dải ngang) nên cảm giác nặng hơn khi dùng cho nút bấm nhỏ. Quyết định: **đổi giá trị `--primary` trong token** (không tách token riêng cho bảng) từ `#1E40AF` sang `#2563EB` (Tailwind blue-600) — nhạt/tươi hơn nhưng cùng tông, vẫn giữ tỷ lệ tương phản chữ trắng ~5.17:1 (qua ngưỡng AA 4.5:1). Chọn sửa ngay tại token thay vì thêm biến riêng cho nền tiêu đề bảng vì đúng nguyên tắc "1 nơi định nghĩa duy nhất" — nút bấm, focus ring, và mọi nơi dùng `--primary` cùng nhạt theo, giữ đồng bộ nhận diện màu toàn app thay vì lệch giữa các thành phần.

## [2026-08-10] Thứ tự menu Chứng từ + thêm sắp xếp cho danh sách LĐCT/GĐĐ/LĐX

Bối cảnh: người dùng yêu cầu 2 việc cùng lúc — (1) đổi thứ tự mục menu nhóm "Chứng từ" từ trên xuống thành Lệnh điều công tác, Công lệnh/Giấy đi đường, Lệnh điều xe (trước đó LĐX đứng đầu do code trước, không theo thứ tự nghiệp vụ - LĐCT là chứng từ gốc sinh kèm 2 loại còn lại); (2) 3 trang danh sách LĐCT, GĐĐ, LĐX phải có nút sắp xếp theo tiêu chí ở tiêu đề cột, giống các danh mục Nhân viên/Phương tiện/Địa điểm đã làm trước đó (bị bỏ sót khi build 3 module chứng từ này).

Quyết định:
1. `apps/web/lib/menu.ts` — sắp lại mảng `mucs` trong nhóm "Chứng từ" đúng thứ tự yêu cầu, có ghi chú code giải thích lý do (LĐCT là chứng từ gốc).
2. Thêm `sapXepTheo`/`huongSapXep` vào 3 schema Zod (`danh-sach-lenh-dieu-cong-tac.schema.ts`, `danh-sach-giay-di-duong.schema.ts`, `danh-sach-lenh-dieu-xe.schema.ts`) theo đúng khuôn mẫu đã dùng cho Nhân viên/Phương tiện/Địa điểm — không truyền = giữ mặc định `[nam desc, soThuTu desc]` (chứng từ mới nhất lên đầu), có chọn cột thì `orderBy` theo đúng cột+hướng yêu cầu.
3. Cột cho phép sắp xếp mỗi trang (chọn theo cột hiển thị sẵn có, không thêm cột mới chỉ để phục vụ sort):
   - LĐCT: Số hiệu, Địa điểm công tác, Ngày đi/về (nút gắn ở cột "Ngày đi/về" nhưng sort theo `ngayDi`).
   - GĐĐ (`/giay-di-duong`): Số hiệu, Người được cấp (qua quan hệ `thanhVien.hoTen`), Nơi đến (qua quan hệ `lenhDieuCongTac.diaDiemCongTac`).
   - LĐX: Số hiệu, Lái xe/Biển số (sort theo `laiXeHoTen`), Ngày đi/về (sort theo `ngayDi`).
   Cột "Thành viên" (LĐCT, số đếm tính động) và "Nơi đi → Nơi đến" (LĐX, kết hợp 2 trường) không làm sort — số đếm cần `orderBy` theo quan hệ đếm (`_count`) phức tạp hơn so với lợi ích, kết hợp 2 trường không có 1 cột "đúng" duy nhất để sort.
4. Frontend: mỗi trang thêm 1 component `TieuDeSapXep` cục bộ (đúng pattern đã lặp lại 3 lần ở Nhân viên/Phương tiện/Địa điểm — chưa tách thành component dùng chung, xem ghi chú dưới), dùng màu `text-primary-foreground` (không phải `text-foreground`/`text-muted-foreground` như bản gốc) vì tiêu đề bảng giờ có nền xanh dương (`bg-primary`, xem mục "Đổi tiêu đề bảng sang nền xanh dương" phía trên).

Phương án khác đã cân nhắc: tách `TieuDeSapXep` thành 1 component dùng chung trong `components/ui/` thay vì lặp lại cục bộ ở 6 trang (Nhân viên, Phương tiện, Địa điểm, và giờ thêm LĐCT, GĐĐ, LĐX) — có cân nhắc nhưng mỗi trang có kiểu `CotSapXep...` riêng (union string khác nhau) nên cần generic phức tạp hơn; để nguyên lặp lại theo đúng pattern đã có sẵn trong dự án, ghi chú lại đây để cân nhắc refactor nếu lặp thêm lần nữa ở module khác.

## [2026-08-10] LĐX sinh kèm LĐCT: không cho hủy riêng lẻ

Bối cảnh: người dùng hỏi hiện tại có cho hủy riêng LĐX/công lệnh hay bắt buộc phải hủy qua LĐCT không. Rà code phát hiện bất đối xứng: công lệnh (GĐĐ) chỉ hủy được gián tiếp (loại thành viên khỏi đoàn trong lúc sửa LĐCT, hoặc hủy cả LĐCT) — trang `/giay-di-duong` không có nút Hủy riêng. Nhưng LĐX thì hủy được độc lập ngay tại `/lenh-dieu-xe` kể cả khi đang liên kết 1 LĐCT (`lenhDieuXe.service.ts` `huy()` trước đó không kiểm tra `lenhDieuCongTacId`), có nguy cơ lệch trạng thái: LĐCT vẫn coi đoàn có tài xế/LĐX đi kèm, trong khi LĐX đó đã bị hủy riêng ở nơi khác.

Đưa ra 3 phương án: (a) giữ nguyên, (b) thêm nút Hủy riêng cho công lệnh để đồng bộ với LĐX, (c) ngược lại - chặn hủy LĐX độc lập khi đang liên kết LĐCT. Người dùng chọn **(c)**.

Quyết định:
1. `apps/api/src/lenh-dieu-xe/lenh-dieu-xe.service.ts` `huy()` — thêm kiểm tra: nếu bản ghi có `lenhDieuCongTacId` (khác null, tức sinh kèm từ LĐCT) thì chặn, ném `BadRequestException` với thông báo rõ ràng hướng dẫn hủy qua LĐCT (loại tài xế khỏi đoàn) hoặc hủy cả LĐCT. Không đụng đến `sua()` — người dùng chỉ hỏi về hủy/xóa, sửa LĐX liên kết vẫn giữ nguyên hành vi cũ (đã tự đồng bộ qua `dongBoLenhDieuXeTheoThanhVienTaiXe()` khi sửa LĐCT).
2. `apps/web/hooks/use-danh-sach-lenh-dieu-xe.ts` — thêm `lenhDieuCongTacId: string | null` vào interface `LenhDieuXe` (dữ liệu này Prisma đã trả sẵn, chỉ chưa khai báo kiểu).
3. `apps/web/app/lenh-dieu-xe/page.tsx` — ẩn nút Hủy (icon `XCircle`) khi `ldx.lenhDieuCongTacId` có giá trị, thay bằng icon khóa (`Lock`) vô hiệu hóa kèm `title` giải thích lý do — để Văn thư không thắc mắc tại sao thao tác biến mất, thay vì lặng lẽ ẩn hoàn toàn.

Lý do: giữ đúng 1 nguồn sự thật cho quan hệ đoàn công tác ↔ tài xế — LĐCT là chứng từ gốc, LĐX/GĐĐ sinh kèm phải đồng bộ theo, không cho phép chỉnh trạng thái các chứng từ con tách rời khỏi đoàn (nhất quán với cách công lệnh đã hoạt động từ trước, và với nguyên tắc "LĐCT sinh kèm GĐĐ và LĐX" đã chốt trước đó).

LĐX tạo độc lập (không qua LĐCT, `lenhDieuCongTacId` = null) không bị ảnh hưởng — vẫn hủy bình thường như cũ.

## [2026-08-10] Checkbox chọn dòng + chọn kích thước trang cho 3 danh sách chứng từ

Bối cảnh: người dùng nhận xét 3 trang danh sách LĐCT, GĐĐ, LĐX chưa có checkbox chọn dòng và ô chọn kích thước trang (20/50/100 dòng) như `/nhan-vien`. Hỏi lại checkbox dùng để làm gì — vì Nhân viên dùng checkbox để "Xóa nhiều", còn 3 loại chứng từ này theo CLAUDE.md quy tắc #6 không cho xóa cứng, chỉ Hủy. Người dùng chọn: **chỉ thêm checkbox cho đồng bộ giao diện, chưa gắn hành động hàng loạt nào**.

Quyết định:
1. Cả 3 trang (`lenh-dieu-cong-tac/page.tsx`, `giay-di-duong/page.tsx`, `lenh-dieu-xe/page.tsx`) — thêm state `kichThuoc` có thể đổi (trước đó cố định `useState(20)` không có setter) + `<Select>` "20/50/100 dòng" giống hệt `/nhan-vien`.
2. Thêm cột checkbox đầu bảng: header có checkbox "chọn tất cả", mỗi dòng có checkbox riêng, state `dongChon: Set<string>`, tự xóa lựa chọn khi dữ liệu trang đổi (`useEffect` theo `data`) — đúng pattern đã dùng ở Nhân viên/Phương tiện/Địa điểm.
3. **Cố tình KHÔNG thêm** thanh hành động "Đã chọn N ... / Hủy đã chọn" — checkbox hiện chỉ lưu trạng thái chọn trong state cục bộ, không gọi API, không có nút hành động nào xuất hiện khi có dòng được chọn. Đây là quyết định rõ ràng của người dùng, không phải thiếu sót.

Lý do: giữ đồng bộ hình thức bảng biểu giữa danh mục và chứng từ theo đúng yêu cầu, nhưng không tự ý suy đoán hành động hàng loạt (huỷ nhiều/in nhiều) khi người dùng chưa xác nhận cụ thể — tránh phải làm lại nếu đoán sai (vd nếu sau này chọn "in nhiều" thay vì "hủy nhiều" thì kiến trúc cần khác).

Việc chưa chốt — hỏi lại khi cần: nếu sau này muốn gắn hành động cho checkbox (hủy nhiều/in nhiều), cần hỏi lại cụ thể hành động là gì trước khi build, vì đã từ chối 2 phương án đó ở lần hỏi này.

## [2026-08-10] Tô nền xen kẽ theo đoàn LĐCT ở danh sách Công lệnh/Giấy đi đường

Bối cảnh: người dùng nhận xét trang `/giay-di-duong` liệt kê từng công lệnh (1 dòng/người) rời rạc, khó nhận ra ngay các dòng nào cùng thuộc 1 lệnh điều công tác (1 đoàn có thể nhiều thành viên = nhiều dòng liên tiếp).

Quyết định: tô nền xen kẽ theo **đoàn** thay vì xen kẽ từng dòng (zebra thường) — các dòng liên tiếp có cùng `lenhDieuCongTac.id` tô cùng 1 màu (`bg-muted/40`), đổi màu khi gặp đoàn khác. Tính bằng 1 mảng `nhomMauDong` duyệt tuần tự `data.duLieu`, so `lenhDieuCongTac.id` với dòng trước, đảo cờ `nhomLe` mỗi khi đổi đoàn.

Giới hạn đã lường trước: cách này chỉ "đẹp" (các dòng cùng đoàn dính liền 1 khối màu) khi các dòng cùng đoàn NẰM LIỀN NHAU trong danh sách hiện tại. Đúng với sắp xếp mặc định (theo số hiệu — các công lệnh của cùng 1 LĐCT được cấp số liên tiếp nhau lúc tạo). Khi người dùng đổi sang sắp xếp theo "Người được cấp" hoặc "Nơi đến", các dòng cùng đoàn có thể bị xen kẽ dòng khác chen vào giữa — lúc đó màu chỉ còn ý nghĩa "đổi màu mỗi khi đổi đoàn ở dòng liền kề", không tô được trọn khối cho đoàn bị tách rời. Chấp nhận được vì đây là tính năng phụ trợ nhận diện nhanh, không phải logic nghiệp vụ then chốt.

Không đổi cách tô cho LĐCT hay LĐX — 2 trang đó mỗi dòng là 1 chứng từ độc lập, không có khái niệm "nhiều dòng cùng 1 nhóm cha" như GĐĐ.

## [2026-08-10] Sửa mẫu in mặt sau GĐĐ (Phần kê thanh toán): tiêu đề in hoa + logo tràn xuống dính letterhead

Bối cảnh: người dùng gửi ảnh chụp bản in thử mặt sau GĐĐ, chỉ ra: (1) tiêu đề các mục I-IV ("Tiền tàu xe", "Phụ cấp lưu trú"...) phải viết hoa như mẫu giấy thật, hiện đang chỉ viết hoa chữ cái đầu; (2) khối letterhead cuối trang (UBND tỉnh/tên công ty/quốc hiệu) bị dính/chồng lên hình mờ logo phía trên; (3) phần kê thanh toán cần chừa nhiều dòng trống hơn để người đi công tác viết tay kê khai, chưa đúng số dòng như mẫu giấy thật cung cấp trước đây.

Quyết định (đã sửa ngay):
1. `noiDungMatSauGdd()` (`lenh-dieu-cong-tac-mau-in.ts`) — thêm `text-transform:uppercase` cho nhãn từng mục (I/II/III/IV), tự động in hoa bất kể chuỗi gốc viết thế nào.
2. `.hinh-mo` (`common/mau-in/mau-in-dung-chung.ts`) — trước chỉ khống chế `width:100mm`, không khống chế `height` → nếu ảnh logo nguồn có tỷ lệ dọc hơn vuông thì chiều cao co giãn tự do, có thể tràn dài xuống chạm khối letterhead cuối trang mặt sau (trang duy nhất đặt letterhead ở CUỐI thay vì ĐẦU). Thêm `height:100mm; object-fit:contain` để logo luôn nằm gọn trong khung 100×100mm, không thể tràn quá kích thước dự kiến dù ảnh nguồn tỷ lệ thế nào. Áp dụng cho MỌI mẫu in dùng `trangMoHinh()` (LĐX/LĐCT/GĐĐ) vì đây là CSS dùng chung.

Chưa sửa (cần hỏi lại để làm đúng, không đoán): số dòng trống chừa cho mỗi mục I-IV trong phần kê thanh toán — hiện I=1 dòng, II=2 dòng, III=1 dòng, IV=1 dòng, người dùng nói "chưa đúng theo mẫu" nhưng không nêu số dòng cụ thể muốn mỗi mục. Cũng chưa rõ phần "chưa đúng theo mẫu" ở trang 2 còn chỗ nào khác ngoài 2 điểm đã sửa. Đã hỏi lại người dùng.

**Sửa lại theo phản hồi tiếp theo (cùng ngày) — hiểu sai ý ban đầu:**

Người dùng làm rõ: KHÔNG muốn viết hoa 4 tiêu đề mục I-IV (đã hiểu sai, mục này giữ nguyên như trước — bỏ `text-transform:uppercase` vừa thêm). Chỗ thật sự cần viết hoa là **tiêu đề chính của mặt trước** "Công lệnh (kiêm) giấy đi đường" → "CÔNG LỆNH (KIÊM) GIẤY ĐI ĐƯỜNG" (gửi kèm ảnh chụp đúng dòng cần sửa). Đã sửa: thêm `text-transform:uppercase` cho `.tieu-de-chinh` của riêng dòng này trong `noiDungMatTruocGdd()` (không đụng class dùng chung `.tieu-de-chinh` — các mẫu khác dùng class này không bị ảnh hưởng).

Về việc "dính dòng UBND và cộng hòa" ở cuối trang 2: người dùng chốt luôn hướng xử lý — **bỏ hẳn khối letterhead cuối trang mặt sau** thay vì cố định lại vị trí/kích thước logo để né tránh. Đã xóa toàn bộ `<div style="position:absolute; ...">${khoiLetterhead(...)}</div>` khỏi `noiDungMatSauGdd()`. Số hiệu/ngày ký đã có sẵn ở letterhead mặt trước (cùng 1 tờ giấy in 2 mặt), không cần lặp lại ở mặt sau.

Việc "kẻ dòng như file mẫu" vẫn CHƯA sửa được — không tìm thấy file mẫu gốc (.doc/.docx) nào được lưu lại trong thư mục dự án, chỉ được người dùng gửi trực tiếp trong 1 phiên chat trước đó (không còn truy cập được). Đã xin người dùng gửi lại ảnh/file mẫu để đối chiếu chính xác số dòng kẻ từng mục thay vì đoán.

**Hoàn tất theo ảnh mẫu mặt sau người dùng gửi lại (cùng ngày):** ảnh cho thấy rõ tiêu đề "PHẦN KÊ THANH TOÁN" viết hoa (không phải chỉ viết hoa chữ đầu như code cũ), và số dòng chấm chấm thực tế mỗi mục: I. Tiền tàu xe = 2 dòng, II. Phụ cấp lưu trú = 3 dòng, III. Chi khác = 2 dòng, IV. Tổng cộng = 2 dòng (code cũ chỉ có 1/2/1/1 — thiếu). Đã sửa `noiDungMatSauGdd()`: thêm `text-transform:uppercase` cho tiêu đề (chỉ riêng dòng này, không đụng class `.tieu-de-chinh` dùng chung); cập nhật đúng số dòng theo ảnh; thêm `margin-top:5mm` cho nhãn mỗi mục để tạo khoảng cách tách khối rõ ràng giữa các mục, giống bố cục ảnh mẫu (trước đó các mục nằm sát nhau hơn). Đã ước lượng lại tổng chiều cao nội dung (~171mm) vẫn nằm trong vùng an toàn của khổ A5 210mm (trừ lề trên/dưới còn ~192mm) — không cần đổi `height:210mm` cố định của `.trang`.

**Sửa lại lần 2 (cùng ngày):** người dùng phản hồi ngắn gọn "Tổng cộng = 3 dòng" — mục IV đổi từ 2 dòng lên 3 dòng (đếm lại nhầm ở lần trước). Tổng số dòng trống toàn trang giờ 2+3+2+3=10, vẫn nằm trong ngân sách chiều cao an toàn của khổ A5 đã ước lượng.

## [2026-08-10] Mặt trước GĐĐ: canh giữa tiêu đề bảng theo chiều cao + giảm tiếp logo mờ

Bối cảnh: người dùng gửi ảnh chụp bảng "Nơi đi và đến / Ngày / Chứng nhận của cơ quan" ở mặt trước GĐĐ — tiêu đề cột "Chứng nhận của cơ quan" xuống 2 dòng (chữ dài hơn 2 cột kia) khiến hàng tiêu đề cao hơn, nhưng "Nơi đi và đến"/"Ngày" (1 dòng) lại dính sát mép trên thay vì nằm giữa theo chiều cao hàng. Đồng thời logo mờ giữa trang vẫn còn rõ, đè lên nội dung bảng — yêu cầu giảm tiếp ở TẤT CẢ mẫu in (không chỉ GĐĐ).

Quyết định:
1. `table.bang-in th` (`lenh-dieu-cong-tac-mau-in.ts`, dùng chung cho cả bảng thành viên LĐCT và bảng "Nơi đi và đến" của GĐĐ) — thêm `vertical-align: middle` (trước đó kế thừa `vertical-align: top` từ rule `th, td` chung, gây lệch khi 1 ô xuống dòng còn ô khác không).
2. `.hinh-mo` (`common/mau-in/mau-in-dung-chung.ts`, CSS dùng chung mọi mẫu in) — giảm lần 2: kích thước 100mm→80mm, độ mờ opacity 0.13→0.08. Áp dụng đồng loạt cho LĐX/LĐCT/GĐĐ vì cùng 1 class dùng chung, đúng yêu cầu "giảm ở tất cả các mẫu in".

Lý do: sửa tại CSS dùng chung (`table.bang-in th`, `.hinh-mo`) thay vì riêng từng mẫu — đúng nguyên tắc "1 nơi định nghĩa duy nhất" đã áp dụng nhất quán cho các mẫu in, tự động lan sang mọi chứng từ dùng chung class mà không phải sửa lặp lại từng file.

## [2026-08-10] Dòng kẻ chấm ở phần kê thanh toán: đổi từ `border-bottom: dotted` sang background-gradient

Bối cảnh: người dùng gửi 2 ảnh so sánh — bản xem trên màn hình và bản PDF in ra — cùng 1 CSS nhưng các đường kẻ chấm dưới mỗi mục I-IV hiện RÕ KHÁC NHAU (số lượng/kích thước chấm không giống nhau). Hỏi lý do.

Giải thích (đã trả lời người dùng): `border-bottom: 1px dotted #999` không phải là mẫu chấm có kích thước cố định — trình duyệt/bộ máy render PDF tự tính số lượng và khoảng cách giữa các chấm dựa trên độ dài đường viền và cách làm tròn số của riêng nó. Bản xem trực tiếp trên trình duyệt và bản PDF do Chromium headless render qua `page.pdf()` (dùng cho `PdfService`) là 2 luồng render khác nhau trong cùng 1 engine, có thể ra kết quả rasterize khác nhau cho `border-style: dotted/dashed` — đây là hạn chế cố hữu của thuộc tính CSS này, không phải lỗi cấu hình riêng của ứng dụng.

Quyết định: đổi cách vẽ dòng kẻ (`noiDungMatSauGdd()`) từ `border-bottom: dotted` sang `background-image: linear-gradient(...)` lặp lại (`background-repeat: repeat-x`, kích thước hoa tiết cố định `3mm 1px`) — vẽ chấm bằng hoạ tiết nền có kích thước MM cố định thay vì để trình duyệt tự tính, đảm bảo hiển thị giống hệt nhau giữa xem trước và bản in. Nhân tiện đổi màu từ `#999` (xám đậm) sang `rgba(0,0,0,0.22)` (mờ hơn) theo yêu cầu "cho các đường kẻ mờ thêm nữa".

Phương án khác đã cân nhắc: giữ `border-bottom: dotted` và chỉ đổi màu nhạt hơn — không giải quyết được gốc vấn đề hiển thị không nhất quán giữa các bộ máy render, chỉ né được phần nào nhờ chấm mờ khó nhận ra khác biệt hơn. Chọn sửa tận gốc bằng background-gradient vì đáng tin cậy hơn cho lâu dài, đặc biệt khi các mẫu in khác sau này (Trạm/Tuyến) có thể cũng cần đường kẻ chấm tương tự.

## [2026-08-10] Nền tiêu đề bảng mặt trước GĐĐ che mất logo mờ

Bối cảnh: người dùng gửi ảnh chụp bản in mặt trước GĐĐ — hàng tiêu đề bảng "Nơi đi và đến / Ngày / Chứng nhận của cơ quan" che kín hoàn toàn logo mờ (`.hinh-mo`) ở đúng vùng đó, dù logo đã giảm độ mờ 2 lần trước đó (xem mục trên).

Nguyên nhân: `table.bang-in th` dùng nền ĐẶC `background: #f3f4f6` (xám nhạt nhưng không trong suốt) — bất kể logo mờ tới mức nào, 1 lớp nền đặc phủ lên trên vẫn che hoàn toàn nó ở vùng hàng tiêu đề.

Quyết định: đổi `background: #f3f4f6` (đặc) → `background: rgba(243, 244, 246, 0.55)` (bán trong suốt cùng tông màu) — hàng tiêu đề vẫn phân biệt được với phần thân bảng, nhưng logo mờ phía sau xuyên qua được. Sửa tại CSS dùng chung (`cssKhung()` trong `lenh-dieu-cong-tac-mau-in.ts`, áp dụng cho mọi bảng dùng class `bang-in` — cả bảng thành viên LĐCT lẫn bảng "Nơi đi và đến" của GĐĐ).

## [2026-08-10] Nút "In đã chọn" cho checkbox ở danh sách Công lệnh/Giấy đi đường

Bối cảnh: mục "[2026-08-10] Checkbox chọn dòng..." phía trên ghi nhận checkbox ở 3 danh sách chứng từ CỐ TÌNH chưa gắn hành động, và có ghi chú "nếu sau này muốn gắn hành động cho checkbox (hủy nhiều/in nhiều), cần hỏi lại cụ thể hành động là gì". Người dùng quay lại xác nhận cụ thể: ở riêng trang `/giay-di-duong`, checkbox dùng để **chọn nhiều công lệnh để in cùng lúc** (không phải hủy nhiều — hợp lý vì CLAUDE.md quy tắc #6 vốn đã cấm xóa/hủy hàng loạt tùy tiện, còn in thì không có rủi ro dữ liệu).

Quyết định — chỉ áp dụng cho `/giay-di-duong` (không đụng LĐCT/LĐX, checkbox 2 trang đó vẫn thuần túy đồng bộ giao diện như quyết định trước):
1. Backend — thêm `layNhieuGiayDiDuongDeIn(ids: string[])` (`lenh-dieu-cong-tac.service.ts`, đặt ngay sau `layMotGiayDiDuongDeIn`): lấy nhiều GDD theo mảng id, GIỮ ĐÚNG THỨ TỰ người dùng đã chọn (không theo thứ tự trả về từ DB — map theo `ids` rồi lọc), bỏ qua lặng lẽ id không tìm thấy thay vì báo lỗi cả loạt.
2. Endpoint mới `GET /giay-di-duong/in-nhieu?ids=id1,id2,...` (`giay-di-duong.controller.ts`) — dùng GET + query string (không phải POST body) vì nút bấm mở tab mới bằng `window.open()`, chỉ điều hướng GET được. Trả PDF gộp qua `taoHtmlGiayDiDuongHangLoat()` (hàm có sẵn, mỗi GDD vẫn đủ 2 mặt trước/sau, chỉ khác nguồn dữ liệu đầu vào là nhiều đoàn khác nhau thay vì cùng 1 LĐCT). Đặt route `in-nhieu` TRƯỚC `:id/pdf` trong file để tránh xung đột thứ tự route (dù hiện tại không thực sự trùng, giữ thói quen an toàn).
3. Schema `inNhieuGiayDiDuongSchema` (`packages/validation`) — nhận `ids` dạng chuỗi phân cách dấu phẩy qua query, `transform` thành mảng, validate tối thiểu 1 phần tử.
4. Frontend (`giay-di-duong/page.tsx`) — thanh hành động xuất hiện khi `dongChon.size > 0` (đúng pattern "Đã chọn N ... " đã dùng ở Địa điểm/Phương tiện/Nhân viên), nút "In đã chọn" gọi `window.open` tới endpoint mới với `ids` nối bằng dấu phẩy. Gate theo quyền `CHUNG_TU_IN` (không phải quyền xóa, vì đây là hành động in).

Việc chưa chốt: chưa giới hạn số lượng tối đa chọn 1 lần in (nếu người dùng chọn hàng trăm dòng, PDF sẽ rất lớn và có thể chậm) — chưa phải vấn đề thực tế ở quy mô dữ liệu hiện tại, để sau nếu phát sinh.

## [2026-08-10] Nút in riêng LĐCT ở trang danh sách

Bối cảnh: trang danh sách `/lenh-dieu-cong-tac` trước đó không có nút in nào — muốn in phải mở trang chi tiết rồi chọn 1 trong 2 nút sẵn có ("In lệnh điều công tác + lệnh điều xe" hoặc "In toàn bộ công lệnh/giấy đi đường"), cả 2 đều KÈM thêm nội dung khác ngoài bản thân LĐCT. Người dùng yêu cầu thêm nút in ngay tại danh sách, in RIÊNG lệnh điều công tác (chỉ 1 trang LĐCT, không kèm LĐX dù đoàn có tài xế hay không).

Quyết định:
1. Backend — endpoint mới `GET /lenh-dieu-cong-tac/:id/pdf` (`lenh-dieu-cong-tac.controller.ts`, đặt ngay trước `:id/pdf-lenh` để nhóm các route in gần nhau) — dùng lại `layDuLieuInLenh()` sẵn có (đã trả về `ldxHoatDong` cho endpoint `:id/pdf-lenh`) nhưng **luôn truyền `null`** vào tham số LĐX của `taoHtmlLenhDieuCongTacVaLenhDieuXe()`, bất kể đoàn thực tế có tài xế/LĐX hay không — khác hẳn `:id/pdf-lenh` (luôn kèm LĐX nếu có). Không cần hàm/truy vấn dữ liệu mới.
2. Frontend (`lenh-dieu-cong-tac/page.tsx`) — thêm icon `Printer` (ghost, có `title` giải thích) vào cột Thao tác của mỗi dòng, đặt trước nút "Xem chi tiết" — đúng vị trí/kiểu đã dùng ở danh sách GĐĐ/LĐX. Gate theo quyền `CHUNG_TU_IN` (biến `coQuyenIn` mới thêm, trang này trước đó chưa có biến này vì chưa có hành động in nào).

Lý do đặt route riêng `:id/pdf` thay vì thêm tham số vào `:id/pdf-lenh`: giữ mỗi endpoint in ứng với đúng 1 loại file cố định (không cần query param bật/tắt LĐX), nhất quán với cách đặt tên `:id/pdf` đã dùng ở `/giay-di-duong/:id/pdf` và `/lenh-dieu-xe/:id/pdf` (in 1 chứng từ độc lập, không kèm chứng từ khác).

## [2026-08-10] Trưởng đoàn + CCCD trong mẫu in LĐCT

Bối cảnh: người dùng lập lệnh điều công tác đi Trạm TP.HCM, phát hiện mẫu in LĐCT hiện tại (bảng STT/Họ và tên/Chức vụ/Ngày đi-về) thiếu thông tin CCCD của từng người và không đánh dấu được ai là trưởng đoàn — 2 thứ mẫu in thật cần có. Đồng thời muốn cột "Thành viên" ở danh sách hiện tên (không chỉ số lượng), ưu tiên trưởng đoàn lên đầu.

Điểm mấu chốt cần hỏi lại trước khi làm: yêu cầu ban đầu gắn trưởng đoàn/CCCD với riêng "Trạm TP.HCM" khác "các tuyến khác" — nhưng hệ thống CHƯA có khái niệm phân loại "Trạm" vs "tuyến" chính thức (`diaDiemCongTac` vẫn là ô gõ tự do, module "Phân công lịch công tác" Trạm/Tuyến ghi trong CLAUDE.md là **chưa build**). Đã hỏi lại 2 câu:
1. Cách xác định "Trạm TP.HCM" vs "tuyến khác" để mẫu in biết đường đổi — người dùng chọn **"Tự chọn mỗi lần lập"**: thêm 1 lựa chọn "Loại mẫu in" ngay trong form Lập/Sửa, KHÔNG suy ra từ địa điểm gõ tự do, không đụng đến module Trạm/Tuyến chưa xây.
2. Số trưởng đoàn tối đa mỗi đoàn — người dùng chọn **"Tối đa 1 người"**.

Quyết định — phạm vi cố tình thu hẹp, KHÔNG phải bước đầu của module Trạm/Tuyến đầy đủ (module đó phức tạp hơn nhiều, vẫn chờ hỏi lại riêng khi làm — xem mục cuối CLAUDE.md):

1. Prisma (`schema.prisma`):
   - `LenhDieuCongTac.mauInTram: Boolean @default(false)` — cờ tự chọn lúc lập, quyết định mẫu in có thêm cột CCCD + nhãn "(Trưởng đoàn)" hay không.
   - `ThanhVienLenhDieuCongTac.laTruongDoan: Boolean @default(false)`.
   - Migration viết tay `20260810081301_truongdoan/migration.sql` (sandbox không có Postgres để chạy `prisma migrate dev` — cần chạy `pnpm --filter api exec prisma migrate deploy` hoặc `prisma migrate dev` trên máy thật để áp dụng + sinh lại Prisma Client).
2. Zod (`packages/validation`): `thanhVienLenhDieuCongTacSchema` thêm `laTruongDoan`; `taoLenhDieuCongTacSchema`/`suaLenhDieuCongTacSchema` thêm `mauInTram` + `.refine()` chặn chọn quá 1 trưởng đoàn trong mảng `thanhVien` (chặn cả khi gọi thẳng API, không chỉ dựa vào UI).
3. Backend (`lenh-dieu-cong-tac.service.ts`): `tao()`/`sua()` lưu 2 trường mới ở mọi nhánh tạo/cập nhật thành viên; `danhSach()` thêm `orderBy: { thuTu: "asc" }` cho `include.thanhVien` (trước đây không sắp xếp, giờ cột "Thành viên" ở danh sách cần đúng thứ tự để hiển thị tên).
4. Mẫu in (`lenh-dieu-cong-tac-mau-in.ts`): `noiDungTrangLenhDieuCongTac()` — khi `lenh.mauInTram = true`, thêm cột "CCCD" vào bảng thành viên + nhãn `(Trưởng đoàn)` sau tên người được đánh dấu; khi `false`, giữ nguyên mẫu cũ (không đổi gì với các LĐCT hiện có, vì cờ mặc định `false`).
5. Frontend:
   - Dialog Lập/Sửa: thêm `<Select>` "Loại mẫu in" (Tuyến thường / Trạm); khi chọn Trạm, mỗi dòng thành viên hiện checkbox "Trưởng đoàn" — chọn 1 người tự động bỏ chọn người khác (hành vi kiểu radio, thực hiện bằng vòng lặp `setValue` qua toàn bộ `fields` thay vì dùng `<input type="radio">` vì đang là mảng `useFieldArray` lồng trong form).
   - Danh sách `/lenh-dieu-cong-tac`: cột "Thành viên" đổi từ chỉ số lượng sang số lượng + chuỗi tên cách nhau dấu phẩy, trưởng đoàn xuất hiện đầu (hàm `tenThanhVien()`, dùng `Array.sort` ổn định của JS để không xáo trộn thứ tự những người còn lại).
   - Trang chi tiết: thêm cột CCCD + nhãn trưởng đoàn trong bảng thành viên khi `mauInTram = true`, để xem lại trước khi in.

Việc chưa chốt (không tự đoán, để khi làm module Trạm/Tuyến đầy đủ mới hỏi lại): liệu "Loại mẫu in" này có nên tự động suy ra từ Danh mục Địa điểm sau khi module Trạm/Tuyến được xây, thay vì tiếp tục chọn tay mỗi lần lập.

**Bổ sung cùng ngày:** mẫu in Trạm luôn dùng khổ **A4** (không theo ngưỡng đông người/nội dung dài như trước) — vì bảng thành viên có thêm cột CCCD nên rộng hơn, khổ A5 dễ bị chật. Sửa `chonKhoGiayLenhDieuCongTac()` (`lenh-dieu-cong-tac-mau-in.ts`) thêm tham số `mauInTram`: trả về `"A4"` ngay khi `true`, bỏ qua ngưỡng số người/độ dài văn bản; giữ nguyên logic ngưỡng cũ khi `false`. Áp dụng cho cả 2 endpoint dùng chung `layDuLieuInLenh()`: in riêng LĐCT (`:id/pdf`) và in kèm LĐX (`:id/pdf-lenh`).

**Dựng lại đúng theo file mẫu thật (cùng ngày, bổ sung lần 2):** người dùng gửi file `LENH DIEU CONG TAC TP.HCM (Quốc).docx` (2 bản mẫu thật đã điền — bản mới nhất 2026 dùng làm chuẩn, giống cách chọn mẫu mới nhất đã áp dụng cho GĐĐ trước đây). Đọc bằng `pandoc` + render `soffice`/`pdftoppm` ra ảnh để xem đúng bố cục (không đoán từ text thô, vì bảng/tiêu đề có chi tiết trình bày như gạch chân). Phát hiện: bản in Trạm thật khác mẫu Tuyến thường NHIỀU hơn dự đoán ban đầu (lúc đó chỉ đoán "thêm cột CCCD" vào bảng cũ) — thực tế đây gần như một mẫu HOÀN TOÀN KHÁC:

- Tiêu đề chính **VIẾT HOA** "LỆNH ĐIỀU CÔNG TÁC", thêm dòng tiêu đề phụ in đậm + **gạch chân** "(Trực Trạm phát hành vé số tại TP.HCM)" ngay dưới (mẫu Tuyến thường không có dòng phụ này).
- Bảng thành viên có **6 cột khác hẳn**: TT / HỌ VÀ TÊN / NĂM SINH / SỐ CMND/CCCD / NHIỆM VỤ / GHI CHÚ — **không còn cột "Chức vụ"** (thay bằng "Nhiệm vụ": ghi "Trưởng đoàn" in đậm hoặc "Thành viên"), cột "Ngày đi – về" đổi thành "Ghi chú" ghi câu văn đầy đủ "Từ ngày dd/mm/yyyy đến ngày dd/mm/yyyy" (khác định dạng gạch ngang "dd/mm/yyyy – dd/mm/yyyy" của mẫu Tuyến thường) và chỉ điền khi người đó có ngày riêng khác đoàn.
- Đoạn văn mở đầu khác hẳn: "Giám đốc ... quyết định điều động và phân công các đ/c có tên sau thực hiện nhiệm vụ công tác tại Trạm phát hành vé số An Giang ở Thành phố Hồ Chí Minh, cụ thể như sau:" (mẫu Tuyến thường: "... phân công nhiệm vụ đi công tác tại {địa điểm}." + câu "Ngày X gồm có các Đ/c sau đây:").
- Có thêm **câu kết sau bảng** mà mẫu Tuyến thường không có: "Từng thành viên tham gia công tác có trách nhiệm thực hiện đúng chức năng và nhiệm vụ của mình theo nội dung quy định tại Quy chế Đoàn công tác Trạm phát hành vé số kiến thiết An Giang./."
- Các đoạn văn đều thụt đầu dòng (text-indent).

Quyết định:
1. Tách `noiDungTrangLenhDieuCongTac()` thành hàm điều phối gọi 1 trong 2 hàm riêng biệt: `noiDungTrangLenhDieuCongTacTuyenThuong()` (giữ nguyên y hệt bản trước khi có `mauInTram`, bỏ hẳn phần thêm cột CCCD đã làm sai ở lượt trước) và `noiDungTrangLenhDieuCongTacTram()` (dựng mới hoàn toàn theo ảnh render từ file thật) — thay vì tiếp tục chèn `if (coCotCccd)` rải rác trong 1 hàm chung, vì 2 mẫu khác nhau quá nhiều để dùng chung cấu trúc.
2. Prisma: thêm `ThanhVienLenhDieuCongTac.ngaySinh: DateTime?` (nullable — bản ghi tạo trước khi có trường này sẽ là null, không ảnh hưởng vì mẫu Tuyến thường không dùng trường này) — chụp lại lúc thêm vào đoàn (giống hoTen/chucVu/cccd), migration `20260810083853_thanhvien_ngaysinh`. Cột "NĂM SINH" trên mẫu thật thực chất hiển thị NGÀY SINH đầy đủ (dd/mm/yyyy) chứ không chỉ năm — giữ nguyên tên cột như file thật dù có phần không khớp nghĩa đen, ưu tiên đúng mẫu giấy chính thức.
3. Backend (`lenh-dieu-cong-tac.service.ts`): 2 nhánh tạo thành viên (trong `tao()` và `sua()`) thêm `ngaySinh: nv.ngaySinh`. Nhánh cập nhật thành viên đã có (sửa ngày riêng) KHÔNG chụp lại `ngaySinh` — giữ nhất quán với cách `hoTen`/`chucVu`/`cccd` cũng không bị ghi đè khi sửa (snapshot chỉ chốt lúc thêm vào đoàn).
4. Cột "Số CMND/CCCD" và "Năm sinh" dùng `white-space:nowrap` — ảnh mẫu thật bị xuống dòng giữa chuỗi số CCCD do cột quá hẹp trong Word gốc (lỗi trình bày không cố ý của file nguồn), chủ động KHÔNG tái tạo lỗi này, cho cột đủ rộng + nowrap để số luôn liền 1 dòng.
5. Đoạn "Trạm phát hành vé số An Giang ở Thành phố Hồ Chí Minh" viết cứng (hardcode) trong `noiDungTrangLenhDieuCongTacTram()`, không lấy từ `diaDiemCongTac` gõ tự do — vì đây là kịch bản DUY NHẤT có mẫu giấy thật (Trạm TP.HCM), chưa tổng quát hóa cho các Trạm khác (module Trạm/Tuyến đầy đủ vẫn chưa xây, xem CLAUDE.md).

## [2026-08-10] Sửa mẫu in Trạm sau khi xem thử: canh lề NĐ30, bỏ "CMND", bù ngày sinh thiếu, mở lại trường Căn cứ

Bối cảnh: người dùng xem thử bản in Trạm vừa dựng theo file mẫu thật, phản hồi 3 điểm cần sửa.

1. **Canh lề theo Nghị định 30/2020/NĐ-CP** — tra cứu đúng thông số của nghị định (top/bottom 20-25mm, trái 30-35mm, phải 15-20mm đối với khổ A4) trước khi sửa, không đoán số. Chọn mốc phổ biến giữa khoảng: 20mm trên, 20mm dưới, 30mm trái, 20mm phải. Áp dụng bằng `style="padding: 20mm 20mm 20mm 30mm;"` **inline ngay trên `<div class="trang">` của riêng hàm `noiDungTrangLenhDieuCongTacTram()`** — KHÔNG sửa `.trang` dùng chung trong `cssKhung()`, để không ảnh hưởng padding (10mm/8mm) của LĐX, GĐĐ, và LĐCT mẫu Tuyến thường vốn đã ổn định từ trước.
2. **Bỏ chữ "CMND" khỏi tiêu đề cột** — đổi `SỐ CMND/CCCD` → `SỐ CCCD`, dù file mẫu thật ghi "CMND/CCCD" — đây là yêu cầu tường minh của người dùng, ưu tiên hơn văn bản gốc trong file mẫu (công ty không còn muốn nhắc CMND, giấy tờ cũ đã thay bằng CCCD).
3. **"Hiển thị thiếu trường ngày sinh"** — nguyên nhân: cột `ThanhVienLenhDieuCongTac.ngaySinh` mới thêm (migration cùng ngày) là `nullable`, các bản ghi tạo TRƯỚC migration này chắc chắn có giá trị `null` (không có cách nào backfill hồi tố vì dữ liệu ngày sinh lúc đó chưa được chụp lại). Thay vì bắt người dùng luôn phải sửa lại từng lệnh cũ, sửa `layDuLieuInLenh()` (`lenh-dieu-cong-tac.service.ts`) tự động **bù động lúc in**: với thành viên có `ngaySinh = null` nhưng còn `nhanVienId`, tra cứu lại `ngaySinh` hiện tại từ Danh mục Nhân viên (KHÔNG ghi ngược lại CSDL, chỉ bù cho lần in đó). Thành viên thêm vào đoàn sau migration luôn có sẵn `ngaySinh` nên vòng bù này thành no-op.
4. **"Thiếu các dòng căn cứ như thiết kế mẫu"** — nguyên nhân gốc: trường `LenhDieuCongTac.canCu` bị **ẩn khỏi form Lập/Sửa từ một quyết định cũ** ("gọn giao diện", ghi trong comment schema) — nên trường này luôn rỗng, không phải lỗi mẫu in. Mở lại: thêm `<Textarea>` "Căn cứ (không bắt buộc)" vào cả `tao-lenh-dieu-cong-tac-dialog.tsx` và `sua-lenh-dieu-cong-tac-dialog.tsx`, đặt ngay dưới "Mục đích". Người dùng gõ mỗi dòng 1 căn cứ (không cần gõ sẵn chữ "Căn cứ"). Thêm hàm dùng chung `canCuHtml(canCu)` trong `lenh-dieu-cong-tac-mau-in.ts`: tách theo dấu xuống dòng, mỗi dòng in thành 1 đoạn riêng `<p>Căn cứ {dòng};</p>` (có thụt đầu dòng) — áp dụng cho CẢ 2 mẫu (Tuyến thường lẫn Trạm) vì trường này trước đó chưa từng có dữ liệu thật ở mẫu nào để so sánh "đúng/sai", nên chọn cách trình bày chuẩn theo đúng file mẫu thật (nhiều dòng "Căn cứ ...;" riêng biệt) làm chung cho cả hai.

## [2026-08-10] Mẫu in Trạm TP.HCM: cỡ chữ 14pt, đậm dòng trưởng đoàn, gom nhóm + merge Ghi chú, canh đều 2 biên, Căn cứ chuyển sang cấu hình đơn vị

Bối cảnh: người dùng xem thử tiếp bản in Trạm sau lượt sửa canh lề/CMND/ngày sinh/căn cứ trước đó, phản hồi thêm 5 điểm — trong đó điểm cuối **đảo ngược một phần quyết định vừa chốt cùng ngày** (mục "mở lại trường Căn cứ" ở mục nhật ký ngay phía trên).

Quyết định:

1. **Đảo ngược: Căn cứ của mẫu Trạm KHÔNG còn nhập theo từng lệnh** — bỏ hẳn `<Textarea>` "Căn cứ" vừa thêm ở `tao-lenh-dieu-cong-tac-dialog.tsx`/`sua-lenh-dieu-cong-tac-dialog.tsx` (cả JSX lẫn `canCu` trong `reset()`/`defaultValues`). Lý do đảo ngược: các "Căn cứ ...;" của mẫu Trạm là các quyết định/quy chế áp dụng CHUNG cho cả giai đoạn trực Trạm, không đổi theo từng đợt cử người đi — bắt nhập lại y hệt mỗi lần lập lệnh là dư thừa và dễ gõ sai lệch giữa các lệnh. Trường `LenhDieuCongTac.canCu` (đã có sẵn trong CSDL) VẪN giữ nguyên, chỉ tiếp tục ẩn khỏi form (dùng cho mẫu Tuyến thường nếu sau này cần, không dùng cho mẫu Trạm).
   - Thay bằng: thêm `CauHinhDonVi.canCuMauTram: String?` (migration `20260810090700_cau_hinh_can_cu_mau_tram`) — 1 giá trị DÙNG CHUNG cho mọi lệnh Trạm, sửa tại trang cấu hình sẵn có `/cau-hinh-don-vi` (thêm 1 ô Textarea mới, cùng cơ chế `canCuHtml()` tách mỗi dòng thành 1 đoạn "Căn cứ ...;" riêng khi in).
   - Đã hỏi lại người dùng cách "cho phép sửa mẫu" nghĩa là gì (hằng số trong code hay ô sửa trên web) trước khi làm — người dùng chọn rõ ràng "Thêm ô sửa trên giao diện web", tái dùng đúng mô hình `CauHinhDonVi` singleton đã có sẵn cho các trường thể thức khác (tên cơ quan, địa danh...) thay vì tạo bảng cấu hình mới hoặc hardcode trong code.
2. **Cỡ chữ nội dung 14pt** (chuẩn cỡ chữ văn bản hành chính, thay vì 10pt mặc định dùng chung `cssKhung()`) — thêm `font-size: 14pt` inline trên CẢ `<div class="trang">` lẫn `<table class="bang-in">` riêng của hàm `noiDungTrangLenhDieuCongTacTram()` (bảng cần override riêng vì `table.bang-in` có `font-size: 9pt` hardcode trong CSS dùng chung). Chỉ áp dụng cho trang Trạm, không đụng đến LĐX/GĐĐ/LĐCT Tuyến thường.
3. **Đậm cả dòng trưởng đoàn** — đổi từ chỉ bọc `<strong>` quanh chữ "Trưởng đoàn" ở cột Nhiệm vụ sang đặt `style="font-weight:700;"` trên cả thẻ `<tr>` — `font-weight` kế thừa xuống mọi `<td>` con nên toàn bộ dòng (họ tên, ngày sinh, CCCD, ghi chú) đều đậm, không chỉ 1 ô.
4. **Gom nhóm + merge cột Ghi chú theo ngày đi–về** — 2 bước:
   - `sapXepGomNhomTram()`: gom thành viên theo khoảng ngày đi–về HIỆU LỰC (riêng nếu có override, không thì theo đoàn), đưa nhóm CỦA TRƯỞNG ĐOÀN lên đầu danh sách (trong nhóm đó, trưởng đoàn cũng lên đầu), các nhóm còn lại giữ nguyên thứ tự xuất hiện ban đầu — để những người đi cùng ngày với trưởng đoàn nằm gần nhau, chuẩn bị cho bước merge.
   - Khi build hàng bảng: các hàng LIÊN TIẾP có cùng nội dung Ghi chú (nhờ đã gom nhóm ở bước trên nên chắc chắn liền kề) được merge bằng `rowspan` — chỉ hàng đầu nhóm có `<td rowspan="N">`, các hàng sau trong nhóm bỏ hẳn `<td>` đó. STT đánh lại theo thứ tự SAU KHI sắp xếp (thứ tự thật sự hiển thị trên bản in).
   - Kèm sửa 1 lỗi phát hiện khi đối chiếu lại: Ghi chú TRƯỚC ĐÂY chỉ hiển thị khi thành viên có ngày riêng khác đoàn (`ngayDiRieng`/`ngayVeRieng` khác null) — nhưng file mẫu thật cho thấy MỌI dòng (kể cả trưởng đoàn, không có override) đều hiển thị "Từ ngày ... đến ngày ..." theo khoảng hiệu lực. Sửa `ghiChuTram()` bỏ hẳn điều kiện, luôn tính khoảng hiệu lực.
5. **Canh đều 2 biên** (`text-align: justify`) cho 3 đoạn văn bản dài của mẫu Trạm: các đoạn "Căn cứ ...;" (`canCuHtml()` thêm tham số `canhDeu` — chỉ bật cho mẫu Trạm, mẫu Tuyến thường giữ nguyên căn trái), đoạn "Giám đốc ... quyết định điều động...", đoạn "Từng thành viên tham gia công tác...".
6. **Phân biệt lệnh Trạm ở danh sách `/lenh-dieu-cong-tac`** — tô nền hàng nhạt (`bg-amber-50/60` sáng, `bg-amber-950/20` tối) VÀ thêm nhãn chữ "Trạm" (badge tròn, cùng kiểu với các badge khác trong dự án như ở `/nhan-vien`) ngay cạnh số hiệu khi `mauInTram=true` — dùng CẢ màu lẫn chữ (không chỉ màu) theo đúng quy tắc "không dùng màu sắc làm dấu hiệu duy nhất" trong `QUY_TAC_GIAO_DIEN.md`.

Lý do chung: toàn bộ các điểm trên xuất phát từ phản hồi trực tiếp của người dùng sau khi xem thử bản in thật — không đoán trước quy tắc.

## [2026-08-10] Mẫu in Trạm TP.HCM: gói gọn 1 trang A4, nội dung Căn cứ thật, câu "Giám đốc" hardcode, họ tên không rớt dòng

Bối cảnh: người dùng xem thử bản in Trạm sau lượt sửa 14pt/gộp nhóm/căn đều trước đó, phản hồi 4 điểm.

Quyết định:

1. **Gói gọn 1 trang A4** — cỡ chữ 14pt (đúng chuẩn NĐ30) cộng với 2 đoạn Căn cứ dài + đoạn "Giám đốc..." + bảng thành viên khiến nội dung tràn qua trang 2 với đoàn vừa phải. Ưu tiên yêu cầu "trọn 1 trang" hơn giữ đúng 14pt: giảm xuống 12pt (`.trang` + `table.bang-in.bang-tram`), giảm `line-height` 1.4→1.3, thêm class `.bang-tram` trong `cssKhung()` giảm đệm ô bảng (2mm 2.5mm → 1.2mm 2mm), giảm margin giữa các đoạn văn (3mm→2mm). Không đặt `height` cố định cho `.trang` (vẫn dùng `min-height`) để tránh cắt mất nội dung nếu đoàn quá đông — đây là đánh đổi có kiểm soát cho quy mô đoàn thực tế (Trạm TPHCM thường không quá đông người), không phải đảm bảo tuyệt đối cho mọi số lượng thành viên.
2. **Nội dung Căn cứ thật** — trước đó `CauHinhDonVi.canCuMauTram` mới có cột, chưa có dữ liệu. Người dùng cung cấp đúng 2 câu (Quyết định 07/QĐ-XSKT và 15/QĐ-XSKT) — nạp bằng migration `20260810092215_backfill_can_cu_mau_tram`: `UPDATE cau_hinh_don_vi SET canCuMauTram = ... WHERE id='mac-dinh' AND (canCuMauTram IS NULL OR canCuMauTram = '')`. Mỗi dòng đã bỏ sẵn tiền tố "Căn cứ " và dấu ";" cuối câu (theo đúng quy ước `canCuHtml()` tự thêm lại 2 phần này) để tránh lặp "Căn cứ Căn cứ...;;". Chỉ cập nhật khi cột đang rỗng — không ghi đè nếu quản trị đã tự sửa qua `/cau-hinh-don-vi` trước khi chạy migration. Lưu ý: nếu CSDL hoàn toàn mới (chưa từng gọi `layCauHinh()` để tạo dòng `mac-dinh`) thì migration này sẽ không tác dụng gì (UPDATE 0 dòng) — chấp nhận được vì hệ thống đang chạy thật đã có sẵn dòng cấu hình này từ lâu.
3. **Câu "Giám đốc..." chuyển sang chuỗi cứng** — trước đó ghép động từ `cauHinhDonVi.tenCoQuanDong1` + `tenCoQuanDong2` (2 chuỗi IN HOA dùng cho khối quốc hiệu ở letterhead) ra "Giám đốc CÔNG TY TNHH MỘT THÀNH VIÊN XỔ SỐ KIẾN THIẾT AN GIANG". Người dùng yêu cầu đúng "Giám đốc Công ty TNHH MTV Xổ số Kiến thiết An Giang" (viết tắt MTV, chữ thường/hoa theo thể thức câu văn, không phải khối quốc hiệu) — viết cứng chuỗi này riêng trong `noiDungTrangLenhDieuCongTacTram()`, không đụng đến `tenCoQuanDong1/2` hay letterhead dùng chung (mẫu Tuyến thường và các mẫu khác không bị ảnh hưởng).
4. **Họ và tên không xuống dòng** — thêm `white-space:nowrap` cho ô Họ và tên trong bảng thành viên mẫu Trạm (giống cách các cột Năm sinh/CCCD đã làm trước đó) — chấp nhận trường hợp hiếm tên rất dài có thể tràn nhẹ ra ngoài cột thay vì xuống dòng, vì "không xuống dòng" là yêu cầu tường minh.

Lý do chung: phản hồi trực tiếp từ người dùng sau khi xem bản in thật.

## [2026-08-10] Mẫu in Trạm TP.HCM (tiếp): chức danh người ký, cỡ chữ letterhead, Căn cứ in nguyên văn, gạch chân ngắn 1/2

Bối cảnh: người dùng gửi ảnh chụp bản in Trạm thực tế (số 03/LĐCT), phát hiện thêm 4 điểm cần sửa — trong đó điểm 3 tiếp tục điều chỉnh hành vi `canCuHtml()` vừa đổi ở mục nhật ký ngay phía trên.

Quyết định:

1. **Chức danh người ký hiển thị dưới mọi khối "TL.GIÁM ĐỐC"** — trước đây cột `nguoiKyChucDanh` (chức danh thật, vd "Trưởng phòng Tổ chức - Hành chính", khác với `nguoiKyTheThuc` là thể thức ký "TL. GIÁM ĐỐC") đã có sẵn trong CSDL (snapshot lúc tạo, giống hệt `nguoiKyHoTen`) nhưng CHƯA từng được đưa vào mẫu in — hàm dùng chung `khoiKy(theThuc, hoTen)` trong `mau-in-dung-chung.ts` chỉ nhận 2 tham số. Thêm tham số thứ 3 `chucDanh`, hiển thị thành 1 dòng mới (`.chuc-danh-nguoi-ky`, 9pt, không in hoa/đậm để phân biệt với 2 dòng trên) ngay dưới dòng họ tên. Áp dụng cho CẢ 3 loại chứng từ (LĐX, LĐCT — cả Tuyến thường lẫn Trạm, GĐĐ) vì `khoiKy()` dùng chung 1 nơi duy nhất. Phải nối dây (plumbing) qua nhiều lớp: thêm `nguoiKyChucDanh` vào `LenhDieuCongTacDeIn`/`GiayDiDuongDeIn`/`LenhDieuXeNoiDungDeIn`, và thêm dòng forward `nguoiKyChucDanh: chiTiet.nguoiKyChucDanh` ở 3 hàm build DTO in ấn GĐĐ trong `lenh-dieu-cong-tac.service.ts` (dữ liệu gốc vốn đã tính sẵn trong `layChiTietGiayDiDuong()` nhưng bị bỏ sót khi trả về).
2. **Cỡ chữ khối letterhead (quốc hiệu/tên cơ quan) mẫu Trạm quá nhỏ so với tổng thể** — nguyên nhân: các class `.co-quan-chu-quan`/`.quoc-hieu`/`.tieu-ngu`... trong `cssLetterheadVaKy()` dùng cỡ cố định 9-10pt (tính cho LDX/GDD/LDCT Tuyến thường mặc định 10pt), không kế thừa theo cỡ 12pt vừa tăng riêng cho trang Trạm. Thêm class scoped `.trang.mau-tram` (gắn trên `<div class="trang mau-tram">` của riêng hàm `noiDungTrangLenhDieuCongTacTram()`) với các rule tăng lên 11-12pt — KHÔNG sửa trực tiếp `cssLetterheadVaKy()` dùng chung, để LDX/GDD/LDCT Tuyến thường giữ nguyên cỡ đã ổn định (LDX A5 từng phải thu nhỏ chữ mới vừa khổ, phóng to có thể vỡ bố cục).
3. **`canCuHtml()` không còn tự thêm chữ "Căn cứ" và dấu ";"** — đảo ngược quy ước vừa chốt cùng ngày (mục nhật ký phía trên): trước đó hàm tự động bọc mỗi dòng thành `"Căn cứ {dòng};"`, nhưng ảnh chụp thực tế cho thấy bị lặp đôi ("Căn cứ Căn cứ ...;;") vì người dùng đã tự gõ sẵn "Căn cứ ...;" trong ô ở `/cau-hinh-don-vi`. Theo yêu cầu tường minh, đổi hàm thành in NGUYÊN VĂN từng dòng (chỉ trim + thoát HTML + bọc `<p>`), không tự thêm/bớt gì — người dùng tự quyết định có gõ "Căn cứ"/";" hay không. Cập nhật placeholder + đoạn hướng dẫn ở `/cau-hinh-don-vi` cho khớp quy ước mới. Thêm migration `20260810093526_can_cu_mau_tram_nguyen_van`: cập nhật lại 2 dòng đã backfill ở migration trước đó (`20260810092215_...`) sang dạng có sẵn "Căn cứ "/";", NHƯNG chỉ áp dụng nếu cột vẫn còn khớp CHÍNH XÁC giá trị cũ (WHERE so khớp full text) — không ghi đè nếu người dùng đã tự sửa qua giao diện.
4. **Đường kẻ dưới "(Trực Trạm phát hành vé số tại TP.HCM)" ngắn lại còn 1/2** — trước đó dùng `border-bottom` trực tiếp trên `<span>` bao trọn cụm chữ nên đường kẻ dài bằng cả câu. Đổi kỹ thuật: bọc chữ trong `<span style="position:relative; display:inline-block;">`, thêm 1 `<span>` con `position:absolute; left:25%; right:25%; bottom:0;` mang `border-bottom` — vì span con neo theo đúng chiều rộng thật của chữ (do span cha là `inline-block`), khoảng cách từ 25% đến 75% luôn đúng bằng 1/2 độ dài chữ và tự canh giữa, không cần đo/hardcode mm nào, hoạt động đúng dù nội dung câu thay đổi sau này.

Lý do chung: phản hồi trực tiếp từ người dùng sau khi xem ảnh chụp bản in thật (số 03/LĐCT).

## [2026-08-10] Chức danh người ký: đổi vị trí xuống ngay dưới "TL.GIÁM ĐỐC" + in hoa

Bối cảnh: mục nhật ký ngay phía trên vừa thêm dòng chức danh thật (`chuc-danh-nguoi-ky`) nhưng đặt dưới dòng họ tên. Người dùng phản hồi muốn đặt ngay dưới dòng thể thức ký "TL.GIÁM ĐỐC" (trước khoảng trống ký tên) và hiển thị in hoa.

Quyết định: đổi thứ tự trong `khoiKy()` (`mau-in-dung-chung.ts`) từ `the-thuc-ky → khoang-trong-ky → ho-ten-ky → chuc-danh-nguoi-ky` thành `the-thuc-ky → chuc-danh-nguoi-ky → khoang-trong-ky → ho-ten-ky`; thêm `text-transform: uppercase` cho `.chuc-danh-nguoi-ky` (vẫn giữ không đậm/cỡ nhỏ hơn dòng thể thức để phân biệt 2 dòng). Áp dụng tự động cho cả 3 loại chứng từ vì dùng chung 1 hàm.

## [2026-08-10] Bảng thành viên mẫu Trạm: canh giữa cột CCCD/Nhiệm vụ/Ghi chú, Nhiệm vụ không rớt dòng

Bối cảnh: người dùng phản hồi 2 điểm nhỏ về bảng thành viên trong `noiDungTrangLenhDieuCongTacTram()`.

Quyết định:
1. Thêm `text-align:center` cho ô Ghi chú (trước đó chỉ có CCCD và Nhiệm vụ canh giữa, Ghi chú để mặc định canh trái).
2. Thêm `white-space:nowrap` cho ô Nhiệm vụ ("Trưởng đoàn"/"Thành viên") - trước đó không có, dễ rớt dòng ở cột hẹp 26mm. Đồng thời nới rộng cột NHIỆM VỤ 26mm→30mm, bù lại bằng cách thu hẹp cột GHI CHÚ 34mm→30mm (Ghi chú là câu dài, đã chấp nhận xuống dòng tự nhiên, không cần nowrap) - giữ tổng độ rộng bảng không đổi.

## [2026-08-10] Bảng thành viên mẫu Trạm: table-layout:fixed để bảng canh giữa + cột luôn đúng độ rộng cố định

Bối cảnh: người dùng gửi ảnh chụp bảng thành viên thực tế, phản hồi 2 điểm: (1) vị trí bảng không canh giữa so với khổ giấy, (2) cột NĂM SINH/SỐ CCCD cần độ rộng cố định, nội dung cùng cỡ chữ, canh đều nhau qua các hàng.

Nguyên nhân gốc: `table.bang-in` mặc định dùng `table-layout: auto` (kế thừa từ CSS dùng chung `cssKhung()`) — với layout này, các độ rộng khai báo ở `<th style="width:...">` chỉ là GỢI Ý, trình duyệt vẫn có thể tự tính lại độ rộng thực tế của từng cột dựa theo nội dung từng hàng (đặc biệt khi kết hợp nhiều cột `white-space:nowrap`), khiến bảng có thể co lại nhỏ hơn 100% và lệch trái, đồng thời độ rộng cột không đảm bảo giống hệt nhau giữa các hàng.

Quyết định: thêm `table-layout: fixed;` cho riêng bảng mẫu Trạm (`table.bang-in.bang-tram`) — buộc trình duyệt dùng ĐÚNG độ rộng khai báo ở hàng `<th>` đầu tiên, áp dụng đồng nhất cho mọi hàng bất kể nội dung dài ngắn (cột không khai báo độ rộng là HỌ VÀ TÊN nhận phần còn lại). Kèm `margin-left: auto; margin-right: auto;` để bảng luôn canh giữa theo chiều ngang trang giấy trong mọi trường hợp (kể cả nếu tổng độ rộng sau `table-layout:fixed` không khớp tuyệt đối 100%). Chỉ áp dụng cho mẫu Trạm — LDX/GDD/LDCT Tuyến thường vẫn dùng `table-layout: auto` mặc định, không bị ảnh hưởng.

## [2026-08-10] Bảng thành viên mẫu Trạm: giãn lại độ rộng cột + giảm cỡ chữ (trừ Họ và tên) để hết chồng chữ

Bối cảnh: `table-layout: fixed` thêm ở mục nhật ký ngay phía trên khiến nội dung 2 cột NĂM SINH/SỐ CCCD (nowrap, cỡ chữ 12pt) bị TRÀN ĐÈ lên cột kế bên thay vì tự giãn cột như trước (đúng bản chất của `table-layout:fixed` - độ rộng cột cố định tuyệt đối, nội dung dư sẽ tràn ra ngoài thay vì đẩy cột rộng thêm) - ảnh chụp cho thấy chữ CCCD/năm sinh đè lên cột Nhiệm vụ.

Quyết định: tính lại toàn bộ 6 cột sao cho tổng đúng bằng 160mm (bề ngang nội dung khả dụng của khổ A4 với lề 30mm trái + 20mm phải theo Nghị định 30 đã chọn trước đó): TT 8mm, HỌ VÀ TÊN 40mm, NĂM SINH 26mm (từ 24mm), SỐ CCCD 32mm (từ 30mm), NHIỆM VỤ 26mm (từ 30mm), GHI CHÚ 28mm (từ 30mm). Đồng thời giảm cỡ chữ NỀN của bảng từ 12pt xuống 11pt (áp dụng cho mọi cột), NGOẠI TRỪ cột Họ và tên vẫn giữ 12pt (override riêng bằng `font-size:12pt` trên cả `<th>` và từng `<td>` của cột này) theo đúng yêu cầu người dùng - vừa nới đủ chỗ cho ngày sinh/CCCD hiển thị trọn vẹn, vừa giữ tên người vẫn nổi bật/dễ đọc nhất trong bảng.

## [2026-08-10] Bảng thành viên mẫu Trạm: mở rộng lề trái/phải riêng cho bảng thêm 1cm mỗi bên

Bối cảnh: sau khi giãn lại 6 cột trong tổng 160mm (bằng đúng bề ngang nội dung giữa lề trái 30mm/phải 20mm theo Nghị định 30), nội dung vẫn còn chật, người dùng yêu cầu nới thêm 0.5-1cm mỗi bên trái/phải RIÊNG cho bảng.

Quyết định: KHÔNG giảm lề trang `.trang` (vẫn giữ nguyên 20/20/30/20mm đúng chuẩn Nghị định 30 cho letterhead + đoạn văn) — chỉ riêng bảng thành viên (`table.bang-in.bang-tram`) được "tràn" ra ngoài vùng lề chuẩn thêm 1cm mỗi bên, bằng cách đổi `width:100%` (ăn theo vùng nội dung 160mm) sang `width:180mm` cố định + `margin: 4mm -10mm` (margin trái/phải ÂM 10mm kéo bảng lồi ra ngoài khung lề). Sau khi mở rộng, khoảng cách còn lại từ bảng đến mép giấy vật lý là 20mm bên trái và 10mm bên phải — vẫn an toàn, không chạm mép giấy (vùng in được của máy in thường chỉ cần tối thiểu vài mm). Chia đều 20mm dôi ra cho cả 6 cột (mỗi cột +4mm): TT 8mm (không đổi), HỌ VÀ TÊN 44mm, NĂM SINH 30mm, SỐ CCCD 36mm, NHIỆM VỤ 30mm, GHI CHÚ 32mm — tổng đúng 180mm. Cách làm này tách biệt "lề văn bản" (đoạn văn/letterhead, giữ đúng luật) khỏi "lề bảng biểu" (được phép rộng hơn đôi chút để đảm bảo hiển thị đủ dữ liệu) — chỉ ảnh hưởng bảng của mẫu Trạm, không đụng đến các mẫu in khác.

## [2026-08-10] Bảng thành viên mẫu Trạm: canh giữa dọc + tabular-nums cho cột NĂM SINH/SỐ CCCD

Bối cảnh: người dùng chỉ ra 2 cột NĂM SINH/SỐ CCCD tuy đã canh giữa NGANG (`text-align:center`, làm ở lượt trước) nhưng chưa canh giữa DỌC — 2 ô này vẫn kế thừa `vertical-align: top` từ rule dùng chung `table.bang-in th, table.bang-in td` (chỉ có `text-align:center` được override riêng, thiếu `vertical-align`), khiến nội dung có thể lệch lên trên thay vì nằm giữa ô theo chiều dọc.

Quyết định: thêm `vertical-align:middle;` và `font-variant-numeric:tabular-nums;` (số liệu ngày sinh/CCCD thẳng cột hơn vì mỗi chữ số chiếm độ rộng bằng nhau) vào inline style của 2 ô này trong `noiDungTrangLenhDieuCongTacTram()` — CHỈ 2 cột này, không đụng đến cột khác. Header 2 cột đã tự động canh giữa cả 2 chiều từ trước (kế thừa rule `table.bang-in th { text-align:center; vertical-align:middle; }` dùng chung cho mọi tiêu đề bảng), không cần sửa thêm. `white-space:nowrap`, `table-layout:fixed` + độ rộng cột cố định (30mm/36mm) đã có sẵn từ các lượt trước, không đổi.

## [2026-08-10] Bảng thành viên mẫu Trạm (tiếp): SỐ CCCD chuyển sang căn trái + padding cố định, nới Họ và tên, Ghi chú không in đậm, chức danh ký in đậm

Bối cảnh: người dùng gửi ảnh chụp cho thấy 2 cột NĂM SINH/SỐ CCCD vẫn lệch (dù đã center + tabular-nums), cột Họ và tên vẫn tràn ở hàng trưởng đoàn, đồng thời yêu cầu thêm 2 điểm về in đậm.

Nguyên nhân lệch ở CCCD: hàng trưởng đoàn được in đậm cả dòng (`<tr style="font-weight:700;">`, quyết định từ trước) - chữ số IN ĐẬM có bề ngang mỗi ký tự RỘNG HƠN chữ số thường (khác font-weight là khác file/metric glyph, `tabular-nums` chỉ đảm bảo các CHỮ SỐ TRONG CÙNG 1 kiểu chữ rộng bằng nhau, không đảm bảo bằng chữ số ở kiểu chữ khác). Khi căn giữa (`text-align:center`), khối chữ RỘNG HƠN ở hàng đậm sẽ có điểm bắt đầu (mép trái) lùi về bên trái nhiều hơn các hàng thường - gây "lệch" đúng như ảnh chụp, dù bản thân mỗi hàng đã tự canh giữa đúng trong ô của nó.

Quyết định (theo đúng chỉ định kỹ thuật của người dùng):
1. **SỐ CCCD: đổi từ `text-align:center` sang `text-align:left` + `padding-left:2mm` cố định (giống nhau mọi hàng)** — căn trái với padding cố định KHÔNG phụ thuộc độ rộng khối chữ (không như center), nên mọi hàng số CCCD luôn bắt đầu tại đúng 1 toạ độ X bất kể đậm/thường. Header `SỐ CCCD` giữ nguyên căn giữa (không đổi, đã đúng từ trước - kế thừa rule `table.bang-in th`).
2. **NĂM SINH: giữ `text-align:center`** (không đổi) theo đúng chỉ định - cột này ít bị ảnh hưởng vì chuỗi ngày ngắn hơn, chênh lệch đậm/thường không đáng kể bằng CCCD 12 số.
3. **Nới cột HỌ VÀ TÊN 44mm→50mm, lấy bù từ cột GHI CHÚ 32mm→26mm** (tổng vẫn đúng 180mm) - lý do chọn Ghi chú làm nguồn bù thay vì Năm sinh/CCCD (vốn đã sát mức cần thiết từ các lượt trước): Ghi chú là câu dài, không dùng `nowrap`, tự xuống dòng tự nhiên nên thu hẹp chỉ khiến nó xuống nhiều dòng hơn (không gây tràn ngang), an toàn hơn nhiều so với việc siết lại 2 cột đã dùng `nowrap`.
4. **Cột Ghi chú không in đậm dù ở hàng trưởng đoàn** — thêm `font-weight:normal` tường minh trên `<td>` Ghi chú (trước đó không có, nên kế thừa `font-weight:700` từ `<tr>` cha khi hàng đó là trưởng đoàn).
5. **Dòng chức danh người ký (`.chuc-danh-nguoi-ky`) in đậm** — thêm `font-weight:700` vào class dùng chung trong `mau-in-dung-chung.ts`, áp dụng cho mọi khối "TL.GIÁM ĐỐC" ở cả 3 loại chứng từ.

Lưu ý còn tồn: tên rất dài (trên ~20 ký tự, đặc biệt khi in đậm) vẫn có thể tràn nhẹ ngoài 50mm do dùng `white-space:nowrap` - đây là đánh đổi đã được người dùng chấp nhận từ quyết định trước ("không xuống dòng" ưu tiên hơn "không bao giờ tràn").

## [2026-08-10] Bảng thành viên mẫu Trạm: NĂM SINH cũng đổi sang canh trái + padding cố định (đồng bộ với SỐ CCCD)

Bối cảnh: người dùng hỏi vì sao cỡ chữ 2 cột NĂM SINH/SỐ CCCD giống nhau (xác nhận đúng - cả 2 đều 11pt, kế thừa từ `<table style="font-size:11pt;">`, không có override riêng) mà nhìn vẫn không đều. Giải thích: 2 cột đang dùng 2 kiểu canh khác nhau theo đúng yêu cầu trước đó (NĂM SINH center, SỐ CCCD left+padding) - `text-align:center` vẫn có thể trôi nhẹ theo độ rộng chữ giữa hàng đậm (trưởng đoàn) và hàng thường, dù ít rõ hơn CCCD vì chuỗi ngắn hơn (10 ký tự so với 12 số).

Hỏi lại người dùng qua AskUserQuestion: đổi NĂM SINH sang cùng cách canh trái + padding cố định như SỐ CCCD (loại bỏ hoàn toàn nguồn gây lệch), hay giữ nguyên center. Người dùng chọn đổi sang left+padding.

Quyết định: đổi `text-align:center` → `text-align:left; padding-left:2mm;` cho ô NĂM SINH (giống hệt SỐ CCCD) - cả 2 cột giờ dùng chung 1 công thức, đảm bảo mọi hàng (kể cả hàng đậm) bắt đầu đúng cùng 1 toạ độ X, không còn phụ thuộc độ rộng khối chữ nữa. Header 2 cột vẫn giữ nguyên canh giữa (không đổi, đã đúng từ trước).

## [2026-08-10] Bảng thành viên mẫu Trạm: dùng font monospace (Roboto Mono) cho NĂM SINH/SỐ CCCD thay vì tabular-nums

Bối cảnh: dù đã đổi cả 2 cột sang `text-align:left` + `padding-left:2mm` cố định (padding không phụ thuộc nội dung), người dùng vẫn nghi ngờ còn lệch và hỏi thư viện in PDF đang dùng gì. Xác nhận: dùng Playwright điều khiển Chromium headless (`apps/api/src/common/pdf/pdf.service.ts`), không dùng `window.print()`. Không có Chromium trong sandbox này để tự render kiểm chứng bằng mắt (không có quyền cài `apt`/root).

Người dùng yêu cầu giải pháp triệt để hơn: dùng **font monospace** cho phần số.

Quyết định: thêm font **Roboto Mono** (400 + 700, subset latin - đủ cho chữ số + dấu "/", không cần tiếng Việt vì 2 cột này chỉ chứa số) — lấy từ gói npm `@fontsource/roboto-mono@5.3.0` (đã thử tải trực tiếp từ GitHub nhưng mạng sandbox chặn qua proxy 403; `npm pack` qua registry thì tải được), lưu 2 file `RobotoMono-Regular.woff2`/`RobotoMono-Bold.woff2` vào `apps/api/assets/fonts/`, base64-inline y hệt cách Be Vietnam Pro đang làm (không tải qua mạng lúc render, tự chứa trong HTML).

Tổng quát hoá `DANH_SACH_FONT`/`taoCssFontMat()` trong `mau-in-dung-chung.ts` để hỗ trợ nhiều family/định dạng file khác nhau (trước đó hardcode cứng family "Be Vietnam Pro" + format "truetype"). Áp dụng `font-family: 'Roboto Mono', monospace;` cho 2 ô NĂM SINH và SỐ CCCD trong `noiDungTrangLenhDieuCongTacTram()`, bỏ `font-variant-numeric: tabular-nums` (không cần nữa vì monospace tự đảm bảo mọi ký tự - kể cả giữa 2 độ đậm 400/700 - rộng bằng nhau tuyệt đối, mạnh hơn hẳn tabular-nums vốn chỉ đảm bảo đồng nhất TRONG CÙNG 1 độ đậm).

Đã kiểm tra đủ chỗ hiển thị: ở 11pt, Roboto Mono mỗi ký tự ~2.33mm (0.6em chuẩn monospace) → NĂM SINH (10 ký tự) cần ~27mm, SỐ CCCD (12 số) cần ~32mm, đều nằm trong độ rộng cột hiện có (30mm/36mm).

## [2026-08-10] Đổi font monospace từ Roboto Mono sang Courier Prime - số 0 không còn gạch chéo

Bối cảnh: người dùng phản hồi số "0" của Roboto Mono (font monospace vừa thêm ở mục nhật ký ngay phía trên) có gạch chéo giữa, dễ nhầm với số 8 - đặc điểm "slashed zero" khá phổ biến ở các font dành cho lập trình viên (giúp phân biệt 0 với chữ O khi đọc code), nhưng KHÔNG phù hợp với người đọc thông thường trên chứng từ hành chính.

Xác minh trước khi đổi (không đoán mò): dùng thư viện `opentype.js` đọc trực tiếp đường nét (path) của glyph "0" trong 6 font monospace phổ biến có sẵn trên npm (`@fontsource/*`), đếm số contour (đường viền kín) của mỗi glyph - số 0 dạng oval đơn giản chỉ có 2 contour (viền ngoài + viền trong), còn số 0 có gạch chéo sẽ có 3 contour (thêm 1 nét gạch tách rời). Kết quả: Roboto Mono, Cousine, IBM Plex Mono, Space Mono, JetBrains Mono đều 3 contour (có gạch); riêng **Courier Prime** 2 contour (không gạch). Xuất glyph "0" của Roboto Mono và Courier Prime ra ảnh PNG để xem trực tiếp trước khi quyết định - xác nhận đúng như phân tích.

Quyết định: thay "Roboto Mono" bằng **Courier Prime** (400 + 700, gói npm `@fontsource/courier-prime`) trong toàn bộ hạ tầng font — cập nhật `DANH_SACH_FONT`/`taoCssFontMat()` (`mau-in-dung-chung.ts`) và `font-family` của 2 ô NĂM SINH/SỐ CCCD (`lenh-dieu-cong-tac-mau-in.ts`) từ `'Roboto Mono', monospace` sang `'Courier Prime', monospace`. File `RobotoMono-Regular.woff2`/`RobotoMono-Bold.woff2` cũ trong `apps/api/assets/fonts/` không xoá được (thư mục dự án có khoá ghi/xoá trong phiên làm việc này) nhưng vô hại - không còn được code nào tham chiếu tới, `CourierPrime-Regular.woff2`/`CourierPrime-Bold.woff2` mới đã thay thế hoàn toàn vai trò. Courier Prime cũng cùng tỷ lệ ký tự chuẩn 0.6em/ký tự như mọi font họ Courier, không ảnh hưởng tới độ rộng cột đã tính (30mm/36mm) từ các lượt trước.

## [2026-08-10] Bỏ font monospace (Courier Prime) cho NĂM SINH/SỐ CCCD, quay lại Be Vietnam Pro + tabular-nums + ép không đậm

Bối cảnh: ngay sau khi đổi sang Courier Prime (mục nhật ký ngay phía trên), người dùng đặt câu hỏi phản biện: nếu chỉ cần các chữ số thẳng hàng chứ không cần đổi hẳn cả cột sang phông monospace, dùng phông thường (Be Vietnam Pro) + `font-variant-numeric: tabular-nums` có giải quyết được không.

Phân tích lại nguyên nhân gốc: `tabular-nums` từng được thử trước đó trong phiên này nhưng bị coi là "chưa đủ" — lý do thật sự không phải bản thân tabular-nums sai, mà vì hàng trưởng đoàn được in cả dòng đậm (`<tr style="font-weight:700">`), kéo theo 2 ô NĂM SINH/SỐ CCCD của riêng hàng đó cũng đậm theo mặc định (kế thừa font-weight từ `<tr>`). Đậm và thường là 2 file glyph khác nhau (nét đậm rộng hơn) — tabular-nums chỉ đảm bảo chữ số đều rộng nhau TRONG CÙNG 1 độ đậm, không đảm bảo bằng nhau GIỮA 2 độ đậm khác nhau. Đây là lý do tabular-nums từng "không ăn thua" khi chưa xử lý riêng độ đậm của 2 cột này.

Quyết định: **bỏ font monospace, quay lại Be Vietnam Pro cho toàn bộ mẫu in** (loại 2 entry Courier Prime khỏi `DANH_SACH_FONT`/`taoCssFontMat()` trong `mau-in-dung-chung.ts`). Tại 2 ô NĂM SINH/SỐ CCCD (`lenh-dieu-cong-tac-mau-in.ts`, hàm `noiDungTrangLenhDieuCongTacTram`), bỏ `font-family:'Courier Prime'`, thay bằng `font-variant-numeric: tabular-nums` + **ép cứng `font-weight: normal`** (không cho kế thừa đậm từ `<tr>` của hàng trưởng đoàn) — cùng kỹ thuật đã áp dụng cho cột Ghi chú trước đó. Nhờ vậy mọi hàng luôn dùng đúng 1 độ đậm (400) cho 2 cột số này, tabular-nums lúc này đủ để đảm bảo mọi chữ số cùng độ rộng, thẳng hàng tuyệt đối qua mọi hàng kể cả hàng trưởng đoàn.

Lý do chọn cách này thay vì giữ Courier Prime: giữ đúng 1 kiểu chữ (Be Vietnam Pro) xuyên suốt toàn bảng, không lộ 2 phông khác nhau trong cùng 1 chứng từ hành chính (Courier Prime tuy đã hết lỗi số 0 gạch chéo nhưng vẫn là 1 phông "kiểu máy đánh chữ" khác hẳn phong cách phần còn lại); không cần nhúng thêm file font vào HTML (giảm dung lượng mỗi lần render); đơn giản hơn để bảo trì lâu dài (đúng tinh thần CLAUDE.md ưu tiên dễ bảo trì hơn kỹ thuật cầu kỳ). File `CourierPrime-*.woff2`/`RobotoMono-*.woff2` trong `apps/api/assets/fonts/` không xoá được (giới hạn ghi/xoá của thư mục dự án) nhưng nay đã là file mồ côi hoàn toàn, không ảnh hưởng gì.

Phương án khác đã cân nhắc: giữ Courier Prime (đã xác minh không gạch chéo) — bị loại vì đổi phông chỉ 2 cột trong 1 bảng làm mất tính nhất quán thị giác của chứng từ, trong khi vấn đề gốc (độ đậm khác nhau) có thể giải quyết triệt để chỉ bằng CSS mà không cần đổi phông.

## [2026-08-10] Đổi lại: dùng font monospace JetBrains Mono cho NĂM SINH/SỐ CCCD (thay Be Vietnam Pro + tabular-nums)

Bối cảnh: ngay sau quyết định trên (quay lại Be Vietnam Pro + tabular-nums + ép không đậm), người dùng yêu cầu trực tiếp đổi sang font "JetBrains Mono" — một font monospace phổ biến, khác với các font đã thử và bị loại trước đó (Roboto Mono/Cousine/IBM Plex Mono/Space Mono, đều có số 0 gạch chéo dễ nhầm số 8).

Xác minh trước khi dùng (không đoán mò, lặp lại đúng phương pháp đã dùng cho Courier Prime): tải font qua `npm pack @fontsource/jetbrains-mono@5.3.0`, giải nén file `.woff2`, giải mã bằng thư viện `wawoff2` rồi đọc glyph "0" bằng `opentype.js`. Kết quả: 3 contour (khác Courier Prime 2 contour) — nhưng xuất glyph ra PNG xem trực tiếp thì đây là **chấm tròn nhỏ ở giữa thân số 0** (dotted zero), KHÔNG PHẢI gạch chéo xuyên thân như Roboto Mono. Chấm ở giữa không tạo hình dáng giống số 8 (đặc điểm gây nhầm của Roboto Mono là nét ngang cắt ngang thân số 0, giống 1 phần nét của số 8) — chấp nhận được, không lặp lại lỗi trước.

Quyết định: thêm `JetBrainsMono-Regular.woff2`/`JetBrainsMono-Bold.woff2` (400 + 700, gói npm `@fontsource/jetbrains-mono`) vào `DANH_SACH_FONT`/`taoCssFontMat()` (`mau-in-dung-chung.ts`). Tại 2 ô NĂM SINH/SỐ CCCD (`lenh-dieu-cong-tac-mau-in.ts`): đổi `font-family` sang `'JetBrains Mono', monospace`, **bỏ hẳn** phần ép `font-weight:normal` và `font-variant-numeric:tabular-nums` đã thêm ở quyết định ngay phía trên — vì đây là font monospace THẬT SỰ (đo bằng opentype.js: `advanceWidth` chữ số = 600/1000 unitsPerEm, tỷ lệ 0.6em giống hệt Courier Prime, không cần đổi lại độ rộng cột 30mm/36mm đã tính từ trước), đảm bảo mọi ký tự rộng bằng nhau tuyệt đối ở CẢ 2 độ đậm (thường/đậm) — khác với tabular-nums chỉ đảm bảo trong cùng 1 độ đậm. Nhờ vậy hàng trưởng đoàn được phép in đậm trở lại (giống các cột STT/Họ tên/Nhiệm vụ) mà không làm lệch cột số.

Lý do: font monospace thật là giải pháp "chắc" nhất về mặt kỹ thuật cho yêu cầu thẳng hàng chữ số qua nhiều độ đậm khác nhau — người dùng chấp nhận đánh đổi việc 2 cột này dùng phông khác với phần còn lại của bảng (Be Vietnam Pro) để đổi lấy sự chắc chắn này.

File `CourierPrime-*.woff2`/`RobotoMono-*.woff2` cũ trong `apps/api/assets/fonts/` không xoá được (giới hạn ghi/xoá của thư mục dự án) nhưng vẫn là file mồ côi, không ảnh hưởng gì — `JetBrainsMono-*.woff2` là bộ file thực sự đang dùng.

## [2026-08-10] Đổi tiếp: dùng Geist Mono thay JetBrains Mono cho NĂM SINH/SỐ CCCD

Bối cảnh: người dùng phản hồi JetBrains Mono "vẫn chưa đúng ý" (không nêu rõ lý do cụ thể — có thể do gu hiển thị, không phải lỗi kỹ thuật), yêu cầu trực tiếp đổi sang "Geist Mono" (font do Vercel phát triển).

Xác minh trước khi dùng (đúng quy trình đã áp dụng cho các font trước — không đoán mò): dùng `opentype.js` đo số "0" của Geist Mono — 3 contour (có dấu hiệu riêng trong thân số 0, giống JetBrains Mono về số lượng), độ rộng ký tự 600/1000 unitsPerEm (0.6em, giống hệt Courier Prime/JetBrains Mono, không cần đổi lại độ rộng cột 30mm/36mm). Sandbox không dùng được `Read`/render ảnh trực tiếp lần này (lỗi "outside connected folders" khi đọc thư mục outputs, khác với các lần trước — không rõ nguyên nhân, ghi nhận là hạn chế môi trường tạm thời) nên tra cứu thay bằng nguồn chính thức: trang GitHub `vercel/geist-font` (issue #81 "Dotted zeros instead of slashed zeros") xác nhận đội thiết kế Geist Mono **chủ động chọn chấm ở giữa (dotted zero)** cho số "0" thay vì gạch chéo — lý do nêu rõ: gạch chéo dễ nhầm với ký tự "Ø" (chữ O có gạch, phổ biến trong tiếng Bắc Âu) hơn là giải quyết được vấn đề, nên chọn giải pháp chấm giống JetBrains Mono/IBM Plex Mono/Source Code Pro. Xác nhận đây đúng là thiết kế mặc định (không phải OpenType feature tùy chọn phải bật riêng).

Quyết định: thêm `GeistMono-Regular.woff2`/`GeistMono-Bold.woff2` (400 + 700, gói npm `@fontsource/geist-mono`) vào `DANH_SACH_FONT`/`taoCssFontMat()` (`mau-in-dung-chung.ts`). Tại 2 ô NĂM SINH/SỐ CCCD (`lenh-dieu-cong-tac-mau-in.ts`): đổi `font-family` từ `'JetBrains Mono', monospace` sang `'Geist Mono', monospace`. Không đổi gì khác — vẫn là font monospace thật (không cần `tabular-nums`/ép `font-weight:normal`), hàng trưởng đoàn vẫn được in đậm bình thường.

File `CourierPrime-*.woff2`/`RobotoMono-*.woff2`/`JetBrainsMono-*.woff2` cũ trong `apps/api/assets/fonts/` không xoá được (giới hạn ghi/xoá của thư mục dự án) nhưng đều là file mồ côi, không ảnh hưởng gì — `GeistMono-*.woff2` là bộ file thực sự đang dùng hiện tại.

Lưu ý cho tương lai: nếu người dùng vẫn chưa hài lòng sau khi xem bản in Geist Mono, vấn đề gốc rất có thể không nằm ở lựa chọn font (đã đổi qua 3 font monospace khác nhau, tất cả đều đúng kỹ thuật) mà ở khía cạnh khác — ví dụ độ rộng cột hiện tại (30mm/36mm) chưa đủ thoáng, cỡ chữ 11pt kế thừa từ `.bang-tram` chưa phù hợp, hoặc đơn giản là đang xem bản PDF cũ chưa `pnpm dev` lại (đã từng xảy ra ở vòng góp ý trước đó về căn giữa) — nên hỏi rõ cụ thể "chưa đúng ý" ở điểm nào (font trông thế nào, hay vẫn lệch cột, hay lý do khác) trước khi tiếp tục đổi font lần nữa.

## [2026-08-10] Quay lại Courier Prime + canh giữa (thay vì căn trái) cho NĂM SINH/SỐ CCCD — chốt phương án cuối

Bối cảnh: người dùng xác nhận độ thẳng hàng của cột đã đạt được (không còn lệch cột), nhưng số "0" của Geist Mono vẫn có dấu hiệu (gạch hoặc chấm) mà người dùng không muốn — yêu cầu số "0" trơn hoàn toàn. Yêu cầu tiếp theo: dùng font "Lucida Console".

Kiểm tra Lucida Console: đây là font độc quyền của Microsoft, đi kèm hệ điều hành Windows, KHÔNG có trên npm hay bất kỳ kho font mã nguồn mở nào (`npm view @fontsource/lucida-console` → 404). Không thể tải file thật về để nhúng base64 vào HTML/PDF theo đúng quy ước dự án (mọi font khác đều là font mã nguồn mở tải qua `@fontsource/*`, xem `taoCssFontMat()`). Đã hỏi lại người dùng 2 phương án: (a) dùng Courier Prime (đã có sẵn, số 0 hình oval trơn, không rủi ro bản quyền), (b) chỉ tham chiếu tên "Lucida Console" trong CSS mà không nhúng file — chỉ hiển thị đúng khi máy chạy PDF (Chromium) có sẵn font này cài trong hệ điều hành (đúng cho máy Văn thư hiện tại chạy Windows, nhưng sẽ vỡ khi triển khai lên máy chủ Linux ở giai đoạn chính thức sau này, xem CLAUDE.md mục "Giai đoạn chính thức"). Người dùng chọn **(a) Courier Prime**.

Quyết định:
1. `mau-in-dung-chung.ts`: đưa lại 2 mục `CourierPrime-Regular.woff2`/`CourierPrime-Bold.woff2` vào `DANH_SACH_FONT` (file vẫn còn sẵn trong `assets/fonts/` từ lượt dùng trước, không cần tải lại qua npm).
2. `lenh-dieu-cong-tac-mau-in.ts`, 2 ô NĂM SINH/SỐ CCCD: đổi `font-family` sang `'Courier Prime', monospace`; đổi `text-align` từ `left` (+ `padding-left:2mm` của lượt trước) sang **`center`**, bỏ hẳn `padding-left` (không cần nữa).

Lý do căn giữa lần này AN TOÀN (không lặp lại lỗi "lệch điểm bắt đầu" đã từng xảy ra khi dùng Be Vietnam Pro): 2 điều kiện cùng thỏa mãn — (a) Courier Prime là font monospace thật, mọi ký tự rộng bằng nhau tuyệt đối ở cả 2 độ đậm (khác Be Vietnam Pro trước đây, đậm/thường là 2 file glyph khác nhau); (b) nội dung 2 cột này luôn có độ dài chuỗi CỐ ĐỊNH mỗi hàng (Năm sinh luôn `dd/mm/yyyy` = 10 ký tự, CCCD luôn 12 chữ số). Khi cả 2 điều kiện đúng, mọi hàng có khối chữ rộng y hệt nhau — căn giữa sẽ tự động thẳng hàng tuyệt đối, không còn phụ thuộc vào độ đậm của hàng (trưởng đoàn) như trước.

Đây là vòng thứ 4 đổi font cho 2 cột này trong cùng 1 ngày (Roboto Mono → Courier Prime → Be Vietnam Pro/tabular-nums → JetBrains Mono → Geist Mono → **Courier Prime, chốt lại**) — quay về đúng lựa chọn ban đầu (Courier Prime) sau khi đã thử đủ các phương án khác, xác nhận đây là lựa chọn tối ưu cho yêu cầu "số 0 trơn, không gạch không chấm" kết hợp "thẳng hàng tuyệt đối".

## [2026-08-10] Tăng cỡ chữ NĂM SINH/SỐ CCCD lên 12pt để cân đối thị giác với các cột khác

Bối cảnh: người dùng gửi ảnh chụp bảng đã canh đúng (Courier Prime, căn giữa, số 0 tròn — xác nhận các quyết định trước đó đã đúng), nhưng nhận xét 2 cột NĂM SINH/SỐ CCCD nhìn nhỏ/mỏng hơn hẳn so với các cột còn lại dù cùng dùng cỡ chữ mặc định 11pt của bảng — yêu cầu tăng cỡ chữ cho cân đối.

Nguyên nhân: font monospace kiểu máy đánh chữ (Courier Prime) có x-height (chiều cao chữ thường) và độ đậm nét thấp hơn hẳn font nhân văn hiện đại (Be Vietnam Pro) dùng cho các cột còn lại — cùng 1 cỡ chữ (pt) nhưng 2 kiểu chữ này KHÔNG "trông to bằng nhau", đây là đặc điểm hình học vốn có của thiết kế font, không phải lỗi.

Quyết định: tăng `font-size` của 2 ô NĂM SINH/SỐ CCCD (`lenh-dieu-cong-tac-mau-in.ts`) từ kế thừa mặc định 11pt lên **12pt cố định** — bằng đúng cỡ chữ cột HỌ VÀ TÊN (cột duy nhất khác đã được tăng cỡ riêng từ trước). Đã tính lại để đảm bảo không tràn cột ở cỡ chữ mới: SỐ CCCD 12 chữ số × (12pt × tỷ lệ ký tự monospace 0.6) = 30.5mm, còn trong phần chữ khả dụng của cột rộng 36mm (36mm − 2×1.2mm đệm = 33.6mm); NĂM SINH 10 ký tự (`dd/mm/yyyy`) × cùng công thức = 25.4mm, còn trong 30mm − 2.4mm đệm = 27.6mm — cả 2 đều còn dư khoảng trống an toàn, không cần đổi lại độ rộng cột.

Lý do: đồng bộ cỡ chữ với cột Họ và tên là cách đơn giản nhất để đạt cân đối thị giác theo đúng yêu cầu, không cần thử nghiệm nhiều mức cỡ chữ khác nhau.

## [2026-08-10] Ô Ghi chú gộp hàng (rowspan): đổi từ vertical-align:middle sang flexbox để canh giữa dọc chắc chắn hơn

Bối cảnh: người dùng gửi ảnh chụp cận cảnh 2 hàng có ô Ghi chú gộp (rowspan, ví dụ "Từ ngày 11/08/2026 đến ngày 14/08/2026" gộp 2 hàng) — nội dung chưa canh giữa theo chiều dọc trong ô gộp, dù code đã có `vertical-align:middle` trên `<td rowspan>` từ trước.

Phân tích: `vertical-align:middle` trên `<td>` là cách chuẩn để canh giữa dọc trong ô bảng, nhưng với ô có `rowspan` (chiều cao ô = tổng nhiều hàng cộng lại), một số trường hợp trình duyệt/bộ máy render PDF tính toán "middle" không như kỳ vọng khi có nhiều dòng chữ tự động xuống dòng theo độ rộng cột — kết quả nhìn lệch lên trên. Đây là hạn chế thực tế đã quan sát được qua ảnh chụp, không phải lỗi cú pháp CSS.

Quyết định: đổi kỹ thuật canh giữa dọc từ `vertical-align:middle` (trên chính `<td>`) sang **flexbox trên `<div>` con** — cách làm phổ biến và đáng tin cậy hơn để canh giữa nội dung trong ô bảng: `<td style="padding:0; vertical-align:middle;"><div style="display:flex; align-items:center; justify-content:center; height:100%; padding:1.2mm 2mm;">...</div></td>`. `height:100%` trên phần tử con của `table-cell` là 1 trong số ít trường hợp CSS chính thức cho phép phần trăm chiều cao hoạt động đúng (trình duyệt đã tính xong chiều cao của hàng/ô gộp trước khi đặt nội dung con vào).

Đồng thời thêm `<br/>` cố định thay cho khoảng trắng trước "đến ngày" trong chuỗi hiển thị (chỉ tại điểm dựng HTML, không sửa hàm `ghiChuTram()` — hàm này vẫn trả về chuỗi thuần dùng cho logic gộp nhóm/so sánh) — đảm bảo LUÔN xuống đúng 2 dòng cố định, không còn phụ thuộc vào việc trình duyệt tự ngắt dòng theo độ rộng cột (vốn có thể cho ra số dòng khác nhau tùy độ dài ngày tháng cụ thể, làm ảnh hưởng thêm tới cảm giác "không canh giữa").

Lý do: kỹ thuật flexbox không phụ thuộc vào cách trình duyệt/bộ máy PDF diễn giải "middle" cho ô gộp nhiều hàng — canh giữa được tính trực tiếp trong khối flex, đáng tin cậy hơn hẳn so với chỉ dựa vào `vertical-align` của bảng.

## [2026-08-10] Canh giữa dọc toàn bộ cột còn lại của bảng thành viên mẫu Trạm

Bối cảnh: ngay sau khi sửa canh giữa dọc cho cột Ghi chú, người dùng yêu cầu áp dụng `vertical-align:middle` cho "các cột còn lại, toàn bộ bảng" — tức STT/Họ và tên/Nhiệm vụ (Năm sinh/Số CCCD đã có `vertical-align:middle` từ trước, Ghi chú vừa đổi sang flexbox).

Quyết định: thay vì thêm `vertical-align:middle` lặp lại vào từng `<td>` riêng lẻ, sửa 1 chỗ ở rule CSS dùng chung của cả bảng Trạm — `table.bang-in.bang-tram th, table.bang-in.bang-tram td { padding: 1.2mm 2mm; vertical-align: middle; }` (`cssKhung()` trong `lenh-dieu-cong-tac-mau-in.ts`) — ghi đè `vertical-align: top` mặc định (áp dụng chung cho MỌI bảng ở `table.bang-in th, table.bang-in td`). Vì selector `.bang-tram` có độ đặc hiệu cao hơn, thay đổi này CHỈ ảnh hưởng bảng thành viên mẫu Trạm — LĐX/GĐĐ/LĐCT Tuyến thường vẫn giữ nguyên `vertical-align: top` như trước, không bị ảnh hưởng.

Lý do: sửa tại 1 rule CSS dùng chung gọn hơn nhiều so với thêm `vertical-align:middle` lặp lại ở từng ô của từng hàng (STT/Họ và tên/Nhiệm vụ đều không có style riêng theo hàng, không cần thiết phải cá nhân hoá).

## [2026-08-10] Logo watermark mẫu in Trạm: tăng từ 80mm lên 120mm

Bối cảnh: người dùng yêu cầu logo mờ (watermark) ở mẫu in "Lệnh điều công tác Trạm" lớn hơn ("lớn hơn 3 size") — không rõ đơn vị cụ thể, đã hỏi lại để chốt con số chính xác. Người dùng chọn mức tăng vừa phải: 80mm → 120mm (tăng 50%).

Quyết định: thêm rule `.trang.mau-tram .hinh-mo { width: 120mm; height: 120mm; }` trong `cssKhung()` (`lenh-dieu-cong-tac-mau-in.ts`) — ghi đè kích thước mặc định dùng chung `.hinh-mo { width: 80mm; height: 80mm; ... }` (`cssLetterheadVaKy()` trong `mau-in-dung-chung.ts`) CHỈ cho trang mẫu Trạm (`.trang.mau-tram`). LĐX/GĐĐ/LĐCT Tuyến thường không đổi, vẫn giữ 80mm như trước.

Lý do: 120mm vẫn nằm an toàn trong khổ giấy A4 (210×297mm, mẫu Trạm luôn dùng A4) mà không lấn quá nhiều vào vùng chữ, đồng thời rõ hơn hẳn so với 80mm hiện tại.

## [2026-08-10] Nút "Sao chép" Lệnh điều công tác

Bối cảnh: người dùng muốn lập nhanh hơn khi có LĐCT tương tự lệnh đã lập trước đó. Thiết kế qua skill brainstorming, hỏi làm rõ 3 câu (phạm vi copy, có copy thành viên không, ngày ký lấy từ đâu), viết spec tại `docs/superpowers/specs/2026-08-10-clone-lenh-dieu-cong-tac-design.md`, được duyệt, triển khai ngay theo yêu cầu người dùng (không qua bước writing-plans riêng vì phạm vi nhỏ, spec đã đủ chi tiết để code thẳng).

Quyết định (theo spec, đã duyệt):
1. Nút icon "Sao chép" (lucide `Copy`) trong nhóm thao tác mỗi hàng `/lenh-dieu-cong-tac` (`page.tsx`), gated bằng `MA_QUYEN.CHUNG_TU_TAO`.
2. Bấm vào mở lại ĐÚNG `TaoLenhDieuCongTacDialog` hiện có (không tạo dialog riêng) với prop mới `duLieuSaoChep`.
3. Dialog Tạo dùng `useEffect` theo dõi `[open, duLieuSaoChep]`, `reset()` form khi có seed.
4. Copy: `diaDiemCongTac`, `mucDich`, `canCu`, `ngayDi`, `ngayVe`, `mauInTram`. Không copy: `ngayKy` (luôn = hôm nay), `thanhVien` (luôn rỗng — người dùng xác nhận rõ khi làm rõ yêu cầu), số hiệu (không phải input, luôn cấp mới).

**Điều chỉnh phát hiện lúc code (khác spec ban đầu):** spec ban đầu có ý định copy thêm `taiXeNhanVienId`/`phuongTienId` từ `LenhDieuXe` đang hoạt động của lệnh gốc. Khi code mới phát hiện: backend `tao()` (`lenh-dieu-cong-tac.service.ts`, dòng ~430-432) dùng `duLieu.thanhVien.find(tv => tv.nhanVienId === taiXeNhanVienId)!` — GIẢ ĐỊNH tài xế bắt buộc phải nằm trong chính danh sách `thanhVien` gửi lên (dấu `!` sẽ crash nếu không tìm thấy, không phải lỗi validate sạch). Đồng thời khối UI "Tài xế/Biển số" trong form Tạo chỉ hiện khi có ít nhất 1 thành viên đang chọn là tài xế (`taiXeUngVien.length > 0`, tính từ `fields` — tức từ `thanhVien`). Vì thành viên LUÔN để trống khi sao chép (theo quyết định ở trên), nếu vẫn set `taiXeNhanVienId`/`phuongTienId` qua `reset()` sẽ tạo ra trạng thái "ẩn" trong form — không có UI để sửa/xoá, và nếu người dùng không tình cờ thêm đúng người đó làm thành viên trước khi Lưu thì sẽ gây lỗi lúc tạo. Quyết định: **KHÔNG copy `taiXeNhanVienId`/`phuongTienId`** — người dùng tự chọn lại tài xế sau khi thêm thành viên, đúng luồng UX bình thường của "Tạo mới". Đã cập nhật `docs/superpowers/specs/2026-08-10-clone-lenh-dieu-cong-tac-design.md`... (giữ nguyên file spec làm hồ sơ quyết định gốc, xem ghi chú trong code — `tao-lenh-dieu-cong-tac-dialog.tsx` comment tại effect seed — để tránh 2 nguồn xung đột nhau).

File đã sửa: `apps/web/app/lenh-dieu-cong-tac/tao-lenh-dieu-cong-tac-dialog.tsx` (thêm prop `duLieuSaoChep` + effect seed + dòng mô tả trong `DialogDescription` khi đang sao chép), `apps/web/app/lenh-dieu-cong-tac/page.tsx` (thêm state `ldctDangSaoChep`, nút icon Sao chép, truyền prop, xoá state lúc đóng dialog). Không đổi backend/Zod/Prisma.

## [2026-08-10] Cải thiện thứ tự nhập liệu form Lập lệnh điều công tác

Bối cảnh: người dùng yêu cầu đánh giá thứ tự điền/chọn thông tin khi lập LĐCT mới có thuận lợi không. Rà lại `tao-lenh-dieu-cong-tac-dialog.tsx`, nêu 3 điểm cấn: (1) "Ngày lập" (ngày ký văn bản) đứng chung 1 hàng 3 cột với "Ngày đi"/"Ngày về" (ngày công tác thực tế) — cùng hình thức ô ngày, dễ sửa nhầm dù ý nghĩa khác hẳn; (2) khối "Tài xế/Biển số xe" chỉ hiện SAU khi đã thêm 1 thành viên có vai trò tài xế vào danh sách, không có gợi ý báo trước cơ chế này; (3) "Danh sách thành viên" đặt sau Địa điểm/Mục đích/Ngày — cân nhắc đưa lên trước nếu thực tế Văn thư thường biết "ai đi" trước "đi đâu, làm gì".

Đã hỏi lại người dùng riêng cho điểm (3) (thứ tự thực tế công việc, đây là điều chỉ người dùng biết): xác nhận **vẫn biết địa điểm/mục đích trước** — giữ nguyên vị trí khối Thành viên, không đổi.

Quyết định — chỉ áp dụng 2 điều chỉnh (1) và (2) cho `tao-lenh-dieu-cong-tac-dialog.tsx`:
1. Tách "Ngày lập" khỏi hàng 3 cột chung với Ngày đi/Ngày về (hàng đó nay chỉ còn 2 cột: Ngày đi/Ngày về). "Ngày lập" chuyển xuống cuối form, ngay trước `DialogFooter` (gần nút Lưu) — thu hẹp bề rộng (`max-w-[10rem]`) + thêm chú thích "Mặc định hôm nay, hiếm khi cần sửa." để báo hiệu đây là metadata phụ, không phải thông tin chuyến đi chính.
2. Thêm 1 dòng chú thích trong khối "Danh sách nhân viên đi công tác": "Nếu đoàn có tài xế, thêm người đó vào danh sách bên dưới — ô chọn xe sẽ tự hiện ra." — giải thích trước cơ chế tự động phát hiện tài xế từ danh sách thành viên.

Lưu ý phạm vi: **chỉ sửa dialog Tạo** (`tao-lenh-dieu-cong-tac-dialog.tsx`), đúng phạm vi câu hỏi người dùng ("khi lập lệnh điều công tác MỚI"). Dialog Sửa (`sua-lenh-dieu-cong-tac-dialog.tsx`) là component tách biệt hoàn toàn (đã ghi nhận từ trước, xem mục "Nút Sao chép") — hiện chưa đồng bộ theo layout mới này, có thể lệch thứ tự nếu người dùng mở cả 2 so sánh. Chưa sửa Dialog Sửa vì không nằm trong phạm vi được hỏi — cân nhắc đồng bộ sau nếu người dùng thấy cần.

## [2026-08-10] Chống tràn mẫu in khi Nơi đi/Nơi đến/Địa điểm công tác quá dài

Bối cảnh: người dùng hỏi "Nơi đi, nơi đến của LĐCT, công lệnh nếu dài quá sẽ ảnh hưởng mẫu in — giải pháp nào để xử lý". Rà lại code trước khi trả lời (không đoán):

- LĐX (mẫu in độc lập, `lenh-dieu-xe-mau-in.ts`) đã có xử lý này TỪ TRƯỚC (quyết định 2026-08-07 "Xử lý trường hợp dữ liệu tự do quá dài") — class `.gia-tri` có `overflow-wrap: break-word; word-break: break-word;`.
- GĐĐ (Công lệnh kiêm giấy đi đường, ô "Nơi đi và đến" trong `noiDungMatTruocGdd`) và bảng thành viên LĐCT Tuyến thường (cột Họ tên/Chức vụ) đều dùng chung rule `table.bang-in th, table.bang-in td` trong `cssKhung()` (`lenh-dieu-cong-tac-mau-in.ts`) — rule này **CHƯA có** `overflow-wrap`/`word-break`. Đây là lỗ hổng thật: nếu "Nơi đi"/"Nơi đến" là 1 chuỗi rất dài KHÔNG có khoảng trắng (vd dán nhầm văn bản dài, hoặc địa danh ghép liền không dấu cách), trình duyệt mặc định không ngắt được giữa 1 "từ" liền mạch — có thể đẩy bảng tràn ra ngoài lề trang khi in PDF. Văn bản dài NHƯNG bình thường (có dấu cách, kể cả rất dài) thì KHÔNG bị ảnh hưởng — vẫn tự xuống dòng gọn trong ô như thường lệ ngay cả khi chưa sửa gì (hành vi wrap mặc định của trình duyệt tại dấu cách).

Quyết định — 1 lần sửa duy nhất, áp dụng đồng thời cho mọi nơi dùng `table.bang-in` (không cần sửa riêng từng chỗ):
1. Thêm `overflow-wrap: break-word;` vào rule `html, body` trong `cssKhung()` — phòng ngừa cả trường hợp hiếm hơn: 1 chuỗi liền mạch cực dài nằm trong đoạn văn `<p>` (không phải bảng), ví dụ câu "Giám đốc ... phân công ... tại **{địa điểm công tác}**." của LĐCT Tuyến thường.
2. Thêm `overflow-wrap: break-word; word-break: break-word;` vào rule dùng chung `table.bang-in th, table.bang-in td` — sửa 1 chỗ, có hiệu lực ngay cho bảng "Nơi đi và đến" của GĐĐ, bảng thành viên LĐCT Tuyến thường, và bất kỳ bảng nào khác dùng class `bang-in` sau này. Các cột đã có `white-space: nowrap` riêng (Ngày sinh/Số CCCD mẫu Trạm, Ngày đi-về riêng mẫu Tuyến thường...) KHÔNG bị ảnh hưởng — `nowrap` luôn được ưu tiên hơn (đây là dữ liệu định dạng cố định, đúng ý muốn giữ nguyên 1 dòng).

Không thêm giới hạn độ dài (Zod `.max()`) cho các trường này ở lượt này — đây là quyết định chính sách (giới hạn bao nhiêu ký tự là hợp lý, chặn cứng hay chỉ cảnh báo) cần người dùng xác nhận riêng, không tự quyết. Có thể cân nhắc thêm sau như một lớp phòng ngừa bổ sung (ngăn nhập liệu bất thường từ đầu) nếu người dùng thấy cần, độc lập với bản vá CSS này (CSS đã đủ để đảm bảo KHÔNG BAO GIỜ tràn trang dù dữ liệu dài bao nhiêu).

## [2026-08-10] Form Lập LĐCT: sắp xếp lại thứ tự + thêm trường "Nơi đi"

Bối cảnh: người dùng yêu cầu trực tiếp thứ tự mới cho form Lập lệnh điều công tác: Loại mẫu in → Ngày lập → Nơi đi (mặc định P. Long Xuyên, An Giang) → Nơi đến → Mục đích → Ngày đi/về chung đoàn → Danh sách nhân viên → Tài xế. Trong đó "Nơi đi" là trường HOÀN TOÀN MỚI — trước đây form không có, "nơi đi" luôn tự động lấy từ Danh mục Địa điểm (`diemDiMacDinh`) cho mọi Giấy đi đường sinh kèm, không sửa được trừ phi sửa từng GĐĐ riêng lẻ (mà thực tế CHƯA có màn hình sửa GĐĐ nào — trường `GiayDiDuong.noiDiRieng` tồn tại sẵn trong schema nhưng chưa từng được ghi giá trị ở bất kỳ đâu trong code, hoàn toàn "chết").

Quyết định (kiến trúc): KHÔNG thêm cột mới vào bảng `LenhDieuCongTac` — tận dụng đúng ô `GiayDiDuong.noiDiRieng` có sẵn (đúng vị trí override mà logic đọc `gdd.noiDiRieng ?? noiDiMacDinh` đã kỳ vọng từ trước), chỉ cần bắt đầu GHI giá trị vào đó lúc tạo.

1. **`taoLenhDieuCongTacSchema`** (`packages/validation`): thêm `noiDi?: string` (tùy chọn — để trống giữ nguyên hành vi cũ, fallback về `noiDiMacDinh`).
2. **`lenh-dieu-cong-tac.service.ts`, `tao()`**: trong vòng lặp tạo từng thành viên, `giayDiDuong.create()` nay ghi thêm `noiDiRieng: duLieu.noiDi ?? null` — 1 giá trị "Nơi đi" người dùng nhập áp dụng ĐỒNG LOẠT cho mọi GĐĐ của đoàn (đúng ý "ghi đè 1 lần cho cả lệnh", không phải sửa từng người). Đồng thời sửa Lệnh điều xe sinh kèm (nếu đoàn có tài xế): `noiDi: duLieu.noiDi ?? noiDiMacDinh` (trước đó luôn cứng `noiDiMacDinh`, bỏ qua override) — để LĐX và các GĐĐ cùng đoàn LUÔN thống nhất 1 "nơi đi", không lệch nhau.
3. **Frontend** (`tao-lenh-dieu-cong-tac-dialog.tsx`): thêm ô "Nơi đi" (`ComboboxVanBan`, dùng chung gợi ý Danh mục Địa điểm với "Nơi đến"). Giá trị mặc định KHÔNG hardcode chuỗi "P. Long Xuyên, An Giang" trong code — 1 effect mới đọc địa điểm đang đánh dấu `diemDiMacDinh=true` trong Danh mục (qua `useDanhSachDiaDiem` đã fetch sẵn cho gợi ý) và điền sẵn tên đầy đủ của địa điểm đó, chỉ điền khi ô đang trống (không ghi đè nếu người dùng đã tự gõ hoặc đã được điền từ luồng "Sao chép"). Lý do không hardcode: giá trị "điểm đi mặc định" có thể đổi qua giao diện `/dia-diem` bất cứ lúc nào — hardcode sẽ lệch khỏi cấu hình thật.
4. **Đổi nhãn (không đổi tên trường)**: "Địa điểm công tác" → "Nơi đến" trong UI, để đi cặp đúng nghĩa với "Nơi đi" mới. Trường `diaDiemCongTac` trong schema/DB/API giữ nguyên tên và ý nghĩa cũ (vẫn là "nơi đến" mặc định của mọi GĐĐ/LĐX sinh kèm) — chỉ đổi chữ hiển thị, không phải đổi dữ liệu.
5. **Thứ tự cuối cùng của form**: Loại mẫu in + Ngày lập (2 cột chung 1 hàng) → Nơi đi → Nơi đến → Mục đích → Ngày đi/Ngày về (2 cột) → Danh sách nhân viên → Tài xế/Biển số (giữ nguyên vị trí cuối, chỉ hiện khi có tài xế trong đoàn).

Phạm vi: chỉ sửa dialog Tạo + backend `tao()`, KHÔNG đụng dialog Sửa (`sua-lenh-dieu-cong-tac-dialog.tsx`/`suaLenhDieuCongTacSchema`/hàm `sua()`) — nhất quán với các quyết định phạm vi trước đó trong ngày (nút Sao chép, sắp xếp thứ tự) đều chỉ giới hạn ở luồng "lập lệnh mới" theo đúng yêu cầu người dùng.

## [2026-08-10] Chuẩn hóa cách chèn gợi ý cho "Nơi đến"/"Nơi đi" — sửa dữ liệu hiển thị không nhất quán

Bối cảnh: người dùng gửi 3 ảnh chụp mẫu in cho thấy "Nơi đến" hiển thị không nhất quán giữa các lệnh — có khi ghi đầy đủ ("Đồng Tháp, Tây Ninh, TP. Hồ Chí Minh"), có khi viết tắt lẫn lộn ("Đ.Tháp (CL, MT), Tây Ninh (LA), TP.HCM"), có khi chỉ toàn chữ tắt ("CL, MT, LA, BT"). Đã đề xuất 3 phương án (A: chuẩn hóa cách chèn gợi ý — nhẹ, làm ngay được; B: cho chọn nhiều địa điểm dạng multi-select thay ô văn bản tự do; C: tự chuẩn hóa lại chuỗi lúc lưu). Người dùng chọn **Phương án A**.

Rà lại `ComboboxVanBan` trước khi sửa (không đoán): bấm chọn 1 gợi ý vốn đã chèn sạch (`onChange(g.value)` = tên đầy đủ trong Danh mục, không kèm phần viết tắt `phu`) — nhưng hành vi này **THAY THẾ TOÀN BỘ** giá trị đang có. Với lệnh chỉ đi 1 nơi thì không sao, nhưng khi đoàn đi NHIỀU tỉnh cùng lúc, bấm gợi ý cho địa điểm thứ 2 sẽ xóa mất địa điểm thứ 1 vừa chọn/gõ — nên trên thực tế người dùng buộc phải bỏ qua gợi ý, gõ tay HOÀN TOÀN chuỗi nhiều địa điểm. Đây mới là nguyên nhân thật của việc trôi định dạng (gõ tay thì mỗi lần mỗi kiểu viết tắt khác nhau), không phải do gợi ý chèn sai.

Quyết định: thêm prop `choPhepNhieu?: boolean` (mặc định `false`, giữ nguyên hành vi thay thế ở mọi nơi khác) cho `ComboboxVanBan`. Khi bật, bấm chọn 1 gợi ý sẽ **NỐI THÊM** vào cuối giá trị đang có (phân cách bằng ", "), bỏ qua nếu địa điểm đó đã có sẵn trong chuỗi (so khớp theo từng đoạn tách bởi dấu phẩy) — cho phép gõ toàn bộ 1 chuỗi nhiều địa điểm chỉ bằng cách bấm gợi ý lần lượt, mỗi lần đều chèn đúng 1 định dạng cố định (nguyên tên đầy đủ trong Danh mục, không tự thêm chữ viết tắt).

Áp dụng `choPhepNhieu` cho: "Nơi đi" và "Nơi đến" trong dialog Tạo LĐCT (`tao-lenh-dieu-cong-tac-dialog.tsx`), và "Địa điểm công tác" trong dialog Sửa LĐCT (`sua-lenh-dieu-cong-tac-dialog.tsx`) — cả 2 luồng đều có thể liên quan đến đoàn đi nhiều tỉnh. KHÔNG bật cho Nơi đi/Nơi đến của LĐX (`tao-lenh-dieu-xe-dialog.tsx`/sửa) — 1 chuyến xe thường chỉ có 1 điểm đi/đến, giữ nguyên hành vi thay thế mặc định để tránh đổi hành vi bất ngờ ở nơi không cần.

Lý do không chọn phương án khác: B (multi-select) và C (tự chuẩn hóa lúc lưu) đều đúng hướng nhưng tốn công hơn nhiều (đổi mô hình dữ liệu hoặc thêm tầng chuẩn hóa/parse chuỗi) — người dùng chủ động chọn mức nhẹ nhất, đủ giải quyết nguyên nhân gốc (gõ tay vì gợi ý không dùng được cho nhiều địa điểm) mà không phải đổi cấu trúc dữ liệu hiện tại. Không sửa lại các chứng từ CŨ đã lưu chuỗi không nhất quán từ trước — thay đổi này chỉ có hiệu lực cho các lệnh lập/sửa MỚI từ nay trở đi.

## [2026-08-12] Mẫu in "Phát hành, thu hồi vé ế" — loại mẫu in thứ 3 cho LĐCT

Bối cảnh: người dùng gửi 9 ảnh chụp LĐCT thật đang dùng trong thực tế (làm thủ công bằng Word trước khi có app), lúc đầu tưởng chỉ để minh họa cho vấn đề "Nơi đến" không nhất quán, nhưng soi kỹ phát hiện đây là bằng chứng cho 1 loại mẫu in thứ 3 hoàn toàn chưa được app hỗ trợ — dùng cho các chuyến đi tỉnh khác để "phát hành vé, thu tiền, nhận vé trúng và thu hồi vé ế" (khác `TUYEN_THUONG`/`TRAM` đã có sẵn qua cột `mauInTram: boolean` trước đó). Đã brainstorm đầy đủ (khám phá → hỏi từng câu → đề xuất 3 phương án → viết spec `docs/superpowers/specs/2026-08-12-mau-in-phat-hanh-thu-hoi-ve-e-design.md` → duyệt) trước khi code, theo đúng quy trình bắt buộc cho việc thêm tính năng mới.

Nhân tiện làm rõ 1 câu hỏi phụ trong lúc brainstorm: người dùng nhắc tới "Lệnh điều công tác riêng cho tài xế (trạm TPHCM)" — sau khi hỏi kỹ, xác nhận đây **không phải nhu cầu tính năng mới**: chỉ cần lập 1 LĐCT riêng (hoặc dùng nút Sao chép có sẵn) với tài xế là thành viên duy nhất, để trống Căn cứ (vì mẫu in khác không cần các căn cứ như đoàn chính) — công cụ hiện có đã đủ đáp ứng, không code thêm gì.

**Quyết định kiến trúc dữ liệu:** đổi `LenhDieuCongTac.mauInTram: Boolean` thành `loaiMauIn: LoaiMauInLenhDieuCongTac` (enum `TUYEN_THUONG` / `TRAM` / `PHAT_HANH_THU_HOI_VE_E`), migration viết tay backfill (`mauInTram=true` → `TRAM`, `false` → `TUYEN_THUONG`, không có bản ghi cũ nào tự nhận giá trị mới) rồi xóa cột cũ. Đổi tên xuyên suốt: Zod (`tao`/`sua` schema), backend service (`tao()`/`sua()`/`chiTiet()`), mẫu in (`lenh-dieu-cong-tac-mau-in.ts`), hook + toàn bộ frontend (2 dialog, trang chi tiết, trang danh sách).

**Quyết định mẫu in** (đối chiếu sát 7/9 ảnh mẫu "vé ế" thật):
1. Hàm `noiDungTrangLenhDieuCongTacTuyenThuong()` dùng CHUNG cho cả `TUYEN_THUONG` và `PHAT_HANH_THU_HOI_VE_E` (chỉ khác tiêu đề + câu mở đầu + 1 cột bảng) — KHÔNG tách hàm riêng như Trạm, vì bảng/khối ký giống hệt nhau, tách sẽ trùng lặp ~90% code không cần thiết. `TRAM` vẫn giữ hàm riêng (`noiDungTrangLenhDieuCongTacTram`) vì khác biệt thật sự lớn (bảng 6 cột, cách gộp nhóm theo ngày).
2. `PHAT_HANH_THU_HOI_VE_E` thêm phụ đề 2 dòng dưới tiêu đề chính, lấy NGUYÊN VĂN ô Mục đích (dòng 1) + Nơi đến (dòng 2) đã có sẵn trong form — người dùng chọn không hardcode câu chữ cố định (khác với mẫu Trạm), để linh hoạt cho cả trường hợp chỉ "phát hành" hoặc chỉ "thu hồi vé ế" riêng lẻ.
3. Câu văn thân bài đổi từ "phân công nhiệm vụ đi công tác tại X." (mẫu Tuyến thường trước đây HOÀN TOÀN không dùng trường Mục đích khi in, dù form đã thu thập từ trước) thành "điều động và phân công nhiệm vụ đi công tác {Mục đích, chữ đầu viết thường} tại X." — dùng lại đúng 1 giá trị Mục đích cho cả phụ đề lẫn câu văn (ảnh mẫu thật có sai khác nhỏ giữa 2 chỗ, khả năng chỉ là gõ tay không nhất quán của quy trình cũ — cố tình KHÔNG lặp lại kiểu thiếu nhất quán này, cùng tinh thần với bản vá "chuẩn hóa Nơi đến" ở mục trên).
4. Bảng thành viên `PHAT_HANH_THU_HOI_VE_E` chỉ 3 cột (STT/Họ và tên/Chức vụ), KHÔNG có cột "Ngày đi – về (riêng)" như Tuyến thường — khớp đúng 7 ảnh mẫu thật.
5. Trưởng đoàn (`laTruongDoan`, dùng chung field với Trạm) mở rộng áp dụng được cho cả `PHAT_HANH_THU_HOI_VE_E` — nếu đánh dấu thì in đậm cả dòng, nhưng GIỮ NGUYÊN chức vụ thật ở cột Chức vụ (không ghi đè thành nhãn "Trưởng đoàn" như mẫu Trạm, vì cột này ở mẫu vé ế đang hiển thị chức vụ thật của từng người, ghi đè sẽ mất thông tin).
6. `chonKhoGiayLenhDieuCongTac()`: chỉ `TRAM` mới luôn ép A4 (bảng rộng hơn vì có CCCD); `PHAT_HANH_THU_HOI_VE_E` dùng chung ngưỡng độ dài nội dung với Tuyến thường (không cần luôn A4).

**Giao diện:** combobox "Loại lệnh điều công tác" (đã có ở dialog Tạo, tên field đổi sang `loaiMauIn`) mở từ 2 lên 3 lựa chọn; thêm mới cùng combobox này vào dialog Sửa (trước đây dialog Sửa ĐÃ CÓ sẵn combobox 2 lựa chọn tương tự — chỉ cần đổi field name + thêm option thứ 3, không phải xây từ đầu). Trang danh sách thêm badge riêng "Vé ế" màu tím (violet) — cố tình khác cả màu vàng (badge "Trạm") lẫn màu xanh dương chủ đạo của giao diện để không lẫn.

**Không làm:** không sửa dữ liệu các LĐCT cũ đã lập (giữ nguyên `TUYEN_THUONG`/`TRAM` theo backfill); không động tới module "Phân công lịch công tác" (Trạm/Tuyến/trực vé ế theo lịch định kỳ) vẫn đang ở trạng thái CHƯA BUILD như `CLAUDE.md` đã ghi — đây chỉ là thêm 1 loại mẫu in cho luồng lập LĐCT thủ công hiện có.

**Sửa tiếp (cùng ngày) — mẫu Tuyến thường vốn đã sai thể thức từ trước, không liên quan riêng đến việc thêm loại vé ế:** người dùng phản hồi "mẫu Tuyến thường chưa giống thể thức và định dạng mẫu in đã gửi". Đối chiếu lại kỹ chữ trong 2 ảnh mẫu Tuyến thường thật (số 353, 326) với code, phát hiện 3 lỗi có sẵn từ trước (không phải do đợt sửa `loaiMauIn` gây ra, nhưng lộ rõ khi soi kỹ cùng lúc với 7 ảnh vé ế):

1. **Câu văn thân bài dùng nguyên `cauHinhDonVi.tenCoQuanDong1/2` (lưu VIẾT HOA TOÀN BỘ dành riêng cho khối letterhead, vd "CÔNG TY TNHH MỘT THÀNH VIÊN") ghép thẳng vào giữa câu văn thường** → in ra cụm HOA LỚN giữa câu, sai thể thức, đồng thời thừa chữ "Giám đốc" ở đầu (ảnh mẫu thật KHÔNG có chữ này, chủ ngữ câu chính là tên công ty). Sửa: hardcode cụm cố định "Công ty TNHH MTV Xổ số kiến thiết An Giang" đúng case thường như ảnh mẫu thật (giống cách mẫu Trạm đã hardcode trước đó, xem mục "Mẫu in Trạm: hardcode dòng Giám đốc Công ty..." — chỉ khác 1 chữ "k" thường/"K" hoa vì mỗi loại mẫu bám đúng ảnh mẫu thật của chính nó, không đồng bộ ép giống nhau). Áp dụng luôn cho cả câu văn mẫu vé ế (bug y hệt, mới phát sinh khi vừa code phần vé ế, tự sửa kèm luôn).
2. **Tiêu đề `<div class="tieu-de-chinh">Lệnh điều công tác</div>` không tự in hoa** — class `.tieu-de-chinh` dùng chung không có `text-transform:uppercase` (khác GDD/Phần kê thanh toán có override riêng, khác Trạm hardcode sẵn chuỗi hoa) → in ra "Lệnh điều công tác" thay vì "LỆNH ĐIỀU CÔNG TÁC" như mọi ảnh mẫu thật. Sửa: viết thẳng chuỗi hoa toàn bộ trong code, nhất quán cách làm với mẫu Trạm.
3. **Tiêu đề cột bảng chưa viết hoa** ("Họ và tên"/"Chức vụ" thay vì "HỌ VÀ TÊN"/"CHỨC VỤ" như ảnh mẫu) và **cụm "các Đ/c"** dùng viết tắt trong khi ảnh mẫu Tuyến thường ghi đầy đủ "các đồng chí" (ảnh vé ế thì đúng là viết tắt "Đ/c") — sửa tiêu đề cột thành chữ hoa, và tách riêng cụm "đồng chí"/"Đ/c" theo đúng từng loại mẫu thay vì dùng chung 1 cách viết.

Chưa thể tự render PDF để xác nhận trực quan trong môi trường làm việc (sandbox không có Chromium) — các sửa đổi trên dựa vào đối chiếu chữ trong ảnh mẫu thật với chuỗi HTML trong code, không phải đoán. Cần người dùng xác nhận lại sau khi chạy thật.

**Sửa tiếp (cùng ngày) — canh lề + canh đều 2 bên cho mẫu Tuyến thường/Vé ế:** người dùng yêu cầu áp canh lề và căn đều (justify) giống ảnh mẫu thật đã gửi.

Hỏi trước khi sửa: khối letterhead 2 cột của LĐCT Tuyến thường/Vé ế dùng CHUNG kỹ thuật với LĐX — mà LĐX từng thử đúng lề Nghị định 30 (30mm trái) trên khổ A5 và phải RÚT LẠI vì chữ letterhead phải thu nhỏ còn 7-8pt, khó đọc (xem quyết định 2026-08-07 "Rút lại"). Khác với mẫu Trạm (luôn ép khổ A4, không gặp vấn đề này), LĐCT Tuyến thường/Vé ế tự động chọn A5 hoặc A4 tùy độ dài nội dung (`chonKhoGiayLenhDieuCongTac`) — áp lề rộng cứng cho mọi trường hợp có nguy cơ lặp lại đúng lỗi đã gặp ở LĐX trên các lệnh ngắn/ít người (tự động ở A5).

Người dùng chọn: **giữ lề gọn (10mm mặc định) khi khổ A5, chỉ áp lề Nghị định 30 (20/20/20/30mm, giống mẫu Trạm) khi khổ A4.** Triển khai: `noiDungTrangLenhDieuCongTac()`/`noiDungTrangLenhDieuCongTacTuyenThuong()` nhận thêm tham số `khoGiay` (trước đây chỉ dùng để chọn kích thước `.trang` ở tầng CSS ngoài, chưa truyền vào hàm dựng nội dung) — set `padding: 20mm 20mm 20mm 30mm` bằng inline style trên `<div class="trang">` khi `khoGiay === "A4"`, để nguyên CSS mặc định `10mm 10mm 8mm 10mm` khi A5. Không đụng tới `cssKhung()` dùng chung (tránh ảnh hưởng GĐĐ/LĐX vốn không nằm trong yêu cầu lần này).

Đồng thời thêm `text-align: justify` cho đoạn văn thân bài (`cauMoDau`) và bật `canhDeu=true` khi gọi `canCuHtml()` (đoạn Căn cứ, nếu có nhập) — nhất quán với cách mẫu Trạm đã căn đều 2 bên đoạn văn chính của nó từ trước.

**Sửa tiếp (2026-08-13) — 2 khác biệt còn lại so với ảnh mẫu thật (số 337):**

1. **Thụt lề đầu đoạn**: đoạn `cauMoDau` (câu "Công ty ... phân công nhiệm vụ...") thiếu `text-indent`, in sát lề trái — thêm `text-indent: 8mm` (đúng giá trị đã dùng cho đoạn văn mẫu Trạm và `canCuHtml()`, thống nhất 1 mức thụt lề cho mọi đoạn văn trong toàn bộ mẫu in LĐCT).
2. **Dư cột "NGÀY ĐI – VỀ (RIÊNG)"**: cột này trước đây LUÔN hiện với mọi lệnh `TUYEN_THUONG`, kể cả khi không ai trong đoàn đi/về khác ngày chung — ảnh mẫu thật (số 337, không ai đi riêng ngày) không có cột này, chỉ 3 cột STT/Họ và tên/Chức vụ giống hệt cách vé-ế đã làm trước đó. Sửa thành **điều kiện**: chỉ hiện cột (header + ô) khi `thanhVien.some(tv => tv.ngayDiRieng || tv.ngayVeRieng)` — có ít nhất 1 người thực sự đi riêng ngày. Giữ được tính năng khi cần (đoàn có người về sớm/đi trễ hơn), khớp đúng ảnh mẫu khi không cần (trường hợp phổ biến nhất — cả đoàn đi về cùng ngày).

**Sửa tiếp (cùng ngày) — thụt lề mọi đoạn văn + tài xế in "Nhân viên Lái xe":**

1. Thụt lề đầu đoạn `text-indent: 8mm` được thêm cho CẢ 2 đoạn văn của mẫu Tuyến thường/Vé ế (trước đó chỉ đoạn `cauMoDau` có, đoạn `cauNgay` — "Ngày X gồm có các đồng chí sau đây:" — vẫn thẳng lề trái) — nhất quán với quy ước "mọi đoạn văn đều thụt đầu dòng" đã áp dụng cho mẫu Trạm trước đó (xem quyết định 2026-08-10).
2. **Tài xế in "Nhân viên Lái xe" ở cột Chức vụ** (khớp đúng ảnh mẫu 337: dòng tài xế Trịnh Hoàng Mỹ ghi "Nhân viên Lái xe" dù hồ sơ nhân viên có thể ghi chức vụ khác, vd "Nhân viên"). Thêm field `laTaiXe: boolean` vào `ThanhVienDeIn` — tính ở `layDuLieuInLenh()` (`lenh-dieu-cong-tac.service.ts`) bằng cách so khớp `thanhVien.id === ldxHoatDong?.thanhVienTaiXeId` (LĐX con đang hoạt động của đoàn, nếu có — đã tồn tại sẵn field `thanhVienTaiXeId` từ trước, chỉ cần đọc thêm). Phải tính `ldxHoatDong` TRƯỚC bước map `thanhVienDangCo` (trước đó tính SAU, đảo lại thứ tự). Ở `noiDungTrangLenhDieuCongTacTuyenThuong()`: cột Chức vụ hiển thị `tv.laTaiXe ? "Nhân viên Lái xe" : tv.chucVu` — CHỈ ghi đè khi in, không đụng tới `chucVu` thật lưu trong CSDL. Không áp dụng cho mẫu Trạm (mẫu đó dùng cột "Nhiệm vụ" ghi "Trưởng đoàn"/"Thành viên", không liên quan tới chức vụ nghề nghiệp).

## [2026-08-13] Checkbox "Lập kèm lệnh điều xe" ở dialog Tạo/Sửa LĐCT

Bối cảnh: field `laTaiXe` mới thêm (mục trên) khiến việc có/không tạo LĐX ảnh hưởng trực tiếp tới nội dung in ("Nhân viên Lái xe" hay chức vụ thật). Người dùng nêu tình huống thật: đoàn khám sức khỏe đi xe thuê, có 1 người là tài xế của công ty nhưng KHÔNG lái xe chuyến này (đi như thành viên bình thường) — LĐCT lúc này không bắt buộc phải có LĐX kèm theo.

Hệ thống trước đó đã hỗ trợ được việc này về mặt kỹ thuật (`taiXeNhanVienId` là field tùy chọn, để trống thì không tạo LĐX) nhưng UX dễ gây nhầm: mỗi khi thêm 1 nhân viên có đánh dấu "là tài xế" vào đoàn, hệ thống **tự động điền sẵn** người đó vào ô "Tài xế" (+ biển số xe thường dùng) — người dùng phải tự nhớ xóa lựa chọn này nếu là trường hợp xe thuê. Hỏi lại người dùng có nên bỏ hành vi tự động điền sẵn này không — người dùng xác nhận **giữ nguyên** (đa số chuyến vẫn dùng xe công ty, trường hợp xe thuê ít gặp hơn) nhưng muốn thêm 1 **checkbox tường minh** để bật/tắt rõ ràng việc có lập LĐX hay không, mặc định BẬT khi đoàn có tài xế (đúng theo hành vi mặc định người dùng xác nhận: "mặc định nên tạo LĐX vì trường hợp tài xế không lái xe rất ít").

Quyết định — triển khai ở CẢ 2 dialog (`tao-lenh-dieu-cong-tac-dialog.tsx`, `sua-lenh-dieu-cong-tac-dialog.tsx`):

1. Thêm state `coLapLenhDieuXe: boolean` + checkbox "Trong đoàn có tài xế — lập kèm lệnh điều xe" ngay phía trên 2 ô Tài xế/Biển số hiện có (khối chỉ hiện khi `taiXeUngVien.length > 0`, không đổi). Checked → hiện 2 ô như cũ. Bỏ check → ẩn 2 ô, thay bằng câu chú thích "Sẽ không lập lệnh điều xe (...)", đồng thời 1 effect xóa `taiXeNhanVienId`/`phuongTienId` về rỗng (`undefined` ở dialog Tạo, `null` ở dialog Sửa — đúng quy ước 3 trạng thái `null`/`undefined`/chuỗi đã có sẵn của schema `sua-lenh-dieu-cong-tac.schema.ts`, để backend hiểu là "bỏ tài xế" chứ không phải "không đổi").
2. **Giá trị mặc định khác nhau giữa 2 dialog** — đây là điểm quan trọng nhất:
   - Dialog Tạo (lệnh mới): mặc định `true` — ưu tiên hành vi phổ biến (đoàn có tài xế → tạo LĐX), khớp yêu cầu rõ ràng của người dùng.
   - Dialog Sửa (lệnh đã lưu): mặc định lấy ĐÚNG theo trạng thái hiện có của lệnh (`Boolean(ldxDangHoatDong)`, tính trong effect `reset()` khi mở dialog) — KHÔNG luôn mặc định `true`, để tránh khi người dùng chỉ mở lệnh ra xem/sửa 1 chi tiết khác (không liên quan tới tài xế) mà hệ thống tự ý bật lại checkbox và đòi hỏi chọn tài xế cho 1 lệnh trước đó đã cố tình để "không có LĐX".
3. **Tự bật lại checkbox khi có tài xế MỚI xuất hiện trong đoàn** (không phải lúc mở dialog) — dùng `useRef` theo dõi số `taiXeUngVien` trước đó, chỉ set `true` khi số này chuyển từ 0 sang > 0 (nghĩa là vừa thêm người tài xế đầu tiên vào đoàn) — không ghi đè lựa chọn thủ công của người dùng khi họ đã bỏ check rồi thêm/bớt các thành viên KHÁC (không phải tài xế) sau đó. Ở dialog Sửa, lần chạy đầu tiên của effect này (ngay sau `reset()`) chỉ ghi nhận "nền" (không áp dụng logic tự bật) nhờ cờ `daGhiNhanTaiXeBanDau` — tránh ghi đè giá trị mặc định vừa tính chính xác ở bước 2.
4. Auto-chọn tài xế khi thêm 1 người "là tài xế" vào danh sách (hành vi có sẵn, giữ nguyên theo yêu cầu người dùng) nay có thêm điều kiện `coLapLenhDieuXe` — không tự điền nếu checkbox đang tắt.

Backend KHÔNG cần sửa gì thêm: gửi `taiXeNhanVienId: null` khi sửa đã có sẵn logic "bỏ tài xế → hủy LĐX" trong `lenh-dieu-cong-tac.service.ts` (`sua()`), gửi `undefined` khi tạo mới đơn giản là không tạo LĐX (logic `tao()` đã điều kiện theo `duLieu.taiXeNhanVienId` có mặt hay không).

**Sửa tiếp (cùng ngày) — bỏ check rồi check lại không tự điền lại tài xế/xe:** phát hiện ngay sau khi triển khai — effect xóa `taiXeNhanVienId`/`phuongTienId` lúc bỏ check hoạt động đúng, nhưng lúc check LẠI không có gì tự điền lại (người dùng phải tự chọn lại từ đầu dù đoàn vẫn còn đúng người tài xế đó). Sửa: effect theo dõi `coLapLenhDieuXe` nay xử lý CẢ 2 chiều — tắt thì xóa (như cũ), bật thì **tự điền lại** ứng viên tài xế đầu tiên (`taiXeUngVien[0]`) + biển số xe thường dùng của họ (nếu có), giống hệt logic tự điền lúc thêm thành viên vào đoàn — nhưng CHỈ khi `taiXeNhanVienId` đang trống (không ghi đè nếu người dùng đã tự chọn người khác, áp dụng cho đoàn có nhiều hơn 1 tài xế). Áp dụng cho cả 2 dialog Tạo/Sửa.

## [2026-08-13] Nhãn "Tài xế riêng" ở danh sách LĐCT

Bối cảnh: từ đầu dự án đã xác định 1 cách dùng thực tế — tài xế đi chung đoàn nhưng về sớm/khác giờ với cả đoàn thì cần lập 1 TỜ ĐỘC LẬP (số hiệu riêng) chỉ ghi tài xế, dùng nút Sao chép/Clone có sẵn để tạo (không cần field/loại mẫu in riêng, xem mục "Mẫu in Phát hành, thu hồi vé ế" ở trên). Vấn đề: trong danh sách, 1 lệnh như vậy trông giống hệt 1 lệnh bình thường chỉ có 1 người — người dùng không phân biệt được ngay để biết nên Sao chép/Clone lại hay không.

Quyết định: thêm nhãn "Tài xế riêng" (badge màu teal, khác hẳn amber "Trạm"/violet "Vé ế"/xanh dương chủ đạo, tránh lẫn) ở `/lenh-dieu-cong-tac`. Nhận diện QUA DỮ LIỆU (không thêm field mới trong DB) bằng hàm `laLenhTaiXeRieng()`: lệnh có ĐÚNG 1 thành viên đang còn trong đoàn (`!daLoaiKhoiDoan`) VÀ người đó là tài xế được chỉ định (`thanhVienTaiXeId`) của 1 LĐX con đang hoạt động của CHÍNH lệnh đó — phân biệt với 1 lệnh chỉ có 1 người đi công tác bình thường (không lái xe, không có LĐX kèm theo). CHỈ thêm badge, KHÔNG tô màu nền hàng (khác cách làm "Trạm"/"Vé ế") — vì lệnh tài xế riêng có thể trùng `loaiMauIn` với Trạm hoặc Vé ế (ví dụ bản sao của 1 lệnh Trạm), tô thêm màu nền dễ xung đột/đè lên màu nền đã có của loại mẫu in đó.

**Sửa tiếp (2026-08-13) — tiêu đề cột "STT" vỡ dòng từng chữ cái:** người dùng chụp ảnh cho thấy header "STT" của bảng thành viên (mẫu Tuyến thường/Vé ế) in vỡ thành 3 dòng "S/T/T" dù các cột khác còn nhiều khoảng trống. Nguyên nhân: `<th style="width:8mm;">STT</th>` cộng với padding chung `table.bang-in th` (`2mm 2.5mm`, 2 bên = 5mm) chỉ còn 3mm cho chữ — không đủ chỗ cho "STT" in đậm (3 ký tự), kết hợp rule `overflow-wrap:break-word; word-break:break-word` (thêm 2026-08-10 để chặn tràn bảng khi Nơi đi/Nơi đến quá dài) buộc trình duyệt bẻ xuống dòng theo TỪNG KÝ TỰ khi không đủ chỗ dù chỉ 1 chữ. Sửa: tăng `width:8mm` → `width:14mm` cho `<th>STT</th>` (dòng ~482) — bảng này KHÔNG dùng `table-layout:fixed` nên 2 cột còn lại (Họ và tên/Chức vụ, không khai báo width cố định) tự co giãn bù lại, không gây tràn bảng.

## [2026-08-13] Ngày đi/về mặc định ngày mai, khổ A5 mặc định cho mẫu vé ế, icon thay badge chữ

Ba yêu cầu nhỏ cùng lúc, người dùng trả lời rõ qua AskUserQuestion cho 2 mục còn mơ hồ:

1. **Ngày đi/Ngày về (chung đoàn) mặc định = ngày mai** (không phải hôm nay) ở dialog Lập lệnh mới — thêm hàm `ngayMai()` (`tao-lenh-dieu-cong-tac-dialog.tsx`), áp dụng cho `defaultValues` của `useForm` VÀ `reset()` trong `dong()`. Không đổi "Ngày ký" (vẫn mặc định hôm nay — là ngày lập văn bản, khác ý nghĩa với ngày đi công tác thực tế). CHỈ sửa dialog Tạo, không đụng dialog Sửa (form Sửa luôn nạp ngày thật của lệnh đang sửa, không có khái niệm "mặc định").
2. **Mẫu "Phát hành, thu hồi vé ế" mặc định khổ A5** — người dùng chọn phương án vẫn giữ auto-upgrade A4 khi quá dài (không ép cứng A5 như mẫu Trạm ép A4). Nguyên nhân mẫu này hay bị đẩy lên A4 ngoài ý muốn: dùng CHUNG ngưỡng 90 ký tự (mục đích + địa điểm) với Tuyến thường, trong khi địa điểm công tác của mẫu vé ế thường dài hơn hẳn (nhiều địa điểm/tỉnh cùng lúc, vd 7 ảnh mẫu thật: "Cần Thơ (Ninh Kiều, Vị Tân), An Giang (Rạch Giá)..."). Sửa `chonKhoGiayLenhDieuCongTac()`: thêm ngưỡng riêng 150 ký tự khi `loaiMauIn === "PHAT_HANH_THU_HOI_VE_E"` (thay vì dùng chung 90 với Tuyến thường) — vẫn tự lên A4 khi thật sự quá dài.
3. **Badge "Tài xế riêng" ở danh sách LĐCT → chỉ còn icon xe** (bỏ chữ) — người dùng chọn gọn hơn phiên bản badge chữ vừa thêm hôm trước. Thay `<span>` pill chữ bằng icon `Car` (lucide-react) màu teal, giữ `title` để hover vẫn đọc được ý nghĩa.

**Hoàn tất (2026-08-13, sau khi người dùng gửi ảnh):** badge "Vé ế" đổi thành icon ảnh vé số THẬT do người dùng cung cấp (ảnh chụp vé số An Giang thật, giải đặc biệt 2 tỷ). Xử lý: resize còn 68×34px (2x cho retina, hiển thị ~34×17px), bo góc nhẹ (radius 6px) cho gọn như 1 "chip" nhỏ, lưu tại `apps/web/public/icons/ve-so.png`. Thay hẳn `<span>` pill chữ tím bằng `<img src="/icons/ve-so.png">` — đồng bộ cách làm với icon xe "Tài xế riêng" (ảnh/icon độc lập, có `title` để hover đọc được ý nghĩa, không còn badge nền màu + chữ).

**Bổ sung (cùng ngày) — màu chữ số hiệu theo loại mẫu in:** người dùng muốn thêm 1 tín hiệu phân biệt nữa ("màu text khác nhau") bên cạnh nền hàng/nhãn/icon đã có, đồng thời cho phép tự quyết định icon/badge vé ế sao cho "phù hợp" — quyết định GIỮ NGUYÊN icon ảnh vé số thật (`ve-so.png`) đã làm ở trên vì đây là lựa chọn phù hợp nhất có thể (ảnh vé số thật của công ty, không có icon có sẵn nào sát nghĩa hơn), chỉ bổ sung thêm màu chữ số hiệu để tăng khả năng phân biệt.

Thêm hàm `mauChuSoHieu()` tô màu chữ số hiệu (`<Link>` ở cột Số hiệu): `TRAM` → `text-amber-700`/`dark:text-amber-400`, `PHAT_HANH_THU_HOI_VE_E` → `text-violet-700`/`dark:text-violet-400` — dùng LẠI đúng 2 màu amber/violet đã gắn với từng loại (nền hàng, nhãn "Trạm", icon vé ế) để nhất quán "1 loại = 1 màu" xuyên suốt, không phát sinh màu mới. `TUYEN_THUONG` (loại phổ biến nhất, mặc định) CỐ TÌNH giữ màu trung tính (không tô) — tránh cạnh tranh thị giác với màu xanh dương chủ đạo của giao diện, và vì đây là loại "bình thường" nên không cần nhấn mạnh.

## [2026-08-13] Mở rộng màu chữ ra cả bản ghi + đồng bộ sang danh sách GĐĐ/LĐX

Người dùng yêu cầu 2 điểm: (1) áp màu chữ cho CẢ bản ghi (không chỉ cột Số hiệu), (2) áp màu tương tự ở danh sách Công lệnh/Giấy đi đường (`/giay-di-duong`) và Lệnh điều xe (`/lenh-dieu-xe`) — dựa theo `loaiMauIn` của LĐCT CHA đã sinh ra từng GĐĐ/LĐX đó (bản thân GĐĐ/LĐX không có khái niệm "loại mẫu in" riêng).

**Tách hàm dùng chung** — `mauChuSoHieu()` trước đây định nghĩa cục bộ trong `app/lenh-dieu-cong-tac/page.tsx`, nay chuyển thành `mauChuTheoLoaiMauIn()` ở `apps/web/lib/utils.ts` (cạnh `cn()`/`boDauTiengViet()` đã có) — nhận `loaiMauIn: LoaiMauInLdct | null | undefined` (`null`/`undefined` = LĐX độc lập không qua LĐCT nào, trả về chuỗi rỗng giống `TUYEN_THUONG`) để cả 3 trang import dùng chung, không lặp code 3 nơi.

**Áp dụng rộng ra cả bản ghi ở `/lenh-dieu-cong-tac`:** ngoài Số hiệu, tô thêm màu cho ô Địa điểm công tác, dòng "X người" (không tô dòng tên thành viên bên dưới — thông tin phụ, bị truncate, tô màu dễ rối mắt), và Ngày đi/về. Cột STT/checkbox/Thao tác giữ nguyên trung tính (không phải nội dung bản ghi).

**Backend cần bổ sung field để frontend có dữ liệu tô màu:**
1. `LenhDieuCongTacService.danhSachGiayDiDuong()`: thêm `loaiMauIn: true` vào `select` của quan hệ `lenhDieuCongTac` (trước đó chỉ có id/soHieu/diaDiemCongTac/ngayDi/ngayVe).
2. `LenhDieuXeService.danhSach()`: trước đây KHÔNG include quan hệ `lenhDieuCongTac` nào cả (chỉ scalar field của chính LĐX) — thêm `include: { lenhDieuCongTac: { select: { loaiMauIn: true } } }`.

Cập nhật 2 interface phía frontend tương ứng (`GiayDiDuongDocLap.lenhDieuCongTac.loaiMauIn`, `LenhDieuXe.lenhDieuCongTac`) và áp `mauChuTheoLoaiMauIn()` cho các ô Số hiệu/Người được cấp (hoặc Lái xe-Biển số)/Lệnh điều công tác liên kết (hoặc Nơi đi-Nơi đến)/Ngày đi-về ở cả 2 trang danh sách còn lại — cùng quy tắc: `TUYEN_THUONG` và LĐX độc lập giữ trung tính, `TRAM`/`PHAT_HANH_THU_HOI_VE_E` tô đúng 2 màu amber/violet đã thống nhất.

**Sửa tiếp (cùng ngày) — bỏ cột "Nơi đi" ở `/lenh-dieu-xe`:** người dùng yêu cầu — nơi đi hầu như luôn cố định là trụ sở công ty, không cần nhắc lại ở mỗi dòng danh sách, chỉ tốn chỗ/rối mắt. Đổi tiêu đề cột "Nơi đi → Nơi đến" thành "Nơi đến", ô dữ liệu chỉ còn `{ldx.noiDen}` (bỏ `ldx.noiDi` + icon `ArrowRight` nối 2 chiều, xóa import không dùng nữa). Chỉ ẩn ở BẢNG danh sách — `noiDi` vẫn đầy đủ trong dialog Sửa/chi tiết và mẫu in PDF, không đụng tới dữ liệu hay các màn hình khác.

**Sửa tiếp (cùng ngày) — đảo thứ tự ưu tiên cột "Thành viên" ở `/lenh-dieu-cong-tac`:** người dùng phản hồi sau khi xem ảnh chụp thực tế — cột này trước đó hiển thị "X người" làm nội dung chính (to, có icon, tô màu theo loại) và tên thành viên là dòng phụ nhỏ/muted/truncate bên dưới. Người dùng cần biết NGAY ai đi (tên), số lượng chỉ là thông tin phụ. Đảo lại: dòng tên thành viên (`tenThanhVien()`, vẫn truncate 1 dòng + `title` đầy đủ khi hover) lên làm nội dung chính, cỡ chữ thường, tô màu theo loại mẫu in giống các cột khác của bản ghi; "X người" chuyển xuống dòng dưới, cỡ `text-xs`, màu `text-muted-foreground` cố định (không tô theo loại — chỉ là số liệu phụ). Trường hợp đoàn không còn thành viên nào (hiếm, có thể do loại hết khỏi đoàn) hiện dấu gạch ngang "—" thay vì để trống.

**Sửa lỗi (cùng ngày) — badge không bao giờ hiện:** người dùng báo lại ngay sau khi triển khai — kiểm tra 2 lệnh chỉ có 1 thành viên trong ảnh chụp thực tế (07/LĐCT, 06/LĐCT) không hề có badge. Nguyên nhân: `LenhDieuCongTacService.danhSach()` (dùng cho MÀN HÌNH DANH SÁCH) chỉ `include: { thanhVien: ... }`, KHÔNG include `lenhDieuXe` như `chiTiet()` đã làm — nên trên danh sách `ldct.lenhDieuXe` luôn là `undefined`, hàm `laLenhTaiXeRieng()` luôn trả `false` dù dữ liệu thực tế đúng điều kiện. Sửa: thêm `lenhDieuXe: true` vào `include` của `danhSach()`, giống hệt `chiTiet()`. Bài học: khi thêm logic frontend dựa vào 1 quan hệ Prisma, phải xác minh ĐÚNG endpoint đang gọi (danh sách và chi tiết là 2 query Prisma riêng biệt, không tự động đồng bộ include với nhau) chứ không suy luận từ doc comment cũ trên interface TypeScript (comment ghi "backend trả đầy đủ" chỉ đúng cho field `thanhVien`, không đúng cho `lenhDieuXe`).

## [2026-08-13] Tạm khóa nút "Lập lệnh điều xe" độc lập ở `/lenh-dieu-xe`

Bối cảnh: sau khi hoàn thiện luồng "lập kèm LĐX từ LĐCT" (checkbox "Trong đoàn có tài xế" ở dialog Tạo/Sửa LĐCT, tự tạo LĐX kèm theo khi có tài xế), người dùng yêu cầu tạm thời khóa hẳn đường tạo LĐX ĐỘC LẬP (không qua LĐCT) ở trang `/lenh-dieu-xe`, hướng người dùng sang lập từ LĐCT thay thế.

Quyết định: đổi nút "Lập lệnh điều xe" ở header trang `/lenh-dieu-xe` thành trạng thái `disabled`, đổi icon `Plus` → `Lock`, thêm `title` giải thích lý do khi hover. Thêm 1 banner hướng dẫn màu amber ngay dưới header, giải thích ngắn gọn cách lập LĐX qua LĐCT (chọn tài xế ở bước "Tài xế/Biển số") kèm nút bấm nhanh `<Link>` sang `/lenh-dieu-cong-tac`.

**Cố tình KHÔNG xóa** state `moDialogTao` và component `<TaoLenhDieuXeDialog>` ở cuối file — chỉ khóa nút gọi tới nó. Lý do: đây là khóa "tạm thời" theo đúng lời người dùng, không phải bỏ hẳn tính năng; giữ nguyên code cũ giúp việc mở khóa lại sau này chỉ cần sửa 1 dòng (bỏ `disabled` + đổi lại icon `Plus`), không cần viết lại dialog/state từ đầu.

Lý do nghiệp vụ (đã thống nhất trước đó trong các quyết định về checkbox "Trong đoàn có tài xế"): LĐX gần như luôn gắn với 1 chuyến công tác cụ thể (LĐCT) — tạo LĐX rời rạc không qua LĐCT dễ tạo dữ liệu không nhất quán (không rõ chuyến đi nào, mục đích gì) so với luồng lập kèm đã có sẵn.

Phương án khác đã cân nhắc: ẩn hẳn nút thay vì disable — không chọn vì disable + banner giải thích rõ hơn cho người dùng biết tính năng vẫn tồn tại (chỉ tạm khóa), tránh nhầm tưởng bị xóa mất chức năng.

## [2026-08-14] Mục đích mặc định (gợi ý) cho mẫu "Phát hành, thu hồi vé ế" — cấu hình qua /cau-hinh-don-vi

Bối cảnh: mẫu in "Phát hành, thu hồi vé ế" in `mucDich` thành phụ đề ngay dưới tiêu đề lệnh (xem `phuDe` trong `lenh-dieu-cong-tac-mau-in.ts`). Trước đây trường "Mục đích" trong dialog Tạo luôn mặc định cứng "Công tác" cho MỌI loại lệnh — người dùng muốn riêng loại vé ế lấy mặc định từ 1 giá trị do Quản trị cấu hình sẵn (đỡ phải gõ lại mỗi lần, vì mục đích loại này gần như cố định qua các đợt: "phát hành vé số, thu hồi vé số ế...").

Quyết định: đi theo đúng khuôn mẫu đã có của `canCuMauTram` (Căn cứ mẫu Trạm) — thêm 1 field cấu hình đơn vị mới thay vì tạo bảng/màn hình riêng:

1. **Prisma:** thêm `CauHinhDonVi.mucDichMacDinhVeE String?` (nullable — để trống thì dialog Tạo vẫn dùng mặc định chung "Công tác" như mọi loại khác, không bắt buộc Quản trị phải cấu hình).
2. **Giao diện `/cau-hinh-don-vi`:** thêm ô nhập "Mục đích mặc định — mẫu Phát hành, thu hồi vé ế" (Input 1 dòng, không phải Textarea như Căn cứ vì đây chỉ là 1 câu ngắn), khóa theo đúng quyền `don-vi.sua` sẵn có, không thêm quyền mới.
3. **Dialog Tạo LĐCT:** thêm effect theo dõi CHUYỂN ĐỔI của combobox "Loại lệnh điều công tác" (dùng `useRef` lưu loại trước đó, cùng kỹ thuật đã dùng cho checkbox "Trong đoàn có tài xế") — CHỈ khi người dùng VỪA chọn sang "Phát hành, thu hồi vé ế" VÀ ô Mục đích đang còn giá trị mặc định chung "Công tác" (chưa sửa) thì mới tự điền giá trị cấu hình vào; nếu người dùng đã tự gõ nội dung khác trước khi đổi loại, hoặc Quản trị chưa cấu hình gì (rỗng/null), thì KHÔNG ghi đè. Vẫn luôn sửa được tay bình thường sau khi tự điền — đây chỉ là gợi ý điền sẵn, không khóa trường.

**Phạm vi:** chỉ áp dụng ở dialog TẠO, không đụng dialog SỬA — theo đúng tiền lệ "Ngày đi/về mặc định ngày mai" (2026-08-13): dialog Sửa luôn nạp giá trị THẬT đã lưu của lệnh đang sửa, không có khái niệm "mặc định điền sẵn". Luồng "Sao chép" (clone) từ lệnh có sẵn không bị ảnh hưởng — vì lúc đó ô Mục đích được nạp giá trị THẬT của lệnh gốc (thường không trùng chữ "Công tác"), nên điều kiện "đang là giá trị mặc định chung" tự động không khớp, không bị ghi đè ngoài ý muốn.

Phương án khác đã cân nhắc: tự điền ngay khi mở dialog nếu Quản trị đã cấu hình (bất kể người dùng có đổi loại hay không) — không chọn vì loại mặc định khi mở dialog luôn là "Tuyến thường" (phổ biến nhất), tự điền mục đích vé ế ngay từ đầu sẽ sai ngữ cảnh; chỉ điền đúng lúc người dùng THỰC SỰ chọn loại vé ế mới hợp lý.

## [2026-08-14] Tag lọc theo loại lệnh điều công tác ở danh sách `/lenh-dieu-cong-tac`

Bối cảnh: người dùng muốn lọc nhanh danh sách theo loại lệnh (Tuyến thường/Trạm/Phát hành-thu hồi vé ế) thay vì phải cuộn tìm bằng mắt qua màu chữ/icon đã có.

Quyết định: thêm hàng nút dạng "tag" (pill, không phải dropdown `<Select>`) ngay dưới hàng tìm kiếm/lọc trạng thái hiện có — 4 tag "Tất cả"/"Tuyến thường"/"Trạm"/"Phát hành, thu hồi vé ế", tag đang chọn tô màu tương ứng (amber cho Trạm, violet + icon vé số cho vé ế, xanh dương chủ đạo cho Tất cả/Tuyến thường), tag còn lại trung tính. Bấm 1 tag = lọc riêng đúng loại đó, không multi-select (khớp cách tag lọc trạng thái/kích thước trang hiện có, đơn giản hơn checkbox nhiều lựa chọn).

Xuyên suốt 3 tầng: Zod (`danhSachLenhDieuCongTacSchema` thêm `loaiMauIn` optional enum) → backend (`LenhDieuCongTacService.danhSach()` thêm điều kiện `where.loaiMauIn`) → frontend (`BoLocLenhDieuCongTac` + query string thêm `loaiMauIn`, state `loaiMauInLoc` ở `page.tsx`, reset về trang 1 khi đổi tag).

Lý do: các loại lệnh có khối lượng/tần suất khác hẳn nhau (Tuyến thường là mặc định hàng ngày, Trạm/vé ế là các trường hợp đặc biệt cần tra cứu/thống kê riêng theo đợt) — lọc bằng tag giúp Văn thư xem nhanh riêng từng loại mà không cần đếm bằng mắt qua nhiều trang.

**Bổ sung ngay sau (cùng ngày) — thêm tag "Tài xế riêng":** người dùng muốn lọc thêm cả trường hợp "tổ chỉ có 1 mình tài xế" (badge icon xe đã có ở danh sách từ trước, xem mục "Nhãn 'Tài xế riêng'..." phía trên). Khác với 3 tag còn lại, đây KHÔNG phải 1 giá trị của `loaiMauIn` — 1 lệnh Tuyến thường bình thường vẫn có thể rơi vào trường hợp này (đoàn chỉ còn lại đúng 1 tài xế), nên đặc điểm này tách biệt hoàn toàn với enum loại mẫu in.

Vì Prisma không diễn tả trực tiếp được điều kiện "đếm số thành viên còn hoạt động của 1 LĐCT bằng đúng 1" trong `where` (chỉ hỗ trợ `some`/`none`/`every`, không hỗ trợ đếm số lượng chính xác), quyết định dùng 1 truy vấn `$queryRaw` riêng để lấy trước danh sách id LĐCT khớp điều kiện (đúng 1 thành viên chưa bị loại khỏi đoàn VÀ có LĐX đang hoạt động với `thanhVienTaiXeId` trỏ đúng người đó), rồi đưa vào `where.id: { in: ids }` của truy vấn `findMany`/`count` chính — vẫn đảm bảo phân trang/đếm tổng chính xác khi kết hợp với các bộ lọc khác (từ khóa, đã hủy...), vì toàn bộ điều kiện gộp vào CHUNG 1 `where` duy nhất trước khi phân trang, không phải lọc thủ công sau khi đã phân trang.

Tham số API mới: `chiTaiXeRieng` (Zod: `z.enum(["true"]).optional().transform(...)`, giống pattern `daHuy`) — tách biệt với `loaiMauIn`, không gộp chung 1 param. Ở giao diện, tag "Tài xế riêng" vẫn dùng CHUNG 1 state `loaiMauInLoc` với 4 tag kia (chỉ chọn được 1 tag tại 1 thời điểm, giữ UI đơn giản) — khi chọn tag này, `page.tsx` gọi hook với `loaiMauIn: undefined, chiTaiXeRieng: true` thay vì set `loaiMauIn`. Màu tag dùng teal, khớp màu icon `Car` đã dùng cho badge cùng ý nghĩa trong bảng.

Phương án khác đã cân nhắc: lọc ở tầng ứng dụng (tải nhiều bản ghi hơn rồi lọc bằng JS, giống cách làm với sắp xếp mặc định của Danh mục Nhân viên) — không chọn vì sẽ phải tự viết lại phân trang thủ công cho riêng trường hợp này (dễ sai lệch với `data.tong`/`tongTrang` đang dùng chung cho mọi bộ lọc khác); raw SQL 1 lần rồi lọc bằng `id IN (...)` giữ được đúng 1 luồng phân trang duy nhất cho toàn bộ trang, đơn giản hơn về lâu dài dù có vẻ "nặng tay" hơn lúc code.

## [2026-08-14] Tăng cỡ chữ bảng thành viên mẫu Tuyến thường/Vé ế lên 10pt (khớp đoạn văn)

Bối cảnh: người dùng gửi ảnh mẫu in thật (12/LĐCT) — chữ trong bảng "HỌ VÀ TÊN/CHỨC VỤ" nhìn nhỏ hơn hẳn so với đoạn văn mở đầu phía trên, yêu cầu chỉnh lại cho phù hợp ở các mẫu LĐCT, TRỪ mẫu Trạm TP.HCM.

Nguyên nhân: `table.bang-in` (class CSS DÙNG CHUNG cho cả 3 nơi — bảng thành viên LĐCT Tuyến thường/vé ế, bảng "Nơi đi/Nơi đến" của Công lệnh kiêm giấy đi đường, VÀ làm nền cho `.bang-tram`) có `font-size: 9pt`, trong khi đoạn văn chính của trang dùng `font-size: 10pt` (khai ở `html, body` trong `cssKhung()`) — chênh 1pt gây cảm giác "nhỏ hơn hẳn". Mẫu Trạm không bị ảnh hưởng vì đã tự ghi đè `font-size: 11pt` bằng inline style ngay trên thẻ `<table>` (ưu tiên hơn mọi rule CSS class).

Quyết định: KHÔNG sửa trực tiếp `table.bang-in` (sẽ kéo theo bảng GDD cũng đổi theo, ngoài phạm vi yêu cầu — GDD không phải "mẫu lệnh điều công tác"). Thêm 1 class con `.bang-ldct` (`table.bang-in.bang-ldct { font-size: 10pt; }`), CHỈ gắn vào đúng bảng thành viên trong `noiDungTrangLenhDieuCongTacTuyenThuong()` (hàm dùng chung cho cả Tuyến thường và vé ế, phân nhánh nội bộ qua cờ `laVeE` — không có hàm riêng cho vé ế). Kết quả: Tuyến thường + vé ế lên đúng 10pt bằng đoạn văn; Trạm giữ nguyên 11pt (không đổi gì); GDD giữ nguyên 9pt (không đổi gì).

Không chỉnh lại `chonKhoGiayLenhDieuCongTac()` (ngưỡng tự động lên A4) dù dòng bảng cao hơn 1 chút — ngưỡng đó vốn đã là ước lượng gần đúng (số thành viên/độ dài nội dung), không tính bằng pixel chính xác, chấp nhận sai số nhỏ này giống các lần điều chỉnh cỡ chữ trước đây.

## [2026-08-14] Mẫu in Công lệnh kiêm giấy đi đường (mặt trước): chống tràn sang trang 2 khi Nơi đến dài

Bối cảnh: người dùng gửi ảnh mẫu in thật — khi Nơi đến liệt kê nhiều địa điểm/tỉnh cùng lúc (vd "Cần Thơ (Ninh Kiều), Cà Mau (Bạc Liêu, An Xuyên)"), ô "Nơi đi và đến" trong bảng xuống nhiều dòng, đẩy toàn bộ trang tràn sang trang 2 (chỉ còn lại tiêu đề bảng trống). Cột "Ngày" cũng bị xuống dòng xấu ("15/08/20" + "26"). Yêu cầu: vẫn phải nằm gọn 1 trang.

Khác với LĐCT (tự động lên A4 khi nội dung dài, xem `chonKhoGiayLenhDieuCongTac()`), GĐĐ theo CLAUDE.md LUÔN cố định khổ A5 — không thể "né" bằng cách đổi khổ giấy, phải "co lại vừa trang" (shrink-to-fit) khi nội dung thực sự dài.

Quyết định (3 phần, đều đặt trong `noiDungMatTruocGdd()` và `khoiKy()`):

1. **Sửa lỗi cột "Ngày" xuống dòng xấu (luôn áp dụng, không điều kiện):** bảng "Nơi đi và đến" dùng `table-layout: auto` (không phải `fixed` như bảng mẫu Trạm) nên `width` khai báo trên `<th>` chỉ là gợi ý, trình duyệt có thể thu hẹp cột "Ngày" hơn 22mm nếu 2 cột còn lại cần chỗ, khiến ngày dd/mm/yyyy (10 ký tự cố định) bị ngắt dòng giữa chừng. Thêm `white-space: nowrap` cho `<th>`/`<td>` cột Ngày — ép trình duyệt tự nới rộng đúng theo nội dung, không ảnh hưởng cột "Nơi đi và đến" (vẫn xuống dòng bình thường).

2. **Cờ `noiDungDai`** = `(noiDi.length + noiDen.length) > 35` — dùng để bật chế độ "gọn" chỉ khi thực sự cần, giữ nguyên giao diện mặc định (đã ổn định từ trước) cho các GĐĐ nội dung ngắn bình thường.

3. **Khi `noiDungDai`, 3 điều chỉnh cộng dồn:**
   - `khoiKy()` (`mau-in-dung-chung.ts`) thêm tham số `gon` (mặc định `false`, không ảnh hưởng LĐX/LĐCT/mọi lời gọi khác) — khi `true`, ghi đè inline style thu nhỏ `margin-top` khối ký (10mm→5mm) và chiều cao khoảng trống dành đóng dấu/ký tên (20mm→12mm).
   - Class `.gdd-gon` gắn vào `<div class="trang">` — giảm `line-height` cả trang (1.4→1.15, đòn bẩy lớn nhất vì ảnh hưởng đồng thời mọi dòng văn bản/hàng bảng) + giảm đệm ô bảng (2mm 2.5mm→1mm 2mm).
   - Giảm chiều cao 2 hàng trống dành chừa cho lần đi sau (14mm→8mm) — tác dụng thực tế nhỏ (nội dung nhãn "Nơi đi:/Nơi đến:" đã gần chạm mức tối thiểu tự nhiên ~13mm ở line-height 1.4, và còn thấp hơn nữa ở 1.15), giữ lại vì vô hại và có ý nghĩa khi kết hợp cỡ chữ/đệm đã giảm.

Rủi ro đã ghi nhận: KHÔNG render thử được bằng Chromium thật trong môi trường làm việc (sandbox chặn tải trình duyệt, xem quyết định 2026-08-07 "Bước 7 lộ trình") — các con số (ngưỡng 35 ký tự, line-height 1.15, margin/khoảng trống rút gọn) tính bằng ước lượng thủ công dựa trên kích thước phông/dòng, chưa đo bằng bản in thật. Cần người dùng in thử với dữ liệu Nơi đến dài thật để xác nhận đã đủ gọn trong 1 trang; nếu vẫn tràn, ngưỡng/mức giảm có thể cần chỉnh mạnh tay hơn.

Phương án khác đã cân nhắc: chỉ giảm chiều cao 2 hàng trống (đơn giản nhất) — không đủ vì nội dung nhãn cố định đã gần chạm mức tối thiểu tự nhiên, giảm riêng lẻ gần như không tiết kiệm được gì đáng kể; phải kết hợp giảm `line-height` toàn trang mới có đòn bẩy đủ lớn.

## [2026-08-14] Cảnh báo sớm khi Nơi đi/Nơi đến quá dài (trước khi lưu/in)

Bối cảnh: sau khi xác nhận cơ chế "gọn" (mục phía trên) khắc phục được tình huống tràn trang thực tế, người dùng muốn hệ thống chủ động cảnh báo/hướng dẫn ngay lúc nhập liệu — không đợi in ra mới phát hiện bố cục có vấn đề.

Quyết định: KHÔNG chặn lưu (không phải lỗi validation cứng) — chỉ hiện cảnh báo/hướng dẫn, đúng theo đúng lời người dùng ("đưa ra cảnh báo hoặc hướng dẫn"). 2 ngưỡng, đặt CHUNG 1 nơi để không lệch giữa các tầng:

`packages/shared/src/canh-bao/do-dai-noi-dung-in.ts` — `NGUONG_CANH_BAO_NHE_DO_DAI_NOI_DI_DEN = 35` (đúng bằng ngưỡng bật chế độ "gọn" của mẫu in GĐĐ, xem mục phía trên) và `NGUONG_CANH_BAO_MANH_DO_DAI_NOI_DI_DEN = 70` (ước lượng thủ công — vượt mức này thì dù đã "gọn" vẫn có khả năng cao ảnh hưởng bố cục, cần người dùng chủ động rút gọn).

Áp dụng ở 3 nơi:
1. `lenh-dieu-cong-tac-mau-in.ts` (`noiDungMatTruocGdd`) — đổi hằng số hardcode `35` cũ sang import `NGUONG_CANH_BAO_NHE_DO_DAI_NOI_DI_DEN` từ `@congtac/shared`, đảm bảo ngưỡng kích hoạt "gọn" và ngưỡng cảnh báo frontend LUÔN khớp nhau.
2. Dialog Tạo LĐCT (`tao-lenh-dieu-cong-tac-dialog.tsx`) — `watch("noiDi")` + `watch("diaDiemCongTac")`, cộng tổng độ dài, hiện cảnh báo amber (nhẹ, vượt 35) hoặc đỏ (mạnh, vượt 70) ngay dưới cặp trường Nơi đi/Nơi đến, cập nhật realtime khi gõ.
3. Dialog Sửa LĐCT (`sua-lenh-dieu-cong-tac-dialog.tsx`) — CHỈ tính theo `diaDiemCongTac` (không có trường "Nơi đi" trong dialog Sửa — trường này chỉ đặt được lúc Tạo qua `GiayDiDuong.noiDiRieng`, xem doc comment trong dialog Tạo). Chấp nhận đây là tín hiệu GẦN ĐÚNG (chưa cộng phần Nơi đi), vì đây chỉ là cảnh báo/hướng dẫn, không phải kiểm tra bắt buộc chính xác tuyệt đối.

Phương án khác đã cân nhắc: chặn cứng (validation error) khi vượt ngưỡng mạnh — không chọn vì người dùng dùng từ "cảnh báo hoặc hướng dẫn" (không phải "chặn"), và nội dung Nơi đi/Nơi đến là dữ liệu nghiệp vụ thật (địa danh có sẵn, không phải lỗi nhập liệu) — không nên ngăn người dùng lưu chứng từ hợp lệ chỉ vì độ dài, nhất là khi ngưỡng chỉ là ước lượng chưa kiểm chứng bằng bản in thật.

**Hiệu chỉnh sau khi in thử thật (cùng ngày) — giảm bớt mức "gọn", tránh dư khoảng trống:** người dùng in thử với ví dụ "Đồng Tháp (Cao Lãnh, Mỹ Tho), Tây Ninh (Long An), TP. Hồ Chí Minh" (Nơi đến khá dài, kích hoạt chế độ `.gdd-gon`) — bản in không còn tràn trang 2 (đúng mục tiêu), nhưng để lại 1 khoảng trống rất lớn ở cuối trang: mức giảm ban đầu (line-height 1.4→1.15, đệm bảng 2mm 2.5mm→1mm 2mm, margin-top khối ký 10mm→5mm, khoảng trống ký/đóng dấu 20mm→12mm) là ước lượng quá tay so với mức thực sự cần thiết.

Giảm nhẹ lại mức "gọn" theo đúng phản hồi thực tế này (không phải tính lại từ đầu — chỉnh dần theo bằng chứng in thật, vì môi trường làm việc của Claude không render được PDF để đo chính xác):
- `line-height`: 1.15 → 1.28.
- Đệm ô bảng (`table.bang-in th/td` trong `.gdd-gon`): 1mm 2mm → 1.5mm 2.2mm.
- `khoiKy(gon=true)`: margin-top khối ký 5mm → 7mm; khoảng trống dành ký tên/đóng dấu 12mm → 15mm.
- 2 hàng trống chừa cho lần đi sau: 8mm → 11mm.

Vẫn giữ NGUYÊN mọi ngưỡng kích hoạt (`NGUONG_CANH_BAO_NHE_DO_DAI_NOI_DI_DEN = 35`) và cấu trúc cơ chế (class `.gdd-gon`, tham số `gon` của `khoiKy()`) — chỉ đổi CÁC CON SỐ mức giảm bên trong, không đổi kiến trúc. Đã ghi rõ trong code: đây là "điều chỉnh theo phản hồi thực tế từng bước", chưa phải công thức đo đạc chính xác — nếu gặp nội dung dài hơn nữa mà vẫn còn dư nhiều khoảng trống, có thể giảm tiếp; nếu tràn trở lại, tăng nhẹ lại. Người dùng nên tiếp tục in thử với các trường hợp Nơi đến dài khác nhau (đặc biệt trường hợp dài hơn ví dụ này) để tinh chỉnh thêm nếu cần.

**Hiệu chỉnh lần 2 (cùng ngày) — 2 hàng trống cao BẰNG 2 hàng dữ liệu, không còn khoảng trống lệch:** người dùng in thử tiếp và chỉ ra nguyên nhân cụ thể của khoảng trống còn dư ở cuối trang — 2 hàng "Nơi đi:/Nơi đến:" TRỐNG (dành chừa cho lần đi sau) có chiều cao cố định 11mm, THẤP HƠN HẲN 2 hàng dữ liệu thật ở trên (chứa cả "Nơi đi: X" và "Nơi đến: Y", thường xuống 2-3 dòng do nội dung dài) — 4 hàng cao thấp không đều khiến bảng nhìn lệch và không lấp hết khoảng trang còn lại. Yêu cầu: cho chiều cao các ô bằng chiều cao ô cao nhất.

Quyết định: KHÔNG dùng số mm cố định nữa cho 2 hàng trống — tính TOÁN chiều cao theo đúng nội dung thật của 2 hàng dữ liệu, rồi áp lại cho 2 hàng trống, đảm bảo cả 4 hàng cao bằng nhau tuyệt đối (không phải áng chừng):

1. `uocLuongSoDong(vanBan)` — ước lượng số dòng 1 chuỗi sẽ xuống khi in trong cột "Nơi đi và đến" (~74mm rộng), dùng hệ số ~44 ký tự/dòng (74mm / ~1.65mm trung bình 1 ký tự tiếng Việt có dấu ở Be Vietnam Pro 9pt) — ước lượng thô cùng phong cách với các ngưỡng ký tự khác đã dùng trong dự án (`chonKhoGiayLenhDieuCongTac`, `NGUONG_CANH_BAO_...`), KHÔNG đo bằng trình duyệt thật (sandbox không render được PDF).
2. `tinhChieuCaoHangDongGdd(gdd)` — cộng số dòng ước lượng của `"Nơi đi: " + noiDi` và `"Nơi đến: " + noiDen` (2 hàng dữ liệu LUÔN cùng tổng số dòng vì cùng chứa 2 chuỗi này, chỉ đổi vai trò Nơi đi/Nơi đến — chỉ cần tính 1 lần), nhân với chiều cao 1 dòng ở chế độ "gọn" (9pt × line-height 1.28 × 0.3528mm/pt ≈ 4.06mm/dòng) rồi cộng đệm dọc (2 × 1.5mm, khớp `padding: 1.5mm 2.2mm` của `.gdd-gon`).
3. `noiDungMatTruocGdd()` — khi `noiDungDai`, 2 hàng trống dùng thẳng kết quả này (vd ví dụ "Đồng Tháp (Sa Đéc), Vĩnh Long (Tân Hạnh, Trà Vinh)" → 3 dòng → ~15.2mm) thay vì hằng số 11mm cũ. Trường hợp nội dung NGẮN (không bật "gọn") vẫn giữ nguyên 14mm cố định như trước — không đổi gì, vì lúc đó 2 hàng dữ liệu vốn đã ngắn (2 dòng, ~12.9mm) và không có khiếu nại nào ở tình huống này.

Phương án khác đã cân nhắc: để trình duyệt tự phân bổ khoảng trống thừa giữa các hàng bằng cách đặt `height` cố định cho cả `<table>` (dựa vào thuật toán CSS table height tự giãn hàng) — không chọn vì hành vi phân bổ khoảng trống thừa giữa các hàng KHÔNG được đặc tả rõ ràng trong CSS 2.1 (tùy trình duyệt/bộ máy render), rủi ro cho ra kết quả khác nhau giữa lúc xem trước và lúc in thật; tính toán chiều cao trực tiếp bằng TypeScript (đã biết chính xác nội dung + độ rộng cột) cho kết quả xác định (deterministic), không phụ thuộc hành vi ngầm định của trình duyệt.

**Bỏ in nghiêng 4 dòng thông tin đầu mặt trước (cùng ngày):** người dùng yêu cầu — "Cấp cho Anh (Chị)/Chức vụ/Được cử đi công tác tại/Từ ngày-Đến ngày" trước đó dùng `<strong><em>` (vừa đậm vừa nghiêng), bỏ `<em>` chỉ còn `<strong>` (đậm, không nghiêng).

## [2026-08-14] Sổ công lệnh — báo cáo tự sinh thay sổ ghi tay của Văn thư

Bối cảnh: người dùng gửi ảnh "SỔ GHI CÔNG LỆNH" viết tay thật — Văn thư ghi tay theo dõi mỗi khi in xong 1 bộ chứng từ (số LĐCT, số Công lệnh/GĐĐ, họ tên, địa điểm, mục đích, ngày đi/về, ghi chú tự do bên cạnh tên). Hỏi có nên làm sổ theo dõi số hóa như mẫu không. Đã brainstorm (dùng skill `brainstorming` + AskUserQuestion) và nhận ra hầu hết dữ liệu trong sổ tay ĐÃ có sẵn trong `LenhDieuCongTac`/`GiayDiDuong` (số hiệu do `DanhSoService` cấp, họ tên/địa điểm/mục đích/ngày đã lưu) — chỉ thiếu duy nhất 1 thứ: ô "Ghi chú" tự do người dùng ghi tay cạnh tên (vd "đã nhận tiền", "đã ký").

Quyết định cuối (nguyên văn người dùng chốt, ghi lại để tránh suy diễn lại):
1. Thêm `ghiChu String?` vào model `LenhDieuCongTac` — ghi chú CHUNG cho cả đoàn (không phải theo từng thành viên/GĐĐ), không bắt buộc, KHÔNG in ra chứng từ (chỉ phục vụ theo dõi nội bộ).
2. Form Lệnh điều công tác (Tạo + Sửa) — thêm 1 ô "Ghi chú" (Textarea, 2 dòng) ngay dưới "Mục đích" — nhập lúc lập, sửa lại được sau qua đúng form này.
3. Trang `/so-cong-lenh` (menu "Chứng từ") — báo cáo TỰ SINH, KHÔNG có API sửa riêng (tránh phải làm thêm 1 chỗ chỉnh sửa thứ 2 — sửa ghi chú thì quay lại sửa LĐCT). Mỗi dòng = 1 `GiayDiDuong` đang hoạt động (`daHuy=false`), gộp theo `lenhDieuCongTacId` (tô màu xen kẽ theo đoàn, giống `/giay-di-duong`). Cột: Ngày lập (LĐCT.ngayKy) — Số LĐCT — Số Công lệnh/GĐĐ — Họ tên — Địa điểm (LĐCT.diaDiemCongTac) — Mục đích — Ngày đi/về (ưu tiên `ngayDiRieng`/`ngayVeRieng` của thành viên, giống `layChiTietGiayDiDuong()`) — Ghi chú. Lọc theo khoảng "Ngày lập" + từ khóa (khớp số LĐCT/GDD, họ tên, địa điểm, mục đích). Nút "Xuất Excel" dùng lại package `xlsx` đã cài sẵn (trước đó chỉ dùng để ĐỌC file nhập nhân viên, nay dùng thêm để GHI). Quyền xem: `chung-tu.xem` (dùng lại, không tạo quyền mới).

Kiến trúc: đặt CONTROLLER RIÊNG `so-cong-lenh` (không nhét vào `LenhDieuCongTacController`) — cùng lý do với `GiayDiDuongController` đã tách trước đó (tránh xung đột thứ tự route với `@Get(":id")`). 2 endpoint: `GET /so-cong-lenh` (có phân trang, cho màn hình xem) và `GET /so-cong-lenh/xuat-excel` (lấy TOÀN BỘ theo đúng bộ lọc đang áp dụng, không phân trang — StreamableFile `.xlsx`, cùng pattern với xuất PDF).

Lý do:
- Không làm module nhập liệu song song (sổ tay thủ công) vì gần như toàn bộ dữ liệu đã có sẵn — chỉ thêm đúng 1 trường còn thiếu (`ghiChu`), giữ đúng tinh thần YAGNI và tránh 2 nguồn sự thật (đánh số chứng từ) lệch nhau.
- `ghiChu` đặt tại `LenhDieuCongTac` (chung cả đoàn) thay vì `GiayDiDuong` (riêng từng người) — khớp đúng cách Văn thư ghi tay thật (ghi chú thường áp dụng cho cả đoàn/cả chuyến, không phải riêng từng người), và đơn giản hơn (1 form, không phải sửa riêng từng công lệnh).
- Không có API sửa riêng ở `/so-cong-lenh` — tránh trùng lặp logic sửa (form LĐCT đã kiểm tra quyền `chung-tu.sua`, đã có transaction, đã ghi nhật ký — làm thêm 1 API sửa riêng chỉ để đổi 1 trường là dư thừa).
- Chỉ lấy `GiayDiDuong.daHuy=false` — khớp tinh thần "sổ theo dõi chứng từ còn hiệu lực" của bản gốc viết tay (chứng từ hủy đã cascade `daHuy=true`, không nên lẫn vào sổ theo dõi công việc đã hoàn thành).

Phương án khác đã cân nhắc:
- `ghiChu` theo từng `GiayDiDuong` + sửa trực tiếp trên trang `/so-cong-lenh` (đề xuất ban đầu của Claude) — bị người dùng chỉnh lại rõ ràng, không dùng vì sai với cách ghi chú thực tế (chung cả đoàn) và phải làm thêm 1 API sửa/1 chỗ kiểm tra quyền mới.
- Tạo bảng CSDL riêng cho "Sổ công lệnh" với nhập liệu tay đầy đủ như sổ giấy — không chọn vì trùng lặp gần như toàn bộ dữ liệu đã có ở LĐCT/GDD, rủi ro lệch số liệu giữa 2 nơi.

Rủi ro đã ghi nhận: chưa chạy được `pnpm typecheck`/`pnpm dev` trong môi trường làm việc của Claude (không có Node/Prisma client sinh sẵn) — toàn bộ thay đổi (schema, Zod, service, controller, module, hook, trang) mới được rà soát bằng đọc code, CHƯA build/test thật. Cả `packages/shared` (thêm `ghiChu` không đổi gì ở đây thực ra — export mới lần trước) lẫn `packages/validation` (thêm `truyVanSoCongLenhSchema`/`danhSachSoCongLenhSchema`) đều trỏ `main`/`types` sang `./dist/`, nên người dùng cần chạy `pnpm --filter @congtac/validation build` (và `pnpm --filter @congtac/shared build` nếu chưa chạy từ lần trước) trước khi `pnpm dev`, kèm `pnpm --filter @congtac/api prisma generate` để cập nhật Prisma Client theo migration `ghi_chu_lenh_dieu_cong_tac` mới, rồi mới xác minh được trên trình duyệt.

## [2026-08-14] Sửa lỗi: Sửa LĐCT ghi đè mất Mục đích/Nơi đến đã sửa riêng trên Lệnh điều xe

Bối cảnh: người dùng báo "mẫu in lệnh điều xe: Mục đích lúc nào cũng in là 'công tác'" dù đã từng sửa lại Mục đích riêng ngay trên trang Lệnh điều xe. Rà code xác nhận: mẫu in KHÔNG hardcode "Công tác" (in đúng `lenh.mucDich` thật), nhưng `dongBoLenhDieuXe()` (chạy mỗi khi Sửa LĐCT, phần "Trường hợp C — đã có LĐX") ghi đè `mucDich`/`noiDen` của LĐX liên kết theo công thức `duLieu.mucDich ?? lenh.mucDich` — chạy VÔ ĐIỀU KIỆN bất cứ khi nào LĐCT còn LĐX đang hoạt động, bất kể lần sửa đó có đụng đến Mục đích/Nơi đến hay không (kể cả chỉ thêm Ghi chú, đổi Ngày ký...). Vì vậy mọi lần sửa LĐCT sau đó đều xóa mất phần Mục đích người dùng từng chỉnh riêng trên LĐX, trả nó về đúng giá trị Mục đích hiện tại của LĐCT (thường vẫn là "Công tác" mặc định vì người dùng không đổi ở LĐCT, chỉ đổi ở LĐX). Sai với đúng doc comment đã ghi sẵn tại chỗ đó ("chỉ ghi đè khi có thay đổi ảnh hưởng TRỰC TIẾP đến tài xế") — code không thực sự kiểm tra điều kiện này.

Quyết định: sửa `dongBoLenhDieuXe()` (`lenh-dieu-cong-tac.service.ts`, "Trường hợp C") — chỉ ghi đè `noiDen`/`mucDich` của LĐX khi LẦN SỬA NÀY thực sự đổi `diaDiemCongTac`/`mucDich` của LĐCT (so `duLieu.diaDiemCongTac !== truoc.diaDiemCongTac` và tương tự cho `mucDich`, dùng `truoc` = giá trị LĐCT TRƯỚC khi áp update). Nếu lần sửa không đụng đến 2 trường này, giữ nguyên giá trị đang có trên LĐX (không set field vào `capNhat`, Prisma không đổi cột đó). `ngayDi`/`ngayVe` giữ nguyên logic cũ (không đổi) — đã có cơ chế ngày riêng của tài xế (`ngayDiRieng`/`ngayVeRieng`) riêng, không nằm trong phạm vi lỗi người dùng báo lần này.

Lý do: khớp đúng ý đồ đã ghi trong doc comment cũ nhưng chưa từng được implement đúng — chỉ đồng bộ khi NGUỒN (LĐCT) thực sự đổi, không xóa mất tùy biến người dùng từng làm trực tiếp trên LĐX.

Phương án khác đã cân nhắc: khóa hẳn (disable) 3 trường Mục đích/Nơi đến/Ngày đi-về trên dialog Sửa LĐX khi LĐX đó có `lenhDieuCongTacId` (ép luôn đồng bộ 100% theo LĐCT, không cho sửa riêng nữa) — không chọn vì thay đổi hành vi lớn hơn mức cần thiết để sửa đúng lỗi người dùng báo, và người dùng xác nhận muốn "vẫn cho cập nhật lại" (tức vẫn giữ khả năng sửa riêng, chỉ cần nó không bị xóa mất oan).

Rủi ro đã ghi nhận: chưa chạy được `pnpm typecheck`/test thật trong môi trường làm việc — sửa đã rà bằng đọc code (đúng kiểu `Prisma.LenhDieuXeUncheckedUpdateInput`, biến `truoc`/`lenh` vẫn dùng đúng phạm vi). Người dùng cần thử lại đúng kịch bản đã báo lỗi (sửa Mục đích riêng trên LĐX → sửa LĐCT không đụng Mục đích → in lại LĐX, kỳ vọng Mục đích KHÔNG bị mất nữa) để xác nhận.

**Đính chính cùng ngày — không phải lỗi đồng bộ, mà Mục đích của LĐX vốn KHÔNG nên lấy theo LĐCT:** sau khi hỏi lại, người dùng làm rõ ý muốn thực sự: Mục đích của Lệnh điều xe LUÔN mặc định hiển thị "Công tác", KHÔNG quan tâm Lệnh điều công tác nhập gì — 2 trường "Mục đích" tuy trùng tên nhưng là 2 khái niệm khác nhau (Mục đích của LĐCT mô tả lý do chuyến công tác cụ thể; Mục đích của LĐX chỉ là lý do điều động xe chung chung, vốn luôn là "đi công tác"). Bản sửa buổi sáng (mục ngay phía trên — đổi từ "ghi đè vô điều kiện" sang "chỉ đồng bộ khi LĐCT thực sự đổi Mục đích") ĐÚNG HƯỚNG nhưng CHƯA ĐỦ — sửa tiếp thêm 1 bước: bỏ hẳn việc đồng bộ Mục đích từ LĐCT (dù có điều kiện hay không), giữ nguyên phần đồng bộ Nơi đến (không đổi, vẫn theo điều kiện đã sửa).

Quyết định cuối: thêm hằng số `MUC_DICH_MAC_DINH_LENH_DIEU_XE = "Công tác"` (`lenh-dieu-cong-tac.service.ts`) — dùng làm giá trị Mục đích CỐ ĐỊNH cho LĐX ở CẢ 2 chỗ sinh LĐX (tạo cùng lúc với LĐCT trong `tao()`, và tạo sau khi thêm tài xế lúc Sửa LĐCT — "Trường hợp B" của `dongBoLenhDieuXe()`), thay cho `duLieu.mucDich`/`lenh.mucDich` cũ. "Trường hợp C" (LĐX đã có sẵn) bỏ hẳn phần đồng bộ Mục đích — chỉ còn đồng bộ Nơi đến khi thực sự đổi. Vẫn sửa riêng được Mục đích của từng LĐX qua dialog Sửa ở `/lenh-dieu-xe` như bình thường (đây chỉ là giá trị MẶC ĐỊNH lúc sinh/tạo, không khóa cứng).

Lý do: khớp đúng ý người dùng — Mục đích của LĐX là khái niệm độc lập, không nên tự động theo LĐCT dù đồng bộ có điều kiện hay không.

## [2026-08-14] Nơi đi mặc định đổi thành "P. Long Xuyên, An Giang"

Bối cảnh: người dùng yêu cầu đổi giá trị "Nơi đi" mặc định ở form Lệnh điều công tác thành "P. Long Xuyên, An Giang" — khớp tên đơn vị hành chính mới sau sáp nhập/đổi tên 2025 (Long Xuyên trở thành 1 phường trực thuộc tỉnh, không còn là thành phố thuộc tỉnh như trước).

"Nơi đi mặc định" KHÔNG hardcode trong code — lấy động từ Danh mục Địa điểm (`DiaDiem.diemDiMacDinh = true`, xem `layNoiDiMacDinh()`), quản lý qua `/dia-diem`. Bản ghi mặc định hiện có sẵn trong dữ liệu mẫu (`apps/api/prisma/them-dia-diem-mau.ts`) với `tenDayDu` cũ là "Long Xuyên".

Quyết định: đổi `tenDayDu` của bản ghi mặc định trong `them-dia-diem-mau.ts` từ "Long Xuyên" thành "P. Long Xuyên, An Giang" (chuyển "Long Xuyên" xuống làm tên viết tắt/gợi ý tìm kiếm trong `cacTenTat`, thêm "LX"). Đồng thời đổi luôn hằng số dự phòng `NOI_DI_MAC_DINH_DU_PHONG` trong `lenh-dieu-cong-tac.service.ts` (chỉ dùng khi CSDL CHƯA có địa điểm nào đánh dấu mặc định) sang cùng giá trị, để nhất quán kể cả trước khi seed dữ liệu.

**Lưu ý quan trọng cho người dùng — Claude KHÔNG có quyền truy cập CSDL thật đang chạy, chỉ sửa được code/seed script:**
- Nếu CSDL đã từng chạy `pnpm dia-diem:them-mau` trước đây (đã có "Long Xuyên" trong Danh mục Địa điểm) → **KHÔNG chạy lại script này** (sẽ tạo thêm 1 bản ghi trùng, vì script so khớp theo đúng `tenDayDu` cũ/mới khác nhau) — thay vào đó vào `/dia-diem`, tìm "Long Xuyên", bấm Sửa, đổi "Tên đầy đủ" thành "P. Long Xuyên, An Giang".
- Nếu CSDL CHƯA có địa điểm nào (mới cài đặt, chưa seed) → chạy `pnpm --filter @congtac/api dia-diem:them-mau` như bình thường, sẽ tự tạo đúng tên mới.

Phương án khác đã cân nhắc: sửa trực tiếp dữ liệu CSDL bằng script/SQL migration — không chọn vì Claude không có kết nối tới CSDL thật của người dùng trong môi trường làm việc hiện tại (chỉ chỉnh sửa code), và đây là 1 thay đổi DỮ LIỆU (không phải cấu trúc bảng) nên không phù hợp làm migration Prisma — sửa qua giao diện `/dia-diem` sẵn có là đúng công cụ, không cần thêm code.

## [2026-08-14] Danh sách LĐCT: thêm nút Sửa, đổi thứ tự cột "Thành viên" lên trước "Nơi đến"

Bối cảnh: người dùng chỉ ra danh sách `/lenh-dieu-cong-tac` thiếu nút Sửa (chỉ có Xem chi tiết/Sao chép/Hủy/In) dù `SuaLenhDieuCongTacDialog` đã có sẵn (đang dùng ở trang chi tiết), và muốn đổi thứ tự cột: "Thành viên" ra trước, đổi tên cột "Địa điểm công tác" thành "Nơi đến".

Quyết định:
1. Thêm nút Sửa (icon `Pencil`, màu xanh dương, giống hệt style nút Sửa ở `/lenh-dieu-xe`) vào cột Thao tác — đặt giữa "Xem chi tiết" và "Sao chép", chỉ hiện khi có quyền `chung-tu.sua` VÀ chứng từ chưa hủy (khớp điều kiện backend chặn sửa chứng từ đã hủy). Mở `SuaLenhDieuCongTacDialog` đã có sẵn (trước đó chỉ mở được từ trang chi tiết `/lenh-dieu-cong-tac/[id]`).
2. Đổi thứ tự cột bảng: STT — Số hiệu — **Thành viên** — **Nơi đến** — Ngày đi/về — Thao tác (trước đây Nơi đến/Địa điểm công tác đứng trước Thành viên). Đổi nhãn cột "Địa điểm công tác" thành "Nơi đến" (khớp cách gọi ở các nơi khác trong app — LĐX/GĐĐ đều gọi "Nơi đến"), đồng thời đổi placeholder ô tìm kiếm cho khớp. Không đổi tên trường dữ liệu `diaDiemCongTac` (chỉ đổi nhãn hiển thị) — tránh phải sửa schema/API không cần thiết.

Lý do: đúng yêu cầu người dùng, không có rủi ro nghiệp vụ (chỉ đổi UI, không đổi field/API).

**Bổ sung cùng ngày — nút "Xem chi tiết" đổi thành icon:** người dùng muốn gọn màn hình hơn (đặc biệt sau khi vừa thêm nút Sửa ở mục trên, cột Thao tác đã có nhiều nút). Đổi nút chữ "Xem chi tiết" (`variant="outline" size="sm"`) thành nút icon `Eye` (`variant="ghost" size="icon"`, cùng kiểu icon-button với In/Sửa/Sao chép/Hủy), có `title`/`aria-label` "Xem chi tiết" để vẫn rõ nghĩa khi hover/đọc màn hình. Đây là icon `Eye` đầu tiên dùng trong app — theo đúng quy ước "mắt = xem" phổ biến, nhất quán với các icon-button khác đã có (`Pencil` = sửa, `Printer` = in, `Copy` = sao chép, `XCircle` = hủy).

## [2026-08-14] Module Nhật ký hệ thống (xem) — brainstorm + triển khai

Bối cảnh: `NhatKyHeThong` + `NhatKyService.ghiNhan()` đã ghi log ở hầu hết thao tác quan trọng từ đầu dự án, nhưng chưa có UI xem (menu để `sapCo: true`). Người dùng yêu cầu làm tiếp module này. Đã brainstorm đầy đủ (skill `brainstorming`, nhiều vòng AskUserQuestion) — spec đầy đủ tại `docs/superpowers/specs/2026-08-14-nhat-ky-he-thong-design.md`, tóm tắt các quyết định chính:

1. **Phát hiện lúc rà soát code:** hành động **In chứng từ** (6 endpoint PDF: LĐX, LĐCT riêng, LĐCT+LĐX, toàn bộ GĐĐ của đoàn, GĐĐ riêng 1 người, GĐĐ nhiều đã chọn) trước đó KHÔNG được ghi nhật ký, dù `QUY_TAC_NGHIEP_VU.md` liệt kê "in" là hành động bắt buộc ghi. Người dùng xác nhận bổ sung — đã thêm `NhatKyService` (đường ghi) vào cả 3 controller liên quan (`LenhDieuXeController`, `LenhDieuCongTacController`, `GiayDiDuongController`), ghi ngay sau khi tạo PDF thành công, không có `giaTriTruoc`/`giaTriSau` (hành động đọc, không đổi dữ liệu).

2. **Quyền mới `nhat-ky.xem`** (`MA_QUYEN.NHAT_KY_XEM`) — CHỈ cấp cho vai trò Quản trị hệ thống (đúng `QUY_TAC_NGHIEP_VU.md`: "chỉ Quản trị hệ thống xem toàn bộ"). Vai trò này dùng `quyen: TAT_CA_MA_QUYEN` trong seed nên tự động có quyền mới mà không cần sửa gì thêm ở `VAI_TRO_DINH_NGHIA`; chỉ cần thêm `NHAT_KY_XEM` vào `DANH_SACH_QUYEN` (mảng `Quyen` upsert) — **người dùng cần chạy lại seed** (`pnpm --filter @congtac/api prisma:seed` hoặc lệnh tương đương) để quyền mới thực sự có trong CSDL và gán cho Quản trị.

3. **Nhãn hành động + nhóm lọc dùng chung** (`packages/shared/src/nhat-ky/nhan-hanh-dong.ts`) — bảng `THONG_TIN_HANH_DONG` ánh xạ mọi mã `hanhDong` hiện có (kể cả 6 mã In mới) sang nhãn tiếng Việt cụ thể + 1 trong 9 nhóm rộng (Tạo/Sửa/Xóa-Hủy/In/Đánh số/Đăng nhập-xuất/Mật khẩu/Tài khoản/Khác). Nhóm dùng làm **tag lọc kiểu pill** ở `/nhat-ky` (giống tag lọc `loaiMauIn` ở `/lenh-dieu-cong-tac`) thay vì dropdown ~25 mục rời rạc — quyết định qua brainstorm để giữ UI gọn.

4. **Tìm theo số hiệu chứng từ** — `NhatKyHeThong.doiTuongId` lưu id nội bộ (cuid), không phải số hiệu. `NhatKyXemService.timNhomTheoSoHieu()` tra ngược qua 3 bảng LĐCT/GĐĐ/LĐX (`soHieu contains`), gộp thành điều kiện `OR`. Không khớp số hiệu nào → ép where về rỗng (tránh trả nhầm toàn bộ danh sách khi từ khóa không khớp gì).

5. **Tóm tắt đối tượng không cần join thêm bảng** — rút thẳng từ `giaTriSau ?? giaTriTruoc` (JSON đã lưu sẵn từ lúc ghi log) theo bảng ưu tiên field tùy loại đối tượng (`soHieu` cho 3 loại chứng từ, `tenDangNhap`/`hoTen` cho NguoiDung, `tenDayDu` cho DiaDiem, `bienSo` cho PhuongTien, `hoTen` cho NguoiKy/NhanVien).

6. **Xem chi tiết 1 dòng** — dialog so sánh `giaTriTruoc`/`giaTriSau` bằng diff NÔNG (cấp 1, không đệ quy — đủ dùng vì các bản ghi hiện tại đều là snapshot phẳng), chỉ liệt kê trường thực sự khác, tên trường giữ nguyên dạng kỹ thuật (camelCase) — KHÔNG làm bảng ánh xạ tên trường sang tiếng Việt đầy đủ ở bản đầu (số lượng trường khác nhau giữa nhiều loại đối tượng quá lớn để làm đủ ngay, YAGNI, có thể bổ sung dần sau nếu người dùng thấy khó đọc).

7. **Xuất Excel** theo đúng bộ lọc đang áp dụng — dùng lại đúng pattern `so-cong-lenh.controller.ts`/`so-cong-lenh-excel.ts` (StreamableFile, package `xlsx` có sẵn).

8. **Bộ lọc "Người thực hiện"** tái dùng `useDanhSachNguoiDung` (hook có sẵn ở `/nguoi-dung`) — chỉ lấy trang 1 (tối đa 20 người/trang, hook không cho tùy chỉnh kích thước trang). Đủ dùng với quy mô công ty hiện tại; nếu số tài khoản vượt 20 sau này, cần sửa hook hoặc thêm tham số kích thước trang riêng cho trường hợp này.

Kiến trúc: module backend mới `apps/api/src/nhat-ky/` — đặt tên service `NhatKyXemService` (khác `NhatKyService` ở `common/nhat-ky/` — bên đó là ĐƯỜNG GHI dùng chung toàn app, bên này là ĐƯỜNG ĐỌC/xem, tách biệt có chủ đích, tránh nhầm lẫn 2 khái niệm "ghi" và "xem"). Controller/module cùng pattern đã dùng cho `so-cong-lenh`.

Việc còn treo, KHÔNG thuộc phạm vi lần này (đã ghi trong CLAUDE.md mục "Việc chưa chốt", không tự quyết định): thời gian lưu trữ tối thiểu của nhật ký hệ thống — chưa làm tính năng tự xóa/nén log theo thời gian.

Rủi ro đã ghi nhận: chưa chạy được `pnpm typecheck`/`pnpm dev` trong môi trường làm việc — cần `pnpm --filter @congtac/shared build`, `pnpm --filter @congtac/validation build`, chạy lại seed phân quyền, rồi `pnpm typecheck` + thử tay trên trình duyệt thật để xác minh (đặc biệt bảng so sánh trước/sau và tag lọc nhóm hành động).

## [2026-08-14] Sao lưu và phục hồi dữ liệu

Bối cảnh: CLAUDE.md liệt "Tần suất/nơi lưu bản sao lưu dữ liệu" vào mục "chưa chốt — hỏi lại, đừng tự đoán". Dùng skill `brainstorming`, nhiều vòng AskUserQuestion, thiết kế đổi hướng 2 lần giữa chừng theo phản hồi người dùng — spec cuối tại `docs/superpowers/specs/2026-08-14-sao-luu-phuc-hoi-du-lieu-design.md`.

**Diễn biến thiết kế (để hiểu vì sao chốt phương án cuối, không lặp lại các phương án đã bỏ):**
1. Bản đầu: lịch tự động qua Windows Task Scheduler do app tự quản lý (`schtasks`), gõ đường dẫn thư mục lưu tay, danh sách bản sao lưu quét từ 1 thư mục mặc định. Người dùng yêu cầu **"cho ngắn gọn"** → bỏ hẳn lịch tự động/Task Scheduler và danh sách quét thư mục, chỉ còn 2 nút Sao lưu/Phục hồi.
2. Người dùng chỉ ra: đường dẫn gõ tay là đường dẫn trên MÁY CHẠY BACKEND, không phải máy người đang đăng nhập — sai nếu sau này chạy qua mạng nội bộ nhiều máy nối 1 server. Đổi sang cơ chế **tải xuống/tải lên qua trình duyệt** (browser download cho sao lưu, `<input type="file">` + upload cho phục hồi) — tự động đúng máy người dùng bất kể máy đó có phải máy chạy backend hay không, không cần gõ đường dẫn.

**Quyết định cuối:**
1. **Sao lưu:** bấm nút → backend chạy `pg_dump --format=plain --clean --if-exists --no-owner --no-privileges --verbose` ra 1 file tạm (`os.tmpdir()`), ước lượng tiến trình % theo số dòng log "dumping contents of table" / tổng số bảng (đếm trước qua `information_schema.tables`) → xong tự động kích hoạt tải file xuống máy người dùng (`GET /sao-luu/tai-xuong`, đọc hết vào bộ nhớ trả `StreamableFile`, xóa file tạm ngay sau khi đọc) → không lưu danh sách bản sao lưu nào trong app, người dùng tự quản lý file trên máy mình.
2. **Phục hồi:** người dùng chọn file `.sql` từ máy mình, gõ đúng tên file để xác nhận (an toàn thao tác phá hủy) → tải lên qua `multipart/form-data` (tái dùng `multer` có sẵn, không cần `MulterModule.register()` riêng) → backend lưu tạm, `prisma.$disconnect()` rồi ngắt các kết nối Postgres khác qua 1 kết nối `pg` riêng tới database bảo trì `postgres` (`pg_terminate_backend`), chạy `psql -a -v ON_ERROR_STOP=1`, ước lượng % theo số dòng `COPY ... FROM stdin;` đã chạy qua / tổng số đếm trước trong file → thành công thì ghi 1 dòng nhật ký `PHUC_HOI_DU_LIEU` bằng kết nối `pg` trực tiếp (KHÔNG qua Prisma đã ngắt, và bắt buộc ghi SAU khi phục hồi xong — ghi trước sẽ bị chính thao tác phục hồi xóa mất, vì `--clean --if-exists` ghi đè lại đúng bảng `nhat_ky_he_thong` cũ trong file sao lưu) → app tự `process.exit(1)` sau ~1.5s, KHÔNG có gì tự khởi động lại (không thêm pm2 ở giai đoạn này) — người dùng tự đóng và chạy lại `pnpm dev`.
3. **Quyền:** 1 quyền gộp duy nhất `sao-luu.quan-ly` (không tách xem/chạy/phục hồi riêng), chỉ gán vai trò Quản trị hệ thống.
4. **Dependency mới:** thêm `pg` + `@types/pg` vào `apps/api/package.json` (dùng kết nối `pg` thô cho `pg_terminate_backend` và ghi nhật ký sau phục hồi — Prisma không hỗ trợ 2 việc này). `multer` đã có sẵn từ module nhập nhân viên, tái dùng nguyên trạng.
5. **`pg_dump`/`psql`:** đường dẫn lấy từ PATH hệ thống mặc định, cho phép ghi đè qua `.env` (`PG_DUMP_PATH`/`PSQL_PATH`) nếu máy không có sẵn trên PATH — phục vụ đóng gói/chuyển máy Văn thư sau này mà không phải sửa code.

**Cập nhật cùng ngày, sau khi người dùng thử chạy `pg_dump --version` thật:** báo lỗi "not recognized" — xác nhận Postgres của dự án chạy qua **Docker** (`docker ps` → container `conglenh-postgres`, image `postgres:16`, cổng `5432` publish ra host qua `0.0.0.0:5432->5432/tcp`), KHÔNG phải cài trực tiếp lên Windows như giả định ban đầu trong spec. Máy host sẽ không bao giờ có sẵn `pg_dump`/`psql` để cài thêm theo hướng PATH/`PG_DUMP_PATH` cũ.

Sửa lại `sao-luu.core.ts`: thêm biến `.env` mới `POSTGRES_DOCKER_CONTAINER` — có giá trị thì `chaySaoLuu()`/`chayPhucHoi()` tự chuyển sang gọi `pg_dump`/`psql` qua `docker exec` BÊN TRONG container thay vì trên host:
- Sao lưu: `docker exec -e PGPASSWORD=... <container> pg_dump ... ` (KHÔNG `-f`, để `pg_dump` ghi ra stdout bên trong container) → `proc.stdout.pipe()` thẳng vào file tạm trên host qua `WriteStream` (tránh phải `docker cp` thêm bước lấy file ra khỏi container).
- Phục hồi: `docker exec -i -e PGPASSWORD=... <container> psql ...` (KHÔNG `-f`) → `createReadStream(fileTạm).pipe(proc.stdin)` (cờ `-i` của `docker exec` nối thông stdin xuyên container).
- 3 hàm dùng kết nối `pg` thô (đếm số bảng, ngắt kết nối khác, ghi nhật ký sau phục hồi) **không đổi gì** — cổng 5432 đã publish ra host nên kết nối TCP thẳng vẫn hoạt động bình thường (đúng cách Prisma của app vẫn đang kết nối).
- Đã thêm `POSTGRES_DOCKER_CONTAINER="conglenh-postgres"` trực tiếp vào `apps/api/.env` của người dùng (không chỉ `.env.example`) để đỡ 1 bước cấu hình tay.

Thiết kế vẫn giữ nhánh "không Docker" (host có sẵn `pg_dump`/`psql`) song song — chỉ cần XÓA `POSTGRES_DOCKER_CONTAINER` khỏi `.env` là tự chuyển về cách cũ, không cần sửa code. Phù hợp nếu sau này chuyển Postgres sang cài trực tiếp trên máy Văn thư chính thức, không dùng Docker nữa.
6. **Nhật ký:** thêm nhóm `SAO_LUU` + 2 mã hành động (`SAO_LUU_THU_CONG`, `PHUC_HOI_DU_LIEU`) vào `packages/shared/src/nhat-ky/nhan-hanh-dong.ts` (tái dùng hạ tầng nhật ký module trước, không đổi schema `NhatKyHeThong`).

Kiến trúc: module mới `apps/api/src/sao-luu/` — `sao-luu.core.ts` (hàm thuần, không phụ thuộc NestJS/Prisma, để tách biệt logic pg_dump/psql/pg khỏi tầng framework), `sao-luu.service.ts` (giữ trạng thái tiến trình trong bộ nhớ, đơn tiến trình — đủ dùng vì chỉ 1 admin thao tác 1 lúc), `sao-luu.controller.ts`. Frontend: trang `/sao-luu` (menu "Sao lưu & phục hồi", nhóm Hệ thống) + `phuc-hoi-dialog.tsx` (dialog xác nhận riêng), hook `use-sao-luu.ts` (poll tiến trình qua `refetchInterval` dạng hàm của TanStack Query v5, chỉ bật khi `dangChay`).

Rủi ro đã ghi nhận (xem đầy đủ ở spec mục 8):
- Docker Desktop và container `conglenh-postgres` phải đang chạy để sao lưu/phục hồi hoạt động (đúng thực tế hiện tại — đây cũng là điều kiện để cả app chạy được, vì `DATABASE_URL` trỏ vào chính container này).
- Lệnh `docker` phải có trên PATH của máy chạy backend — đã xác nhận có (người dùng chạy được `docker ps`).
- Môi trường làm việc của Claude KHÔNG chạy được `pnpm install`/`pnpm typecheck`/`pnpm dev` đầy đủ (ổ đĩa gắn qua mount mạng rất chậm, cài đặt monorepo đầy đủ liên tục hết thời gian chờ dù đã thử nhiều cách) — chỉ rà soát code thủ công (đọc lại từng file, đối chiếu import/kiểu dữ liệu/convention với các module đã có), CHƯA build/chạy thật được lần nào, kể cả sau khi sửa sang cơ chế Docker exec. Người dùng bắt buộc phải tự chạy `pnpm install` (thêm `pg`/`@types/pg` mới), `pnpm --filter @congtac/shared build`, `pnpm --filter @congtac/validation build`, chạy lại seed phân quyền, rồi `pnpm typecheck` + thử tay sao lưu/phục hồi thật (nên thử phục hồi vào 1 CSDL test trước) trước khi tin tưởng dùng cho dữ liệu thật.
- % tiến trình là ước lượng theo số bảng, không phải theo dung lượng/thời gian thật.

## [2026-08-17] Trang Vai trò & phân quyền (xem) — chỉ read-only

Bối cảnh: menu "Vai trò & phân quyền" (`/vai-tro`) để `sapCo: true` từ đầu dự án. Rà code cho thấy dữ liệu đã đủ (`VaiTro`/`Quyen`/`VaiTroQuyen`/`NguoiDungVaiTro`), trang `/nguoi-dung` đã cho gán vai trò cho tài khoản — chỉ thiếu 1 trang xem quyền của từng vai trò. Dùng skill `brainstorming`, spec tại `docs/superpowers/specs/2026-08-17-vai-tro-phan-quyen-design.md`.

Quyết định (hỏi qua AskUserQuestion): trang **CHỈ XEM (read-only)** — không cho tạo/sửa/xóa vai trò hay sửa tập quyền qua UI. Lý do: quyền của 4 vai trò mặc định hiện cố định trong `VAI_TRO_DINH_NGHIA` (`apps/api/prisma/seed.ts`), mỗi lần chạy seed sẽ `deleteMany` + `createMany` lại toàn bộ `VaiTroQuyen` của các vai trò này theo đúng code — cho sửa qua UI sẽ bị chính seed ghi đè mất ở lần chạy tiếp theo, hoặc phải đổi lại logic seed (rủi ro hơn, có thể tự khóa nhầm quyền của chính vai trò Quản trị hệ thống). Giữ nguyên cách sửa quyền qua code như hiện tại.

Bố cục: 4 thẻ (không phải bảng ma trận) — mỗi vai trò 1 thẻ, quyền nhóm theo module, có badge số người dùng đang giữ vai trò đó (tiện theo dõi, dữ liệu có sẵn từ quan hệ `NguoiDungVaiTro`, không cần bảng mới).

Kỹ thuật: `VaiTroService.danhSach()` mở rộng trả thêm `quyen` (mã/nhóm/mô tả) + `soNguoiDung` — route/quyền giữ nguyên `GET /vai-tro` + `nguoi-dung.xem` (đã dùng từ trước cho ô chọn vai trò ở `/nguoi-dung`, không cần quyền mới; hiện chỉ Quản trị hệ thống có quyền này trong 4 vai trò mặc định). Nhãn nhóm quyền dịch tiếng Việt bằng 1 `Record` cục bộ ngay trong `apps/web/app/vai-tro/page.tsx` — không tách ra `packages/shared` như đã làm cho nhãn hành động nhật ký, vì chỉ 1 nơi dùng (khác nhật ký cần cả backend lẫn frontend đọc chung).

Rủi ro: không test được thật trong sandbox — cần `pnpm typecheck` + thử tay trên trình duyệt thật.

**Đính chính cùng ngày — đổi sang ma trận SỬA ĐƯỢC, không giữ read-only:** ngay sau khi triển khai xong bản trên, người dùng xem qua và phản hồi "làm phân quyền kiểu này không ổn" — muốn dạng liệt kê quyền, tích chọn trực tiếp cho từng vai trò thay vì chỉ xem. Hỏi lại 2 điểm mấu chốt qua AskUserQuestion:

1. **Xung đột với seed** (đúng như rủi ro đã lường trước ở quyết định gốc): chọn phương án **Quản trị hệ thống giữ CỐ ĐỊNH** (seed luôn đồng bộ lại = toàn bộ quyền mỗi lần chạy, không sửa được qua UI — giữ 1 vai trò luôn đủ quyền để sửa lại nếu lỡ cấu hình sai 3 vai trò kia), **Văn thư/Lãnh đạo TC-HC/Người xem sửa được qua UI** (seed chỉ đặt quyền mặc định ở LẦN ĐẦU tạo vai trò, các lần sau bỏ qua — `apps/api/prisma/seed.ts` sửa vòng lặp `VAI_TRO_DINH_NGHIA` thêm điều kiện `laQuanTri || !daTonTaiTruoc`).
2. **Bố cục**: đổi từ 4 thẻ sang **1 bảng ma trận** — hàng = quyền (nhóm theo module, dùng lại `NHAN_NHOM_QUYEN`), cột = 4 vai trò, ô giao là checkbox. Cột Quản trị hệ thống luôn tích + khóa; 3 cột còn lại tích được, mỗi cột có nút "Lưu thay đổi" riêng khi có thay đổi chưa lưu (state cục bộ, không tự lưu khi tích).

Kỹ thuật bổ sung: quyền mới `vai-tro.sua` (`MA_QUYEN.VAI_TRO_SUA`, chỉ Quản trị hệ thống có qua `TAT_CA_MA_QUYEN`); `VaiTroService` thêm `layToanBoQuyen()` (GET `/vai-tro/quyen`) và `suaQuyen()` (PATCH `/vai-tro/:id/quyen`, chặn cứng sửa Quản trị hệ thống ở tầng backend bằng `BadRequestException`, ghi nhật ký `SUA_QUYEN_VAI_TRO`); frontend viết lại `apps/web/app/vai-tro/page.tsx` thành bảng ma trận, thêm hook `useToanBoQuyen()`/`useSuaQuyenVaiTro()`. Spec đã ghi đè sang v2 tại cùng đường dẫn.

**Hệ quả cần nhớ:** từ nay thêm 1 quyền mới trong code (tính năng mới) sẽ KHÔNG tự động cấp cho Văn thư/Lãnh đạo TC-HC/Người xem nữa — phải vào `/vai-tro` tích tay. Chỉ Quản trị hệ thống luôn tự động có mọi quyền mới (seed đồng bộ lại `TAT_CA_MA_QUYEN`).

Rủi ro đã ghi nhận: không test được thật trong sandbox (ổ đĩa gắn qua mount làm hỏng symlink của pnpm, không chạy được `pnpm --filter build`/`typecheck` — chỉ rà soát code thủ công, đối chiếu convention với các module tương tự đã có). Người dùng cần tự chạy `pnpm --filter @congtac/shared build`, `pnpm --filter @congtac/validation build`, `pnpm --filter @congtac/api prisma:seed` (xác nhận KHÔNG ghi đè quyền đã sửa qua UI của 3 vai trò không phải Quản trị), `pnpm typecheck`, rồi thử tay trên trình duyệt.

## [2026-08-17] Màu riêng theo nhóm menu (sidebar + trang Tổng quan)

Bối cảnh: người dùng yêu cầu thiết kế lại trang Tổng quan theo hướng "hiện đại, công nghệ, sang trọng", và muốn các nhóm menu bên trái (đã gom sẵn: Chứng từ / Danh mục dùng chung / Hệ thống) có màu sắc hoặc thẻ để dễ phân biệt. Dùng skill `ui-ux-pro-max` (`--design-system`) lấy gợi ý kiểu dáng, dựng mockup qua công cụ visualize để người dùng duyệt trước khi code — người dùng chọn "Duyệt, triển khai luôn".

Quyết định: mỗi nhóm trong `NHOM_MENU` (`apps/web/lib/menu.ts`) có thêm field `nhomMau: "primary" | "shared" | "system"` — Chứng từ giữ nguyên `--primary` (xanh dương, nhóm nghiệp vụ chính); Danh mục dùng chung dùng màu mới `--group-shared` (ngọc lam/teal, xấp xỉ Tailwind teal-600); Hệ thống dùng màu mới `--group-system` (tím/violet, xấp xỉ Tailwind violet-600). KHÔNG dùng đỏ hay xanh lá cho màu nhóm vì 2 màu này đã có nghĩa cố định trong `QUY_TAC_GIAO_DIEN.md` (đỏ = cảnh báo/xóa, xanh lá = `--success`/trạng thái hoạt động) — dùng lại sẽ gây hiểu nhầm khi nhìn thấy màu đỏ/xanh lá ở menu mà không phải là cảnh báo hay trạng thái thành công.

Kỹ thuật: 2 token mới `--group-shared`/`--group-system` khai báo ở `apps/web/app/globals.css` (`:root` + `.dark`, cùng cách làm với `--primary`/`--success` — nhạt hơn, giảm chroma ở dark mode), map vào `@theme inline` thành `--color-group-shared`/`--color-group-system` để có sẵn class Tailwind (`bg-group-shared`, `text-group-system`, `border-t-group-shared`...). Helper `apps/web/lib/mau-nhom-menu.ts` export `MAU_NHOM` ánh xạ `"primary"|"shared"|"system"` sang 5 nhóm class (chấm tròn, chữ/icon, nền nhạt, vạch trái, viền trên) — dùng chung giữa `components/sidebar.tsx` (chấm màu trước tên nhóm + vạch trái 3px khi active/hover) và `app/page.tsx` (thẻ mỗi nhóm module có viền trên 3px màu nhóm, icon module tô theo màu nhóm). Thẻ thống kê ở đầu trang Tổng quan tô màu theo ngữ cảnh gần nhất (Người dùng/Vai trò → hệ thống tím, Module hoàn thành → ngọc lam) để tạo điểm nhấn thị giác, không bắt buộc khớp 1-1 với nhóm menu.

Không đổi: font Be Vietnam Pro, theme sáng/tối (2 token mới đều có biến thể `.dark`), không dùng gradient/hiệu ứng phát sáng mạnh (đúng `QUY_TAC_GIAO_DIEN.md` "Theme sáng/tối"), không dùng màu làm dấu hiệu phân biệt duy nhất (mỗi mục vẫn có icon + nhãn chữ riêng, màu chỉ là lớp nhấn thêm).

Rủi ro: không test được thật trong sandbox (như các mục trên) — cần `pnpm typecheck` + xem thật trên trình duyệt ở cả 2 theme sáng/tối để xác nhận độ tương phản màu mới đủ rõ.

## [2026-08-17] Xem/In chứng từ: hộp thoại xem trước PDF thay vì mở tab mới

Bối cảnh: người dùng phản ánh nút "Xem/In" ở các trang chứng từ (LĐCT, LĐX, GĐĐ) đang `window.open(url, "_blank")` — mỗi lần bấm nhảy sang tab trình duyệt mới, bất tiện khi thao tác nhiều chứng từ liên tiếp. Hỏi lại qua AskUserQuestion giữa 2 hướng: mở hộp thoại xem trước ngay trong trang (nhúng iframe) hoặc điều hướng thẳng tại tab hiện tại — người dùng chọn hộp thoại xem trước.

Quyết định: tạo component dùng chung `apps/web/components/xem-truoc-pdf-dialog.tsx` (`XemTruocPdfDialog`) — Dialog cỡ lớn (`max-w-4xl h-[90vh]`) nhúng `<iframe src={url}>` xem PDF ngay trong trang, có nút "Mở ở tab mới" dự phòng (trường hợp hiếm trình duyệt chặn xem PDF nhúng). In thực hiện qua nút in có sẵn trên thanh công cụ trình xem PDF của trình duyệt (Chrome/Edge/Firefox đều có) — không gọi `window.print()`, không vi phạm CLAUDE.md quy tắc #2 (PDF vẫn sinh ở backend qua headless browser như cũ, dialog chỉ hiển thị file đã sinh sẵn).

Áp dụng ở 6 chỗ: `giay-di-duong/page.tsx` (in nhiều đã chọn + xem/in 1 công lệnh), `lenh-dieu-xe/page.tsx`, `lenh-dieu-cong-tac/page.tsx`, `lenh-dieu-cong-tac/[id]/page.tsx` (2 nút: lệnh+xe và toàn bộ công lệnh/giấy đi đường). KHÔNG đổi 2 chỗ xuất Excel (`so-cong-lenh`, `nhat-ky`) — đó là tải file (`disposition: attachment`), giữ nguyên `window.open` vì mục đích khác (tải xuống, không phải xem/in).

Kỹ thuật: đã xác nhận cả 6 endpoint PDF trả `disposition: inline` (không phải `attachment`) — điều kiện bắt buộc để `<iframe>` hiển thị được thay vì trình duyệt tự tải file xuống.

Rủi ro: không test được thật trong sandbox — cần thử tay: xem trước hiển thị đúng, nút in trên thanh công cụ PDF hoạt động, nút "Mở ở tab mới" dự phòng hoạt động, đóng/mở lại dialog nhiều lần không bị kẹt trạng thái loading.

## [2026-08-17] Công cụ dev: xem cỡ chữ (font-size) mẫu in bằng rê chuột

Bối cảnh: người dùng đang chỉnh CSS các mẫu in (LĐCT/LĐX/GĐĐ) nhưng không biết một dòng chữ trên mẫu đang là cỡ bao nhiêu — chỉ có thể xem qua PDF cuối cùng (do trình duyệt render bằng plugin PDF gốc, không truy cập được DOM/CSS để kiểm tra).

Quyết định: thêm 1 chế độ dev "xem HTML thật" cho cả 6 endpoint PDF hiện có, kích hoạt qua query `?xemHtml=1` trên đúng URL đang dùng cho "Xem/In" (không tạo route riêng) — khi có query này, endpoint trả thẳng HTML gốc (đã dùng để sinh PDF) kèm 1 đoạn script nhỏ chèn ở cuối `<body>`: hộp theo dõi chuột hiện `font-size` (px + quy đổi pt, vì CSS mẫu in viết bằng pt) và viền đỏ nét đứt quanh phần tử đang trỏ tới. Có banner cam ở đầu trang nhắc đây không phải bản in thật.

Vì sao HTML xem được ở đây khớp 100% với PDF thật: đã rà toàn bộ `apps/api/src` xác nhận KHÔNG có `@media print` nào trong CSS mẫu in — HTML render màn hình thường (route debug) và PDF (Playwright `page.pdf()`, mặc định emulate media "print") dùng chung 1 bộ CSS không phân nhánh theo media, nên font-size xem được đúng như bản in.

Kỹ thuật: hàm dùng chung `chenCongCuXemPhongChu(html)` tại `apps/api/src/common/mau-in/mau-in-dung-chung.ts`. Mỗi trong 6 method controller (`lenh-dieu-xe.controller.ts` x1, `giay-di-duong.controller.ts` x2, `lenh-dieu-cong-tac.controller.ts` x3) thêm `@Query("xemHtml")` + `@Res({ passthrough: true }) res: Response` (theo đúng pattern đã dùng ở `auth.controller.ts`), rẽ nhánh trả `text/html` thay vì gọi `PdfService.xuatPdfTuHtml()` khi có query — nhánh debug bỏ qua luôn bước ghi nhật ký "Xem/In" (không phải hành động in thật, không nên tính vào nhật ký hệ thống). Xác nhận Zod schema của các endpoint có query object riêng (`inNhieuGiayDiDuongSchema`) không dùng `.strict()` nên thêm `xemHtml` vào query string không bị lỗi validate (Zod tự bỏ field lạ).

Frontend: nút "Cỡ chữ" (icon `Ruler`) ngay trong `XemTruocPdfDialog` (`apps/web/components/xem-truoc-pdf-dialog.tsx`) - bấm để chuyển iframe giữa xem PDF thật và xem HTML debug, không cần sửa URL tay hay tạo dialog riêng.

Rủi ro: không test được thật trong sandbox — cần thử tay: bấm nút "Cỡ chữ" trong dialog xem trước, rê chuột qua các dòng chữ trên mẫu in, xác nhận số hiện ra khớp với giá trị `pt` đã khai trong file `*-mau-in.ts` tương ứng.

## [2026-08-17] Điều chỉnh hàng loạt mẫu in: cỡ chữ, đường kẻ, khối ký, ngày tháng NĐ30, chức vụ + phòng ban

Bối cảnh: sau khi có công cụ "xem HTML + rê chuột xem cỡ chữ" (mục ngay trên), người dùng gửi 1 loạt yêu cầu chỉnh CSS/nội dung mẫu in dựa trên các số đo cụ thể đã xem được.

Quyết định — từng điểm:
- `.quoc-hieu` (dòng "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM") 9pt → 10pt; `.tieu-ngu` ("Độc lập - Tự do - Hạnh phúc") phải lớn hơn quốc hiệu 1 size → 11pt (trước cùng dòng dưới quốc hiệu nhưng chỉ 10pt).
- Đường kẻ dưới tên cơ quan ban hành (`.gach-2-3`, cũ 66.667%) đổi độ dài còn bằng 1/2 dòng chữ phía trên và đổi tên class thành `.gach-1-2` cho đúng nghĩa (giữ nguyên `.gach-2-3` sẽ gây hiểu lầm vì không còn là 2/3 nữa).
- `.tieu-de-chinh` (dùng chung cho tiêu đề "LỆNH ĐIỀU XE", "LỆNH ĐIỀU CÔNG TÁC" cả 2 mẫu Tuyến thường/Trạm, "CÔNG LỆNH (KIÊM) GIẤY ĐI ĐƯỜNG") 18pt → 14pt, bỏ luôn override riêng `font-size:13pt` của tiêu đề GDD để nó thừa kế 14pt chung. Riêng tiêu đề "Phần kê thanh toán" (mặt sau GĐĐ) dùng chung class này nhưng KHÔNG nằm trong yêu cầu — ghi đè riêng `font-size:18pt` tại nơi dùng để giữ nguyên kích thước cũ, tránh bị co lại ngoài ý muốn.
- Khối ký: 3 dòng "TL. GIÁM ĐỐC" (`.chuc-danh-ky`), chức vụ thật người ký (`.chuc-danh-nguoi-ky`), họ tên người ký (`.ho-ten-ky`) trước đây lệch nhau (10.5pt/800, 9pt/700, kế thừa 10pt/700) — nay đồng bộ cả 3 về `font-size: 10pt; font-weight: 700;`.
- Ngày tháng khối letterhead (dòng "..., ngày X tháng Y năm Z"): thêm hàm `dinhDangNgayVanBan()` (mau-in-dung-chung.ts) theo đúng thể thức Nghị định 30/2020/NĐ-CP — ngày luôn đệm 2 chữ số khi <10, nhưng THÁNG chỉ đệm 2 chữ số khi là tháng 1 hoặc 2 (tháng 3-9 không có số 0 phía trước). Đã rà `apps/api/src` xác nhận đây là NƠI DUY NHẤT dùng định dạng ngày kiểu văn bản này nên không cần sửa chỗ khác — các `dinhDangNgay()` dd/mm/yyyy còn lại (ô bảng biểu) giữ nguyên, không bị ảnh hưởng.
- Chức vụ + phòng ban: thêm hàm `chucVuKemPhongBan()` (`lenh-dieu-cong-tac.service.ts`) — khi chức vụ thật của Nhân viên (sau khi trim, không phân biệt hoa/thường) đúng bằng "nhân viên" VÀ có `donViCongTac`, giá trị chụp lại (snapshot) vào `ThanhVienLenhDieuCongTac.chucVu` (và do đó cả `GiayDiDuong.chucVu` vì đọc lại từ quan hệ này) sẽ ghép thêm tên phòng ban, ví dụ "Nhân viên Phòng Kế hoạch - Kinh doanh". Áp dụng tại 2 nơi snapshot: `tao()` và `sua()` (nhánh thêm thành viên mới). Không đổi các chức danh khác (Trưởng phòng, Phó phòng, Giám đốc...) — giữ nguyên như cũ.
- Riêng mẫu LỆNH ĐIỀU XE: khung biển số (`.khung-bien-so div`) 15pt → 14pt; bỏ `style="min-width:20mm;"` gán riêng cho nhãn "Ngày đi:" (trước đó hẹp hơn `min-width:32mm` mặc định của `.nhan`, khiến giá trị ngày đi lệch trái so với các trường khác) để giá trị "Ngày đi" thẳng hàng với các trường còn lại.
- Riêng mẫu LỆNH ĐIỀU CÔNG TÁC (loại "Phát hành, thu hồi vé ế"): in đậm cụm mô tả mục đích ("Phát hành vé, thu tiền...") ở cả 2 chỗ hiển thị — phụ đề dưới tiêu đề và trong câu mở đầu.

Lý do: toàn bộ đến từ phản hồi trực tiếp của người dùng sau khi dùng công cụ hover xem cỡ chữ để so sánh với thực tế in ra.

Rủi ro: không build/xem PDF thật được trong sandbox (do lỗi symlink `node_modules` khi mount ổ đĩa ngoài) — cần `pnpm typecheck` và xem lại bằng công cụ "Cỡ chữ" (hover) + in thử thật để xác nhận đúng các số đo trên, đặc biệt phần chức vụ + phòng ban (kiểm tra với 1 nhân viên có chức vụ đúng "Nhân viên" và có phòng ban) và dòng ngày tháng NĐ30 (kiểm tra với ngày ký rơi vào tháng 3-9, tháng 1-2, và tháng 10-12 để chắc cả 3 nhánh định dạng đều đúng).

## [2026-08-17] Tiếp tục chỉnh mẫu in (khổ A5): tên công ty 10pt + áp dụng chuẩn NĐ30 cho MỌI ngày đi/đến

Bối cảnh: ngay sau mục trên, người dùng gửi thêm 2 yêu cầu tiếp: (1) cụm "quốc hiệu tiêu ngữ, tên cty" ở khổ A5 phải cùng chuẩn 10pt (tiêu ngữ lớn hơn 1 size — đã làm ở mục trên, chỉ còn thiếu "tên cty"); (2) mọi chỗ hiển thị "ngày đi đến" trong TẤT CẢ mẫu in phải theo đúng chuẩn NĐ30 (chỉ đệm số 0 cho tháng 1-2), không chỉ riêng dòng ngày ký ở khối letterhead như đã làm trước đó.

Quyết định:
- "Tên cty" = `.co-quan-ban-hanh` (2 dòng "CÔNG TY TNHH MTV" + "XỔ SỐ KIẾN THIẾT AN GIANG" trong khối letterhead) — tăng 9pt → 10pt để cùng nhóm với `.quoc-hieu` (đã 10pt) và `.tieu-ngu` (đã 11pt, lớn hơn 1 size). KHÔNG đổi `.co-quan-chu-quan` (dòng "UBND tỉnh...") — người dùng chỉ nêu "quốc hiệu tiêu ngữ, tên cty", không nêu cơ quan chủ quản. Xác nhận thay đổi này KHÔNG ảnh hưởng khổ A4 (mẫu in Trạm, `.trang.mau-tram`) vì mẫu Trạm có CSS ghi đè riêng (11pt/12pt, xem `lenh-dieu-cong-tac-mau-in.ts`) độc lập với base dùng chung — đúng phạm vi "khổ A5" người dùng nêu.
- Thêm hàm `dinhDangNgayDiDenMauIn()` (`mau-in-dung-chung.ts`) — vẫn giữ định dạng gạch chéo dd/mm/yyyy (khác với `dinhDangNgayVanBan()` dùng văn xuôi "ngày...tháng...năm..." ở dòng ngày ký) nhưng áp cùng quy tắc đệm số của NĐ30: ngày luôn 2 chữ số khi <10, tháng chỉ đệm 0 khi là tháng 1/2 (vd "05/3/2026" thay vì "05/03/2026"). Áp dụng cho MỌI chỗ hiển thị ngày đi/ngày về/khoảng ngày đi-đến trong `lenh-dieu-xe-mau-in.ts` (Ngày đi/Ngày về) và `lenh-dieu-cong-tac-mau-in.ts` (`ghiChuTram()`, câu "Từ ngày...đến ngày..." mở đầu đoạn, cột "Ngày đi - về (riêng)", mặt trước GĐĐ: dòng "Từ ngày/Đến ngày" + 2 hàng đầu bảng "Ngày").
- CHỦ ĐỘNG loại 2 trường hợp khỏi phạm vi "ngày đi đến": ngày sinh (`tv.ngaySinh`, mẫu Trạm) — không phải ngày đi/đến, vẫn giữ `dinhDangNgay()` dd/mm/yyyy chuẩn cũ; và 2 file xuất Excel (`so-cong-lenh-excel.ts`, `nhat-ky-excel.ts`) — người dùng nói rõ "trong tất cả các mẫu in" (chứng từ PDF), không bao gồm sổ/nhật ký xuất Excel, nên các file này vẫn dùng `dinhDangNgay()` không đổi.

Lý do: người dùng làm rõ phạm vi 2 yêu cầu trước đó theo đúng nghĩa hẹp đã hỏi — "tên cty" là phần còn thiếu trong nhóm quốc hiệu/tiêu ngữ đã chỉnh, và "chuẩn NĐ30" cho ngày đi/đến là mở rộng quy tắc đệm số đã áp dụng đúng cho dòng ngày ký sang mọi nơi có ngày đi/về khác trong chứng từ, không phải đổi toàn bộ sang văn xuôi.

Rủi ro: không build/xem PDF thật trong sandbox — cần `pnpm typecheck` + xem thử bằng công cụ "Cỡ chữ" (đối chiếu `.co-quan-ban-hanh` = 10pt) và in thử để xác nhận các trường "Ngày đi/Ngày về" hiển thị đúng dạng "05/3/2026" (không đệm 0 tháng 3-9) ở cả 3 loại chứng từ (LĐX, LĐCT cả 3 loại mẫu, GĐĐ mặt trước) — riêng mẫu Trạm (ngày sinh) và 2 sổ Excel phải giữ nguyên dd/mm/yyyy như cũ để so sánh không bị nhầm lẫn là lỗi.

## [2026-08-17] Cơ quan chủ quản cùng size cơ quan ban hành + canh giữa chắc chắn nhóm quốc hiệu/tiêu ngữ

Bối cảnh: tiếp mạch 2 mục trên, người dùng chỉ thêm 2 điểm: (1) dòng "cơ quan chủ quản" (`.co-quan-chu-quan`, tên UBND tỉnh) phải cùng cỡ chữ với "cơ quan ban hành" (`.co-quan-ban-hanh`, tên công ty - vừa lên 10pt ở mục trên); (2) cụm "quốc hiệu, tiêu ngữ" phải canh giữa.

Quyết định:
- `.co-quan-chu-quan` 9pt → 10pt (khớp `.co-quan-ban-hanh`). Giữ nguyên `font-weight: 400` (chữ thường không đậm) — người dùng chỉ nói "cùng size", không nói cùng độ đậm; 2 dòng này vẫn phân biệt được nhờ đậm/nhạt khác nhau như thể thức Nghị định 30 quy định (cơ quan chủ quản không đậm, cơ quan ban hành đậm).
- `.quoc-hieu`/`.tieu-ngu`: dù `.cot` (khối cha) đã có `text-align: center` kế thừa xuống, nhưng 2 dòng này đang dùng `white-space: nowrap` — sau khi tăng cỡ chữ ở các mục trước (quốc hiệu 9→10pt, tiêu ngữ 10→11pt), dòng "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM" có nguy cơ vượt bề rộng cột hẹp của khổ A5, tràn lệch sang 1 bên thay vì canh giữa đúng nghĩa. Bỏ hẳn `white-space: nowrap` ở cả 2 dòng (cho phép tự xuống dòng nếu không đủ chỗ) và thêm `text-align: center` TRỰC TIẾP trên `.quoc-hieu` cùng 1 class mới `.dong-tieu-ngu` bọc quanh `.tieu-ngu` (khoiLetterhead() ở `mau-in-dung-chung.ts`) — không chỉ dựa vào kế thừa từ `.cot`, đảm bảo canh giữa chắc chắn dù có xuống dòng hay không.

Lý do: fix tận gốc rủi ro lệch canh giữa do tràn dòng khi cỡ chữ tăng, thay vì chỉ set lại text-align (vốn đã đúng ở cấp cha) mà không giải quyết nguyên nhân tràn.

Rủi ro: không build/xem PDF thật trong sandbox — cần `pnpm typecheck` + in thử/xem qua công cụ "Cỡ chữ" để xác nhận dòng quốc hiệu (dài nhất) không bị lệch trái/phải, và nếu khổ A5 thực sự không đủ chỗ thì dòng này tự xuống 2 dòng gọn gàng thay vì tràn ra ngoài cột.

## [2026-08-17] Quốc hiệu 10pt bị rớt dòng trên khổ A5 — trả lại 9pt

Bối cảnh: người dùng gửi ảnh chụp bản in thật — sau khi tăng `.quoc-hieu` lên 10pt (mục ngay trên), dòng "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM" bị rớt xuống 2 dòng ("CỘNG HÒA XÃ HỘI CHỦ NGHĨA" / "VIỆT NAM") do cột hẹp của khổ A5, dù đã bỏ `white-space: nowrap` để cho phép xuống dòng an toàn — chỉ có điều ở đây "an toàn" (không tràn lệch) nhưng lại không đúng ý muốn thẩm mỹ (muốn 1 dòng).

Quyết định: `.quoc-hieu` trả về 9pt (như nguyên bản trước khi tăng). Đồng bộ lại `.tieu-ngu` theo đúng quy tắc đã chốt trước đó ("tiêu ngữ lớn hơn quốc hiệu 1 size") — 9+1 = 10pt (trước đó khi quốc hiệu 10pt thì tiêu ngữ là 11pt, nay giảm theo tỉ lệ). Vẫn giữ nguyên phần đã sửa trước (bỏ `white-space: nowrap`, `text-align: center` trực tiếp trên `.quoc-hieu`/`.dong-tieu-ngu`) làm hàng rào an toàn — không gây hại gì khi vừa 1 dòng, chỉ phát huy tác dụng nếu sau này tên đơn vị dài hơn (sửa qua `/cau-hinh-don-vi`).

Lý do: 9pt là kích thước đã được kiểm chứng vừa đúng 1 dòng trên khổ A5 qua bản in thật — ưu tiên đúng bố cục thực tế hơn con số tuyệt đối "10pt" ban đầu.

Rủi ro: không build/xem PDF thật trong sandbox — cần in thử lại để xác nhận quốc hiệu về đúng 1 dòng, và tiêu ngữ 10pt trông cân đối với quốc hiệu 9pt (không quá chênh lệch).

## [2026-08-17] Cơ quan chủ quản + cơ quan ban hành trả về 9pt theo quốc hiệu

Bối cảnh: sau khi quốc hiệu trả về 9pt (mục ngay trên, tránh rớt dòng), người dùng yêu cầu 2 dòng "cơ quan chủ quản" (UBND tỉnh) và "cơ quan ban hành" (tên công ty) — trước đó đã tăng lên 10pt để khớp quốc hiệu lúc quốc hiệu còn 10pt — nay cũng phải cùng size với quốc hiệu, tức về lại 9pt.

Quyết định: `.co-quan-chu-quan` và `.co-quan-ban-hanh` (mau-in-dung-chung.ts) đều 10pt → 9pt, khớp lại đúng `.quoc-hieu` (9pt). Vẫn giữ nguyên độ đậm khác nhau giữa 2 dòng (`.co-quan-chu-quan` weight 400 không đậm, `.co-quan-ban-hanh` weight 700 đậm) — chỉ đồng bộ size, không đồng bộ độ đậm. Không đụng đến override riêng của mẫu Trạm (`.trang.mau-tram`, khổ A4, vẫn 11pt).

Lý do: đồng bộ cả khối letterhead (cả 2 cột trái/phải) về cùng 1 chuẩn cỡ chữ 9pt cho khổ A5, sau khi xác nhận qua bản in thật là 10pt gây rớt dòng ở quốc hiệu.

Rủi ro: không build/xem PDF thật trong sandbox — cần in thử để xác nhận toàn bộ khối letterhead (cả 2 cột) trông cân đối, đồng đều cỡ chữ.

## [2026-08-17] Quốc hiệu vẫn rớt dòng dù đã 9pt — nguyên nhân thật: bỏ `white-space: nowrap`, không phải cỡ chữ

Bối cảnh: người dùng gửi tiếp ảnh chụp bản in (số hiệu LĐCT lần này, không phải LĐX) — quốc hiệu VẪN rớt dòng ("CỘNG HÒA XÃ HỘI CHỦ NGHĨA" / "VIỆT NAM") dù đã trả về 9pt ở mục ngay trên.

Chẩn đoán lại: nguyên nhân KHÔNG phải cỡ chữ 9pt quá lớn — 9pt là giá trị gốc trước cả phiên chỉnh sửa này, chưa từng bị phàn nàn rớt dòng. Nguyên nhân thật là ở 1 quyết định trước đó cùng ngày ("Cơ quan chủ quản cùng size cơ quan ban hành + canh giữa nhóm quốc hiệu/tiêu ngữ"): đã CHỦ ĐỘNG bỏ `white-space: nowrap` trên `.quoc-hieu`/`.tieu-ngu` làm "hàng rào an toàn" chống tràn lệch. Nhưng hóa ra bề rộng cột thực tế của khổ A5 không đủ chỗ cho dòng quốc hiệu (chữ hoa + đậm) ngay cả ở 9pt nếu trình duyệt ĐƯỢC PHÉP xuống dòng tự nhiên — bản gốc trước phiên này dùng `white-space: nowrap` nên chưa bao giờ xuống dòng (chỉ tràn nhẹ ra ngoài lề cột 1 chút, không ai để ý/phản ánh vì không rõ ràng bằng việc rớt hẳn xuống dòng).

Quyết định: khôi phục lại `white-space: nowrap` cho cả `.quoc-hieu` và `.tieu-ngu` — ưu tiên giữ đúng 1 dòng (đúng định dạng gốc, đúng thể thức hành chính) hơn là "an toàn chống tràn" lý thuyết; tràn nhẹ (nếu có) khó nhận ra hơn nhiều so với bị rớt dòng hẳn. Vẫn giữ `text-align: center` trực tiếp trên `.quoc-hieu`/`.dong-tieu-ngu` (không hại gì khi đã là 1 dòng).

Lý do: bám sát hành vi bản gốc (trước phiên chỉnh sửa cỡ chữ) — vốn đã hoạt động ổn định, không có phản ánh nào về rớt dòng cho đến khi tự ý đổi `white-space` làm "phòng ngừa" một rủi ro chưa từng xảy ra.

Rủi ro: không build/xem PDF thật trong sandbox — cần in thử lại (cả mẫu LĐX và LĐCT) để xác nhận quốc hiệu về đúng 1 dòng như bản gốc.

## [2026-08-17] Quốc hiệu canh giữa sai thật khi tràn dòng — sửa bằng kỹ thuật transform, có tự phát hiện và sửa 1 lần thử sai giữa chừng

Bối cảnh: người dùng dùng đúng công cụ hover "Cỡ chữ" đã xây trước đó để kiểm tra — tooltip xác nhận `div.quoc-hieu — 12px (≈9pt)` (đúng cỡ chữ), nhưng khung viền đỏ (đường biên thật của phần tử `.quoc-hieu`) chỉ bao tới giữa chữ "NAM", nghĩa là hộp của div KHÔNG bao trọn hết dòng chữ — bằng chứng cụ thể (không phải ảnh chụp bị crop mập mờ như lần trước) rằng `text-align: center` trên 1 div block bình thường không tràn đều 2 bên khi nội dung `white-space: nowrap` rộng hơn cột thật của khổ A5.

Quyết định (sau 1 lần tự sửa sai rồi tự phát hiện, sửa lại trước khi báo người dùng): đổi kỹ thuật canh giữa `.quoc-hieu` và `.tieu-ngu` sang "div bọc ngoài `text-align: left` + phần tử con `display:inline-block; position:relative; left:50%; transform:translateX(-50%)`" — kỹ thuật này canh giữa theo đúng tâm hình học của khối chữ (dựa trên độ rộng THẬT của nó), không phụ thuộc độ rộng cột cha, nên đúng cả khi chữ tràn ra ngoài cột.

Lỗi tự phát hiện giữa chừng: lần thử đầu tiên gắn `position:relative;left:50%;transform:translateX(-50%)` TRỰC TIẾP lên `.quoc-hieu`/`.tieu-ngu` mà KHÔNG ghi đè `text-align:left` ở div cha — vì `text-align` là thuộc tính kế thừa, `.cot` đang có `text-align:center` nên vị trí "tĩnh" (trước khi cộng offset) của phần tử con đã bị `.cot` canh giữa sẵn; cộng thêm `left:50%` + `transform` lên trên nữa sẽ gây LỆCH GẤP ĐÔI (dịch hẳn sang phải, sai rõ rệt, không phải lệch nhẹ). Tự rà lại trước khi báo người dùng, phát hiện qua việc suy luận lại cơ chế `position:relative` (offset cộng vào vị trí tĩnh, không thay thế) — sửa bằng cách bọc thêm `<span>` quanh chữ, đặt `text-align:left` rõ ràng trên div cha để "reset" phần kế thừa, rồi mới áp transform lên `<span>` con.

Lý do không dùng `position:absolute` (như `.gach-1-2` đang dùng): `.gach-1-2` là đường kẻ trang trí RỖNG, không cần chiếm chỗ trong luồng layout nên absolute an toàn; còn `.quoc-hieu`/`.tieu-ngu` LÀ nội dung chính, cần giữ chiều cao dòng trong luồng bình thường (để 3 dòng quốc hiệu/tiêu ngữ/ngày ký xếp chồng đúng) — dùng `position:relative` (không rời khỏi luồng) thay vì `absolute`.

Rủi ro: không build/xem PDF thật trong sandbox — cần in thử lại và dùng chính công cụ hover "Cỡ chữ" kiểm tra khung viền đỏ của `.quoc-hieu`/`.tieu-ngu` giờ có bao trọn hết chữ (kể cả phần tràn ra 2 bên, nếu có, phải đối xứng) hay chưa.

## [2026-08-17] Khoảng cách gạch chân/chữ trong letterhead khác nhau giữa LĐX/LĐCT/GĐĐ — do line-height của từng file mẫu in khác nhau, không phải do khổ giấy/zoom

Bối cảnh: người dùng so sánh 3 ảnh chụp (LĐCT, GĐĐ, LĐX) đều khổ A5, cùng tỷ lệ zoom — khoảng cách giữa đường kẻ chân và chữ "XỔ SỐ KIẾN THIẾT AN GIANG" (và cả khoảng cách xuống dòng "Số:") vẫn nhìn khác nhau rõ. Trước đó đã giải thích sai là do khổ giấy/zoom khác nhau giữa các ảnh chụp — người dùng loại trừ khả năng đó bằng thực nghiệm có kiểm soát (cùng khổ, cùng zoom).

Chẩn đoán lại: `.dong-co-gach`/`.gach-1-2`/`.so-hieu`/`.tieu-ngu` (mau-in-dung-chung.ts) tuy dùng CHUNG 1 hàm `cssLetterheadVaKy()` cho cả 3 loại chứng từ, nhưng các giá trị khoảng cách của chúng (`bottom: -0.2mm`, `padding-bottom: 0.3mm`...) đều tính TỪ ĐÁY của khung dòng chữ (line box) — mà chiều cao khung dòng chữ = font-size × `line-height`, và `line-height` KHÔNG được khai báo trong `cssLetterheadVaKy()` mà kế thừa từ `html, body` của TỪNG file mẫu in riêng: `lenh-dieu-xe-mau-in.ts` dùng 1.35, `lenh-dieu-cong-tac-mau-in.ts` (LĐCT/GĐĐ mặc định) dùng 1.4, GĐĐ chế độ "gọn" (`.gdd-gon`, khi Nơi đi/Nơi đến quá dài) dùng 1.28, mẫu Trạm dùng 1.3. Vì 3-4 giá trị line-height khác nhau này, cùng 1 con số "-0.2mm"/"0.3mm" cho ra khoảng cách THỊ GIÁC khác nhau ở mỗi loại chứng từ — đúng như người dùng quan sát, và đây là lỗi thật (không phải ảo giác/khổ giấy/zoom như 2 lần giải thích trước).

Quyết định: cố định `line-height: 1.2` TRỰC TIẾP trên `.tieu-de-tren` (khối bao ngoài cùng của toàn bộ letterhead, trong `cssLetterheadVaKy()`) — toàn bộ nội dung bên trong letterhead (quốc hiệu, tiêu ngữ, cơ quan chủ quản/ban hành, số hiệu, ngày ký) sẽ kế thừa `line-height: 1.2` này thay vì kế thừa `line-height` của `html, body` (vốn khác nhau giữa các file mẫu in) — làm khối letterhead LUÔN render giống hệt nhau về khoảng cách bất kể đặt trong file mẫu in nào.

Lý do: fix tận gốc thay vì chỉnh tay từng giá trị `-0.2mm`/`0.3mm` riêng theo từng loại chứng từ (dễ lệch lại nếu sau này 1 trong 4 file đổi line-height của body vì lý do khác) — cô lập khối letterhead khỏi ảnh hưởng của line-height toàn trang là cách bền vững hơn.

Rủi ro: không build/xem PDF thật trong sandbox — cần in thử lại cả 3 loại (LĐX, LĐCT, GĐĐ, và cả GĐĐ chế độ "gọn" khi Nơi đi/Nơi đến dài) để xác nhận khoảng cách gạch chân/chữ trong letterhead giờ giống hệt nhau ở mọi trường hợp, đồng thời xác nhận phần nội dung CÒN LẠI của mỗi trang (không thuộc letterhead) không bị ảnh hưởng bởi thay đổi này (vì chỉ set line-height trên `.tieu-de-tren`, không đụng `html, body`).

## [2026-08-17] Phụ đề mẫu "Phát hành, thu hồi vé ế": 2 dòng phải cùng đậm

Bối cảnh: người dùng gửi ảnh chụp tiêu đề mẫu LĐCT loại "Phát hành, thu hồi vé ế" — dòng "Phát hành vé, thu tiền, nhận vé trúng và vé ế tại" (in đậm) và dòng "Đồng Tháp, Cà Mau, Sóc Trăng" (không đậm) tuy cùng cỡ chữ 11pt nhưng nhìn khác hẳn nhau do dòng dưới thiếu độ đậm.

Quyết định: bỏ `<strong>` lồng riêng quanh mỗi phần, chuyển cả khối `phuDe` (`noiDungTrangLenhDieuCongTacTuyenThuong()`, lenh-dieu-cong-tac-mau-in.ts) sang `font-weight: 700` ở cấp div bao ngoài — đảm bảo cả 2 dòng (mục đích + địa điểm công tác) luôn cùng font, cùng size (11pt, đã đúng từ trước), cùng độ đậm.

Rủi ro: không build/xem PDF thật trong sandbox — cần in thử lại mẫu "Phát hành, thu hồi vé ế" để xác nhận cả 2 dòng đậm đều nhau.

## [2026-08-17] Phụ đề "Phát hành, thu hồi vé ế" tăng lên cùng size với tiêu đề "LỆNH ĐIỀU CÔNG TÁC"

Bối cảnh: ngay sau mục trên, người dùng yêu cầu tiếp — cả khối phụ đề (2 dòng mục đích + địa điểm công tác) phải cùng cỡ chữ với tiêu đề "LỆNH ĐIỀU CÔNG TÁC" phía trên.

Quyết định: `phuDe` (`noiDungTrangLenhDieuCongTacTuyenThuong()`) đổi `font-size: 11pt` → `14pt`, khớp đúng `.tieu-de-chinh` (14pt, đã chốt ở mục cỡ chữ tiêu đề trước đó). Vẫn giữ `font-weight: 700` áp dụng cho cả khối như mục ngay trên.

Rủi ro: không build/xem PDF thật trong sandbox — cần in thử để xác nhận bố cục vẫn cân đối ở khổ A5 khi phụ đề tăng size (có thể chiếm nhiều chỗ hơn nếu địa điểm công tác dài, đã có sẵn cơ chế tự động lên A4 khi nội dung dài qua `chonKhoGiayLenhDieuCongTac`).

## [2026-08-17] Mẫu Lệnh điều xe: thu hẹp khoảng trắng trong khung biển số

Bối cảnh: người dùng yêu cầu khung viền quanh biển số xe (dưới tiêu đề "LỆNH ĐIỀU XE") sát lại gần chữ biển số hơn, bớt khoảng trắng thừa.

Quyết định: `.khung-bien-so div` (`CSS_RIENG_LENH_DIEU_XE`, lenh-dieu-xe-mau-in.ts) đổi `padding: 2.5mm 9mm` → `padding: 1.5mm 4mm` — giảm cả đệm dọc lẫn đệm ngang (đệm ngang giảm nhiều nhất, từ 9mm xuống 4mm, vì đây là phần tạo cảm giác "khoảng trắng thừa" rõ nhất 2 bên biển số).

Rủi ro: không build/xem PDF thật trong sandbox — cần in thử để xác nhận khung vừa mắt, không quá sát khiến viền chạm chữ.

## [2026-08-17] Khung biển số: giảm thêm lần 2

Bối cảnh: người dùng phản hồi lần giảm padding trước (1.5mm 4mm) vẫn chưa đủ sát, yêu cầu giảm thêm.

Quyết định: `.khung-bien-so div` padding `1.5mm 4mm` → `0.8mm 2mm`.

Rủi ro: không build/xem PDF thật trong sandbox — cần in thử, nếu viền quá sát chạm vào chữ báo lại để tăng nhẹ trở lại.

## [2026-08-17] Cấu hình logo watermark + độ mờ/kích thước qua quản trị (thay hard-code CSS)

Bối cảnh: người dùng phản ánh độ mờ logo watermark "không như nhau" giữa các mẫu in — rà code phát hiện opacity thực ra là 1 giá trị duy nhất (0.08) dùng chung, nhưng KÍCH THƯỚC lại khác nhau (mẫu Trạm 120mm, các mẫu còn lại 80mm — quyết định có chủ đích từ 2026-08-10), khiến cùng độ mờ nhưng logo to hơn nhìn "đậm" hơn. Đã brainstorm với người dùng (AskUserQuestion) và chốt: (1) cho quản trị cấu hình CẢ opacity lẫn kích thước, áp dụng THỐNG NHẤT mọi mẫu in (bỏ hẳn quy tắc phân biệt theo loại mẫu); (2) đổi logo qua upload ảnh trên giao diện web (không còn thay file thủ công); (3) độ mờ nhập theo % (0-100, không phải số thập phân CSS); (4) lưu ảnh dạng base64 trong CSDL (không dùng thư mục uploads riêng, tận dụng cơ chế `/sao-luu` có sẵn).

Quyết định — thay đổi theo từng lớp:
- **Schema** (`schema.prisma`): thêm 3 cột vào `CauHinhDonVi` (bảng cấu hình đơn vị 1 dòng duy nhất, đã có sẵn tên công ty/địa danh...): `logoBase64 String?` (null = dùng file mặc định `assets/logo-cong-ty.png` như cũ), `logoOpacityPhanTram Int @default(8)`, `logoKichThuocMm Int @default(80)`.
- **Validation** (`packages/validation/src/don-vi/sua-cau-hinh-don-vi.schema.ts`): thêm kiểm tra `logoBase64` phải đúng định dạng data URL ảnh (`data:image/(png|jpeg|jpg|webp);base64,`), giới hạn ~2.9 triệu ký tự (~2MB ảnh gốc); `logoOpacityPhanTram` số nguyên 0-100; `logoKichThuocMm` số nguyên 20-250mm.
- **Backend mẫu in** (`mau-in-dung-chung.ts`): `trangMoHinh()` đổi chữ ký, nhận `cauHinhDonVi` thay vì không tham số — dựng `<img class="hinh-mo">` với `style="width/height/opacity"` gán TRỰC TIẾP (inline style, ưu tiên cao hơn class CSS) theo giá trị cấu hình, nguồn ảnh ưu tiên `logoBase64` đã lưu, rỗng thì fallback về `layLogoBase64()` (file mặc định, không đổi cơ chế cache cũ). CSS `.hinh-mo` dùng chung bỏ hẳn `width/height/opacity` cố định, chỉ còn `position/transform/object-fit/z-index`. Đã cập nhật đúng 6 nơi gọi `trangMoHinh()` (LĐX, LĐCT Tuyến thường/Trạm/ghép LĐX, GĐĐ mặt trước/mặt sau) để truyền `cauHinhDonVi`. Xoá rule `.trang.mau-tram .hinh-mo { width:120mm; height:120mm; }` (không còn tác dụng vì inline style luôn thắng, để lại sẽ gây hiểu nhầm).
- **Giới hạn payload** (`main.ts`): phát hiện Nest mặc định giới hạn body JSON 100kb (Express `bodyParser` mặc định), không đủ cho payload sửa cấu hình có kèm `logoBase64` (~2-3MB). Tắt `bodyParser` mặc định của Nest (`NestFactory.create(AppModule, { bodyParser: false })`), tự gắn lại `express.json({limit:"5mb"})` + `express.urlencoded({limit:"5mb"})`. Thêm `express` làm dependency TRỰC TIẾP của `apps/api/package.json` (trước chỉ có `@types/express`, express thật chỉ là dependency gián tiếp qua `@nestjs/platform-express` — pnpm strict mode không cho phép import package không khai báo trực tiếp).
- **Giao diện** (`/cau-hinh-don-vi`): thêm khối "Logo mờ (watermark) trên mẫu in" — ô xem trước (hiển thị đúng độ mờ đang chọn để canh chỉnh trực quan), nút "Tải logo mới" (đọc file qua `FileReader.readAsDataURL`, kiểm tra client-side loại file + dung lượng tối đa 2MB trước khi gửi lên, không cần đợi lỗi từ backend), nút "Dùng logo mặc định" (xoá về rỗng), 2 ô nhập số "Độ mờ (%)" và "Kích thước (mm)".

Lý do: cô lập cấu hình thương hiệu (logo/độ mờ/kích thước) khỏi code, giống pattern đã có với tên đơn vị/địa danh — quản trị tự đổi được khi cần (đổi logo, họp đánh giá lại độ mờ) mà không cần sửa code/deploy lại. Loại bỏ luôn nguồn gốc thực sự của khiếu nại ban đầu (kích thước khác nhau giữa mẫu Trạm và các mẫu khác).

Cần làm thêm (không tự chạy được trong sandbox — không có Postgres thật, không có mạng để cài Chromium kiểm thử):
- Chạy `pnpm install` (thêm dependency `express` mới) rồi `pnpm --filter api prisma:migrate` để tạo 3 cột mới trong CSDL.
- `pnpm typecheck` toàn repo.
- Thử tải 1 logo mới, chỉnh độ mờ/kích thước, lưu, in thử cả 6 loại mẫu để xác nhận watermark đồng nhất đúng cấu hình mới; thử để trống logo (nút "Dùng logo mặc định") xác nhận rơi về đúng file `assets/logo-cong-ty.png` cũ.
- Cân nhắc sau này (chưa làm, chưa cần thiết ở quy mô hiện tại): tách endpoint riêng phục vụ ảnh logo thay vì trả kèm base64 trong mọi lần gọi `GET /cau-hinh-don-vi` (hiện sidebar/mẫu in đều gọi chung endpoint này, có `staleTime` 5 phút ở frontend nên không tải lại quá thường xuyên, chấp nhận được ở quy mô nội bộ này).

Rủi ro: không build/migrate/in PDF thật được trong sandbox — toàn bộ các bước "Cần làm thêm" ở trên phải thực hiện thủ công trên máy có kết nối CSDL thật.

## [2026-08-17] GĐĐ mặt trước: đồng bộ chiều cao 4 hàng bảng "Nơi đi và đến"

Bối cảnh: người dùng gửi ảnh in thật — bảng "Nơi đi và đến" (mặt trước GĐĐ) có 4 hàng, 2 hàng đầu (có dữ liệu thật) thấp hơn rõ rệt so với 2 hàng cuối (hàng trống dành cho lần đi sau), bố cục co giãn không đều trên trang A5.

Chẩn đoán: biến `caoHangTrong` (`noiDungMatTruocGdd()`) trước đây CHỈ gán `style="height:..."` cho 2 `<td>` của 2 hàng TRỐNG cuối bảng — 2 hàng đầu (có "Nơi đi: X / Nơi đến: Y" thật) không có style chiều cao nào, chỉ cao theo đúng nội dung tự nhiên của nó, THẤP HƠN rõ rệt so với giá trị cố định "14mm" gán cho 2 hàng trống.

Quyết định: gán CÙNG giá trị `caoHangTrong` cho `<td>` của CẢ 4 hàng (2 hàng dữ liệu thật + 2 hàng trống), không chỉ riêng 2 hàng trống như trước. `height` trên `<td>` trong bảng hoạt động như `min-height` (hàng nào nội dung dài hơn vẫn tự nở ra bình thường, không bị cắt) nên gán đồng loạt an toàn, không phá hàng có nội dung dài.

Rủi ro: không build/in PDF thật trong sandbox — cần in thử lại để xác nhận cả 4 hàng cao đều nhau, đặc biệt với các trường hợp Nơi đi/Nơi đến dài (chế độ "gọn" `.gdd-gon`) vẫn không bị tràn trang.

## [2026-08-17] GĐĐ mặt trước: tăng chiều cao hàng bảng để lấp khoảng trống dưới trang

Bối cảnh: sau khi 4 hàng đã đều nhau (mục ngay trên), người dùng phản hồi ý thật sự là bảng còn cách lề dưới trang A5 khá xa — cần hàng cao hơn để bố cục cân đối, lấp khoảng trống thay vì dồn cụm lên trên.

Quyết định: tăng `caoHangTrong` (nhánh nội dung KHÔNG dài, mặc định) từ `14mm` → `20mm` mỗi hàng × 4 hàng. Không đụng đến nhánh "gọn" (`tinhChieuCaoHangDongGdd()`, khi Nơi đi/Nơi đến dài) — nhánh đó đã có công thức tự tính đúng phần còn lại của trang từ 2026-08-14, không dùng hằng số này.

Rủi ro: không build/in PDF thật trong sandbox — 20mm là ước lượng dựa trên phản hồi trực quan, chưa có số đo chính xác khoảng trống còn lại; cần in thử để xác nhận đã lấp đủ sát lề dưới hay cần tăng/giảm thêm.

## [2026-08-17] GĐĐ mặt trước: đổi hằng số 20mm sang công thức tự tính chiều cao hàng bảng (nhánh mặc định)

Bối cảnh: sau khi tăng `caoHangTrong` lên `20mm` (mục ngay trên), người dùng làm rõ yêu cầu qua AskUserQuestion: giữ nguyên bố cục "4 hàng đều nhau", nhưng KHÔNG chấp nhận một số cố định đoán tay (dù là 14mm hay 20mm) — muốn chiều cao mỗi hàng được TỰ TÍNH bằng công thức.

Quyết định: thêm hàm `tinhChieuCaoHangMacDinhGdd()` (chỉ dùng cho nhánh nội dung KHÔNG dài/mặc định — nhánh "gọn" vẫn dùng `tinhChieuCaoHangDongGdd()` riêng, không đổi). Công thức: lấy chiều cao khả dụng của trang A5 (210mm − 10mm đệm trên − 8mm đệm dưới = 192mm), trừ đi một hằng số ước lượng tổng chiều cao các khối CỐ ĐỊNH phía trên bảng (khối letterhead + tiêu đề chính + 4 dòng thông tin + khối ký (không gọn) + margin-top bảng + hàng tiêu đề bảng) — hằng số `CHIEU_CAO_PHAN_TREN_BANG_MM = 112` — rồi chia đều cho 4 hàng, có sàn tối thiểu 14mm (chiều cao tự nhiên của 2 dòng "Nơi đi:/Nơi đến:") để không bao giờ ra số quá nhỏ/âm nếu ước lượng bị lệch.

Lý do: công thức của nhánh "gọn" (`tinhChieuCaoHangDongGdd`) tính chiều cao THEO SỐ DÒNG VĂN BẢN bị xuống dòng — mục tiêu khác hẳn (đảm bảo đủ chỗ cho nội dung dài), không tái dùng được cho nhánh này. Nhánh mặc định cần mục tiêu ngược lại: nội dung luôn ngắn (không xuống dòng), chiều cao hàng cần được "thổi phồng" có chủ đích để bảng lấp gần hết phần còn lại của trang — nên phải tính từ "phần trang còn lại chia đều 4 hàng", không phải từ "nội dung cần bao nhiêu".

Rủi ro: `CHIEU_CAO_PHAN_TREN_BANG_MM = 112` là ước lượng thủ công từ các giá trị CSS hiện có (font-size, margin, line-height từng khối), KHÔNG đo trên bản in thật (sandbox không render được PDF/Chromium) — chọn giá trị này để công thức cho ra kết quả ~20mm/hàng, khớp với chiều cao vừa được người dùng chấp nhận trực quan ở mục ngay trên (thay đổi mang tính "để đúng cơ chế tính toán", không phải "để đổi con số hiển thị"). Nếu in thử thấy lệch (dư/thiếu khoảng trống dưới), chỉ cần chỉnh lại DUY NHẤT hằng số `CHIEU_CAO_PHAN_TREN_BANG_MM` trong `tinhChieuCaoHangMacDinhGdd()` (tăng lên nếu bảng còn dư lề dưới, giảm xuống nếu bảng tràn/gần sát lề dưới) — không cần sửa công thức.

## [2026-08-17] GĐĐ mặt trước: chốt lại 14mm cố định cho chiều cao hàng bảng (nhánh mặc định), bỏ công thức tự tính

Bối cảnh: sau chuỗi 3 lần đổi liên tiếp trong cùng ngày (14mm cố định → 20mm cố định → công thức tự tính ra ~20mm), người dùng yêu cầu trực tiếp: "setup chiều cao mỗi hàng ở nơi đi nơi đến là 14mm."

Quyết định: `caoHangTrong` ở nhánh nội dung KHÔNG dài (mặc định) trong `noiDungMatTruocGdd()` quay về hằng số cố định `"14mm"`. Xóa hàm `tinhChieuCaoHangMacDinhGdd()` (không còn nơi nào gọi tới). Nhánh "gọn" (`tinhChieuCaoHangDongGdd()`, khi Nơi đi/Nơi đến dài) không đổi, vẫn tự tính riêng theo số dòng văn bản như từ 2026-08-14.

Lý do: yêu cầu rõ ràng, không cần suy diễn thêm — đây là lựa chọn cuối cùng của người dùng sau khi đã thấy cả phương án số cố định lớn hơn (20mm) và phương án công thức tự tính; không giữ lại code công thức không dùng tới để tránh gây nhầm lẫn cho người đọc sau này.

Rủi ro: không có — quay về giá trị đơn giản nhất, không phụ thuộc ước lượng CSS nào. Nếu sau này người dùng lại thấy khoảng trống cuối trang chưa vừa ý, cân nhắc lại từ đầu (không lặp lại vòng đổi qua đổi lại) — có thể hỏi rõ mục tiêu cuối (bảng lấp đầy trang hay đơn giản/dễ đoán) trước khi chọn hướng.

## [2026-08-17] GĐĐ mặt trước: chặn sàn tối thiểu 14mm cho công thức "gọn" (tinhChieuCaoHangDongGdd)

Bối cảnh: người dùng gửi 3 ảnh in thật so sánh. Chẩn đoán bằng số liệu cụ thể: ngưỡng kích hoạt chế độ "gọn" (`NGUONG_CANH_BAO_NHE_DO_DAI_NOI_DI_DEN = 35`, tính trên tổng độ dài Nơi đi + Nơi đến) là một proxy thô cho "nội dung có xuống dòng thật trong ô 74mm" (`uocLuongSoDong` giới hạn 44 ký tự/dòng). Trường hợp "Đồng Tháp, Cà Mau, Sóc Trăng" (28 ký tự, cộng nhãn "Nơi đến: " là 37 ký tự — vẫn dưới 44, KHÔNG xuống dòng) nhưng tổng Nơi đi+Nơi đến (52 ký tự) vượt ngưỡng 35 nên bị đẩy vào chế độ "gọn": công thức `tinhChieuCaoHangDongGdd()` tính ra chỉ ~11mm/hàng — THẤP HƠN cả 14mm cố định của nhánh mặc định — cộng thêm khối ký cũng bị thu gọn (`khoiKy(..., gon=true)`) chiếm ít không gian hơn, khiến bảng để trống một khoảng lớn cuối trang (ảnh 2). Ảnh 1 (31 ký tự, dưới ngưỡng, nhánh mặc định 14mm) và ảnh 3 (nội dung dài, xuống dòng thật, công thức "gọn" tính đúng mục đích ban đầu) đều hiển thị cân đối.

Đã hỏi người dùng 2 hướng sửa: (A) đổi hẳn điều kiện kích hoạt "gọn" sang dựa theo khả năng xuống dòng thật (đúng gốc hơn nhưng đụng tới logic ngưỡng dùng chung với cảnh báo frontend), hoặc (B) chỉ chặn sàn tối thiểu cho công thức. Người dùng chọn (B).

Quyết định: thêm `SAN_TOI_THIEU_MM = 14` vào `tinhChieuCaoHangDongGdd()`, trả về `Math.max(soDong * chieuCaoDongMm + 2*DEM_DOC_MM, SAN_TOI_THIEU_MM)`. Không đổi ngưỡng kích hoạt `NGUONG_CANH_BAO_NHE_DO_DAI_NOI_DI_DEN` (vẫn dùng chung cho cảnh báo màu ở frontend), không đổi logic thu gọn khối ký.

Rủi ro: đây là sửa cục bộ (chặn sàn), không giải quyết tận gốc việc khối ký vẫn bị thu gọn không cần thiết cho nội dung không thực sự xuống dòng — trường hợp như ảnh 2 sẽ được cải thiện đáng kể (11mm → 14mm/hàng) nhưng có thể vẫn chưa lấp đầy khoảng trống cuối trang hoàn toàn bằng ảnh 1 (do khối ký ảnh 2 vẫn nhỏ hơn ảnh 1). Cần in thử xác nhận; nếu vẫn còn dư khoảng trống rõ rệt, quay lại cân nhắc hướng (A) đã từng đề xuất.

## [2026-08-17] Hộp xem trước PDF: sửa 2 nút (Xem cỡ chữ / Mở tab mới) chồng lên nút đóng "X"

Bối cảnh: người dùng gửi ảnh chụp — 2 nút icon "Xem cỡ chữ" (Ruler) và "Mở ở tab mới" (ExternalLink) trên thanh tiêu đề hộp thoại `XemTruocPdfDialog` chồng lấn lên nút đóng "X" mặc định của `Dialog`, khó bấm.

Chẩn đoán: `DialogPrimitive.Close` trong `components/ui/dialog.tsx` định vị `absolute right-4 top-4` — tính theo mép của `DialogContent`. `XemTruocPdfDialog` dùng `DialogContent` với `p-0` (không có đệm bao quanh mặc định `p-6` như dialog thường), nên "X" nằm sát ngay góc phải/trên của toàn hộp thoại. Trong khi đó, `DialogHeader` tự đặt `px-4 py-3` và dùng `justify-between` đẩy nhóm nút Ruler/ExternalLink ra sát mép phải của chính nó — cũng gần trùng vị trí góc phải/trên đó, gây chồng lấn vùng bấm giữa nút "Mở ở tab mới" và nút "X".

Quyết định: đổi `DialogHeader` từ `px-4 py-3` sang `py-3 pl-4 pr-12` — chừa thêm khoảng trống 48px bên phải (so với 16px trước đó) để nhóm nút Ruler/ExternalLink không còn lấn vào vùng bấm của nút "X".

Rủi ro: không build/xem giao diện thật trong sandbox — cần mở thử hộp thoại xem trước PDF để xác nhận khoảng cách đã đủ, không bị lố sang trái làm tiêu đề hộp thoại bị cắt ngắn hơn cần thiết.

## [2026-08-17] Danh sách LĐCT/GĐĐ/LĐX: cột "Số hiệu" chỉ hiện phần số, ẩn ký hiệu

Bối cảnh: người dùng đề xuất cột "Số hiệu" ở cả 3 danh sách chỉ hiện phần số (vd "05"), ẩn phần ký hiệu phía sau (vd "/LĐCT") để nhường không gian ngang cho các thông tin khác — hỏi ý kiến trước khi làm.

Phân tích trước khi làm: `soHieu` lưu trong CSDL là 1 chuỗi gộp sẵn `${số}/${kyHieu}` (xem `dinhDangSoChungTu()` + `kyHieu` trong `lenh-dieu-cong-tac.service.ts`/`lenh-dieu-xe.service.ts`), không tách cột riêng — số CHƯA gồm năm (chỉ đệm 2 chữ số), nên khả năng trùng số giữa các năm là đặc tính có sẵn của cách đánh số, không phải rủi ro mới phát sinh do ẩn ký hiệu (ký hiệu không mang thông tin năm). Đồng ý với đề xuất vì ký hiệu ít cần nhìn ngay trong bảng quét nhanh.

Quyết định: thêm hàm `soHieuChiSo()` (`apps/web/lib/utils.ts`) lấy phần trước dấu "/" của `soHieu`; áp dụng vào cột "Số hiệu" ở cả 3 trang danh sách (`lenh-dieu-cong-tac/page.tsx`, `giay-di-duong/page.tsx`, `lenh-dieu-xe/page.tsx`). Giữ `title={soHieu}` (tooltip số hiệu đầy đủ khi hover) trên ô/liên kết tương ứng để không mất thông tin — số hiệu đầy đủ vẫn xem được qua tooltip, trang chi tiết, hoặc bản in/PDF (không đổi gì ở mẫu in, export Excel, hay dữ liệu lưu trong CSDL). Không đổi cột "Lệnh điều công tác" (số hiệu LĐCT cha) hiển thị trong danh sách GĐĐ — người dùng chỉ nêu cột "Số hiệu" chính của từng danh sách.

Rủi ro: không có rủi ro về dữ liệu (chỉ là cách hiển thị). Nếu về sau người dùng đổi ký hiệu (`kyHieu`) qua cấu hình, các chứng từ cũ vẫn giữ ký hiệu cũ trong `soHieu` đã lưu — điều này vốn đã đúng từ trước, không liên quan đến thay đổi hiển thị này (chỉ ảnh hưởng nếu người dùng cần phân biệt "đợt ký hiệu" ngay trong bảng mà không mở chi tiết, khi đó có thể xem qua tooltip).

## [2026-08-17] Danh sách LĐCT/GĐĐ/LĐX: ẩn cột STT

Bối cảnh: người dùng yêu cầu ẩn thêm cột STT (số thứ tự) ở cả 3 danh sách cho gọn.

Quyết định: bỏ `<TableHead>STT</TableHead>` và ô hiển thị số thứ tự tương ứng ở cả 3 trang (`lenh-dieu-cong-tac/page.tsx`, `giay-di-duong/page.tsx`, `lenh-dieu-xe/page.tsx`), chỉnh lại `colSpan` của hàng "trống"/khung xương (skeleton) cho khớp số cột còn lại (7 → 6). Ở `lenh-dieu-cong-tac` và `lenh-dieu-xe`, biến chỉ số `i` trong `.map((x, i) =>...)` không còn được dùng nơi nào khác nên bỏ luôn tham số `i`; ở `giay-di-duong`, `i` vẫn giữ lại vì còn dùng cho `nhomMauDong[i]` (tô màu xen kẽ theo nhóm LĐCT cha).

Rủi ro: không có — STT chỉ là số thứ tự hiển thị theo trang/kích thước trang, không phải dữ liệu nghiệp vụ, việc ẩn không ảnh hưởng gì đến sắp xếp/lọc/thao tác khác.

## [2026-08-17] GĐĐ mặt trước: "Nơi đi:"/"Nơi đến:" thẳng hàng bằng nhãn rộng cố định + thụt dòng treo

Bối cảnh: người dùng gửi ảnh in thật, yêu cầu tạo khoảng cách rõ ràng giữa nhãn "Nơi đi:"/"Nơi đến:" và nội dung phía sau. Đã thử qua 2 cách trong cùng ngày:
(1) Lần đầu hiểu nhầm ý thành "thụt dòng treo" CSS (`padding-left`/`text-indent`) — người dùng phản hồi không đúng ý, làm rõ lại bằng ví dụ: chỉ cần "Nơi đi:" cách 5 khoảng trắng rồi tới nội dung, "Nơi đến:" cũng vậy.
(2) Đổi sang 5 `&nbsp;` cố định sau dấu ":" — nhưng người dùng gửi ảnh in thật cho thấy KHÔNG thẳng hàng: "Nơi đi:" (7 ký tự) và "Nơi đến:" (8 ký tự) dài khác nhau 1 ký tự, nên dù cùng 5 khoảng trắng, nội dung phía sau vẫn lệch nhau — hỏi có cách nào hiển thị thẳng hàng không.

Quyết định (cách làm thứ 2, SAU ĐÓ PHÁT HIỆN LỖI — xem mục ngay dưới): kết hợp `<span class="nhan-noi-di-den">` với `display:inline-block; width:14mm` (nhãn rộng cố định) và `<div class="dong-noi-di-den">` dùng thụt dòng treo (`padding-left:14mm; text-indent:-14mm`).

## [2026-08-17] GĐĐ mặt trước: sửa lỗi "Nơi đi:"/"Nơi đến:" tràn ra ngoài bảng — đổi sang flexbox, bỏ text-indent âm

Bối cảnh: ngay sau khi áp dụng cách làm thụt dòng treo (`padding-left`/`text-indent` âm) ở mục trên, người dùng gửi ảnh in thật cho thấy lỗi mới nghiêm trọng hơn: nhãn "Nơi đi:"/"Nơi đến:" bị đẩy tràn ra HẲN bên ngoài bảng (nằm ngoài đường viền trái của bảng, lấn sang vùng lề trang).

Chẩn đoán: bảng `table.bang-in` dùng `table-layout: auto` (không phải `fixed`) — độ rộng cột đầu tiên ("Nơi đi và đến") được trình duyệt TỰ TÍNH dựa trên nội dung. Giá trị `text-indent` ÂM kết hợp với thuật toán tự tính độ rộng cột này khiến trình duyệt tính sai độ rộng cột, đẩy nội dung (và cả đường viền cột) lệch ra ngoài vị trí đúng — đây là tương tác lỗi giữa `text-indent` âm và bảng tự tính độ rộng, không phải lỗi ở giá trị 14mm.

Quyết định: bỏ hoàn toàn kỹ thuật `padding-left`/`text-indent` âm, thay bằng FLEXBOX — không có giá trị âm nào nên an toàn với mọi kiểu `table-layout`. `.dong-noi-di-den { display: flex; }`, nhãn `.nhan-noi-di-den { flex: 0 0 14mm; }` (cố định 14mm), giá trị `.gia-tri-noi-di-den { flex: 1 1 auto; min-width: 0; }` (chiếm phần còn lại, tự xuống dòng trong phạm vi của nó nhờ `overflow-wrap`/`word-break` đã có sẵn trên `table.bang-in td`). Dòng xuống dòng tự nhiên thẳng hàng dưới dòng 1 vì cùng nằm trong 1 flex item, không cần mẹo giá trị âm.

Rủi ro: `14mm` vẫn là ước lượng (~1.6mm/ký tự, nhân ký tự của nhãn dài nhất) — CHƯA đo trên bản in thật (sandbox không render được PDF/Chromium). Cần in thử xác nhận: (1) nhãn không còn tràn ra ngoài bảng, (2) nội dung 2 nhãn thẳng hàng đúng ý; nếu độ rộng nhãn chưa vừa, chỉnh lại giá trị `14mm` trong `.nhan-noi-di-den`.

## [2026-08-17] LĐCT/GĐĐ: chức vụ tài xế in "Nhân viên Lái xe" thay vì "Nhân viên [phòng ban]"

Bối cảnh: người dùng yêu cầu — trong mẫu in Lệnh điều công tác và Công lệnh kiêm giấy đi đường, nếu thành viên đoàn là tài xế thì mục "Chức vụ" phải ghi "Nhân viên Lái xe", không ghi theo phòng ban hành chính của họ (vd không phải "Nhân viên phòng Kế hoạch").

Chẩn đoán: `chucVuKemPhongBan()` (`lenh-dieu-cong-tac.service.ts`, thêm 2026-08-17 buổi trước) hiện ghép tên phòng ban (`NhanVien.donViCongTac`) vào sau "Nhân viên" khi tạo snapshot `ThanhVienLenhDieuCongTac.chucVu` — không phân biệt trường hợp người đó là tài xế. Model `NhanVien` đã có sẵn field `laTaiXe: Boolean` (đánh dấu cố định trong Danh mục Nhân viên, dùng tô màu dòng + làm nguồn chọn lái xe cho LĐX) — đây là nguồn dữ liệu đáng tin cậy để nhận biết ai là tài xế, không cần thêm field mới.

Quyết định: sửa `chucVuKemPhongBan()` — khi `chucVu` (chuẩn hóa) là "nhân viên": nếu `nv.laTaiXe === true` → trả về "Nhân viên Lái xe" (không ghép phòng ban); ngược lại mới ghép phòng ban như trước. Đổi kiểu tham số hàm thêm `laTaiXe: boolean`. Áp dụng cho MỌI thành viên có `laTaiXe = true` xuất hiện trong đoàn công tác — không giới hạn riêng người được chọn làm lái xe cho LĐX của chuyến đó (vd nếu 1 tài xế đi theo đoàn nhưng chuyến này không lái, chức vụ in ra vẫn là "Nhân viên Lái xe", đúng vai trò thực tế của họ trong công ty).

Rủi ro: đây là snapshot tại thời điểm tạo/thêm thành viên (theo đúng nguyên tắc chứng từ đã phát hành không đổi) — chỉ áp dụng cho thành viên tạo/thêm MỚI sau thay đổi này, không hồi tố các chứng từ đã lập trước đó (đã ghi "Nhân viên [phòng ban]" thì giữ nguyên, đúng thiết kế hiện có). Không build/chạy CSDL thật trong sandbox để kiểm tra — cần tạo thử 1 LĐCT có thành viên đánh dấu `laTaiXe` để xác nhận.

## [2026-08-17] LĐCT loại "Phát hành, thu hồi vé ế": chọn nhanh chuỗi địa điểm thường dùng

Bối cảnh: người dùng hỏi ý kiến cách nhập nhanh nhất cho "Nơi đến", vì loại LĐCT "Phát hành, thu hồi vé ế" có các chuỗi địa điểm lặp lại thường xuyên, ví dụ "P. Ninh Kiều, Vị Tân (TP Cần Thơ), P. Rạch Giá (An Giang)" — chuỗi gộp nhiều phường/tỉnh theo định dạng riêng, không khớp với cách combobox gợi ý địa điểm rời rạc hiện có (`ComboboxVanBan` + Danh mục Địa điểm, vốn ghép TỪNG địa điểm một chứ không lưu sẵn cả cụm đã định dạng).

Đã đề xuất và người dùng chọn phương án: thêm danh sách "Chuỗi địa điểm thường dùng" quản lý tại `/cau-hinh-don-vi`, chọn nhanh trong dialog Tạo/Sửa LĐCT khi loại là vé ế.

Quyết định: KHÔNG tạo model/module CRUD riêng (controller/service/permission/nhật ký riêng) — thay vào đó thêm 1 field mới `CauHinhDonVi.chuoiDiaDiemThuongDungVeE: Json @default("[]")` (mảng `{nhan, noiDung}`), tái dùng NGUYÊN VẸN luồng sửa cấu hình đơn vị đã có (`suaCauHinhDonViSchema` + `CauHinhDonViService.suaCauHinh()` + endpoint `PATCH /cau-hinh-don-vi`, vốn đã generic theo schema, không cần sửa controller/service) — giống hệt cách `mucDichMacDinhVeE` đang làm, chỉ khác là 1 danh sách thay vì 1 giá trị đơn. Lý do: đây là danh sách GỢI Ý nhập liệu (không phải dữ liệu nghiệp vụ cần truy vấn/báo cáo riêng), tạo hẳn 1 module CRUD mới cho vài dòng cấu hình là quá mức cần thiết, khó bảo trì lâu dài hơn cho 1 người phụ trách IT duy nhất (CLAUDE.md).

Triển khai: (1) `schema.prisma` — field mới trên `CauHinhDonVi`. (2) `packages/validation/src/don-vi/sua-cau-hinh-don-vi.schema.ts` — thêm `chuoiDiaDiemThuongDungVeE: z.array(z.object({nhan, noiDung})).max(50).optional().default([])`. (3) `apps/web/hooks/use-cau-hinh-don-vi.ts` — mở rộng interface. (4) `apps/web/app/cau-hinh-don-vi/page.tsx` — thêm section mới dùng `useFieldArray` (thêm/xóa từng dòng nhãn + nội dung), lưu chung 1 nút "Lưu thay đổi" với cả trang, không có nút lưu riêng từng dòng. (5) Component dùng chung mới `apps/web/components/chon-nhanh-dia-diem-ve-e.tsx` (`ChonNhanhDiaDiemVeE`) — dropdown `<select>` ẩn hẳn nếu danh sách rỗng, chọn 1 mục sẽ THAY THẾ toàn bộ ô "Nơi đến" (không ghép thêm), vẫn sửa tay lại được sau đó; value luôn reset về rỗng sau khi chọn để dùng lại nhiều lần. (6) Gắn vào cả `tao-lenh-dieu-cong-tac-dialog.tsx` và `sua-lenh-dieu-cong-tac-dialog.tsx`, chỉ hiện khi `loaiMauIn === "PHAT_HANH_THU_HOI_VE_E"`.

Không đụng đến Danh mục Địa điểm (`DiaDiem`) hay khái niệm "Tuyến" của module "Phân công lịch công tác" (Trạm/Tuyến/trực hủy vé ế) — module đó còn chưa build, liên quan tài xế/lịch trực luân phiên phức tạp hơn nhiều, CLAUDE.md ghi rõ cần hỏi lại người dùng riêng khi nào làm.

Rủi ro: cần chạy `pnpm --filter api prisma:migrate` (field Json mới) và `pnpm install`/build lại `packages/validation` trước khi dùng — chưa migrate/build được trong sandbox (không có Postgres thật, symlink hỏng trên ổ đĩa mount). Cần kiểm tra thủ công: lưu vài chuỗi mẫu tại `/cau-hinh-don-vi`, mở dialog Tạo/Sửa LĐCT chọn loại vé ế, xác nhận dropdown hiện đúng danh sách và điền đúng vào "Nơi đến".

## [2026-08-17] LĐCT (Tuyến thường/vé ế): cột "HỌ VÀ TÊN" bị rớt dòng do cột "CHỨC VỤ" giờ dài hơn

Bối cảnh: người dùng gửi ảnh in thật — tên "Nguyễn Thành Trung" (bảng thành viên LĐCT) bị xuống dòng giữa chừng ("Nguyễn Thành" / "Trung") dù không phải tên dài.

Chẩn đoán: bảng `table.bang-in.bang-ldct` không dùng `table-layout:fixed` — độ rộng 3 cột (STT/HỌ VÀ TÊN/CHỨC VỤ) tự cân đối theo nhu cầu nội dung. Từ sau khi `chucVuKemPhongBan()` (2026-08-17, mục "chức vụ tài xế"/"chức vụ + phòng ban") làm cột CHỨC VỤ thường xuyên dài hơn trước (vd "Nhân viên Phòng Kế hoạch - Kinh doanh", "Nhân viên Lái xe"), thuật toán tự cân đối độ rộng nhường nhiều chỗ hơn cho CHỨC VỤ, ép cột HỌ VÀ TÊN hẹp lại, khiến tên ngắn bình thường cũng bị xuống dòng xấu.

Quyết định: gán `width:45mm` cố định cho `<th>HỌ VÀ TÊN</th>` (trước đó không khai báo width, để tự do). CHỨC VỤ vẫn không khai báo width (tự do chiếm phần còn lại, có thể xuống dòng khi dài — chấp nhận được hơn tên người bị cắt giữa chừng).

Rủi ro: `45mm` là ước lượng đủ cho tên đầy đủ 3-4 từ ở cỡ chữ 10pt (bang-ldct), CHƯA đo trên bản in thật (sandbox không render được PDF/Chromium). Cần in thử xác nhận: tên không còn xuống dòng với các trường hợp thường gặp; nếu vẫn xuống dòng với tên dài hơn (5+ từ) hoặc 45mm làm CHỨC VỤ quá hẹp/xuống dòng nhiều, điều chỉnh lại con số này.

## [2026-08-17] LĐCT (Tuyến thường/vé ế): bảng thành viên ưu tiên chức vụ cao lên trên

Bối cảnh: người dùng yêu cầu bảng thành viên (STT/HỌ VÀ TÊN/CHỨC VỤ) sắp xếp người có chức vụ cao lên trên. `NhanVien.chucVu` là ô nhập TỰ DO (không có danh sách cố định) nên không có cách xác định "cao/thấp" đáng tin cậy tuyệt đối — đã hỏi lại người dùng qua AskUserQuestion, chọn phương án đề xuất: nhận diện theo từ khóa (không dấu, không phân biệt hoa/thường) trong chuỗi chức vụ, thứ bậc Giám đốc/Phó Giám đốc > Trưởng phòng/Trưởng ban > Phó phòng/Phó ban > còn lại (Nhân viên, Nhân viên Lái xe... cùng hạng thấp nhất).

Quyết định: thêm hàm `hangChucVu(chucVu): number` (0 = cao nhất, 3 = thấp nhất) trong `lenh-dieu-cong-tac-mau-in.ts`, dùng `boDauTiengViet()` (`apps/api/src/common/utils/bo-dau.util.ts`, đã có sẵn) để so khớp từ khóa không phụ thuộc dấu/hoa thường. Kiểm tra "giám đốc" TRƯỚC "phó phòng"/"phó ban" để "Phó Giám đốc" khớp đúng hạng 0 (không bị nhầm là "phó phòng"). Áp dụng `[...thanhVien].sort((a,b) => hangChucVu(a.chucVu) - hangChucVu(b.chucVu))` trong `noiDungTrangLenhDieuCongTacTuyenThuong()` (dùng chung cho cả loại "Tuyến thường" và "Phát hành, thu hồi vé ế") trước khi tạo các hàng bảng — `Array.prototype.sort` ổn định (stable, chuẩn từ ES2019) nên các thành viên CÙNG hạng chức vụ giữ nguyên thứ tự nhập ban đầu với nhau, chỉ đổi vị trí GIỮA các hạng khác nhau. STT đánh số lại theo thứ tự SAU khi sắp xếp. KHÔNG đụng đến mẫu Trạm (`noiDungTrangLenhDieuCongTacTram`, dùng `sapXepGomNhomTram()` riêng theo nhóm/trưởng đoàn, khái niệm khác).

Rủi ro: đây là ước lượng theo từ khóa, không phải danh sách chức danh đầy đủ — chức vụ lạ không khớp từ khóa nào (vd "Kế toán trưởng", "Tổ trưởng") sẽ rơi vào hạng thấp nhất trong nhóm chức vụ (3) cùng với "Nhân viên", có thể chưa đúng ý nếu công ty có thêm cấp bậc khác ngoài 4 cấp đã xác nhận. Không build/in PDF thật trong sandbox để kiểm tra — cần in thử với vài trường hợp thực tế (đặc biệt "Phó Giám đốc" và các chức danh không khớp từ khóa nào) để xác nhận đúng ý.

## [2026-08-17] LĐCT: tài xế luôn xếp dưới cùng bảng thành viên (dưới cả "Nhân viên")

Bối cảnh: ngay sau khi thêm sắp xếp theo chức vụ (mục trên), người dùng bổ sung: "thường nhân viên lái xe là dưới cùng" — tài xế nên luôn ở vị trí cuối bảng, kể cả dưới "Nhân viên" thường (không chỉ cùng hạng thấp nhất rồi tùy thứ tự nhập).

Quyết định: đổi `hangChucVu()` nhận `{chucVu, laTaiXe}` thay vì chỉ `chucVu` — nếu `laTaiXe === true` thì LUÔN trả về hạng 4 (thấp nhất, dưới cả hạng 3 "Nhân viên" và mọi từ khóa chức vụ khác), bất kể chuỗi `chucVu` trong hồ sơ ghi gì. Dùng `tv.laTaiXe` (cờ cố định trong Danh mục Nhân viên) chứ không dựa vào chuỗi hiển thị "Nhân viên Lái xe" (vì đó chỉ là chữ hiển thị, được tính SAU khi đã sắp xếp) — cùng tinh thần với `chucVuKemPhongBan()` đã làm trước đó (vai trò tài xế ưu tiên hơn chức vụ hành chính trên hồ sơ).

Rủi ro: nếu 1 tài xế đồng thời có chức vụ quản lý thực sự (hiếm, nhưng lý thuyết có thể xảy ra nếu đánh dấu `laTaiXe` sai), người này vẫn bị xếp xuống cuối theo đúng yêu cầu "luôn dưới cùng" — chấp nhận được vì người dùng dùng từ "thường" (trường hợp phổ biến) và đây là hành vi mặc định hợp lý cho tổ chức nhỏ. Cần in thử xác nhận.

## [2026-08-17] LĐCT: cột "HỌ VÀ TÊN" tự tính độ rộng theo tên dài nhất + viết tắt tên phòng ban trên chức vụ

Bối cảnh: người dùng gửi ảnh in thật — cột "HỌ VÀ TÊN" (độ rộng cố định 45mm, mục quyết định ngay trên) còn dư nhiều khoảng trống vì tên trong đoàn công tác này ngắn hơn 45mm, trong khi cột "CHỨC VỤ" bị hẹp. Đề xuất dùng độ dài họ tên dài nhất trong đoàn làm căn cứ tính độ rộng cột, thay vì 1 số cố định áp dụng chung mọi trường hợp. Đồng thời yêu cầu viết tắt 3 tên phòng ban hay ghép vào chức vụ cho gọn.

Quyết định (1 — độ rộng cột): thay `width:45mm` cố định bằng hàm tính tại chỗ `doRongCotHoTen` trong `noiDungTrangLenhDieuCongTacTuyenThuong()` — lấy độ dài ký tự của họ tên DÀI NHẤT trong `thanhVien` của lệnh này, nhân hệ số ước lượng mm/ký tự (2.0mm, chữ đậm 10pt) cộng đệm 2 bên (5mm), giới hạn trong khoảng sàn 28mm – trần 55mm (tránh cột quá hẹp với tên cực ngắn hoặc quá rộng với tên cực dài, hiếm gặp). Áp dụng `style="width:${doRongCotHoTen}mm;"` vào `<th>HỌ VÀ TÊN</th>`.

Quyết định (2 — viết tắt phòng ban): thêm `VIET_TAT_PHONG_BAN` (map cố định, khớp CHÍNH XÁC theo tên phòng ban sau khi chuẩn hóa thường/bỏ khoảng trắng — không phải quy tắc viết tắt tự động chung, vì không có cách suy luận hợp lý cho tên phòng ban bất kỳ) trong `lenh-dieu-cong-tac.service.ts`: "Phòng Kế hoạch - Kinh doanh" → "Phòng KH-KD", "Phòng Trả thưởng - Kho quỹ" → "Phòng TT-KQ", "Phòng Tài vụ - Kế toán" → "Phòng Kế toán" (đổi tên ngắn hơn, không phải viết tắt ký tự như 2 dòng kia — theo đúng yêu cầu). Áp dụng qua `vietTatPhongBan()`, gọi trong `chucVuKemPhongBan()` khi ghép `donViCongTac` vào chức vụ. CHỈ đổi cách hiển thị trên chứng từ in (snapshot `ThanhVienLenhDieuCongTac.chucVu` lúc tạo/thêm thành viên) — KHÔNG đổi dữ liệu gốc `NhanVien.donViCongTac` hay cách hiển thị ở trang Danh mục Nhân viên. Phòng ban không có trong danh sách giữ nguyên tên đầy đủ.

Rủi ro: (1) hệ số 2.0mm/ký tự + sàn/trần là ước lượng, chưa đo trên bản in thật — cần in thử với tên ngắn/dài để xác nhận không còn dư/thiếu chỗ. (2) khớp CHÍNH XÁC theo chuỗi nên nếu `donViCongTac` viết khác đi dù chỉ 1 ký tự (dấu gạch ngang khác kiểu, thêm dấu cách...) sẽ KHÔNG khớp và giữ nguyên tên đầy đủ — cần đảm bảo Danh mục Nhân viên đang lưu đúng 1 trong 3 chuỗi này; đây cũng là snapshot tại thời điểm tạo/thêm thành viên nên KHÔNG hồi tố các chứng từ đã lập trước đó.

## [2026-08-17] LĐCT vé ế: bỏ in đậm cụm mục đích + địa điểm ở câu mở đầu (đoạn văn)

Bối cảnh: sau 2 lượt qua lại về việc dòng "Giám đốc ... điều động và phân công nhiệm vụ đi công tác ... tại ..." (đoạn văn mở đầu, `cauMoDau`) không in đậm dù code có `<strong>` — xác nhận lại code đúng, nghi ngờ do chưa build/restart. Người dùng sau đó làm rõ ý thực sự: MUỐN đoạn văn này in thường (không đậm), không phải báo lỗi thiếu đậm — chỉ định rõ đoạn code cần bỏ thẻ `<strong>`.

Quyết định: bỏ `<strong>`/`</strong>` quanh `mucDichGiuaCau` và `lenh.diaDiemCongTac` trong nhánh `laVeE` của `cauMoDau` (`noiDungTrangLenhDieuCongTacTuyenThuong`) — đoạn văn mở đầu giờ in thường hoàn toàn. KHÔNG đổi nhánh `phuDe` (tiêu đề phụ dưới tiêu đề chính, cỡ 14pt) — cụm "Phát hành vé, thu tiền..." + địa điểm VẪN in đậm ở đó như trước (mục quyết định "phụ đề bold uniformity" trước đây), vì đó là 2 chỗ hiển thị khác nhau, người dùng không nhắc tới phuDe lần này. Cũng không đổi nhánh không phải vé ế (TUYEN_THUONG, `else`) — vẫn giữ `<strong>` quanh địa điểm như trước, không thuộc phạm vi yêu cầu.

Rủi ro: không có — bỏ định dạng, không ảnh hưởng dữ liệu. Cần in thử xác nhận đoạn văn hiển thị đúng ý (thường, không đậm) trong khi phuDe vẫn đậm như cũ.

## [2026-08-17] LĐCT: thêm "Ban lãnh đạo" và "Kế toán trưởng" vào thứ bậc sắp xếp chức vụ

Bối cảnh: người dùng yêu cầu "Ban lãnh đạo, Kế toán trưởng phải hiển thị trước nhân viên" trong bảng thành viên — đúng như rủi ro đã ghi ở mục thêm sắp xếp chức vụ trước đó: "Kế toán trưởng" không khớp từ khóa nào (không chứa "trưởng phòng"/"trưởng ban") nên bị rơi xuống hạng thấp nhất cùng "Nhân viên".

Quyết định: mở rộng `hangChucVu()` — hạng 0 thêm từ khóa "ban lãnh đạo" (bên cạnh "giám đốc"); hạng 1 (cùng hạng với Trưởng phòng/Trưởng ban) thêm từ khóa "kế toán trưởng" — không tạo hạng riêng cho Kế toán trưởng vì người dùng chỉ yêu cầu "trước nhân viên" (không có tiêu chí nào phân biệt rõ với Trưởng phòng), xếp chung hạng 1 là lựa chọn thực dụng, thứ bậc vẫn: 0 (Ban lãnh đạo/Giám đốc/Phó Giám đốc) > 1 (Trưởng phòng/Trưởng ban/Kế toán trưởng) > 2 (Phó phòng/Phó ban) > 3 (còn lại, Nhân viên) > 4 (Tài xế, luôn cuối).

Rủi ro: nếu công ty coi "Kế toán trưởng" cao/thấp hơn "Trưởng phòng" (khác cùng hạng), cần tách hạng riêng — hiện tại xếp ngang nhau nên thứ tự giữa 2 chức danh này trong cùng đoàn công tác giữ theo thứ tự nhập ban đầu (sort ổn định). Vẫn là ước lượng theo từ khóa, chưa in thử xác nhận.

## [2026-08-17] LĐCT: sửa lỗi viết tắt phòng ban không khớp do dấu gạch ngang khác kiểu + xác nhận đủ 3 phòng

Bối cảnh: người dùng gửi ảnh in thật — "Nhân viên Phòng Trả thưởng – Kho quỹ" (mục quyết định viết tắt phòng ban trước đó) VẪN hiển thị đầy đủ, chưa được viết tắt thành "Phòng TT-KQ" như đã làm, kèm yêu cầu: nếu 1 phòng viết tắt thì viết tắt hết các phòng còn lại (đồng bộ, không để lẫn lộn phòng viết tắt/phòng đầy đủ trong cùng bảng).

Chẩn đoán: `VIET_TAT_PHONG_BAN` so khớp CHÍNH XÁC theo chuỗi, dùng dấu gạch ngang thường "-" làm khóa (vd `"phòng trả thưởng - kho quỹ"`), nhưng dữ liệu `NhanVien.donViCongTac` thực tế lưu dấu gạch ngang DÀI "–" (en dash, thường do gõ trên điện thoại/bàn phím tự sửa) — 2 chuỗi khác nhau về mặt ký tự nên so khớp thất bại âm thầm, giữ nguyên tên đầy đủ (không báo lỗi).

Quyết định: `vietTatPhongBan()` chuẩn hóa MỌI kiểu dấu gạch ngang (‒ – — ―) về dấu gạch ngang thường "-" trước khi so khớp, để không phụ thuộc người nhập gõ kiểu gạch ngang nào. Đã hỏi lại người dùng: công ty CHỈ có đúng 3 phòng ban đã viết tắt (Kế hoạch - Kinh doanh, Trả thưởng - Kho quỹ, Tài vụ - Kế toán), không còn phòng nào khác — nên sau khi sửa lỗi khớp dấu gạch ngang, `VIET_TAT_PHONG_BAN` đã bao phủ ĐẦY ĐỦ mọi phòng ban của công ty, tự động thỏa yêu cầu "nếu 1 phòng viết tắt thì viết tắt hết các phòng còn lại" (vì mọi phòng ban đều luôn được viết tắt khi ghép vào chức vụ, không có trường hợp còn sót tên đầy đủ) — không cần thêm cơ chế phát hiện xuống dòng hay điều kiện phức tạp nào khác.

Rủi ro: đây vẫn là snapshot lúc tạo/thêm thành viên — các chứng từ đã lập TRƯỚC khi sửa lỗi này (kể cả tạo sau lần thêm viết tắt trước đó nhưng dữ liệu dùng gạch ngang dài) vẫn giữ nguyên tên đầy đủ đã snapshot, không hồi tố. Nếu công ty có thêm phòng ban mới sau này, phải nhớ thêm dòng mới vào `VIET_TAT_PHONG_BAN` (đã ghi chú ngay trong code).
