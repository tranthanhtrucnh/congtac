import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import {
  danhSachDanhSoSchema,
  thietLapDanhSoSchema,
  chungTuSoLonNhatSchema,
  type DanhSachDanhSoInput,
  type ThietLapDanhSoInput,
  type ChungTuSoLonNhatInput,
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

  // Gate bang CHUNG_TU_XEM (khong phai DANH_SO_THIET_LAP nhu 2 route tren) -
  // route nay phuc vu Van thu dang Lap/Sua LDCT/LDX (canh bao ngay lap khong
  // theo thu tu so hieu), KHONG phai thao tac quan tri day so - Van thu
  // thuong KHONG co quyen DANH_SO_THIET_LAP nhung LUON co CHUNG_TU_XEM.
  @CanDo(MA_QUYEN.CHUNG_TU_XEM)
  @Get("chung-tu-so-lon-nhat")
  chungTuSoLonNhat(@Query(new ZodValidationPipe(chungTuSoLonNhatSchema)) truyVan: ChungTuSoLonNhatInput) {
    return this.danhSoService.layChungTuSoLonNhat(truyVan.loaiChungTu, truyVan.nam, truyVan.loaiTruId);
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
