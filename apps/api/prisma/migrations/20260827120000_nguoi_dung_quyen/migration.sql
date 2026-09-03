-- CreateTable
CREATE TABLE "nguoi_dung_quyen" (
    "nguoiDungId" TEXT NOT NULL,
    "quyenId" TEXT NOT NULL,

    CONSTRAINT "nguoi_dung_quyen_pkey" PRIMARY KEY ("nguoiDungId","quyenId")
);

-- AddForeignKey
ALTER TABLE "nguoi_dung_quyen" ADD CONSTRAINT "nguoi_dung_quyen_nguoiDungId_fkey" FOREIGN KEY ("nguoiDungId") REFERENCES "nguoi_dung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nguoi_dung_quyen" ADD CONSTRAINT "nguoi_dung_quyen_quyenId_fkey" FOREIGN KEY ("quyenId") REFERENCES "quyen"("id") ON DELETE CASCADE ON UPDATE CASCADE;
