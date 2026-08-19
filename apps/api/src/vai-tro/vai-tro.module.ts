import { Module } from "@nestjs/common";
import { VaiTroController } from "./vai-tro.controller";
import { VaiTroService } from "./vai-tro.service";

@Module({
  controllers: [VaiTroController],
  providers: [VaiTroService],
})
export class VaiTroModule {}
