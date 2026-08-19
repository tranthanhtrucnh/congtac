import { Controller, Get, Query, StreamableFile } from "@nestjs/common";
import {
  danhSachSoCongLenhSchema,
  truyVanSoCongLenhSchema,
  type DanhSachSoCongLenhInput,
  type TruyVanSoCongLenhInput,
} from "@congtac/validation";
import { MA_QUYEN } from "@congtac/shared";
import { CanDo } from "../common/decorators/can-do.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { SoCongLenhService } from "./so-cong-lenh.service";
import { taoExcelSoCongLenh } from "./so-cong-lenh-excel";

/**
 * "So cong lenh" - bao cao tu sinh thay the so ghi tay cua Van thu, xem
 * NHAT_KY_QUYET_DINH.md muc "So cong lenh". CHI XEM (khong co Tao/Sua/Xoa) -
 * quyen dung lai chung-tu.xem nhu ban than chung tu LDCT/GDD.
 */
@Controller("so-cong-lenh")
export class SoCongLenhController {
  constructor(private readonly soCongLenhService: SoCongLenhService) {}

  @CanDo(MA_QUYEN.CHUNG_TU_XEM)
  @Get()
  danhSach(@Query(new ZodValidationPipe(danhSachSoCongLenhSchema)) truyVan: DanhSachSoCongLenhInput) {
    return this.soCongLenhService.danhSach(truyVan);
  }

  // Dat sau route "" o tren, khong xung dot vi khong dung ":id" o controller
  // nay (khac LenhDieuCongTacController/GiayDiDuongController).
  @CanDo(MA_QUYEN.CHUNG_TU_XEM)
  @Get("xuat-excel")
  async xuatExcel(
    @Query(new ZodValidationPipe(truyVanSoCongLenhSchema)) truyVan: TruyVanSoCongLenhInput,
  ): Promise<StreamableFile> {
    const dongs = await this.soCongLenhService.layTatCaDeXuatExcel(truyVan);
    const buffer = taoExcelSoCongLenh(dongs);
    return new StreamableFile(buffer, {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      disposition: `attachment; filename="so-cong-lenh.xlsx"`,
    });
  }
}
