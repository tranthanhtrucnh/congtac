-- AlterTable
ALTER TABLE "cau_hinh_don_vi" ADD COLUMN     "logoBase64" TEXT,
ADD COLUMN     "logoKichThuocMm" INTEGER NOT NULL DEFAULT 80,
ADD COLUMN     "logoOpacityPhanTram" INTEGER NOT NULL DEFAULT 8;
