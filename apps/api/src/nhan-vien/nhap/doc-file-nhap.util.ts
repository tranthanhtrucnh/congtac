import * as XLSX from "xlsx";
import * as mammoth from "mammoth";
import * as cheerio from "cheerio";
import { BadRequestException } from "@nestjs/common";
import { boDauTiengViet } from "../../common/utils/bo-dau.util";

export interface DongTho {
  /** So thu tu dong du lieu trong file (dong 1 = dong ngay sau tieu de) - dung de bao loi cho de doi chieu. */
  soDong: number;
  hoTen: string;
  ngaySinhChuoi: string;
  cccd: string;
  chucVu: string;
  donViCongTac: string;
}

// Moi truong "canonical" co the co nhieu ten cot khac nhau trong thuc te -
// so khop sau khi bo dau + thuong hoa nen khong can liet ke moi bien the dau/khong dau.
const BIEN_THE_COT: Record<keyof Omit<DongTho, "soDong">, string[]> = {
  hoTen: ["ho va ten", "ho ten", "hoten", "ten"],
  ngaySinhChuoi: ["ngay sinh", "nam sinh"],
  cccd: ["so cccd", "cccd", "cmnd", "so cmnd", "cccd/cmnd", "can cuoc cong dan"],
  chucVu: ["chuc vu"],
  donViCongTac: ["phong ban", "don vi", "don vi cong tac", "phong/ban"],
};

function nhanDangCot(hangTieuDe: string[]): Partial<Record<keyof Omit<DongTho, "soDong">, number>> {
  const ketQua: Partial<Record<keyof Omit<DongTho, "soDong">, number>> = {};
  const tieuDeKhongDau = hangTieuDe.map((o) => boDauTiengViet(o));

  for (const [truong, bienThe] of Object.entries(BIEN_THE_COT)) {
    const chiSo = tieuDeKhongDau.findIndex((td) => bienThe.includes(td));
    if (chiSo !== -1) {
      ketQua[truong as keyof Omit<DongTho, "soDong">] = chiSo;
    }
  }
  return ketQua;
}

function xayDongTho(hangDuLieu: string[][], viTriCot: Partial<Record<keyof Omit<DongTho, "soDong">, number>>): DongTho[] {
  const layO = (hang: string[], chiSo: number | undefined) =>
    chiSo === undefined ? "" : (hang[chiSo] ?? "").toString().trim();

  const ketQua: DongTho[] = [];
  hangDuLieu.forEach((hang, i) => {
    const coDuLieu = hang.some((o) => o && o.toString().trim().length > 0);
    if (!coDuLieu) return; // bo qua dong trong hoan toan, khong tinh la loi

    ketQua.push({
      soDong: i + 1,
      hoTen: layO(hang, viTriCot.hoTen),
      ngaySinhChuoi: layO(hang, viTriCot.ngaySinhChuoi),
      cccd: layO(hang, viTriCot.cccd),
      chucVu: layO(hang, viTriCot.chucVu),
      donViCongTac: layO(hang, viTriCot.donViCongTac),
    });
  });
  return ketQua;
}

function docExcel(buffer: Buffer): DongTho[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const hangs: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });

  if (hangs.length === 0) {
    throw new BadRequestException("File Excel không có dữ liệu");
  }

  const viTriCot = nhanDangCot(hangs[0]);
  if (viTriCot.hoTen === undefined || viTriCot.cccd === undefined) {
    throw new BadRequestException(
      'Không nhận diện được cột "Họ tên" hoặc "CCCD" - vui lòng dùng đúng file mẫu',
    );
  }

  return xayDongTho(hangs.slice(1), viTriCot);
}

async function docDocx(buffer: Buffer): Promise<DongTho[]> {
  const { value: html } = await mammoth.convertToHtml({ buffer });
  const $ = cheerio.load(html);
  const bang = $("table").first();
  if (bang.length === 0) {
    throw new BadRequestException(
      "Không tìm thấy bảng dữ liệu trong file Word - file cần có 1 bảng với dòng tiêu đề",
    );
  }

  const hangs: string[][] = [];
  bang.find("tr").each((_, tr) => {
    const oTrongHang: string[] = [];
    $(tr)
      .find("td, th")
      .each((__, o) => {
        oTrongHang.push($(o).text().trim());
      });
    hangs.push(oTrongHang);
  });

  if (hangs.length === 0) {
    throw new BadRequestException("Bảng trong file Word không có dữ liệu");
  }

  const viTriCot = nhanDangCot(hangs[0]);
  if (viTriCot.hoTen === undefined || viTriCot.cccd === undefined) {
    throw new BadRequestException(
      'Không nhận diện được cột "Họ tên" hoặc "CCCD" trong bảng - vui lòng dùng đúng file mẫu',
    );
  }

  return xayDongTho(hangs.slice(1), viTriCot);
}

/** Nhan dang dinh dang file qua "magic bytes" - dang tin cay hon la chi doc duoi file. */
function laFileZipOOXML(buffer: Buffer): boolean {
  return buffer.length > 4 && buffer[0] === 0x50 && buffer[1] === 0x4b; // "PK"
}

function laFileOleNhiPhanCu(buffer: Buffer): boolean {
  return (
    buffer.length > 8 &&
    buffer[0] === 0xd0 &&
    buffer[1] === 0xcf &&
    buffer[2] === 0x11 &&
    buffer[3] === 0xe0
  );
}

export async function docFileNhapNhanVien(buffer: Buffer, tenFile: string): Promise<DongTho[]> {
  if (laFileOleNhiPhanCu(buffer)) {
    throw new BadRequestException(
      "File .doc/.xls định dạng cũ (Word/Excel 97-2003) chưa được hỗ trợ đọc trực tiếp. " +
        'Vui lòng mở file bằng Word/Excel, chọn "Save As" → định dạng .docx hoặc .xlsx, rồi tải lại.',
    );
  }
  if (!laFileZipOOXML(buffer)) {
    throw new BadRequestException("Định dạng file không hợp lệ - chỉ hỗ trợ .xlsx hoặc .docx");
  }

  const duoiFile = tenFile.toLowerCase().split(".").pop();
  if (duoiFile === "xlsx") return docExcel(buffer);
  if (duoiFile === "docx") return docDocx(buffer);

  throw new BadRequestException("Chỉ hỗ trợ file .xlsx hoặc .docx");
}
