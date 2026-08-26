import { Module } from "@nestjs/common";
import { CauHinhDonViModule } from "../cau-hinh-don-vi/cau-hinh-don-vi.module";
import { SoCongLenhController } from "./so-cong-lenh.controller";
import { SoCongLenhService } from "./so-cong-lenh.service";

// CauHinhDonViModule - endpoint "in" (mau "So theo doi cong lenh", them
// 2026-08-26) can ten don vi/quoc hieu cho letterhead, giong cach
// LenhDieuCongTacModule dang lam. PdfService/NhatKyService KHONG can khai bao
// o day - ca 2 deu la module @Global() (xem pdf.module.ts/nhat-ky.module.ts).
@Module({
  imports: [CauHinhDonViModule],
  controllers: [SoCongLenhController],
  providers: [SoCongLenhService],
})
export class SoCongLenhModule {}
