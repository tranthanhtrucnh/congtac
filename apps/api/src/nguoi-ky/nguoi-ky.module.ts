import { Module } from "@nestjs/common";
import { NguoiKyController } from "./nguoi-ky.controller";
import { NguoiKyService } from "./nguoi-ky.service";

@Module({
  controllers: [NguoiKyController],
  providers: [NguoiKyService],
})
export class NguoiKyModule {}
