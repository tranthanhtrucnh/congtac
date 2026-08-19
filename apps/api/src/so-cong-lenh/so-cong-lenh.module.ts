import { Module } from "@nestjs/common";
import { SoCongLenhController } from "./so-cong-lenh.controller";
import { SoCongLenhService } from "./so-cong-lenh.service";

@Module({
  controllers: [SoCongLenhController],
  providers: [SoCongLenhService],
})
export class SoCongLenhModule {}
