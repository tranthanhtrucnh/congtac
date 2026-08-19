import { Module } from "@nestjs/common";
import { NhanVienController } from "./nhan-vien.controller";
import { NhanVienService } from "./nhan-vien.service";
import { NhapNhanVienController } from "./nhap/nhap-nhan-vien.controller";
import { NhapNhanVienService } from "./nhap/nhap-nhan-vien.service";

@Module({
  controllers: [NhanVienController, NhapNhanVienController],
  providers: [NhanVienService, NhapNhanVienService],
})
export class NhanVienModule {}
