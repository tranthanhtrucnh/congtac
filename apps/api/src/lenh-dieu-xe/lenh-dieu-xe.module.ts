import { Module } from "@nestjs/common";
import { DanhSoModule } from "../danh-so/danh-so.module";
import { CauHinhDonViModule } from "../cau-hinh-don-vi/cau-hinh-don-vi.module";
import { LenhDieuXeController } from "./lenh-dieu-xe.controller";
import { LenhDieuXeService } from "./lenh-dieu-xe.service";

@Module({
  // Import DanhSoModule de inject DanhSoService (goi capSo() ngay trong
  // transaction tao LDX - xem LenhDieuXeService.tao()). Import
  // CauHinhDonViModule de lay ten don vi hien thi tren mau in PDF.
  imports: [DanhSoModule, CauHinhDonViModule],
  controllers: [LenhDieuXeController],
  providers: [LenhDieuXeService],
})
export class LenhDieuXeModule {}
