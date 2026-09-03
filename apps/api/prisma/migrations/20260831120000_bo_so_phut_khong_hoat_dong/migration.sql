-- Bo tinh nang tu dong dang xuat khi khong thao tac (nguoi dung yeu cau
-- 2026-08-31: "mình muốn chỉ đăng xuất khi người dùng bấm đăng xuất") - cot
-- nay khong con duoc doc/ghi o dau trong code nua, xoa han de tranh cau hinh
-- "chet" gay nham lan sau nay. Xem NHAT_KY_QUYET_DINH.md.
ALTER TABLE "cau_hinh_don_vi" DROP COLUMN "soPhutKhongHoatDong";
