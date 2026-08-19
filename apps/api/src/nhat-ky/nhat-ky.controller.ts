import { Controller, Get, Query, StreamableFile } from "@nestjs/common";
import {
  danhSachNhatKySchema,
  truyVanNhatKySchema,
  type DanhSachNhatKyInput,
  type TruyVanNhatKyInput,
} from "@congtac/validation";
import { MA_QUYEN } from "@congtac/shared";
import { CanDo } from "../common/decorators/can-do.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { NhatKyXemService } from "./nhat-ky.service";
import { taoExcelNhatKy } from "./nhat-ky-excel";

/**
 * Trang /nhat-ky - CHI XEM, khong Tao/Sua/Xoa (xem doc comment tren
 * NhatKyXemService). Quyen rieng `nhat-ky.xem`, chi cap cho vai tro Quan tri
 * he thong (xem seed.ts + docs/QUY_TAC_NGHIEP_VU.md).
 */
@Controller("nhat-ky")
export class NhatKyController {
  constructor(private readonly nhatKyXemService: NhatKyXemService) {}

  @CanDo(MA_QUYEN.NHAT_KY_XEM)
  @Get()
  danhSach(@Query(new ZodValidationPipe(danhSachNhatKySchema)) truyVan: DanhSachNhatKyInput) {
    return this.nhatKyXemService.danhSach(truyVan);
  }

  @CanDo(MA_QUYEN.NHAT_KY_XEM)
  @Get("xuat-excel")
  async xuatExcel(
    @Query(new ZodValidationPipe(truyVanNhatKySchema)) truyVan: TruyVanNhatKyInput,
  ): Promise<StreamableFile> {
    const dongs = await this.nhatKyXemService.layTatCaDeXuatExcel(truyVan);
    const buffer = taoExcelNhatKy(dongs);
    return new StreamableFile(buffer, {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      disposition: `attachment; filename="nhat-ky-he-thong.xlsx"`,
    });
  }
}
