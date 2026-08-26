import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import {
  danhSachNhanVienSchema,
  taoNhanVienSchema,
  suaNhanVienSchema,
  xoaNhieuNhanVienSchema,
  kiemTraTrungLichNhanVienSchema,
  type DanhSachNhanVienInput,
  type TaoNhanVienInput,
  type SuaNhanVienInput,
  type XoaNhieuNhanVienInput,
  type KiemTraTrungLichNhanVienInput,
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

  // /:id/trung-lich co 2 doan sau "/nhan-vien" (khac ":id" 1 doan) nen khong
  // xung dot thu tu voi route ":id" o tren, du dat truoc hay sau.
  @CanDo(MA_QUYEN.NHAN_VIEN_XEM)
  @Get(":id/trung-lich")
  kiemTraTrungLich(
    @Param("id") id: string,
    @Query(new ZodValidationPipe(kiemTraTrungLichNhanVienSchema)) truyVan: KiemTraTrungLichNhanVienInput,
  ) {
    return this.nhanVienService.kiemTraTrungLich(id, truyVan.ngayDi, truyVan.ngayVe, truyVan.loaiTruLenhId);
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
