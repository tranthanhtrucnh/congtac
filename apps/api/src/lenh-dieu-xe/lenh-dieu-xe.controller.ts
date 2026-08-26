import { Body, Controller, Get, Param, Patch, Post, Query, Res, StreamableFile } from "@nestjs/common";
import type { Response } from "express";
import {
  danhSachLenhDieuXeSchema,
  taoLenhDieuXeSchema,
  suaLenhDieuXeSchema,
  huyLenhDieuXeSchema,
  kiemTraTrungLichLenhDieuXeSchema,
  type DanhSachLenhDieuXeInput,
  type TaoLenhDieuXeInput,
  type SuaLenhDieuXeInput,
  type HuyLenhDieuXeInput,
  type KiemTraTrungLichLenhDieuXeInput,
} from "@congtac/validation";
import { MA_QUYEN } from "@congtac/shared";
import { CanDo } from "../common/decorators/can-do.decorator";
import { NguoiDungHienTai, type NguoiDungYeuCau } from "../common/decorators/nguoi-dung-hien-tai.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { boDauTiengViet } from "../common/utils/bo-dau.util";
import { PdfService } from "../common/pdf/pdf.service";
import { CauHinhDonViService } from "../cau-hinh-don-vi/cau-hinh-don-vi.service";
import { NhatKyService } from "../common/nhat-ky/nhat-ky.service";
import { LenhDieuXeService } from "./lenh-dieu-xe.service";
import { taoHtmlLenhDieuXe } from "./lenh-dieu-xe-mau-in";
import { chenCongCuXemPhongChu } from "../common/mau-in/mau-in-dung-chung";

@Controller("lenh-dieu-xe")
export class LenhDieuXeController {
  constructor(
    private readonly lenhDieuXeService: LenhDieuXeService,
    private readonly pdfService: PdfService,
    private readonly cauHinhDonViService: CauHinhDonViService,
    private readonly nhatKy: NhatKyService,
  ) {}

  @CanDo(MA_QUYEN.CHUNG_TU_XEM)
  @Get()
  danhSach(@Query(new ZodValidationPipe(danhSachLenhDieuXeSchema)) truyVan: DanhSachLenhDieuXeInput) {
    return this.lenhDieuXeService.danhSach(truyVan);
  }

  // "trung-lich" dat TRUOC ":id" - route tinh (khong tham so) phai khai bao
  // truoc route dong ":id", neu khong NestJS/Express se hieu nham "trung-lich"
  // la 1 gia tri id (cung 1 loi da tung ghi chu o GiayDiDuongController voi
  // "in-nhieu"). Xem NHAT_KY_QUYET_DINH.md.
  @CanDo(MA_QUYEN.CHUNG_TU_XEM)
  @Get("trung-lich")
  kiemTraTrungLich(
    @Query(new ZodValidationPipe(kiemTraTrungLichLenhDieuXeSchema)) truyVan: KiemTraTrungLichLenhDieuXeInput,
  ) {
    return this.lenhDieuXeService.kiemTraTrungLich(
      truyVan.laiXeId,
      truyVan.phuongTienId,
      truyVan.ngayDi,
      truyVan.ngayVe,
      truyVan.loaiTruId,
    );
  }

  @CanDo(MA_QUYEN.CHUNG_TU_XEM)
  @Get(":id")
  chiTiet(@Param("id") id: string) {
    return this.lenhDieuXeService.chiTiet(id);
  }

  // Xem truoc + in - dung 1 hanh dong duy nhat (mo file PDF that trong tab
  // moi), khong tach rieng "xem"/"in" - xem NHAT_KY_QUYET_DINH.md 2026-08-07.
  @CanDo(MA_QUYEN.CHUNG_TU_IN)
  @Get(":id/pdf")
  async xemVaIn(
    @Param("id") id: string,
    // ?xemHtml=1 - che do dev "xem HTML kiem tra co chu" (khong phai ban in
    // that), xem chenCongCuXemPhongChu(). Mac dinh (khong co) van tra PDF.
    @Query("xemHtml") xemHtml: string | undefined,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile | string> {
    const [lenh, cauHinhDonVi] = await Promise.all([
      this.lenhDieuXeService.chiTiet(id),
      this.cauHinhDonViService.layCauHinh(),
    ]);
    const html = taoHtmlLenhDieuXe(lenh, cauHinhDonVi);
    if (xemHtml) {
      res.header("Content-Type", "text/html; charset=utf-8");
      return chenCongCuXemPhongChu(html);
    }
    const pdf = await this.pdfService.xuatPdfTuHtml(html, "A5");
    // Ghi nhat ky hanh dong In (bo sung 2026-08-14, xem NHAT_KY_QUYET_DINH.md
    // muc "Nhat ky he thong" - truoc do 6 endpoint xem/in PDF trong toan bo
    // app KHONG ghi nhat ky, sai voi quy tac da de ra o QUY_TAC_NGHIEP_VU.md).
    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiDungHienTai.id,
      hanhDong: "XEM_IN_LENH_DIEU_XE",
      doiTuong: "LenhDieuXe",
      doiTuongId: lenh.id,
    });
    // Header HTTP (Content-Disposition) khong cho ky tu co dau - "01/LDX" co
    // chu "D" phai bo dau truoc, khong thi Node nem ERR_INVALID_CHAR.
    const tenFile = `${boDauTiengViet(lenh.soHieu).replace(/\//g, "-")}.pdf`;
    return new StreamableFile(pdf, {
      type: "application/pdf",
      disposition: `inline; filename="${tenFile}"`,
    });
  }

  @CanDo(MA_QUYEN.CHUNG_TU_TAO)
  @Post()
  tao(
    @Body(new ZodValidationPipe(taoLenhDieuXeSchema)) body: TaoLenhDieuXeInput,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
  ) {
    return this.lenhDieuXeService.tao(body, nguoiDungHienTai.id);
  }

  @CanDo(MA_QUYEN.CHUNG_TU_SUA)
  @Patch(":id")
  sua(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(suaLenhDieuXeSchema)) body: SuaLenhDieuXeInput,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
  ) {
    return this.lenhDieuXeService.sua(id, body, nguoiDungHienTai.id);
  }

  @CanDo(MA_QUYEN.CHUNG_TU_HUY)
  @Post(":id/huy")
  huy(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(huyLenhDieuXeSchema)) body: HuyLenhDieuXeInput,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
  ) {
    return this.lenhDieuXeService.huy(id, body, nguoiDungHienTai.id);
  }
}
