import { Module } from "@nestjs/common";
import { PhuongTienController } from "./phuong-tien.controller";
import { PhuongTienService } from "./phuong-tien.service";

@Module({
  controllers: [PhuongTienController],
  providers: [PhuongTienService],
})
export class PhuongTienModule {}
