import { ConflictException, Injectable } from "@nestjs/common";
import { Prisma, LoaiChungTu } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { NhatKyService } from "../common/nhat-ky/nhat-ky.service";
import { KY_HIEU_LOAI_CHUNG_TU } from "@congtac/shared";
import type { ThietLapDanhSoInput } from "@congtac/validation";

/** Client Prisma dung chung cho ca prisma goc lan ben trong 1 $transaction. */
type ClientPrisma = PrismaService | Prisma.TransactionClient;

const CA_3_LOAI: LoaiChungTu[] = [LoaiChungTu.LDCT, LoaiChungTu.GDD, LoaiChungTu.LDX];

@Injectable()
export class DanhSoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nhatKy: NhatKyService,
  ) {}

  /**
   * Xem cau hinh day so ca 3 loai cho 1 nam - tong hop hang "ao" (chua thiet
   * lap trong DB) voi soBatDau mac dinh = 1 de giao dien luon co du 3 dong,
   * khong tao ban ghi that chi vi thao tac xem.
   */
  async danhSachTheoNam(nam: number) {
    const daCoTrongDb = await this.prisma.cauHinhDanhSo.findMany({ where: { nam } });
    const theoLoai = new Map(daCoTrongDb.map((c) => [c.loaiChungTu, c]));

    return CA_3_LOAI.map((loaiChungTu) => {
      const daCo = theoLoai.get(loaiChungTu);
      if (daCo) {
        return {
          ...daCo,
          // Ky hieu tra ve la gia tri DA AP DUNG (uu tien gia tri ghi de trong
          // DB, roi moi fallback ve hang so dung chung) - frontend khong can
          // biet ve KY_HIEU_LOAI_CHUNG_TU de hien thi dung.
          kyHieu: daCo.kyHieu ?? KY_HIEU_LOAI_CHUNG_TU[loaiChungTu],
          daThietLap: true,
          daCapSo: daCo.soHienTai >= daCo.soBatDau,
        };
      }
      return {
        id: null,
        loaiChungTu,
        nam,
        soBatDau: 1,
        soHienTai: 0,
        kyHieu: KY_HIEU_LOAI_CHUNG_TU[loaiChungTu],
        daThietLap: false,
        daCapSo: false,
      };
    });
  }

  /**
   * Thiet lap/doi so bat dau va/hoac ky hieu cho 1 (loai chung tu, nam).
   *
   * Chi chan sua khi THUC SU doi so bat dau (soBatDau khac gia tri dang luu)
   * va day so do da co chung tu dung roi (soHienTai >= soBatDau hien tai) -
   * tranh sinh so trung/nhay so vo ly tren chung tu giay da phat hanh. Doi
   * rieng ky hieu (khong dong soBatDau) luon duoc phep, ke ca sau khi da cap
   * so - vi ky hieu chi anh huong hien thi/in chung tu MOI tao sau nay (xem
   * QUY_TAC_NGHIEP_VU.md: chung tu da tao phai luu san chuoi so hieu, khong
   * ghep dong tu ky hieu hien tai).
   *
   * QUAN TRONG: khi khong doi so bat dau, KHONG duoc dong thoi ghi lai
   * soHienTai = soBatDau - 1 - se lam "tua lai" bo dem va gay cap trung so
   * cho lan cap so tiep theo. Chi ghi soBatDau/soHienTai khi thuc su doi.
   */
  async thietLap(duLieu: ThietLapDanhSoInput, nguoiThucHienId: string) {
    const { loaiChungTu, nam, soBatDau, kyHieu } = duLieu;

    const hienCo = await this.prisma.cauHinhDanhSo.findUnique({
      where: { loaiChungTu_nam: { loaiChungTu, nam } },
    });

    const doiSoBatDau = !hienCo || hienCo.soBatDau !== soBatDau;

    if (doiSoBatDau && hienCo && hienCo.soHienTai >= hienCo.soBatDau) {
      throw new ConflictException(
        "Dãy số này đã có chứng từ sử dụng, không thể đổi số bắt đầu nữa.",
      );
    }

    const ketQua = await this.prisma.cauHinhDanhSo.upsert({
      where: { loaiChungTu_nam: { loaiChungTu, nam } },
      update: doiSoBatDau ? { soBatDau, soHienTai: soBatDau - 1, kyHieu } : { kyHieu },
      create: { loaiChungTu, nam, soBatDau, soHienTai: soBatDau - 1, kyHieu },
    });

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiThucHienId,
      hanhDong: "THIET_LAP_DAY_SO",
      doiTuong: "CauHinhDanhSo",
      doiTuongId: ketQua.id,
      giaTriTruoc: hienCo,
      giaTriSau: ketQua,
    });

    return ketQua;
  }

  /**
   * Cap 1 so moi cho loai chung tu + nam - THEO CLAUDE.md quy tac TUYET DOI
   * #1: khong doc-roi-cong-1 o frontend. Ham nay tang soHienTai bang 1 phep
   * UPDATE nguyen tu (Postgres tu khoa dong khi UPDATE, dam bao khong trung
   * so du nhieu Van thu thao tac dong thoi).
   *
   * Nhan `tx` tuy chon (Prisma.TransactionClient) de cac module tao chung tu
   * sau nay (LDCT/GDD/LDX) goi ham nay TRONG CHINH transaction tao chung tu
   * cua ho - dam bao cap so + tao chung tu la 1 don vi atomic duy nhat, dung
   * dung trinh tu CLAUDE.md yeu cau (khoa -> doc -> tang -> tao chung tu ->
   * ghi lich su -> commit). Khong truyen tx thi dung ket noi Prisma goc.
   */
  async capSo(
    loaiChungTu: LoaiChungTu,
    nam: number,
    nguoiThucHienId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const client: ClientPrisma = tx ?? this.prisma;

    // Dam bao co cau hinh cho nam nay - neu Quan tri chua thiet lap, tu dong
    // dung so bat dau = 1 (theo quyet dinh da chon) thay vi chan Van thu.
    await client.cauHinhDanhSo.upsert({
      where: { loaiChungTu_nam: { loaiChungTu, nam } },
      update: {},
      create: { loaiChungTu, nam, soBatDau: 1, soHienTai: 0 },
    });

    const capNhat = await client.cauHinhDanhSo.update({
      where: { loaiChungTu_nam: { loaiChungTu, nam } },
      data: { soHienTai: { increment: 1 } },
    });

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiThucHienId,
      hanhDong: "CAP_SO",
      doiTuong: "CauHinhDanhSo",
      doiTuongId: capNhat.id,
      giaTriSau: { loaiChungTu, nam, soDaCap: capNhat.soHienTai },
    });

    return capNhat.soHienTai;
  }

  /**
   * Sau khi XOA CUNG 1/nhieu chung tu (LenhDieuCongTacService.xoaCung()) -
   * tinh LAI CauHinhDanhSo.soHienTai bang chinh MAX(soThuTu) con TON TAI
   * THAT SU trong bang tuong ung cua (loaiChungTu, nam), KHONG dung phep tru
   * theo so luong da xoa.
   *
   * Vi sao khong duoc tru theo so luong: vi du xoa 1 LDCT co 4 thanh vien
   * (giai phong 4 so GDD), nhung giua chung co the co so GDD cua 1 LDCT KHAC
   * xen vao (do LDCT do duoc sua/them thanh vien sau khi LDCT dang xoa da
   * duoc tao) - luc do "so luong da xoa" khong con phan anh dung khoang cach
   * thuc te toi so lon nhat CON LAI. Tinh lai bang MAX() truc tiep tren du
   * lieu con ton tai la cach DUY NHAT dam bao dung trong moi truong hop, tu
   * dong "tu sua" ke ca khi co xen ke - khong can gia dinh gi ve tinh lien
   * tuc. Nguoi dung yeu cau 2026-08-20 (ban don gian hoa, thay the han bang
   * "so trong" da xay dung roi bi huy bo cung ngay) - xem NHAT_KY_QUYET_DINH.md
   * muc "Xoa cung chung tu - don gian hoa 2026-08-20".
   *
   * LUON goi ham nay o CUNG 1 transaction voi cac lenh xoa (tx bat buoc,
   * khong co tham so mac dinh nhu capSo()) de dam bao doc MAX() SAU KHI da
   * xoa xong, trong cung 1 don vi atomic.
   */
  async capNhatSauKhiXoa(loaiChungTu: LoaiChungTu, nam: number, tx: Prisma.TransactionClient): Promise<void> {
    let soLonNhatConLai: number | null = null;
    switch (loaiChungTu) {
      case LoaiChungTu.LDCT: {
        const agg = await tx.lenhDieuCongTac.aggregate({ where: { nam }, _max: { soThuTu: true } });
        soLonNhatConLai = agg._max.soThuTu;
        break;
      }
      case LoaiChungTu.GDD: {
        const agg = await tx.giayDiDuong.aggregate({ where: { nam }, _max: { soThuTu: true } });
        soLonNhatConLai = agg._max.soThuTu;
        break;
      }
      case LoaiChungTu.LDX: {
        const agg = await tx.lenhDieuXe.aggregate({ where: { nam }, _max: { soThuTu: true } });
        soLonNhatConLai = agg._max.soThuTu;
        break;
      }
    }

    const cauHinh = await tx.cauHinhDanhSo.findUnique({ where: { loaiChungTu_nam: { loaiChungTu, nam } } });
    // Khong con chung tu nao (loaiChungTu, nam) nay nua -> lui ve dung truoc
    // soBatDau (giu nguyen quy uoc capSo() dang dung: soHienTai = soBatDau - 1
    // nghia la "chua cap so nao").
    const soHienTaiMoi = Math.max(soLonNhatConLai ?? 0, (cauHinh?.soBatDau ?? 1) - 1);

    await tx.cauHinhDanhSo.update({
      where: { loaiChungTu_nam: { loaiChungTu, nam } },
      data: { soHienTai: soHienTaiMoi },
    });
  }
}
