import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
} from "@nestjs/common";
import type { Response } from "express";
import {
  danhSachLenhDieuCongTacSchema,
  taoLenhDieuCongTacSchema,
  suaLenhDieuCongTacSchema,
  huyLenhDieuCongTacSchema,
  xoaCungLenhDieuCongTacSchema,
  nhapLenhDieuCongTacSchema,
  inNhieuLenhDieuCongTacSchema,
  type DanhSachLenhDieuCongTacInput,
  type TaoLenhDieuCongTacInput,
  type SuaLenhDieuCongTacInput,
  type HuyLenhDieuCongTacInput,
  type XoaCungLenhDieuCongTacInput,
  type NhapLenhDieuCongTacInput,
  type InNhieuLenhDieuCongTacInput,
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
import {
  taoHtmlLenhDieuCongTacVaLenhDieuXe,
  taoHtmlLenhDieuCongTacHangLoat,
  taoHtmlGiayDiDuongHangLoat,
  chonKhoGiayLenhDieuCongTac,
  type LenhDieuCongTacDeIn,
  type ThanhVienDeIn,
} from "./lenh-dieu-cong-tac-mau-in";
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

  // "Mau in nhap" - Van thu xem/in thu layout TRUOC KHI lap chinh thuc, so
  // hieu go tay tu do, KHONG luu CSDL, KHONG cap so (nguoi dung yeu cau
  // 2026-08-26, xem NHAT_KY_QUYET_DINH.md muc "Mau in nhap"). Dat TRUOC ":id"
  // ben duoi - cung ly do da ghi chu o cac route tinh khac (trung-lich,
  // in-nhieu...).
  // Quyen rieng CHUNG_TU_IN_NHAP (tach khoi CHUNG_TU_IN tu 2026-08-27) - xem
  // NHAT_KY_QUYET_DINH.md.
  @CanDo(MA_QUYEN.CHUNG_TU_IN_NHAP)
  @Get("nhap-pdf")
  async xemNhap(
    @Query(new ZodValidationPipe(nhapLenhDieuCongTacSchema)) duLieu: NhapLenhDieuCongTacInput,
    @Query("xemHtml") xemHtml: string | undefined,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile | string> {
    const [nguoiKy, cauHinhDonVi] = await Promise.all([
      this.lenhDieuCongTacService.layNguoiKyChinhThuc(),
      this.cauHinhDonViService.layCauHinh(),
    ]);
    const thanhVien: ThanhVienDeIn[] = duLieu.thanhVien.map((tv) => ({
      hoTen: tv.hoTen,
      chucVu: tv.chucVu,
      cccd: tv.cccd ?? "",
      ngaySinh: tv.ngaySinh ?? null,
      laTruongDoan: tv.laTruongDoan ?? false,
      ngayDiRieng: tv.ngayDiRieng ?? null,
      ngayVeRieng: tv.ngayVeRieng ?? null,
      laTaiXe: tv.laTaiXe ?? false,
    }));
    const lenh: LenhDieuCongTacDeIn = {
      soHieu: duLieu.soHieu,
      ngayKy: duLieu.ngayKy,
      ngayDi: duLieu.ngayDi,
      ngayVe: duLieu.ngayVe,
      diaDiemCongTac: duLieu.diaDiemCongTac,
      mucDich: duLieu.mucDich,
      canCu: duLieu.canCu ?? null,
      nguoiKyHoTen: nguoiKy.hoTen,
      nguoiKyChucDanh: nguoiKy.chucDanh,
      nguoiKyTheThuc: nguoiKy.theThuc,
      loaiMauIn: duLieu.loaiMauIn,
    };
    const khoGiay = chonKhoGiayLenhDieuCongTac(thanhVien.length, lenh.mucDich, lenh.diaDiemCongTac, lenh.loaiMauIn);
    const html = taoHtmlLenhDieuCongTacVaLenhDieuXe(lenh, thanhVien, null, cauHinhDonVi, khoGiay);
    if (xemHtml) {
      res.header("Content-Type", "text/html; charset=utf-8");
      return chenCongCuXemPhongChu(html);
    }
    const pdf = await this.pdfService.xuatPdfTuHtml(html, khoGiay);
    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiDungHienTai.id,
      hanhDong: "XEM_IN_NHAP_LENH_DIEU_CONG_TAC",
      doiTuong: "LenhDieuCongTacNhap",
      giaTriSau: { soHieu: duLieu.soHieu },
    });
    return new StreamableFile(pdf, {
      type: "application/pdf",
      disposition: `inline; filename="nhap-lenh-dieu-cong-tac.pdf"`,
    });
  }

  // In NHIEU lenh da chon cung luc (nut "In da chon" o trang
  // /lenh-dieu-cong-tac, checkbox chon dong da co san tu truoc nhung chua
  // gan hanh dong nao - 2026-08-28, nguoi dung yeu cau, xem
  // NHAT_KY_QUYET_DINH.md muc "In nhieu lenh dieu cong tac cung luc"). Dat
  // TRUOC ":id" ben duoi - cung ly do da ghi chu o "nhap-pdf" phia tren (route
  // tinh phai khai bao truoc route dong ":id", khong thi NestJS/Express hieu
  // nham "in-nhieu" la 1 gia tri id). LUON in kho A5 cho ca file (xem doc
  // comment day du o taoHtmlLenhDieuCongTacHangLoat).
  @CanDo(MA_QUYEN.CHUNG_TU_IN)
  @Get("in-nhieu")
  async inNhieu(
    @Query(new ZodValidationPipe(inNhieuLenhDieuCongTacSchema)) truyVan: InNhieuLenhDieuCongTacInput,
    @Query("xemHtml") xemHtml: string | undefined,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile | string> {
    const [dsLenh, cauHinhDonVi] = await Promise.all([
      this.lenhDieuCongTacService.layNhieuDeIn(truyVan.ids),
      this.cauHinhDonViService.layCauHinh(),
    ]);
    // CHI truyen lenh + thanh vien (khong kem ldxHoatDong) - in hang loat KHONG
    // kem trang LDX nua, xem doc comment day du o taoHtmlLenhDieuCongTacHangLoat.
    const html = taoHtmlLenhDieuCongTacHangLoat(
      dsLenh.map(({ lenh, thanhVienDangCo }) => ({
        lenh,
        thanhVien: thanhVienDangCo,
      })),
      cauHinhDonVi,
    );
    if (xemHtml) {
      res.header("Content-Type", "text/html; charset=utf-8");
      return chenCongCuXemPhongChu(html);
    }
    const pdf = await this.pdfService.xuatPdfTuHtml(html, "A5");
    await Promise.all(
      dsLenh.map(({ lenh }) =>
        this.nhatKy.ghiNhan({
          nguoiDungId: nguoiDungHienTai.id,
          hanhDong: "XEM_IN_NHIEU_LENH_DIEU_CONG_TAC",
          doiTuong: "LenhDieuCongTac",
          doiTuongId: lenh.id,
        }),
      ),
    );
    return new StreamableFile(pdf, {
      type: "application/pdf",
      disposition: `inline; filename="lenh-dieu-cong-tac-da-chon.pdf"`,
    });
  }

  // Goi y "Noi den" tu lich su LDCT da lap (bo sung cho goi y tu Danh muc Dia
  // diem o frontend) - nguoi dung yeu cau 2026-09-04, xem NHAT_KY_QUYET_DINH.md
  // va doc comment day du o LenhDieuCongTacService.goiYDiaDiemLichSu(). Dat
  // TRUOC ":id" ben duoi - cung ly do da ghi chu o "nhap-pdf"/"in-nhieu" phia
  // tren (route tinh phai khai bao truoc route dong ":id").
  @CanDo(MA_QUYEN.CHUNG_TU_XEM)
  @Get("goi-y-dia-diem")
  goiYDiaDiem() {
    return this.lenhDieuCongTacService.goiYDiaDiemLichSu();
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
    @Query("chieuCaoHang") chieuCaoHang: string | undefined,
    @Query("coChu") coChu: string | undefined,
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
    const chieuCaoHangMm = chieuCaoHang ? parseInt(chieuCaoHang, 10) : undefined;
    const coChuPt = coChu ? parseFloat(coChu) : undefined;
    const html = taoHtmlGiayDiDuongHangLoat(
      dsGdd,
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

  // Xoa CUNG (mat han khoi CSDL) - khac Huy. Chi Van thu + Quan tri he thong
  // (quyen rieng chung-tu.xoa). Server tu kiem tra lai dieu kien "dang la so
  // moi nhat ca 3 day" - xem LenhDieuCongTacService.xoaCung().
  @CanDo(MA_QUYEN.CHUNG_TU_XOA)
  @Delete(":id")
  xoaCung(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(xoaCungLenhDieuCongTacSchema)) body: XoaCungLenhDieuCongTacInput,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
  ) {
    return this.lenhDieuCongTacService.xoaCung(id, body, nguoiDungHienTai.id);
  }
}
