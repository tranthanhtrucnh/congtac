import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import {
  danhSachPhuongTienSchema,
  taoPhuongTienSchema,
  suaPhuongTienSchema,
  xoaNhieuPhuongTienSchema,
  type DanhSachPhuongTienInput,
  type TaoPhuongTienInput,
  type SuaPhuongTienInput,
  type XoaNhieuPhuongTienInput,
} from "@congtac/validation";
import { MA_QUYEN } from "@congtac/shared";
import { CanDo } from "../common/decorators/can-do.decorator";
import { NguoiDungHienTai, type NguoiDungYeuCau } from "../common/decorators/nguoi-dung-hien-tai.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { PhuongTienService } from "./phuong-tien.service";

@Controller("phuong-tien")
export class PhuongTienController {
  constructor(private readonly phuongTienService: PhuongTienService) {}

  @CanDo(MA_QUYEN.PHUONG_TIEN_XEM)
  @Get()
  danhSach(@Query(new ZodValidationPipe(danhSachPhuongTienSchema)) truyVan: DanhSachPhuongTienInput) {
    return this.phuongTienService.danhSach(truyVan);
  }

  @CanDo(MA_QUYEN.PHUONG_TIEN_XEM)
  @Get(":id")
  chiTiet(@Param("id") id: string) {
    return this.phuongTienService.chiTiet(id);
  }

  @CanDo(MA_QUYEN.PHUONG_TIEN_THEM)
  @Post()
  tao(
    @Body(new ZodValidationPipe(taoPhuongTienSchema)) body: TaoPhuongTienInput,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
  ) {
    return this.phuongTienService.tao(body, nguoiDungHienTai.id);
  }

  @CanDo(MA_QUYEN.PHUONG_TIEN_XOA)
  @Post("xoa-nhieu")
  xoaNhieu(
    @Body(new ZodValidationPipe(xoaNhieuPhuongTienSchema)) body: XoaNhieuPhuongTienInput,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
  ) {
    return this.phuongTienService.xoaNhieu(body, nguoiDungHienTai.id);
  }

  @CanDo(MA_QUYEN.PHUONG_TIEN_SUA)
  @Patch(":id")
  sua(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(suaPhuongTienSchema)) body: SuaPhuongTienInput,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
  ) {
    return this.phuongTienService.sua(id, body, nguoiDungHienTai.id);
  }

  @CanDo(MA_QUYEN.PHUONG_TIEN_XOA)
  @Delete(":id")
  xoa(@Param("id") id: string, @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau) {
    return this.phuongTienService.xoa(id, nguoiDungHienTai.id);
  }
}
