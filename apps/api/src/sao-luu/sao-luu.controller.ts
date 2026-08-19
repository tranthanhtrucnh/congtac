import { BadRequestException, Body, Controller, Get, Post, StreamableFile, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Express } from "express";
import { MA_QUYEN } from "@congtac/shared";
import { CanDo } from "../common/decorators/can-do.decorator";
import { NguoiDungHienTai, type NguoiDungYeuCau } from "../common/decorators/nguoi-dung-hien-tai.decorator";
import { SaoLuuService } from "./sao-luu.service";

// Du du cho du lieu cong ty hien tai (~vai chuc MB toi da), khong can gioi han
// chat - xem docs/superpowers/specs/2026-08-14-sao-luu-phuc-hoi-du-lieu-design.md.
const GIOI_HAN_DUNG_LUONG_FILE = 500 * 1024 * 1024;

@Controller("sao-luu")
export class SaoLuuController {
  constructor(private readonly saoLuuService: SaoLuuService) {}

  @CanDo(MA_QUYEN.SAO_LUU_QUAN_LY)
  @Get("tien-trinh")
  tienTrinh() {
    return this.saoLuuService.layTienTrinh();
  }

  @CanDo(MA_QUYEN.SAO_LUU_QUAN_LY)
  @Post("chay")
  async chay(@NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau) {
    await this.saoLuuService.chaySaoLuuNgay(nguoiDungHienTai.id);
    return { dangChay: true };
  }

  // Chi goi duoc khi TienTrinhSaoLuu.sanSangTai === true (kiem tra o service).
  // Doc toan bo file tam vao bo nho roi tra ve - don gian hon xu ly vong doi
  // stream, va xoa file tam ngay sau khi doc xong (khong phu thuoc su kien
  // 'close' cua response).
  @CanDo(MA_QUYEN.SAO_LUU_QUAN_LY)
  @Get("tai-xuong")
  async taiXuong(): Promise<StreamableFile> {
    const { noiDung, tenFile } = await this.saoLuuService.layFileTaiXuongVaXoa();
    return new StreamableFile(noiDung, {
      type: "application/sql",
      disposition: `attachment; filename="${tenFile}"`,
    });
  }

  @CanDo(MA_QUYEN.SAO_LUU_QUAN_LY)
  @Post("phuc-hoi")
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: GIOI_HAN_DUNG_LUONG_FILE } }))
  async phucHoi(
    @UploadedFile() file: Express.Multer.File,
    @Body("xacNhan") xacNhan: string,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
  ) {
    if (!file) {
      throw new BadRequestException("Vui lòng chọn file .sql cần phục hồi");
    }
    await this.saoLuuService.batDauPhucHoi(file.buffer, file.originalname, xacNhan, nguoiDungHienTai.id);
    return { dangChay: true };
  }
}
