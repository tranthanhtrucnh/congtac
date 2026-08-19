-- CreateEnum
CREATE TYPE "TrangThaiNguoiKy" AS ENUM ('DANG_KY_CHINH_THUC', 'DU_PHONG', 'NGUNG_SU_DUNG');

-- CreateTable
CREATE TABLE "nguoi_ky" (
    "id" TEXT NOT NULL,
    "nhanVienId" TEXT NOT NULL,
    "chucDanhKy" TEXT NOT NULL,
    "theThucKy" TEXT NOT NULL,
    "ghiChu" TEXT,
    "trangThai" "TrangThaiNguoiKy" NOT NULL DEFAULT 'DU_PHONG',
    "ngayTao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngayCapNhat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nguoi_ky_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nguoi_ky_nhanVienId_key" ON "nguoi_ky"("nhanVienId");

-- AddForeignKey
ALTER TABLE "nguoi_ky" ADD CONSTRAINT "nguoi_ky_nhanVienId_fkey" FOREIGN KEY ("nhanVienId") REFERENCES "nhan_vien"("id") ON DELETE CASCADE ON UPDATE CASCADE;
