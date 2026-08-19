import { Global, Module } from "@nestjs/common";
import { NhatKyService } from "./nhat-ky.service";

@Global()
@Module({
  providers: [NhatKyService],
  exports: [NhatKyService],
})
export class NhatKyModule {}
