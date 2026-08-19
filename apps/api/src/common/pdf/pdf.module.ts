import { Global, Module } from "@nestjs/common";
import { PdfService } from "./pdf.service";

// Global vi PdfService (quan ly 1 trinh duyet Chromium headless dung chung)
// se can cho nhieu module chung tu sau nay (LDX truoc, roi LDCT/GDD) - giong
// cach lam voi NhatKyModule, khong muon moi module tu khoi tao 1 Chromium
// rieng (ton bo nho/CPU).
@Global()
@Module({
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}
