import { Module } from "@nestjs/common";
import { DanhSoController } from "./danh-so.controller";
import { DanhSoService } from "./danh-so.service";

@Module({
  controllers: [DanhSoController],
  providers: [DanhSoService],
  // Xuat DanhSoService de cac module chung tu sau nay (LDCT/GDD/LDX) inject
  // duoc va goi capSo() ngay trong transaction tao chung tu cua ho.
  exports: [DanhSoService],
})
export class DanhSoModule {}
