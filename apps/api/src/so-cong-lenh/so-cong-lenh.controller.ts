import { BadRequestException, Controller, Get, Query, Res, StreamableFile } from "@nestjs/common";
import type { Response } from "express";
import {
  danhSachSoCongLenhSchema,
  truyVanSoCongLenhSchema,
  inSoCongLenhSchema,
  type DanhSachSoCongLenhInput,
  type TruyVanSoCongLenhInput,
  type InSoCongLenhInput,
} from "@congtac/validation";
import { MA_QUYEN } from "@congtac/shared";
import { CanDo } from "../common/decorators/can-do.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { PdfService } from "../common/pdf/pdf.service";
import { CauHinhDonViService } from "../cau-hinh-don-vi/cau-hinh-don-vi.service";
import { NhatKyService } from "../common/nhat-ky/nhat-ky.service";
import { NguoiDungHienTai, type NguoiDungYeuCau } from "../common/decorators/nguoi-dung-hien-tai.decorator";
import { chenCongCuXemPhongChu } from "../common/mau-in/mau-in-dung-chung";
import { SoCongLenhService } from "./so-cong-lenh.service";
import { taoExcelSoCongLenh } from "./so-cong-lenh-excel";
import { taoHtmlSoTheoDoiCongLenh } from "./so-cong-lenh-mau-in";

/**
 * "So cong lenh" - bao cao tu sinh thay the so ghi tay cua Van thu, xem
 * NHAT_KY_QUYET_DINH.md muc "So cong lenh". CHI XEM (khong co Tao/Sua/Xoa) -
 * quyen dung lai chung-tu.xem nhu ban than chung tu LDCT/GDD. Rieng endpoint
 * "in" (mau "So theo doi cong lenh") dung quyen chung-tu.in nhu cac endpoint
 * xem/in PDF khac trong ung dung.
 */
@Controller("so-cong-lenh")
export class SoCongLenhController {
  constructor(
    private readonly soCongLenhService: SoCongLenhService,
    private readonly pdfService: PdfService,
    private readonly cauHinhDonViService: CauHinhDonViService,
    private readonly nhatKy: NhatKyService,
  ) {}

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

  /** Mau in "So theo doi cong lenh" (A4 ngang) - dung LUON bo loc dang ap
   * dung tren man hinh (tuNgay/denNgay/tuKhoa, giong xuat-excel), khong co bo
   * loc rieng cho ban in - nguoi dung chon huong nay 2026-08-26, xem
   * NHAT_KY_QUYET_DINH.md. Nguoi ky duyet LUON la Nguoi ky dang "chinh thuc"
   * tai thoi diem in (khong chon rieng duoc, giong quy uoc chung ca ung
   * dung) - bao loi ro neu chua thiet lap. */
  @CanDo(MA_QUYEN.CHUNG_TU_IN)
  @Get("in")
  async inSoTheoDoi(
    @Query(new ZodValidationPipe(inSoCongLenhSchema)) truyVan: InSoCongLenhInput,
    // ?xemHtml=1 - che do dev "xem HTML kiem tra co chu", xem
    // chenCongCuXemPhongChu() (mau-in-dung-chung.ts).
    @Query("xemHtml") xemHtml: string | undefined,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile | string> {
    const { nguoiLapSo, cot, ...boLoc } = truyVan;

    const [dongs, cauHinhDonVi, nguoiKyChinhThuc] = await Promise.all([
      this.soCongLenhService.layTatCaDeXuatExcel(boLoc),
      this.cauHinhDonViService.layCauHinh(),
      this.soCongLenhService.layNguoiKyChinhThuc(),
    ]);

    if (!nguoiKyChinhThuc) {
      throw new BadRequestException(
        "Chưa có người ký chính thức - vào Danh mục Người ký để thiết lập trước khi in sổ theo dõi.",
      );
    }

    const html = taoHtmlSoTheoDoiCongLenh(dongs, cot, {
      cauHinhDonVi,
      nguoiLapSo,
      nguoiKy: {
        hoTen: nguoiKyChinhThuc.nhanVien.hoTen,
        chucDanhKy: nguoiKyChinhThuc.chucDanhKy,
        theThucKy: nguoiKyChinhThuc.theThucKy,
      },
      ngayIn: new Date(),
      tuNgay: boLoc.tuNgay ?? null,
      denNgay: boLoc.denNgay ?? null,
      tuKhoa: boLoc.tuKhoa?.trim() || null,
    });

    if (xemHtml) {
      res.header("Content-Type", "text/html; charset=utf-8");
      return chenCongCuXemPhongChu(html);
    }

    const pdf = await this.pdfService.xuatPdfTuHtml(html, "A4", { landscape: true });

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiDungHienTai.id,
      hanhDong: "XEM_IN_SO_THEO_DOI_CONG_LENH",
      doiTuong: "SoCongLenh",
      giaTriTruoc: { soDong: dongs.length, nguoiLapSo, cot },
    });

    return new StreamableFile(pdf, {
      type: "application/pdf",
      disposition: `inline; filename="so-theo-doi-cong-lenh.pdf"`,
    });
  }
}
