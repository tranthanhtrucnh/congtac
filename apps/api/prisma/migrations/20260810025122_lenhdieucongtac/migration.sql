-- AlterTable
ALTER TABLE "lenh_dieu_xe" ADD COLUMN     "lenhDieuCongTacId" TEXT,
ADD COLUMN     "thanhVienTaiXeId" TEXT;

-- CreateTable
CREATE TABLE "lenh_dieu_cong_tac" (
    "id" TEXT NOT NULL,
    "nam" INTEGER NOT NULL,
    "soThuTu" INTEGER NOT NULL,
    "soHieu" TEXT NOT NULL,
    "canCu" TEXT,
    "diaDiemCongTac" TEXT NOT NULL,
    "nhiemVu" TEXT NOT NULL,
    "ngayDi" TIMESTAMP(3) NOT NULL,
    "ngayVe" TIMESTAMP(3) NOT NULL,
    "ngayKy" TIMESTAMP(3) NOT NULL,
    "nguoiKyId" TEXT,
    "nguoiKyHoTen" TEXT NOT NULL,
    "nguoiKyChucDanh" TEXT NOT NULL,
    "nguoiKyTheThuc" TEXT NOT NULL,
    "daHuy" BOOLEAN NOT NULL DEFAULT false,
    "lyDoHuy" TEXT,
    "ngayTao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngayCapNhat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lenh_dieu_cong_tac_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thanh_vien_lenh_dieu_cong_tac" (
    "id" TEXT NOT NULL,
    "lenhDieuCongTacId" TEXT NOT NULL,
    "nhanVienId" TEXT,
    "hoTen" TEXT NOT NULL,
    "chucVu" TEXT NOT NULL,
    "cccd" TEXT NOT NULL,
    "ngayDiRieng" TIMESTAMP(3),
    "ngayVeRieng" TIMESTAMP(3),
    "thuTu" INTEGER NOT NULL DEFAULT 0,
    "daLoaiKhoiDoan" BOOLEAN NOT NULL DEFAULT false,
    "ngayTao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thanh_vien_lenh_dieu_cong_tac_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "giay_di_duong" (
    "id" TEXT NOT NULL,
    "nam" INTEGER NOT NULL,
    "soThuTu" INTEGER NOT NULL,
    "soHieu" TEXT NOT NULL,
    "lenhDieuCongTacId" TEXT NOT NULL,
    "thanhVienId" TEXT NOT NULL,
    "noiDiRieng" TEXT,
    "noiDenRieng" TEXT,
    "xacNhanNoiDen" TEXT,
    "daHuy" BOOLEAN NOT NULL DEFAULT false,
    "lyDoHuy" TEXT,
    "ngayTao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngayCapNhat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "giay_di_duong_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lenh_dieu_cong_tac_nam_soThuTu_key" ON "lenh_dieu_cong_tac"("nam", "soThuTu");

-- CreateIndex
CREATE INDEX "thanh_vien_lenh_dieu_cong_tac_lenhDieuCongTacId_idx" ON "thanh_vien_lenh_dieu_cong_tac"("lenhDieuCongTacId");

-- CreateIndex
CREATE UNIQUE INDEX "giay_di_duong_thanhVienId_key" ON "giay_di_duong"("thanhVienId");

-- CreateIndex
CREATE UNIQUE INDEX "giay_di_duong_nam_soThuTu_key" ON "giay_di_duong"("nam", "soThuTu");

-- CreateIndex
CREATE INDEX "lenh_dieu_xe_lenhDieuCongTacId_idx" ON "lenh_dieu_xe"("lenhDieuCongTacId");

-- AddForeignKey
ALTER TABLE "lenh_dieu_xe" ADD CONSTRAINT "lenh_dieu_xe_lenhDieuCongTacId_fkey" FOREIGN KEY ("lenhDieuCongTacId") REFERENCES "lenh_dieu_cong_tac"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lenh_dieu_xe" ADD CONSTRAINT "lenh_dieu_xe_thanhVienTaiXeId_fkey" FOREIGN KEY ("thanhVienTaiXeId") REFERENCES "thanh_vien_lenh_dieu_cong_tac"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lenh_dieu_cong_tac" ADD CONSTRAINT "lenh_dieu_cong_tac_nguoiKyId_fkey" FOREIGN KEY ("nguoiKyId") REFERENCES "nguoi_ky"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thanh_vien_lenh_dieu_cong_tac" ADD CONSTRAINT "thanh_vien_lenh_dieu_cong_tac_lenhDieuCongTacId_fkey" FOREIGN KEY ("lenhDieuCongTacId") REFERENCES "lenh_dieu_cong_tac"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thanh_vien_lenh_dieu_cong_tac" ADD CONSTRAINT "thanh_vien_lenh_dieu_cong_tac_nhanVienId_fkey" FOREIGN KEY ("nhanVienId") REFERENCES "nhan_vien"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "giay_di_duong" ADD CONSTRAINT "giay_di_duong_lenhDieuCongTacId_fkey" FOREIGN KEY ("lenhDieuCongTacId") REFERENCES "lenh_dieu_cong_tac"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "giay_di_duong" ADD CONSTRAINT "giay_di_duong_thanhVienId_fkey" FOREIGN KEY ("thanhVienId") REFERENCES "thanh_vien_lenh_dieu_cong_tac"("id") ON DELETE CASCADE ON UPDATE CASCADE;
