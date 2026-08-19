-- CreateEnum
CREATE TYPE "LoaiChungTu" AS ENUM ('LDCT', 'GDD', 'LDX');

-- CreateTable
CREATE TABLE "cau_hinh_danh_so" (
    "id" TEXT NOT NULL,
    "loaiChungTu" "LoaiChungTu" NOT NULL,
    "nam" INTEGER NOT NULL,
    "soBatDau" INTEGER NOT NULL DEFAULT 1,
    "soHienTai" INTEGER NOT NULL DEFAULT 0,
    "ngayTao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngayCapNhat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cau_hinh_danh_so_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cau_hinh_danh_so_loaiChungTu_nam_key" ON "cau_hinh_danh_so"("loaiChungTu", "nam");
