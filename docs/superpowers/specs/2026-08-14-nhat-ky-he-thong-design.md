# Thiết kế: Module Nhật ký hệ thống (xem)

Ngày: 2026-08-14. Trạng thái: đã người dùng duyệt qua brainstorming (AskUserQuestion), sẵn sàng triển khai.

## 1. Bối cảnh

`NhatKyHeThong` (model Prisma) và `NhatKyService.ghiNhan()` đã tồn tại và đang được ghi ở hầu hết thao tác quan trọng (Tạo/Sửa/Xóa/Hủy/Cấp số/Đăng nhập-xuất/Đổi-đặt lại mật khẩu/Khóa-mở khóa tài khoản/Nhập danh sách/Đặt người ký chính thức). Còn thiếu module **xem** — đây là phần cần xây trong đợt này. `docs/QUY_TAC_NGHIEP_VU.md` mục "Nhật ký hệ thống" đã chốt: ghi người thực hiện/thời gian/hành động/đối tượng/giá trị trước-sau; không sửa/xóa được bởi người dùng thường; **chỉ Quản trị hệ thống xem toàn bộ**.

Rà code phát hiện thêm: hành động **In chứng từ** (6 endpoint PDF) hiện CHƯA ghi nhật ký, dù quy tắc liệt kê "in" là hành động bắt buộc ghi — người dùng xác nhận bổ sung luôn trong đợt này.

Việc chưa chốt, KHÔNG thuộc phạm vi spec này (xem CLAUDE.md mục "Việc chưa chốt"): thời gian lưu trữ tối thiểu của nhật ký — không làm tính năng tự xóa/nén dữ liệu ở đây.

## 2. Phạm vi

Trong phạm vi:
- Bổ sung ghi nhật ký cho 6 endpoint in PDF còn thiếu.
- 1 quyền mới `nhat-ky.xem`, seed gán riêng cho vai trò Quản trị hệ thống.
- Backend: endpoint danh sách (phân trang + lọc) và endpoint xuất Excel, tái dùng `NhatKyHeThong` có sẵn — KHÔNG đổi schema, KHÔNG đổi cách ghi nhật ký hiện tại (chỉ thêm lời gọi `ghiNhan()` ở nơi còn thiếu).
- Hằng số dùng chung (`packages/shared`) ánh xạ mã hành động → nhãn tiếng Việt cụ thể + nhóm lọc rộng.
- Frontend: trang `/nhat-ky` (menu Hệ thống, gỡ `sapCo: true`), bảng danh sách + tag lọc nhóm hành động + bộ lọc ngày/người dùng/từ khóa số hiệu + dialog xem chi tiết (bảng so sánh trước/sau) + nút Xuất Excel.

Ngoài phạm vi: tính năng tự xóa/nén log theo thời gian lưu trữ; sửa/xóa thủ công 1 dòng nhật ký (không cho phép theo đúng quy tắc).

## 3. Ghi nhật ký khi In (bổ sung)

6 endpoint, thêm `NhatKyService` vào constructor nếu chưa có, gọi `ghiNhan()` sau khi tạo PDF thành công (không chặn response nếu ghi log lỗi — dùng `await` bình thường nhưng không throw ra ngoài nếu tự thân ghi nhật ký lỗi thì vẫn nên để lỗi nổi lên như các nơi khác đang làm, giữ nhất quán, KHÔNG try/catch nuốt lỗi):

| Controller | Endpoint | hanhDong mới | doiTuong |
|---|---|---|---|
| `LenhDieuXeController` | `GET :id/pdf` | `XEM_IN_LENH_DIEU_XE` | `LenhDieuXe` |
| `LenhDieuCongTacController` | `GET :id/pdf` | `XEM_IN_LENH_DIEU_CONG_TAC` | `LenhDieuCongTac` |
| `LenhDieuCongTacController` | `GET :id/pdf-lenh` | `XEM_IN_LENH_DIEU_CONG_TAC_VA_LENH_DIEU_XE` | `LenhDieuCongTac` |
| `LenhDieuCongTacController` | `GET :id/pdf-giay-di-duong` | `XEM_IN_TOAN_BO_GIAY_DI_DUONG` | `LenhDieuCongTac` |
| `GiayDiDuongController` | `GET :id/pdf` | `XEM_IN_GIAY_DI_DUONG` | `GiayDiDuong` |
| `GiayDiDuongController` | `GET in-nhieu` | `XEM_IN_NHIEU_GIAY_DI_DUONG` | `GiayDiDuong` (nhiều `doiTuongId`, ghi N dòng — 1 dòng/GĐĐ, giữ nhất quán với cách các thao tác hàng loạt khác ghi log, xem `XOA_NHIEU_*`) |

`giaTriTruoc`/`giaTriSau` để trống (đây là hành động đọc, không đổi dữ liệu) — chỉ cần `nguoiDungId`, `hanhDong`, `doiTuong`, `doiTuongId`.

## 4. Quyền mới

`packages/shared/src/phan-quyen/ma-quyen.ts`: thêm `NHAT_KY_XEM: "nhat-ky.xem"`. Seed phân quyền (`apps/api/prisma/seed.ts` hoặc file tương đương đang gán quyền theo vai trò): gán DUY NHẤT cho `MA_VAI_TRO.QUAN_TRI_HE_THONG`.

## 5. Hằng số nhãn hành động (packages/shared)

File mới `packages/shared/src/nhat-ky/nhan-hanh-dong.ts`, export:

```ts
export interface ThongTinHanhDong {
  nhan: string;   // nhãn cụ thể, vd "Tạo lệnh điều công tác"
  nhom: MaNhomHanhDong; // nhóm rộng dùng cho tag lọc
}

export const NHOM_HANH_DONG = {
  TAO: "TAO", SUA: "SUA", XOA_HUY: "XOA_HUY", IN: "IN",
  DANH_SO: "DANH_SO", DANG_NHAP_XUAT: "DANG_NHAP_XUAT",
  MAT_KHAU: "MAT_KHAU", TAI_KHOAN: "TAI_KHOAN", KHAC: "KHAC",
} as const;

export const NHAN_NHOM_HANH_DONG: Record<MaNhomHanhDong, string> = { ... }; // nhãn tiếng Việt của từng nhóm

export const THONG_TIN_HANH_DONG: Record<string, ThongTinHanhDong> = {
  TAO_LENH_DIEU_CONG_TAC: { nhan: "Tạo lệnh điều công tác", nhom: "TAO" },
  // ... liệt kê đủ TOÀN BỘ hanhDong đang tồn tại trong code (auth/nguoi-dung/
  // nhan-vien/phuong-tien/dia-diem/nguoi-ky/danh-so/cau-hinh-don-vi/
  // lenh-dieu-xe/lenh-dieu-cong-tac + 6 mã XEM_IN_* mới ở mục 3).
};

// Fallback khi gặp ma hanh dong la (code cu/khong nam trong bang) - hien
// nguyen ma, tranh loi khi hien thi.
export function nhanHanhDong(ma: string): string { ... }
export function nhomHanhDong(ma: string): MaNhomHanhDong { ... }
```

Dùng CHUNG ở backend (validate `nhom` filter hợp lệ) và frontend (nhãn cột + tag lọc).

## 6. Backend: API danh sách + xuất Excel

Module mới `apps/api/src/nhat-ky/` (controller + service + module), route `/nhat-ky`, đăng ký vào `AppModule` — tách module riêng theo đúng convention đã dùng cho `so-cong-lenh`.

### Schema truy vấn (`packages/validation/src/nhat-ky/truy-van-nhat-ky.schema.ts`)

```ts
export const truyVanNhatKySchema = z.object({
  tuNgay: z.coerce.date().optional(),
  denNgay: z.coerce.date().optional(),
  nguoiDungId: z.string().trim().optional(),
  nhom: z.enum([...cac gia tri NHOM_HANH_DONG]).optional(),
  tuKhoa: z.string().trim().optional(), // theo so hieu chung tu
});
export const danhSachNhatKySchema = truyVanNhatKySchema.extend({
  trang, kichThuoc, // giong pattern so-cong-lenh
});
```

### Service

- `xayDungWhere()`: lọc `thoiGian` theo khoảng, `nguoiDungId` đúng bằng, `hanhDong: { in: [...cac ma thuoc nhom duoc chon] }` (tra ngược từ `THONG_TIN_HANH_DONG` phía backend — cần export bảng này ở `@congtac/shared`, backend import dùng được).
- `tuKhoa`: nếu có, chạy 3 query song song tìm `id` theo `soHieu contains` trên `LenhDieuCongTac`/`GiayDiDuong`/`LenhDieuXe`; gộp thành `OR: [{doiTuong: "LenhDieuCongTac", doiTuongId: {in: [...]}}, ...]`. Nếu cả 3 đều rỗng → ép where về không khớp gì (tránh trả nhầm toàn bộ danh sách khi từ khóa không khớp số hiệu nào).
- `danhSach()`: `findMany` + `count` trong `$transaction`, `include: { nguoiDung: { select: { hoTen: true, tenDangNhap: true } } }`, `orderBy: { thoiGian: "desc" }` mặc định.
- Map mỗi dòng trả về thêm field tính toán `tomTatDoiTuong` — rút từ `giaTriSau ?? giaTriTruoc` (kiểu `Record<string, unknown>`) theo thứ tự ưu tiên field tùy `doiTuong`: `soHieu` (LenhDieuCongTac/GiayDiDuong/LenhDieuXe) → `tenDangNhap`/`hoTen` (NguoiDung) → `tenDayDu` (DiaDiem) → `bienSo` (PhuongTien) → `hoTen` (NguoiKy/NhanVien) → rỗng nếu không khớp field nào (không throw).
- `layTatCaDeXuatExcel()`: giống `danhSach()` nhưng không phân trang (như `so-cong-lenh`).

### Controller

`GET /nhat-ky` (quyền `nhat-ky.xem`), `GET /nhat-ky/xuat-excel` (cùng quyền, đặt sau route gốc — không có `:id` nên không lo xung đột thứ tự).

Không có `POST`/`PATCH`/`DELETE` — đúng yêu cầu "không sửa/xóa được".

## 7. Frontend

`apps/web/lib/menu.ts`: mục "Nhật ký hệ thống" đổi từ `sapCo: true` sang `href: "/nhat-ky"`, `quyenCanCo: MA_QUYEN.NHAT_KY_XEM`.

`apps/web/hooks/use-danh-sach-nhat-ky.ts`: tương tự `use-danh-sach-so-cong-lenh.ts`.

`apps/web/app/nhat-ky/page.tsx`:
- Bộ lọc: ô tìm theo số hiệu (debounce, giống các trang khác), Từ ngày/Đến ngày, Select người thực hiện (danh sách người dùng — tái dùng hook người dùng đã có), tag lọc theo nhóm hành động (pill row, giống `/lenh-dieu-cong-tac`).
- Bảng: Thời gian — Người thực hiện — Hành động (nhãn cụ thể từ `nhanHanhDong()`) — Đối tượng (nhãn loại + `tomTatDoiTuong`) — IP (nếu có) — nút "Xem chi tiết" (mở dialog).
- Dialog chi tiết: so sánh `giaTriTruoc`/`giaTriSau` — diff nông (shallow, so sánh từng key ở cấp 1, đủ dùng vì các bản ghi Prisma phẳng, không nested sâu) — chỉ liệt kê key có giá trị khác nhau, 2 cột Trước/Sau, tên field hiển thị nguyên trạng (camelCase) kèm ghi chú "tên trường kỹ thuật" — KHÔNG cần bảng ánh xạ tên field sang tiếng Việt đầy đủ ở bản đầu (số lượng field khác nhau giữa nhiều loại đối tượng quá lớn để làm đủ ngay, YAGNI — có thể bổ sung dần sau nếu người dùng thấy khó đọc).
- Nút "Xuất Excel" theo đúng bộ lọc, pattern giống `/so-cong-lenh`.

## 8. Rủi ro / lưu ý

- Không render/test được thật trong sandbox (như các phần trước) — cần `pnpm --filter @congtac/shared build` + `pnpm --filter @congtac/validation build` + `pnpm typecheck` + thử tay trên trình duyệt thật.
- Bảng `THONG_TIN_HANH_DONG` phải liệt kê ĐỦ mọi `hanhDong` đang tồn tại trong code — sai sót sẽ khiến 1 số dòng hiện nhãn fallback (mã thô) thay vì tiếng Việt; không gây lỗi runtime (có hàm fallback).
- Diff nông (không đệ quy) là đủ vì `giaTriTruoc`/`giaTriSau` hiện tại luôn là snapshot phẳng của 1 bản ghi Prisma (không lồng object/mảng phức tạp) — nếu sau này có model lồng sâu, cần nâng cấp thêm.
