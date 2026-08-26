# Quy tắc nghiệp vụ

## Quy trình chung

**Không có bước phê duyệt** — Văn thư lập và in trực tiếp, không cần trình/chờ lãnh đạo duyệt (xem `NHAT_KY_QUYET_DINH.md` mục "Bỏ luồng phê duyệt").

1. Văn thư lập chứng từ hoàn chỉnh.
2. Hệ thống cấp số chứng từ ngay khi tạo để Văn thư kiểm tra.
3. Văn thư in toàn bộ chứng từ.
4. Chứng từ được ký và đóng dấu theo quy định (ngoài hệ thống).
5. Hệ thống lưu lịch sử lập, sửa, in và hủy chứng từ.

Người ký cả 3 loại chứng từ là lãnh đạo Phòng TC-HC (Trưởng phòng hoặc Phó Trưởng phòng). Thể thức ký thường dùng: `TL. GIÁM ĐỐC`.

## Quản lý số chứng từ

- Ba dãy số LĐCT, GĐĐ, LĐX quản lý **độc lập**.
- Cho phép thiết lập số bắt đầu của từng dãy theo từng năm; sang năm mới cho phép thiết lập lại.
- Số được cấp khi tạo chứng từ, không được trùng, không tái sử dụng số của chứng từ đã hủy (Hủy = đánh dấu `daHuy=true`, giữ nguyên bản ghi).
- Có nhật ký người cấp số, thời gian cấp, lý do hủy.
- **Xóa cứng (ngoại lệ có kiểm soát, bổ sung 2026-08-19, đơn giản hóa 2026-08-20):** quyền riêng `chung-tu.xoa` (chỉ Văn thư + Quản trị hệ thống) cho phép xóa hẳn 1 LĐCT khỏi CSDL — cascade luôn GĐĐ con + LĐX liên kết — khác hẳn Hủy. **Chỉ xóa được khi lệnh đang giữ SỐ MỚI NHẤT cả 3 dãy cùng lúc** (LĐCT, từng GĐĐ của thành viên, LĐX nếu có) — kiểm tra lại đầy đủ ở server, không chỉ ẩn nút ở giao diện. Bắt gõ lại đúng số hiệu chứng từ để xác nhận. Sau khi xóa, bộ đếm (`CauHinhDanhSo.soHienTai`) của cả 3 dãy liên quan được **tính lại bằng chính MAX(số) còn tồn tại thật sự** (không phải trừ theo số lượng đã xóa) — chứng từ lập tiếp theo tự nhiên nhận lại đúng số vừa xóa, không cần chọn gì thêm, không dùng bảng "số trống" riêng. Vẫn ghi nhật ký hệ thống đầy đủ dù bản ghi chứng từ đã mất. Xem `NHAT_KY_QUYET_DINH.md` mục "Xóa cứng chứng từ - đơn giản hóa 2026-08-20".
- **Định dạng hiển thị/in:** đệm số 0 tối thiểu 2 chữ số (01, 02, ..., 09, 10, 11, ...). Bộ đếm trong CSDL vẫn là số nguyên thuần; chỉ định dạng lúc hiển thị/in qua tiện ích dùng chung `dinhDangSoChungTu()` (`packages/shared`) — mọi nơi hiển thị số chứng từ đều phải dùng tiện ích này, không tự ghép chuỗi.
- **Ký hiệu in trên chứng từ** (LĐCT/GĐĐ/LĐX) là hằng số dùng chung `KY_HIEU_LOAI_CHUNG_TU` (`packages/shared`), tách biệt với mã nội bộ `LDCT`/`GDD`/`LDX` dùng làm khóa CSDL cho 3 dãy số. Nếu công ty đổi cách viết ký hiệu sau này, chỉ sửa 1 chỗ trong hằng số này, không cần migration.
- **Khi build module LĐCT/GĐĐ/LĐX (tạo chứng từ):** phải lưu lại chuỗi số hiệu đầy đủ đã ghép sẵn (vd "01/LĐCT-XSKT") vào chính bản ghi chứng từ tại thời điểm tạo — không ghép động (ký hiệu + số) mỗi lần hiển thị. Ghép động sẽ khiến sau này đổi ký hiệu làm sai lệch số hiệu của các chứng từ cũ đã in giấy.

### Cơ chế cấp số (bắt buộc dùng transaction)

Không lấy số hiện tại rồi cộng 1 ở frontend — sẽ trùng số khi nhiều Văn thư thao tác đồng thời. Trình tự đúng:

1. Khóa dòng cấu hình của dãy số tương ứng.
2. Đọc số hiện tại.
3. Tăng số.
4. Tạo chứng từ với số vừa cấp.
5. Ghi lịch sử cấp số.
6. Commit transaction.

## Ký và đóng dấu

- Cả 3 loại chứng từ đều phải đóng dấu.
- Cho phép chọn người ký, chức danh, thể thức ký.
- Ký và đóng dấu thực hiện ngoài hệ thống (trên bản in giấy) — hệ thống không theo dõi trạng thái ký/đóng dấu riêng, chỉ ghi nhật ký khi tạo/sửa/in/hủy chứng từ.

## Cấu trúc dữ liệu chứng từ

### Lệnh điều công tác (LĐCT)

**Lập LĐCT là 1 form duy nhất, nút Lưu tạo cùng lúc cả 3 loại chứng từ** (LĐCT + một GĐĐ cho mỗi thành viên + một LĐX nếu đoàn có tài xế) trong 1 transaction — xem chi tiết cơ chế trong `NHAT_KY_QUYET_DINH.md` mục "LĐCT sinh kèm GĐĐ và LĐX".

| Trường | Kiểu / nguồn | Bắt buộc | Ghi chú |
|---|---|---|---|
| Số LĐCT | Chuỗi, tự sinh | Có | Theo dãy số LĐCT theo năm |
| Ngày lập | Ngày | Có | Mặc định = ngày tạo, sửa được bất cứ lúc nào trừ khi đã hủy (không có bước duyệt) |
| Căn cứ | Văn bản dài | Không | Có trong CSDL nhưng **ẩn khỏi form Lập/Sửa** để gọn giao diện (phản hồi người dùng 2026-08-10) — bật lại nếu sau này cần |
| Địa điểm công tác | Tham chiếu Danh mục địa điểm | Có | Cho phép nhập tự do nếu chưa có trong danh mục (ô `ComboboxVanBan` như LĐX) |
| Mục đích | Văn bản ngắn | Có | Đổi tên từ "Nhiệm vụ / nội dung" (2026-08-10) để đồng nhất cách gọi với LĐX; mặc định điền sẵn "Công tác" giống quy ước chung 3 loại chứng từ |
| Ngày đi / về | Ngày | Có | Mặc định áp cho cả đoàn, cho sửa riêng theo từng thành viên (thực tế: người trực cuối tuần ở Trạm về trễ hơn người khác cùng đoàn). Không có thành phần giờ — đồng nhất với LĐX |
| Danh sách thành viên | Bảng con, nhiều tham chiếu Nhân sự (ô tìm-chọn-nhiều, hiển thị số lượng đã chọn) | Có | Họ tên, chức vụ, CCCD tự động theo nhân sự. Ô ngày đi/về riêng của mỗi thành viên mặc định HIỂN THỊ trùng ngày chung đoàn (không để trống nhìn như hỏng) — chỉ thật sự lưu thành "ngày riêng" nếu người dùng sửa khác đi, còn nếu giữ nguyên thì gửi lên server dưới dạng "theo đoàn" (để GĐĐ vẫn tự cập nhật đúng khi sau này sửa ngày chung). Thêm 1 thành viên mang cờ tài xế và chưa ai được chọn làm tài xế → tự động chọn người đó làm tài xế + tự điền biển số xe thường dùng của họ nếu có. Xóa 1 thành viên khỏi đoàn → hỏi xác nhận có hủy GĐĐ của người đó không, không tự hủy âm thầm |
| Tài xế + biển số xe | Chọn trong số thành viên mang cờ tài xế + tham chiếu Phương tiện | Không | Chỉ hiện ô chọn biển số khi trong danh sách thành viên có người là tài xế. Có chọn → tự tạo kèm 1 LĐX khi Lưu |
| GĐĐ liên kết | Tự sinh | — | Không phải trường nhập — hệ thống tự tạo 1 GĐĐ cho mỗi thành viên khi Lưu |
| LĐX liên kết | Tham chiếu, tự sinh | Không | Chỉ có khi đã chọn tài xế + biển số |
| Người ký / chức danh | Tham chiếu Danh mục người ký | Có | Chức danh tự động, vd. TL. GIÁM ĐỐC |
| Đã hủy | Boolean, mặc định false | Có | Không có trạng thái nhiều nấc — chỉ có cờ đã hủy hay chưa (không có bước phê duyệt). Hủy LĐCT hỏi xác nhận rồi hủy cascade toàn bộ GĐĐ con + LĐX liên kết chưa hủy, dùng chung 1 lý do hủy |
| Lý do hủy | Văn bản | Điều kiện | Bắt buộc nếu đã hủy = true |
| Người tạo, thời gian | Tự động | Có | |

### Công lệnh kiêm Giấy đi đường (GĐĐ)

**Không phải bản snapshot cố định.** Các trường "tự động theo LĐCT/thành viên" hiển thị theo dữ liệu mới nhất khi xem/in — sửa LĐCT hoặc ngày riêng của thành viên thì GĐĐ liên quan tự cập nhật theo, khác với cách LĐX snapshot dữ liệu lúc tạo.

**Xem qua 2 nơi:** trang chi tiết LĐCT (xem toàn bộ GĐĐ của 1 đoàn, kèm nút in gộp) và mục menu riêng "Công lệnh / Giấy đi đường" (`/giay-di-duong`, danh sách GDD độc lập không qua từng LĐCT — tìm theo tên người/số hiệu, in riêng 1 người). Không có tạo/sửa/hủy riêng ở trang danh sách này — GĐĐ luôn sinh/hủy theo LĐCT.

| Trường | Kiểu / nguồn | Bắt buộc | Ghi chú |
|---|---|---|---|
| Số GĐĐ | Chuỗi, tự sinh | Có | Dãy số riêng theo năm, cấp cùng lúc với LĐCT trong 1 transaction |
| LĐCT liên kết | Tham chiếu | Có | Một GĐĐ cho mỗi thành viên trong đoàn |
| Họ tên/chức vụ/CCCD | Tự động theo thành viên | Có | |
| Nơi đi/đến | Tự động theo LĐCT | Có | Sửa riêng được nếu lộ trình cá nhân khác đoàn |
| Ngày đi/về | Tự động theo LĐCT hoặc ngày riêng của thành viên | Có | Không có thành phần giờ |
| Phương tiện sử dụng | Tự động theo LĐCT | Không | |
| Xác nhận nơi đến (mặt sau) | Văn bản + vùng ký/đóng dấu | Không | Để trống khi in, điền tay sau chuyến đi |
| Người ký/chức danh | Tự động theo LĐCT | Có | |
| Đã hủy | Boolean, giống LĐCT | Có | Tự hủy khi: hủy cả LĐCT (cascade), hoặc xóa riêng thành viên đó khỏi đoàn (có hỏi xác nhận) |

### Lệnh điều xe (LĐX)

| Trường | Kiểu / nguồn | Bắt buộc | Ghi chú |
|---|---|---|---|
| Số LĐX | Chuỗi, tự sinh, chụp lại lúc tạo (vd "01/LĐX") | Có | Dãy số riêng theo năm, đệm số 0 tối thiểu 2 chữ số |
| LĐCT liên kết | Tham chiếu, nullable | Không | Có khi LĐX được tạo kèm từ nút Lưu của LĐCT (đoàn có tài xế + đã chọn biển số). Nơi đi/đến, mục đích, ngày đi/về, lái xe/biển số đồng bộ theo LĐCT/thành viên tài xế khi có thay đổi liên quan đến tài xế đó (đổi ngày riêng của tài xế, đổi nơi đi/đến/mục đích chung đoàn, đổi biển số) — thay đổi không liên quan (vd thành viên khác đổi ngày) không ảnh hưởng. LĐX tạo độc lập (không qua LĐCT) không có liên kết này, vẫn hoạt động y như trước |
| Lái xe | Tham chiếu Nhân sự (đánh dấu tài xế) + chụp lại họ tên lúc tạo | Có | |
| Biển số xe | Tham chiếu Phương tiện + chụp lại biển số lúc tạo | Có | Chọn lái xe xong tự gợi ý biển số theo xe *thường dùng* của lái xe đó (`PhuongTien.taiXeThuongDungId`) nếu có — vẫn sửa lại được bình thường |
| Dòng xe | Chụp lại nhãn hiệu phương tiện lúc tạo | Có | |
| Nơi đi / Nơi đến | Văn bản thuần, gợi ý gõ-tìm từ Danh mục địa điểm nhưng cho gõ tự do | Có | Không bắt buộc khớp danh mục — giống cách LĐCT sẽ làm sau này |
| Mục đích | Văn bản ngắn | Có | Mặc định điền sẵn "Công tác", người dùng sửa lại được — **quy ước dùng chung cho cả 3 loại chứng từ** (áp dụng cho LĐCT/GĐĐ khi build sau này) |
| Ngày lập / Ngày đi / Ngày về (thứ tự hiển thị trên giao diện) | Ngày | Có | Ngày lập (tên trường CSDL `ngayKy`) mặc định = ngày tạo, quyết định năm cấp số hiệu; sửa được bất cứ lúc nào, trừ khi đã hủy. Ngày về không được sớm hơn ngày đi (kiểm tra ở cả giao diện lẫn server) |
| Người ký / chức danh / thể thức ký | Tham chiếu người đang "Đang ký chính thức" trong Danh mục người ký, chụp lại lúc tạo | Có | Chặn tạo nếu danh mục chưa có ai đang ký chính thức |
| Đã hủy | Boolean, mặc định false | Có | Không có trạng thái nhiều nấc/luồng phê duyệt — Văn thư Tạo xong sửa được ngay, in được ngay (`GET /lenh-dieu-xe/:id/pdf`), không cần chờ ai duyệt. Chỉ có 2 hành động sau khi tạo: **Sửa** (bất cứ lúc nào, cho đến khi hủy) và **Hủy** (→ đã hủy = true, bắt buộc lý do, không sửa được nữa). Xem `NHAT_KY_QUYET_DINH.md` mục "Bỏ luồng phê duyệt" |
| Lý do hủy | Văn bản | Điều kiện | Bắt buộc khi hủy |

**Hủy chỉ đánh dấu `daHuy = true`, không xóa khỏi CSDL** — đúng CLAUDE.md quy tắc TUYỆT ĐỐI #6. Có Xóa cứng THẬT SỰ cho LĐCT (cascade GĐĐ+LĐX) nhưng là chức năng RIÊNG, quyền riêng (`chung-tu.xoa`), chỉ áp dụng khi đang là số mới nhất — xem mục "Quản lý số chứng từ" phía trên. LĐX hiện KHÔNG có nút xóa cứng độc lập riêng (ngoài phạm vi, chỉ xóa được kèm theo LĐCT cha).

Phân quyền dùng lại nhóm `chung-tu.*` (`.xem`, `.tao`, `.sua`, `.huy`, `.in`) — không có `.trinh-duyet`/`.phe-duyet`/`.tu-choi` (đã bỏ, xem `NHAT_KY_QUYET_DINH.md`). Vai trò Lãnh đạo Phòng TC-HC vẫn giữ (dùng cho việc khác như xem báo cáo, thay người ký khi vắng mặt) nhưng không còn quyền phê duyệt.

**In ấn (bước 7):** `GET /lenh-dieu-xe/:id/pdf` (quyền `chung-tu.in`) trả PDF thật dựng từ HTML/CSS qua Chromium headless (Playwright, `PdfService` dùng chung trong `apps/api/src/common/pdf`) — đúng CLAUDE.md quy tắc TUYỆT ĐỐI #2, không dùng `window.print()`. Frontend chỉ có 1 nút "Xem/In" mở PDF ở tab mới, không tách riêng màn hình xem chi tiết. Mẫu in theo ảnh người dùng cung cấp — chi tiết xem `NHAT_KY_QUYET_DINH.md` mục 2026-08-07 "Bước 7 lộ trình".

**In ấn LĐCT/GĐĐ — tách 2 file PDF theo chế độ 1 mặt/2 mặt:** LĐCT và LĐX in 1 mặt, còn GĐĐ in 2 mặt (mặt sau để trống điền tay). Một máy in chỉ đặt được 1 chế độ mặt cho toàn bộ 1 lần in nên KHÔNG gộp chung 1 file PDF duy nhất — trang chi tiết LĐCT có 2 nút tách riêng gọi `GET /lenh-dieu-cong-tac/:id/pdf-lenh` (LĐCT + LĐX, 1 mặt) và `GET /lenh-dieu-cong-tac/:id/pdf-giay-di-duong` (toàn bộ GĐĐ đang hoạt động, nhiều trang — mỗi thành viên 2 trang, nhắc bật in 2 mặt trên máy in trước khi in). LĐCT tự động chuyển khổ A5→A4 khi đoàn > 10 người hoặc nội dung mục đích/địa điểm quá dài (`chonKhoGiayLenhDieuCongTac()`, đo tại thời điểm generate, người dùng không cần chọn tay); GĐĐ cố định A5, 2 mặt. Mẫu dựng từ 5 mẫu Công lệnh kiêm giấy đi đường thật do người dùng cung cấp — chi tiết bố cục/số hiệu từng mặt xem `NHAT_KY_QUYET_DINH.md` mục "Mẫu in LĐCT + GĐĐ dựng từ 5 mẫu Công lệnh kiêm giấy đi đường thật".

## Danh mục cán bộ, nhân viên

Dữ liệu: họ tên, ngày sinh đầy đủ, chức vụ, đơn vị/phòng ban, CCCD, đánh dấu tài xế, trạng thái làm việc/ngừng. Chức vụ trống khi nhập Excel/Word → tự gán "Nhân viên".

Chức năng: thêm/sửa/xóa (một hoặc nhiều), nhập từ Excel/Word có kiểm tra trước khi nhập, không trùng (theo CCCD + ngày sinh), tìm kiếm gần đúng có bỏ dấu tiếng Việt, lọc/nhóm/sắp xếp/phân trang (20/50/100 dòng), dòng tài xế tô màu xanh dương.

## Danh mục phương tiện

Dữ liệu: biển số, nhãn hiệu/dòng xe, loại xe, số chỗ, tài xế thường dùng, ghi chú, trạng thái. Chuẩn hóa biển số, không trùng biển số.

## Danh mục địa điểm công tác

Một danh mục duy nhất (không tách "tuyến công tác" thành bảng riêng — xem lý do trong `NHAT_KY_QUYET_DINH.md`). Mỗi địa điểm là 1 nơi đến rời rạc (không phải hành trình nhiều chặng); khi lập LĐCT/GĐĐ sau này ghép nhiều địa điểm thành 1 câu là việc của module đó, không phải của danh mục.

Dữ liệu: tên đầy đủ, các cách ghi tắt khác (nhiều, dùng khi cần khớp chỗ trống trên mẫu in — vd "CL", "MT" cho Đồng Tháp), ghi chú, trạng thái (đang dùng/ngừng dùng), đánh dấu "thường dùng" (hiện lên đầu danh sách gợi ý khi chọn trong LĐCT — thay cho khái niệm "tuyến"), đánh dấu "điểm đi mặc định" (dùng cho GĐĐ tự động điền Nơi đi, vd trụ sở công ty). Không bao gồm chi nhánh/đại lý vé số/cơ quan liên quan ở phạm vi hiện tại. Có gợi ý tự động (autocomplete) khi chọn địa điểm trong LĐCT.

## Danh mục người ký và thể thức ký

Tham chiếu Nhân viên đã có (không nhập tay họ tên mới) — chỉ chọn trong số nhân sự lãnh đạo TC-HC. Dữ liệu mỗi bản ghi: nhân viên, chức danh khi ký (vd "Trưởng phòng Tổ chức - Hành chính" — tách riêng khỏi chức vụ gốc vì cách ghi khi ký có thể khác), thể thức ký (vd "TL. GIÁM ĐỐC"), ghi chú, trạng thái.

**Không tách trường "loại chứng từ áp dụng"** như dự kiến ban đầu — đã xác nhận với người dùng: 1 người ký dùng chung cho cả 3 loại chứng từ (thực tế hiện tại cả 3 đều do cùng 1 lãnh đạo TC-HC ký). Nếu sau này cần người ký khác nhau theo từng loại chứng từ, cần thiết kế lại (chưa có nhu cầu, không làm trước — xem `NHAT_KY_QUYET_DINH.md`).

**Trạng thái** — 1 trường duy nhất, 3 giá trị, gộp cả khái niệm "đang dùng" và "ủy quyền tạm thời":
- **Đang ký chính thức** — chỉ đúng 1 người có trạng thái này tại 1 thời điểm; hệ thống tự đảm bảo tính duy nhất (đặt ai đó thành chính thức thì người đang giữ trạng thái này tự chuyển sang "Dự phòng").
- **Dự phòng** — có trong danh sách, sẵn sàng được đặt làm chính thức khi cần (vd Trưởng phòng vắng mặt, chuyển sang Phó trưởng phòng).
- **Ngừng sử dụng** — không còn hợp lệ (nghỉ hưu, chuyển công tác...).

Thao tác "Đặt làm người ký chính thức" là hành động riêng (không phải sửa thông tin thường), ghi nhật ký hệ thống (ai đổi, từ ai sang ai, lúc nào). Không dùng `confirm()` mặc định của trình duyệt — có hộp thoại xác nhận riêng theo CLAUDE.md.

**Phân quyền:** `nguoi-ky.xem/.them/.sua/.xoa` chỉ Quản trị hệ thống (Văn thư/Lãnh đạo TC-HC chỉ xem). Riêng hành động đặt người ký chính thức dùng quyền tách riêng `nguoi-ky.dat-chinh-thuc`, cấp cho cả Quản trị hệ thống và Lãnh đạo Phòng TC-HC (người trực tiếp biết khi nào mình vắng mặt, không cần chờ Quản trị).

Khi chứng từ (LĐCT/GĐĐ/LĐX) tạo mới sau này, người ký/chức danh/thể thức ký lấy từ người đang có trạng thái "Đang ký chính thức" tại thời điểm tạo, rồi LƯU LẠI vào chính chứng từ đó (không tham chiếu động) — cùng nguyên tắc với ký hiệu số chứng từ (xem mục "Quản lý số chứng từ"): đổi người ký sau này không được làm sai lệch thông tin đã in trên chứng từ cũ.

## Cấu hình thông tin đơn vị

Tên cơ quan chủ quản, tên công ty (2 dòng), tên rút gọn (hiển thị menu), địa danh (dùng trong dòng ngày ký) lưu trong bảng cấu hình 1 dòng duy nhất (`CauHinhDonVi`), sửa qua giao diện `/cau-hinh-don-vi` — **không hardcode trong code**. Lý do: công ty có khả năng sáp nhập/đổi tên trong tương lai gần; nếu để hardcode rải rác trong từng mẫu in (LĐCT/GĐĐ/LĐX) và giao diện thì đổi tên phải sửa code + deploy lại nhiều nơi. Xem quyết định đầy đủ trong `NHAT_KY_QUYET_DINH.md`.

Không đưa vào đây: quốc hiệu tiêu ngữ ("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM" / "Độc lập - Tự do - Hạnh phúc") — đây là thể thức quốc gia, không đổi theo đơn vị, vẫn giữ cố định trong mẫu in. Tiêu đề từng loại chứng từ (vd "LỆNH ĐIỀU XE") cũng không đưa vào đây — mỗi loại chứng từ có tiêu đề riêng gắn với mẫu in của loại đó.

**Phân quyền:** xem (`don-vi.xem`) cấp cho cả 4 vai trò mặc định (mẫu in/menu cần đọc được); sửa (`don-vi.sua`) chỉ Quản trị hệ thống. Sửa cấu hình có ghi nhật ký hệ thống (giá trị trước/sau).

## Phân quyền

Vai trò: Quản trị hệ thống, Văn thư, Lãnh đạo Phòng TC-HC, Người xem/tra cứu (có thể bổ sung sau).

Lãnh đạo Phòng TC-HC hiện chỉ còn quyền xem + đặt người ký chính thức khi vắng mặt — **không còn quyền phê duyệt/từ chối** (đã bỏ luồng phê duyệt, xem `NHAT_KY_QUYET_DINH.md`). Giữ lại vai trò này (không xóa) để dành cho nhu cầu khác sau này.

**Không có chức năng tự đăng ký tài khoản.** Đây là ứng dụng nội bộ — chỉ người có quyền `nguoi-dung.them` (thường là Quản trị hệ thống) mới được tạo tài khoản mới. Không có trang/API đăng ký công khai. Tài khoản mới nên đi kèm mật khẩu tạm do người tạo đặt (hoặc hệ thống sinh ngẫu nhiên), bắt buộc đổi mật khẩu ở lần đăng nhập đầu tiên.

Quyền chia theo **hành động cụ thể**, ví dụ:

| Nhóm | Ví dụ tên quyền |
|---|---|
| Người dùng | `nguoi-dung.xem`, `.them`, `.sua`, `.khoa` |
| Nhân viên | `nhan-vien.xem`, `.them`, `.sua`, `.xoa` |
| Chứng từ | `chung-tu.xem`, `.tao`, `.sua`, `.in`, `.huy` (không có duyệt — xem mục "Quy trình chung") |
| Đánh số | `danh-so.thiet-lap`, `danh-so.cap` |
| Người ký | `nguoi-ky.xem`, `.them`, `.sua`, `.xoa`, `.dat-chinh-thuc` |
| Thông tin đơn vị | `don-vi.xem` (cả 4 vai trò), `don-vi.sua` (chỉ Quản trị) |

Nguyên tắc: ẩn/vô hiệu hóa menu không có quyền ở giao diện, nhưng **backend luôn phải tự kiểm tra quyền**. Ghi nhật ký thao tác quan trọng.

## Nhật ký hệ thống

Ghi nhận cho mỗi thao tác quan trọng: người thực hiện, thời gian, hành động (tạo/sửa/xóa/in/cấp số/hủy số), đối tượng bị tác động, giá trị trước/sau khi sửa. Không được sửa/xóa bởi người dùng thường; chỉ Quản trị hệ thống xem toàn bộ.
