import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import {
  danhSachNguoiKySchema,
  taoNguoiKySchema,
  suaNguoiKySchema,
  type DanhSachNguoiKyInput,
  type TaoNguoiKyInput,
  type SuaNguoiKyInput,
} from "@congtac/validation";
import { MA_QUYEN } from "@congtac/shared";
import { CanDo } from "../common/decorators/can-do.decorator";
import { NguoiDungHienTai, type NguoiDungYeuCau } from "../common/decorators/nguoi-dung-hien-tai.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { NguoiKyService } from "./nguoi-ky.service";

@Controller("nguoi-ky")
export class NguoiKyController {
  constructor(private readonly nguoiKyService: NguoiKyService) {}

  @CanDo(MA_QUYEN.NGUOI_KY_XEM)
  @Get()
  danhSach(@Query(new ZodValidationPipe(danhSachNguoiKySchema)) truyVan: DanhSachNguoiKyInput) {
    return this.nguoiKyService.danhSach(truyVan);
  }

  @CanDo(MA_QUYEN.NGUOI_KY_XEM)
  @Get(":id")
  chiTiet(@Param("id") id: string) {
    return this.nguoiKyService.chiTiet(id);
  }

  @CanDo(MA_QUYEN.NGUOI_KY_THEM)
  @Post()
  tao(
    @Body(new ZodValidationPipe(taoNguoiKySchema)) body: TaoNguoiKyInput,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
  ) {
    return this.nguoiKyService.tao(body, nguoiDungHienTai.id);
  }

  // Hanh dong rieng, dung quyen rieng (nguoi-ky.dat-chinh-thuc) - cap cho ca
  // Lanh dao Phong TC-HC, khong chi Quan tri he thong. Dat truoc route
  // ":id" (PATCH thuong) de khong xung dot voi Nest route matching.
  @CanDo(MA_QUYEN.NGUOI_KY_DAT_CHINH_THUC)
  @Post(":id/dat-chinh-thuc")
  datChinhThuc(@Param("id") id: string, @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau) {
    return this.nguoiKyService.datChinhThuc(id, nguoiDungHienTai.id);
  }

  @CanDo(MA_QUYEN.NGUOI_KY_SUA)
  @Patch(":id")
  sua(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(suaNguoiKySchema)) body: SuaNguoiKyInput,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
  ) {
    return this.nguoiKyService.sua(id, body, nguoiDungHienTai.id);
  }

  @CanDo(MA_QUYEN.NGUOI_KY_XOA)
  @Delete(":id")
  xoa(@Param("id") id: string, @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau) {
    return this.nguoiKyService.xoa(id, nguoiDungHienTai.id);
  }
}
