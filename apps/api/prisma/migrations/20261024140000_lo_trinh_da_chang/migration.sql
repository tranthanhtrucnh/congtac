-- Them cot cacChang va cacChangRieng de luu lo trinh da chang (toi da 4 chang)
-- cua doan cong tac va tung giay di duong (2026-10-24, xem NHAT_KY_QUYET_DINH.md).
ALTER TABLE "lenh_dieu_cong_tac" ADD COLUMN IF NOT EXISTS "cacChang" JSONB;
ALTER TABLE "giay_di_duong" ADD COLUMN IF NOT EXISTS "cacChangRieng" JSONB;
