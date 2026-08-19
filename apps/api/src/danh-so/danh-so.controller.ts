import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import {
  danhSachDanhSoSchema,
  thietLapDanhSoSchema,
  type DanhSachDanhSoInput,
  type ThietLapDanhSoInput,
} from "@congtac/validation";
import { MA_QUYEN } from "@congtac/shared";
import { CanDo } from "../common/decorators/can-do.decorator";
import { NguoiDungHienTai, type NguoiDungYeuCau } from "../common/decorators/nguoi-dung-hien-tai.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { DanhSoService } from "./danh-so.service";

@Controller("danh-so")
export class DanhSoController {
  constructor(private readonly danhSoService: DanhSoService) {}

  @CanDo(MA_QUYEN.DANH_SO_THIET_LAP)
  @Get()
  danhSachTheoNam(@Query(new ZodValidationPipe(danhSachDanhSoSchema)) truyVan: DanhSachDanhSoInput) {
    return this.danhSoService.danhSachTheoNam(truyVan.nam);
  }

  @CanDo(MA_QUYEN.DANH_SO_THIET_LAP)
  @Post("thiet-lap")
  thietLap(
    @Body(new ZodValidationPipe(thietLapDanhSoSchema)) body: ThietLapDanhSoInput,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
  ) {
    return this.danhSoService.thietLap(body, nguoiDungHienTai.id);
  }
}
