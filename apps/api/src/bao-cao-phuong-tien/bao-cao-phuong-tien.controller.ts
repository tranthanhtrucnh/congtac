import { BadRequestException, Controller, Get, Query, Res, StreamableFile } from "@nestjs/common";
import type { Response } from "express";
import {
  trangThaiPhuongTienSchema,
  tanSuatPhuongTienSchema,
  inBaoCaoPhuongTienSchema,
  type TrangThaiPhuongTienInput,
  type TanSuatPhuongTienInput,
  type InBaoCaoPhuongTienInput,
} from "@congtac/validation";
import { MA_QUYEN } from "@congtac/shared";
import { CanDo } from "../common/decorators/can-do.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { PdfService } from "../common/pdf/pdf.service";
import { CauHinhDonViService } from "../cau-hinh-don-vi/cau-hinh-don-vi.service";
import { NhatKyService } from "../common/nhat-ky/nhat-ky.service";
import { NguoiDungHienTai, type NguoiDungYeuCau } from "../common/decorators/nguoi-dung-hien-tai.decorator";
import { chenCongCuXemPhongChu } from "../common/mau-in/mau-in-dung-chung";
import { BaoCaoPhuongTienService } from "./bao-cao-phuong-tien.service";
import { taoExcelBaoCaoPhuongTien } from "./bao-cao-phuong-tien-excel";
import { taoHtmlBaoCaoPhuongTien } from "./bao-cao-phuong-tien-mau-in";

/**
 * "Bao cao phuong tien" - trang bao cao tu sinh (khong CRUD rieng), xem
 * NHAT_KY_QUYET_DINH.md muc "Bao cao phuong tien". Dung lai quyen chung-tu.xem
 * (xem man hinh + xuat Excel) va chung-tu.in (in PDF) - giong Sổ theo dõi
 * công lệnh, KHONG tao quyen moi.
 */
@Controller("bao-cao-phuong-tien")
export class BaoCaoPhuongTienController {
  constructor(
    private readonly baoCaoPhuongTienService: BaoCaoPhuongTienService,
    private readonly pdfService: PdfService,
    private readonly cauHinhDonViService: CauHinhDonViService,
    private readonly nhatKy: NhatKyService,
  ) {}

  @CanDo(MA_QUYEN.CHUNG_TU_XEM)
  @Get("trang-thai")
  trangThaiHienTai(
    @Query(new ZodValidationPipe(trangThaiPhuongTienSchema)) truyVan: TrangThaiPhuongTienInput,
  ) {
    return this.baoCaoPhuongTienService.trangThaiHienTai(truyVan);
  }

  @CanDo(MA_QUYEN.CHUNG_TU_XEM)
  @Get("tan-suat")
  thongKeTanSuat(@Query(new ZodValidationPipe(tanSuatPhuongTienSchema)) truyVan: TanSuatPhuongTienInput) {
    return this.baoCaoPhuongTienService.thongKeTanSuat(truyVan);
  }

  @CanDo(MA_QUYEN.CHUNG_TU_XEM)
  @Get("xuat-excel")
  async xuatExcel(
    @Query(new ZodValidationPipe(tanSuatPhuongTienSchema)) truyVan: TanSuatPhuongTienInput,
  ): Promise<StreamableFile> {
    const [trangThai, tanSuat] = await Promise.all([
      this.baoCaoPhuongTienService.trangThaiHienTai({}),
      this.baoCaoPhuongTienService.thongKeTanSuat(truyVan),
    ]);
    const buffer = taoExcelBaoCaoPhuongTien(trangThai, tanSuat);
    return new StreamableFile(buffer, {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      disposition: `attachment; filename="bao-cao-phuong-tien.xlsx"`,
    });
  }

  @CanDo(MA_QUYEN.CHUNG_TU_IN)
  @Get("in")
  async inBaoCao(
    @Query(new ZodValidationPipe(inBaoCaoPhuongTienSchema)) truyVan: InBaoCaoPhuongTienInput,
    // ?xemHtml=1 - che do dev "xem HTML kiem tra co chu", xem
    // chenCongCuXemPhongChu() (mau-in-dung-chung.ts).
    @Query("xemHtml") xemHtml: string | undefined,
    @NguoiDungHienTai() nguoiDungHienTai: NguoiDungYeuCau,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile | string> {
    const { nguoiLapSo, ...boLocTanSuat } = truyVan;

    const [trangThai, tanSuat, cauHinhDonVi, nguoiKyChinhThuc] = await Promise.all([
      this.baoCaoPhuongTienService.trangThaiHienTai({}),
      this.baoCaoPhuongTienService.thongKeTanSuat(boLocTanSuat),
      this.cauHinhDonViService.layCauHinh(),
      this.baoCaoPhuongTienService.layNguoiKyChinhThuc(),
    ]);

    if (!nguoiKyChinhThuc) {
      throw new BadRequestException(
        "Chưa có người ký chính thức - vào Danh mục Người ký để thiết lập trước khi in báo cáo.",
      );
    }

    const html = taoHtmlBaoCaoPhuongTien(trangThai, tanSuat, {
      cauHinhDonVi,
      nguoiLapSo,
      nguoiKy: {
        hoTen: nguoiKyChinhThuc.nhanVien.hoTen,
        chucDanhKy: nguoiKyChinhThuc.chucDanhKy,
        theThucKy: nguoiKyChinhThuc.theThucKy,
      },
      ngayIn: new Date(),
      tuNgay: boLocTanSuat.tuNgay ?? null,
      denNgay: boLocTanSuat.denNgay ?? null,
      sapXepTheo: boLocTanSuat.sapXepTheo,
    });

    if (xemHtml) {
      res.header("Content-Type", "text/html; charset=utf-8");
      return chenCongCuXemPhongChu(html);
    }

    const pdf = await this.pdfService.xuatPdfTuHtml(html, "A4", { landscape: true });

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiDungHienTai.id,
      hanhDong: "XEM_IN_BAO_CAO_PHUONG_TIEN",
      doiTuong: "BaoCaoPhuongTien",
      giaTriTruoc: { soXeDangDi: trangThai.filter((x) => x.dangDi).length, nguoiLapSo },
    });

    return new StreamableFile(pdf, {
      type: "application/pdf",
      disposition: `inline; filename="bao-cao-phuong-tien.pdf"`,
    });
  }
}
