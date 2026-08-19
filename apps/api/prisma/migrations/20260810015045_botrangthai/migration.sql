/*
  Warnings:

  - You are about to drop the column `trangThai` on the `lenh_dieu_xe` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "lenh_dieu_xe" DROP COLUMN "trangThai",
ADD COLUMN     "daHuy" BOOLEAN NOT NULL DEFAULT false;

-- DropEnum
DROP TYPE "TrangThaiChungTu";
