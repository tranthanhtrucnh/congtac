import * as XLSX from "xlsx";
import { dinhDangNgay } from "../common/mau-in/mau-in-dung-chung";
import { nhanHanhDong } from "@congtac/shared";

export interface DongNhatKyDeXuat {
  thoiGian: Date;
  nguoiDung: { hoTen: string; tenDangNhap: string } | null;
  hanhDong: string;
  doiTuong: string;
  tomTat: string | null;
  diaChiIp: string | null;
}

const TIEU_DE_COT = ["Thời gian", "Người thực hiện", "Hành động", "Đối tượng", "Địa chỉ IP"];
const DO_RONG_COT = [18, 26, 34, 30, 16];

/** Xuat "Nhat ky he thong" ra buffer .xlsx theo dung bo loc dang ap dung -
 * cung pattern voi so-cong-lenh-excel.ts. */
export function taoExcelNhatKy(dongs: DongNhatKyDeXuat[]): Buffer {
  const hang = dongs.map((d) => [
    `${dinhDangNgay(d.thoiGian)} ${d.thoiGian.toTimeString().slice(0, 5)}`,
    d.nguoiDung ? `${d.nguoiDung.hoTen} (${d.nguoiDung.tenDangNhap})` : "Hệ thống",
    nhanHanhDong(d.hanhDong),
    d.tomTat ? `${d.doiTuong} — ${d.tomTat}` : d.doiTuong,
    d.diaChiIp ?? "",
  ]);

  const trangTinh = XLSX.utils.aoa_to_sheet([TIEU_DE_COT, ...hang]);
  trangTinh["!cols"] = DO_RONG_COT.map((w) => ({ wch: w }));

  const sach = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(sach, trangTinh, "Nhat ky he thong");
  return XLSX.write(sach, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
