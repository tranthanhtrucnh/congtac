import { Module } from "@nestjs/common";
import { CauHinhDonViController } from "./cau-hinh-don-vi.controller";
import { CauHinhDonViService } from "./cau-hinh-don-vi.service";

@Module({
  controllers: [CauHinhDonViController],
  providers: [CauHinhDonViService],
  // Xuat de LenhDieuXeModule (va LDCT/GDD sau nay) inject duoc, lay cau hinh
  // luc tao HTML mau in.
  exports: [CauHinhDonViService],
})
export class CauHinhDonViModule {}
