import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { suaQuyenVaiTroSchema, type SuaQuyenVaiTroInput } from "@congtac/validation";
import { MA_QUYEN } from "@congtac/shared";
import { CanDo } from "../common/decorators/can-do.decorator";
import { NguoiDungHienTai, type NguoiDungYeuCau } from "../common/decorators/nguoi-dung-hien-tai.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { VaiTroService } from "./vai-tro.service";

@Controller("vai-tro")
export class VaiTroController {
  constructor(private readonly vaiTroService: VaiTroService) {}

  // Dung chung quyen xem/them nguoi dung - can danh sach nay de chon vai tro khi tao/sua,
  // va lam cot cua bang ma tran quyen o /vai-tro.
  @CanDo(MA_QUYEN.NGUOI_DUNG_XEM)
  @Get()
  danhSach() {
    return this.vaiTroService.danhSach();
  }

  // Toan bo danh muc quyen - dung quyen xem giong danhSach() (chi la du lieu
  // tra cuu, khong nhay cam hon).
  @CanDo(MA_QUYEN.NGUOI_DUNG_XEM)
  @Get("quyen")
  layToanBoQuyen() {
    return this.vaiTroService.layToanBoQuyen();
  }

  @CanDo(MA_QUYEN.VAI_TRO_SUA)
  @Patch(":id/quyen")
  suaQuyen(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(suaQuyenVaiTroSchema)) body: SuaQuyenVaiTroInput,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
  ) {
    return this.vaiTroService.suaQuyen(id, body.quyenMa, nguoiDungHienTai.id);
  }
}
