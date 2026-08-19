-- Doi LenhDieuCongTac.mauInTram (Boolean) sang loaiMauIn (enum 3 gia tri) -
-- them dang mau in thu 3 "Phat hanh, thu hoi ve e" ben canh Tuyen thuong/Tram
-- da co. Xem NHAT_KY_QUYET_DINH.md muc "Mau in Phat hanh, thu hoi ve e".

-- CreateEnum
CREATE TYPE "LoaiMauInLenhDieuCongTac" AS ENUM ('TUYEN_THUONG', 'TRAM', 'PHAT_HANH_THU_HOI_VE_E');

-- AlterTable: them cot moi voi gia tri mac dinh tam de backfill, roi doi lai
-- default that su sau khi Prisma schema da khai bao @default(TUYEN_THUONG).
ALTER TABLE "lenh_dieu_cong_tac" ADD COLUMN "loaiMauIn" "LoaiMauInLenhDieuCongTac" NOT NULL DEFAULT 'TUYEN_THUONG';

-- Backfill: ban ghi cu mauInTram=true -> TRAM, false (mac dinh) -> giu
-- TUYEN_THUONG (da la default cua cot moi, khong can UPDATE rieng).
UPDATE "lenh_dieu_cong_tac" SET "loaiMauIn" = 'TRAM' WHERE "mauInTram" = true;

-- Xoa cot cu, khong con dung nua.
ALTER TABLE "lenh_dieu_cong_tac" DROP COLUMN "mauInTram";
