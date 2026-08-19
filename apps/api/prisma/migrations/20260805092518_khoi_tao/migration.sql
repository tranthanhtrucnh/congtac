-- CreateEnum
CREATE TYPE "TrangThaiTaiKhoan" AS ENUM ('HOAT_DONG', 'KHOA');

-- CreateTable
CREATE TABLE "nguoi_dung" (
    "id" TEXT NOT NULL,
    "tenDangNhap" TEXT NOT NULL,
    "matKhauBam" TEXT NOT NULL,
    "hoTen" TEXT NOT NULL,
    "trangThai" "TrangThaiTaiKhoan" NOT NULL DEFAULT 'HOAT_DONG',
    "phaiDoiMatKhau" BOOLEAN NOT NULL DEFAULT true,
    "nguoiTaoId" TEXT,
    "ngayTao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngayCapNhat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nguoi_dung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vai_tro" (
    "id" TEXT NOT NULL,
    "ma" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "moTa" TEXT,
    "heThong" BOOLEAN NOT NULL DEFAULT false,
    "ngayTao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vai_tro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quyen" (
    "id" TEXT NOT NULL,
    "ma" TEXT NOT NULL,
    "nhom" TEXT NOT NULL,
    "moTa" TEXT,

    CONSTRAINT "quyen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vai_tro_quyen" (
    "vaiTroId" TEXT NOT NULL,
    "quyenId" TEXT NOT NULL,

    CONSTRAINT "vai_tro_quyen_pkey" PRIMARY KEY ("vaiTroId","quyenId")
);

-- CreateTable
CREATE TABLE "nguoi_dung_vai_tro" (
    "nguoiDungId" TEXT NOT NULL,
    "vaiTroId" TEXT NOT NULL,

    CONSTRAINT "nguoi_dung_vai_tro_pkey" PRIMARY KEY ("nguoiDungId","vaiTroId")
);

-- CreateTable
CREATE TABLE "phien_lam_moi" (
    "id" TEXT NOT NULL,
    "nguoiDungId" TEXT NOT NULL,
    "tokenBam" TEXT NOT NULL,
    "thoiGianTao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "thoiGianHetHan" TIMESTAMP(3) NOT NULL,
    "thuHoi" BOOLEAN NOT NULL DEFAULT false,
    "thoiGianThuHoi" TIMESTAMP(3),
    "userAgent" TEXT,
    "diaChiIp" TEXT,

    CONSTRAINT "phien_lam_moi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nhat_ky_he_thong" (
    "id" TEXT NOT NULL,
    "nguoiDungId" TEXT,
    "hanhDong" TEXT NOT NULL,
    "doiTuong" TEXT NOT NULL,
    "doiTuongId" TEXT,
    "giaTriTruoc" JSONB,
    "giaTriSau" JSONB,
    "diaChiIp" TEXT,
    "thoiGian" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nhat_ky_he_thong_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nguoi_dung_tenDangNhap_key" ON "nguoi_dung"("tenDangNhap");

-- CreateIndex
CREATE UNIQUE INDEX "vai_tro_ma_key" ON "vai_tro"("ma");

-- CreateIndex
CREATE UNIQUE INDEX "quyen_ma_key" ON "quyen"("ma");

-- CreateIndex
CREATE UNIQUE INDEX "phien_lam_moi_tokenBam_key" ON "phien_lam_moi"("tokenBam");

-- CreateIndex
CREATE INDEX "phien_lam_moi_nguoiDungId_idx" ON "phien_lam_moi"("nguoiDungId");

-- CreateIndex
CREATE INDEX "nhat_ky_he_thong_nguoiDungId_idx" ON "nhat_ky_he_thong"("nguoiDungId");

-- CreateIndex
CREATE INDEX "nhat_ky_he_thong_doiTuong_doiTuongId_idx" ON "nhat_ky_he_thong"("doiTuong", "doiTuongId");

-- AddForeignKey
ALTER TABLE "nguoi_dung" ADD CONSTRAINT "nguoi_dung_nguoiTaoId_fkey" FOREIGN KEY ("nguoiTaoId") REFERENCES "nguoi_dung"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vai_tro_quyen" ADD CONSTRAINT "vai_tro_quyen_vaiTroId_fkey" FOREIGN KEY ("vaiTroId") REFERENCES "vai_tro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vai_tro_quyen" ADD CONSTRAINT "vai_tro_quyen_quyenId_fkey" FOREIGN KEY ("quyenId") REFERENCES "quyen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nguoi_dung_vai_tro" ADD CONSTRAINT "nguoi_dung_vai_tro_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "nguoi_dung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nguoi_dung_vai_tro" ADD CONSTRAINT "nguoi_dung_vai_tro_vaiTroId_fkey" FOREIGN KEY ("vaiTroId") REFERENCES "vai_tro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phien_lam_moi" ADD CONSTRAINT "phien_lam_moi_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "nguoi_dung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nhat_ky_he_thong" ADD CONSTRAINT "nhat_ky_he_thong_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "nguoi_dung"("id") ON DELETE SET NULL ON UPDATE CASCADE;
