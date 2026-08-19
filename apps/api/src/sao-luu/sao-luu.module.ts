import { Module } from "@nestjs/common";
import { SaoLuuController } from "./sao-luu.controller";
import { SaoLuuService } from "./sao-luu.service";

// PrismaService/NhatKyService la @Global() (PrismaModule/NhatKyModule) - khong
// can import lai o day, giong convention cac module khac trong du an.
@Module({
  controllers: [SaoLuuController],
  providers: [SaoLuuService],
})
export class SaoLuuModule {}
