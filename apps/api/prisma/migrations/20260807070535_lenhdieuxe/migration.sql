-- CreateEnum
CREATE TYPE "TrangThaiChungTu" AS ENUM ('NHAP', 'CHO_DUYET', 'DA_DUYET', 'TU_CHOI', 'DA_IN', 'DA_DONG_DAU', 'DA_HUY');

-- CreateTable
CREATE TABLE "lenh_dieu_xe" (
    "id" TEXT NOT NULL,
    "nam" INTEGER NOT NULL,
    "soThuTu" INTEGER NOT NULL,
    "soHieu" TEXT NOT NULL,
    "laiXeId" TEXT,
    "laiXeHoTen" TEXT NOT NULL,
    "phuongTienId" TEXT,
    "bienSo" TEXT NOT NULL,
    "nhanHieu" TEXT NOT NULL,
    "noiDi" TEXT NOT NULL,
    "noiDen" TEXT NOT NULL,
    "mucDich" TEXT NOT NULL,
    "ngayDi" TIMESTAMP(3) NOT NULL,
    "ngayVe" TIMESTAMP(3) NOT NULL,
    "ngayKy" TIMESTAMP(3) NOT NULL,
    "nguoiKyId" TEXT,
    "nguoiKyHoTen" TEXT NOT NULL,
    "nguoiKyChucDanh" TEXT NOT NULL,
    "nguoiKyTheThuc" TEXT NOT NULL,
    "trangThai" "TrangThaiChungTu" NOT NULL DEFAULT 'NHAP',
    "lyDoHuy" TEXT,
    "ngayTao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngayCapNhat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lenh_dieu_xe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lenh_dieu_xe_nam_soThuTu_key" ON "lenh_dieu_xe"("nam", "soThuTu");

-- AddForeignKey
ALTER TABLE "lenh_dieu_xe" ADD CONSTRAINT "lenh_dieu_xe_laiXeId_fkey" FOREIGN KEY ("laiXeId") REFERENCES "nhan_vien"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lenh_dieu_xe" ADD CONSTRAINT "lenh_dieu_xe_phuongTienId_fkey" FOREIGN KEY ("phuongTienId") REFERENCES "phuong_tien"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lenh_dieu_xe" ADD CONSTRAINT "lenh_dieu_xe_nguoiKyId_fkey" FOREIGN KEY ("nguoiKyId") REFERENCES "nguoi_ky"("id") ON DELETE SET NULL ON UPDATE CASCADE;
