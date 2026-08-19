import type { CauHinhDonVi, LenhDieuXe } from "@prisma/client";
import {
  taoCssFontMat,
  thoat,
  dinhDangNgayDiDenMauIn,
  cssLetterheadVaKy,
  khoiLetterhead,
  khoiKy,
  trangMoHinh,
} from "../common/mau-in/mau-in-dung-chung";

/** Tap hop truong toi thieu ma noiDungLenhDieuXe() can - LenhDieuXe (Prisma)
 * thoa man day du, nhung khi ghep chung file voi LDCT (xem
 * lenh-dieu-cong-tac-mau-in.ts) chi co cac truong nay (khong phai 1 ban ghi
 * LenhDieuXe that trong CSDL), nen tach rieng type long nay de dung chung
 * duoc ca 2 noi. */
export interface LenhDieuXeNoiDungDeIn {
  soHieu: string;
  ngayKy: Date;
  laiXeHoTen: string;
  bienSo: string;
  nhanHieu: string;
  noiDi: string;
  noiDen: string;
  mucDich: string;
  ngayDi: Date;
  ngayVe: Date;
  nguoiKyHoTen: string;
  nguoiKyChucDanh: string;
  nguoiKyTheThuc: string;
}

// CSS rieng cho cac truong "khung bien so noi bat + danh sach truong co
// cham" chi dung o mau LDX (khac voi LDCT/GDD dang bang/doan van) - tach
// rieng khoi cssLetterheadVaKy() (dung chung ca 3 loai chung tu) de file nao
// KHONG hien thi noi dung LDX (vd file "toan bo GDD") khong phai tai CSS
// khong dung toi.
export const CSS_RIENG_LENH_DIEU_XE = `
  .khung-bien-so { display: flex; justify-content: center; margin-bottom: 6mm; }
  /* Thu hep khoang trang trong khung quanh bien so xe - qua 2 lan giam:
     2.5mm 9mm -> 1.5mm 4mm -> 0.8mm 2mm (nguoi dung yeu cau giam them nua
     sau lan 1). Nguoi dung yeu cau 2026-08-17, xem NHAT_KY_QUYET_DINH.md. */
  .khung-bien-so div {
    border: 1.5px solid #222;
    border-radius: 1.5mm;
    padding: 0.8mm 2mm;
    font-size: 14pt;
    font-weight: 800;
    letter-spacing: 1px;
  }
  .danh-sach-truong { display: flex; flex-direction: column; gap: 3mm; }
  .dong-truong { display: flex; align-items: baseline; gap: 2.5mm; flex-wrap: wrap; }
  .cham { color: #2563eb; font-size: 8pt; }
  .nhan { color: #333; min-width: 32mm; white-space: nowrap; }
  .gia-tri { font-weight: 700; overflow-wrap: break-word; word-break: break-word; min-width: 0; flex: 1; }
`;

/**
 * Noi dung "trong ruot" cua mau LDX (khong bao goc <div class="trang">, chi
 * tu <div class="noi-dung"> tro di) - DUNG CHUNG cho ca 2 noi: (1)
 * taoHtmlLenhDieuXe() ben duoi (in LDX doc lap, khong A5) va (2)
 * lenh-dieu-cong-tac-mau-in.ts khi ghep chung file "LDCT + LDX" (nut "In
 * lenh dieu cong tac + lenh dieu xe" o trang chi tiet LDCT). Tach ham nay
 * 2026-08-10 sau khi phat hien mau in LDX ghep chung LDCT bi viet lai don
 * gian hoa rieng, khac voi mau that - xem NHAT_KY_QUYET_DINH.md.
 */
export function noiDungLenhDieuXe(lenh: LenhDieuXeNoiDungDeIn, cauHinhDonVi: CauHinhDonVi): string {
  return `<div class="noi-dung">
      ${khoiLetterhead(lenh.soHieu, new Date(lenh.ngayKy), cauHinhDonVi)}

      <div class="tieu-de-chinh">LỆNH ĐIỀU XE</div>

      <div class="khung-bien-so"><div>${thoat(lenh.bienSo)}</div></div>

      <div class="danh-sach-truong">
        <div class="dong-truong">
          <span class="cham">◆</span>
          <span class="nhan">Họ và tên lái xe:</span>
          <span class="gia-tri">${thoat(lenh.laiXeHoTen)}</span>
        </div>
        <div class="dong-truong">
          <span class="cham">◆</span>
          <span class="nhan">Xe mang biển số:</span>
          <span class="gia-tri">${thoat(lenh.bienSo)}</span>
        </div>
        <div class="dong-truong">
          <span class="cham">◆</span>
          <span class="nhan">Nhãn hiệu:</span>
          <span class="gia-tri">${thoat(lenh.nhanHieu)}</span>
        </div>
        <div class="dong-truong">
          <span class="cham">◆</span>
          <span class="nhan">Nơi đi:</span>
          <span class="gia-tri">${thoat(lenh.noiDi)}</span>
        </div>
        <div class="dong-truong">
          <span class="cham">◆</span>
          <span class="nhan">Nơi đến:</span>
          <span class="gia-tri">${thoat(lenh.noiDen)}</span>
        </div>
        <div class="dong-truong">
          <span class="cham">◆</span>
          <span class="nhan">Mục đích:</span>
          <span class="gia-tri">${thoat(lenh.mucDich)}</span>
        </div>
        <div class="dong-truong">
          <span class="cham">◆</span>
          <!-- Bo min-width:20mm rieng cua nhan "Ngay di" (truoc day khien gia
               tri Ngay di thut vao SOM hon cac truong khac o tren, vi cac
               nhan do dung min-width mac dinh 32mm cua .nhan) - de gia tri
               Ngay di CANH LE dung voi gia tri cac truong khac. Nguoi dung
               yeu cau 2026-08-17, xem NHAT_KY_QUYET_DINH.md. -->
          <span class="nhan">Ngày đi:</span>
          <span class="gia-tri" style="flex:none; margin-right:8mm;">${dinhDangNgayDiDenMauIn(new Date(lenh.ngayDi))}</span>
          <span class="nhan" style="min-width:20mm;">Ngày về:</span>
          <span class="gia-tri">${dinhDangNgayDiDenMauIn(new Date(lenh.ngayVe))}</span>
        </div>
      </div>

      ${khoiKy(lenh.nguoiKyTheThuc, lenh.nguoiKyHoTen, lenh.nguoiKyChucDanh)}
    </div>`;
}

/**
 * Dung HTML/CSS cho ban in Lenh dieu xe kho A5 - theo mau anh nguoi dung
 * cung cap (2026-08-07, xem NHAT_KY_QUYET_DINH.md): header 2 cot (UBND +
 * cong ty + so hieu | quoc hieu tieu ngu + ngay ky), tieu de lon, khung bien
 * so noi bat, danh sach truong co cham, logo lam hinh mo giua trang, khoi
 * ky goc phai duoi.
 *
 * Khoi "ten co quan ban hanh" / "quoc hieu tieu ngu" trinh bay theo the thuc
 * Nghi dinh 30/2020/ND-CP (cong tac van thu): dong "co quan chu quan" (UBND
 * tinh) chu thuong khong dam; dong "co quan ban hanh" (ten cong ty) in hoa
 * dam, gach chan duoi dong cuoi ("XO SO KIEN THIET AN GIANG") dai bang 2/3
 * do dai chinh dong chu do (dung ky thuat inline-block + absolute de tu bam
 * theo do rong that cua chu, khong phai % co dinh theo mm); "CONG HOA..."
 * in hoa dam; "Doc lap - Tu do - Hanh phuc" chu thuong dam, LON HON 1 nac so
 * voi dong "CONG HOA..." (dung quy dinh), gach chan dai dung bang dong chu
 * do. Co chu nho hon muc 12-13 nghi dinh quy dinh (muc do tinh cho kho A4
 * day trang) de vua cot hep khi trinh bay 2 cot tren kho A5 - khong doi ty
 * le dam/nhat/viet hoa/gach chan.
 *
 * 2 diem chinh khac anh mau (da xac nhan voi nguoi dung): the thuc ky lay
 * DONG theo du lieu nguoi ky chinh thuc luc tao (khong in cung "GIAM DOC"
 * nhu anh minh hoa), co in them ho ten nguoi ky duoi chuc danh.
 *
 * `cauHinhDonVi` (ten UBND/cong ty/dia danh) truyen vao TU DATABASE
 * (CauHinhDonViService.layCauHinh(), khong hardcode trong file nay nua) - de
 * doi ten don vi (vd sap nhap) chi can sua 1 cho qua giao dien
 * /cau-hinh-don-vi, khong phai sua code + deploy lai. Xem NHAT_KY_QUYET_DINH.md.
 */
export function taoHtmlLenhDieuXe(lenh: LenhDieuXe, cauHinhDonVi: CauHinhDonVi): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8" />
<title>Lệnh điều xe ${thoat(lenh.soHieu)}</title>
<style>
  ${taoCssFontMat()}
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    font-family: "Be Vietnam Pro", Arial, "Segoe UI", Helvetica, sans-serif;
    color: #1a1a1a;
    font-size: 10pt;
    line-height: 1.35;
  }
  /* Kho giay do page.pdf({format:"A5"}) ben PdfService quyet dinh - o day
     CHU DINH KHONG gioi han chieu cao/overflow:hidden nua: neu du lieu nhap
     tay qua dai (vd Noi den dai) khien noi dung vuot 210mm, thoi thuc te la
     tran sang trang 2 (giong may in/PDF thuong lam) - khong bao gio cat mat
     du lieu that. Truong hop binh thuong (do dai nhu nhap lieu thuc te) van
     nam gon 1 trang nho da tinh du bien an toan ~40-50mm luc thiet ke.

     Da thu canh le dung Nghi dinh 30 (20/20/30/15mm) nhung cot header phai
     thu nho chu qua nhieu (7-8pt) moi vua, nguoi dung phan hoi "khong on" -
     da quay lai le gon 8mm/10mm ban dau, giu chu doc duoc ro rang hon la
     dung tuyet doi trị so nghi dinh. Xem NHAT_KY_QUYET_DINH.md 2026-08-07. */
  .trang {
    position: relative;
    width: 148mm;
    min-height: 210mm;
    padding: 10mm 10mm 8mm 10mm;
  }
  ${cssLetterheadVaKy()}
  ${CSS_RIENG_LENH_DIEU_XE}
</style>
</head>
<body>
  <div class="trang">
    ${trangMoHinh(cauHinhDonVi)}
    ${noiDungLenhDieuXe(lenh, cauHinhDonVi)}
  </div>
</body>
</html>`;
}
