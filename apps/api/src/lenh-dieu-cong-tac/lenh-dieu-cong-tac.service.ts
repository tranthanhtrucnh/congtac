import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, LoaiChungTu } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { NhatKyService } from "../common/nhat-ky/nhat-ky.service";
import { DanhSoService } from "../danh-so/danh-so.service";
import { dinhDangSoChungTu, KY_HIEU_LOAI_CHUNG_TU } from "@congtac/shared";
import type {
  DanhSachLenhDieuCongTacInput,
  TaoLenhDieuCongTacInput,
  SuaLenhDieuCongTacInput,
  HuyLenhDieuCongTacInput,
  XoaCungLenhDieuCongTacInput,
  DanhSachGiayDiDuongInput,
} from "@congtac/validation";
import { chonKhoGiayLenhDieuCongTac } from "./lenh-dieu-cong-tac-mau-in";

// Chi dung khi CSDL chua co dia diem nao danh dau "Noi di mac dinh" (Danh
// muc Dia diem, /dia-diem) - binh thuong luon uu tien lay tu do (xem
// layNoiDiMacDinh() ben duoi). Dong bo voi ten day du cua ban ghi mac dinh
// trong them-dia-diem-mau.ts. Nguoi dung yeu cau 2026-08-14, xem
// NHAT_KY_QUYET_DINH.md.
const NOI_DI_MAC_DINH_DU_PHONG = "P. Long Xuyên, An Giang";

// Muc dich cua LenhDieuXe sinh kem LDCT LUON la "Cong tac", KHONG lay theo
// Muc dich thuc te cua LDCT (2 khai niem khac nhau - Muc dich cua LDCT mo ta
// ly do chuyen cong tac cu the, con Muc dich cua LDX chi la ly do dieu dong
// xe chung chung). Nguoi dung xac nhan 2026-08-14, xem NHAT_KY_QUYET_DINH.md
// muc "LDX luon mac dinh Muc dich 'Cong tac'". Van sua rieng duoc sau do qua
// dialog Sua LDX (/lenh-dieu-xe) - day chi la GIA TRI MAC DINH luc sinh/dong
// bo, khong khoa cung.
const MUC_DICH_MAC_DINH_LENH_DIEU_XE = "Công tác";

// "Chuc vu" chup lai (snapshot) vao ThanhVienLenhDieuCongTac luc them thanh
// vien - neu la chuc danh chung chung "Nhan vien" (khong phai Truong/Pho
// phong, Giam doc...) thi ghep them thong tin ro hon:
// - Neu la tai xe (NhanVien.laTaiXe = true, danh dau co dinh trong Danh muc
//   Nhan vien, KHONG phai chi khi duoc chon lai xe cho chuyen di nay) -> ghi
//   "Nhân viên Lái xe", KHONG ghi phong ban hanh chinh cua ho (vd "Nhân viên
//   Phòng Kế hoạch") vi tren chung tu in, vai tro thuc te cua ho trong doan
//   la lai xe, khong phai phong ban hanh chinh - de nham lan/khong ro rang.
//   Ap dung cho MOI lan tai xe xuat hien trong 1 doan cong tac (thanh vien
//   binh thuong hay duoc chon lam lai xe LDX cho chuyen do), khong chi rieng
//   truong hop dang lai xe hom do. Nguoi dung yeu cau 2026-08-17.
// - Nguoc lai, neu co du lieu donViCongTac -> ghep TEN PHONG BAN DAY DU
//   (KHONG viet tat o day nua - xem ghi chu ben duoi), vi du "Nhân viên
//   Phòng Trả thưởng - Kho quỹ".
// Chi ap dung khi chucVu (sau khi bo khoang trang dau/cuoi, khong phan biet
// hoa/thuong) dung bang "nhan vien". Nguoi dung yeu cau 2026-08-17, xem
// NHAT_KY_QUYET_DINH.md.
//
// QUAN TRONG (sua 2026-08-19): TRUOC DAY ham nay tu viet tat ten phong ban
// (qua vietTatPhongBan(), da xoa) ngay LUC SNAPSHOT - nghia la GHI CUNG ban
// viet tat vao CSDL, dung CHUNG cho ca bang thanh vien LDCT (can gon vi bang
// chat) LAN mau in GDD (Cong lenh kiem Giay di duong, cung doc thang tu
// ThanhVienLenhDieuCongTac.chucVu, xem layMotGiayDiDuongDeIn()/
// layNhieuGiayDiDuongDeIn() ben duoi). Nguoi dung phat hien GDD "phần hiển
// thị chức vụ còn trống" (khong can rut gon nhu LDCT) nhung van bi an huong
// vi doc chung 1 truong da bi rut gon san. Sua: chup lai FULL (khong rut
// gon), viec viet tat CHI con ap dung o RENDER TIME rieng cho bang LDCT
// (xem apDungVietTatPhongBanLucInLdct() trong lenh-dieu-cong-tac-mau-in.ts)
// - GDD tu do luon hien day du, dung nguyen ban chup lai. Xem NHAT_KY_QUYET_DINH.md.
function chucVuKemPhongBan(nv: { chucVu: string; donViCongTac: string | null; laTaiXe: boolean }): string {
  const chucVuGon = nv.chucVu.trim();
  if (chucVuGon.toLowerCase() !== "nhân viên") {
    return nv.chucVu;
  }
  if (nv.laTaiXe) {
    return `${chucVuGon} Lái xe`;
  }
  if (nv.donViCongTac?.trim()) {
    return `${chucVuGon} ${nv.donViCongTac.trim()}`;
  }
  return nv.chucVu;
}

/**
 * Lenh dieu cong tac (LDCT) - xem docs/QUY_TAC_NGHIEP_VU.md muc "Lenh dieu
 * cong tac (LDCT)" va NHAT_KY_QUYET_DINH.md muc "LDCT sinh kem GDD va LDX".
 *
 * KIEN TRUC QUAN TRONG - khac voi LenhDieuXeService:
 * - tao(): 1 transaction duy nhat cap so + tao ca LDCT, N GiayDiDuong (1/thanh
 *   vien), va 1 LenhDieuXe neu co tai xe + bien so (CLAUDE.md quy tac TUYET
 *   DOI #1).
 * - GiayDiDuong KHONG snapshot cac truong "tu dong theo LDCT" (noi di/den,
 *   ngay, phuong tien, nguoi ky) - cac truong nay tinh dong luc doc (xem
 *   layChiTietGiayDiDuong()), khac voi LenhDieuXe (snapshot hoan toan).
 * - LenhDieuXe sinh kem VAN snapshot binh thuong nhu LDX doc lap, nhung duoc
 *   GHI DE lai (khong doc dong) khi sua LDCT anh huong TRUC TIEP den tai xe
 *   do (doi tai xe/bien so/ngay rieng, hoac LDCT thuc su doi Noi den) - xem
 *   dongBoLenhDieuXe(). RIENG Muc dich cua LDX KHONG BAO GIO dong bo tu LDCT -
 *   luon mac dinh "Cong tac" luc sinh, sua rieng duoc qua dialog Sua LDX,
 *   khong bi ghi de lai sau do. Xem MUC_DICH_MAC_DINH_LENH_DIEU_XE.
 */
@Injectable()
export class LenhDieuCongTacService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nhatKy: NhatKyService,
    private readonly danhSo: DanhSoService,
  ) {}

  async danhSach(truyVan: DanhSachLenhDieuCongTacInput) {
    const { trang, kichThuoc, tuKhoa, daHuy, nam, loaiMauIn, chiTaiXeRieng, sapXepTheo, huongSapXep } = truyVan;

    // "To chi co 1 minh tai xe" - dac diem TACH BIET voi loaiMauIn, khong the
    // dien ta bang 1 dieu kien where() don gian cua Prisma (can dem SO LUONG
    // thanh vien con hoat dong = 1, ket hop voi kiem tra LDX dang hoat dong
    // co thanhVienTaiXeId trung dung nguoi do) - dung 1 truy van SQL tho rieng
    // de lay truoc danh sach id khop dieu kien, roi loc tiep bang
    // where.id.in cho dung voi cac bo loc con lai (tuKhoa, daHuy...) VA phan
    // trang van chinh xac (chi 1 truy van where duy nhat quyet dinh tap ket
    // qua cuoi). Xem laLenhTaiXeRieng() o frontend (page.tsx) - dinh nghia
    // giong het, chi khac la tinh o tang CSDL thay vi tinh tren du lieu da
    // tai ve. Nguoi dung yeu cau 2026-08-14, xem NHAT_KY_QUYET_DINH.md.
    let idTaiXeRieng: string[] | undefined;
    if (chiTaiXeRieng) {
      const ketQua = await this.prisma.$queryRaw<{ id: string }[]>`
        SELECT ldct.id
        FROM lenh_dieu_cong_tac ldct
        WHERE (
          SELECT COUNT(*) FROM thanh_vien_lenh_dieu_cong_tac tv
          WHERE tv."lenhDieuCongTacId" = ldct.id AND tv."daLoaiKhoiDoan" = false
        ) = 1
        AND EXISTS (
          SELECT 1 FROM lenh_dieu_xe ldx
          JOIN thanh_vien_lenh_dieu_cong_tac tv2 ON tv2.id = ldx."thanhVienTaiXeId"
          WHERE ldx."lenhDieuCongTacId" = ldct.id
            AND ldx."daHuy" = false
            AND tv2."daLoaiKhoiDoan" = false
        )
      `;
      idTaiXeRieng = ketQua.map((r) => r.id);
    }

    const where: Prisma.LenhDieuCongTacWhereInput = {
      ...(daHuy !== undefined ? { daHuy } : {}),
      ...(nam ? { nam } : {}),
      ...(loaiMauIn ? { loaiMauIn } : {}),
      ...(idTaiXeRieng ? { id: { in: idTaiXeRieng } } : {}),
      ...(tuKhoa && tuKhoa.trim()
        ? {
            OR: [
              { soHieu: { contains: tuKhoa.trim(), mode: "insensitive" } },
              { diaDiemCongTac: { contains: tuKhoa.trim(), mode: "insensitive" } },
            ],
          }
        : {}),
    };

    // Khong chon cot sap xep -> mac dinh chung tu moi nhat len dau
    // (nam+soThuTu giam dan). Co chon -> sap xep theo dung cot + huong yeu cau.
    const orderBy: Prisma.LenhDieuCongTacOrderByWithRelationInput[] =
      sapXepTheo === "diaDiemCongTac"
        ? [{ diaDiemCongTac: huongSapXep }]
        : sapXepTheo === "ngayDi"
          ? [{ ngayDi: huongSapXep }]
          : sapXepTheo === "ngayVe"
            ? [{ ngayVe: huongSapXep }]
            : sapXepTheo === "soHieu"
              ? [{ nam: huongSapXep }, { soThuTu: huongSapXep }]
              : [{ nam: "desc" }, { soThuTu: "desc" }];

    const [duLieuTho, tong] = await this.prisma.$transaction([
      this.prisma.lenhDieuCongTac.findMany({
        where,
        orderBy,
        skip: (trang - 1) * kichThuoc,
        take: kichThuoc,
        // orderBy thuTu de danh sach ten thanh vien hien o cot "Thanh vien"
        // dung thu tu nhu luc lap (khong phai thu tu ngau nhien tu CSDL).
        // lenhDieuXe: truoc day KHONG include o day (chi co o chiTiet()) -
        // frontend can den de tinh "lenh chi co 1 minh tai xe" (badge "Tai xe
        // rieng" o danh sach, xem laLenhTaiXeRieng() trong page.tsx) - thieu
        // include nay lam badge KHONG BAO GIO hien du du lieu thanh vien
        // dung dieu kien, vi ldct.lenhDieuXe luon la undefined tren man hinh
        // danh sach. Nguoi dung phat hien 2026-08-13, xem NHAT_KY_QUYET_DINH.md.
        include: {
          thanhVien: { where: { daLoaiKhoiDoan: false }, orderBy: { thuTu: "asc" } },
          lenhDieuXe: true,
        },
      }),
      this.prisma.lenhDieuCongTac.count({ where }),
    ]);

    // laSoMoiNhat: dung de an/hien nut Xoa cung o frontend (xoaCung() o duoi
    // se TU KIEM TRA LAI dieu kien nay o server truoc khi xoa that - day chi
    // la GOI Y hien thi, dung 1 truy van groupBy DUY NHAT cho moi nam xuat
    // hien trong trang hien tai, tinh tren TOAN BO bang (khong bi anh huong
    // boi bo loc/tim kiem dang ap dung) de dam bao dung ke ca khi dang loc.
    // Xem NHAT_KY_QUYET_DINH.md muc "Xoa cung chung tu - don gian hoa 2026-08-20".
    const cacNam = [...new Set(duLieuTho.map((l) => l.nam))];
    const maxTheoNam =
      cacNam.length > 0
        ? await this.prisma.lenhDieuCongTac.groupBy({
            by: ["nam"],
            where: { nam: { in: cacNam } },
            _max: { soThuTu: true },
          })
        : [];
    const maxMap = new Map(maxTheoNam.map((m) => [m.nam, m._max.soThuTu]));

    const duLieu = duLieuTho.map((lenh) => ({
      ...lenh,
      soThanhVien: lenh.thanhVien.length,
      laSoMoiNhat: maxMap.get(lenh.nam) === lenh.soThuTu,
    }));

    return { duLieu, tong, trang, kichThuoc };
  }

  /** Chi tiet day du: LDCT + toan bo thanh vien (ke ca da loai khoi doan, de
   * con xem lai lich su) + GDD tho cua tung nguoi + LDX lien ket neu co. */
  async chiTiet(id: string) {
    const lenh = await this.prisma.lenhDieuCongTac.findUnique({
      where: { id },
      include: {
        thanhVien: { orderBy: { thuTu: "asc" }, include: { giayDiDuong: true } },
        lenhDieuXe: true,
      },
    });
    if (!lenh) {
      throw new NotFoundException("Không tìm thấy lệnh điều công tác");
    }
    return lenh;
  }

  /** Noi di mac dinh dung cho GDD/LDX sinh kem - lay tu Danh muc dia diem
   * (co "diemDiMacDinh"), khong bat buoc phai co (fallback van ban co dinh) -
   * xem docs/QUY_TAC_NGHIEP_VU.md muc "Danh muc dia diem cong tac". */
  private async layNoiDiMacDinh(client: Prisma.TransactionClient | PrismaService): Promise<string> {
    const diaDiem = await client.diaDiem.findFirst({ where: { diemDiMacDinh: true } });
    return diaDiem?.tenDayDu ?? NOI_DI_MAC_DINH_DU_PHONG;
  }

  /**
   * Tinh cac truong "tu dong theo LDCT" cua 1 GDD TAI THOI DIEM GOI HAM (khong
   * luu tinh) - dung cho ca man hinh chi tiet lan mau in PDF. Xem doc comment
   * tren model GiayDiDuong trong schema.prisma.
   */
  layChiTietGiayDiDuong(
    lenh: {
      diaDiemCongTac: string;
      ngayDi: Date;
      ngayVe: Date;
      nguoiKyHoTen: string;
      nguoiKyChucDanh: string;
      nguoiKyTheThuc: string;
      lenhDieuXe?: { bienSo: string; nhanHieu: string; daHuy: boolean }[];
    },
    thanhVien: { ngayDiRieng: Date | null; ngayVeRieng: Date | null },
    gdd: { noiDiRieng: string | null; noiDenRieng: string | null },
    noiDiMacDinh: string,
  ) {
    const phuongTien = lenh.lenhDieuXe?.find((l) => !l.daHuy);
    return {
      noiDi: gdd.noiDiRieng ?? noiDiMacDinh,
      noiDen: gdd.noiDenRieng ?? lenh.diaDiemCongTac,
      ngayDi: thanhVien.ngayDiRieng ?? lenh.ngayDi,
      ngayVe: thanhVien.ngayVeRieng ?? lenh.ngayVe,
      phuongTienSuDung: phuongTien ? `${phuongTien.bienSo} (${phuongTien.nhanHieu})` : null,
      nguoiKyHoTen: lenh.nguoiKyHoTen,
      nguoiKyChucDanh: lenh.nguoiKyChucDanh,
      nguoiKyTheThuc: lenh.nguoiKyTheThuc,
    };
  }

  /** Tap hop du lieu san sang cho mau in "LDCT + LDX" (xem
   * lenh-dieu-cong-tac-mau-in.ts, endpoint GET :id/pdf-lenh). */
  async layDuLieuInLenh(id: string) {
    const lenh = await this.chiTiet(id);
    const thanhVienDangCoTho = lenh.thanhVien.filter((tv) => !tv.daLoaiKhoiDoan);

    // Bu ngay sinh cho thanh vien duoc them vao doan TRUOC khi co truong
    // ThanhVienLenhDieuCongTac.ngaySinh (snapshot null o nhung ban ghi cu) -
    // tra dong tu Danh muc Nhan vien de mau in Tram khong bi trong cot "Nam
    // sinh", KHONG ghi de lai CSDL (chi bu luc doc de in). Thanh vien tao
    // SAU khi co truong nay luon co san ngaySinh, vong lap nay thanh no-op.
    // Nguoi dung phat hien 2026-08-10, xem NHAT_KY_QUYET_DINH.md.
    const idsCanBuNgaySinh = thanhVienDangCoTho
      .filter((tv) => !tv.ngaySinh && tv.nhanVienId)
      .map((tv) => tv.nhanVienId!);
    const ngaySinhBoSung =
      idsCanBuNgaySinh.length > 0
        ? new Map(
            (
              await this.prisma.nhanVien.findMany({
                where: { id: { in: idsCanBuNgaySinh } },
                select: { id: true, ngaySinh: true },
              })
            ).map((nv) => [nv.id, nv.ngaySinh]),
          )
        : new Map<string, Date>();
    // Tinh TRUOC ldxHoatDong (LDX dang hoat dong cua doan, neu co) de biet
    // thanh vien nao la tai xe duoc chi dinh chuyen nay (thanhVienTaiXeId) -
    // dung de mau in ghi de cot Chuc vu thanh "Nhân viên Lái xe" cho dung
    // nguoi do, khop anh mau that (LDCT so 337, nguoi dung gui 2026-08-13).
    const ldxHoatDong = lenh.lenhDieuXe.find((l) => !l.daHuy) ?? null;

    const thanhVienDangCo = thanhVienDangCoTho.map((tv) => ({
      ...tv,
      ngaySinh: tv.ngaySinh ?? (tv.nhanVienId ? (ngaySinhBoSung.get(tv.nhanVienId) ?? null) : null),
      laTaiXe: tv.id === ldxHoatDong?.thanhVienTaiXeId,
    }));

    const khoGiay = chonKhoGiayLenhDieuCongTac(
      thanhVienDangCo.length,
      lenh.mucDich,
      lenh.diaDiemCongTac,
      lenh.loaiMauIn,
    );
    return { lenh, thanhVienDangCo, ldxHoatDong, khoGiay };
  }

  /** Tap hop du lieu san sang cho mau in "toan bo Cong lenh/Giay di duong"
   * (chi lay GDD dang hoat dong - daHuy=false) - xem
   * lenh-dieu-cong-tac-mau-in.ts, endpoint GET :id/pdf-giay-di-duong. */
  async layDuLieuInGiayDiDuong(id: string) {
    const lenh = await this.chiTiet(id);
    const noiDiMacDinh = await this.layNoiDiMacDinh(this.prisma);
    const dsGdd = lenh.thanhVien
      .filter((tv) => tv.giayDiDuong && !tv.giayDiDuong.daHuy)
      .map((tv) => {
        const gdd = tv.giayDiDuong!;
        const chiTiet = this.layChiTietGiayDiDuong(lenh, tv, gdd, noiDiMacDinh);
        return {
          soHieu: gdd.soHieu,
          ngayKy: lenh.ngayKy,
          hoTen: tv.hoTen,
          chucVu: tv.chucVu,
          noiDi: chiTiet.noiDi,
          noiDen: chiTiet.noiDen,
          ngayDi: chiTiet.ngayDi,
          ngayVe: chiTiet.ngayVe,
          nguoiKyHoTen: chiTiet.nguoiKyHoTen,
          nguoiKyChucDanh: chiTiet.nguoiKyChucDanh,
          nguoiKyTheThuc: chiTiet.nguoiKyTheThuc,
        };
      });
    return { lenh, dsGdd };
  }

  /** Danh sach GDD DOC LAP (khong qua 1 LDCT cu the) - dung cho trang
   * /giay-di-duong (2026-08-10, phuc hoi theo yeu cau nguoi dung - xem
   * NHAT_KY_QUYET_DINH.md). Tim theo ten nguoi duoc cap, so hieu GDD, hoac so
   * hieu LDCT lien ket. */
  async danhSachGiayDiDuong(truyVan: DanhSachGiayDiDuongInput) {
    const { trang, kichThuoc, tuKhoa, daHuy, nam, sapXepTheo, huongSapXep } = truyVan;

    const where: Prisma.GiayDiDuongWhereInput = {
      ...(daHuy !== undefined ? { daHuy } : {}),
      ...(nam ? { nam } : {}),
      ...(tuKhoa && tuKhoa.trim()
        ? {
            OR: [
              { soHieu: { contains: tuKhoa.trim(), mode: "insensitive" } },
              { thanhVien: { hoTen: { contains: tuKhoa.trim(), mode: "insensitive" } } },
              { lenhDieuCongTac: { soHieu: { contains: tuKhoa.trim(), mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    // Khong chon cot sap xep -> mac dinh chung tu moi nhat len dau. Co chon
    // -> "nguoiDuocCap"/"diaDiem" sap xep qua quan he (thanhVien/lenhDieuCongTac).
    const orderBy: Prisma.GiayDiDuongOrderByWithRelationInput[] =
      sapXepTheo === "nguoiDuocCap"
        ? [{ thanhVien: { hoTen: huongSapXep } }]
        : sapXepTheo === "diaDiem"
          ? [{ lenhDieuCongTac: { diaDiemCongTac: huongSapXep } }]
          : sapXepTheo === "soHieu"
            ? [{ nam: huongSapXep }, { soThuTu: huongSapXep }]
            : [{ nam: "desc" }, { soThuTu: "desc" }];

    const [duLieuTho, tong] = await this.prisma.$transaction([
      this.prisma.giayDiDuong.findMany({
        where,
        orderBy,
        skip: (trang - 1) * kichThuoc,
        take: kichThuoc,
        include: {
          // ngayDiRieng/ngayVeRieng: them 2026-08-19 - xem giai thich o vong
          // lap ben duoi (danh sach truoc day hien SAI ngay chung cua ca doan
          // thay vi ngay hieu luc THUC SU cua chinh nguoi nay).
          thanhVien: { select: { hoTen: true, chucVu: true, ngayDiRieng: true, ngayVeRieng: true } },
          // loaiMauIn: them 2026-08-13 - frontend can den de to mau chu dong
          // bo cho khop voi mau danh sach LDCT cha (xem mauChuSoHieu() trong
          // apps/web/app/giay-di-duong/page.tsx). Xem NHAT_KY_QUYET_DINH.md.
          lenhDieuCongTac: {
            select: { id: true, soHieu: true, diaDiemCongTac: true, ngayDi: true, ngayVe: true, loaiMauIn: true },
          },
        },
      }),
      this.prisma.giayDiDuong.count({ where }),
    ]);

    // Danh sach truoc day hien THANG ngay chung cua ca doan (lenhDieuCongTac.
    // ngayDi/ngayVe) cho MOI dong, bo qua ngay rieng cua tung thanh vien -
    // nguoi dung phan hoi khong chinh xac: 1 GDD la chung tu CUA RIENG 1
    // nguoi, phai hien dung ngay hieu luc THUC SU cua nguoi do (ngay rieng
    // neu co, khong thi moi ve ngay chung cua doan) - giong het cach
    // layChiTietGiayDiDuong() da tinh cho ban in/chi tiet, chi la truoc day
    // danh sach KHONG ap dung cung 1 phep tinh nay. Ghi de lai
    // lenhDieuCongTac.ngayDi/ngayVe TRUOC KHI tra ve, giu nguyen cac truong
    // khac (soHieu/diaDiemCongTac/loaiMauIn) vi do THUC SU la thong tin dung
    // chung cua ca doan, khong can doi. Nguoi dung yeu cau 2026-08-19, xem
    // NHAT_KY_QUYET_DINH.md.
    const duLieu = duLieuTho.map((gdd) => ({
      ...gdd,
      lenhDieuCongTac: {
        ...gdd.lenhDieuCongTac,
        ngayDi: gdd.thanhVien.ngayDiRieng ?? gdd.lenhDieuCongTac.ngayDi,
        ngayVe: gdd.thanhVien.ngayVeRieng ?? gdd.lenhDieuCongTac.ngayVe,
      },
    }));

    return { duLieu, tong, trang, kichThuoc };
  }

  /** Du lieu san sang cho mau in "1 nguoi" (chi GDD nay, khong ca doan) - dung
   * cho nut in tren trang /giay-di-duong (endpoint GET /giay-di-duong/:id/pdf). */
  async layMotGiayDiDuongDeIn(id: string) {
    const gdd = await this.prisma.giayDiDuong.findUnique({
      where: { id },
      include: { thanhVien: true, lenhDieuCongTac: { include: { lenhDieuXe: true } } },
    });
    if (!gdd) {
      throw new NotFoundException("Không tìm thấy Công lệnh/Giấy đi đường");
    }
    const noiDiMacDinh = await this.layNoiDiMacDinh(this.prisma);
    const chiTiet = this.layChiTietGiayDiDuong(gdd.lenhDieuCongTac, gdd.thanhVien, gdd, noiDiMacDinh);
    return {
      lenhDieuCongTac: gdd.lenhDieuCongTac,
      duLieuIn: {
        soHieu: gdd.soHieu,
        ngayKy: gdd.lenhDieuCongTac.ngayKy,
        hoTen: gdd.thanhVien.hoTen,
        chucVu: gdd.thanhVien.chucVu,
        noiDi: chiTiet.noiDi,
        noiDen: chiTiet.noiDen,
        ngayDi: chiTiet.ngayDi,
        ngayVe: chiTiet.ngayVe,
        nguoiKyHoTen: chiTiet.nguoiKyHoTen,
        nguoiKyChucDanh: chiTiet.nguoiKyChucDanh,
        nguoiKyTheThuc: chiTiet.nguoiKyTheThuc,
      },
    };
  }

  /** Du lieu san sang cho mau in NHIEU GDD cung luc, moi GDD 1 doan
   * mat-truoc+mat-sau (nut "In da chon" o trang /giay-di-duong,
   * 2026-08-10 - xem NHAT_KY_QUYET_DINH.md). Giu dung THU TU nguoi dung da
   * chon (theo mang ids truyen vao), khong theo thu tu tra ve tu DB. Bo qua
   * lang le id khong tim thay (vd da bi huy/xoa giua luc chon va luc bam in)
   * thay vi nem loi lam hong ca lan in. */
  async layNhieuGiayDiDuongDeIn(ids: string[]) {
    const dsGdd = await this.prisma.giayDiDuong.findMany({
      where: { id: { in: ids } },
      include: { thanhVien: true, lenhDieuCongTac: { include: { lenhDieuXe: true } } },
    });
    if (dsGdd.length === 0) {
      throw new NotFoundException("Không tìm thấy Công lệnh/Giấy đi đường");
    }
    const noiDiMacDinh = await this.layNoiDiMacDinh(this.prisma);
    const theoId = new Map(dsGdd.map((g) => [g.id, g]));
    return ids
      .map((id) => theoId.get(id))
      .filter((gdd): gdd is (typeof dsGdd)[number] => !!gdd)
      .map((gdd) => {
        const chiTiet = this.layChiTietGiayDiDuong(gdd.lenhDieuCongTac, gdd.thanhVien, gdd, noiDiMacDinh);
        return {
          soHieu: gdd.soHieu,
          ngayKy: gdd.lenhDieuCongTac.ngayKy,
          hoTen: gdd.thanhVien.hoTen,
          chucVu: gdd.thanhVien.chucVu,
          noiDi: chiTiet.noiDi,
          noiDen: chiTiet.noiDen,
          ngayDi: chiTiet.ngayDi,
          ngayVe: chiTiet.ngayVe,
          nguoiKyHoTen: chiTiet.nguoiKyHoTen,
          nguoiKyChucDanh: chiTiet.nguoiKyChucDanh,
          nguoiKyTheThuc: chiTiet.nguoiKyTheThuc,
        };
      });
  }

  /**
   * Tao LDCT + N GDD (1/thanh vien) + 1 LDX neu co tai xe+bien so - TAT CA
   * trong 1 transaction (CLAUDE.md quy tac TUYET DOI #1). Xem
   * NHAT_KY_QUYET_DINH.md muc "LDCT sinh kem GDD va LDX".
   */
  async tao(duLieu: TaoLenhDieuCongTacInput, nguoiThucHienId: string) {
    const nam = duLieu.ngayKy.getFullYear();

    const ketQua = await this.prisma.$transaction(async (tx) => {
      const nguoiKyChinhThuc = await tx.nguoiKy.findFirst({
        where: { trangThai: "DANG_KY_CHINH_THUC" },
        include: { nhanVien: { select: { hoTen: true } } },
      });
      if (!nguoiKyChinhThuc) {
        throw new BadRequestException(
          "Chưa có người ký chính thức - vào Danh mục Người ký để thiết lập trước khi lập chứng từ.",
        );
      }

      const nhanVienIds = duLieu.thanhVien.map((tv) => tv.nhanVienId);
      const nhanVienList = await tx.nhanVien.findMany({ where: { id: { in: nhanVienIds } } });
      if (nhanVienList.length !== new Set(nhanVienIds).size) {
        throw new BadRequestException("Một số nhân viên đã chọn không tồn tại hoặc bị trùng");
      }
      const nhanVienMap = new Map(nhanVienList.map((nv) => [nv.id, nv]));

      let phuongTien: { id: string; bienSo: string; nhanHieu: string } | null = null;
      if (duLieu.phuongTienId) {
        phuongTien = await tx.phuongTien.findUnique({ where: { id: duLieu.phuongTienId } });
        if (!phuongTien) {
          throw new BadRequestException("Không tìm thấy phương tiện đã chọn");
        }
      }

      // 1. Cap so + tao LDCT.
      const soLdctThuTu = await this.danhSo.capSo(LoaiChungTu.LDCT, nam, nguoiThucHienId, tx);
      const cauHinhLdct = await tx.cauHinhDanhSo.findUnique({
        where: { loaiChungTu_nam: { loaiChungTu: LoaiChungTu.LDCT, nam } },
      });
      const soHieuLdct = `${dinhDangSoChungTu(soLdctThuTu)}/${cauHinhLdct?.kyHieu ?? KY_HIEU_LOAI_CHUNG_TU.LDCT}`;

      const lenh = await tx.lenhDieuCongTac.create({
        data: {
          nam,
          soThuTu: soLdctThuTu,
          soHieu: soHieuLdct,
          canCu: duLieu.canCu,
          diaDiemCongTac: duLieu.diaDiemCongTac,
          mucDich: duLieu.mucDich,
          ghiChu: duLieu.ghiChu,
          ngayDi: duLieu.ngayDi,
          ngayVe: duLieu.ngayVe,
          ngayKy: duLieu.ngayKy,
          nguoiKyId: nguoiKyChinhThuc.id,
          nguoiKyHoTen: nguoiKyChinhThuc.nhanVien.hoTen,
          nguoiKyChucDanh: nguoiKyChinhThuc.chucDanhKy,
          nguoiKyTheThuc: nguoiKyChinhThuc.theThucKy,
          loaiMauIn: duLieu.loaiMauIn,
        },
      });

      // 2. Tao tung thanh vien + 1 GDD rieng cho nguoi do.
      const thanhVienTaoXong: { id: string; nhanVienId: string }[] = [];
      for (const [chiSo, tv] of duLieu.thanhVien.entries()) {
        const nv = nhanVienMap.get(tv.nhanVienId)!;
        const thanhVien = await tx.thanhVienLenhDieuCongTac.create({
          data: {
            lenhDieuCongTacId: lenh.id,
            nhanVienId: nv.id,
            hoTen: nv.hoTen,
            chucVu: chucVuKemPhongBan(nv),
            cccd: nv.cccd,
            ngaySinh: nv.ngaySinh,
            ngayDiRieng: tv.ngayDiRieng,
            ngayVeRieng: tv.ngayVeRieng,
            thuTu: chiSo,
            laTruongDoan: tv.laTruongDoan,
          },
        });

        const soGddThuTu = await this.danhSo.capSo(LoaiChungTu.GDD, nam, nguoiThucHienId, tx);
        const cauHinhGdd = await tx.cauHinhDanhSo.findUnique({
          where: { loaiChungTu_nam: { loaiChungTu: LoaiChungTu.GDD, nam } },
        });
        const soHieuGdd = `${dinhDangSoChungTu(soGddThuTu)}/${cauHinhGdd?.kyHieu ?? KY_HIEU_LOAI_CHUNG_TU.GDD}`;

        await tx.giayDiDuong.create({
          data: {
            nam,
            soThuTu: soGddThuTu,
            soHieu: soHieuGdd,
            lenhDieuCongTacId: lenh.id,
            thanhVienId: thanhVien.id,
            // Ghi de "noi di" rieng cho CA lenh (moi thanh vien deu dung
            // chung 1 gia tri nay) - de trong (undefined -> null) thi
            // layChiTietGiayDiDuong() se tu fallback ve noiDiMacDinh nhu
            // truoc, khong doi hanh vi cu. Nguoi dung yeu cau 2026-08-10
            // (them o Lap lenh, khong phai sua tung GDD rieng le), xem
            // NHAT_KY_QUYET_DINH.md.
            noiDiRieng: duLieu.noiDi ?? null,
          },
        });

        thanhVienTaoXong.push({ id: thanhVien.id, nhanVienId: nv.id });
      }

      // 3. Neu co chon tai xe + bien so -> cap so + tao kem 1 LDX.
      let lenhDieuXe = null;
      if (duLieu.taiXeNhanVienId && phuongTien) {
        const thanhVienTaiXe = thanhVienTaoXong.find((tv) => tv.nhanVienId === duLieu.taiXeNhanVienId)!;
        const nvTaiXe = nhanVienMap.get(duLieu.taiXeNhanVienId)!;
        const tvNhap = duLieu.thanhVien.find((tv) => tv.nhanVienId === duLieu.taiXeNhanVienId)!;
        const noiDiMacDinh = await this.layNoiDiMacDinh(tx);

        const soLdxThuTu = await this.danhSo.capSo(LoaiChungTu.LDX, nam, nguoiThucHienId, tx);
        const cauHinhLdx = await tx.cauHinhDanhSo.findUnique({
          where: { loaiChungTu_nam: { loaiChungTu: LoaiChungTu.LDX, nam } },
        });
        const soHieuLdx = `${dinhDangSoChungTu(soLdxThuTu)}/${cauHinhLdx?.kyHieu ?? KY_HIEU_LOAI_CHUNG_TU.LDX}`;

        lenhDieuXe = await tx.lenhDieuXe.create({
          data: {
            nam,
            soThuTu: soLdxThuTu,
            soHieu: soHieuLdx,
            laiXeId: nvTaiXe.id,
            laiXeHoTen: nvTaiXe.hoTen,
            phuongTienId: phuongTien.id,
            bienSo: phuongTien.bienSo,
            nhanHieu: phuongTien.nhanHieu,
            // duLieu.noiDi (neu nguoi lap co nhap) uu tien hon noiDiMacDinh -
            // dam bao LDX sinh kem dung THONG NHAT 1 "noi di" voi cac GDD
            // cua cung doan (xem giayDiDuong.create o tren), khong bi lech
            // nhau khi nguoi dung da chu dong ghi de. Nguoi dung yeu cau
            // 2026-08-10, xem NHAT_KY_QUYET_DINH.md.
            noiDi: duLieu.noiDi ?? noiDiMacDinh,
            noiDen: duLieu.diaDiemCongTac,
            // LUON "Cong tac", khong lay duLieu.mucDich cua LDCT - xem
            // MUC_DICH_MAC_DINH_LENH_DIEU_XE.
            mucDich: MUC_DICH_MAC_DINH_LENH_DIEU_XE,
            ngayDi: tvNhap.ngayDiRieng ?? duLieu.ngayDi,
            ngayVe: tvNhap.ngayVeRieng ?? duLieu.ngayVe,
            ngayKy: duLieu.ngayKy,
            nguoiKyId: nguoiKyChinhThuc.id,
            nguoiKyHoTen: nguoiKyChinhThuc.nhanVien.hoTen,
            nguoiKyChucDanh: nguoiKyChinhThuc.chucDanhKy,
            nguoiKyTheThuc: nguoiKyChinhThuc.theThucKy,
            lenhDieuCongTacId: lenh.id,
            thanhVienTaiXeId: thanhVienTaiXe.id,
          },
        });
      }

      return { lenh, soThanhVien: thanhVienTaoXong.length, lenhDieuXe };
    });

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiThucHienId,
      hanhDong: "TAO_LENH_DIEU_CONG_TAC",
      doiTuong: "LenhDieuCongTac",
      doiTuongId: ketQua.lenh.id,
      giaTriSau: {
        soHieu: ketQua.lenh.soHieu,
        soThanhVien: ketQua.soThanhVien,
        lenhDieuXe: ketQua.lenhDieuXe?.soHieu ?? null,
      },
    });

    return this.chiTiet(ketQua.lenh.id);
  }

  /**
   * Sua LDCT - cap nhat truong chung cua doan, va neu co gui "thanhVien" thi
   * COI LA THAY THE toan bo danh sach (xem doc comment tren
   * suaLenhDieuCongTacSchema). Dong bo LenhDieuXe lien ket khi thay doi anh
   * huong den tai xe (xem NHAT_KY_QUYET_DINH.md).
   */
  async sua(id: string, duLieu: SuaLenhDieuCongTacInput, nguoiThucHienId: string) {
    const truoc = await this.chiTiet(id);
    if (truoc.daHuy) {
      throw new ConflictException("Chứng từ này đã hủy, không sửa được nữa");
    }

    const ngayDiSau = duLieu.ngayDi ?? truoc.ngayDi;
    const ngayVeSau = duLieu.ngayVe ?? truoc.ngayVe;
    if (ngayVeSau < ngayDiSau) {
      throw new BadRequestException("Ngày về không được sớm hơn ngày đi");
    }

    const nam = truoc.nam;

    const sau = await this.prisma.$transaction(async (tx) => {
      const lenhCapNhat = await tx.lenhDieuCongTac.update({
        where: { id },
        data: {
          canCu: duLieu.canCu,
          diaDiemCongTac: duLieu.diaDiemCongTac,
          mucDich: duLieu.mucDich,
          ghiChu: duLieu.ghiChu,
          ngayDi: duLieu.ngayDi,
          ngayVe: duLieu.ngayVe,
          ngayKy: duLieu.ngayKy,
          loaiMauIn: duLieu.loaiMauIn,
        },
      });

      // ----- Dong bo danh sach thanh vien (chi khi co gui truong nay) -----
      if (duLieu.thanhVien) {
        const conDangCo = truoc.thanhVien.filter((tv) => !tv.daLoaiKhoiDoan);
        const idsGuiLen = new Set(duLieu.thanhVien.filter((tv) => tv.id).map((tv) => tv.id));

        // (a) Thanh vien dang co nhung khong con trong danh sach gui len ->
        // loai khoi doan + cascade huy GDD cua nguoi do.
        for (const tv of conDangCo) {
          if (!idsGuiLen.has(tv.id)) {
            await tx.thanhVienLenhDieuCongTac.update({
              where: { id: tv.id },
              data: { daLoaiKhoiDoan: true },
            });
            if (tv.giayDiDuong && !tv.giayDiDuong.daHuy) {
              await tx.giayDiDuong.update({
                where: { id: tv.giayDiDuong.id },
                data: { daHuy: true, lyDoHuy: "Thành viên bị loại khỏi đoàn" },
              });
            }
            // Neu nguoi bi loai dung la tai xe cua LDX lien ket -> huy luon LDX.
            const ldxLienQuan = truoc.lenhDieuXe.find((l) => l.thanhVienTaiXeId === tv.id && !l.daHuy);
            if (ldxLienQuan) {
              await tx.lenhDieuXe.update({
                where: { id: ldxLienQuan.id },
                data: { daHuy: true, lyDoHuy: "Tài xế bị loại khỏi đoàn công tác" },
              });
            }
          }
        }

        // (b) Cap nhat ngay rieng cho thanh vien da co, hoac them moi (kem GDD moi).
        for (const [chiSo, tv] of duLieu.thanhVien.entries()) {
          if (tv.id) {
            await tx.thanhVienLenhDieuCongTac.update({
              where: { id: tv.id },
              data: {
                ngayDiRieng: tv.ngayDiRieng ?? null,
                ngayVeRieng: tv.ngayVeRieng ?? null,
                thuTu: chiSo,
                laTruongDoan: tv.laTruongDoan,
              },
            });
          } else {
            const nv = await tx.nhanVien.findUnique({ where: { id: tv.nhanVienId } });
            if (!nv) {
              throw new BadRequestException("Không tìm thấy nhân viên đã chọn");
            }
            const thanhVienMoi = await tx.thanhVienLenhDieuCongTac.create({
              data: {
                lenhDieuCongTacId: id,
                nhanVienId: nv.id,
                hoTen: nv.hoTen,
                chucVu: chucVuKemPhongBan(nv),
                cccd: nv.cccd,
                ngaySinh: nv.ngaySinh,
                ngayDiRieng: tv.ngayDiRieng,
                ngayVeRieng: tv.ngayVeRieng,
                thuTu: chiSo,
                laTruongDoan: tv.laTruongDoan,
              },
            });
            const soGddThuTu = await this.danhSo.capSo(LoaiChungTu.GDD, nam, nguoiThucHienId, tx);
            const cauHinhGdd = await tx.cauHinhDanhSo.findUnique({
              where: { loaiChungTu_nam: { loaiChungTu: LoaiChungTu.GDD, nam } },
            });
            const soHieuGdd = `${dinhDangSoChungTu(soGddThuTu)}/${cauHinhGdd?.kyHieu ?? KY_HIEU_LOAI_CHUNG_TU.GDD}`;
            await tx.giayDiDuong.create({
              data: {
                nam,
                soThuTu: soGddThuTu,
                soHieu: soHieuGdd,
                lenhDieuCongTacId: id,
                thanhVienId: thanhVienMoi.id,
              },
            });
          }
        }
      }

      // ----- Dong bo LenhDieuXe lien ket (chi khi anh huong den tai xe) -----
      await this.dongBoLenhDieuXe(tx, id, truoc, duLieu, nguoiThucHienId, nam);

      return lenhCapNhat;
    });

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiThucHienId,
      hanhDong: "SUA_LENH_DIEU_CONG_TAC",
      doiTuong: "LenhDieuCongTac",
      doiTuongId: id,
      giaTriTruoc: truoc,
      giaTriSau: sau,
    });

    return this.chiTiet(id);
  }

  /**
   * Dong bo LenhDieuXe lien ket voi LDCT sau khi sua - chi ghi de khi co thay
   * doi anh huong TRUC TIEP den tai xe (doi tai xe/bien so, hoac doi noi
   * di/den/muc dich chung doan/ngay rieng cua chinh tai xe do). Xem
   * NHAT_KY_QUYET_DINH.md muc "LDCT sinh kem GDD va LDX", muc 4.
   */
  private async dongBoLenhDieuXe(
    tx: Prisma.TransactionClient,
    lenhDieuCongTacId: string,
    truoc: Awaited<ReturnType<LenhDieuCongTacService["chiTiet"]>>,
    duLieu: SuaLenhDieuCongTacInput,
    nguoiThucHienId: string,
    nam: number,
  ) {
    const ldxHienTai = truoc.lenhDieuXe.find((l) => !l.daHuy) ?? null;

    // Truong hop A: bo tai xe (taiXeNhanVienId = null) -> huy LDX dang co.
    if (duLieu.taiXeNhanVienId === null && ldxHienTai) {
      await tx.lenhDieuXe.update({
        where: { id: ldxHienTai.id },
        data: { daHuy: true, lyDoHuy: "Bỏ chọn tài xế khi sửa lệnh điều công tác" },
      });
      return;
    }

    // Truong hop B: chua tung co LDX, gio moi chon tai xe + bien so -> tao moi.
    const taiXeMoiId = duLieu.taiXeNhanVienId;
    const phuongTienMoiId = duLieu.phuongTienId;
    if (!ldxHienTai && taiXeMoiId && phuongTienMoiId) {
      const thanhVienTaiXe = await tx.thanhVienLenhDieuCongTac.findFirst({
        where: { lenhDieuCongTacId, nhanVienId: taiXeMoiId, daLoaiKhoiDoan: false },
      });
      const nvTaiXe = thanhVienTaiXe ? await tx.nhanVien.findUnique({ where: { id: taiXeMoiId } }) : null;
      const phuongTien = await tx.phuongTien.findUnique({ where: { id: phuongTienMoiId } });
      if (!thanhVienTaiXe || !nvTaiXe || !phuongTien) {
        throw new BadRequestException("Không tìm thấy tài xế hoặc phương tiện đã chọn");
      }
      const lenh = await tx.lenhDieuCongTac.findUniqueOrThrow({ where: { id: lenhDieuCongTacId } });
      const noiDiMacDinh = await this.layNoiDiMacDinh(tx);

      const soLdxThuTu = await this.danhSo.capSo(LoaiChungTu.LDX, nam, nguoiThucHienId, tx);
      const cauHinhLdx = await tx.cauHinhDanhSo.findUnique({
        where: { loaiChungTu_nam: { loaiChungTu: LoaiChungTu.LDX, nam } },
      });
      const soHieuLdx = `${dinhDangSoChungTu(soLdxThuTu)}/${cauHinhLdx?.kyHieu ?? KY_HIEU_LOAI_CHUNG_TU.LDX}`;

      await tx.lenhDieuXe.create({
        data: {
          nam,
          soThuTu: soLdxThuTu,
          soHieu: soHieuLdx,
          laiXeId: nvTaiXe.id,
          laiXeHoTen: nvTaiXe.hoTen,
          phuongTienId: phuongTien.id,
          bienSo: phuongTien.bienSo,
          nhanHieu: phuongTien.nhanHieu,
          noiDi: noiDiMacDinh,
          noiDen: lenh.diaDiemCongTac,
          // LUON "Cong tac", khong lay lenh.mucDich cua LDCT - xem
          // MUC_DICH_MAC_DINH_LENH_DIEU_XE.
          mucDich: MUC_DICH_MAC_DINH_LENH_DIEU_XE,
          ngayDi: thanhVienTaiXe.ngayDiRieng ?? lenh.ngayDi,
          ngayVe: thanhVienTaiXe.ngayVeRieng ?? lenh.ngayVe,
          ngayKy: lenh.ngayKy,
          nguoiKyId: lenh.nguoiKyId,
          nguoiKyHoTen: lenh.nguoiKyHoTen,
          nguoiKyChucDanh: lenh.nguoiKyChucDanh,
          nguoiKyTheThuc: lenh.nguoiKyTheThuc,
          lenhDieuCongTacId,
          thanhVienTaiXeId: thanhVienTaiXe.id,
        },
      });
      return;
    }

    // Truong hop C: da co LDX - ghi de lai cac truong lien quan neu co thay
    // doi (doi tai xe, doi bien so, doi ngay rieng cua tai xe, hoac LDCT THUC
    // SU doi Noi den trong lan sua nay - xem dieu kien so sanh voi `truoc` o
    // duoi, sua 2026-08-14 de KHONG con ghi de vo dieu kien nua). Muc dich
    // KHONG nam trong danh sach dong bo - xem MUC_DICH_MAC_DINH_LENH_DIEU_XE.
    if (ldxHienTai) {
      const lenh = await tx.lenhDieuCongTac.findUniqueOrThrow({ where: { id: lenhDieuCongTacId } });

      // Doi sang tai xe khac hoan toan (khac laiXeId dang luu) - tim lai
      // thanh vien tuong ung, re-link laiXeId/thanhVienTaiXeId.
      let thanhVienTaiXe =
        taiXeMoiId && taiXeMoiId !== ldxHienTai.laiXeId
          ? await tx.thanhVienLenhDieuCongTac.findFirst({
              where: { lenhDieuCongTacId, nhanVienId: taiXeMoiId, daLoaiKhoiDoan: false },
            })
          : await tx.thanhVienLenhDieuCongTac.findUnique({
              where: { id: ldxHienTai.thanhVienTaiXeId ?? "" },
            });
      if (!thanhVienTaiXe || thanhVienTaiXe.daLoaiKhoiDoan) {
        return;
      }

      // Dung Unchecked*Input (khong phai *Input thuong) de gan truc tiep cac
      // truong khoa ngoai dang scalar (laiXeId, phuongTienId,
      // thanhVienTaiXeId) - giong cach LenhDieuXeService.sua() dang lam,
      // thay vi phai bao boc { connect: { id } } cho tung quan he.
      const capNhat: Prisma.LenhDieuXeUncheckedUpdateInput = {
        ngayDi: thanhVienTaiXe.ngayDiRieng ?? duLieu.ngayDi ?? lenh.ngayDi,
        ngayVe: thanhVienTaiXe.ngayVeRieng ?? duLieu.ngayVe ?? lenh.ngayVe,
      };

      // Noi den: CHI dong bo lai theo LDCT khi LDCT THUC SU doi truong nay
      // trong lan sua nay (duLieu.diaDiemCongTac khac gia tri LDCT dang luu
      // TRUOC do) - truoc day dong bo VO DIEU KIEN (`?? lenh.diaDiemCongTac`)
      // nen MOI lan sua LDCT (du chi doi ngay ky, them ghi chu... khong lien
      // quan gi Noi den) van ghi de mat Noi den ma nguoi dung tung sua RIENG
      // truc tiep tren chinh LDX. Nguoi dung phat hien 2026-08-14, xem
      // NHAT_KY_QUYET_DINH.md.
      if (duLieu.diaDiemCongTac !== undefined && duLieu.diaDiemCongTac !== truoc.diaDiemCongTac) {
        capNhat.noiDen = duLieu.diaDiemCongTac;
      }
      // Muc dich: KHONG bao gio dong bo tu LDCT (kho ca luc tao lan sua) -
      // Muc dich cua LDX la khai niem doc lap, luon mac dinh "Cong tac" luc
      // sinh/tao lai, nguoi dung tu sua rieng sau do neu can. Xem
      // MUC_DICH_MAC_DINH_LENH_DIEU_XE dau file va NHAT_KY_QUYET_DINH.md muc
      // "LDX luon mac dinh Muc dich 'Cong tac'" (2026-08-14).

      if (taiXeMoiId && taiXeMoiId !== ldxHienTai.laiXeId) {
        const nvTaiXeMoi = await tx.nhanVien.findUnique({ where: { id: taiXeMoiId } });
        if (!nvTaiXeMoi) {
          throw new BadRequestException("Không tìm thấy tài xế đã chọn");
        }
        capNhat.laiXeId = nvTaiXeMoi.id;
        capNhat.laiXeHoTen = nvTaiXeMoi.hoTen;
        capNhat.thanhVienTaiXeId = thanhVienTaiXe.id;
      }

      if (phuongTienMoiId && phuongTienMoiId !== ldxHienTai.phuongTienId) {
        const phuongTien = await tx.phuongTien.findUnique({ where: { id: phuongTienMoiId } });
        if (!phuongTien) {
          throw new BadRequestException("Không tìm thấy phương tiện đã chọn");
        }
        capNhat.phuongTienId = phuongTien.id;
        capNhat.bienSo = phuongTien.bienSo;
        capNhat.nhanHieu = phuongTien.nhanHieu;
      }

      await tx.lenhDieuXe.update({ where: { id: ldxHienTai.id }, data: capNhat });
    }
  }

  /** Huy ca LDCT -> cascade huy toan bo GDD con + LDX lien ket chua huy, dung
   * chung 1 ly do (CLAUDE.md quy tac TUYET DOI #6: khong tai su dung so). */
  async huy(id: string, duLieu: HuyLenhDieuCongTacInput, nguoiThucHienId: string) {
    const truoc = await this.chiTiet(id);
    if (truoc.daHuy) {
      throw new ConflictException("Chứng từ này đã hủy rồi");
    }

    const sau = await this.prisma.$transaction(async (tx) => {
      const lenh = await tx.lenhDieuCongTac.update({
        where: { id },
        data: { daHuy: true, lyDoHuy: duLieu.lyDoHuy },
      });

      await tx.giayDiDuong.updateMany({
        where: { lenhDieuCongTacId: id, daHuy: false },
        data: { daHuy: true, lyDoHuy: `Hủy theo lệnh điều công tác ${lenh.soHieu}` },
      });

      await tx.lenhDieuXe.updateMany({
        where: { lenhDieuCongTacId: id, daHuy: false },
        data: { daHuy: true, lyDoHuy: `Hủy theo lệnh điều công tác ${lenh.soHieu}` },
      });

      return lenh;
    });

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiThucHienId,
      hanhDong: "HUY_LENH_DIEU_CONG_TAC",
      doiTuong: "LenhDieuCongTac",
      doiTuongId: id,
      giaTriTruoc: { daHuy: truoc.daHuy },
      giaTriSau: { daHuy: sau.daHuy, lyDoHuy: sau.lyDoHuy },
    });

    return this.chiTiet(id);
  }

  /**
   * Xoa CUNG (mat han khoi CSDL - khac Huy) 1 LDCT + cascade toan bo GDD con
   * + LDX lien ket, roi TU DONG LUI bo dem ca 3 day (LDCT/GDD/LDX) ve dung
   * MAX so con ton tai (xem DanhSoService.capNhatSauKhiXoa()) - chung tu lap
   * TIEP THEO se tu nhien nhan lai dung so nay, KHONG can chon "so trong" thu
   * cong (ban DON GIAN HOA 2026-08-20, thay the han ban dau dung bang
   * SoChungTuTrong rieng - da xay roi bi huy bo cung ngay).
   *
   * CHI cho xoa khi LDCT nay dang giu SO MOI NHAT CA 3 DAY cung luc (LDCT,
   * TUNG so GDD cua thanh vien, va LDX neu co) - neu khong se tu choi ro
   * rang. Bat buoc vi lui bo dem chi an toan/co y nghia khi dung la dang xoa
   * dung "duoi" cua day so; xoa 1 chung tu o GIUA day (khong phai moi nhat)
   * se khong lam bo dem lui (MAX() van la cua chung tu khac con lai) nen
   * KHONG giai quyet duoc muc dich "cap lai so ngay" nguoi dung can - chi lam
   * roi thong tin nen chan luon o day cho ro rang. Xem NHAT_KY_QUYET_DINH.md
   * muc "Xoa cung chung tu - don gian hoa 2026-08-20".
   */
  async xoaCung(id: string, duLieu: XoaCungLenhDieuCongTacInput, nguoiThucHienId: string) {
    const truoc = await this.chiTiet(id);

    if (duLieu.xacNhanSoHieu.trim() !== truoc.soHieu) {
      throw new BadRequestException("Số hiệu xác nhận không khớp, vui lòng gõ lại đúng số hiệu chứng từ");
    }

    const nam = truoc.nam;
    const soGddCuaLenh = truoc.thanhVien.map((tv) => tv.giayDiDuong?.soThuTu).filter((x): x is number => x != null);
    const coLdx = truoc.lenhDieuXe.length > 0;

    await this.prisma.$transaction(async (tx) => {
      // ----- Kiem tra CA 3 day dang la SO MOI NHAT (chan neu khong) -----
      const maxLdct = await tx.lenhDieuCongTac.aggregate({ where: { nam }, _max: { soThuTu: true } });
      if ((maxLdct._max.soThuTu ?? 0) !== truoc.soThuTu) {
        throw new ConflictException(
          "Chỉ xóa được lệnh điều công tác đang mang số MỚI NHẤT của năm - đã có lệnh khác được lập sau lệnh này, chỉ có thể Hủy.",
        );
      }

      if (soGddCuaLenh.length > 0) {
        const maxGdd = await tx.giayDiDuong.aggregate({ where: { nam }, _max: { soThuTu: true } });
        if ((maxGdd._max.soThuTu ?? 0) !== Math.max(...soGddCuaLenh)) {
          throw new ConflictException(
            "Chỉ xóa được khi công lệnh/giấy đi đường của lệnh này đang là số MỚI NHẤT - đã có công lệnh khác (có thể do sửa 1 lệnh điều công tác khác) được cấp số sau, chỉ có thể Hủy.",
          );
        }
      }

      if (coLdx) {
        const maxSoLdxCuaLenh = Math.max(...truoc.lenhDieuXe.map((l) => l.soThuTu));
        const maxLdx = await tx.lenhDieuXe.aggregate({ where: { nam }, _max: { soThuTu: true } });
        if ((maxLdx._max.soThuTu ?? 0) !== maxSoLdxCuaLenh) {
          throw new ConflictException(
            "Chỉ xóa được khi lệnh điều xe của lệnh này đang là số MỚI NHẤT - đã có lệnh điều xe khác được cấp số sau, chỉ có thể Hủy.",
          );
        }
      }

      // ----- Cascade xoa that (thu tu tu con den cha vi khoa ngoai) -----
      await tx.giayDiDuong.deleteMany({ where: { lenhDieuCongTacId: id } });
      await tx.lenhDieuXe.deleteMany({ where: { lenhDieuCongTacId: id } });
      await tx.thanhVienLenhDieuCongTac.deleteMany({ where: { lenhDieuCongTacId: id } });
      await tx.lenhDieuCongTac.delete({ where: { id } });

      // ----- Lui bo dem ca 3 day ve dung MAX con ton tai -----
      await this.danhSo.capNhatSauKhiXoa(LoaiChungTu.LDCT, nam, tx);
      if (soGddCuaLenh.length > 0) {
        await this.danhSo.capNhatSauKhiXoa(LoaiChungTu.GDD, nam, tx);
      }
      if (coLdx) {
        await this.danhSo.capNhatSauKhiXoa(LoaiChungTu.LDX, nam, tx);
      }
    });

    // Ghi 1 nhat ky duy nhat cho ca cascade (giong cach huy() dang lam) - luu
    // lai snapshot vi ban ghi da mat that su, khong con doc lai duoc.
    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiThucHienId,
      hanhDong: "XOA_LENH_DIEU_CONG_TAC",
      doiTuong: "LenhDieuCongTac",
      doiTuongId: id,
      giaTriTruoc: {
        soHieu: truoc.soHieu,
        diaDiemCongTac: truoc.diaDiemCongTac,
        soThanhVien: truoc.thanhVien.length,
        soGddDaXoa: soGddCuaLenh.length,
        coLdxDaXoa: coLdx,
      },
    });

    return { id, soHieu: truoc.soHieu };
  }
}
