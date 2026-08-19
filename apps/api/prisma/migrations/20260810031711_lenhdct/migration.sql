/*
  Warnings:

  - You are about to drop the column `nhiemVu` on the `lenh_dieu_cong_tac` table. All the data in the column will be lost.
  - Added the required column `mucDich` to the `lenh_dieu_cong_tac` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "lenh_dieu_cong_tac" DROP COLUMN "nhiemVu",
ADD COLUMN     "mucDich" TEXT NOT NULL;
