import { Module } from "@nestjs/common";
import { DiaDiemController } from "./dia-diem.controller";
import { DiaDiemService } from "./dia-diem.service";

@Module({
  controllers: [DiaDiemController],
  providers: [DiaDiemService],
})
export class DiaDiemModule {}
