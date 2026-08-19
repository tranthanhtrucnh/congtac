import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import {
  danhSachDiaDiemSchema,
  taoDiaDiemSchema,
  suaDiaDiemSchema,
  xoaNhieuDiaDiemSchema,
  type DanhSachDiaDiemInput,
  type TaoDiaDiemInput,
  type SuaDiaDiemInput,
  type XoaNhieuDiaDiemInput,
} from "@congtac/validation";
import { MA_QUYEN } from "@congtac/shared";
import { CanDo } from "../common/decorators/can-do.decorator";
import { NguoiDungHienTai, type NguoiDungYeuCau } from "../common/decorators/nguoi-dung-hien-tai.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { DiaDiemService } from "./dia-diem.service";

@Controller("dia-diem")
export class DiaDiemController {
  constructor(private readonly diaDiemService: DiaDiemService) {}

  @CanDo(MA_QUYEN.DIA_DIEM_XEM)
  @Get()
  danhSach(@Query(new ZodValidationPipe(danhSachDiaDiemSchema)) truyVan: DanhSachDiaDiemInput) {
    return this.diaDiemService.danhSach(truyVan);
  }

  @CanDo(MA_QUYEN.DIA_DIEM_XEM)
  @Get(":id")
  chiTiet(@Param("id") id: string) {
    return this.diaDiemService.chiTiet(id);
  }

  @CanDo(MA_QUYEN.DIA_DIEM_THEM)
  @Post()
  tao(
    @Body(new ZodValidationPipe(taoDiaDiemSchema)) body: TaoDiaDiemInput,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
  ) {
    return this.diaDiemService.tao(body, nguoiDungHienTai.id);
  }

  @CanDo(MA_QUYEN.DIA_DIEM_XOA)
  @Post("xoa-nhieu")
  xoaNhieu(
    @Body(new ZodValidationPipe(xoaNhieuDiaDiemSchema)) body: XoaNhieuDiaDiemInput,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
  ) {
    return this.diaDiemService.xoaNhieu(body, nguoiDungHienTai.id);
  }

  @CanDo(MA_QUYEN.DIA_DIEM_SUA)
  @Patch(":id")
  sua(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(suaDiaDiemSchema)) body: SuaDiaDiemInput,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
  ) {
    return this.diaDiemService.sua(id, body, nguoiDungHienTai.id);
  }

  @CanDo(MA_QUYEN.DIA_DIEM_XOA)
  @Delete(":id")
  xoa(@Param("id") id: string, @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau) {
    return this.diaDiemService.xoa(id, nguoiDungHienTai.id);
  }
}
