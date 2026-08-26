import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { CauHinhDonVi } from "@prisma/client";

/**
 * Tien ich dung chung cho MOI mau in HTML/CSS (LDX, LDCT, GDD...) - tach ra
 * tu lenh-dieu-xe-mau-in.ts (2026-08-10) khi bat dau co mau in thu 2, de
 * khong lap lai code doc logo/font/thoat HTML o tung file mau in. Xem
 * NHAT_KY_QUYET_DINH.md.
 */

// Doc + cache logo 1 lan duy nhat (base64 inline vao HTML) - khong tham
// chieu qua URL/file:// de trang HTML tu chua toan bo, khong phu thuoc gi
// luc Chromium headless render (dung PdfService).
let logoBase64Cache: string | null = null;
export function layLogoBase64(): string {
  if (logoBase64Cache === null) {
    const duLieu = readFileSync(join(process.cwd(), "assets", "logo-cong-ty.png"));
    logoBase64Cache = duLieu.toString("base64");
  }
  return logoBase64Cache;
}

// Phong chu Be Vietnam Pro (khong chan, chuan tieng Viet) nhung tuc inline
// base64 vao CSS - KHONG tai qua mang luc render (dung file .ttf luu san
// trong apps/api/assets/fonts). Neu nguoi dung CHUA tai file nao, @font-face
// tuong ung se bi bo qua va CSS font-family stack tu rot ve phong he thong
// (Arial...) - khong loi, chi khong dung dung Be Vietnam Pro cho toi khi co file.
//
// "Geist Mono" (2026-08-10) - dung rieng cho cot NAM SINH/SO CCCD trong mau
// in LDCT Tram. Lich su lua chon font monospace cho 2 cot nay khong don
// gian, tom tat de khong lap lai sai lam cu neu doi font lan nua:
//   1. Roboto Mono - LOAI: so "0" co gach cheo, de nham voi so "8".
//   2. Courier Prime - DUNG THU: so "0" hinh oval don gian (2 contour), khong
//      gach - nhung sau do nguoi dung de xuat cach khac don gian hon (Be
//      Vietnam Pro + tabular-nums + ep khong dam), nen da rut ra.
//   3. Be Vietnam Pro + tabular-nums + ep font-weight:normal co dinh - hoat
//      dong dung nhung nguoi dung sau do yeu cau doi lai sang font
//      monospace that.
//   4. JetBrains Mono - DUNG THU: so "0" mac dinh co CHAM O GIUA (dotted
//      zero, xac minh bang opentype.js dem contour + xuat PNG xem truc
//      tiep), khong gach cheo, khong nham voi so 8 - nhung nguoi dung van
//      phan hoi "chua dung y", yeu cau doi tiep sang font khac.
//   5. Geist Mono - DUNG THU: so "0" co dau cham o giua (dotted zero, xac
//      minh qua opentype.js + trang GitHub chinh thuc vercel/geist-font) -
//      nguoi dung van khong ung y, muon so "0" TRON, KHONG co dau hieu gi
//      them (khong gach, khong cham).
//   6. Lucida Console - nguoi dung yeu cau nhung day la font DOC QUYEN cua
//      Microsoft (di kem Windows), khong co tren npm/kho font ma nguon mo
//      nao de tai file that ve nhung (base64) nhu quy uoc du an - da hoi lai
//      nguoi dung (AskUserQuestion), nguoi dung dong y KHONG dung Lucida
//      Console, chuyen ve lai...
//   7. Courier Prime (HIEN TAI) - da tai san tu truoc (buoc 2), so "0" hinh
//      OVAL DON GIAN (2 contour, khong gach khong cham - dung y nguoi dung
//      yeu cau o buoc 6), khong co van de ban quyen (OFL, tai qua npm). Do
//      rong ky tu 0.6em giong cac font monospace khac da dung, khong doi
//      lai do rong cot 30mm/36mm.
// Chi lay 2 muc (400/700, subset latin) tu goi npm @fontsource/courier-prime,
// KHONG tai qua mang luc render (giong Be Vietnam Pro, file .woff2 luu san
// trong assets/fonts - file nay van con san tu buoc 2, khong can tai lai).
// Cac file RobotoMono-*.woff2/JetBrainsMono-*.woff2/GeistMono-*.woff2 con lai
// trong assets/fonts la file mo coi (khong xoa duoc do gioi han cua thu muc
// du an), KHONG con duoc tham chieu boi code nao ca. Xem NHAT_KY_QUYET_DINH.md.
const THU_MUC_FONT = join(process.cwd(), "assets", "fonts");
const DANH_SACH_FONT: { file: string; family: string; weight: number; style: "normal" | "italic"; dinhDang: string }[] = [
  { file: "BeVietnamPro-Regular.ttf", family: "Be Vietnam Pro", weight: 400, style: "normal", dinhDang: "truetype" },
  { file: "BeVietnamPro-Italic.ttf", family: "Be Vietnam Pro", weight: 400, style: "italic", dinhDang: "truetype" },
  { file: "BeVietnamPro-Bold.ttf", family: "Be Vietnam Pro", weight: 700, style: "normal", dinhDang: "truetype" },
  { file: "BeVietnamPro-ExtraBold.ttf", family: "Be Vietnam Pro", weight: 800, style: "normal", dinhDang: "truetype" },
  { file: "CourierPrime-Regular.woff2", family: "Courier Prime", weight: 400, style: "normal", dinhDang: "woff2" },
  { file: "CourierPrime-Bold.woff2", family: "Courier Prime", weight: 700, style: "normal", dinhDang: "woff2" },
];

let cssFontMatCache: string | null = null;
export function taoCssFontMat(): string {
  if (cssFontMatCache !== null) return cssFontMatCache;
  const khoi: string[] = [];
  for (const f of DANH_SACH_FONT) {
    try {
      const duLieu = readFileSync(join(THU_MUC_FONT, f.file));
      khoi.push(
        `@font-face { font-family: "${f.family}"; font-weight: ${f.weight}; font-style: ${f.style}; src: url(data:font/${f.dinhDang};base64,${duLieu.toString("base64")}) format("${f.dinhDang}"); }`,
      );
    } catch {
      // Chua co file - bo qua trong sang do, xem ghi chu tren dau file.
    }
  }
  cssFontMatCache = khoi.join("\n");
  return cssFontMatCache;
}

export function thoat(chuoi: string): string {
  return chuoi
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Chan trinh duyet XUONG DONG o 2 cho de gay hieu nham trong 1 cum "dia diem
 * (tinh/thanh)" - vd "P. Tra Vinh (T. Vinh Long)" khong bi tach thanh
 * "...Tra Vinh (T." roi "Vinh Long)" o dong sau, VA cung khong de rieng le
 * "P." mo coi cuoi 1 dong roi "Tra Vinh..." moi dau dong ke (nguoi dung phan
 * hoi kem anh in that 2026-08-26, tieu de phu LDCT "Phat hanh ve... tai <dia
 * diem cong tac>"). Dia diem cong tac la 1 chuoi VAN BAN TU DO nguoi dung
 * nhap (khong tach rieng truong "dia diem"/"tinh") nen khong the sua tan goc
 * bang du lieu co cau truc - thay vi do, dung 2 quy tac go chung, deu bang
 * cach thay khoang trang THUONG bang khong-gian-cung (non-breaking space,
 * U+00A0) dung cho vi tri can giu dinh:
 *
 * 1. Sau 1 chu viet tat hanh chinh (P./TP./T./Q./H./X./TT.: toi da 3 chu hoa
 *    lien tiep + dau cham) - giu dinh voi tu ngay sau no.
 * 2. Ngay TRUOC dau "(" va moi khoang trang BEN TRONG ngoac don "(...)"
 *    (thuong la phan tinh/thanh kem theo) - coi ca cum la 1 khoi khong duoc
 *    tach.
 *
 * Trinh duyet vi vay chi con duoc xuong dong o khoang trang GIUA cac cum dia
 * diem khac nhau (vd sau dau ";" hoac ","), khong con o giua 1 cum. Ap dung
 * TRUOC hay SAU thoat() deu duoc - U+00A0 la ky tu Unicode thuong, khong bi
 * anh huong boi thoat() (chi escape &,<,>,"). Xem NHAT_KY_QUYET_DINH.md.
 */
export function khongTachCumTrongNgoac(chuoi: string): string {
  return chuoi
    .replace(/\b([A-ZĐ]{1,3}\.) /g, "$1\u00A0")
    .replace(/ ?\([^()]*\)/g, (cum) => cum.replace(/ /g, "\u00A0"));
}

/** dd/mm/yyyy, luon dem 2 chu so. Dung cho cac o bang bieu (khac voi
 * dinhDangNgayVanBan() ben duoi - dung rieng cho dong ngay-thang-nam kieu
 * van ban hanh chinh, co quy tac dem so khac). */
export function dinhDangNgay(ngay: Date): string {
  const d = String(ngay.getDate()).padStart(2, "0");
  const m = String(ngay.getMonth() + 1).padStart(2, "0");
  const y = ngay.getFullYear();
  return `${d}/${m}/${y}`;
}

/** Dinh dang ngay kieu VAN BAN HANH CHINH theo Nghi dinh 30/2020/NĐ-CP (tiep
 * tuc quy tac Thong tu 01/2011/TT-BNV): dung CHI cho dong "..., ngày X tháng
 * Y năm Z" o khoiLetterhead() - NGAY luon dem 2 chu so khi < 10, nhung THANG
 * chi dem 2 chu so khi la thang 1 hoac 2; thang 3-9 KHONG duoc co so 0 dang
 * truoc (vd "ngày 05 tháng 3 năm 2026", khong phai "tháng 03"), thang 10-12
 * tu nhien da 2 chu so. Quy tac RIENG nay khac han dinhDangNgay() (dd/mm/yyyy
 * o cac o bang bieu khac trong mau in, luon dem 2 chu so ca ngay lan thang).
 * Nguoi dung yeu cau 2026-08-17, xem NHAT_KY_QUYET_DINH.md. */
export function dinhDangNgayVanBan(ngay: Date): { ngay: string; thang: string; nam: number } {
  const d = String(ngay.getDate()).padStart(2, "0");
  const thangSo = ngay.getMonth() + 1;
  const m = thangSo <= 2 ? String(thangSo).padStart(2, "0") : String(thangSo);
  return { ngay: d, thang: m, nam: ngay.getFullYear() };
}

/** Dinh dang "ngày đi/ngày đến" (dd/m(m)/yyyy, vẫn có dấu gạch chéo) nhưng
 * ĐÚNG QUY TẮC đếm số của Nghị định 30/2020/NĐ-CP: ngày luôn đệm 2 chữ số
 * khi < 10, THÁNG chỉ đệm 2 chữ số khi là tháng 1 hoặc 2 (tháng 3-9 KHÔNG
 * có số 0 phía trước, vd "05/3/2026"). Dùng cho MỌI chỗ hiển thị ngày đi/
 * ngày về/khoảng ngày đi-đến trong TẤT CẢ mẫu in chứng từ (LĐX/LĐCT/GĐĐ) -
 * người dùng yêu cầu 2026-08-17 (mở rộng từ quy tắc đã áp dụng riêng cho
 * dòng "ngày ký" ở khoiLetterhead() qua dinhDangNgayVanBan()).
 * KHÔNG dùng cho: ngày sinh (vẫn dinhDangNgay() dd/mm/yyyy chuẩn - không
 * phải "ngày đi đến"), ngày ký dạng văn xuôi (dinhDangNgayVanBan(), khác
 * định dạng gạch chéo), và KHÔNG dùng ở file xuất Excel (so-cong-lenh-excel.ts,
 * nhat-ky-excel.ts) - yêu cầu chỉ nêu rõ "trong tất cả các mẫu in" (chứng từ
 * PDF), không bao gồm sổ/nhật ký xuất Excel. Xem NHAT_KY_QUYET_DINH.md. */
export function dinhDangNgayDiDenMauIn(ngay: Date): string {
  const d = String(ngay.getDate()).padStart(2, "0");
  const thangSo = ngay.getMonth() + 1;
  const m = thangSo <= 2 ? String(thangSo).padStart(2, "0") : String(thangSo);
  const y = ngay.getFullYear();
  return `${d}/${m}/${y}`;
}

/**
 * Khoi letterhead + khoi ky DUNG CHUNG cho CA 3 loai chung tu (LDX, LDCT,
 * GDD) - tach ra 2026-08-10 sau khi phat hien loi: mau in LDX luc ghep
 * chung file voi LDCT (endpoint /lenh-dieu-cong-tac/:id/pdf-lenh) dung 1
 * ban viet tay lai rieng (don gian hoa), khac voi mau LDX that
 * (taoHtmlLenhDieuXe) - nguoi dung phat hien "mau in khong dung". Tu gio
 * CHI CO 1 noi dinh nghia letterhead/khoi ky, moi file mau in goi lai ham
 * nay - khong con the viet lai rieng gay lech nhau nua. Xem NHAT_KY_QUYET_DINH.md.
 */
export function cssLetterheadVaKy(): string {
  return `
  /* object-fit (khong chi width) - de logo KHONG BAO GIO vuot qua khung du
     anh nguon co ty le khac vuong (vd cao hon rong) - tranh de logo tran
     xuong dung vao khoi letterhead o cuoi trang mat sau GDD (da xay ra thuc
     te, xem NHAT_KY_QUYET_DINH.md).
     CHU Y: width/height/opacity KHONG con khai bao co dinh o day nua - da
     chuyen thanh cau hinh quan tri duoc (CauHinhDonVi.logoKichThuocMm/
     logoOpacityPhanTram, sua tai /cau-hinh-don-vi), gan truc tiep bang
     inline style tren tung the <img> luc render (xem trangMoHinh() ben
     duoi) de AP DUNG THONG NHAT cho MOI mau in - thay the quy tac cu hard-
     code rieng cho mau Tram (120mm) khac voi cac mau con lai (80mm). Nguoi
     dung phat hien do mo/kich thuoc logo "khong nhu nhau giua cac mau in",
     yeu cau lam thanh cau hinh chung 2026-08-17, xem NHAT_KY_QUYET_DINH.md. */
  /* position:absolute (KHONG phai fixed) - .hinh-mo la con TRUC TIEP cua
     ".trang" (xem cach goi trangMoHinh() ngay dau moi trang o cac file
     *-mau-in.ts), va ".trang" DA co san "position:relative" (khai bao rieng
     trong cssKhung() cua tung file mau in) nen absolute se neo/can giua BEN
     TRONG chinh trang do - CHI hien 1 lan/trang. "fixed" neo theo VIEWPORT
     cua CA TAI LIEU chu khong phai tung trang - khi in PDF nhieu trang (vd
     mat truoc+mat sau cua 1 GDD, hay chon "In nhieu" nhieu nguoi cung luc),
     Chromium LAP LAI moi phan tu position:fixed tren MOI TRANG in ra, khien
     TAT CA hinh mo cua MOI trang bi CHONG LEN NHAU tren TUNG trang thay vi
     moi trang chi co 1 hinh cua rieng no - nhieu lop mo xep chong khien anh
     nhin DAM/RO hon han so voi %% do mo da cau hinh (cang chon nhieu nguoi
     de in cung luc, cang nhieu lop chong, cang ro ret). Day la loi dung
     (KHONG PHAI moi bi hong) tu luc dung "fixed" ban dau, chi ro rang khi in
     nhieu trang cung luc - nguoi dung phat hien 2026-08-19 (in nhieu cong
     lenh), xem NHAT_KY_QUYET_DINH.md. */
  .hinh-mo { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); object-fit: contain; z-index: 0; }
  .noi-dung { position: relative; z-index: 1; }
  /* line-height RIENG cho ca khoi letterhead, KHONG de ke thua tu line-height
     cua "html, body" (moi file mau in tu khai bao rieng: LDX 1.35, LDCT
     1.4, GDD che do "gon" 1.28, mau Tram 1.3 - xem cac file *-mau-in.ts).
     Cac khoang cach trong letterhead (vd .gach-1-2 "bottom:-0.2mm" duoi
     .dong-co-gach, .tieu-ngu "padding-bottom") deu tinh TU DAY cua khung
     dong chu (line box), ma chieu cao khung dong chu = font-size x
     line-height - neu line-height ke thua khac nhau giua 3 loai chung tu,
     cung 1 gia tri "-0.2mm"/"0.3mm" se cho khoang cach THI GIAC khac nhau
     (nguoi dung phat hien qua so sanh 3 anh CUNG kho A5, CUNG ty le zoom -
     xac nhan khong phai do crop/zoom nhu nghi truoc do, ma do line-height
     thuc su khac nhau). Co dinh line-height:1.2 rieng cho khoi letterhead
     de no LUON giong het nhau du dat trong file mau in nao. Nguoi dung yeu
     cau 2026-08-17, xem NHAT_KY_QUYET_DINH.md. */
  .tieu-de-tren { display: flex; justify-content: space-between; gap: 4mm; line-height: 1.2; }
  .cot { flex: 1; text-align: center; min-width: 0; }
  /* Ca 2 dong "co quan chu quan" (UBND tinh) va "co quan ban hanh" (ten cong
     ty) phai CUNG SIZE voi .quoc-hieu ben cot doi dien - quoc hieu da tra ve
     9pt (tranh rot dong tren kho A5, xem quyet dinh ngay truoc), nen 2 dong
     nay cung ve lai 9pt de dong bo ca khoi letterhead. Van chi khac nhau o
     do dam (chu thuong khong dam / chu hoa co dam) - nguoi dung yeu cau
     2026-08-17, xem NHAT_KY_QUYET_DINH.md. Trang mau Tram (kho A4,
     .trang.mau-tram) co CSS ghi de rieng ben lenh-dieu-cong-tac-mau-in.ts
     (11pt) - KHONG bi anh huong boi thay doi nay. */
  .co-quan-chu-quan { font-weight: 400; font-size: 9pt; text-transform: uppercase; white-space: nowrap; }
  .co-quan-ban-hanh { font-weight: 700; font-size: 9pt; text-transform: uppercase; white-space: nowrap; }
  .dong-co-gach { position: relative; display: inline-block; margin-bottom: 2.2mm; }
  /* Do dai duong ke = 1/2 chieu dai dong ten co quan ban hanh phia tren (vd
     "XO SO KIEN THIET AN GIANG") - truoc la 66.667% (ten cu ".gach-2-3" phan
     anh gia tri do), doi thanh 50% + doi ten class cho khop 2026-08-17, nguoi
     dung yeu cau. Xem NHAT_KY_QUYET_DINH.md. */
  .gach-1-2 { position: absolute; left: 50%; bottom: -0.2mm; transform: translateX(-50%); width: 50%; border-bottom: 1px solid #333; }
  .so-hieu { font-size: 9pt; margin-top: 0.5mm; }
  /* Quoc hieu TUNG tang 9->10pt (2026-08-17) nhung bi Rot dong tren kho A5 -
     tra lai 9pt. Tieu ngu VAN giu quy tac "lon hon quoc hieu 1 size" (9+1=10pt).
     Nguoi dung yeu cau 2026-08-17, xem NHAT_KY_QUYET_DINH.md.
     LOI CANH GIUA THAT (phat hien qua cong cu hover "Co chu"): dong quoc
     hieu o white-space:nowrap co do rong TU NHIEN LON HON be rong cot .cot
     thuc te (2 cot chia deu 50/50 nho flex:1 + min-width:0, khong theo do
     rong noi dung) - anh chup cho thay khung do cua cong cu hover chi bao
     het den giua chu "NAM", nghia la text-align:center tren div block binh
     thuong (.cot ke thua xuong) KHONG tran deu 2 ben nhu ky vong.
     Doi sang ky thuat "wrapper text-align:left + span con
     position:relative;left:50%;transform:translateX(-50%)" (giong
     .gach-1-2, nhung do .gach-1-2 dung position:absolute nen khong anh
     huong flow - o day van can .quoc-hieu/.tieu-ngu nam trong flow binh
     thuong de giu dung chieu cao dong, nen dung position:relative). CHU Y
     QUAN TRONG: div bao ngoai (.quoc-hieu, .dong-tieu-ngu) BAT BUOC phai
     tu ghi de "text-align: left" (khong ke thua "center" tu .cot) - neu
     khong, span con (display:inline-block) se bi .cot's text-align:center
     dat vi tri tinh (static position) O GIUA TRUOC, roi lai bi cong them
     left:50% + transform nua, gay LECH GAP DOI (da tu phat hien va sua
     truoc khi bao nguoi dung, xem NHAT_KY_QUYET_DINH.md). Nguoi dung yeu
     cau 2026-08-17 (phat hien qua cong cu hover), xem NHAT_KY_QUYET_DINH.md. */
  .quoc-hieu { text-align: left; }
  .quoc-hieu span {
    display: inline-block;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    font-weight: 700;
    font-size: 9pt;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .dong-tieu-ngu { text-align: left; }
  .tieu-ngu {
    display: inline-block;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    font-weight: 700;
    font-size: 10pt;
    border-bottom: 1px solid #333;
    padding-bottom: 0.3mm;
    margin-top: 0.8mm;
    white-space: nowrap;
  }
  .ngay-ky { font-size: 9pt; font-style: italic; margin-top: 3mm; white-space: nowrap; }
  /* Tieu de chinh (LENH DIEU XE / LENH DIEU CONG TAC / CONG LENH KIEM GIAY DI
     DUONG) 18->14pt (2026-08-17), roi 14->12pt (2026-08-26, nguoi dung yeu
     cau), dung 1 size cho ca 3 loai. Rieng "Phan ke thanh toan"
     (lenh-dieu-cong-tac-mau-in.ts) dung chung class nay nhung KHONG nam trong
     yeu cau, duoc ghi de rieng font-size:18pt tai noi su dung de giu nguyen
     kich thuoc cu - khong bi anh huong boi lan giam nay. */
  .tieu-de-chinh { text-align: center; font-size: 12pt; font-weight: 800; letter-spacing: 1px; margin: 6mm 0 4mm; }
  .khoi-ky { display: flex; justify-content: flex-end; margin-top: 10mm; }
  .khoi-ky-noi-dung { text-align: center; width: 55mm; }
  /* Ca 3 dong khu vuc ky (the thuc TL. GIAM DOC, chuc danh that nguoi ky, ho
     ten nguoi ky) dung CHUNG 1 size 10pt + IN DAM - nguoi dung yeu cau
     2026-08-17 (truoc day 3 dong lech nhau: 10.5pt/800, 9pt/700, 10pt ke
     thua/700). Xem NHAT_KY_QUYET_DINH.md. */
  .chuc-danh-ky { font-weight: 700; font-size: 10pt; text-transform: uppercase; }
  .khoang-trong-ky { height: 20mm; }
  .ho-ten-ky { font-weight: 700; font-size: 10pt; }
  /* Chuc danh THAT cua nguoi ky (vd "Truong phong To chuc - Hanh chinh",
     khac voi .chuc-danh-ky la THE THUC ky nhu "TL. GIAM DOC") - hien NGAY
     DUOI dong the thuc ky (TRUOC khoang trong ky ten), IN HOA + IN DAM (nho
     hon dong the thuc phia tren de van phan biet duoc 2 dong). Nguoi dung
     yeu cau 2026-08-10 (dam duoc them sau khi da doi vi tri duoi TL.GIAM
     DOC), xem NHAT_KY_QUYET_DINH.md. */
  .chuc-danh-nguoi-ky { font-size: 10pt; font-weight: 700; text-transform: uppercase; margin-top: 0.5mm; }
  `;
}

export function khoiLetterhead(soHieu: string, ngayKy: Date, cauHinhDonVi: CauHinhDonVi): string {
  const d = dinhDangNgayVanBan(ngayKy);
  return `
    <div class="tieu-de-tren">
      <div class="cot">
        <div class="co-quan-chu-quan">${thoat(cauHinhDonVi.donViChuQuan)}</div>
        <div class="co-quan-ban-hanh">${thoat(cauHinhDonVi.tenCoQuanDong1)}</div>
        <div class="dong-co-gach">
          <span class="co-quan-ban-hanh">${thoat(cauHinhDonVi.tenCoQuanDong2)}</span>
          <span class="gach-1-2"></span>
        </div>
        <div class="so-hieu">Số: ${thoat(soHieu)}</div>
      </div>
      <div class="cot">
        <div class="quoc-hieu"><span>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</span></div>
        <div class="dong-tieu-ngu"><span class="tieu-ngu">Độc lập - Tự do - Hạnh phúc</span></div>
        <div class="ngay-ky">${thoat(cauHinhDonVi.diaDanh)}, ngày ${d.ngay} tháng ${d.thang} năm ${d.nam}</div>
      </div>
    </div>`;
}

/** chucDanh (chuc danh THAT cua nguoi ky, vd "Truong phong To chuc - Hanh
 * chinh", lay tu NguoiKy.chucDanhKy) hien THEM 1 dong NGAY DUOI dong the
 * thuc ky ("TL. GIAM DOC"), IN HOA - ap dung cho TAT CA khu vuc ky (LDX/
 * LDCT/GDD, ca 2 mau Tuyen thuong lan Tram) vi khoiKy() dung chung 1 noi
 * duy nhat cho moi loai chung tu. Nguoi dung yeu cau 2026-08-10 (vi tri
 * duoi dong the thuc ky, KHONG phai duoi ho ten nhu lan dau lam), xem
 * NHAT_KY_QUYET_DINH.md. */
/** gon=true: THU GON khoang cach (margin-top khoi ky + chieu cao khoang
 * trong danh cho dau/chu ky) bang inline style de UU TIEN hon CSS class dung
 * chung (.khoi-ky/.khoang-trong-ky trong cssLetterheadVaKy(), van giu nguyen
 * gia tri mac dinh cho moi noi con lai) - CHI mat truoc GDD truyen true, va
 * CHI khi Noi di/Noi den qua dai lam bang "Noi di va den" tran sang trang 2
 * (xem noiDungMatTruocGdd, NHAT_KY_QUYET_DINH.md). Khong dung o LDX/LDCT vi
 * 2 loai do khong gap van de nay (LDX luon du cho, LDCT tu dong len A4 khi
 * dai). */
export function khoiKy(theThuc: string, hoTen: string, chucDanh: string, gon = false): string {
  // Muc giam da nhe lai 2026-08-14 (7mm/15mm, truoc la 5mm/12mm) sau khi
  // nguoi dung in thu that thay khoang trong o cuoi trang qua nhieu - xem
  // ghi chu chi tiet o .trang.gdd-gon trong lenh-dieu-cong-tac-mau-in.ts.
  const styleKhoiKy = gon ? ' style="margin-top: 7mm;"' : "";
  const styleKhoangTrong = gon ? ' style="height: 15mm;"' : "";
  return `
    <div class="khoi-ky"${styleKhoiKy}>
      <div class="khoi-ky-noi-dung">
        <div class="chuc-danh-ky">${thoat(theThuc)}</div>
        <div class="chuc-danh-nguoi-ky">${thoat(chucDanh)}</div>
        <div class="khoang-trong-ky"${styleKhoangTrong}></div>
        <div class="ho-ten-ky">${thoat(hoTen)}</div>
      </div>
    </div>`;
}

/**
 * Anh mo (watermark) giua trang - nguon anh + do mo + kich thuoc LAY TU
 * CauHinhDonVi (sua tai /cau-hinh-don-vi), khong con hard-code trong CSS
 * dung chung nua (2026-08-17, xem NHAT_KY_QUYET_DINH.md):
 *   - logoBase64: neu quan tri da tai anh rieng (data URL day du, da kiem
 *     tra dinh dang o Zod schema) thi dung anh do; de trong (null) thi
 *     dung anh logo mac dinh dong san trong assets/logo-cong-ty.png
 *     (layLogoBase64()).
 *   - logoOpacityPhanTram (0-100) quy doi ve opacity CSS (0-1).
 *   - logoKichThuocMm ap dung CHO CA width/height (hinh vuong, giu nguyen
 *     ky thuat object-fit:contain de anh khong bao gio bi meo/tran).
 * AP DUNG THONG NHAT cho MOI mau in (LDX/LDCT ca 3 loai/GDD) - thay the quy
 * tac cu chi mau Tram to hon (120mm) cac mau con lai (80mm).
 */
export function trangMoHinh(cauHinhDonVi: CauHinhDonVi): string {
  const nguonAnh = cauHinhDonVi.logoBase64 || `data:image/png;base64,${layLogoBase64()}`;
  const doMo = cauHinhDonVi.logoOpacityPhanTram / 100;
  const kichThuoc = `${cauHinhDonVi.logoKichThuocMm}mm`;
  return `<img class="hinh-mo" style="width:${kichThuoc}; height:${kichThuoc}; opacity:${doMo};" src="${nguonAnh}" alt="" />`;
}

/**
 * Cong cu XEM HTML DEV (khong phai ban in that) - keo chuot qua mau in hien
 * cho box theo doi chuot voi font-size (px + quy doi pt) cua phan tu dang
 * tro toi, dung khi chinh CSS cac mau in ma khong biet dang la size may
 * (2026-08-17, nguoi dung yeu cau). Chi chen khi endpoint duoc goi voi query
 * ?xemHtml=1 (xem cac *.controller.ts) - mac dinh (khong co query) van tra
 * PDF nhu cu, khong anh huong luong "Xem/In" that cua nguoi dung. KHONG dung
 * de thay the PDF that - CLAUDE.md quy tac #2 van giu nguyen (in that luon
 * qua PdfService/Chromium headless).
 *
 * Mau in hien tai KHONG dung @media print rieng nen HTML render man hinh
 * thuong (che do nay) giong het cach Playwright render sang PDF - font-size
 * xem duoc o day dung 100% voi ban in that.
 */
export function chenCongCuXemPhongChu(html: string): string {
  const script = `
<script>
(function () {
  var box = document.createElement("div");
  box.style.cssText = "position:fixed;z-index:2147483647;background:#111;color:#fff;font:12px/1.4 monospace;padding:4px 8px;border-radius:4px;pointer-events:none;white-space:nowrap;display:none;box-shadow:0 2px 6px rgba(0,0,0,.35);";
  document.body.appendChild(box);

  var banner = document.createElement("div");
  banner.textContent = "Xem HTML (kiểm tra cỡ chữ) — không phải bản in thật, rê chuột để xem font-size";
  banner.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:2147483646;background:#b45309;color:#fff;font:12px/1 sans-serif;padding:6px 10px;text-align:center;";
  document.body.appendChild(banner);
  document.body.style.paddingTop = "26px";

  var phanTuTruoc = null;
  document.addEventListener("mousemove", function (e) {
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el === box || el === banner) return;
    if (phanTuTruoc && phanTuTruoc !== el) phanTuTruoc.style.outline = "";
    if (el !== document.body && el !== document.documentElement) {
      el.style.outline = "1px dashed #dc2626";
      phanTuTruoc = el;
    }
    var cs = getComputedStyle(el);
    var px = parseFloat(cs.fontSize);
    var pt = Math.round(px * 0.75 * 10) / 10;
    var lopDau = el.className && typeof el.className === "string" && el.className.trim()
      ? "." + el.className.trim().split(/\\s+/)[0]
      : "";
    box.textContent = el.tagName.toLowerCase() + lopDau + " — " + px + "px (\\u2248" + pt + "pt)";
    box.style.left = (e.clientX + 14) + "px";
    box.style.top = (e.clientY + 14) + "px";
    box.style.display = "block";
  });
  document.addEventListener("mouseleave", function () {
    box.style.display = "none";
  });
})();
</script>`;
  return html.replace("</body>", `${script}\n</body>`);
}
