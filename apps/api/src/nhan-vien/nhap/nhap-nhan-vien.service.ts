import { Injectable } from "@nestjs/common";
import type { XacNhanNhapNhanVienInput } from "@congtac/validation";
import { PrismaService } from "../../prisma/prisma.service";
import { NhatKyService } from "../../common/nhat-ky/nhat-ky.service";
import { boDauTiengViet } from "../../common/utils/bo-dau.util";
import { docNgayVietNam } from "../../common/utils/ngay-viet-nam.util";
import { docFileNhapNhanVien } from "./doc-file-nhap.util";

export type TrangThaiDongNhap =
  | "HOP_LE"
  | "THIEU_DU_LIEU"
  | "SAI_DINH_DANG"
  | "TRUNG_CCCD"
  | "NGHI_TRUNG";

export interface DongXemTruoc {
  soDong: number;
  hoTen: string;
  ngaySinh: string | null;
  ngaySinhGoc: string;
  cccd: string;
  chucVu: string;
  donViCongTac: string;
  trangThai: TrangThaiDongNhap;
  ghiChu?: string;
}

const CCCD_HOP_LE = /^\d{9}$|^\d{12}$/;

@Injectable()
export class NhapNhanVienService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nhatKy: NhatKyService,
  ) {}

  async xemTruoc(buffer: Buffer, tenFile: string): Promise<{ dongDuLieu: DongXemTruoc[] }> {
    const dongTho = await docFileNhapNhanVien(buffer, tenFile);

    const nhanVienHienCo = await this.prisma.nhanVien.findMany({
      select: { cccd: true, hoTenKhongDau: true, ngaySinh: true },
    });
    const cccdHienCo = new Set(nhanVienHienCo.map((nv) => nv.cccd));
    const tenNgaySinhHienCo = new Set(
      nhanVienHienCo.map((nv) => `${nv.hoTenKhongDau}|${nv.ngaySinh.toISOString().slice(0, 10)}`),
    );

    const cccdDaGap = new Map<string, number>(); // cccd -> so dong dau tien gap trong file

    const ketQua: DongXemTruoc[] = dongTho.map((dong) => {
      const co = (giaTri: string) => giaTri.trim().length > 0;

      if (!co(dong.hoTen) || !co(dong.ngaySinhChuoi) || !co(dong.cccd)) {
        return {
          soDong: dong.soDong,
          hoTen: dong.hoTen,
          ngaySinh: null,
          ngaySinhGoc: dong.ngaySinhChuoi,
          cccd: dong.cccd,
          chucVu: dong.chucVu,
          donViCongTac: dong.donViCongTac,
          trangThai: "THIEU_DU_LIEU",
          ghiChu: "Thiếu họ tên, ngày sinh hoặc CCCD",
        };
      }

      const ngaySinh = docNgayVietNam(dong.ngaySinhChuoi);
      const cccdDung = CCCD_HOP_LE.test(dong.cccd.trim());
      if (!ngaySinh || !cccdDung) {
        return {
          soDong: dong.soDong,
          hoTen: dong.hoTen,
          ngaySinh: ngaySinh ? ngaySinh.toISOString() : null,
          ngaySinhGoc: dong.ngaySinhChuoi,
          cccd: dong.cccd,
          chucVu: dong.chucVu,
          donViCongTac: dong.donViCongTac,
          trangThai: "SAI_DINH_DANG",
          ghiChu: !ngaySinh
            ? "Ngày sinh không đúng định dạng ngày/tháng/năm"
            : "CCCD/CMND phải gồm 9 hoặc 12 chữ số",
        };
      }

      const cccdSach = dong.cccd.trim();
      if (cccdHienCo.has(cccdSach)) {
        return {
          soDong: dong.soDong,
          hoTen: dong.hoTen,
          ngaySinh: ngaySinh.toISOString(),
          ngaySinhGoc: dong.ngaySinhChuoi,
          cccd: cccdSach,
          chucVu: dong.chucVu,
          donViCongTac: dong.donViCongTac,
          trangThai: "TRUNG_CCCD",
          ghiChu: "CCCD này đã có trong danh mục nhân viên",
        };
      }
      if (cccdDaGap.has(cccdSach)) {
        return {
          soDong: dong.soDong,
          hoTen: dong.hoTen,
          ngaySinh: ngaySinh.toISOString(),
          ngaySinhGoc: dong.ngaySinhChuoi,
          cccd: cccdSach,
          chucVu: dong.chucVu,
          donViCongTac: dong.donViCongTac,
          trangThai: "TRUNG_CCCD",
          ghiChu: `Trùng CCCD với dòng ${cccdDaGap.get(cccdSach)} trong chính file này`,
        };
      }
      cccdDaGap.set(cccdSach, dong.soDong);

      const khoaTenNgaySinh = `${boDauTiengViet(dong.hoTen)}|${ngaySinh.toISOString().slice(0, 10)}`;
      if (tenNgaySinhHienCo.has(khoaTenNgaySinh)) {
        return {
          soDong: dong.soDong,
          hoTen: dong.hoTen,
          ngaySinh: ngaySinh.toISOString(),
          ngaySinhGoc: dong.ngaySinhChuoi,
          cccd: cccdSach,
          chucVu: dong.chucVu,
          donViCongTac: dong.donViCongTac,
          trangThai: "NGHI_TRUNG",
          ghiChu: "Trùng họ tên + ngày sinh với người đã có trong danh mục nhưng CCCD khác - kiểm tra lại trước khi nhập",
        };
      }

      return {
        soDong: dong.soDong,
        hoTen: dong.hoTen,
        ngaySinh: ngaySinh.toISOString(),
        ngaySinhGoc: dong.ngaySinhChuoi,
        cccd: cccdSach,
        chucVu: dong.chucVu || "Nhân viên",
        donViCongTac: dong.donViCongTac,
        trangThai: "HOP_LE",
      };
    });

    return { dongDuLieu: ketQua };
  }

  async xacNhan(duLieu: XacNhanNhapNhanVienInput, nguoiThucHienId: string) {
    // Kiem tra lai trung CCCD trong chinh danh sach xac nhan va voi DB - phong
    // truong hop du lieu da doi tu luc xem truoc (nguoi khac vua them truoc do).
    const cccdTrongDanhSach = new Set<string>();
    const dongHopLe: XacNhanNhapNhanVienInput["dongDuLieu"] = [];
    let soBoQua = 0;

    const cccdHienCo = new Set(
      (await this.prisma.nhanVien.findMany({ select: { cccd: true } })).map((nv) => nv.cccd),
    );

    for (const dong of duLieu.dongDuLieu) {
      if (cccdHienCo.has(dong.cccd) || cccdTrongDanhSach.has(dong.cccd)) {
        soBoQua++;
        continue;
      }
      cccdTrongDanhSach.add(dong.cccd);
      dongHopLe.push(dong);
    }

    const daTao = await this.prisma.$transaction(
      dongHopLe.map((dong) =>
        this.prisma.nhanVien.create({
          data: {
            hoTen: dong.hoTen,
            hoTenKhongDau: boDauTiengViet(dong.hoTen),
            ngaySinh: dong.ngaySinh,
            cccd: dong.cccd,
            chucVu: dong.chucVu ?? "Nhân viên",
            donViCongTac: dong.donViCongTac,
            laTaiXe: false,
          },
        }),
      ),
    );

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiThucHienId,
      hanhDong: "NHAP_DANH_SACH_NHAN_VIEN",
      doiTuong: "NhanVien",
      giaTriSau: { soLuongDaThem: daTao.length, soLuongBoQua: soBoQua },
    });

    return { soLuongDaThem: daTao.length, soLuongBoQua: soBoQua };
  }
}
