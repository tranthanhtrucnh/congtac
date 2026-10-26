import type { CauHinhDonVi } from "@prisma/client";
import { NGUONG_CANH_BAO_NHE_DO_DAI_NOI_DI_DEN } from "@congtac/shared";
import {
  taoCssFontMat,
  layFontFamilyMauIn,
  layTyLeXHeightMauIn,
  thoat,
  khongTachCumTrongNgoac,
  dinhDangNgay,
  dinhDangNgayDiDenMauIn,
  cssLetterheadVaKy,
  khoiLetterhead,
  khoiKy,
  trangMoHinh,
} from "../common/mau-in/mau-in-dung-chung";
import {
  noiDungLenhDieuXe,
  CSS_RIENG_LENH_DIEU_XE,
  type LenhDieuXeNoiDungDeIn,
} from "../lenh-dieu-xe/lenh-dieu-xe-mau-in";

/**
 * Mau in HTML/CSS cho LDCT + LDX lien ket + GDD (2026-08-10) - xay dung tu
 * 5 mau Cong lenh kiem giay di duong that cua cong ty nguoi dung cung cap
 * (xem NHAT_KY_QUYET_DINH.md muc "Mau in LDCT/GDD tu mau that"). Dung chung
 * cau truc "trang" (kho A5/A4) + khoi letterhead voi lenh-dieu-xe-mau-in.ts,
 * nhung KHONG tach chung file CSS day du vi 3 loai trang (LDCT dang bang,
 * GDD mat truoc dang truong+bang, GDD mat sau dang muc I-IV) khac hinh dang
 * nhau kha nhieu - chi tach phan thuc su dung chung (logo/font/thoat/ngay)
 * qua common/mau-in/mau-in-dung-chung.ts.
 *
 * Kho giay: LDCT thuong A5, tu dong sang A4 khi doan dong nguoi/noi dung dai,
 * hoac LUON A4 khi la mau in Tram (loaiMauIn=TRAM, bang co them cot CCCD) -
 * xem chonKhoGiayLenhDieuCongTac. Khi in kem LDX (endpoint "LDCT + LDX"),
 * CA 2 trang dung chung 1 kho giay (kho da chon cho LDCT) de 1 file PDF
 * khong bi doi kho giua chung - danh doi: LDX hiem khi rieng le se co le
 * trong du kho A4 hon binh thuong, chap nhan duoc vi day la file "in gop"
 * tien dung, khong phai file in LDX doc lap (endpoint /lenh-dieu-xe/:id/pdf
 * rieng van luon dung A5). GDD luon co dinh kho A5 (CLAUDE.md).
 */

export type KhoGiayLdct = "A5" | "A4";

/** Nguong don gian: doan dong (>10 nguoi) hoac muc dich/dia diem qua dai
 * thi chuyen LDCT sang A4 cho du cho bang thanh vien - xem doc comment tren
 * dau file. Mau in Tram (loaiMauIn=TRAM) LUON dung A4 du doan it nguoi -
 * bang thanh vien co them cot CCCD nen rong hon, kho A5 de bi chat (nguoi
 * dung yeu cau 2026-08-10, xem NHAT_KY_QUYET_DINH.md). Mau "Phat hanh, thu
 * hoi ve e" (2026-08-12) dung chung nguong do dai voi Tuyen thuong - bang
 * van chi 3 cot nhu Tuyen thuong, khong can luon ep A4 nhu Tram. */
export function chonKhoGiayLenhDieuCongTac(
  soThanhVien: number,
  mucDich: string,
  diaDiemCongTac: string,
  loaiMauIn: LoaiMauInLdct,
): KhoGiayLdct {
  if (loaiMauIn === "TRAM") return "A4";
  // Nguong do dai rieng cho "Phat hanh, thu hoi ve e": cao hon Tuyen thuong
  // (90 -> 150) vi dia diem cong tac o mau nay THUONG dai hon binh thuong
  // (nhieu dia diem/tinh cung luc, vd 7 anh mau that nguoi dung gui: "Can Tho
  // (Ninh Kieu, Vi Tan), An Giang (Rach Gia)..."). Dung chung nguong 90 voi
  // Tuyen thuong lam mau vé ế bi day len A4 qua thuong xuyen ngoai y muon,
  // trong khi nguoi dung xac nhan muon A5 la mac dinh THUC SU cho loai nay
  // (van tu dong len A4 khi that su qua dai, khong bo han quy tac chong tran
  // bang). Nguoi dung yeu cau 2026-08-13, xem NHAT_KY_QUYET_DINH.md.
  const nguongDoDai = loaiMauIn === "PHAT_HANH_THU_HOI_VE_E" ? 150 : 90;
  const noiDungDai = (mucDich?.length ?? 0) + (diaDiemCongTac?.length ?? 0) > nguongDoDai;
  return soThanhVien > 10 || noiDungDai ? "A4" : "A5";
}

function kichThuocTrang(khoGiay: KhoGiayLdct): { rong: string; cao: string } {
  return khoGiay === "A4" ? { rong: "210mm", cao: "297mm" } : { rong: "148mm", cao: "210mm" };
}

/** CSS dung chung cho tat ca trang trong file nay - khung trang (kich thuoc
 * theo kho giay) + letterhead/khoi ky dung chung ca 3 loai chung tu
 * (cssLetterheadVaKy) + CSS rieng cua LDX (chi can khi trang nay co ghep 1
 * trang LDX - xem taoHtmlLenhDieuCongTacVaLenhDieuXe) + bang thanh vien/GDD. */
function cssKhung(
  khoGiay: KhoGiayLdct,
  phongChuMauIn: string | null | undefined,
  tyLeXHeightMauIn: number | null | undefined,
): string {
  const { rong, cao } = kichThuocTrang(khoGiay);
  return `
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    font-family: ${layFontFamilyMauIn(phongChuMauIn)};
    font-size-adjust: ${layTyLeXHeightMauIn(tyLeXHeightMauIn)};
    color: #1a1a1a;
    font-size: 10pt;
    line-height: 1.4;
    /* overflow-wrap:break-word tren CA TRANG (khong chi rieng table) - de
       phong ngua truong hop hiem: 1 chuoi tu do (vd "Dia diem cong tac" in
       trong doan van <p>, khong phai trong bang) dai BAT THUONG va KHONG co
       khoang trang (vi du nguoi dung dan nham 1 chuoi lien tuc) - trinh
       duyet mac dinh khong ngat duoc giua 1 "tu" khong co khoang trang, co
       the day chu tran ra ngoai trang. Voi van ban binh thuong (co dau
       cach) khong anh huong gi, van xuong dong o dau cach nhu cu. Nguoi dung
       hoi 2026-08-10 ve rui ro "Noi di/Noi den qua dai anh huong mau in",
       xem NHAT_KY_QUYET_DINH.md. */
    overflow-wrap: break-word;
  }
  .trang {
    position: relative;
    width: ${rong};
    min-height: ${cao};
    padding: 10mm 10mm 8mm 10mm;
  }
  .trang + .trang { page-break-before: always; }
  ${cssLetterheadVaKy()}
  ${CSS_RIENG_LENH_DIEU_XE}
  table.bang-in { width: 100%; border-collapse: collapse; margin: 4mm 0; font-size: 9pt; }
  /* Rieng bang thanh vien cua LDCT Tuyen thuong + Phat hanh-thu hoi ve e
     (.bang-ldct, xem noiDungTrangLenhDieuCongTacTuyenThuong) - tang tu 9pt
     mac dinh len 10pt, BANG DUNG voi co chu doan van chinh (html/body
     font-size:10pt o tren) thay vi nho hon han nhu truoc. CHI anh huong 2
     loai nay: KHONG dung .bang-ldct o bang Cong lenh kiem giay di duong
     (GDD, van giu 9pt mac dinh - khong phai "mau lenh dieu cong tac"), va
     KHONG anh huong mau Tram (da tu ghi de rieng font-size:11pt bang inline
     style tren chinh the <table>, uu tien hon moi rule CSS o day). Nguoi
     dung phan hoi 2026-08-14 (kem anh mau in that so 12/LDCT): chu trong
     bang nhin nho hon han so voi doan van phia tren. Xem NHAT_KY_QUYET_DINH.md. */
  table.bang-in.bang-ldct { font-size: 10pt; }
  /* overflow-wrap+word-break (2026-08-10) - GIONG HET ky thuat da dung cho
     ".gia-tri" cua mau in LDX rieng le (xem lenh-dieu-xe-mau-in.ts, quyet
     dinh 2026-08-07 "Xu ly truong hop du lieu tu do qua dai") nhung TRUOC DAY
     CHUA duoc ap dung cho rule dung chung nay - nghia la o "Noi di va den"
     cua GDD (noiDungMatTruocGdd) va cot Ho ten/Chuc vu cua bang thanh vien
     LDCT Tuyen thuong (2 noi duy nhat dung table.bang-in ma KHONG co
     white-space:nowrap rieng) truoc gio khong co bao ve nay - 1 chuoi Noi
     di/Noi den/Dia diem RAT dai va khong co khoang trang co the lam bang
     tran ra le trang. Sua 1 lan tai day ap dung DONG THOI cho moi noi dung
     table.bang-in (khong can sua rieng tung noi) - cac cot da co
     white-space:nowrap (vd Ngay sinh/So CCCD mau Tram, Ngay di-ve rieng mau
     Tuyen thuong) khong bi anh huong vi nowrap luon uu tien hon, van giu
     nguyen khong xuong dong (dung, vi day la du lieu dinh dang co dinh,
     khong phai van ban tu do). Xem NHAT_KY_QUYET_DINH.md. */
  table.bang-in th, table.bang-in td { border: 1px solid #333; padding: 2mm 2.5mm; text-align: left; vertical-align: top; overflow-wrap: break-word; word-break: break-word; }
  /* "Nơi đi:"/"Nơi đến:" trong o "Noi di va den" cua bang GDD mat truoc (xem
     dongNoiDiDen()). CACH LAM THU 3 (2026-08-17):
     (1) 5 &nbsp; co dinh - khong thang hang do 2 nhan dai khac nhau.
     (2) padding-left/text-indent AM (thut dong treo kieu "co dien") - GAY
         LOI: ket hop voi table-layout:auto (bang tu tinh do rong cot theo
         noi dung), gia tri text-indent AM lam trinh duyet tinh sai do rong
         cot dau tien, khien nhan "Nơi đi:"/"Nơi đến:" bi day/tran ra NGOAI
         ben trai cua bang (nguoi dung phan hoi kem anh in that, nhan nam
         han ngoai duong vien bang). Da bo hoan toan ky thuat padding-left/
         text-indent AM vi khong an toan voi bang tu dong do rong cot.
     (3) HIEN TAI: dung FLEXBOX thay text-indent - khong co gia tri AM nao,
         an toan voi moi kieu table-layout. Nhan (.nhan-noi-di-den) la 1 flex
         item CO DINH 14mm (flex: 0 0 14mm), gia tri (.gia-tri-noi-di-den) la
         flex item con lai chiem het khong gian thua (flex: 1 1 auto) va TU
         XUONG DONG rieng trong pham vi cua no (min-width:0 de cho phep co
         lai nho hon noi dung dai nhat, ket hop overflow-wrap/word-break da
         co san tu table.bang-in td) - dong xuong dong TU NHIEN nam dung duoi
         dong 1 vi ca 2 cung 1 khoi flex item, khong can meo hack gia tri am.
         14mm van la uoc luong (~1.6mm/ky tu, nhan dai nhat 8 ky tu), CHUA do
         dac tren ban in that (sandbox khong render duoc PDF) - can in thu de
         chinh lai neu lech. Xem NHAT_KY_QUYET_DINH.md. */
  .dong-noi-di-den { display: flex; }
  .dong-noi-di-den .nhan-noi-di-den { flex: 0 0 auto; min-width: 14mm; white-space: nowrap; margin-right: 1mm; }
  .dong-noi-di-den .gia-tri-noi-di-den { flex: 1 1 auto; min-width: 0; }
  /* Nen mo (khong dac #f3f4f6) - de logo mo o giua trang (.hinh-mo, z-index:0)
     van thay xuyen qua duoc hang tieu de bang, thay vi bi che kin hoan toan
     boi nen dac (nguoi dung phat hien 2026-08-10, xem NHAT_KY_QUYET_DINH.md). */
  table.bang-in th { text-align: center; vertical-align: middle; font-weight: 700; background: rgba(243, 244, 246, 0.55); }
  /* Rieng bang mau in Tram (.bang-tram, xem noiDungTrangLenhDieuCongTacTram)
     - dem o hep hon dem mac dinh (2mm 2.5mm) de danh cho van vua 1 trang A4
     du co chu to hon binh thuong (12pt) va nhieu thanh vien - nguoi dung yeu
     cau 2026-08-10, xem NHAT_KY_QUYET_DINH.md.
     vertical-align:middle (ghi de "top" mac dinh dung chung o tren) - nguoi
     dung yeu cau CA BANG canh giua theo chieu doc, khong chi rieng 2 cot
     Nam sinh/So CCCD da co san. Chi doi rieng cho .bang-tram, KHONG dung o
     dau khac (LDX/GDD/LDCT Tuyen thuong van giu "top" nhu truoc, khong bi
     anh huong). Cot Ghi chu (rowspan) van dung ky thuat flexbox rieng (xem
     noiDungTrangLenhDieuCongTacTram) vi vertical-align don thuan khong du
     tin cay voi o gop nhieu hang. 2026-08-10, xem NHAT_KY_QUYET_DINH.md. */
  /* padding dung var()/calc() thay vi mm co dinh - de "co gian" duoc theo
     so thanh vien (--tram-dem-doc/--tram-dem-ngang dat inline tren chinh
     <table>, xem noiDungTrangLenhDieuCongTacTram) ma khong can them 1 class
     "gon" rieng - custom property ke thua binh thuong xuong moi <td>/<th>
     con du padding tu than khong ke thua. Fallback 1.2mm/2mm (gia tri goc)
     ap dung neu khong co inline override (vd cac noi khac lo, khong xay ra
     trong thuc te vi luon dat cung <table>). Nguoi dung yeu cau 2026-08-28,
     xem NHAT_KY_QUYET_DINH.md. */
  table.bang-in.bang-tram th, table.bang-in.bang-tram td { padding: var(--tram-dem-doc, 1.2mm) var(--tram-dem-ngang, 2mm); vertical-align: middle; }
  /* table-layout:fixed - bat buoc do rong cot theo DUNG gia tri khai bao o
     hang <th> dau tien, AP DUNG DONG NHAT cho moi hang du noi dung dai ngan
     khac nhau (mac dinh table-layout:auto chi coi width la GOI Y, co the
     tu dieu chinh khac nhau giua cac hang khi ket hop voi white-space:nowrap
     tren nhieu cot) - dam bao 2 cot NAM SINH/SO CCCD luon dung 1 do rong co
     dinh, thang hang voi nhau qua moi dong.
     width:180mm (thay vi 100%) + margin trai/phai AM (-10mm moi ben) - CHI
     RIENG bang nay duoc "tran" ra ngoai vung le chuan Nghi dinh 30 (20/20/
     30/20mm) cua .trang mot khoang 1cm moi ben (con lai 20mm tinh tu mep
     giay ben trai, 10mm ben phai - van an toan, khong cham mep giay vat ly)
     de co them cho hien thi day du noi dung Nam sinh/So CCCD, trong khi
     phan van ban con lai (doan van, letterhead) van giu dung le chuan. Nguoi
     dung yeu cau 2026-08-10, xem NHAT_KY_QUYET_DINH.md. */
  table.bang-in.bang-tram { table-layout: fixed; width: 180mm; margin: 4mm -10mm; }
  /* Khoi letterhead trang mau Tram (.trang.mau-tram):
     - Can chinh rong 180mm (width: 180mm; margin: 0 -10mm) de tran deu 2 ben
       dong bo voi bang thanh vien (.bang-tram rong 180mm), can doi dep mat tren kho A4.
     - font-size-adjust: none de bo he so phong to x-height (0.53 cua Be Vietnam Pro lam
       chu in hoa Times New Roman bi phong to ~19% thanh ~14.2pt, day dong quoc hieu
       len hon 101mm va lam 2 khoi chen/dinh vao nhau o giua). Voi font-size-adjust: none,
       chu giu dung kich thuoc 12pt that (~87.7mm).
     - Chia cot hop ly: cot trai flex: 0 0 74mm (chua vua cum ten cong ty), cot phai
       flex: 0 0 92mm (chua vua dong quoc hieu), gap: 14mm.
       Ket qua tao khoang cach thuc te ~17mm giua 2 khoi, tach biet ro rang, thoang dep
       va vua van kho giay A4 theo dung yeu cau nguoi dung 2026-10-21. Xem NHAT_KY_QUYET_DINH.md. */
  .trang.mau-tram .tieu-de-tren {
    width: 180mm;
    margin: 0 -10mm;
    line-height: 1.5;
    gap: 14mm;
    font-size-adjust: none;
  }
  .trang.mau-tram .tieu-de-tren .cot:first-child { flex: 0 0 74mm; }
  .trang.mau-tram .tieu-de-tren .cot:last-child { flex: 0 0 92mm; }
  .trang.mau-tram .co-quan-chu-quan,
  .trang.mau-tram .co-quan-ban-hanh,
  .trang.mau-tram .so-hieu,
  .trang.mau-tram .ngay-ky { font-size: 12pt; }
  .trang.mau-tram .quoc-hieu span { font-size: 12pt; }
  .trang.mau-tram .tieu-ngu { font-size: 13pt; }
  /* Khu vuc nguoi ky (the thuc ky, chuc danh that, ho ten) - mac dinh dung
     chung 10pt (cssLetterheadVaKy()) cho ca 3 loai chung tu kho A5, nhung
     trang Tram kho A4 rong hon nen tang len 12pt cho dong bo voi co chu 12pt
     cua noi dung chinh. Nguoi dung yeu cau 2026-08-19, xem NHAT_KY_QUYET_DINH.md. */
  .trang.mau-tram .chuc-danh-ky,
  .trang.mau-tram .chuc-danh-nguoi-ky,
  .trang.mau-tram .ho-ten-ky { font-size: 12pt; }
  /* Khoi rong 55mm (mac dinh dung chung, tinh cho co chu 10pt) khong du cho
     chuc danh nguoi ky dai o co chu 12pt vua tang o tren - vd "PHÓ TRƯỞNG
     PHÒNG TC-HC" (in hoa, dam) bi rot dong lam 2 dong thay vi 1 (nguoi dung
     gui anh minh hoa 2026-08-19). Tang rong 55mm -> 75mm CHI rieng trang Tram
     (kho A4 con nhieu cho, khong anh huong LDX/GDD/LDCT Tuyen thuong van kho
     A5 chat hep). .khoi-ky dung justify-content:flex-end (neo theo canh phai)
     nen tang rong tu dong "day" mep trai cua khoi ra xa hon ve phia trai -
     dung y "doi ve ben trai" nguoi dung yeu cau, khong can them rieng
     margin/transform nao khac. Nguoi dung yeu cau 2026-08-19, xem
     NHAT_KY_QUYET_DINH.md. */
  .trang.mau-tram .khoi-ky-noi-dung { width: 75mm; }
  /* Logo mo (watermark) rieng trang Tram to hon muc dung chung - QUY TAC NAY
     DA BO (2026-08-17), thay bang cau hinh kich thuoc CHUNG cho MOI mau in
     (CauHinhDonVi.logoKichThuocMm, sua tai /cau-hinh-don-vi) gan qua inline
     style ngay tren the <img> (xem trangMoHinh() trong mau-in-dung-chung.ts) -
     inline style co do uu tien cao hon class CSS nen 1 rule ".trang.mau-tram
     .hinh-mo" o day se khong con tac dung gi, da xoa luon de tranh nham lan.
     Nguoi dung phat hien do mo/kich thuoc logo "khong nhu nhau giua cac mau
     in", yeu cau lam thanh cau hinh chung, xem NHAT_KY_QUYET_DINH.md. */
  /* GDD mat truoc "gon" (.gdd-gon, xem noiDungMatTruocGdd) - CHI kich hoat
     khi Noi di/Noi den qua dai lam bang "Noi di va den" xuong nhieu dong,
     day tong chieu cao trang vuot qua 1 trang A5 co dinh (GDD KHONG duoc tu
     dong doi sang A4 nhu LDCT khi noi dung dai - CLAUDE.md quy dinh GDD LUON
     A5). Giam line-height CA TRANG la don bay lon nhat vi anh huong DONG THOI
     moi dong van ban/moi hang bang, khong chi rieng 1 vai cho; ket hop giam
     dem bang va giam khoang cach khoi ky (xem tham so gon cua khoiKy() trong
     mau-in-dung-chung.ts, goi tu noiDungMatTruocGdd).
     Muc giam DA CHINH LAI 2026-08-14 (nguoi dung in thu that voi vi du "Đồng
     Tháp (Cao Lãnh, Mỹ Tho), Tây Ninh (Long An), TP. Hồ Chí Minh") - lan dau
     dung 1.4->1.15 + dem 2mm 2.5mm->1mm 2mm qua tay, keo theo 1 khoang trong
     rat lon o cuoi trang (thu gon nhieu hon muc can thiet thuc te). Giam nhe
     lai con 1.4->1.28 + dem 2mm 2.5mm->1.5mm 2.2mm - van du de khong tran
     trang 2 nhu truoc, nhung khong con lang phi khoang trong o duoi. CHUA co
     cong cu do dac chinh xac (sandbox lam viec cua Claude khong render duoc
     PDF that, xem quyet dinh 2026-08-07 "Buoc 7 lo trinh") nen day van la
     ĐIỀU CHỈNH THEO PHẢN HỒI THỰC TẾ tung buoc, chua phai cong thuc toan hoc
     chinh xac - neu sau nay gap noi dung dai hon nua ma van thua nhieu
     khoang trong, co the giam tiep; neu tran lai, tang lai nhe. Xem
     NHAT_KY_QUYET_DINH.md. */
  .trang.gdd-gon { line-height: 1.28; }
  .trang.gdd-gon table.bang-in th,
  .trang.gdd-gon table.bang-in td { padding: 1.5mm 2.2mm; }
  /* GDD mat truoc: bo cuc chia 4 hang tu dong sat mep in A5 doc (2026-10-26, nguoi dung yeu cau) */
  .trang.gdd-mat-truoc {
    height: 210mm;
    max-height: 210mm;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }
  .trang.gdd-mat-truoc .noi-dung {
    flex: 1 1 auto;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .trang.gdd-mat-truoc .bang-tu-dong {
    flex: 1 1 auto;
    height: 100%;
    margin: 4mm 0 0 !important;
  }
  .trang.gdd-mat-truoc .bang-tu-dong tbody tr {
    height: 25%;
  }
  .trang.gdd-mat-truoc .bang-tu-dong tbody tr td {
    height: auto !important;
  }
  `;
}

function boc(
  khoGiay: KhoGiayLdct,
  tieuDe: string,
  noiDungTrang: string,
  phongChuMauIn: string | null | undefined,
  tyLeXHeightMauIn: number | null | undefined,
): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8" />
<title>${thoat(tieuDe)}</title>
<style>
  ${taoCssFontMat(phongChuMauIn)}
  ${cssKhung(khoGiay, phongChuMauIn, tyLeXHeightMauIn)}
</style>
</head>
<body>
${noiDungTrang}
${SCRIPT_DO_VACH_DUOI_TIEU_DE}
</body>
</html>`;
}

// Chay TRONG chinh ban in that (khac voi chenCongCuXemPhongChu() - do chi
// chen o che do debug ?xemHtml=1). Muc dich: dat do rong ".vach-duoi-tieu-de"
// (duong ke duoi cum tieu de LDCT) = 1 nua do rong DONG CUOI CUNG cua cum tieu
// de SAU KHI trinh duyet da xuong dong that - khong the biet truoc gia tri
// nay luc tao HTML o server vi phu thuoc do rong font thuc te + cach trinh
// duyet ngat dong. Uu tien do theo ".dia-diem-de-do-dong" (lenh loai "ve e",
// co phu de) - lenh THUONG (khong co phu de, chi 1 dong "LENH DIEU CONG TAC")
// khong co span nay nen ROI xuong do theo chinh ".tieu-de-chinh" (nguoi dung
// phan hoi 2026-08-26: lenh thuong dang bi vach 50% CA TRANG, qua dai so voi
// 1 dong tieu de ngan). An toan de chay trong luong PDF that: PdfService dung
// trang.setContent(html, { waitUntil: "load" }), script khong co
// "defer"/"async" nen chay dong bo TRUOC khi su kien "load" ban ra - dam bao
// co ket qua truoc khi Playwright chup PDF. Vo hai/tu bo qua o trang LDX/GDD
// (khong co ca 2 class nay). Nguoi dung yeu cau 2026-08-26, xem
// NHAT_KY_QUYET_DINH.md.
const SCRIPT_DO_VACH_DUOI_TIEU_DE = `<script>
(function () {
  document.querySelectorAll(".trang").forEach(function (trang) {
    var dd = trang.querySelector(".dia-diem-de-do-dong") || trang.querySelector(".tieu-de-chinh");
    var vach = trang.querySelector(".vach-duoi-tieu-de");
    if (!dd || !vach) return;
    var range = document.createRange();
    range.selectNodeContents(dd);
    var rects = range.getClientRects();
    if (!rects.length) return;
    var rongDongCuoi = rects[rects.length - 1].width;
    if (rongDongCuoi > 0) vach.style.width = (rongDongCuoi / 2) + "px";
  });
})();
</script>`;

// ---------------------------------------------------------------------------
// LENH DIEU CONG TAC (trang danh sach doan + chu ky) - theo mau that
// "LỆNH ĐIỀU CÔNG TÁC": doan van "Giám đốc ... phân công nhiệm vụ đi công
// tác tại ..." + bang STT/HỌ VÀ TÊN/CHỨC VỤ + chu ky TL.GIAM DOC. Mau that
// KHONG co letterhead tren trang nay (chi la phu luc kem theo LDX/GDD da co
// letterhead rieng) nhung LDCT co so hieu rieng trong CSDL (dung lam can cu
// tren footer GDD) nen VAN in letterhead + so hieu de dam bao gia tri phap
// ly doc lap cua chung tu - xem NHAT_KY_QUYET_DINH.md.
// ---------------------------------------------------------------------------

export interface ThanhVienDeIn {
  hoTen: string;
  chucVu: string;
  cccd: string;
  /// Chup luc them vao doan - co the null cho ban ghi tao truoc khi co
  /// truong nay (chi dung o mau in Tram, xem noiDungTrangLenhDieuCongTacTram).
  ngaySinh: Date | null;
  laTruongDoan: boolean;
  ngayDiRieng: Date | null;
  ngayVeRieng: Date | null;
  /// True neu day la thanh vien duoc chon lam tai xe cua LDX con dang hoat
  /// dong (so khop thanhVienTaiXeId, tinh o layDuLieuInLenh()). CHI dung o
  /// mau Tuyen thuong/Ve e de ghi de cot Chuc vu thanh "Nhân viên Lái xe"
  /// (xem noiDungTrangLenhDieuCongTacTuyenThuong) - khop anh mau that so 337
  /// nguoi dung gui 2026-08-13, khong dung chuc vu thuc te ghi trong ho so
  /// (vd "Nhan vien") ma in dung nhiem vu lai xe cho chuyen di nay.
  laTaiXe: boolean;
}

export type LoaiMauInLdct = "TUYEN_THUONG" | "TRAM" | "PHAT_HANH_THU_HOI_VE_E";

export interface LenhDieuCongTacDeIn {
  soHieu: string;
  ngayKy: Date;
  ngayDi: Date;
  ngayVe: Date;
  diaDiemCongTac: string;
  /// Chi doc o mau "Phat hanh, thu hoi ve e" (phu de duoi tieu de + cau van
  /// than bai) - mau Tuyen thuong/Tram KHONG dung truong nay khi in, du Zod
  /// van bat buoc nhap o moi loai lenh. Xem
  /// noiDungTrangLenhDieuCongTacTuyenThuong.
  mucDich: string;
  canCu: string | null;
  nguoiKyHoTen: string;
  nguoiKyChucDanh: string;
  nguoiKyTheThuc: string;
  /// TRAM = tieu de phu co gach chan co dinh + bang 6 cot Nam sinh/CCCD/
  /// Nhiem vu/Ghi chu, cau van rieng (xem noiDungTrangLenhDieuCongTacTram).
  /// PHAT_HANH_THU_HOI_VE_E = giong TUYEN_THUONG (STT/Ho ten/Chuc vu, khong
  /// cot Ngay di-ve rieng) nhung them phu de + cau van co nhac Muc dich (xem
  /// noiDungTrangLenhDieuCongTacTuyenThuong). Tu chon luc lap, xem
  /// NHAT_KY_QUYET_DINH.md muc "Truong doan + CCCD trong mau in LDCT" va muc
  /// "Mau in Phat hanh, thu hoi ve e".
  loaiMauIn: LoaiMauInLdct;
}

/** O nhap "Can cu" TRUOC DAY bi an khoi form Lap/Sua ("gon giao dien", xem
 * doc comment tren LenhDieuCongTac.canCu trong schema.prisma) nen luon rong,
 * khong ai phat hien mau in "thieu cac dong Can cu" cho den khi doi chieu
 * voi file mau that "LENH DIEU CONG TAC TP.HCM (Quốc).docx" nguoi dung gui
 * (2026-08-10) - file that co 2 doan "Căn cứ ...;" RIENG BIET. Dung chung
 * cho ca mau Tuyen thuong (nguon: lenh.canCu, tung lenh nhap rieng - hien
 * form van an) lan mau Tram (nguon: cauHinhDonVi.canCuMauTram, dung CHUNG
 * cho moi lenh Tram, sua o /cau-hinh-don-vi).
 *
 * TRUOC DAY ham nay TU DONG them tien to "Căn cứ " va dau ";" cuoi moi dong
 * (nguoi dung chi go phan giua). Doi lai (2026-08-10) theo yeu cau ro rang
 * cua nguoi dung: KHONG con tu them gi ca, in NGUYEN VAN tung dong nguoi
 * dung go (chi trim + thoat HTML + boc <p>) - de nguoi dung tu chu hoan
 * toan chu "Căn cứ"/dau cham phay co xuat hien hay khong, o dau trong cau.
 * Xem placeholder moi trong apps/web/app/cau-hinh-don-vi/page.tsx va
 * NHAT_KY_QUYET_DINH.md. canhDeu=true chi dung cho mau Tram theo yeu cau
 * canh deu 2 bien. */
function canCuHtml(canCu: string | null, canhDeu = false): string {
  if (!canCu) return "";
  const styleCanhDeu = canhDeu ? " text-align: justify;" : "";
  return canCu
    .split("\n")
    .map((dong) => dong.trim())
    .filter(Boolean)
    .map((dong) => `<p style="margin: 0 0 2mm; text-indent: 8mm;${styleCanhDeu}">${thoat(dong)}</p>`)
    .join("");
}

/** Tinh khoang ngay di-ve HIEU LUC cua 1 thanh vien (rieng neu co, khong thi
 * theo doan) - dung lam CA khoa gom nhom LAN noi dung cot Ghi chu, de dam
 * bao 2 gia tri nay luon khop nhau (gom nhom dung ra thi merge o cung dung
 * theo, khong lech). */
function khoangNgayHieuLuc(tv: ThanhVienDeIn, lenh: LenhDieuCongTacDeIn): { batDau: Date; ketThuc: Date } {
  return {
    batDau: tv.ngayDiRieng ?? lenh.ngayDi,
    ketThuc: tv.ngayVeRieng ?? lenh.ngayVe,
  };
}

/** Chuoi hien thi cot "Ghi chu" mau Tram - TRUOC DAY chi hien khi thanh vien
 * co ngay rieng khac doan (ngayDiRieng/ngayVeRieng khac null), nhung doi
 * chieu lai file mau that thi MOI dong (ke ca truong doan, khong co override)
 * deu hien "Từ ngày ... đến ngày ..." theo khoang hieu luc - sua thanh luon
 * tinh, khong con dieu kien nua (2026-08-10, xem NHAT_KY_QUYET_DINH.md). */
function ghiChuTram(tv: ThanhVienDeIn, lenh: LenhDieuCongTacDeIn): string {
  const { batDau, ketThuc } = khoangNgayHieuLuc(tv, lenh);
  return `Từ ngày ${dinhDangNgayDiDenMauIn(batDau)} đến ngày ${dinhDangNgayDiDenMauIn(ketThuc)}`;
}

/** Ban HTML cua ghiChuTram() - dung rieng luc render (khac voi ban text thuan
 * cua ghiChuTram(), van giu nguyen de lam khoa gom nhom/so sanh).
 *
 * LICH SU: ban dau "Từ ngày dd/mm/yyyy đến ngày dd/mm/yyyy" 1 dong, sau do
 * ep xuong dong 1 lan truoc "đến ngày" (2 dong) - van bi trinh duyet tu ngat
 * THEM giua so ("03/9/202" / "6") vi cot GHI CHU qua hep so voi ca cum
 * nhan+gia tri; roi tach han 4 dong co dinh (nhan/gia tri rieng dong) de
 * chan loi ngat giua so - nhung ban 4 dong nay LAI dinh 1 loi flexbox khac
 * (min-width:auto lam nhan "Từ ngày"/"đến ngày" vo tung ky tu, xem fix
 * min-width:0 cung ngay 2026-08-28).
 *
 * Nguoi dung yeu cau don gian hoa lai (2026-08-28): bo chu "đến ngày", chi
 * giu "Từ" truoc ngay di roi noi sang ngay den bang dau "->" (dinh dang
 * chot: "Từ {ngày đi} -> {ngày đến}") - ngan gon hon nhieu so voi ban "4
 * dong co dinh" truoc do (~1 dong thay vi 4 dong), giam dang ke chieu cao
 * o/kha nang tran trang, ma van giu duoc chu "Từ" mo dau theo yeu cau. Van
 * boc ngay trong <span white-space:nowrap> de dam bao BAT KY diem ngat nao
 * (neu ca cum qua dai so voi cot) cung roi dung vao khoang trang quanh
 * "Từ"/"->" - khong bao gio ngat giua so. Xem NHAT_KY_QUYET_DINH.md. */
function ghiChuTramHtml(tv: ThanhVienDeIn, lenh: LenhDieuCongTacDeIn): string {
  const { batDau, ketThuc } = khoangNgayHieuLuc(tv, lenh);
  const ngayDi = `<span style="white-space:nowrap;">${dinhDangNgayDiDenMauIn(batDau)}</span>`;
  const ngayVe = `<span style="white-space:nowrap;">${dinhDangNgayDiDenMauIn(ketThuc)}</span>`;
  // "-&gt;" (2 ky tu "-" + ">") TRUOC DAY khong boc nowrap rieng - dau "-" la
  // 1 diem ngat dong HOP LE mac dinh trong hau het trinh duyet (giong nhu tu
  // ghep co gach ngang), nen trinh duyet co the ngat NGAY GIUA "-" va ">"
  // (thanh "-" / ">" 2 dong khac nhau) khi cot qua hep - nguoi dung phat hien
  // qua anh in that (2026-08-31): "Từ 07/9/2026 -" xuong dong con "> 11/9/2026".
  // Boc them 1 nowrap rieng cho CHINH mui ten (khac voi 2 nowrap cua ngayDi/
  // ngayVe da co san) de dam bao "->" luon la 1 khoi khong the tach doi -
  // diem ngat van co the roi vao khoang trang QUANH mui ten (truoc/sau, dung
  // y dinh ban dau ghi trong doc comment ham nay), chi khong con ngat DUOC
  // NGAY GIUA 2 ky tu cua no nua.
  const muiTen = `<span style="white-space:nowrap;">-&gt;</span>`;
  return `Từ ${ngayDi} ${muiTen} ${ngayVe}`;
}

/** Sap xep lai danh sach thanh vien mau Tram truoc khi in: gom nhom theo
 * khoang ngay di-ve hieu luc (cung khoang = cung nhom), dua nhom CUA TRUONG
 * DOAN len dau tien (trong nhom do, truong doan cung len dau), cac nhom con
 * lai giu nguyen thu tu xuat hien ban dau - de nhung nguoi co cung ngay voi
 * truong doan noi gan nhau, chuan bi cho buoc merge o (rowspan) o cot Ghi
 * chu ngay sau (2 thanh vien LIEN TIEP cung 1 nhom moi merge duoc, nen phai
 * gom nhom/sap xep TRUOC khi build hang bang). Xem NHAT_KY_QUYET_DINH.md. */
function sapXepGomNhomTram(thanhVien: ThanhVienDeIn[], lenh: LenhDieuCongTacDeIn): ThanhVienDeIn[] {
  const khoaCua = (tv: ThanhVienDeIn) => {
    const { batDau, ketThuc } = khoangNgayHieuLuc(tv, lenh);
    return `${new Date(batDau).getTime()}|${new Date(ketThuc).getTime()}`;
  };

  const nhomTheoKhoa = new Map<string, ThanhVienDeIn[]>();
  for (const tv of thanhVien) {
    const khoa = khoaCua(tv);
    const nhom = nhomTheoKhoa.get(khoa);
    if (nhom) nhom.push(tv);
    else nhomTheoKhoa.set(khoa, [tv]);
  }

  const truongDoan = thanhVien.find((tv) => tv.laTruongDoan);
  const khoaTruongDoan = truongDoan ? khoaCua(truongDoan) : null;

  // Trong nhom cua truong doan, dua truong doan len vi tri dau.
  if (khoaTruongDoan) {
    const nhom = nhomTheoKhoa.get(khoaTruongDoan)!;
    const viTri = nhom.findIndex((tv) => tv.laTruongDoan);
    if (viTri > 0) nhom.unshift(nhom.splice(viTri, 1)[0]);
  }

  // Map giu thu tu insertion (= thu tu xuat hien lan dau) - chi can dua khoa
  // cua truong doan len dau danh sach khoa, giu nguyen thu tu cac khoa khac.
  const thuTuKhoa = khoaTruongDoan
    ? [khoaTruongDoan, ...[...nhomTheoKhoa.keys()].filter((k) => k !== khoaTruongDoan)]
    : [...nhomTheoKhoa.keys()];

  return thuTuKhoa.flatMap((khoa) => nhomTheoKhoa.get(khoa)!);
}

/** Dieu phoi theo loaiMauIn - TRAM khac han 2 loai con lai (tieu de phu co
 * dinh, bo cuc bang 6 cot, doan van, cau ket) nen tach han 1 ham rieng. Con
 * TUYEN_THUONG va PHAT_HANH_THU_HOI_VE_E dung CHUNG 1 ham (chi khac phan
 * tieu de + cau mo dau, bang/khoi ky giong het nhau) - xem
 * noiDungTrangLenhDieuCongTacTuyenThuong. Xem NHAT_KY_QUYET_DINH.md muc
 * "Truong doan + CCCD trong mau in LDCT" (ban dau) va muc bo sung dung mau
 * that "LENH DIEU CONG TAC TP.HCM (Quốc).docx" nguoi dung gui (2026-08-10),
 * va muc "Mau in Phat hanh, thu hoi ve e" (2026-08-12). */
function noiDungTrangLenhDieuCongTac(
  lenh: LenhDieuCongTacDeIn,
  thanhVien: ThanhVienDeIn[],
  cauHinhDonVi: CauHinhDonVi,
  khoGiay: KhoGiayLdct,
): string {
  return lenh.loaiMauIn === "TRAM"
    ? noiDungTrangLenhDieuCongTacTram(lenh, thanhVien, cauHinhDonVi)
    : noiDungTrangLenhDieuCongTacTuyenThuong(lenh, thanhVien, cauHinhDonVi, khoGiay);
}

/** Dung CHUNG cho 2 loai mau in TUYEN_THUONG va PHAT_HANH_THU_HOI_VE_E - bang
 * thanh vien/khoi ky giong het nhau (STT/Ho va ten/Chuc vu, khong CCCD), chi
 * khac o phan tieu de + cau van mo dau + 1 cot bang. Tach thanh ham rieng
 * (thay vi trung voi Tram, xem noiDungTrangLenhDieuCongTacTram) vi day THUC
 * SU la 2 dang cua CUNG 1 bo cuc - viet trung 90% code chi de doi 2 dong se
 * kho bao tri hon la 1 ham co nhanh dieu kien nho. Xem NHAT_KY_QUYET_DINH.md
 * muc "Mau in Phat hanh, thu hoi ve e" (2026-08-12).
 *
 * PHAT_HANH_THU_HOI_VE_E them 2 diem so voi TUYEN_THUONG (doi chieu 7 anh
 * mau LDCT that "Phat hanh ve, thu tien, nhan ve trung va ve e" nguoi dung
 * cung cap 2026-08-12):
 * 1. Phu de 2 dong duoi tieu de chinh - lay NGUYEN VAN o Muc dich (dong 1) va
 *    Noi den/dia diem cong tac (dong 2) da co san trong form, KHONG hardcode
 *    cau chu co dinh (nguoi dung chon vay de linh hoat duoc ca truong hop
 *    chi "phat hanh" hoac chi "thu hoi ve e" rieng, khong bat buoc dung y
 *    chang 1 cau). Dung lai chinh gia tri Muc dich cho ca phu de LAN cau van
 *    than bai (khong tach 2 chuoi rieng) - anh mau that co sai khac nho giua
 *    2 cho (vd phu de "...nhận vé trúng và vé ế", than bai "...thu vé ế"),
 *    nhung day nhieu kha nang chi la go tay khong nhat quan cua quy trinh cu
 *    (giong van de "Noi den" da chuan hoa truoc do) - KHONG lap lai su thieu
 *    nhat quan nay.
 * 2. Cau van than bai doi tu "phân công nhiệm vụ đi công tác tại X." thanh
 *    "điều động và phân công nhiệm vụ đi công tác {Muc dich, chu dau viet
 *    thuong} tại X." - mau Tuyen thuong TRUOC DAY hoan toan khong dung
 *    truong Muc dich khi in du form da thu thap tu truoc.
 * Bang thanh vien KHONG co cot "Ngay di - ve (rieng)" (khac Tuyen thuong) -
 * dung 3 cot dung nhu 7 anh mau that, don gian hoa. Truong doan (laTruongDoan,
 * dung chung field voi mau Tram) neu duoc danh dau thi in DAM ca dong nhu
 * Tram, nhung GIU NGUYEN chuc vu that o cot Chuc vu (khong ghi de thanh nhan
 * "Trưởng đoàn" nhu Tram, vi cot nay dang hien chuc vu that cua tung nguoi). */
// hangChucVu() (uu tien chuc vu cao len dau bang thanh vien mau Tuyen
// thuong/Phat hanh-thu hoi ve e, chot 2026-08-17) DA XOA 2026-08-31 - nguoi
// dung yeu cau BO HAN sap xep theo chuc vu, in dung theo thu tu da chon/nhap
// (xem doc comment o thanhVienDaSapXep trong noiDungTrangLenhDieuCongTacTuyenThuong()
// ben duoi). Ham nay khong con noi nao goi toi nen xoa han (khong de code
// chet), khong dung o mau Tram (sapXepGomNhomTram dung khoa rieng theo
// khoang ngay, khong lien quan ham nay). Xem NHAT_KY_QUYET_DINH.md.

// Viet tat ten phong ban CHI luc hien thi tren bang thanh vien cua LDCT (cot
// CHUC VU chat cho, xem doRongCotHoTen ben duoi) - KHONG con xay ra o buoc
// snapshot nua (xem chucVuKemPhongBan() trong lenh-dieu-cong-tac.service.ts,
// sua 2026-08-19) de GDD (Cong lenh kiem Giay di duong, doc thang tu cung 1
// truong ThanhVienLenhDieuCongTac.chucVu) luon hien FULL ten phong ban, dung
// khong gian con trong tren mau GDD. Khop CHINH XAC (khong phan biet hoa/
// thuong, chuan hoa moi kieu gach ngang ve "-") theo TEN PHONG BAN CU THE cua
// cong ty - khong phai quy tac viet tat tu dong chung. Phong ban KHONG co
// trong danh sach nay giu NGUYEN ten day du (ca o day lan o GDD). Them dong
// moi vao day khi co phong ban moi can viet tat.
const VIET_TAT_PHONG_BAN: Record<string, string> = {
  "phòng kế hoạch - kinh doanh": "Phòng KH-KD",
  "phòng trả thưởng - kho quỹ": "Phòng TT-KQ",
  // "Phòng Tài vụ - Kế toán" -> "Phòng TV-KT": doi tu "Phòng Kế toán" (rut
  // gon ten, khong phai viet tat) sang dung viet tat chu cai dau nhu 3 phong
  // con lai - nguoi dung yeu cau dong bo lai 2026-08-31.
  "phòng tài vụ - kế toán": "Phòng TV-KT",
  // Nguoi dung yeu cau them 2026-08-31 (truoc do "Nhân viên" duoc viet tat
  // thanh "NV" nham - da bi tu choi, CHI viet tat ten phong, giu nguyen
  // "Nhân viên" day du, xem apDungVietTatPhongBanLucInLdct).
  "phòng tổ chức - hành chính": "Phòng TC-HC",
};

/** Tim doan van ban KHOP CHINH XAC (khong phan biet hoa/thuong, chuan hoa
 * gach ngang) voi 1 trong cac ten phong ban day du o VIET_TAT_PHONG_BAN BEN
 * TRONG chuoi chucVu (vd "Nhân viên Phòng Trả thưởng - Kho quỹ"), roi thay
 * THUAN TUY doan do bang ban viet tat, giu nguyen phan con lai (vd "Nhân
 * viên "). Dua vao viec chuan hoa (lowercase + gach ngang) KHONG doi do dai
 * chuoi (1-doi-1 ky tu) nen vi tri/do dai tim duoc tren ban chuan hoa AP DUNG
 * DUNG len ban goc chua chuan hoa - tranh phai viet lai toan bo chuoi. */
function apDungVietTatPhongBanLucInLdct(chucVu: string): string {
  const chuanHoa = chucVu.replace(/[‒–—―]/g, "-").toLowerCase();
  for (const [tenDayDu, vietTat] of Object.entries(VIET_TAT_PHONG_BAN)) {
    const viTri = chuanHoa.indexOf(tenDayDu);
    if (viTri !== -1) {
      return chucVu.slice(0, viTri) + vietTat + chucVu.slice(viTri + tenDayDu.length);
    }
  }
  return chucVu;
}

function noiDungTrangLenhDieuCongTacTuyenThuong(
  lenh: LenhDieuCongTacDeIn,
  thanhVien: ThanhVienDeIn[],
  cauHinhDonVi: CauHinhDonVi,
  khoGiay: KhoGiayLdct,
): string {
  const laVeE = lenh.loaiMauIn === "PHAT_HANH_THU_HOI_VE_E";
  // Le trang: nguoi dung yeu cau canh le + canh deu 2 ben giong anh mau that
  // (2026-08-12). CHI ap dung le Nghi dinh 30 (20/20/30/20mm, giong mau Tram
  // da lam truoc do) khi trang la KHO A4 - giu nguyen le gon 10mm mac dinh
  // (tu cssKhung() dung chung) khi khong the biet chac se la A5, vi khoi
  // letterhead 2 cot dung chung voi LDX TUNG thu dung le Nghi dinh 30 tren
  // kho A5 va phai HOI LAI (chu 7-8pt qua nho, kho doc - xem quyet dinh
  // 2026-08-07 "Rut lai") - Tuyen thuong/Ve e cung dung chung 1 khoi
  // letterhead nay nen se gap dung van de tuong tu neu ep le rong tren A5.
  // Nguoi dung xac nhan chon phuong an nay (giu le gon nhu mau A5 da gui) khi
  // duoc hoi. Xem NHAT_KY_QUYET_DINH.md.
  const leTrang = khoGiay === "A4" ? ' style="padding: 20mm 20mm 20mm 30mm;"' : "";

  // "các đồng chí" (Tuyen thuong, anh mau 353/326) vs "các Đ/c" viet tat (Phat
  // hanh/thu hoi ve e, 7 anh mau) - 2 anh mau that dung 2 cach goi khac nhau,
  // giu dung nguyen van tung loai thay vi dung chung 1 cach viet.
  const cungNgayDoan = new Date(lenh.ngayDi).toDateString() === new Date(lenh.ngayVe).toDateString();
  const cumDongChi = laVeE ? "Đ/c" : "đồng chí";
  const cauNgay = cungNgayDoan
    ? `Ngày <strong>${dinhDangNgayDiDenMauIn(new Date(lenh.ngayDi))}</strong> gồm có các ${cumDongChi} sau đây:`
    : `Từ ngày <strong>${dinhDangNgayDiDenMauIn(new Date(lenh.ngayDi))}</strong> đến ngày <strong>${dinhDangNgayDiDenMauIn(new Date(lenh.ngayVe))}</strong> gồm có các ${cumDongChi} sau đây:`;

  // Chu dau viet thuong khi long vao giua cau (vd "Công tác" -> "công tác")
  // de doc tu nhien, khong doi cac chu con lai (giu nguyen viet hoa ten
  // rieng dia danh... neu co trong Muc dich).
  const mucDichGiuaCau = lenh.mucDich ? lenh.mucDich.charAt(0).toLowerCase() + lenh.mucDich.slice(1) : "";

  // Ten cong ty trong CAU VAN (khac han khoi letterhead) - KHONG ghep tu
  // cauHinhDonVi.tenCoQuanDong1/2 (2 truong nay luu san VIET HOA TOAN BO
  // rieng cho khoi letterhead/quoc hieu, vd "CÔNG TY TNHH MỘT THÀNH VIÊN" +
  // "XỔ SỐ KIẾN THIẾT AN GIANG" - ghep thang vao giua 1 cau van thuong se ra
  // ca cum HOA LON giua cau, sai the thuc). Doi chieu 2 anh mau that "Tuyen
  // thuong" (Lenh 353, 326) VA 7 anh mau "Phat hanh, thu hoi ve e" nguoi
  // dung gui (2026-08-12) deu dung dung 1 cum co dinh dang thuong "Công ty
  // TNHH MTV Xổ số kiến thiết An Giang" trong cau van - hardcode giong cach
  // mau Tram da lam truoc do (xem NHAT_KY_QUYET_DINH.md muc "Mau in Tram:
  // hardcode dong Giam doc Cong ty..."), CHI khac o chu "K" thuong (mau Tram
  // dung "Kiến thiết" hoa K theo yeu cau rieng luc do, 2 mau con lai dung
  // "kiến thiết" thuong theo dung anh mau that cua chinh no - khong doi lai
  // cho giong Tram vi 2 loai chung tu khac nhau, tung anh mau that da ghi ro
  // the nao dung y nhu vay).
  const tenCongTyTrongCau = "Công ty TNHH MTV Xổ số kiến thiết An Giang";

  // Cau mo dau (doan van, KHONG in dam) - rieng phan "Phat hanh ve, thu
  // tien..." VAN in dam o cho hien thi thu 2 (phuDe, tieu de phu duoi tieu
  // de chinh, 14pt) nhu truoc. Truoc do ca cum muc dich + dia diem trong cau
  // mo dau nay CUNG bi bam <strong> - nguoi dung yeu cau bo, chi de van ban
  // thuong (khong dam) o day. Nguoi dung yeu cau 2026-08-17, xem
  // NHAT_KY_QUYET_DINH.md.
  // Neu "Dia diem cong tac" duoc dien tu 1 chuoi "thuong dung" da co san
  // xuong dong THU CONG trong Cau hinh don vi (o nguoi dung tu go Enter ngat
  // dong cho tung tuyen khi soan chuoi goi y, xem chuoiDiaDiemThuongDungVeE) -
  // DUNG NGUYEN cach ngat dong do (moi dong 1 <br/> rieng), KHONG tu dong
  // dieu chinh gi them (khongTachCumTrongNgoac/nen chu) - nguoi dung yeu cau
  // 2026-08-26: "tuyen da dien san co xuong hang trong cau hinh thi su dung
  // lai, khong tu dieu chinh". Chi khi KHONG co xuong dong thu cong (nhap tu
  // do 1 dong) moi ap dung co che tu tranh ngat dong xau nhu truoc.
  const dongDiaDiem = lenh.diaDiemCongTac
    .split(/\r?\n/)
    .map((dong) => dong.trim())
    .filter(Boolean);
  const coXuongDongThuCong = dongDiaDiem.length > 1;
  const diaDiemHtml = coXuongDongThuCong
    ? dongDiaDiem.map((dong) => thoat(dong)).join("<br/>")
    : khongTachCumTrongNgoac(thoat(lenh.diaDiemCongTac));

  // Dia diem dung trong CAU MO DAU ("Giam doc... dieu dong...") KHONG dung
  // xuong dong thu cong (diaDiemHtml) du config co \n - nguoi dung yeu cau
  // 2026-08-26: o day la 1 cau van xuoi binh thuong, dia diem phai noi tiep
  // lien mach, chi de trinh duyet tu xuong dong khi het cho (nhu 1 doan van).
  // Xuong dong thu cong CHI danh rieng cho PHU DE (dia-diem-de-do-dong, trinh
  // bay dang khoi giua trang, tung dong 1 tuyen) - xem diaDiemHtml/phuDe.
  const diaDiemCauVan = khongTachCumTrongNgoac(thoat(dongDiaDiem.join(" ")));

  // Nhanh "thuong" (khong phai laVeE) truoc day CON SOT <strong> quanh dia
  // diem cong tac - dung ra phai bo GIONG HET nhanh laVeE ben tren (ca cum
  // muc dich + dia diem trong cau mo dau deu KHONG in dam, nguoi dung da yeu
  // cau 2026-08-17, xem doc comment dau ham noiDungTrangLenhDieuCongTacTuyenThuong()).
  // Nguoi dung phat hien lai 2026-08-31 (kem anh mau in that), sua dut diem:
  // bo <strong>, VA doi sang dung diaDiemCauVan (da xu ly khongTachCumTrongNgoac()
  // giong nhanh laVeE) thay vi thoat(lenh.diaDiemCongTac) truc tiep - truoc do
  // nhanh nay la 1 trong 2 noi DUY NHAT hien dia diem ma KHONG qua
  // khongTachCumTrongNgoac(), co the ngat dong xau giua cum trong ngoac.
  // Tuyen thuong: long mucDich vao cau van mo dau (vd "Công tác" -> "đi công tác",
  // "Công tác thị trường" -> "đi công tác thị trường").
  let cumMucDich = mucDichGiuaCau || "công tác";
  if (!cumMucDich.startsWith("đi ") && !cumMucDich.startsWith("công tác")) {
    cumMucDich = `công tác ${cumMucDich}`;
  }
  const hanhDongCauThuong = cumMucDich.startsWith("đi ") ? cumMucDich : `đi ${cumMucDich}`;

  const cauMoDau = laVeE
    ? `Giám đốc ${tenCongTyTrongCau} điều động và phân công
        nhiệm vụ đi công tác ${thoat(mucDichGiuaCau)} tại ${diaDiemCauVan}.`
    : `${tenCongTyTrongCau} phân công
        nhiệm vụ ${thoat(hanhDongCauThuong)} tại ${diaDiemCauVan}.`;

  // Ca 2 dong (muc dich + dia diem cong tac) IN DAM. Tung dua ve 14pt de dong
  // bo voi tieu de chinh "LENH DIEU CONG TAC" (2026-08-17), nguoi dung phan
  // hoi lai 2026-08-26 (kem anh in that + cong cu do co chu) - giam con 12pt.
  //
  // khongTachCumTrongNgoac() ap dung rieng cho dia diem cong tac (2026-08-26,
  // nguoi dung gui anh in that bi tach dong giua cum "P. Tra Vinh (T. Vinh
  // Long)") - xem giai thich day du tai dinh nghia ham trong
  // mau-in-dung-chung.ts. KHONG ap dung khi da co xuong dong thu cong (xem
  // diaDiemHtml/coXuongDongThuCong ben tren).
  //
  // KIEU_DIA_DIEM_DAI: neu dong dia diem con dai (nhieu cum ghep lai bang
  // ";"/","), giam RAT NHE letter-spacing (khong doi font-size) de "nen" chu
  // sat lai mot chut - mat thuong kho nhan ra khac biet nhung giup trinh
  // duyet co them chut khong gian, giam kha nang phai ngat dong ngay sau 1
  // cum ngan (vd chi con "(T. Vinh Long)" le loi tren dong rieng). Nguong 55
  // ky tu la uoc luong cho kho A5/font 12pt - CHUA do dac tren ban in that
  // (sandbox khong render duoc PDF), can in thu de kiem tra lai neu can. Ket
  // hop VOI (khong thay the) khongTachCumTrongNgoac() - 1 ben dam bao KHONG
  // ngat SAI cho, 1 ben chi giup diem ngat "vua van" hon. Nguoi dung yeu cau
  // 2026-08-26, xem NHAT_KY_QUYET_DINH.md.
  const NGUONG_DIA_DIEM_DAI = 55;
  // Bo qua nen chu khi da co xuong dong thu cong - nguoi dung da tu can chinh
  // dong nao ngan/dai, khong can/khong duoc can thiep them.
  const KIEU_DIA_DIEM_DAI =
    !coXuongDongThuCong && lenh.diaDiemCongTac.length > NGUONG_DIA_DIEM_DAI
      ? "letter-spacing:-0.2px;"
      : "";
  const phuDe = laVeE
    ? `<div style="text-align:center; font-size:12pt; font-weight:700; margin: 0 0 3mm;">
        ${thoat(lenh.mucDich)} tại<br/><span class="dia-diem-de-do-dong" style="${KIEU_DIA_DIEM_DAI}">${diaDiemHtml}</span>
      </div>`
    : "";

  // Cot "NGAY DI - VE (RIENG)" CHI hien khi thuc su co it nhat 1 thanh vien
  // dung ngay khac doan (ngayDiRieng/ngayVeRieng) - anh mau that "Tuyen
  // thuong" (so 337, nguoi dung gui 2026-08-13) khong co cot nay vi khong ai
  // trong doan di rieng ngay, cot luon rong la du "thua". Truoc day cot nay
  // hien CO DINH cho moi lenh TUYEN_THUONG bat ke co du lieu hay khong - sua
  // lai thanh dieu kien de khop dung anh mau, van giu duoc tinh nang khi that
  // su can (mot vai thanh vien ve som/di tre hon doan).
  const coNgayRieng = !laVeE && thanhVien.some((tv) => tv.ngayDiRieng || tv.ngayVeRieng);

  // Do rong cot HỌ VÀ TÊN - TU TINH theo ten DAI NHAT trong doan (thay vi
  // 1 so co dinh 45mm ap dung chung cho MOI truong hop, thua nhieu khoang
  // trong khi ten trong doan nay ngan hon - nguoi dung phan hoi kem anh in
  // that 2026-08-17). San toi thieu/tran de tranh cot qua hep (ten cuc ngan,
  // vd 1 chu) hoac chiem qua nhieu (ten cuc dai, hiem) lam mat can doi voi
  // CHỨC VỤ. He so mm/ky tu la uoc luong (co chu 10pt DAM cua .bang-ldct),
  // CHUA do dac tren ban in that (sandbox khong render duoc PDF) - can in
  // thu de chinh lai neu lech. Xem NHAT_KY_QUYET_DINH.md.
  const doRongCotHoTen = (() => {
    // MM_MOI_KY_TU tang tu 2.0 len 2.4 (2026-08-26) - nguoi dung chup anh in
    // that cho thay ten 13 ky tu (vd "Tân Đăng Khoa", "Lê Minh Phụng") VAN bi
    // xuong dong voi uoc luong 2.0 (danh dung khit, khong con du de xuong
    // dong chi vi 1 vai ky tu hoa/co dau rong hon trung binh). CHỨC VỤ khong
    // bi anh huong xau vi cot nay khong co width co dinh (table KHONG dung
    // table-layout:fixed), luon con du khoang trong theo anh nguoi dung gui.
    const MM_MOI_KY_TU = 2.4;
    const DEM_MM = 5; // dem 2 ben cua o - padding: 2mm 2.5mm x2, xem table.bang-in
    const SAN_TOI_THIEU_MM = 28;
    const TRAN_TOI_DA_MM = 55;
    const doDaiTenDaiNhat = Math.max(0, ...thanhVien.map((tv) => tv.hoTen.length));
    const uocLuong = doDaiTenDaiNhat * MM_MOI_KY_TU + DEM_MM;
    return Math.min(TRAN_TOI_DA_MM, Math.max(SAN_TOI_THIEU_MM, uocLuong));
  })();

  // TRUOC DAY (2026-08-17): uu tien chuc vu CAO len tren bang bang
  // hangChucVu() + sort on dinh. Nguoi dung phan hoi lai 2026-08-31 kem anh
  // in that: "Chủ tịch Công ty" (khong khop tu khoa nhan dien lanh dao nao
  // trong hangChucVu, vd "giam doc"/"ban lanh dao") bi tut xuong SAU "Trưởng
  // Phòng" - hoi lai, nguoi dung chon BO HAN sap xep theo chuc vu (khong
  // phai chi vi them tu khoa "chu tich"), in DUNG THEO THU TU DA CHON/NHAP
  // (thuTu) - danh sach thanhVien truyen vao ham nay DA duoc backend truy
  // van orderBy thuTu:"asc" san (xem LenhDieuCongTacService.chiTiet()/
  // danhSach()), nen chi can dung THANG, khong sort lai. Da XOA HAN
  // hangChucVu() (khong con noi nao goi toi, khong de code chet). Xem
  // NHAT_KY_QUYET_DINH.md.
  const thanhVienDaSapXep = thanhVien;

  const hangThanhVien = thanhVienDaSapXep
    .map((tv, i) => {
      const dam = laVeE && tv.laTruongDoan ? ' style="font-weight:700;"' : "";
      const oNgayRieng = coNgayRieng
        ? `<td style="white-space:nowrap;">${
            tv.ngayDiRieng || tv.ngayVeRieng
              ? `${dinhDangNgayDiDenMauIn(tv.ngayDiRieng ?? lenh.ngayDi)} – ${dinhDangNgayDiDenMauIn(tv.ngayVeRieng ?? lenh.ngayVe)}`
              : ""
          }</td>`
        : "";
      // Tai xe cua chuyen di: in "Nhân viên Lái xe" neu chuc vu hien tai la "Nhân viên"
      // chung chung hoac van thu da chon "Nhân viên Lái xe". Neu van thu chon in chuc vu
      // phong ban (vd "Nhân viên Phòng Kế hoạch – Kinh doanh") thi ton trong lua chon do.
      // Ten phong ban duoc viet tat RIENG cho bang nay (apDungVietTatPhongBanLucInLdct).
      const chucVuGoc =
        tv.laTaiXe && tv.chucVu.trim().toLowerCase() === "nhân viên"
          ? "Nhân viên Lái xe"
          : tv.chucVu;
      const chucVuHienThi = apDungVietTatPhongBanLucInLdct(chucVuGoc);
      return `<tr${dam}>
        <td style="text-align:center;">${i + 1}</td>
        <td>${thoat(tv.hoTen)}</td>
        <td>${thoat(chucVuHienThi)}</td>
        ${oNgayRieng}
      </tr>`;
    })
    .join("");

  return `<div class="trang"${leTrang}>
    ${trangMoHinh(cauHinhDonVi)}
    <div class="noi-dung">
      ${khoiLetterhead(lenh.soHieu, lenh.ngayKy, cauHinhDonVi)}
      <div class="tieu-de-chinh" style="${laVeE ? "margin-bottom: 0;" : ""}">LỆNH ĐIỀU CÔNG TÁC</div>
      ${phuDe}
      <!-- Duong ke ngang, canh giua, ngay duoi ca cum tieu de (tieu de chinh +
           phu de neu co) - phan cach truoc phan "Can cu...". Nguoi dung yeu
           cau 2026-08-26: ban dau lam dai bang 1 nua chieu rong ca khoi, sau
           phan hoi "van con qua dai" - muon dai bang 1 nua DONG DUOI CUNG cua
           cum tieu de (dong nay do phan dia diem cong tac tu xuong dong tu
           nhien, KHONG biet truoc se dai bao nhieu luc tao HTML o server). Vi
           vay width 50% khai bao san CHI la gia tri du phong (khi khong co
           dong dia diem rieng, hoac khi script ben duoi vi ly do nao do khong
           chay duoc) - gia tri THAT SU duoc 1 doan script nho trong boc() tinh
           lai bang Range.getClientRects() (lay dung phan tram cua dong cuoi
           cung sau khi da xuong dong that trong trinh duyet) roi ghi de qua
           style.width. KHONG dung lai class gach dung chung o letterhead
           (position:absolute, gan 1 dong chu CO DINH biet truoc) - o day can
           tinh SAU KHI da xuong dong that trong 1 khoi van ban dai ngan tuy y.
           Cap nhat 2026-08-26: chi hien voi loai "ve e" (co phu de) - nguoi
           dung yeu cau bo gach duoi tieu de o LDCT loai thuong (khong phu
           de). SCRIPT_DO_VACH_DUOI_TIEU_DE da tu bo qua khi khong tim thay
           phan tu nay nen khong can sua script. Xem NHAT_KY_QUYET_DINH.md. -->
      ${laVeE
        ? `<div class="vach-duoi-tieu-de" style="width:50%; margin:0 auto 4mm; border-bottom:1px solid #333;"></div>`
        : ""}
      ${canCuHtml(lenh.canCu, true)}
      <p style="margin: 0 0 3mm; text-indent: 8mm; text-align: justify;">${cauMoDau}</p>
      <p style="margin: 0 0 2mm; text-indent: 8mm;">${cauNgay}</p>
      <table class="bang-in bang-ldct">
        <thead>
          <tr>
            <!-- width 8mm truoc day qua hep: padding chung table.bang-in la
                 2mm 2.5mm (2 ben = 5mm), chi con 3mm cho chu "STT" (dam, 3 ky
                 tu) -> vo dong tung chu 1 (S/T/T) nhu nguoi dung chup man
                 hinh 2026-08-13, dau cac cot khac van con nhieu khoang trong.
                 Tang len 14mm (con 9mm cho chu, du rong). table.bang-in
                 KHONG dung table-layout:fixed nen tang 1 cot se tu can doi
                 lai voi 2 cot con lai (Ho va ten/Chuc vu, khong khai bao
                 width co dinh), khong gay tran bang. Xem NHAT_KY_QUYET_DINH.md. -->
            <th style="width:14mm;">STT</th>
            <!-- width tu tinh (doRongCotHoTen, 2026-08-17) - xem giai thich
                 day du o khai bao doRongCotHoTen ben tren. Truoc do dung 1
                 so co dinh 45mm, sau nguoi dung phan hoi con thua khoang
                 trong khi ten trong doan ngan hon 45mm dat ra - doi sang tu
                 tinh theo ten dai nhat cua CHINH doan nay de tiet kiem cho
                 CHỨC VỤ (thuong dai hon do ghep phong ban, xem
                 chucVuKemPhongBan() trong lenh-dieu-cong-tac.service.ts).
                 Xem NHAT_KY_QUYET_DINH.md. -->
            <th style="width:${doRongCotHoTen.toFixed(1)}mm;">HỌ VÀ TÊN</th>
            <th>CHỨC VỤ</th>
            ${coNgayRieng ? '<th style="width:30mm;">NGÀY ĐI – VỀ (RIÊNG)</th>' : ""}
          </tr>
        </thead>
        <tbody>${hangThanhVien}</tbody>
      </table>
      ${khoiKy(lenh.nguoiKyTheThuc, lenh.nguoiKyHoTen, lenh.nguoiKyChucDanh)}
    </div>
  </div>`;
}

/** Mau "Tram" - dung dung theo file that "LENH DIEU CONG TAC TP.HCM
 * (Quốc).docx" nguoi dung gui (2026-08-10): tieu de phu co gach chan, bang 6
 * cot khac han mau Tuyen thuong (KHONG co Chuc vu, thay bang Nam sinh/So
 * CMND-CCCD/Nhiem vu), doan van + cau ket rieng. Doan van hien tai hardcode
 * "Trạm phát hành vé số An Giang ở Thành phố Hồ Chí Minh" vi day la kich ban
 * DUY NHAT co mau giay that (Tram TP.HCM) - CHUA tong quat hoa cho cac Tram
 * khac vi module Trạm/Tuyến day du van chua build (xem CLAUDE.md).
 *
 * Cum "Giám đốc Công ty TNHH MTV Xổ số Kiến thiết An Giang" cung hardcode
 * (KHONG ghep tu cauHinhDonVi.tenCoQuanDong1/2 nhu truoc) - nguoi dung yeu
 * cau ro rang mot chuoi viet tat "MTV" chu thuong/hoa dung the thuc, khac
 * han cach viet HOA TOAN BO 2 dong dung o letterhead (tenCoQuanDong1/2 phuc
 * vu muc dich khac: khoi quoc hieu/con dau). Chi rieng cau nay cua mau Tram
 * dung chuoi cung, khong anh huong noi dung letterhead hay mau Tuyen thuong.
 * Xem NHAT_KY_QUYET_DINH.md. */
function noiDungTrangLenhDieuCongTacTram(
  lenh: LenhDieuCongTacDeIn,
  thanhVien: ThanhVienDeIn[],
  cauHinhDonVi: CauHinhDonVi,
): string {
  const thanhVienDaSapXep = sapXepGomNhomTram(thanhVien, lenh);

  // Co gian co chu/khoang cach theo so thanh vien - nguoi dung yeu cau
  // 2026-08-28 "co giãn size và kích cỡ để chỉ 1 trang A4" (thay vi 1 bo co
  // chu CO DINH nhu truoc, chi dung khi doan <=6 nguoi nhu kich ban thuc te
  // duy nhat tung gap - xem doc comment ham nay). KHONG the do dac thuc su
  // "vua dung 1 trang" trong server (Playwright chi render 1 lan, khong co
  // vong lap do-roi-giam nhu trinh duyet that/Word tu dong thu nho chu) nen
  // dung 1 CONG THUC tuyen tinh don gian (khong phai nhieu "nac" co dinh) -
  // de bao tri hon (1 cong thuc, khong phai bang tra cuu nhieu gia tri) va
  // "co gian" that su (moi nguoi them vao giam dan, khong nhay cum bac).
  // NGUONG_CO_BAN = 6: so thanh vien toi da ma bo co chu GOC (12pt/11pt,
  // chinh 2026-08-10) da tung du dung 1 trang - tu nguoi thu 7 tro di moi
  // bat dau giam. SAN_TY_LE = 0.8: khong giam qua 80% co chu goc, tranh chu
  // qua nho kho doc tren van ban hanh chinh chinh thuc - vuot qua muc nay
  // van co the tran trang 2 voi doan RAT dong, chap nhan duoc (uu tien de
  // doc hon la co ep vua bang moi gia). CHUA do dac tren ban in that (nhu
  // moi uoc luong mm/pt khac trong file nay) - can in thu voi vai muc so
  // luong thanh vien khac nhau (6, 8, 10...) de kiem chung lai he so. Xem
  // NHAT_KY_QUYET_DINH.md.
  const NGUONG_CO_BAN_TRAM = 6;
  const BUOC_GIAM_MOI_NGUOI = 0.035;
  const SAN_TY_LE_TRAM = 0.8;
  const heSoCoGianTram =
    thanhVien.length <= NGUONG_CO_BAN_TRAM
      ? 1
      : Math.max(SAN_TY_LE_TRAM, 1 - (thanhVien.length - NGUONG_CO_BAN_TRAM) * BUOC_GIAM_MOI_NGUOI);
  // line-height giam NHE hon co chu (chi toi da 0.3 don vi o san duoi) - giam
  // qua nhieu lam dong chu dinh sat nhau, kho doc hon la loi ich ve khong
  // gian tiet kiem duoc.
  const dongCaoTram = Math.max(1.1, 1.3 - (1 - heSoCoGianTram) * 0.3).toFixed(2);
  const coChuNoiDungTram = (12 * heSoCoGianTram).toFixed(2);
  // rieng Nam sinh/CCCD - 12pt (2026-08-10, bump tu 11pt de dong bo Courier
  // Prime voi Ho va ten) -> 11pt (2026-08-31, nguoi dung yeu cau sau khi doi
  // font sang Times New Roman - khong con can bump nhu truoc vi Times New
  // Roman KHONG "nho/mong" hon cac font khac nhu Courier Prime tung the).
  // Van "co gian" theo heSoCoGianTram nhu truoc.
  const coChuOTenTram = (11 * heSoCoGianTram).toFixed(2);
  // Rieng cot HO VA TEN - nguoi dung yeu cau 2026-08-28 giam ve 10pt, sau do
  // tang len 10.5pt (tach rieng khoi Nam sinh/CCCD dang giu 12pt qua
  // coChuOTenTram, chi ho ten doi size). Van "co gian" theo heSoCoGianTram
  // nhu cac cot khac.
  const coChuHoTenTram = (10.5 * heSoCoGianTram).toFixed(2);
  const coChuBangTram = (11 * heSoCoGianTram).toFixed(2);
  // Rieng cot GHI CHU - nguoi dung yeu cau 2026-08-28 nho hon han cac cot
  // con lai cua bang (10pt goc, thay vi ke thua 11pt cua coChuBangTram), vi
  // noi dung dang "Từ {ngày đi} -> {ngày đến}" khong can noi bat nhu Ho
  // ten/CCCD. Van "co gian" theo heSoCoGianTram nhu cac cot khac.
  const coChuGhiChuTram = (10 * heSoCoGianTram).toFixed(2);
  const demDocOTram = (1.2 * heSoCoGianTram).toFixed(2);
  const demNgangOTram = (2 * heSoCoGianTram).toFixed(2);
  const marginPhuDeTram = (8.5 * heSoCoGianTram).toFixed(2);
  const marginDoanVanTram = Math.max(1, 2 * heSoCoGianTram).toFixed(2); // san 1mm, tranh doan van dinh sat bang/duong ke
  const kyGonTram = heSoCoGianTram < 1;
  // Le tren - nguoi dung yeu cau 2026-08-28 "kéo lề trên cao lên" (van con
  // tran trang du da co gian co chu/khoang cach) - giam tu 20mm (dung nghia
  // den San NĐ30, muc thap nhat cua khoang 20-25mm) xuong 12mm CO DINH lam
  // muc goc, roi VAN tiep tuc co gian nhe theo heSoCoGianTram nhu cac khoang
  // cach khac (con 9.6mm o san 80%). Day la buoc "pha le chuan" ro rang nhat
  // tu truoc gio cho mau Tram (truoc chi bleed trai/phai qua bang, chua bao
  // gio dung den tren/duoi) - CHAP NHAN DUOC vi nguoi dung (chu quan ly văn
  // bản noi bo) da xac nhan uu tien "vua 1 trang" hon dung tuyet doi chuan
  // trinh bay. Le duoi/phai/trai GIU NGUYEN (nguoi dung chi noi rieng "lề
  // trên"). Xem NHAT_KY_QUYET_DINH.md.
  const paddingTrenTram = (12 * heSoCoGianTram).toFixed(2);

  // Build hang bang - merge (rowspan) cot Ghi chu cho cac hang LIEN TIEP
  // cung 1 khoang ngay hieu luc (da dam bao dung canh nhau nho
  // sapXepGomNhomTram o tren). STT danh lai theo thu tu SAU KHI sap xep, vi
  // day la thu tu thuc te hien tren trang in. Ca hang cua truong doan in
  // dam (font-weight ke thua tu <tr> xuong moi <td> con, ke ca o Ghi chu
  // gop neu hang dau nhom do rơi dung vao hang truong doan). Nguoi dung yeu
  // cau 2026-08-10, xem NHAT_KY_QUYET_DINH.md.
  const hangThanhVien: string[] = [];
  for (let i = 0; i < thanhVienDaSapXep.length; ) {
    const ghiChuNhom = ghiChuTram(thanhVienDaSapXep[i], lenh);
    let soHangGop = 1;
    while (
      i + soHangGop < thanhVienDaSapXep.length &&
      ghiChuTram(thanhVienDaSapXep[i + soHangGop], lenh) === ghiChuNhom
    ) {
      soHangGop++;
    }

    for (let j = 0; j < soHangGop; j++) {
      const tv = thanhVienDaSapXep[i + j];
      const stt = i + j + 1;
      // In dam CHI rieng cot NHIỆM VỤ khi la truong doan (damNhiemVu, ap
      // dung truc tiep tren <td> Nhiem vu ben duoi) - TRUOC DAY in dam CA HANG
      // (dam tren <tr>, ke thua xuong moi <td> con) nhung nguoi dung yeu cau
      // 2026-08-28 chi can rieng cot chuc vu/nhiem vu noi bat, cac cot con
      // lai (STT/Ho ten/Nam sinh/CCCD/Ghi chu) giu binh thuong. Xem
      // NHAT_KY_QUYET_DINH.md.
      const damNhiemVu = tv.laTruongDoan ? ' style="font-weight:700;"' : "";
      //
      // Nam sinh/So CCCD: DOI tu "Courier Prime" (monospace kieu may danh
      // chu) sang "Times New Roman" (2026-08-31, nguoi dung yeu cau dong bo
      // voi phong chu van ban hanh chinh dang chon - Courier Prime nhin
      // "khac tong" ro ret voi phan con lai cua bang khi ca chung tu da dung
      // chu co chan). Truoc khi doi, DA DO DAC THAT bang opentype.js (doc
      // truc tiep file times.ttf/timesbd.ttf trong assets/fonts/) de xac
      // nhan KHONG mat di uu diem "thang hang tuyet doi" von la ly do chinh
      // chon font monospace ban dau: ca 10 chu so (0-9) trong Times New Roman
      // co advance width GIONG HET NHAU (500/1000 unitsPerEm, ca ban thuong
      // lan dam) - day la quy uoc "tabular figures" pho bien trong nhieu font
      // van ban co chan (khac voi cac chu cai thuong, von co do rong bien
      // doi trong Times New Roman) - nen van giu duoc dung tinh chat "moi
      // hang co do dai chuoi CO DINH -> canh giua tu dong thang hang" da neu
      // o quyet dinh 2026-08-10 ("Quay lai Courier Prime + canh giua"), chi
      // khac phong chu hien thi. Font Times New Roman duoc EMBED RIENG cho
      // trang Tram (xem <style> them vao dau ham noiDungTrangLenhDieuCongTacTram(),
      // KHONG phu thuoc CauHinhDonVi.phongChuMauIn dang chon) de dam bao
      // luon co san du quan tri chon phong chu THAN noi dung nao di nua - 2
      // cot nay la ngoai le CO DINH, giong cach Courier Prime tung la ngoai
      // le CO DINH truoc day.
      //
      // text-align:center - van giu nguyen tu quyet dinh 2026-08-10, ly do
      // van dung nhu tren (do dai chuoi co dinh + do rong chu so co dinh).
      //
      // font-size:11pt (2026-08-31, giam tu 12pt - nguoi dung yeu cau sau
      // khi doi sang Times New Roman, khong con can bump nhu Courier Prime
      // truoc day). Bo han "font-size-adjust: none" (khac voi luc con Courier
      // Prime, luc do PHAI tu ghi de none de
      // tranh bi rule font-size-adjust toan cuc - hieu chinh rieng cho phong
      // THAN chinh - anh huong ngoai y muon len 1 font monospace hoan toan
      // khac tinh chat). Gio 2 cot nay dung CHINH Times New Roman (mot trong
      // 4 lua chon chinh thuc cua he thong, xem MA_PHONG_CHU_MAU_IN), nen de
      // ke thua binh thuong tu html/body se cho ket qua NHAT QUAN voi phan
      // con lai cua tai lieu (nhat la khi quan tri CUNG dang chon Times New
      // Roman lam phong THAN chinh - truong hop thuc te luc nguoi dung yeu
      // cau thay doi nay). Xem NHAT_KY_QUYET_DINH.md.
      // Canh giua doc cot Ghi chu (o gop nhieu hang bang rowspan): CHI dung
      // "vertical-align:middle" tren <td> khong du tin cay voi o co rowspan
      // trong thuc te (nguoi dung phan hoi van thay lech len tren) - doi
      // sang ky thuat chac chan hon: bo padding/vertical-align tren <td>,
      // boc noi dung trong 1 <div> con voi display:flex + align-items:center
      // + height:100% (phan tram chieu cao con cua table-cell la 1 trong so
      // it truong hop CSS chinh thuc cho phep height:100% hoat dong dung
      // tren phan tu con, vi trinh duyet da tinh xong chieu cao hang/o gop
      // truoc khi dat noi dung con vao) - flexbox dam bao canh giua CHINH
      // XAC bat ke co bao nhieu dong text. Noi dung o Ghi chu dung
      // ghiChuTramHtml() (4 dong co dinh: nhan/gia tri tach rieng, gia tri
      // ngay boc white-space:nowrap) thay vi ghep truc tiep ghiChuNhom - xem
      // doc comment cua ghiChuTramHtml() de biet ly do (fix loi ngat dong
      // giua so ngay thang, 2026-08-28). Xem NHAT_KY_QUYET_DINH.md.
      // min-width:0 tren <div> con BEN TRONG flex container - lo i CSS
      // flexbox kinh dien: flex item mac dinh co min-width:auto (= min-
      // content size), va khi ket hop voi word-break:break-word/overflow-
      // wrap (ke thua tu table.bang-in), Chromium tinh min-content cho phep
      // ngat O BAT KY DIEM NAO - khien flex item co the bi ep co xuong con
      // 1 KY TU MOI DONG (van "Từ ngày"/"đến ngày" khong boc nowrap bi vo
      // thanh "T/ừ/n/g/à/y" tung dong rieng), lam o Ghi chu cao vot len va
      // tran ca bang sang trang 2 (nguoi dung gui anh in that 2026-08-28,
      // sau khi doi sang ghiChuTramHtml()). Sua chuan: them 1 <div> con voi
      // min-width:0 dat "opt-out" khoi hanh vi auto-min-size nay - ky thuat
      // pho bien duoc khuyen dung cho moi flex item chua van ban co the tran
      // (xem "flexbox min-width auto" - CSS Tricks/web.dev). Chuoi nowrap
      // (ngay thang) khong bi anh huong vi da tu chan ngat rieng, chi cac
      // nhan "Từ ngày"/"đến ngày" moi can den fix nay. Xem NHAT_KY_QUYET_DINH.md.
      const oGhiChu =
        j === 0
          ? `<td rowspan="${soHangGop}" style="text-align:center; vertical-align:middle; font-weight:normal; padding:0; font-size:${coChuGhiChuTram}pt;"><div style="display:flex; align-items:center; justify-content:center; height:100%; padding:${demDocOTram}mm ${demNgangOTram}mm;"><div style="min-width:0;">${ghiChuTramHtml(thanhVienDaSapXep[i], lenh)}</div></div></td>`
          : "";
      hangThanhVien.push(`<tr>
        <td style="text-align:center;">${stt}</td>
        <td style="font-size:${coChuHoTenTram}pt;">${thoat(tv.hoTen)}</td>
        <td style="text-align:center; vertical-align:middle; white-space:nowrap; font-family:'Times New Roman', 'Liberation Serif', Georgia, serif; font-size:${coChuOTenTram}pt;">${tv.ngaySinh ? dinhDangNgay(tv.ngaySinh) : ""}</td>
        <td style="text-align:center; vertical-align:middle; white-space:nowrap; font-family:'Times New Roman', 'Liberation Serif', Georgia, serif; font-size:${coChuOTenTram}pt;">${thoat(tv.cccd)}</td>
        <td style="text-align:center; white-space:nowrap;"${damNhiemVu}>${tv.laTruongDoan ? "Trưởng đoàn" : "Thành viên"}</td>
        ${oGhiChu}
      </tr>`);
    }
    i += soHangGop;
  }

  // Canh le theo dung chuan Nghi dinh 30/2020/NĐ-CP (the thuc van ban hanh
  // chinh, Phu luc I khoi A4): tren 20-25mm, duoi 20-25mm, trai 30-35mm,
  // phai 15-20mm - chon gia tri giua pho bien nhat (20/20/30/20).
  //
  // Co chu: goc 14pt dung nghia den chuan NĐ30 tung qua dai voi doan vua
  // phai (2026-08-10, giam xuong 12pt co dinh). TU 2026-08-28: khong con 1
  // muc co dinh nua ma "co gian" theo so thanh vien qua heSoCoGianTram (xem
  // khoi tinh toan dau ham) - o <=6 nguoi (kich ban thuc te tung gap) VAN
  // giu dung 12pt/11pt/1.3 nhu truoc (heSo=1, khong doi hanh vi cu), tu
  // nguoi thu 7 tro di moi bat dau giam dan (toi da con 80%). CHI ap dung
  // rieng cho trang Tram (inline style + custom property de khong dung den
  // .trang/table.bang-in dung chung cho moi mau in khac - LDX/GDD/LDCT
  // Tuyen thuong van giu nguyen, khong bi anh huong). Nguoi dung yeu cau
  // 2026-08-10 (co chu goc) va 2026-08-28 (co gian theo so nguoi), xem
  // NHAT_KY_QUYET_DINH.md.
  // Cot Nam sinh/So CCCD o tren BAT BUOC dung Times New Roman du quan tri co
  // dang chon phong THAN chinh nao di nua (ngoai le CO DINH, xem doc comment
  // o cho khai bao <td> tuong ung) - nen PHAI tu dam bao font nay LUON duoc
  // embed (base64 @font-face) trong chinh trang Tram, KHONG phu thuoc
  // taoCssFontMat(cauHinhDonVi.phongChuMauIn) da goi 1 lan duy nhat o boc()
  // dung chung cho ca tai lieu (chi embed DUNG 1 lua chon quan tri dang chon,
  // de tranh phinh to MOI PDF voi font khong dung toi - xem
  // DANH_SACH_FONT_TUY_CHON trong mau-in-dung-chung.ts). Neu quan tri dang
  // chon Times New Roman lam phong THAN chinh, <style> nay TRUNG LAP voi cai
  // da co (vo hai, trinh duyet chi dung 1 ban) - chap nhan duoc, don gian
  // hon nhieu so voi kiem tra dieu kien de tranh trung. Neu KHONG phai (vd
  // dang chon Be Vietnam Pro), day la <style> DUY NHAT dam bao Times New
  // Roman that su co san thay vi trong cay vao font Times New Roman CUA HE
  // DIEU HANH (thuong KHONG co tren server Linux, se rot ve serif chung
  // chung, sai voi thiet ke da chon). Nguoi dung yeu cau 2026-08-31, xem
  // NHAT_KY_QUYET_DINH.md.
  const cssFontTimesChoTram = `<style>${taoCssFontMat("TIMES_NEW_ROMAN")}</style>`;

  return `${cssFontTimesChoTram}
  <div class="trang mau-tram" style="padding: ${paddingTrenTram}mm 20mm 20mm 30mm; font-size: ${coChuNoiDungTram}pt; line-height: ${dongCaoTram};">
    ${trangMoHinh(cauHinhDonVi)}
    <div class="noi-dung">
      ${khoiLetterhead(lenh.soHieu, lenh.ngayKy, cauHinhDonVi)}
      <!-- font-size:14pt (co dinh, KHONG theo heSoCoGianTram) - nguoi dung
           yeu cau rieng 2026-08-28: tieu de chinh truoc do ke thua mac dinh
           dung chung 12pt cua .tieu-de-chinh, NHO HON ca phu de ben duoi
           (14pt) - sai thu bac thi giac (tieu de chinh phai to nhat). Giu
           CO DINH (khong co gian theo so nguoi) vi day la tieu de trang the
           thuc, can noi bat on dinh bat ke doan dong hay it - phan con lai
           cua trang (bang/doan van) se co gian de bu lai. Xem NHAT_KY_QUYET_DINH.md. -->
      <div class="tieu-de-chinh" style="margin-bottom: 0; font-size: 14pt;">LỆNH ĐIỀU CÔNG TÁC</div>
      <!-- margin-bottom 8.5mm (tang tu 3mm, them 2026-08-19) = 3mm cu + 5.5mm
           (uoc luong DUNG 1 line-height o co chu 12pt/line-height:1.3 cua
           trang Tram: 12 x 1.3 x 0.3528mm/pt) - gian doan "Can cu..." dau
           tien (canCuHtml(), <p> ke tiep co margin-top:0) ra xa hon duong ke
           ngang phia tren, tranh dinh sat vao nhau. Dua vao margin collapsing
           chuan CSS (2 khoi <div>/<p> ke nhau, khong padding/border xen
           giua): khoang cach thuc te = MAX(margin-bottom cua khoi nay,
           margin-top cua <p> Can cu dau tien = 0), nen chinh margin-bottom o
           day la du, khong can sua canCuHtml() dung chung. Nguoi dung yeu cau
           2026-08-19 (dieu chinh lai vi tri gian cach, ban dau nham sang
           doan "Giam doc..." - da doi), xem NHAT_KY_QUYET_DINH.md. -->
      <div style="text-align:center; font-weight:700; font-size:14pt; margin: 0 0 ${marginPhuDeTram}mm;">
        (Trực Trạm phát hành vé số tại TP.HCM)
        <!-- SUA 2026-08-19: duong ke truoc day dai = 1/2 CHINH CHU PHU DE nay
             (bam theo do rong that cua "(Trực Trạm phát hành vé số tại
             TP.HCM)" qua ky thuat span inline-block long nhau, xem lich su o
             ban cu). Nguoi dung yeu cau doi sang dai = 1/2 do rong TIEU DE
             CHINH "LỆNH ĐIỀU CÔNG TÁC" o tren (2 chuoi do dai khac han nhau -
             phu de dai hon nhieu). Khong the tinh % theo do rong 1 chuoi
             KHAC voi chuoi dang hien thi bang thuan CSS (khong co JS do dac
             luc xuat PDF) nen UOC LUONG CO DINH bang mm: "LỆNH ĐIỀU CÔNG
             TÁC" 18 ky tu (ke ca 3 khoang trang), 14pt in hoa dam +
             letter-spacing:1px (giong .tieu-de-chinh) -> uoc ~66mm ca cum tu
             -> duong ke = 1/2 = 33mm. Doi tu ky thuat "span long nhau bam
             theo chu" sang div rieng width co dinh + margin:auto (tu canh
             giua doc lap voi do dai chu phu de ben canh, khong con phu thuoc
             noi dung phu de nua). CHUA do dac tren ban in that - can xac
             nhan lai kich thuoc. Nguoi dung yeu cau 2026-08-19, xem
             NHAT_KY_QUYET_DINH.md. -->
        <div style="width:33mm; height:0; margin:0.5mm auto 0; border-bottom:1px solid #333;"></div>
      </div>
      ${canCuHtml(cauHinhDonVi.canCuMauTram, true)}
      <p style="margin: 0 0 ${marginDoanVanTram}mm; text-indent: 8mm; text-align: justify;">
        Giám đốc Công ty TNHH MTV Xổ số Kiến thiết An Giang quyết định điều động và phân công các đ/c có tên
        sau thực hiện nhiệm vụ công tác tại Trạm phát hành vé số An Giang ở Thành phố Hồ Chí Minh, cụ thể như
        sau:
      </p>
      <table class="bang-in bang-tram" style="font-size: ${coChuBangTram}pt; --tram-dem-doc: ${demDocOTram}mm; --tram-dem-ngang: ${demNgangOTram}mm;">
        <thead>
          <tr>
            <th style="width:8mm;">TT</th>
            <!-- 56mm (tang tu 46mm, 2026-10-21) - lay 5mm tu NAM SINH va 5mm tu SO CCCD.
                 Nguoi dung gui anh in that cho thay ten dai nhu "Nguyễn Hoàng Diễm Trang"
                 (23 ky tu) o 46mm bi tran qua cot ke ben. 56mm dam bao ten 4-5 chu
                 nam gon tren 1 dong ma khong cham vien. -->
            <th style="width:56mm; font-size:12pt;">HỌ VÀ TÊN</th>
            <!-- 25mm (giam tu 30mm) - ngay sinh dang dd/mm/yyyy chi 10 ky tu (~18mm),
                 25mm van du rong rai cho so ngay thang canh giua. -->
            <th style="width:25mm;">NĂM SINH</th>
            <!-- 31mm (giam tu 36mm) - CCCD 12 chu so chi ~22mm, 31mm van thua ~9mm
                 bien an toan khi canh giua. -->
            <th style="width:31mm;">SỐ CCCD</th>
            <th style="width:30mm;">NHIỆM VỤ</th>
            <!-- 30mm (tang tu 26mm, 2026-08-28) - GHI CHU tung dung ky thuat
                 chi ep xuong dong 1 lan (truoc "đến ngày"), nhung nua cau con
                 lai "Từ ngày dd/mm/yyyy" van dai hon 26mm o co chu 11pt, buoc
                 trinh duyet tu ngat them 1 lan bang word-break:break-word -
                 va vi ngay thang khong co khoang trang nen bi ngat NGAY GIUA
                 SO (vd "03/9/202" / "6", anh in that nguoi dung gui
                 2026-08-28). Sua tan goc bang ghiChuTramHtml() (4 dong co
                 dinh, gia tri ngay boc white-space:nowrap - chan cung khong
                 ngat giua so), va tang rong cot them 4mm (lay tu HO VA TEN o
                 tren) de co bien an toan cho uoc luong be rong (17-18 ky tu ~
                 2.3mm/ky tu o 11pt thuong = toi da ~20mm/dong can, con
                 30mm - 4mm dem = 26mm kha dung). CHUA do dac tren ban in that
                 sau khi sua - can in thu lai de xac nhan. Xem
                 NHAT_KY_QUYET_DINH.md. -->
            <th style="width:30mm;">GHI CHÚ</th>
          </tr>
        </thead>
        <tbody>${hangThanhVien.join("")}</tbody>
      </table>
      <p style="margin: ${marginDoanVanTram}mm 0 0; text-indent: 8mm; text-align: justify;">
        Từng thành viên tham gia công tác có trách nhiệm thực hiện đúng chức năng và nhiệm vụ của mình theo nội
        dung quy định tại Quy chế Đoàn công tác Trạm phát hành vé số kiến thiết An Giang./.
      </p>
      ${khoiKy(lenh.nguoiKyTheThuc, lenh.nguoiKyHoTen, lenh.nguoiKyChucDanh, kyGonTram)}
    </div>
  </div>`;
}

// ---------------------------------------------------------------------------
// LENH DIEU XE (khi ghep chung file voi LDCT) - dung LAI dung noi dung mau
// LDX that (noiDungLenhDieuXe() cua lenh-dieu-xe-mau-in.ts), chi khac kho
// giay (theo LDCT dung truoc no thay vi luon A5 co dinh nhu ban in LDX doc
// lap) - xem doc comment dau file. KHONG duoc viet lai rieng noi dung nay -
// day chinh la nguyen nhan gay loi "mau in khong dung" nguoi dung phat hien
// 2026-08-10, xem NHAT_KY_QUYET_DINH.md.
// ---------------------------------------------------------------------------

/** File PDF "LDCT + LDX" (1 mat) - dung khi bam nut "In lenh dieu cong tac +
 * lenh dieu xe" o trang chi tiet. lenhDieuXe = null neu doan khong co tai
 * xe (chi in 1 trang LDCT). */
export function taoHtmlLenhDieuCongTacVaLenhDieuXe(
  lenh: LenhDieuCongTacDeIn,
  thanhVien: ThanhVienDeIn[],
  lenhDieuXe: LenhDieuXeNoiDungDeIn | null,
  cauHinhDonVi: CauHinhDonVi,
  khoGiay: KhoGiayLdct,
): string {
  const trang1 = noiDungTrangLenhDieuCongTac(lenh, thanhVien, cauHinhDonVi, khoGiay);
  const trang2 = lenhDieuXe
    ? `<div class="trang">${trangMoHinh(cauHinhDonVi)}${noiDungLenhDieuXe(lenhDieuXe, cauHinhDonVi)}</div>`
    : "";
  return boc(khoGiay, `Lệnh điều công tác ${lenh.soHieu}`, trang1 + trang2, cauHinhDonVi.phongChuMauIn, cauHinhDonVi.tyLeXHeightMauIn);
}

export interface LenhDieuCongTacHangLoatItem {
  lenh: LenhDieuCongTacDeIn;
  thanhVien: ThanhVienDeIn[];
}

/**
 * File PDF "nhieu LDCT cung luc" - checkbox chon dong + nut "In da chon" o
 * trang /lenh-dieu-cong-tac (2026-08-28, nguoi dung yeu cau - xem
 * NHAT_KY_QUYET_DINH.md muc "In nhieu lenh dieu cong tac cung luc").
 *
 * CHI in trang LDCT, KHONG kem trang LDX du lenh co tai xe/phuong tien dang
 * hoat dong hay khong - ban dau (2026-08-28) ham nay co kem LDX neu co, nhung
 * nguoi dung phan anh cung ngay "bi dinh luon co lenh dieu xe trong do" khi
 * chi muon in rieng cac LDCT da chon, nen bo han phan LDX de nhat quan voi
 * nut in RIENG 1 lenh o cung trang danh sach (xemVaInRieng, :id/pdf - cung
 * "khong kem trang LDX du doan co tai xe hay khong"). Ai can in ca LDX thi
 * vao tung lenh in rieng qua nut :id/pdf-lenh.
 *
 * LUON dung kho A5 CHO CA FILE - khac voi in 1 lenh don le (tu dong chon A5
 * hoac A4 qua chonKhoGiayLenhDieuCongTac tuy so thanh vien/loai mau in). Ly
 * do: 1 file PDF chi dung duoc DUY NHAT 1 kho giay cho toan bo file
 * (PdfService.xuatPdfTuHtml truyen `format` la tham so TOAN CUC cho
 * Playwright page.pdf(), khong the tron A4/A5 khac nhau giua cac trang don
 * gian nhu doi mau chu/font) - da hoi lai nguoi dung 2026-08-28, chon LUON A5
 * cho tien tra cuu/kep ho so nhanh khi in ghep nhieu lenh.
 *
 * RUI RO DA BIET (nguoi dung da duoc canh bao va chap nhan): 1 vai lenh binh
 * thuong can A4 khi in RIENG (mau Tram loaiMauIn=TRAM, doan >10 nguoi, hoac
 * muc dich/dia diem qua dai) neu duoc CHON DE IN GHEP se bi ep xuong kho A5,
 * co the vo bo cuc bang thanh vien (be ngang khong du cho cac cot, dac biet
 * mau Tram co them cot CCCD). Nen in RIENG tung lenh do qua nut in don (tu
 * dong chon dung kho) thay vi gom vao 1 lan in ghep.
 */
export function taoHtmlLenhDieuCongTacHangLoat(
  danhSach: LenhDieuCongTacHangLoatItem[],
  cauHinhDonVi: CauHinhDonVi,
): string {
  const KHO_GIAY_IN_HANG_LOAT: KhoGiayLdct = "A5";
  const trangs = danhSach
    .map(({ lenh, thanhVien }) => noiDungTrangLenhDieuCongTac(lenh, thanhVien, cauHinhDonVi, KHO_GIAY_IN_HANG_LOAT))
    .join("");
  return boc(KHO_GIAY_IN_HANG_LOAT, "Lệnh điều công tác đã chọn", trangs, cauHinhDonVi.phongChuMauIn, cauHinhDonVi.tyLeXHeightMauIn);
}

// ---------------------------------------------------------------------------
// GIAY DI DUONG (Cong lenh kiem giay di duong) - kho A5 co dinh, 2 mat:
// mat truoc "CÔNG LỆNH (KIÊM) GIẤY ĐI ĐƯỜNG" (letterhead o TREN, ket thuc
// bang bang "NOI DI VA DEN"), mat sau "PHẦN KÊ THANH TOÁN" (letterhead o
// DUOI). Thu tu + vi tri letterhead xac nhan tu anh chup trang don le sach
// (khong bi tran noi dung nguoi ke tiep) trong mau "CONG LENH VA LENH DIEU
// TINH (Quoc) moi - 2026" - mau moi nhat cong ty cung cap, dung lam chuan.
// Ca 2 mat deu dung SO HIEU RIENG cua GDD (khac voi 1 mau cu hon co mat
// truoc ghi so LDCT - khong nhat quan giua cac mau cu, chon mau moi nhat
// lam chuan, xem NHAT_KY_QUYET_DINH.md).
// ---------------------------------------------------------------------------

export interface ChangGddDeIn {
  noiDi: string;
  noiDen: string;
  ngay?: Date | string | null;
}

export interface GiayDiDuongDeIn {
  soHieu: string;
  ngayKy: Date;
  hoTen: string;
  chucVu: string;
  noiDi: string;
  noiDen: string;
  ngayDi: Date;
  ngayVe: Date;
  nguoiKyHoTen: string;
  nguoiKyChucDanh: string;
  nguoiKyTheThuc: string;
  cacChang?: ChangGddDeIn[] | null;
  chieuCaoHangMm?: number | null;
  coChuPt?: number | null;
}

/** 1 dong "Nơi đi:"/"Nơi đến:" trong o "Noi di va den" cua bang GDD mat
 * truoc. LICH SU 3 cach (2026-08-17, xem chi tiet o class .dong-noi-di-den
 * trong cssKhung()): (1) &nbsp; co dinh - khong thang hang do 2 nhan dai
 * khac nhau; (2) padding-left/text-indent AM (thut dong treo "co dien") -
 * GAY LOI voi table-layout:auto, lam nhan bi tran ra ngoai bang; (3) HIEN
 * TAI dung FLEXBOX (khong gia tri am nao) - an toan, khong con loi tran. */
function dongNoiDiDen(nhan: "Nơi đi" | "Nơi đến", giaTri: string): string {
  return `<div class="dong-noi-di-den"><span class="nhan-noi-di-den">${nhan}:</span><span class="gia-tri-noi-di-den">${thoat(giaTri)}</span></div>`;
}

/** Uoc luong so dong 1 chuoi se xuong khi in trong cot "Noi di va den" cua
 * bang GDD mat truoc (~74mm rong sau khi tru 2 cot Ngay/Chung nhan, font Be
 * Vietnam Pro 9pt) - dung ky tu/dong ~44 (74mm / ~1.65mm trung binh 1 ky tu
 * tieng Viet co dau, uoc luong tho, KHONG do bang trinh duyet that vi sandbox
 * lam viec cua Claude khong render duoc PDF, xem quyet dinh 2026-08-07 "Buoc
 * 7 lo trinh"). Dung CHUNG cho ca 2 hang dong (Noi di/Noi den) de tinh chieu
 * cao hang thuc te, roi ap dung LAI cho 2 hang trong ben duoi (xem
 * tinhChieuCaoHangDongGdd). */
function uocLuongSoDong(vanBan: string): number {
  const SO_KY_TU_MOI_DONG = 44;
  return Math.max(1, Math.ceil(vanBan.length / SO_KY_TU_MOI_DONG));
}

/** Chieu cao (mm) cua 2 hang du lieu dau bang GDD mat truoc (Noi di/Noi den)
 * KHI da bat che do "gon" (line-height 1.28, dem 1.5mm 2.2mm - xem
 * .trang.gdd-gon trong cssKhung()) - ca 2 hang nay LUON co cung so dong (moi
 * hang deu chua CA "Nơi đi: X" LAN "Nơi đến: Y", chi doi cho AI la Noi
 * di/Noi den, khong doi tong do dai), nen chi can tinh 1 lan. Dung ket qua
 * nay lam chieu cao cho 2 hang TRONG (danh cho lan di sau) ngay ben duoi, de
 * ca 4 hang bang cao BANG NHAU thay vi 2 hang trong nhin thap han han va bo
 * trong 1 khoang lon o cuoi trang - nguoi dung phan hoi 2026-08-14 (kem anh
 * mau in that), xem NHAT_KY_QUYET_DINH.md.
 *
 * SAN 14mm (2026-08-17): nguong kich hoat che do "gon" (NGUONG_CANH_BAO_NHE_
 * DO_DAI_NOI_DI_DEN = 35, dem tren tong do dai Noi di + Noi den) la mot con
 * so THO, khong dam bao noi dung THUC SU xuong dong trong o 74mm (uocLuongSoDong
 * gioi han 44 ky tu/dong) - co truong hop vuot nguong 35 nhung van chi 1 dong
 * moi truong (vd "Đồng Tháp, Cà Mau, Sóc Trăng", 28 ky tu), khi do cong thuc
 * ben duoi tinh ra chi ~11mm - THAP HON CA 14mm cua nhanh mac dinh - cong voi
 * khoi ky cung bi thu gon (gon=true), lam bang de trong khoang lon cuoi trang
 * (nguoi dung phan hoi kem anh in that 2026-08-17, xem NHAT_KY_QUYET_DINH.md).
 * Chan san toi thieu bang dung 14mm (= gia tri co dinh cua nhanh mac dinh) de
 * tranh che do "gon" tinh ra hang THAP HON ca khong "gon" - khong doi nguong
 * kich hoat/khoi ky (giu logic tu 2026-08-14 nguyen ven, chi chan san o day). */
function tinhChieuCaoHangDongGdd(gdd: GiayDiDuongDeIn): number {
  const CO_CHU_PT = 9;
  const LINE_HEIGHT_GON = 1.28;
  const DEM_DOC_MM = 1.5; // dem tren + dem duoi rieng (padding: 1.5mm 2.2mm trong .gdd-gon)
  // 2026-08-26: TUNG thu tang 14mm -> 22mm de lap khoang trang cuoi trang mat
  // truoc GDD (xem NHAT_KY_QUYET_DINH.md) nhung nguoi dung phan hoi kem anh in
  // that: bang bi day tran sang trang 2 (dong 3-4 + phan header lap lai) - kho
  // A5 mat truoc CHUA du cao de chua them +32mm nhu uoc luong ban dau (uoc
  // luong sai, khong tinh het chieu cao thuc te cua letterhead+4 dong+khoi ky
  // phia tren bang). Quay ve 14mm, roi thu lai NHE hon: 14mm -> 16mm (+2mm/
  // hang x4 hang = +8mm, an toan hon nhieu so voi +32mm da gay tran truoc do)
  // - nguoi dung yeu cau thu muc nay, CHUA co xac nhan ket qua in that. Xem
  // NHAT_KY_QUYET_DINH.md.
  const SAN_TOI_THIEU_MM = 16;
  const soDong = uocLuongSoDong(`Nơi đi: ${gdd.noiDi}`) + uocLuongSoDong(`Nơi đến: ${gdd.noiDen}`);
  const chieuCaoDongMm = CO_CHU_PT * LINE_HEIGHT_GON * 0.3528; // 1pt = 0.3528mm
  return Math.max(soDong * chieuCaoDongMm + 2 * DEM_DOC_MM, SAN_TOI_THIEU_MM);
}

/** Nguong don gian (tong do dai Noi di + Noi den) de phat hien truong hop
 * "Noi den" liet ke nhieu dia diem/tinh cung luc (vd "Cần Thơ (Ninh Kiều), Cà
 * Mau (Bạc Liêu, An Xuyên)") - noi dung dai nhu vay TU XUONG DONG nhieu lan
 * trong o "Noi di va den" (chi 74mm rong), day chieu cao 2 hang dau cua bang
 * vuot qua phan con lai cua trang A5 (min-height, KHONG tu dong len A4 nhu
 * LDCT vi GDD LUON co dinh A5 theo CLAUDE.md), lam ca trang tran sang trang 2
 * dang do. Khi vuot nguong: THU GON khoang trong danh cho ky ten/dau (khoiKy
 * gon=true) + dat chieu cao 2 hang trong danh cho lan di sau BANG DUNG chieu
 * cao 2 hang du lieu dau bang (tinhChieuCaoHangDongGdd) - vua bu lai phan
 * chieu cao bang da tang them de giu dung 1 trang A5, VUA lap day khoang
 * trong con lai o cuoi trang thay vi de trong lang phi (nguoi dung phan hoi
 * 2026-08-14 hai lan: lan 1 "tran trang 2", lan 2 sau khi sua xong lai
 * "khoang duoi con trong nhieu"). Xem NHAT_KY_QUYET_DINH.md. */
function formatNgayChang(ngay: Date | string | null | undefined): string {
  if (!ngay) return "";
  const d = typeof ngay === "string" ? new Date(ngay) : ngay;
  return isNaN(d.getTime()) ? String(ngay) : dinhDangNgayDiDenMauIn(d);
}

function noiDungMatTruocGdd(
  gdd: GiayDiDuongDeIn,
  cauHinhDonVi: CauHinhDonVi,
  chieuCaoTuyChonMm?: number | null,
  coChuTuyChonPt?: number | null,
): string {
  const danhSachChang: ChangGddDeIn[] =
    gdd.cacChang && gdd.cacChang.length > 0
      ? gdd.cacChang.filter((c) => c && (c.noiDi?.trim() || c.noiDen?.trim()))
      : [];

  const coChangTuyChinh = danhSachChang.length > 0;
  const soLuongChang = coChangTuyChinh ? danhSachChang.length : 2;

  const tongDoDai = coChangTuyChinh
    ? danhSachChang.reduce((sum, c) => sum + (c.noiDi?.length ?? 0) + (c.noiDen?.length ?? 0), 0)
    : (gdd.noiDi?.length ?? 0) + (gdd.noiDen?.length ?? 0);

  const noiDungDai = soLuongChang >= 3 || tongDoDai > NGUONG_CANH_BAO_NHE_DO_DAI_NOI_DI_DEN;

  // Chieu cao hang: neu nguoi dung tuy chinh (chieuCaoTuyChonMm hoac gdd.chieuCaoHangMm)
  // thi ap dung chieu cao do cho ca 4 hang (style height tren td).
  const caoHangCoDinh =
    chieuCaoTuyChonMm && chieuCaoTuyChonMm > 0
      ? chieuCaoTuyChonMm
      : gdd.chieuCaoHangMm && gdd.chieuCaoHangMm > 0
        ? gdd.chieuCaoHangMm
        : null;

  // Co chu tuy chinh cho bang noi di va den (7-14pt)
  const coChuApDung =
    coChuTuyChonPt && coChuTuyChonPt > 0
      ? coChuTuyChonPt
      : gdd.coChuPt && gdd.coChuPt > 0
        ? gdd.coChuPt
        : null;
  const styleCoChu = coChuApDung ? `; font-size: ${coChuApDung}pt;` : "";

  const caoHangTrong = caoHangCoDinh
    ? `${caoHangCoDinh}mm`
    : noiDungDai && soLuongChang <= 2
      ? `${tinhChieuCaoHangDongGdd(gdd).toFixed(1)}mm`
      : "14mm";
  const caoHangTrongRong = caoHangCoDinh ? `${caoHangCoDinh}mm` : "14mm";

  let hangData: { noiDi: string; noiDen: string; ngay: string; trong?: boolean }[] = [];
  if (soLuongChang <= 2) {
    const c1 = danhSachChang[0] ?? { noiDi: gdd.noiDi, noiDen: gdd.noiDen, ngay: gdd.ngayDi };
    const c2 = danhSachChang[1] ?? { noiDi: gdd.noiDen, noiDen: gdd.noiDi, ngay: gdd.ngayVe };
    hangData = [
      { noiDi: c1.noiDi, noiDen: c1.noiDen, ngay: formatNgayChang(c1.ngay) },
      { noiDi: c2.noiDi, noiDen: c2.noiDen, ngay: formatNgayChang(c2.ngay) },
      { noiDi: "", noiDen: "", ngay: "", trong: true },
      { noiDi: "", noiDen: "", ngay: "", trong: true },
    ];
  } else if (soLuongChang === 3) {
    // Sửa 2026-10-26 (yêu cầu người dùng):
    // In lần lượt Chặng 1, Chặng 2, Chặng 3, và hiện lại HÀNG 4 TRỐNG
    hangData = [
      { noiDi: danhSachChang[0].noiDi, noiDen: danhSachChang[0].noiDen, ngay: formatNgayChang(danhSachChang[0].ngay) },
      { noiDi: danhSachChang[1].noiDi, noiDen: danhSachChang[1].noiDen, ngay: formatNgayChang(danhSachChang[1].ngay) },
      { noiDi: danhSachChang[2].noiDi, noiDen: danhSachChang[2].noiDen, ngay: formatNgayChang(danhSachChang[2].ngay) },
      { noiDi: "", noiDen: "", ngay: "", trong: true },
    ];
  } else {
    // 4 chang
    hangData = danhSachChang.slice(0, 4).map((c) => ({
      noiDi: c.noiDi,
      noiDen: c.noiDen,
      ngay: formatNgayChang(c.ngay),
    }));
  }

  const tuDongChiaSatMep = !caoHangCoDinh;

  const cacHangHtml = hangData
    .map((h) => {
      const chieuCaoStyle = caoHangCoDinh ? ` style="height:${caoHangCoDinh}mm;"` : "";
      return `<tr${tuDongChiaSatMep ? ' style="height:25%;"' : ""}>
            <td${chieuCaoStyle}>${dongNoiDiDen("Nơi đi", h.noiDi)}${dongNoiDiDen("Nơi đến", h.noiDen)}</td>
            <td style="white-space:nowrap; vertical-align:middle;"><strong>${thoat(h.ngay)}</strong></td>
            <td></td>
          </tr>`;
    })
    .join("");

  const bangClass = `bang-in${tuDongChiaSatMep ? " bang-tu-dong" : ""}`;
  const bangStyle = tuDongChiaSatMep
    ? ` style="flex:1 1 auto; height:100%; margin:4mm 0 0;${styleCoChu}"`
    : ` style="margin-top:5mm;${styleCoChu}"`;

  return `<div class="trang gdd-mat-truoc${noiDungDai ? " gdd-gon" : ""}">
    ${trangMoHinh(cauHinhDonVi)}
    <div class="noi-dung">
      ${khoiLetterhead(gdd.soHieu, gdd.ngayKy, cauHinhDonVi)}
      <div class="tieu-de-chinh" style="margin: 5mm 0 4mm; text-transform:uppercase;">Công lệnh (kiêm) giấy đi đường</div>
      <!-- Bo <em> (in nghieng) khoi 4 dong nay (2026-08-14, nguoi dung yeu
           cau) - chi giu <strong> (in dam), khong con nghieng nhu truoc. -->
      <p style="margin: 0 0 2mm;">Cấp cho Anh (Chị): <strong>${thoat(gdd.hoTen)}</strong></p>
      <p style="margin: 0 0 2mm;">Chức vụ: <strong>${thoat(gdd.chucVu)}</strong></p>
      <p style="margin: 0 0 2mm;">Được cử đi công tác tại: <strong>${thoat(gdd.noiDen)}</strong></p>
      <p style="margin: 0 0 4mm;">Từ ngày: <strong>${dinhDangNgayDiDenMauIn(new Date(gdd.ngayDi))}</strong> &nbsp; Đến ngày: <strong>${dinhDangNgayDiDenMauIn(new Date(gdd.ngayVe))}</strong></p>
      ${khoiKy(gdd.nguoiKyTheThuc, gdd.nguoiKyHoTen, gdd.nguoiKyChucDanh, noiDungDai)}
      <table class="${bangClass}"${bangStyle}>
        <thead>
          <tr>
            <th>Nơi đi và đến</th>
            <!-- white-space:nowrap (2026-08-14) - cot nay dung table-layout
                 auto (khong fixed), do rong "width" chi la GOI Y nen co the
                 bi trinh duyet thu hep hon 22mm neu 2 cot con lai can cho -
                 ngay dd/mm/yyyy (10 ky tu co dinh) khi do bi xuong dong giua
                 chung "15/08/20" + "26" nhin rat xau. Ep khong xuong dong de
                 trinh duyet tu no rong cot theo dung noi dung, khong anh
                 huong gi den cot "Noi di va den" (van tu xuong dong binh
                 thuong, khong dinh nowrap). Xem NHAT_KY_QUYET_DINH.md. -->
            <th style="width:22mm; white-space:nowrap;">Ngày</th>
            <th style="width:32mm;">Chứng nhận của cơ quan</th>
          </tr>
        </thead>
        <tbody>
          ${cacHangHtml}
        </tbody>
      </table>
    </div>
  </div>`;
}

function noiDungMatSauGdd(gdd: GiayDiDuongDeIn, cauHinhDonVi: CauHinhDonVi): string {
  // Dung dung so dong ke tung muc theo anh mau giay that nguoi dung gui
  // (2026-08-10, sua lai IV lan 2 tu 2->3 dong theo phan hoi tiep theo):
  // I=2 dong, II=3 dong, III=2 dong, IV=3 dong - truoc do chi 1/2/1/1, thieu
  // cho so voi mau. Them margin-top cho nhan muc de tao khoang cach tach
  // biet giua cac khoi, giong anh mau.
  // Dong ke KHONG dung border-bottom: dotted - CSS border-style dang cham
  // duoc trinh duyet/bo may PDF tu tinh so luong + khoang cach cham theo
  // do dai dong va DPI rieng, nen ban xem truoc (man hinh) va ban PDF in ra
  // hien cham to/nho/khac nhau du cung 1 CSS (nguoi dung phat hien
  // 2026-08-10). Doi sang background-image (linear-gradient lap lai) - ve
  // dong ke bang 1 hoa tiet nen co kich thuoc cham/khoang trong CO DINH theo
  // mm, khong phu thuoc bo may render nao ca -> giao dien va ban in giong
  // het nhau. Nhan tien lam dong ke mo hon (rgba đen 0.22, truoc la mau dac
  // #999) theo yeu cau.
  //
  // SUA 2026-08-19: background-image lai gap loi KHAC - nguoi dung phan hoi
  // "hien thi trong mau in (xem truoc) nhung in ra giay khong thay". Nguyen
  // nhan: day la "background", ma NHIEU trinh xem PDF/driver may in co san
  // 1 tuy chon rieng "In mau nen/hinh anh nen" (vd "Print background
  // graphics/colors") THUONG TAT MAC DINH de tiet kiem muc/toner - background
  // (ke ca gradient dung lam duong ke) bi bo qua khi in that du van hien
  // binh thuong khi xem tren man hinh (2 luong render khac nhau: xem =
  // browser/PDF viewer thuong BAT san background; in that = driver may in tu
  // quyet dinh theo cai dat rieng cua no). Border (net ve, khong phai nen)
  // KHONG bi anh huong boi tuy chon nay - luon in du cai dat the nao.
  //
  // Doi sang border-bottom (khong con background) - luon in ra giay bat ke
  // cai dat "in nen" cua trinh xem/may in (khac voi background o tren).
  //
  // KIEU NET: nguoi dung hoi lai co dung duoc net dut/cham khong (giong ban
  // giay goc hon net lien). Duoc - nhuoc diem DPI cua border-style:dotted/
  // dashed (ghi chu 2026-08-10 o tren) CHI la lech MAT DO cham/net giua xem
  // truoc va PDF in ra (cham to/nho/thua/day khac chut), KHONG PHAI loi "an
  // mat khi in" nhu background - do la 2 loi khac han nhau, khac phuc loi
  // "an mat" (nghiem trong hon) khong bat buoc phai chon lai net lien. Da hoi
  // lai nguoi dung (AskUserQuestion) - chon net DUT (dashed) thay vi cham
  // (dotted): vua giong ban giay goc hon net lien, vua it lo ro chenh lech
  // hinh dang hon dotted khi so luong net tinh khac nhau giua may render.
  // Nguoi dung yeu cau 2026-08-19, xem NHAT_KY_QUYET_DINH.md.
  const dongKe = `<p style="margin: 0 0 5mm; height: 5mm; border-bottom: 1px dashed rgba(0,0,0,0.45);"></p>`;

  const muc = (nhan: string, soDongTrong: number) =>
    `<p style="margin: 5mm 0 2mm; font-weight:700;">${nhan}</p>` +
    Array.from({ length: soDongTrong })
      .map(() => dongKe)
      .join("");

  // height (khong phai min-height) de noi dung neo dung vao trang vat ly -
  // trang mat sau co noi dung co dinh (khong co truong nhap tay dai vo han)
  // nen chac chan vua 1 trang A5, an toan khi dat height tuyet doi.
  //
  // KHONG con khoi letterhead (UBND tinh/ten cong ty/quoc hieu) o cuoi trang
  // nhu ban truoc - nguoi dung yeu cau bo han vi bi dinh/chong len hinh mo
  // logo o giua trang (xem NHAT_KY_QUYET_DINH.md). So hieu/ngay ky da co san
  // o letterhead mat truoc, khong can lap lai o mat sau.
  return `<div class="trang" style="height: 210mm;">
    ${trangMoHinh(cauHinhDonVi)}
    <div class="noi-dung">
      <!-- "Phan ke thanh toan" KHONG nam trong nhom 3 tieu de chinh (LENH DIEU
           XE / LENH DIEU CONG TAC / CONG LENH KIEM GIAY DI DUONG) duoc yeu cau
           dua ve chung 14pt (2026-08-17) - giu nguyen font-size:18pt cu bang
           cach ghi de rieng tai day, tranh bi anh huong khi giam size mac
           dinh cua .tieu-de-chinh. Xem NHAT_KY_QUYET_DINH.md. -->
      <div class="tieu-de-chinh" style="font-size:18pt; margin: 2mm 0 6mm; text-transform:uppercase;">Phần kê thanh toán</div>
      ${muc("I. Tiền tàu xe:", 2)}
      ${muc("II. Phụ cấp lưu trú:", 3)}
      ${muc("III. Chi khác:", 2)}
      ${muc("IV. Tổng cộng:", 3)}
      <div style="display:flex; justify-content:space-between; margin-top:10mm; text-align:center; font-size:9.5pt;">
        <div style="width:48%;">
          <div style="font-weight:800;">NGƯỜI ĐI CÔNG TÁC</div>
          <div>(Ký tên, ghi rõ họ tên)</div>
        </div>
        <div style="width:48%;">
          <div style="font-weight:800;">XÁC NHẬN PHÒNG TV – KT</div>
          <div>(Ký tên, ghi rõ họ tên)</div>
        </div>
      </div>
    </div>
  </div>`;
}

/** File PDF "toan bo Cong lenh/Giay di duong" cua 1 LDCT (2 mat/nguoi, chi
 * lay GDD dang hoat dong - daHuy=false). Dung khi bam nut "In toan bo cong
 * lenh/giay di duong" o trang chi tiet. */
export function taoHtmlGiayDiDuongHangLoat(
  danhSach: GiayDiDuongDeIn[],
  cauHinhDonVi: CauHinhDonVi,
  chieuCaoHangMm?: number | null,
  coChuPt?: number | null,
): string {
  const trangs = danhSach
    .map(
      (gdd) =>
        noiDungMatTruocGdd(
          gdd,
          cauHinhDonVi,
          chieuCaoHangMm ?? gdd.chieuCaoHangMm,
          coChuPt ?? gdd.coChuPt,
        ) + noiDungMatSauGdd(gdd, cauHinhDonVi),
    )
    .join("");
  return boc("A5", "Công lệnh kiêm giấy đi đường", trangs, cauHinhDonVi.phongChuMauIn, cauHinhDonVi.tyLeXHeightMauIn);
}
