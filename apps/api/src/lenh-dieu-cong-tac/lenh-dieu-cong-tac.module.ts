import { Module } from "@nestjs/common";
import { DanhSoModule } from "../danh-so/danh-so.module";
import { CauHinhDonViModule } from "../cau-hinh-don-vi/cau-hinh-don-vi.module";
import { LenhDieuCongTacController } from "./lenh-dieu-cong-tac.controller";
import { GiayDiDuongController } from "./giay-di-duong.controller";
import { LenhDieuCongTacService } from "./lenh-dieu-cong-tac.service";

@Module({
  // DanhSoModule: goi capSo() ngay trong transaction (LDCT + N GDD + LDX).
  // CauHinhDonViModule: mau in PDF sau nay (task rieng) can ten don vi.
  imports: [DanhSoModule, CauHinhDonViModule],
  // GiayDiDuongController: dat rieng (khong nhet vao LenhDieuCongTacController)
  // de tranh xung dot thu tu route voi @Get(":id") - xem doc comment trong file do.
  controllers: [LenhDieuCongTacController, GiayDiDuongController],
  providers: [LenhDieuCongTacService],
  exports: [LenhDieuCongTacService],
})
export class LenhDieuCongTacModule {}
