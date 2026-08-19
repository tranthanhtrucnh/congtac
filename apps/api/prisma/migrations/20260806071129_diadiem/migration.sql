-- CreateEnum
CREATE TYPE "TrangThaiDiaDiem" AS ENUM ('DANG_DUNG', 'NGUNG_DUNG');

-- CreateTable
CREATE TABLE "dia_diem" (
    "id" TEXT NOT NULL,
    "tenDayDu" TEXT NOT NULL,
    "cacTenTat" TEXT[],
    "ghiChu" TEXT,
    "trangThai" "TrangThaiDiaDiem" NOT NULL DEFAULT 'DANG_DUNG',
    "thuongDung" BOOLEAN NOT NULL DEFAULT false,
    "diemDiMacDinh" BOOLEAN NOT NULL DEFAULT false,
    "ngayTao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngayCapNhat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dia_diem_pkey" PRIMARY KEY ("id")
);
