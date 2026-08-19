import * as XLSX from "xlsx";
import { dinhDangNgay } from "../common/mau-in/mau-in-dung-chung";

export interface DongSoCongLenh {
  ngayLap: Date;
  soLdct: string;
  soCongLenh: string;
  hoTen: string;
  diaDiem: string;
  mucDich: string;
  ngayDi: Date;
  ngayVe: Date;
  ghiChu: string | null;
}

const TIEU_DE_COT = [
  "Ngày lập",
  "Số LĐCT",
  "Số Công lệnh/GĐĐ",
  "Họ tên",
  "Địa điểm",
  "Mục đích",
  "Ngày đi",
  "Ngày về",
  "Ghi chú",
];

// Do rong cot (ky tu) - uoc luong theo do dai noi dung thuong gap, tranh
// phai bam dan de xem het (giong cach lam trong doc-file-nhap.util.ts
// nhung o day la XUAT thay vi DOC).
const DO_RONG_COT = [12, 14, 18, 22, 30, 28, 12, 12, 30];

/** Xuat "So cong lenh" ra buffer .xlsx - dung cho endpoint xuat Excel (xem
 * NHAT_KY_QUYET_DINH.md muc "So cong lenh"). Khong co API sua rieng - day la
 * export 1 chieu tu du lieu da co san (LenhDieuCongTac + GiayDiDuong). */
export function taoExcelSoCongLenh(dongs: DongSoCongLenh[]): Buffer {
  const hang = dongs.map((d) => [
    dinhDangNgay(d.ngayLap),
    d.soLdct,
    d.soCongLenh,
    d.hoTen,
    d.diaDiem,
    d.mucDich,
    dinhDangNgay(d.ngayDi),
    dinhDangNgay(d.ngayVe),
    d.ghiChu ?? "",
  ]);

  const trangTinh = XLSX.utils.aoa_to_sheet([TIEU_DE_COT, ...hang]);
  trangTinh["!cols"] = DO_RONG_COT.map((w) => ({ wch: w }));

  const sach = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(sach, trangTinh, "So cong lenh");
  return XLSX.write(sach, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
