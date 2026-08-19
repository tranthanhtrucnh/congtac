import { BadRequestException, Body, Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Express } from "express";
import { xacNhanNhapNhanVienSchema, type XacNhanNhapNhanVienInput } from "@congtac/validation";
import { MA_QUYEN } from "@congtac/shared";
import { CanDo } from "../../common/decorators/can-do.decorator";
import { NguoiDungHienTai, type NguoiDungYeuCau } from "../../common/decorators/nguoi-dung-hien-tai.decorator";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { NhapNhanVienService } from "./nhap-nhan-vien.service";

const GIOI_HAN_DUNG_LUONG_FILE = 10 * 1024 * 1024; // 10MB - danh sach nhan vien vai tram dong khong the vuot qua muc nay

@Controller("nhan-vien/nhap")
export class NhapNhanVienController {
  constructor(private readonly nhapNhanVienService: NhapNhanVienService) {}

  @CanDo(MA_QUYEN.NHAN_VIEN_THEM)
  @Post("xem-truoc")
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: GIOI_HAN_DUNG_LUONG_FILE } }))
  async xemTruoc(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("Vui lòng chọn file .xlsx hoặc .docx");
    }
    return this.nhapNhanVienService.xemTruoc(file.buffer, file.originalname);
  }

  @CanDo(MA_QUYEN.NHAN_VIEN_THEM)
  @Post("xac-nhan")
  xacNhan(
    @Body(new ZodValidationPipe(xacNhanNhapNhanVienSchema)) body: XacNhanNhapNhanVienInput,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
  ) {
    return this.nhapNhanVienService.xacNhan(body, nguoiDungHienTai.id);
  }
}
