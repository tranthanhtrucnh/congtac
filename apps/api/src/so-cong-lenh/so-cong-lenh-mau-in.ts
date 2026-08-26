import type { CauHinhDonVi } from "@prisma/client";
import type { CotSoTheoDoi } from "@congtac/validation";
import {
  taoCssFontMat,
  thoat,
  dinhDangNgay,
  dinhDangNgayVanBan,
  cssLetterheadVaKy,
} from "../common/mau-in/mau-in-dung-chung";

/**
 * Mau in "So theo doi cong lenh" (A4 NGANG - khac han moi mau in truoc do
 * trong ung dung, deu la 1 CHUNG TU rieng le kho A5/A4 DOC; day la 1 BAO CAO
 * dang BANG nhieu dong/nhieu chung tu gop lai) - nguoi dung yeu cau 2026-08-26,
 * xem NHAT_KY_QUYET_DINH.md muc "So theo doi cong lenh - mau in".
 *
 * Tai su dung toi da phan DUNG CHUNG voi cac mau in khac (taoCssFontMat, cac
 * ham dinh dang ngay, VA CA CSS cua cssLetterheadVaKy() - .tieu-de-tren/.cot/
 * .quoc-hieu/.tieu-ngu/.chuc-danh-ky/.ho-ten-ky/.khoang-trong-ky...) thay vi
 * viet lai tu dau, de giao dien letterhead/chu ky LUON dong bo voi 3 loai
 * chung tu con lai. CHI viet MOI: (1) khung trang kho A4 NGANG (rong hon han
 * A4 doc dang dung o lenh-dieu-cong-tac-mau-in.ts), (2) khoi letterhead
 * RIENG - bo dong "So:" (bao cao nay khong co so hieu/danh muc so nhu 1
 * chung tu chinh thuc, khong dung khoiLetterhead() dung chung), (3) bang du
 * lieu nhieu cot tuy chon, (4) khoi ky 2 CHU KY SONG SONG (Nguoi lap so +
 * Nguoi ky duyet) - khac voi khoiKy() dung chung (chi 1 chu ky, neo phai).
 */

export interface DongSoTheoDoiDeIn {
  lenhDieuCongTacId: string;
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

export interface NguoiKyDeIn {
  hoTen: string;
  chucDanhKy: string;
  theThucKy: string;
}

interface TuyChonInSoTheoDoi {
  cauHinhDonVi: CauHinhDonVi;
  nguoiLapSo: string;
  nguoiKy: NguoiKyDeIn;
  ngayIn: Date;
  tuNgay: Date | null;
  denNgay: Date | null;
  tuKhoa: string | null;
}

const DINH_NGHIA_COT: Record<
  CotSoTheoDoi,
  { tieuDe: string; rong?: string; khongXuongDong?: boolean; noiDung: (d: DongSoTheoDoiDeIn) => string }
> = {
  ngayLap: { tieuDe: "Ngày lập", rong: "22mm", khongXuongDong: true, noiDung: (d) => dinhDangNgay(d.ngayLap) },
  soLdct: { tieuDe: "Số LĐCT", rong: "34mm", khongXuongDong: true, noiDung: (d) => thoat(d.soLdct) },
  soCongLenh: {
    tieuDe: "Số Công lệnh/GĐĐ",
    rong: "38mm",
    khongXuongDong: true,
    noiDung: (d) => thoat(d.soCongLenh),
  },
  hoTen: { tieuDe: "Họ tên", rong: "40mm", noiDung: (d) => thoat(d.hoTen) },
  diaDiem: { tieuDe: "Địa điểm", noiDung: (d) => thoat(d.diaDiem) },
  mucDich: { tieuDe: "Mục đích", noiDung: (d) => thoat(d.mucDich) },
  ngayDiVe: {
    tieuDe: "Ngày đi/về",
    rong: "40mm",
    khongXuongDong: true,
    noiDung: (d) => `${dinhDangNgay(d.ngayDi)} – ${dinhDangNgay(d.ngayVe)}`,
  },
  ghiChu: { tieuDe: "Ghi chú", noiDung: (d) => thoat(d.ghiChu ?? "") },
};

/** Khoi letterhead RIENG cho bao cao nay - giong het cau truc HTML cua
 * khoiLetterhead() dung chung (mau-in-dung-chung.ts) NHUNG BO dong "So: ..."
 * (bao cao tu sinh, khong co so hieu chinh thuc/danh muc so nhu 1 chung tu
 * that - xem NHAT_KY_QUYET_DINH.md "So cong lenh"). Dung CHUNG CSS voi
 * khoiLetterhead() (cssLetterheadVaKy()) nen tu dong dong bo font/co
 * chu/khoang cach voi 3 mau in con lai, chi khac phan HTML nay. */
function khoiLetterheadSoTheoDoi(cauHinhDonVi: CauHinhDonVi, ngayIn: Date): string {
  const d = dinhDangNgayVanBan(ngayIn);
  return `
    <div class="tieu-de-tren">
      <div class="cot">
        <div class="co-quan-chu-quan">${thoat(cauHinhDonVi.donViChuQuan)}</div>
        <div class="co-quan-ban-hanh">${thoat(cauHinhDonVi.tenCoQuanDong1)}</div>
        <div class="dong-co-gach">
          <span class="co-quan-ban-hanh">${thoat(cauHinhDonVi.tenCoQuanDong2)}</span>
          <span class="gach-1-2"></span>
        </div>
      </div>
      <div class="cot">
        <div class="quoc-hieu"><span>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</span></div>
        <div class="dong-tieu-ngu"><span class="tieu-ngu">Độc lập - Tự do - Hạnh phúc</span></div>
        <div class="ngay-ky">${thoat(cauHinhDonVi.diaDanh)}, ngày ${d.ngay} tháng ${d.thang} năm ${d.nam}</div>
      </div>
    </div>`;
}

function moTaKhoangThoiGian(tuNgay: Date | null, denNgay: Date | null): string {
  if (tuNgay && denNgay) return `(Từ ngày ${dinhDangNgay(tuNgay)} đến ngày ${dinhDangNgay(denNgay)})`;
  if (tuNgay) return `(Từ ngày ${dinhDangNgay(tuNgay)})`;
  if (denNgay) return `(Đến ngày ${dinhDangNgay(denNgay)})`;
  return "(Toàn bộ - không giới hạn ngày lập)";
}

/** 2 chu ky SONG SONG (Nguoi lap so ben trai, Nguoi ky duyet ben phai) - khac
 * khoiKy() dung chung (mau-in-dung-chung.ts, chi 1 chu ky neo phai) nen viet
 * rieng, nhung van TAI SU DUNG cac class con (.chuc-danh-ky/.chuc-danh-nguoi-ky/
 * .khoang-trong-ky/.ho-ten-ky) tu cssLetterheadVaKy() de dong bo kieu chu voi
 * khu vuc ky cua 3 mau in kia - chi doi bo khung ngoai thanh 2 cot. */
function khoiKyDoi(nguoiLapSo: string, nguoiKy: NguoiKyDeIn): string {
  return `
    <div class="khoi-ky-doi">
      <div class="khoi-ky-mot">
        <div class="chuc-danh-ky">NGƯỜI LẬP SỔ</div>
        <div class="khoang-trong-ky"></div>
        <div class="ho-ten-ky">${thoat(nguoiLapSo)}</div>
      </div>
      <div class="khoi-ky-mot">
        <div class="chuc-danh-ky">${thoat(nguoiKy.theThucKy)}</div>
        <div class="chuc-danh-nguoi-ky">${thoat(nguoiKy.chucDanhKy)}</div>
        <div class="khoang-trong-ky"></div>
        <div class="ho-ten-ky">${thoat(nguoiKy.hoTen)}</div>
      </div>
    </div>`;
}

function cssKhung(): string {
  return `
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    font-family: "Be Vietnam Pro", Arial, "Segoe UI", Helvetica, sans-serif;
    color: #1a1a1a;
    font-size: 10pt;
    line-height: 1.4;
  }
  /* Kho A4 NGANG - Playwright/Chromium tu hoan doi rong/cao khi goi
     page.pdf({landscape:true}) nen o day khai bao THANG kich thuoc kho ngang
     (297mm rong x 210mm cao), khong phai kho doc roi nho trinh duyet tu xoay -
     xem ghi chu trong PdfService.xuatPdfTuHtml(). */
  .trang { position: relative; width: 297mm; min-height: 210mm; padding: 12mm 14mm; }
  ${cssLetterheadVaKy()}
  .mo-ta-thoi-gian { text-align: center; font-size: 10pt; font-style: italic; margin-bottom: 3mm; }
  .mo-ta-tu-khoa { text-align: center; font-size: 9pt; color: #555; margin-bottom: 3mm; }
  table.bang-so { width: 100%; border-collapse: collapse; margin-top: 4mm; font-size: 9.5pt; }
  table.bang-so th, table.bang-so td {
    border: 1px solid #333;
    padding: 1.8mm 2.5mm;
    text-align: left;
    vertical-align: top;
    overflow-wrap: break-word;
    word-break: break-word;
  }
  table.bang-so th { text-align: center; font-weight: 700; background: #eef1f6; }
  table.bang-so td.stt { text-align: center; }
  table.bang-so td.khong-xuong-dong, table.bang-so th.khong-xuong-dong { white-space: nowrap; }
  /* O "So LDCT" da gop rowspan (xem taoHtmlSoTheoDoiCongLenh) - can giua ca
     ngang lan doc + in dam de noi bat, thay vi nam lech len tren nhu mac dinh
     (vertical-align:top dung chung) khi o keo dai qua nhieu hang. */
  table.bang-so td.o-gop { text-align: center; vertical-align: middle; font-weight: 700; }
  /* Xen ke mau nhe theo TUNG doan cung 1 LDCT (giong man hinh xem /so-cong-lenh
     va /giay-di-duong) - giup nguoi doc de nhan biet cac dong nao cung 1 lenh
     dieu cong tac khi in ra giay, dac biet khi 1 doan co nhieu thanh vien. */
  table.bang-so tr.nhom-le td { background: #f7f8fa; }
  .khoi-ky-doi { display: flex; justify-content: space-between; margin-top: 14mm; padding: 0 10mm; }
  .khoi-ky-mot { width: 65mm; text-align: center; }
  `;
}

export function taoHtmlSoTheoDoiCongLenh(dongs: DongSoTheoDoiDeIn[], cot: CotSoTheoDoi[], tuyChon: TuyChonInSoTheoDoi): string {
  const dinhNghiaCotDaChon = cot.map((ma) => ({ ma, ...DINH_NGHIA_COT[ma] }));

  // Gop o "Số LĐCT" (rowspan) cho cac dong LIEN TIEP cung 1 lenh dieu cong
  // tac - de 1 doan nhieu thanh vien chi hien 1 so LDCT DUY NHAT o giua nhom
  // thay vi lap lai tren tung dong, de nhin hon khi 1 lenh co nhieu nguoi.
  // CHI ap dung cho cot "soLdct" - cot "Ngay lap" (cung gia tri cho ca doan)
  // VAN lap lai nhu cu theo yeu cau nguoi dung 2026-08-26 (xem
  // NHAT_KY_QUYET_DINH.md), va CHI o mau in nay - khong dung o man hinh xem
  // /so-cong-lenh (van moi dong 1 so LDCT nhu truoc). Du lieu dau vao da sap
  // xep LIEN TIEP theo lenhDieuCongTacId tu SoCongLenhService (orderBy ngayKy/
  // soThuTu LDCT truoc, thanhVien.thuTu sau) nen chi can gom theo nhom LIEN
  // TIEP, khong can gom toan cuc bang Map.
  const nhomLdct: { laDauNhom: boolean; coRong: number }[] = [];
  for (let i = 0; i < dongs.length; ) {
    let j = i;
    while (j < dongs.length && dongs[j].lenhDieuCongTacId === dongs[i].lenhDieuCongTacId) j++;
    const coRong = j - i;
    for (let k = i; k < j; k++) nhomLdct.push({ laDauNhom: k === i, coRong });
    i = j;
  }

  let ldctTruoc: string | null = null;
  let nhomLe = false;
  const hangHtml = dongs
    .map((d, i) => {
      if (d.lenhDieuCongTacId !== ldctTruoc) {
        nhomLe = !nhomLe;
        ldctTruoc = d.lenhDieuCongTacId;
      }
      const oCot = dinhNghiaCotDaChon
        .map((c) => {
          // Cot soLdct dang gop nhom: dong khong phai dau nhom thi BO QUA HAN
          // (khong render <td>) vi da duoc gop vao <td rowspan> cua dong dau
          // nhom o tren roi - render them se thua 1 o, lam lech hang.
          if (c.ma === "soLdct" && !nhomLdct[i].laDauNhom) return "";
          const rowspanAttr = c.ma === "soLdct" && nhomLdct[i].coRong > 1 ? ` rowspan="${nhomLdct[i].coRong}"` : "";
          const cacLop = [c.khongXuongDong && "khong-xuong-dong", c.ma === "soLdct" && "o-gop"]
            .filter(Boolean)
            .join(" ");
          const classAttr = cacLop ? ` class="${cacLop}"` : "";
          return `<td${rowspanAttr}${classAttr}>${c.noiDung(d)}</td>`;
        })
        .join("");
      return `<tr${nhomLe ? ' class="nhom-le"' : ""}><td class="stt">${i + 1}</td>${oCot}</tr>`;
    })
    .join("");

  const theadHtml = `<tr><th style="width:10mm;">STT</th>${dinhNghiaCotDaChon
    .map((c) => `<th${c.rong ? ` style="width:${c.rong};"` : ""}${c.khongXuongDong ? ' class="khong-xuong-dong"' : ""}>${thoat(c.tieuDe)}</th>`)
    .join("")}</tr>`;

  const noiDungTrang = `<div class="trang">
    <div class="noi-dung">
      ${khoiLetterheadSoTheoDoi(tuyChon.cauHinhDonVi, tuyChon.ngayIn)}
      <div class="tieu-de-chinh" style="margin-top: 8mm;">SỔ THEO DÕI CÔNG LỆNH</div>
      <div class="mo-ta-thoi-gian">${moTaKhoangThoiGian(tuyChon.tuNgay, tuyChon.denNgay)}</div>
      ${tuyChon.tuKhoa ? `<div class="mo-ta-tu-khoa">Từ khóa lọc: "${thoat(tuyChon.tuKhoa)}"</div>` : ""}
      <table class="bang-so">
        <thead>${theadHtml}</thead>
        <tbody>${
          dongs.length > 0
            ? hangHtml
            : `<tr><td colspan="${dinhNghiaCotDaChon.length + 1}" style="text-align:center; color:#777;">Không có dòng nào khớp bộ lọc đã chọn.</td></tr>`
        }</tbody>
      </table>
      ${khoiKyDoi(tuyChon.nguoiLapSo, tuyChon.nguoiKy)}
    </div>
  </div>`;

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8" />
<title>Sổ theo dõi công lệnh</title>
<style>
  ${taoCssFontMat()}
  ${cssKhung()}
</style>
</head>
<body>
${noiDungTrang}
</body>
</html>`;
}
