-- CreateEnum
CREATE TYPE "TrangThaiPhuongTien" AS ENUM ('DANG_SU_DUNG', 'NGUNG_SU_DUNG');

-- CreateTable
CREATE TABLE "phuong_tien" (
    "id" TEXT NOT NULL,
    "bienSo" TEXT NOT NULL,
    "bienSoChuan" TEXT NOT NULL,
    "nhanHieu" TEXT NOT NULL,
    "loaiXe" TEXT,
    "soCho" INTEGER,
    "ghiChu" TEXT,
    "trangThai" "TrangThaiPhuongTien" NOT NULL DEFAULT 'DANG_SU_DUNG',
    "taiXeThuongDungId" TEXT,
    "ngayTao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngayCapNhat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phuong_tien_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "phuong_tien_bienSoChuan_key" ON "phuong_tien"("bienSoChuan");

-- CreateIndex
CREATE INDEX "phuong_tien_taiXeThuongDungId_idx" ON "phuong_tien"("taiXeThuongDungId");

-- AddForeignKey
ALTER TABLE "phuong_tien" ADD CONSTRAINT "phuong_tien_taiXeThuongDungId_fkey" FOREIGN KEY ("taiXeThuongDungId") REFERENCES "nhan_vien"("id") ON DELETE SET NULL ON UPDATE CASCADE;
