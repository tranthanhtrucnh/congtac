# Thiết kế: Trang Vai trò & phân quyền

Ngày: 2026-08-17. Trạng thái: đã triển khai xong (backend + frontend) — chưa chạy được `pnpm typecheck`/thử tay trong sandbox, xem rủi ro mục 6 và `NHAT_KY_QUYET_DINH.md`.

## 1. Bối cảnh

Menu "Vai trò & phân quyền" (`/vai-tro`) đang để `sapCo: true`. Dữ liệu đã đủ (`VaiTro`/`Quyen`/`VaiTroQuyen`/`NguoiDungVaiTro`), trang `/nguoi-dung` đã cho gán vai trò cho tài khoản. Việc còn thiếu: 1 trang xem VÀ SỬA quyền của từng vai trò.

**Bản đầu (đã triển khai, sau đó đổi hướng cùng ngày):** chỉ xem (read-only), bố cục 4 thẻ. Người dùng phản hồi "không ổn", muốn sửa được qua UI theo kiểu bảng liệt kê quyền × vai trò, tích chọn trực tiếp. Đã hỏi lại 2 điểm mấu chốt qua AskUserQuestion:

1. **Xung đột với seed:** quyền của 4 vai trò mặc định (`VAI_TRO_DINH_NGHIA` trong `apps/api/prisma/seed.ts`) hiện bị `deleteMany` + `createMany` lại MỖI LẦN chạy seed — nếu cho sửa qua UI mà không đổi seed, mọi tùy chỉnh sẽ mất ở lần seed kế tiếp (việc chạy lại seed xảy ra khá thường xuyên, mỗi khi thêm 1 tính năng có quyền mới). Người dùng chọn: **Quản trị hệ thống giữ CỐ ĐỊNH = toàn bộ quyền, KHÔNG sửa được qua UI** (an toàn — luôn có 1 vai trò đủ quyền sửa lại nếu lỡ cấu hình sai 3 vai trò kia); **Văn thư/Lãnh đạo TC-HC/Người xem sửa được qua UI**, seed KHÔNG đụng tới quyền của 3 vai trò này nữa sau lần tạo đầu tiên.
2. **Bố cục:** đổi từ 4 thẻ sang **1 bảng ma trận** — hàng = quyền (nhóm theo module), cột = vai trò, ô giao là checkbox.

**Hệ quả cần ghi nhớ:** từ nay, thêm 1 quyền mới trong code (vd tính năng mới) sẽ KHÔNG tự động cấp cho Văn thư/Lãnh đạo TC-HC/Người xem nữa — phải vào trang này tích tay. Quản trị hệ thống vẫn tự động có mọi quyền mới (seed luôn đồng bộ lại đúng `TAT_CA_MA_QUYEN` cho riêng vai trò này).

## 2. Phạm vi

Trong phạm vi:
- Sửa `apps/api/prisma/seed.ts`: chỉ đồng bộ lại quyền (`deleteMany` + `createMany`) cho vai trò Quản trị hệ thống MỌI lần seed; với 3 vai trò còn lại, chỉ đặt quyền mặc định ở lần tạo đầu tiên (vai trò chưa tồn tại trước khi upsert), các lần sau bỏ qua hoàn toàn.
- 1 quyền mới `vai-tro.sua` (sửa tập quyền của vai trò) — chỉ Quản trị hệ thống.
- Backend: `PATCH /vai-tro/:id/quyen` (thay toàn bộ tập quyền của 1 vai trò) — chặn cứng nếu `id` là vai trò Quản trị hệ thống (400), ghi nhật ký hành động mới `SUA_QUYEN_VAI_TRO`.
- Backend: `GET /vai-tro` mở rộng thêm — trả kèm TOÀN BỘ danh mục quyền (không chỉ quyền vai trò đang có) để frontend dựng đủ hàng cho bảng ma trận.
- Frontend: đổi bố cục trang `/vai-tro` từ 4 thẻ sang bảng ma trận quyền × vai trò, checkbox sửa được cho 3/4 cột (trừ cột Quản trị hệ thống — hiện luôn tích, khóa), nút "Lưu thay đổi" theo từng vai trò khi có sửa.

Ngoài phạm vi: tạo/xóa vai trò qua UI; sửa quyền của Quản trị hệ thống qua UI (cố định); quản lý danh mục quyền (thêm/sửa/xóa 1 `Quyen`) qua UI.

## 3. Backend

### 3.1 Seed (`apps/api/prisma/seed.ts`)

```ts
for (const vaiTroDinhNghia of VAI_TRO_DINH_NGHIA) {
  const daTonTaiTruoc = await prisma.vaiTro.findUnique({ where: { ma: vaiTroDinhNghia.ma } });
  const vaiTro = await prisma.vaiTro.upsert({
    where: { ma: vaiTroDinhNghia.ma },
    update: { ten: vaiTroDinhNghia.ten, moTa: vaiTroDinhNghia.moTa, heThong: true },
    create: { ma: vaiTroDinhNghia.ma, ten: vaiTroDinhNghia.ten, moTa: vaiTroDinhNghia.moTa, heThong: true },
  });

  const laQuanTri = vaiTroDinhNghia.ma === MA_VAI_TRO.QUAN_TRI_HE_THONG;
  // Quan tri he thong: LUON dong bo lai = TAT_CA_MA_QUYEN moi lan seed (co
  // dinh, khong sua qua UI). 3 vai tro con lai: CHI dat quyen mac dinh o lan
  // dau tao (chua ton tai truoc do) - tu do nguoi dung tu quan ly qua UI
  // /vai-tro, seed KHONG dung toi nua.
  if (laQuanTri || !daTonTaiTruoc) {
    const danhSachQuyen = await prisma.quyen.findMany({ where: { ma: { in: [...vaiTroDinhNghia.quyen] } } });
    await prisma.vaiTroQuyen.deleteMany({ where: { vaiTroId: vaiTro.id } });
    await prisma.vaiTroQuyen.createMany({
      data: danhSachQuyen.map((quyen) => ({ vaiTroId: vaiTro.id, quyenId: quyen.id })),
    });
  }
}
```

Chỉ đổi đúng đoạn này, không đổi phần còn lại của seed (tạo tài khoản `quantri` mặc định...).

### 3.2 Quyền mới

`packages/shared/src/phan-quyen/ma-quyen.ts`: thêm `VAI_TRO_SUA: "vai-tro.sua"`. `DANH_SACH_QUYEN` trong seed: thêm `{ ma: MA_QUYEN.VAI_TRO_SUA, nhom: "vai-tro", moTa: "Sửa quyền của vai trò" }`. Gán cho Quản trị hệ thống qua `TAT_CA_MA_QUYEN` (tự động, không cần sửa `VAI_TRO_DINH_NGHIA`).

### 3.3 `VaiTroService`

- `danhSach()`: giữ như đã làm (mỗi vai trò kèm `quyen`, `soNguoiDung`) — dùng cho việc build cột của bảng ma trận.
- Thêm `layToanBoQuyen()`: `this.prisma.quyen.findMany({ select: { id, ma, nhom, moTa }, orderBy: [{ nhom: "asc" }, { ma: "asc" }] })` — toàn bộ danh mục quyền, dùng làm HÀNG của bảng ma trận (kể cả quyền chưa vai trò nào có).
- Thêm `suaQuyen(vaiTroId, quyenMa: string[], nguoiThucHienId)`:
  1. Tìm vai trò theo `id`; 404 nếu không có.
  2. Nếu `vaiTro.ma === MA_VAI_TRO.QUAN_TRI_HE_THONG` → `BadRequestException` ("Không thể sửa quyền của Quản trị hệ thống qua giao diện").
  3. Lấy `giaTriTruoc` = danh sách mã quyền hiện tại (để ghi nhật ký).
  4. Trong 1 `$transaction`: `deleteMany` toàn bộ `VaiTroQuyen` của vai trò này, `createMany` lại theo `quyenMa` truyền lên (tra `Quyen.ma → id` trước).
  5. Ghi nhật ký `SUA_QUYEN_VAI_TRO` (`doiTuong: "VaiTro"`, `doiTuongId: vaiTroId`, `giaTriTruoc: { quyen: [...] }`, `giaTriSau: { quyen: [...] }`).
  6. Trả về vai trò đã cập nhật (giống format của `danhSach()`).

### 3.4 Controller

```ts
@CanDo(MA_QUYEN.NGUOI_DUNG_XEM)
@Get()
danhSach() { ... } // khong doi

@CanDo(MA_QUYEN.NGUOI_DUNG_XEM)
@Get("quyen") // dat TRUOC :id (khong co, nhung giu quy uoc an toan) - toan bo danh muc quyen
layToanBoQuyen() { ... }

@CanDo(MA_QUYEN.VAI_TRO_SUA)
@Patch(":id/quyen")
suaQuyen(@Param("id") id: string, @Body(...) body: { quyenMa: string[] }, @NguoiDungHienTai() nd) { ... }
```

Cần schema validation mới ở `packages/validation` (`sua-quyen-vai-tro.schema.ts`): `z.object({ quyenMa: z.array(z.string()) })`.

## 4. Nhãn nhật ký

`packages/shared/src/nhat-ky/nhan-hanh-dong.ts`: thêm `SUA_QUYEN_VAI_TRO: { nhan: "Sửa quyền vai trò", nhom: "SUA" }` (dùng nhóm `SUA` có sẵn, không cần nhóm mới).

## 5. Frontend

`apps/web/hooks/use-danh-sach-vai-tro.ts`: thêm `useToanBoQuyen()` (gọi `GET /vai-tro/quyen`), `useSuaQuyenVaiTro()` (mutation `PATCH /vai-tro/:id/quyen`).

`apps/web/app/vai-tro/page.tsx` — viết lại theo bảng ma trận:
- Cột: 4 vai trò (thứ tự theo `ngayTao` như API trả) — cột Quản trị hệ thống hiện checkbox LUÔN TÍCH + khóa (`disabled`, kèm chú thích nhỏ "Cố định"); 3 cột còn lại checkbox bấm được.
- Hàng: toàn bộ quyền từ `useToanBoQuyen()`, nhóm theo `nhom` (dùng lại `NHAN_NHOM_QUYEN` cục bộ đã có), mỗi nhóm 1 hàng tiêu đề nhỏ trước khi liệt kê các quyền con.
- State cục bộ: với mỗi vai trò SỬA ĐƯỢC, giữ 1 `Set<string>` mã quyền đang chọn (khởi tạo từ dữ liệu server, KHÔNG tự lưu khi tích — người dùng tích/bỏ tích thoải mái trước, bấm "Lưu" mới gửi lên).
- Mỗi cột sửa được có badge/nút "Lưu thay đổi" xuất hiện khi tập quyền đang chọn khác với tập ban đầu — bấm gọi `useSuaQuyenVaiTro()`, xong thì đồng bộ lại state ban đầu = state hiện tại (hết "có thay đổi chưa lưu"), refetch danh sách.
- Rời trang/đổi vai trò khác mà chưa lưu: KHÔNG cảnh báo đặc biệt (chấp nhận đơn giản hóa — nếu cần "cảnh báo rời trang khi có thay đổi chưa lưu" sẽ bổ sung sau nếu người dùng thấy bất tiện thật, YAGNI ở bản đầu).

## 6. Rủi ro / lưu ý

- Không test được thật trong sandbox — cần `pnpm typecheck` + thử tay trên trình duyệt thật, đặc biệt xác nhận seed KHÔNG ghi đè quyền đã sửa qua UI sau khi chạy lại `pnpm --filter @congtac/api prisma:seed`.
- Từ nay, thêm quyền mới trong code sẽ KHÔNG tự động cấp cho Văn thư/Lãnh đạo TC-HC/Người xem — cần nhớ vào `/vai-tro` tích tay (đã ghi rõ ở mục 1, nhắc lại ở `NHAT_KY_QUYET_DINH.md` để không quên khi làm tính năng sau này).
- `suaQuyen()` chặn sửa Quản trị hệ thống ở TẦNG BACKEND (không chỉ ẩn checkbox ở UI) — đúng CLAUDE.md quy tắc #3.
