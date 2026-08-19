import { randomUUID } from "crypto";
import { rm, writeFile, readFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { BadRequestException, ConflictException, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NhatKyService } from "../common/nhat-ky/nhat-ky.service";
import {
  chayPhucHoi,
  chaySaoLuu,
  demSoBang,
  demTongBuocPhucHoi,
  dinhDangThoiGianTenFile,
  ghiNhatKyPhucHoiTrucTiep,
  ngatKetNoiKhac,
  phanTichDatabaseUrl,
} from "./sao-luu.core";

export interface TienTrinhSaoLuu {
  dangChay: boolean;
  loaiCongViec: "sao-luu" | "phuc-hoi" | null;
  daXong: number;
  tong: number;
  loi: string | null;
  sanSangTai: boolean;
  thongBaoHoanTat: string | null;
}

function trangThaiRanh(): TienTrinhSaoLuu {
  return { dangChay: false, loaiCongViec: null, daXong: 0, tong: 0, loi: null, sanSangTai: false, thongBaoHoanTat: null };
}

/**
 * Sao luu / phuc hoi du lieu - xem docs/superpowers/specs/
 * 2026-08-14-sao-luu-phuc-hoi-du-lieu-design.md. Trang thai tien trinh giu
 * trong bo nho (don tien trinh, du dung cho 1 admin thao tac 1 luc).
 */
@Injectable()
export class SaoLuuService {
  private readonly logger = new Logger(SaoLuuService.name);
  private tienTrinh: TienTrinhSaoLuu = trangThaiRanh();
  private duongDanFileTamSanSangTai: string | null = null;
  private tenFileTaiXuong: string | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly nhatKy: NhatKyService,
  ) {}

  layTienTrinh(): TienTrinhSaoLuu {
    return this.tienTrinh;
  }

  /** Bat dau sao luu, chay NGAM (khong cho ham nay tra ve moi xong) - frontend
   * theo doi qua layTienTrinh(). */
  async chaySaoLuuNgay(nguoiDungId: string): Promise<void> {
    if (this.tienTrinh.dangChay) {
      throw new ConflictException("Đang có thao tác sao lưu/phục hồi khác đang chạy");
    }
    const db = phanTichDatabaseUrl(process.env.DATABASE_URL as string);
    const tenFile = `sao-luu-${dinhDangThoiGianTenFile()}.sql`;
    const duongDanFileTam = join(tmpdir(), `congtac-sao-luu-${randomUUID()}.sql`);

    this.tienTrinh = { ...trangThaiRanh(), dangChay: true, loaiCongViec: "sao-luu" };

    void (async () => {
      try {
        const tongSoBang = await demSoBang(db);
        this.tienTrinh.tong = tongSoBang;
        await chaySaoLuu({
          db,
          duongDanFileTam,
          tongSoBang,
          onTienTrinh: (daXong, tong) => {
            this.tienTrinh.daXong = daXong;
            this.tienTrinh.tong = tong;
          },
        });
        this.duongDanFileTamSanSangTai = duongDanFileTam;
        this.tenFileTaiXuong = tenFile;
        this.tienTrinh = {
          ...this.tienTrinh,
          dangChay: false,
          sanSangTai: true,
          thongBaoHoanTat: "Đã sao lưu xong, sẵn sàng tải xuống",
        };
        await this.nhatKy.ghiNhan({
          nguoiDungId,
          hanhDong: "SAO_LUU_THU_CONG",
          doiTuong: "SaoLuu",
          doiTuongId: tenFile,
        });
      } catch (loi) {
        this.logger.error("Lỗi sao lưu", loi as Error);
        this.tienTrinh = { ...this.tienTrinh, dangChay: false, loi: (loi as Error).message };
        await rm(duongDanFileTam, { force: true });
      }
    })();
  }

  /** Doc noi dung file da sao luu xong de tra ve cho controller tai xuong, roi
   * XOA file tam + reset trang thai ve ranh (khong con danh sach luu tru trong
   * app - xem spec muc 1). */
  async layFileTaiXuongVaXoa(): Promise<{ noiDung: Buffer; tenFile: string }> {
    if (!this.tienTrinh.sanSangTai || !this.duongDanFileTamSanSangTai || !this.tenFileTaiXuong) {
      throw new BadRequestException("Chưa có file sao lưu nào sẵn sàng để tải xuống");
    }
    const duongDan = this.duongDanFileTamSanSangTai;
    const tenFile = this.tenFileTaiXuong;
    try {
      const noiDung = await readFile(duongDan);
      return { noiDung, tenFile };
    } finally {
      await rm(duongDan, { force: true });
      this.duongDanFileTamSanSangTai = null;
      this.tenFileTaiXuong = null;
      this.tienTrinh = trangThaiRanh();
    }
  }

  /** Bat dau phuc hoi tu buffer file nguoi dung da tai len, chay NGAM. Neu
   * thanh cong, ung dung TU THOAT sau vai giay (can khoi dong lai thu cong -
   * xem spec muc 1/8). */
  async batDauPhucHoi(
    fileBuffer: Buffer,
    tenFileGoc: string,
    xacNhan: string,
    nguoiDungId: string,
  ): Promise<void> {
    if (xacNhan !== tenFileGoc) {
      throw new BadRequestException("Tên xác nhận không khớp tên file đã chọn");
    }
    if (this.tienTrinh.dangChay) {
      throw new ConflictException("Đang có thao tác sao lưu/phục hồi khác đang chạy");
    }

    const duongDanFileTam = join(tmpdir(), `congtac-phuc-hoi-${randomUUID()}.sql`);
    await writeFile(duongDanFileTam, fileBuffer);

    this.tienTrinh = { ...trangThaiRanh(), dangChay: true, loaiCongViec: "phuc-hoi" };

    void (async () => {
      let daNgatKetNoi = false;
      try {
        const db = phanTichDatabaseUrl(process.env.DATABASE_URL as string);
        const tongSoBuoc = await demTongBuocPhucHoi(duongDanFileTam);
        this.tienTrinh.tong = tongSoBuoc;

        await this.prisma.$disconnect();
        daNgatKetNoi = true;
        await ngatKetNoiKhac(db);

        await chayPhucHoi({
          db,
          duongDanFileTam,
          tongSoBuoc,
          onTienTrinh: (daXong, tong) => {
            this.tienTrinh.daXong = daXong;
            this.tienTrinh.tong = tong;
          },
        });

        await ghiNhatKyPhucHoiTrucTiep(db, tenFileGoc);

        this.tienTrinh = {
          ...this.tienTrinh,
          dangChay: false,
          thongBaoHoanTat:
            "Đã phục hồi thành công. Hãy đóng cửa sổ dòng lệnh đang chạy pnpm dev và chạy lại để tiếp tục sử dụng.",
        };
        setTimeout(() => process.exit(1), 1500);
      } catch (loi) {
        this.logger.error("Lỗi phục hồi", loi as Error);
        const ghiChuKetNoi = daNgatKetNoi
          ? " Lưu ý: kết nối cơ sở dữ liệu của ứng dụng đã bị ngắt trong lúc phục hồi — cần khởi động lại pnpm dev dù thao tác này thất bại."
          : "";
        this.tienTrinh = {
          ...this.tienTrinh,
          dangChay: false,
          loi: `${(loi as Error).message}${ghiChuKetNoi}`,
        };
      } finally {
        await rm(duongDanFileTam, { force: true });
      }
    })();
  }
}
