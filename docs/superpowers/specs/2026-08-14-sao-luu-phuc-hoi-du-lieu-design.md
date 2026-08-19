# Thiết kế: Sao lưu và phục hồi dữ liệu

Ngày: 2026-08-14. Trạng thái: đã người dùng duyệt qua brainstorming (AskUserQuestion), chờ duyệt spec trước khi triển khai.

## 1. Bối cảnh

CLAUDE.md liệt "Tần suất/nơi lưu bản sao lưu dữ liệu" vào mục "chưa chốt — hỏi lại, đừng tự đoán". Đã hỏi người dùng qua nhiều vòng, chốt lại theo hướng TỐI GIẢN:

- Chỉ 2 hành động thủ công: nút **Sao lưu** và nút **Phục hồi**, không có lịch tự động/Task Scheduler ở bản này.
- Sao lưu: **tải file .sql xuống máy của người đang bấm nút** (không phải gõ đường dẫn trên máy chủ) — dùng cơ chế tải xuống chuẩn của trình duyệt (hộp thoại Save As / thư mục Downloads mặc định). Chọn cách này vì người quản trị có thể đăng nhập từ máy khác với máy chạy backend (nhất là giai đoạn sau chạy qua mạng nội bộ nhiều máy nối 1 server) — tải xuống/tải lên qua trình duyệt luôn tự động đúng "máy của người đang dùng" mà không cần biết trước đó là máy nào.
- Phục hồi: người dùng **chọn file .sql từ máy mình** (hộp thoại chọn file gốc của hệ điều hành, qua `<input type="file">`) rồi tải lên cho server xử lý — không gõ đường dẫn tay.
- Cả 2 đều hiển thị % tiến trình (ước lượng theo số bảng đã xong/tổng số bảng — `pg_dump`/`psql` không cung cấp % chính xác theo dung lượng).
- Xong thì báo cho người dùng biết kết quả (thành công/thất bại) — không có luồng phức tạp thêm.
- Định dạng file: SQL thuần qua `pg_dump`/`psql` (dùng thẳng công cụ gốc Postgres, không tự viết định dạng riêng).
- Không có tính năng lưu trữ/quản lý danh sách bản sao lưu trong app — mỗi bản sao lưu tải xuống xong là "giao" hẳn cho người dùng tự quản lý trên máy họ (đặt tên, dọn dẹp, sao chép ra USB/NAS...) ngoài app.

**Cập nhật sau khi thử thật (cùng ngày):** giả định "máy chạy backend có sẵn `pg_dump`/`psql` trên PATH" SAI — người dùng xác nhận Postgres chạy qua **Docker** (`docker ps` → container `conglenh-postgres`, image `postgres:16`, cổng `5432` đã publish ra host qua `0.0.0.0:5432->5432/tcp`). Máy Windows host không có và sẽ không bao giờ có sẵn 2 lệnh này để cài thêm. Đổi thiết kế: `pg_dump`/`psql` chạy **bên trong container** qua `docker exec` (biến `.env` mới `POSTGRES_DOCKER_CONTAINER`), không phải trực tiếp trên host — xem mục 6.1. Riêng các kết nối `pg` thô (đếm số bảng, ngắt kết nối khác, ghi nhật ký sau phục hồi) KHÔNG cần đổi gì — cổng 5432 đã publish ra host nên kết nối TCP thẳng từ Node (giống Prisma vẫn đang làm) hoạt động bình thường dù Postgres nằm trong container.

## 2. Phạm vi

Trong phạm vi:
- 1 quyền mới `sao-luu.quan-ly` (gộp sao lưu + phục hồi — chỉ Quản trị hệ thống ở bản đầu).
- Backend: module `apps/api/src/sao-luu/` — API chạy sao lưu (ghi ra file tạm trên server, có API tải file tạm đó xuống), API phục hồi (nhận file tải lên), API xem tiến trình.
- Frontend: trang `/sao-luu` — 2 nút (Sao lưu / Phục hồi), thanh tiến trình %, thông báo kết quả cuối.
- Bổ sung nhóm hành động `SAO_LUU` + 2 mã hành động vào `packages/shared/src/nhat-ky/nhan-hanh-dong.ts` (tái dùng hạ tầng nhật ký có sẵn, không đổi schema `NhatKyHeThong`).

Ngoài phạm vi (có thể làm sau nếu cần): lịch sao lưu tự động, danh sách bản sao lưu trong app, xóa file cũ tự động, mã hóa/nén file, phục hồi từ nhiều nguồn cùng lúc.

## 3. Định dạng file và cơ chế tải xuống/tải lên

- Định dạng: `pg_dump --format=plain --clean --if-exists --no-owner --no-privileges -f <file tạm>` — có sẵn `DROP ... IF EXISTS` trước mỗi `CREATE`, nên phục hồi bằng `psql -f file.sql` là ghi đè sạch.
- Tên file khi tải xuống: `sao-luu-YYYY-MM-DD_HH-mm-ss.sql` (đặt qua header `Content-Disposition: attachment; filename=...`, trình duyệt tự dùng tên này khi lưu).
- **Sao lưu:** `pg_dump` ghi ra 1 file tạm trên server (thư mục tạm hệ điều hành, `os.tmpdir()`), tiến trình chạy xong → frontend gọi API tải xuống → server stream file tạm về trình duyệt → **xóa file tạm ngay sau khi stream xong** (kể cả khi tải lỗi giữa chừng, dùng `finally`). Không có bước nào ghi cố định vào 1 thư mục lâu dài trên server.
- **Phục hồi:** frontend tải file `.sql` người dùng chọn lên server qua `multipart/form-data` (dùng `multer` — đã có sẵn trong `apps/api/package.json`), server lưu tạm vào `os.tmpdir()`, chạy phục hồi từ đó, **xóa file tạm ngay sau khi phục hồi xong** (thành công hay thất bại đều xóa).

## 4. Quyền mới

`packages/shared/src/phan-quyen/ma-quyen.ts`: thêm `SAO_LUU_QUAN_LY: "sao-luu.quan-ly"`. Seed (`apps/api/prisma/seed.ts`): gán cho `MA_VAI_TRO.QUAN_TRI_HE_THONG` (tự động qua `TAT_CA_MA_QUYEN`).

## 5. Nhãn nhật ký (bổ sung file có sẵn)

Sửa `packages/shared/src/nhat-ky/nhan-hanh-dong.ts`:

```ts
export const NHOM_HANH_DONG = { ..., SAO_LUU: "SAO_LUU" };
export const NHAN_NHOM_HANH_DONG = { ..., SAO_LUU: "Sao lưu / Phục hồi" };
export const THONG_TIN_HANH_DONG = {
  ...,
  SAO_LUU_THU_CONG: { nhan: "Sao lưu dữ liệu", nhom: "SAO_LUU" },
  PHUC_HOI_DU_LIEU: { nhan: "Phục hồi dữ liệu", nhom: "SAO_LUU" },
};
```

`doiTuong: "SaoLuu"`, `doiTuongId: <tên file>`. `giaTriTruoc`/`giaTriSau` để trống.

## 6. Backend

### 6.1 Core logic (`apps/api/src/sao-luu/sao-luu.core.ts`)

Hàm thuần, không phụ thuộc NestJS:

- `phanTichDatabaseUrl(url)` → `{ host, port, tenDb, nguoiDung, matKhau }` (dùng `URL` chuẩn Node).
- `duongDanPgDump()`/`duongDanPsql()` → đọc `PG_DUMP_PATH`/`PSQL_PATH` từ `.env`, mặc định `"pg_dump"`/`"psql"` (PATH) — CHỈ dùng khi KHÔNG chạy qua Docker.
- `tenContainerDocker()` → đọc `POSTGRES_DOCKER_CONTAINER` từ `.env`. Có giá trị → mọi lệnh `pg_dump`/`psql` bên dưới chạy qua `docker exec` thay vì gọi trực tiếp trên host.
- `demSoBang(databaseUrl)` → `SELECT count(*) FROM information_schema.tables WHERE table_schema='public'` qua 1 kết nối `pg` tạm (KHÔNG qua Docker — kết nối TCP thẳng, cổng đã publish ra host).
- `chaySaoLuu({ databaseUrl, duongDanFileTam, onTienTrinh })`: đếm tổng số bảng →
  - **Không Docker:** spawn `pg_dump ... --verbose --host --port --username --dbname -f duongDanFileTam` (mật khẩu qua biến môi trường con `PGPASSWORD`, không lộ command line).
  - **Có Docker:** spawn `docker exec -e PGPASSWORD=... <container> pg_dump ... --verbose --username --dbname` (KHÔNG `-f`, KHÔNG `--host`/`--port` — đã ở sẵn trong container) → pg_dump ghi ra stdout, `proc.stdout.pipe()` thẳng vào 1 `WriteStream` tới file tạm trên host (tránh phải `docker cp` thêm 1 bước).
  - Cả 2 trường hợp: đọc stderr, đếm dòng khớp `dumping contents of table` để gọi `onTienTrinh(daXong, tong)` → resolve khi thoát mã 0 VÀ (nếu Docker) `WriteStream` đã `finish`; reject kèm stderr nếu khác 0.
- `chayPhucHoi({ databaseUrl, duongDanFileTam, onTienTrinh })`:
  1. Đếm trước tổng số dòng `COPY ... FROM stdin;` trong file → tổng bước.
  2. Mở kết nối `pg` tới database bảo trì `postgres` (KHÔNG qua Docker), chạy `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()` để ngắt kết nối khác (kể cả pool NestJS — nơi gọi phải tự `prisma.$disconnect()` TRƯỚC).
  3. **Không Docker:** spawn `psql -a -v ON_ERROR_STOP=1 --host --port --username --dbname -f duongDanFileTam`. **Có Docker:** spawn `docker exec -i -e PGPASSWORD=... <container> psql -a -v ON_ERROR_STOP=1 --username --dbname` (KHÔNG `-f`) → `createReadStream(duongDanFileTam).pipe(proc.stdin)` (cờ `-i` của `docker exec` cho phép nối stdin xuyên qua container).
  4. Đọc stdout đếm dòng khớp `^COPY ` → gọi `onTienTrinh`. Resolve khi thoát mã 0, reject kèm stderr nếu khác 0.

**Ghi nhật ký "Phục hồi dữ liệu" PHẢI ghi SAU khi phục hồi xong**, không phải trước — bản thân phục hồi ghi đè toàn bộ bảng `nhat_ky_he_thong` về đúng trạng thái trong file sao lưu (do `--clean --if-exists`), nên ghi trước sẽ mất. Dùng 1 kết nối `pg` mới (không qua Prisma, đã `$disconnect()`) để `INSERT` thẳng, đóng lại ngay sau.

### 6.2 NestJS module (`apps/api/src/sao-luu/`)

Trạng thái tiến trình giữ trong bộ nhớ (đơn tiến trình, đủ dùng cho 1 admin):

```ts
interface TienTrinhSaoLuu {
  dangChay: boolean;
  loaiCongViec: "sao-luu" | "phuc-hoi" | null;
  daXong: number;
  tong: number;
  loi: string | null;
  duongDanFileTamSanSangTai: string | null; // chỉ dùng nội bộ server, không trả ra API thô
  thongBaoHoanTat: string | null;
}
```

Controller `SaoLuuController` (`@Controller("sao-luu")`, tất cả `@CanDo(MA_QUYEN.SAO_LUU_QUAN_LY)`):

| Route | Việc làm |
|---|---|
| `GET /sao-luu/tien-trinh` | trả `TienTrinhSaoLuu` hiện tại, KHÔNG kèm `duongDanFileTamSanSangTai` (giữ nội bộ) — chỉ cờ `sanSangTai: boolean` để frontend biết đã bật nút tải xuống được chưa; frontend poll ~1.5s khi có việc đang chạy |
| `POST /sao-luu/chay` | không cần body; nếu đang có việc chạy → 409; chạy nền `chaySaoLuu()` ra file tạm, ghi nhật ký `SAO_LUU_THU_CONG` khi xong |
| `GET /sao-luu/tai-xuong` | chỉ dùng được khi `TienTrinhSaoLuu.sanSangTai === true`; stream file tạm về (`Content-Disposition: attachment`), xóa file tạm trong `finally` sau khi stream xong (thành công hay lỗi giữa chừng đều xóa), reset trạng thái tiến trình về rảnh |
| `POST /sao-luu/phuc-hoi` | `multipart/form-data`: field file (`.sql`, qua `multer`, lưu tạm `os.tmpdir()`) + field `xacNhan` (chuỗi text); 400 nếu `xacNhan` không khớp tên file gốc người dùng chọn; nếu đang có việc chạy → 409; `await prisma.$disconnect()` rồi chạy nền `chayPhucHoi()` từ file tạm; xóa file tạm ngay sau khi phục hồi xong (thành công hay lỗi); nếu thành công, ghi nhật ký `PHUC_HOI_DU_LIEU` sau khi xong (qua kết nối `pg` trực tiếp — mục 6.1), đặt `thongBaoHoanTat`, đợi ~1 giây rồi `process.exit(1)` |

Giới hạn kích thước upload của `multer`/body-parser cần đủ lớn cho file `.sql` (đặt vài trăm MB dư ra — dữ liệu công ty hiện tại nhỏ, không cần giới hạn chặt). Mật khẩu DB không bao giờ trả ra API — chỉ dùng nội bộ khi spawn child process.

## 7. Frontend

`apps/web/lib/menu.ts`: thêm mục "Sao lưu & phục hồi" (`href: "/sao-luu"`, `quyenCanCo: MA_QUYEN.SAO_LUU_QUAN_LY`).

`apps/web/hooks/use-sao-luu.ts`: `useTienTrinhSaoLuu()` (polling bật/tắt theo `dangChay`), `useChaySaoLuu()` (POST chạy), hàm tải xuống thường (không qua TanStack Query — điều hướng `window.location` hoặc tạo `<a>` ẩn trỏ tới `GET /sao-luu/tai-xuong` để trình duyệt tự xử lý tải file, kèm cookie phiên đăng nhập), `useChayPhucHoi()` (mutation dạng `FormData`).

`apps/web/app/sao-luu/page.tsx` — 2 nút, không bảng danh sách:

- **Nút "Sao lưu"** → xác nhận → thanh tiến trình "Đang sao lưu... 12/18 bảng" → xong: tự động kích hoạt tải file xuống (trình duyệt hiện Save As hoặc lưu vào Downloads tùy cấu hình trình duyệt người dùng) + thông báo "Đã sao lưu xong, file đang được tải xuống" (hoặc thông báo lỗi nếu thất bại).
- **Nút "Phục hồi"** → dialog: cảnh báo GHI ĐÈ TOÀN BỘ dữ liệu hiện tại, không thể hoàn tác → `<input type="file" accept=".sql">` để chọn file từ máy mình → bấm "Phục hồi" mở tiếp 1 `AlertDialog` cảnh báo lần 2 (nêu rõ tên file, nhấn mạnh không thể hoàn tác) → bấm "Xác nhận" trong đó mới thực sự gửi lên server (KHÔNG bắt gõ lại tên file — bỏ theo yêu cầu người dùng 2026-08-14, thay bằng 2 lớp cảnh báo dialog liên tiếp; field `xacNhan` gửi API vẫn tự động điền = tên file, không đổi hợp đồng backend) → tải file lên + thanh tiến trình "Đang phục hồi... 5/18 bảng" → xong: thông báo "Đã phục hồi thành công. Hệ thống sẽ tự thoát — hãy đóng cửa sổ dòng lệnh đang chạy `pnpm dev` và chạy lại để tiếp tục sử dụng" (không tự gọi lại API sau đó, vì server sắp tắt).
- Khi có việc đang chạy: khóa cả 2 nút, chỉ hiện tiến trình.

## 8. Rủi ro / lưu ý

- **Đã xác nhận Postgres chạy qua Docker** (container `conglenh-postgres`) — máy host KHÔNG có `pg_dump`/`psql`, đã đổi sang chạy qua `docker exec` (mục 6.1), cấu hình `POSTGRES_DOCKER_CONTAINER` trong `.env`. Nếu sau này đổi cách chạy Postgres (vd cài trực tiếp lên máy Văn thư chính thức, không dùng Docker nữa) → chỉ cần XÓA biến `POSTGRES_DOCKER_CONTAINER` khỏi `.env`, code tự chuyển về gọi `pg_dump`/`psql` trực tiếp trên host (không cần sửa code).
- Lệnh `docker` phải có sẵn trên PATH của máy chạy backend (Docker Desktop cài sẵn, không cần cấu hình thêm — đã xác nhận hoạt động vì người dùng chạy được `docker ps`).
- Cần thêm dependency mới `pg` (+ `@types/pg`) vào `apps/api/package.json` (hiện chỉ có `@prisma/client`) để chạy `pg_terminate_backend`. `multer` đã có sẵn, tái dùng cho upload.
- % tiến trình là ước lượng theo số bảng, không phải theo dung lượng/thời gian thật — bảng lớn bất thường sẽ khiến thanh tiến trình "đứng lâu" rồi nhảy nhanh.
- Sau phục hồi app tự thoát, không có gì tự khởi động lại (không dùng pm2 ở giai đoạn này) — người dùng tự chạy lại `pnpm dev`.
- Không lưu/quản lý danh sách bản sao lưu trong app — mỗi lần tải xuống là hết trách nhiệm của app, người dùng tự quản lý file trên máy mình.
- File tạm trên server (cả lúc sao lưu lẫn phục hồi) cần dọn dẹp cẩn thận kể cả khi có lỗi giữa chừng (dùng `try/finally`), tránh tồn đọng file rác chứa dữ liệu nhạy cảm trong thư mục tạm hệ điều hành.
- Không test được thật trong sandbox (không có `pg_dump`/`psql`/Postgres thật) — cần tự thử trên máy thật, nên thử phục hồi vào 1 CSDL test trước khi tin tưởng dùng cho dữ liệu thật.

## 9. Đóng gói / di chuyển sang máy khác

Không có gì gắn cứng vào máy hiện tại — mọi cấu hình (`POSTGRES_DOCKER_CONTAINER`, `PG_DUMP_PATH`, `PSQL_PATH`, `DATABASE_URL`) qua `.env`; cơ chế tải xuống/tải lên qua trình duyệt vốn đã độc lập với việc backend/trình duyệt có nằm trên cùng máy hay không (đây chính là lý do chọn cách này thay vì gõ đường dẫn tay — xem mục 1). Khi chuyển sang máy Văn thư chính thức, tùy cách chạy Postgres trên máy đó:
- Nếu VẪN chạy Postgres qua Docker trên máy mới: copy `.env` sang, cập nhật `POSTGRES_DOCKER_CONTAINER` đúng tên container trên máy đó (chạy `docker ps` để xem).
- Nếu chuyển sang cài Postgres trực tiếp (không Docker): xóa `POSTGRES_DOCKER_CONTAINER` khỏi `.env`, cài PostgreSQL đầy đủ (gồm `pg_dump`/`psql`) trên máy đó, set `PG_DUMP_PATH`/`PSQL_PATH` nếu 2 lệnh không có sẵn trên PATH.

Cả 2 trường hợp đều thử "Sao lưu" 1 lần ngay sau khi cấu hình xong để xác nhận hoạt động đúng trước khi tin tưởng dùng thật.
