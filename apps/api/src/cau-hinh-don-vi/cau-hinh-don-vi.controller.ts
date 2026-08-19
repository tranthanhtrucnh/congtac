import { Body, Controller, Get, Patch } from "@nestjs/common";
import { suaCauHinhDonViSchema, type SuaCauHinhDonViInput } from "@congtac/validation";
import { MA_QUYEN } from "@congtac/shared";
import { CanDo } from "../common/decorators/can-do.decorator";
import { NguoiDungHienTai, type NguoiDungYeuCau } from "../common/decorators/nguoi-dung-hien-tai.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { CauHinhDonViService } from "./cau-hinh-don-vi.service";

@Controller("cau-hinh-don-vi")
export class CauHinhDonViController {
  constructor(private readonly cauHinhDonViService: CauHinhDonViService) {}

  // Quyen xem cap cho ca 4 vai tro mac dinh - sidebar/mau in can doc duoc
  // (xem MA_QUYEN.DON_VI_XEM trong seed.ts).
  @CanDo(MA_QUYEN.DON_VI_XEM)
  @Get()
  layCauHinh() {
    return this.cauHinhDonViService.layCauHinh();
  }

  @CanDo(MA_QUYEN.DON_VI_SUA)
  @Patch()
  suaCauHinh(
    @Body(new ZodValidationPipe(suaCauHinhDonViSchema)) body: SuaCauHinhDonViInput,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
  ) {
    return this.cauHinhDonViService.suaCauHinh(body, nguoiDungHienTai.id);
  }
}
