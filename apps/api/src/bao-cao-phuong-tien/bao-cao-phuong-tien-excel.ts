import * as XLSX from "xlsx";
import { dinhDangNgay } from "../common/mau-in/mau-in-dung-chung";

export interface DongTrangThaiPhuongTienXuat {
  bienSo: string;
  nhanHieu: string;
  loaiXe: string | null;
  dangDi: boolean;
  lenhDieuXeDangDi: {
    soHieu: string;
    laiXeHoTen: string;
    noiDen: string;
    ngayDi: Date;
    ngayVe: Date;
  } | null;
}

export interface DongTanSuatPhuongTienXuat {
  bienSo: string;
  nhanHieu: string;
  luotDi: number;
  tongNgaySuDung: number;
}

export interface DongTanSuatTaiXeXuat {
  hoTen: string;
  chucVu: string;
  luotDi: number;
  tongNgaySuDung: number;
}

const TIEU_DE_COT_TRANG_THAI = [
  "Biển số",
  "Nhãn hiệu",
  "Loại xe",
  "Trạng thái",
  "Tài xế",
  "Nơi đến",
  "Ngày đi",
  "Ngày về",
  "Số hiệu LĐX",
];
const DO_RONG_COT_TRANG_THAI = [14, 20, 14, 12, 22, 24, 12, 12, 16];

const TIEU_DE_COT_TAN_SUAT = ["Biển số", "Nhãn hiệu", "Số lượt đi", "Tổng số ngày sử dụng"];
const DO_RONG_COT_TAN_SUAT = [14, 20, 14, 20];

const TIEU_DE_COT_TAN_SUAT_TAI_XE = ["Họ và tên", "Chức vụ", "Số lượt đi", "Tổng số ngày công tác"];
const DO_RONG_COT_TAN_SUAT_TAI_XE = [24, 24, 14, 20];

/** Xuat "Bao cao phuong tien" ra buffer .xlsx - 3 trang tinh (3 sheet) trong
 * CUNG 1 file, giong bo cuc ban in (I. Trang thai hien tai, II. Thong ke tan
 * suat phuong tien, III. Thong ke tan suat cong tac cua tai xe). Xem
 * NHAT_KY_QUYET_DINH.md muc "Bao cao phuong tien". */
export function taoExcelBaoCaoPhuongTien(
  trangThai: DongTrangThaiPhuongTienXuat[],
  tanSuat: DongTanSuatPhuongTienXuat[],
  tanSuatTaiXe: DongTanSuatTaiXeXuat[],
): Buffer {
  const hangTrangThai = trangThai.map((d) => [
    d.bienSo,
    d.nhanHieu,
    d.loaiXe ?? "",
    d.dangDi ? "Đang đi" : "Rảnh",
    d.lenhDieuXeDangDi?.laiXeHoTen ?? "",
    d.lenhDieuXeDangDi?.noiDen ?? "",
    d.lenhDieuXeDangDi ? dinhDangNgay(d.lenhDieuXeDangDi.ngayDi) : "",
    d.lenhDieuXeDangDi ? dinhDangNgay(d.lenhDieuXeDangDi.ngayVe) : "",
    d.lenhDieuXeDangDi?.soHieu ?? "",
  ]);
  const trangTinhTrangThai = XLSX.utils.aoa_to_sheet([TIEU_DE_COT_TRANG_THAI, ...hangTrangThai]);
  trangTinhTrangThai["!cols"] = DO_RONG_COT_TRANG_THAI.map((w) => ({ wch: w }));

  const hangTanSuat = tanSuat.map((d) => [d.bienSo, d.nhanHieu, d.luotDi, d.tongNgaySuDung]);
  const trangTinhTanSuat = XLSX.utils.aoa_to_sheet([TIEU_DE_COT_TAN_SUAT, ...hangTanSuat]);
  trangTinhTanSuat["!cols"] = DO_RONG_COT_TAN_SUAT.map((w) => ({ wch: w }));

  const hangTanSuatTaiXe = tanSuatTaiXe.map((d) => [d.hoTen, d.chucVu, d.luotDi, d.tongNgaySuDung]);
  const trangTinhTanSuatTaiXe = XLSX.utils.aoa_to_sheet([TIEU_DE_COT_TAN_SUAT_TAI_XE, ...hangTanSuatTaiXe]);
  trangTinhTanSuatTaiXe["!cols"] = DO_RONG_COT_TAN_SUAT_TAI_XE.map((w) => ({ wch: w }));

  const sach = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(sach, trangTinhTrangThai, "Trang thai hien tai");
  XLSX.utils.book_append_sheet(sach, trangTinhTanSuat, "Thong ke tan suat");
  XLSX.utils.book_append_sheet(sach, trangTinhTanSuatTaiXe, "Tan suat tai xe");
  return XLSX.write(sach, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
