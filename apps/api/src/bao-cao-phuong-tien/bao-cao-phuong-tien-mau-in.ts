import type { CauHinhDonVi } from "@prisma/client";
import type { TieuChiSapXepTanSuat } from "@congtac/validation";
import {
  taoCssFontMat,
  layFontFamilyMauIn,
  layTyLeXHeightMauIn,
  thoat,
  dinhDangNgay,
  dinhDangNgayVanBan,
  cssLetterheadVaKy,
} from "../common/mau-in/mau-in-dung-chung";

/**
 * Mau in "Bao cao phuong tien" (A4 NGANG, giong Sổ theo dõi công lệnh - day
 * la 1 BAO CAO dang BANG, khong phai 1 CHUNG TU rieng le) - gom 3 phan tren
 * CUNG 1 ban in: (I) Trang thai su dung hien tai, (II) Thong ke tan suat su
 * dung PHUONG TIEN, (III) Thong ke tan suat CONG TAC cua TAI XE - ca (II) va
 * (III) theo khoang ngay da chon (dung CHUNG 1 khoang ngay, sap xep RIENG).
 * Xem NHAT_KY_QUYET_DINH.md muc "Bao cao phuong tien".
 *
 * Tai su dung toi da phan DUNG CHUNG voi cac mau in khac (taoCssFontMat, cac
 * ham dinh dang ngay, CSS cua cssLetterheadVaKy()). Khoi letterhead RIENG
 * (khongLetterheadBaoCao ben duoi) COP Y het khoiLetterheadSoTheoDoi() cua
 * so-cong-lenh-mau-in.ts (bo dong "So:" vi bao cao khong co so hieu chinh
 * thuc) - CHAP NHAN trung lap nho nay thay vi promote len mau-in-dung-chung.ts,
 * giong ly do da giai thich o file kia; neu co bao cao thu 3 can dung lai,
 * luc do moi dang gop chung.
 */

export interface DongTrangThaiPhuongTienDeIn {
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

export interface DongTanSuatPhuongTienDeIn {
  bienSo: string;
  nhanHieu: string;
  luotDi: number;
  tongNgaySuDung: number;
}

export interface DongTanSuatTaiXeDeIn {
  hoTen: string;
  chucVu: string;
  luotDi: number;
  tongNgaySuDung: number;
}

export interface NguoiKyDeIn {
  hoTen: string;
  chucDanhKy: string;
  theThucKy: string;
}

interface TuyChonInBaoCao {
  cauHinhDonVi: CauHinhDonVi;
  nguoiLapSo: string;
  nguoiKy: NguoiKyDeIn;
  ngayIn: Date;
  tuNgay: Date | null;
  denNgay: Date | null;
  sapXepTheo: TieuChiSapXepTanSuat;
  sapXepTheoTaiXe: TieuChiSapXepTanSuat;
}

const NHAN_TIEU_CHI_SAP_XEP: Record<TieuChiSapXepTanSuat, string> = {
  luotDi: "số lượt đi",
  tongNgaySuDung: "tổng số ngày sử dụng",
};

function khoiLetterheadBaoCao(cauHinhDonVi: CauHinhDonVi, ngayIn: Date): string {
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
  if (tuNgay && denNgay) return `Từ ngày ${dinhDangNgay(tuNgay)} đến ngày ${dinhDangNgay(denNgay)}`;
  if (tuNgay) return `Từ ngày ${dinhDangNgay(tuNgay)}`;
  if (denNgay) return `Đến ngày ${dinhDangNgay(denNgay)}`;
  return "Toàn bộ - không giới hạn ngày đi";
}

function khoiKyDoi(nguoiLapSo: string, nguoiKy: NguoiKyDeIn): string {
  return `
    <div class="khoi-ky-doi">
      <div class="khoi-ky-mot">
        <div class="chuc-danh-ky">NGƯỜI LẬP BÁO CÁO</div>
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

function cssKhung(phongChuMauIn: string | null | undefined, tyLeXHeightMauIn: number | null | undefined): string {
  return `
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    font-family: ${layFontFamilyMauIn(phongChuMauIn)};
    font-size-adjust: ${layTyLeXHeightMauIn(tyLeXHeightMauIn)};
    color: #1a1a1a;
    font-size: 10pt;
    line-height: 1.4;
  }
  .trang { position: relative; width: 297mm; min-height: 210mm; padding: 12mm 14mm; }
  ${cssLetterheadVaKy()}
  .tieu-de-phu { font-size: 11pt; font-weight: 700; margin: 6mm 0 2mm; text-transform: uppercase; }
  .mo-ta-thoi-gian { font-size: 9.5pt; font-style: italic; color: #444; margin-bottom: 3mm; }
  table.bang-so { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
  table.bang-so + .tieu-de-phu { margin-top: 8mm; }
  table.bang-so th, table.bang-so td {
    border: 1px solid #333;
    padding: 1.8mm 2.5mm;
    text-align: left;
    vertical-align: top;
    overflow-wrap: break-word;
    word-break: break-word;
  }
  table.bang-so th { text-align: center; font-weight: 700; background: #eef1f6; }
  table.bang-so td.stt, table.bang-so td.canh-giua { text-align: center; }
  table.bang-so td.khong-xuong-dong, table.bang-so th.khong-xuong-dong { white-space: nowrap; }
  .the-trang-thai { display: inline-block; padding: 0.5mm 2mm; border-radius: 3mm; font-weight: 700; font-size: 9pt; }
  .the-dang-di { background: #fee2e2; color: #991b1b; }
  .the-ranh { background: #dcfce7; color: #166534; }
  .khoi-ky-doi { display: flex; justify-content: space-between; margin-top: 12mm; padding: 0 10mm; }
  .khoi-ky-mot { width: 65mm; text-align: center; }
  `;
}

function bangTrangThaiHienTai(dongs: DongTrangThaiPhuongTienDeIn[]): string {
  const hang = dongs
    .map(
      (d, i) => `<tr>
        <td class="stt">${i + 1}</td>
        <td class="khong-xuong-dong">${thoat(d.bienSo)}</td>
        <td>${thoat(d.nhanHieu)}</td>
        <td class="canh-giua">
          <span class="the-trang-thai ${d.dangDi ? "the-dang-di" : "the-ranh"}">${d.dangDi ? "Đang đi" : "Rảnh"}</span>
        </td>
        <td>${d.lenhDieuXeDangDi ? thoat(d.lenhDieuXeDangDi.laiXeHoTen) : "-"}</td>
        <td>${d.lenhDieuXeDangDi ? thoat(d.lenhDieuXeDangDi.noiDen) : "-"}</td>
        <td class="khong-xuong-dong">
          ${d.lenhDieuXeDangDi ? `${dinhDangNgay(d.lenhDieuXeDangDi.ngayDi)} – ${dinhDangNgay(d.lenhDieuXeDangDi.ngayVe)}` : "-"}
        </td>
        <td class="khong-xuong-dong">${d.lenhDieuXeDangDi ? thoat(d.lenhDieuXeDangDi.soHieu) : "-"}</td>
      </tr>`,
    )
    .join("");

  return `
    <div class="tieu-de-phu">I. Trạng thái sử dụng hiện tại</div>
    <table class="bang-so">
      <thead>
        <tr>
          <th style="width:10mm;">STT</th>
          <th style="width:26mm;">Biển số</th>
          <th style="width:34mm;">Nhãn hiệu</th>
          <th style="width:22mm;">Trạng thái</th>
          <th style="width:38mm;">Tài xế</th>
          <th>Nơi đến</th>
          <th style="width:34mm;">Ngày đi/về</th>
          <th style="width:26mm;">Số hiệu LĐX</th>
        </tr>
      </thead>
      <tbody>
        ${dongs.length > 0 ? hang : `<tr><td colspan="8" style="text-align:center; color:#777;">Không có phương tiện nào đang hoạt động.</td></tr>`}
      </tbody>
    </table>`;
}

function bangTanSuat(dongs: DongTanSuatPhuongTienDeIn[], sapXepTheo: TieuChiSapXepTanSuat, tuNgay: Date | null, denNgay: Date | null): string {
  const hang = dongs
    .map(
      (d, i) => `<tr>
        <td class="stt">${i + 1}</td>
        <td class="khong-xuong-dong">${thoat(d.bienSo)}</td>
        <td>${thoat(d.nhanHieu)}</td>
        <td class="canh-giua">${d.luotDi}</td>
        <td class="canh-giua">${d.tongNgaySuDung}</td>
      </tr>`,
    )
    .join("");

  return `
    <div class="tieu-de-phu">II. Thống kê tần suất sử dụng</div>
    <div class="mo-ta-thoi-gian">
      ${moTaKhoangThoiGian(tuNgay, denNgay)} — sắp xếp theo ${NHAN_TIEU_CHI_SAP_XEP[sapXepTheo]}, giảm dần.
    </div>
    <table class="bang-so">
      <thead>
        <tr>
          <th style="width:10mm;">STT</th>
          <th style="width:26mm;">Biển số</th>
          <th>Nhãn hiệu</th>
          <th style="width:30mm;">Số lượt đi</th>
          <th style="width:38mm;">Tổng số ngày sử dụng</th>
        </tr>
      </thead>
      <tbody>
        ${dongs.length > 0 ? hang : `<tr><td colspan="5" style="text-align:center; color:#777;">Chưa có phương tiện nào trong danh mục.</td></tr>`}
      </tbody>
    </table>`;
}

function bangTanSuatTaiXe(
  dongs: DongTanSuatTaiXeDeIn[],
  sapXepTheo: TieuChiSapXepTanSuat,
  tuNgay: Date | null,
  denNgay: Date | null,
): string {
  const hang = dongs
    .map(
      (d, i) => `<tr>
        <td class="stt">${i + 1}</td>
        <td>${thoat(d.hoTen)}</td>
        <td>${thoat(d.chucVu)}</td>
        <td class="canh-giua">${d.luotDi}</td>
        <td class="canh-giua">${d.tongNgaySuDung}</td>
      </tr>`,
    )
    .join("");

  return `
    <div class="tieu-de-phu">III. Thống kê tần suất công tác của tài xế</div>
    <div class="mo-ta-thoi-gian">
      ${moTaKhoangThoiGian(tuNgay, denNgay)} — sắp xếp theo ${NHAN_TIEU_CHI_SAP_XEP[sapXepTheo]}, giảm dần.
    </div>
    <table class="bang-so">
      <thead>
        <tr>
          <th style="width:10mm;">STT</th>
          <th>Họ và tên</th>
          <th style="width:50mm;">Chức vụ</th>
          <th style="width:30mm;">Số lượt đi</th>
          <th style="width:38mm;">Tổng số ngày công tác</th>
        </tr>
      </thead>
      <tbody>
        ${dongs.length > 0 ? hang : `<tr><td colspan="5" style="text-align:center; color:#777;">Chưa có tài xế nào trong danh mục.</td></tr>`}
      </tbody>
    </table>`;
}

export function taoHtmlBaoCaoPhuongTien(
  trangThai: DongTrangThaiPhuongTienDeIn[],
  tanSuat: DongTanSuatPhuongTienDeIn[],
  tanSuatTaiXe: DongTanSuatTaiXeDeIn[],
  tuyChon: TuyChonInBaoCao,
): string {
  const noiDungTrang = `<div class="trang">
    <div class="noi-dung">
      ${khoiLetterheadBaoCao(tuyChon.cauHinhDonVi, tuyChon.ngayIn)}
      <div class="tieu-de-chinh" style="margin-top: 8mm;">BÁO CÁO PHƯƠNG TIỆN</div>
      ${bangTrangThaiHienTai(trangThai)}
      ${bangTanSuat(tanSuat, tuyChon.sapXepTheo, tuyChon.tuNgay, tuyChon.denNgay)}
      ${bangTanSuatTaiXe(tanSuatTaiXe, tuyChon.sapXepTheoTaiXe, tuyChon.tuNgay, tuyChon.denNgay)}
      ${khoiKyDoi(tuyChon.nguoiLapSo, tuyChon.nguoiKy)}
    </div>
  </div>`;

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8" />
<title>Báo cáo phương tiện</title>
<style>
  ${taoCssFontMat(tuyChon.cauHinhDonVi.phongChuMauIn)}
  ${cssKhung(tuyChon.cauHinhDonVi.phongChuMauIn, tuyChon.cauHinhDonVi.tyLeXHeightMauIn)}
</style>
</head>
<body>
${noiDungTrang}
</body>
</html>`;
}
