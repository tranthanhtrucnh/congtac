import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, Res, StreamableFile } from "@nestjs/common";
import type { Response } from "express";
import {
  danhSachLenhDieuCongTacSchema,
  taoLenhDieuCongTacSchema,
  suaLenhDieuCongTacSchema,
  huyLenhDieuCongTacSchema,
  type DanhSachLenhDieuCongTacInput,
  type TaoLenhDieuCongTacInput,
  type SuaLenhDieuCongTacInput,
  type HuyLenhDieuCongTacInput,
} from "@congtac/validation";
import { MA_QUYEN } from "@congtac/shared";
import { CanDo } from "../common/decorators/can-do.decorator";
import { NguoiDungHienTai, type NguoiDungYeuCau } from "../common/decorators/nguoi-dung-hien-tai.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { boDauTiengViet } from "../common/utils/bo-dau.util";
import { PdfService } from "../common/pdf/pdf.service";
import { CauHinhDonViService } from "../cau-hinh-don-vi/cau-hinh-don-vi.service";
import { NhatKyService } from "../common/nhat-ky/nhat-ky.service";
import { LenhDieuCongTacService } from "./lenh-dieu-cong-tac.service";
import { taoHtmlLenhDieuCongTacVaLenhDieuXe, taoHtmlGiayDiDuongHangLoat } from "./lenh-dieu-cong-tac-mau-in";
import { chenCongCuXemPhongChu } from "../common/mau-in/mau-in-dung-chung";

// Dung lai dung nhom quyen chung-tu.* nhu LenhDieuXeController - xem
// docs/QUY_TAC_NGHIEP_VU.md muc "Phan quyen".
@Controller("lenh-dieu-cong-tac")
export class LenhDieuCongTacController {
  constructor(
    private readonly lenhDieuCongTacService: LenhDieuCongTacService,
    private readonly pdfService: PdfService,
    private readonly cauHinhDonViService: CauHinhDonViService,
    private readonly nhatKy: NhatKyService,
  ) {}

  @CanDo(MA_QUYEN.CHUNG_TU_XEM)
  @Get()
  danhSach(
    @Query(new ZodValidationPipe(danhSachLenhDieuCongTacSchema)) truyVan: DanhSachLenhDieuCongTacInput,
  ) {
    return this.lenhDieuCongTacService.danhSach(truyVan);
  }

  @CanDo(MA_QUYEN.CHUNG_TU_XEM)
  @Get(":id")
  chiTiet(@Param("id") id: string) {
    return this.lenhDieuCongTacService.chiTiet(id);
  }

  // In RIENG LDCT (khong kem trang LDX du doan co tai xe hay khong) - nut in
  // o trang danh sach /lenh-dieu-cong-tac (2026-08-10, xem NHAT_KY_QUYET_DINH.md).
  // Khac endpoint :id/pdf-lenh ben duoi (in KEM LDX) - dung lai
  // layDuLieuInLenh() nhung bo qua ldxHoatDong, luon truyen null cho tham so
  // LDX cua taoHtmlLenhDieuCongTacVaLenhDieuXe().
  @CanDo(MA_QUYEN.CHUNG_TU_IN)
  @Get(":id/pdf")
  async xemVaInRieng(
    @Param("id") id: string,
    @Query("xemHtml") xemHtml: string | undefined,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile | string> {
    const [{ lenh, thanhVienDangCo, khoGiay }, cauHinhDonVi] = await Promise.all([
      this.lenhDieuCongTacService.layDuLieuInLenh(id),
      this.cauHinhDonViService.layCauHinh(),
    ]);
    const html = taoHtmlLenhDieuCongTacVaLenhDieuXe(lenh, thanhVienDangCo, null, cauHinhDonVi, khoGiay);
    if (xemHtml) {
      res.header("Content-Type", "text/html; charset=utf-8");
      return chenCongCuXemPhongChu(html);
    }
    const pdf = await this.pdfService.xuatPdfTuHtml(html, khoGiay);
    // Ghi nhat ky hanh dong In (bo sung 2026-08-14, xem NHAT_KY_QUYET_DINH.md
    // muc "Nhat ky he thong").
    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiDungHienTai.id,
      hanhDong: "XEM_IN_LENH_DIEU_CONG_TAC",
      doiTuong: "LenhDieuCongTac",
      doiTuongId: lenh.id,
    });
    const tenFile = `${boDauTiengViet(lenh.soHieu).replace(/\//g, "-")}.pdf`;
    return new StreamableFile(pdf, { type: "application/pdf", disposition: `inline; filename="${tenFile}"` });
  }

  // File PDF 1: LDCT + LDX lien ket (1 mat) - nut "In lenh dieu cong tac +
  // lenh dieu xe" o trang chi tiet. Tach rieng voi file GDD (2 mat) vi cung
  // 1 lan in khong the vua 1 mat vua 2 mat (xem NHAT_KY_QUYET_DINH.md).
  @CanDo(MA_QUYEN.CHUNG_TU_IN)
  @Get(":id/pdf-lenh")
  async xemVaInLenh(
    @Param("id") id: string,
    @Query("xemHtml") xemHtml: string | undefined,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile | string> {
    const [{ lenh, thanhVienDangCo, ldxHoatDong, khoGiay }, cauHinhDonVi] = await Promise.all([
      this.lenhDieuCongTacService.layDuLieuInLenh(id),
      this.cauHinhDonViService.layCauHinh(),
    ]);
    const html = taoHtmlLenhDieuCongTacVaLenhDieuXe(lenh, thanhVienDangCo, ldxHoatDong, cauHinhDonVi, khoGiay);
    if (xemHtml) {
      res.header("Content-Type", "text/html; charset=utf-8");
      return chenCongCuXemPhongChu(html);
    }
    const pdf = await this.pdfService.xuatPdfTuHtml(html, khoGiay);
    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiDungHienTai.id,
      hanhDong: "XEM_IN_LENH_DIEU_CONG_TAC_VA_LENH_DIEU_XE",
      doiTuong: "LenhDieuCongTac",
      doiTuongId: lenh.id,
    });
    const tenFile = `${boDauTiengViet(lenh.soHieu).replace(/\//g, "-")}.pdf`;
    return new StreamableFile(pdf, { type: "application/pdf", disposition: `inline; filename="${tenFile}"` });
  }

  // File PDF 2: toan bo Cong lenh/Giay di duong con hoat dong (2 mat/nguoi) -
  // nut "In toan bo cong lenh/giay di duong" o trang chi tiet.
  @CanDo(MA_QUYEN.CHUNG_TU_IN)
  @Get(":id/pdf-giay-di-duong")
  async xemVaInGiayDiDuong(
    @Param("id") id: string,
    @Query("xemHtml") xemHtml: string | undefined,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile | string> {
    const [{ lenh, dsGdd }, cauHinhDonVi] = await Promise.all([
      this.lenhDieuCongTacService.layDuLieuInGiayDiDuong(id),
      this.cauHinhDonViService.layCauHinh(),
    ]);
    if (dsGdd.length === 0) {
      throw new BadRequestException("Không có Công lệnh/Giấy đi đường nào đang hoạt động để in");
    }
    const html = taoHtmlGiayDiDuongHangLoat(dsGdd, cauHinhDonVi);
    if (xemHtml) {
      res.header("Content-Type", "text/html; charset=utf-8");
      return chenCongCuXemPhongChu(html);
    }
    const pdf = await this.pdfService.xuatPdfTuHtml(html, "A5");
    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiDungHienTai.id,
      hanhDong: "XEM_IN_TOAN_BO_GIAY_DI_DUONG",
      doiTuong: "LenhDieuCongTac",
      doiTuongId: lenh.id,
    });
    const tenFile = `${boDauTiengViet(lenh.soHieu).replace(/\//g, "-")}-giay-di-duong.pdf`;
    return new StreamableFile(pdf, { type: "application/pdf", disposition: `inline; filename="${tenFile}"` });
  }

  // Nut "Luu" duy nhat o form Lap - tao dong thoi LDCT + GDD (1/thanh vien) +
  // LDX neu co tai xe (xem NHAT_KY_QUYET_DINH.md muc "LDCT sinh kem GDD va LDX").
  @CanDo(MA_QUYEN.CHUNG_TU_TAO)
  @Post()
  tao(
    @Body(new ZodValidationPipe(taoLenhDieuCongTacSchema)) body: TaoLenhDieuCongTacInput,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
  ) {
    return this.lenhDieuCongTacService.tao(body, nguoiDungHienTai.id);
  }

  @CanDo(MA_QUYEN.CHUNG_TU_SUA)
  @Patch(":id")
  sua(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(suaLenhDieuCongTacSchema)) body: SuaLenhDieuCongTacInput,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
  ) {
    return this.lenhDieuCongTacService.sua(id, body, nguoiDungHienTai.id);
  }

  // Huy ca LDCT -> cascade huy toan bo GDD con + LDX lien ket chua huy.
  @CanDo(MA_QUYEN.CHUNG_TU_HUY)
  @Post(":id/huy")
  huy(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(huyLenhDieuCongTacSchema)) body: HuyLenhDieuCongTacInput,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
  ) {
    return this.lenhDieuCongTacService.huy(id, body, nguoiDungHienTai.id);
  }
}
