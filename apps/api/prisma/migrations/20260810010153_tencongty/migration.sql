-- CreateTable
CREATE TABLE "cau_hinh_don_vi" (
    "id" TEXT NOT NULL DEFAULT 'mac-dinh',
    "donViChuQuan" TEXT NOT NULL DEFAULT 'UBND TỈNH AN GIANG',
    "tenCoQuanDong1" TEXT NOT NULL DEFAULT 'CÔNG TY TNHH MỘT THÀNH VIÊN',
    "tenCoQuanDong2" TEXT NOT NULL DEFAULT 'XỔ SỐ KIẾN THIẾT AN GIANG',
    "tenNgan" TEXT NOT NULL DEFAULT 'XSKT An Giang',
    "diaDanh" TEXT NOT NULL DEFAULT 'An Giang',
    "ngayCapNhat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cau_hinh_don_vi_pkey" PRIMARY KEY ("id")
);
