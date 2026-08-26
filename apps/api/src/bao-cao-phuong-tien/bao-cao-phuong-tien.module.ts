import { Module } from "@nestjs/common";
import { CauHinhDonViModule } from "../cau-hinh-don-vi/cau-hinh-don-vi.module";
import { BaoCaoPhuongTienController } from "./bao-cao-phuong-tien.controller";
import { BaoCaoPhuongTienService } from "./bao-cao-phuong-tien.service";

// CauHinhDonViModule - endpoint "in" can ten don vi/quoc hieu cho letterhead,
// giong SoCongLenhModule. PdfService/NhatKyService KHONG can khai bao o day -
// ca 2 deu la module @Global() (xem pdf.module.ts/nhat-ky.module.ts).
@Module({
  imports: [CauHinhDonViModule],
  controllers: [BaoCaoPhuongTienController],
  providers: [BaoCaoPhuongTienService],
})
export class BaoCaoPhuongTienModule {}
