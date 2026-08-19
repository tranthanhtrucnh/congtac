import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import {
  phanTrangSchema,
  taoNguoiDungSchema,
  suaNguoiDungSchema,
  type PhanTrangInput,
  type TaoNguoiDungInput,
  type SuaNguoiDungInput,
} from "@congtac/validation";
import { MA_QUYEN } from "@congtac/shared";
import { CanDo } from "../common/decorators/can-do.decorator";
import { NguoiDungHienTai, type NguoiDungYeuCau } from "../common/decorators/nguoi-dung-hien-tai.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { NguoiDungService } from "./nguoi-dung.service";

@Controller("nguoi-dung")
export class NguoiDungController {
  constructor(private readonly nguoiDungService: NguoiDungService) {}

  @CanDo(MA_QUYEN.NGUOI_DUNG_XEM)
  @Get()
  danhSach(@Query(new ZodValidationPipe(phanTrangSchema)) phanTrang: PhanTrangInput) {
    return this.nguoiDungService.danhSach(phanTrang);
  }

  @CanDo(MA_QUYEN.NGUOI_DUNG_XEM)
  @Get(":id")
  chiTiet(@Param("id") id: string) {
    return this.nguoiDungService.chiTiet(id);
  }

  @CanDo(MA_QUYEN.NGUOI_DUNG_THEM)
  @Post()
  tao(
    @Body(new ZodValidationPipe(taoNguoiDungSchema)) body: TaoNguoiDungInput,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
  ) {
    return this.nguoiDungService.tao(body, nguoiDungHienTai.id);
  }

  @CanDo(MA_QUYEN.NGUOI_DUNG_SUA)
  @Patch(":id")
  sua(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(suaNguoiDungSchema)) body: SuaNguoiDungInput,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
  ) {
    return this.nguoiDungService.sua(id, body, nguoiDungHienTai.id);
  }

  @CanDo(MA_QUYEN.NGUOI_DUNG_KHOA)
  @Patch(":id/khoa")
  khoa(@Param("id") id: string, @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau) {
    return this.nguoiDungService.khoa(id, nguoiDungHienTai.id);
  }

  @CanDo(MA_QUYEN.NGUOI_DUNG_KHOA)
  @Patch(":id/mo-khoa")
  moKhoa(@Param("id") id: string, @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau) {
    return this.nguoiDungService.moKhoa(id, nguoiDungHienTai.id);
  }

  @CanDo(MA_QUYEN.NGUOI_DUNG_SUA)
  @Post(":id/dat-lai-mat-khau")
  datLaiMatKhau(@Param("id") id: string, @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau) {
    return this.nguoiDungService.datLaiMatKhau(id, nguoiDungHienTai.id);
  }
}
