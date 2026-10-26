import { Body, Controller, Get, Param, Patch, Query, Res, StreamableFile } from "@nestjs/common";
import type { Response } from "express";
import {
  danhSachGiayDiDuongSchema,
  type DanhSachGiayDiDuongInput,
  inNhieuGiayDiDuongSchema,
  type InNhieuGiayDiDuongInput,
  nhapGiayDiDuongSchema,
  type NhapGiayDiDuongInput,
  suaLoTrinhGiayDiDuongSchema,
  type SuaLoTrinhGiayDiDuongInput,
} from "@congtac/validation";
import { MA_QUYEN } from "@congtac/shared";
import { CanDo } from "../common/decorators/can-do.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { boDauTiengViet } from "../common/utils/bo-dau.util";
import { PdfService } from "../common/pdf/pdf.service";
import { CauHinhDonViService } from "../cau-hinh-don-vi/cau-hinh-don-vi.service";
import { NhatKyService } from "../common/nhat-ky/nhat-ky.service";
import { NguoiDungHienTai, type NguoiDungYeuCau } from "../common/decorators/nguoi-dung-hien-tai.decorator";
import { LenhDieuCongTacService } from "./lenh-dieu-cong-tac.service";
import { taoHtmlGiayDiDuongHangLoat, type GiayDiDuongDeIn } from "./lenh-dieu-cong-tac-mau-in";
import { chenCongCuXemPhongChu } from "../common/mau-in/mau-in-dung-chung";

/**
 * Trang /giay-di-duong: danh sach GDD DOC LAP (khong qua 1 LDCT cu the) -
 * phuc hoi 2026-08-10 theo yeu cau nguoi dung (truoc do GDD chi xem duoc qua
 * trang chi tiet LDCT, nguoi dung phan hoi van muon 1 muc menu/danh sach
 * rieng - xem NHAT_KY_QUYET_DINH.md). Dat controller RIENG (khong nhet vao
 * LenhDieuCongTacController) de tranh xung dot thu tu route voi @Get(":id")
 * cua controller do.
 */
@Controller("giay-di-duong")
export class GiayDiDuongController {
  constructor(
    private readonly lenhDieuCongTacService: LenhDieuCongTacService,
    private readonly pdfService: PdfService,
    private readonly cauHinhDonViService: CauHinhDonViService,
    private readonly nhatKy: NhatKyService,
  ) {}

  @CanDo(MA_QUYEN.CHUNG_TU_XEM)
  @Get()
  danhSach(@Query(new ZodValidationPipe(danhSachGiayDiDuongSchema)) truyVan: DanhSachGiayDiDuongInput) {
    return this.lenhDieuCongTacService.danhSachGiayDiDuong(truyVan);
  }

  // In NHIEU nguoi da chon cung luc (nut "In da chon" o trang /giay-di-duong,
  // checkbox chon dong - 2026-08-10, xem NHAT_KY_QUYET_DINH.md) - dat TRUOC
  // ":id/pdf" ben duoi de khong bi route dong ":id" nuot mat (du hien tai
  // khong trung nhau, giu thu tu nay cho an toan khi sau nay them route).
  // Dung GET + query "ids" (khong phai POST body) vi mo tab moi bang
  // window.open() la dieu huong GET don gian, khong gui duoc body.
  @CanDo(MA_QUYEN.CHUNG_TU_IN)
  @Get("in-nhieu")
  async inNhieu(
    @Query(new ZodValidationPipe(inNhieuGiayDiDuongSchema)) truyVan: InNhieuGiayDiDuongInput,
    // ?xemHtml=1 - che do dev "xem HTML kiem tra co chu", xem giai thich o
    // chenCongCuXemPhongChu() (mau-in-dung-chung.ts).
    @Query("xemHtml") xemHtml: string | undefined,
    @Query("chieuCaoHang") chieuCaoHang: string | undefined,
    @Query("coChu") coChu: string | undefined,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile | string> {
    const [dsDuLieuIn, cauHinhDonVi] = await Promise.all([
      this.lenhDieuCongTacService.layNhieuGiayDiDuongDeIn(truyVan.ids),
      this.cauHinhDonViService.layCauHinh(),
    ]);
    const chieuCaoHangMm = chieuCaoHang ? parseInt(chieuCaoHang, 10) : undefined;
    const coChuPt = coChu ? parseFloat(coChu) : undefined;
    const html = taoHtmlGiayDiDuongHangLoat(
      dsDuLieuIn,
      cauHinhDonVi,
      isNaN(chieuCaoHangMm!) ? undefined : chieuCaoHangMm,
      isNaN(coChuPt!) ? undefined : coChuPt,
    );
    if (xemHtml) {
      res.header("Content-Type", "text/html; charset=utf-8");
      return chenCongCuXemPhongChu(html);
    }
    const pdf = await this.pdfService.xuatPdfTuHtml(html, "A5");
    // Ghi 1 dong nhat ky / GDD (bo sung 2026-08-14, xem NHAT_KY_QUYET_DINH.md
    // muc "Nhat ky he thong") - dung dung truyVan.ids (id nguoi dung yeu cau
    // in), khong phai dsDuLieuIn (chi con soHieu, da bo id o buoc doc du lieu
    // in - xem doc comment tren layNhieuGiayDiDuongDeIn()).
    await Promise.all(
      truyVan.ids.map((id) =>
        this.nhatKy.ghiNhan({
          nguoiDungId: nguoiDungHienTai.id,
          hanhDong: "XEM_IN_NHIEU_GIAY_DI_DUONG",
          doiTuong: "GiayDiDuong",
          doiTuongId: id,
        }),
      ),
    );
    return new StreamableFile(pdf, {
      type: "application/pdf",
      disposition: `inline; filename="cong-lenh-da-chon.pdf"`,
    });
  }

  // "Mau in nhap" - xem/in thu layout Cong lenh/Giay di duong TRUOC KHI lap
  // chinh thuc, so hieu go tay tu do, KHONG luu CSDL (2026-08-26, xem
  // NHAT_KY_QUYET_DINH.md muc "Mau in nhap"). Dat TRUOC ":id/pdf" - route tinh
  // phai khai bao truoc route dong, cung ly do da ghi chu o "in-nhieu" tren.
  // Quyen rieng CHUNG_TU_IN_NHAP (tach khoi CHUNG_TU_IN tu 2026-08-27) - xem
  // NHAT_KY_QUYET_DINH.md.
  @CanDo(MA_QUYEN.CHUNG_TU_IN_NHAP)
  @Get("nhap-pdf")
  async xemNhap(
    @Query(new ZodValidationPipe(nhapGiayDiDuongSchema)) duLieu: NhapGiayDiDuongInput,
    @Query("xemHtml") xemHtml: string | undefined,
    @Query("chieuCaoHang") chieuCaoHang: string | undefined,
    @Query("coChu") coChu: string | undefined,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile | string> {
    const [nguoiKy, cauHinhDonVi] = await Promise.all([
      this.lenhDieuCongTacService.layNguoiKyChinhThuc(),
      this.cauHinhDonViService.layCauHinh(),
    ]);
    const duLieuIn: GiayDiDuongDeIn = {
      soHieu: duLieu.soHieu,
      ngayKy: duLieu.ngayKy,
      hoTen: duLieu.hoTen,
      chucVu: duLieu.chucVu,
      noiDi: duLieu.noiDi,
      noiDen: duLieu.noiDen,
      ngayDi: duLieu.ngayDi,
      ngayVe: duLieu.ngayVe,
      nguoiKyHoTen: nguoiKy.hoTen,
      nguoiKyChucDanh: nguoiKy.chucDanh,
      nguoiKyTheThuc: nguoiKy.theThuc,
    };
    const chieuCaoHangMm = chieuCaoHang ? parseInt(chieuCaoHang, 10) : undefined;
    const coChuPt = coChu ? parseFloat(coChu) : undefined;
    const html = taoHtmlGiayDiDuongHangLoat(
      [duLieuIn],
      cauHinhDonVi,
      isNaN(chieuCaoHangMm!) ? undefined : chieuCaoHangMm,
      isNaN(coChuPt!) ? undefined : coChuPt,
    );
    if (xemHtml) {
      res.header("Content-Type", "text/html; charset=utf-8");
      return chenCongCuXemPhongChu(html);
    }
    const pdf = await this.pdfService.xuatPdfTuHtml(html, "A5");
    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiDungHienTai.id,
      hanhDong: "XEM_IN_NHAP_GIAY_DI_DUONG",
      doiTuong: "GiayDiDuongNhap",
      giaTriSau: { soHieu: duLieu.soHieu },
    });
    return new StreamableFile(pdf, {
      type: "application/pdf",
      disposition: `inline; filename="nhap-cong-lenh.pdf"`,
    });
  }

  @CanDo(MA_QUYEN.CHUNG_TU_XEM)
  @Get(":id")
  chiTiet(@Param("id") id: string) {
    return this.lenhDieuCongTacService.chiTietGiayDiDuongTheoId(id);
  }

  @CanDo(MA_QUYEN.CHUNG_TU_SUA)
  @Patch(":id/lo-trinh")
  suaLoTrinh(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(suaLoTrinhGiayDiDuongSchema)) duLieu: SuaLoTrinhGiayDiDuongInput,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
  ) {
    return this.lenhDieuCongTacService.suaLoTrinhGiayDiDuong(id, duLieu, nguoiDungHienTai.id);
  }

  // In rieng 1 nguoi (2 mat) - khac endpoint /lenh-dieu-cong-tac/:id/pdf-giay-di-duong
  // (in ca doan).
  @CanDo(MA_QUYEN.CHUNG_TU_IN)
  @Get(":id/pdf")
  async xemVaIn(
    @Param("id") id: string,
    @Query("xemHtml") xemHtml: string | undefined,
    @Query("chieuCaoHang") chieuCaoHang: string | undefined,
    @Query("coChu") coChu: string | undefined,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile | string> {
    const [{ duLieuIn }, cauHinhDonVi] = await Promise.all([
      this.lenhDieuCongTacService.layMotGiayDiDuongDeIn(id),
      this.cauHinhDonViService.layCauHinh(),
    ]);
    const chieuCaoHangMm = chieuCaoHang ? parseInt(chieuCaoHang, 10) : undefined;
    const coChuPt = coChu ? parseFloat(coChu) : undefined;
    const html = taoHtmlGiayDiDuongHangLoat(
      [duLieuIn],
      cauHinhDonVi,
      isNaN(chieuCaoHangMm!) ? undefined : chieuCaoHangMm,
      isNaN(coChuPt!) ? undefined : coChuPt,
    );
    if (xemHtml) {
      res.header("Content-Type", "text/html; charset=utf-8");
      return chenCongCuXemPhongChu(html);
    }
    const pdf = await this.pdfService.xuatPdfTuHtml(html, "A5");
    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiDungHienTai.id,
      hanhDong: "XEM_IN_GIAY_DI_DUONG",
      doiTuong: "GiayDiDuong",
      doiTuongId: id,
    });
    const tenFile = `${boDauTiengViet(duLieuIn.soHieu).replace(/\//g, "-")}.pdf`;
    return new StreamableFile(pdf, { type: "application/pdf", disposition: `inline; filename="${tenFile}"` });
  }
}
