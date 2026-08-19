import { Module } from "@nestjs/common";
import { NhatKyController } from "./nhat-ky.controller";
import { NhatKyXemService } from "./nhat-ky.service";

@Module({
  controllers: [NhatKyController],
  providers: [NhatKyXemService],
})
export class NhatKyXemModule {}
