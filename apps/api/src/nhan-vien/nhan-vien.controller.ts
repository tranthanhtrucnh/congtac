import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import {
  danhSachNhanVienSchema,
  taoNhanVienSchema,
  suaNhanVienSchema,
  xoaNhieuNhanVienSchema,
  type DanhSachNhanVienInput,
  type TaoNhanVienInput,
  type SuaNhanVienInput,
  type XoaNhieuNhanVienInput,
} from "@congtac/validation";
import { MA_QUYEN } from "@congtac/shared";
import { CanDo } from "../common/decorators/can-do.decorator";
import { NguoiDungHienTai, type NguoiDungYeuCau } from "../common/decorators/nguoi-dung-hien-tai.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { NhanVienService } from "./nhan-vien.service";

@Controller("nhan-vien")
export class NhanVienController {
  constructor(private readonly nhanVienService: NhanVienService) {}

  @CanDo(MA_QUYEN.NHAN_VIEN_XEM)
  @Get()
  danhSach(@Query(new ZodValidationPipe(danhSachNhanVienSchema)) truyVan: DanhSachNhanVienInput) {
    return this.nhanVienService.danhSach(truyVan);
  }

  @CanDo(MA_QUYEN.NHAN_VIEN_XEM)
  @Get(":id")
  chiTiet(@Param("id") id: string) {
    return this.nhanVienService.chiTiet(id);
  }

  @CanDo(MA_QUYEN.NHAN_VIEN_THEM)
  @Post()
  tao(
    @Body(new ZodValidationPipe(taoNhanVienSchema)) body: TaoNhanVienInput,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
  ) {
    return this.nhanVienService.tao(body, nguoiDungHienTai.id);
  }

  @CanDo(MA_QUYEN.NHAN_VIEN_XOA)
  @Post("xoa-nhieu")
  xoaNhieu(
    @Body(new ZodValidationPipe(xoaNhieuNhanVienSchema)) body: XoaNhieuNhanVienInput,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
  ) {
    return this.nhanVienService.xoaNhieu(body, nguoiDungHienTai.id);
  }

  @CanDo(MA_QUYEN.NHAN_VIEN_SUA)
  @Patch(":id")
  sua(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(suaNhanVienSchema)) body: SuaNhanVienInput,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
  ) {
    return this.nhanVienService.sua(id, body, nguoiDungHienTai.id);
  }

  @CanDo(MA_QUYEN.NHAN_VIEN_XOA)
  @Delete(":id")
  xoa(@Param("id") id: string, @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau) {
    return this.nhanVienService.xoa(id, nguoiDungHienTai.id);
  }
}
