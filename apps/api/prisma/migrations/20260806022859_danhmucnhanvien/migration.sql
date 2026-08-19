-- CreateEnum
CREATE TYPE "TrangThaiNhanVien" AS ENUM ('DANG_LAM_VIEC', 'NGUNG_LAM_VIEC');

-- CreateTable
CREATE TABLE "nhan_vien" (
    "id" TEXT NOT NULL,
    "hoTen" TEXT NOT NULL,
    "hoTenKhongDau" TEXT NOT NULL,
    "ngaySinh" TIMESTAMP(3) NOT NULL,
    "cccd" TEXT NOT NULL,
    "chucVu" TEXT NOT NULL,
    "donViCongTac" TEXT,
    "laTaiXe" BOOLEAN NOT NULL DEFAULT false,
    "trangThai" "TrangThaiNhanVien" NOT NULL DEFAULT 'DANG_LAM_VIEC',
    "ngayTao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngayCapNhat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nhan_vien_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nhan_vien_cccd_key" ON "nhan_vien"("cccd");

-- CreateIndex
CREATE INDEX "nhan_vien_hoTenKhongDau_idx" ON "nhan_vien"("hoTenKhongDau");
