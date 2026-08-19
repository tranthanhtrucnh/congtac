import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, LoaiChungTu } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { NhatKyService } from "../common/nhat-ky/nhat-ky.service";
import { DanhSoService } from "../danh-so/danh-so.service";
import { dinhDangSoChungTu, KY_HIEU_LOAI_CHUNG_TU } from "@congtac/shared";
import type {
  DanhSachLenhDieuXeInput,
  TaoLenhDieuXeInput,
  SuaLenhDieuXeInput,
  HuyLenhDieuXeInput,
} from "@congtac/validation";

@Injectable()
export class LenhDieuXeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nhatKy: NhatKyService,
    private readonly danhSo: DanhSoService,
  ) {}

  async danhSach(truyVan: DanhSachLenhDieuXeInput) {
    const { trang, kichThuoc, tuKhoa, daHuy, nam, sapXepTheo, huongSapXep } = truyVan;

    const where: Prisma.LenhDieuXeWhereInput = {
      ...(daHuy !== undefined ? { daHuy } : {}),
      ...(nam ? { nam } : {}),
      ...(tuKhoa && tuKhoa.trim()
        ? {
            OR: [
              { soHieu: { contains: tuKhoa.trim(), mode: "insensitive" } },
              { laiXeHoTen: { contains: tuKhoa.trim(), mode: "insensitive" } },
              { bienSo: { contains: tuKhoa.trim(), mode: "insensitive" } },
            ],
          }
        : {}),
    };

    // Khong chon cot sap xep -> mac dinh chung tu moi nhat len dau.
    const orderBy: Prisma.LenhDieuXeOrderByWithRelationInput[] =
      sapXepTheo === "laiXe"
        ? [{ laiXeHoTen: huongSapXep }]
        : sapXepTheo === "bienSo"
          ? [{ bienSo: huongSapXep }]
          : sapXepTheo === "ngayDi"
            ? [{ ngayDi: huongSapXep }]
            : sapXepTheo === "ngayVe"
              ? [{ ngayVe: huongSapXep }]
              : sapXepTheo === "soHieu"
                ? [{ nam: huongSapXep }, { soThuTu: huongSapXep }]
                : [{ nam: "desc" }, { soThuTu: "desc" }];

    const [duLieu, tong] = await this.prisma.$transaction([
      this.prisma.lenhDieuXe.findMany({
        where,
        orderBy,
        skip: (trang - 1) * kichThuoc,
        take: kichThuoc,
        // lenhDieuCongTac.loaiMauIn: them 2026-08-13 - frontend can den de to
        // mau chu dong bo voi danh sach LDCT cha khi LDX nay sinh kem tu 1
        // LDCT (lenhDieuCongTacId khac null). LDX doc lap (khong qua LDCT)
        // van tra ve null cho quan he nay, frontend tu hieu la khong to mau.
        // Xem NHAT_KY_QUYET_DINH.md.
        include: { lenhDieuCongTac: { select: { loaiMauIn: true } } },
      }),
      this.prisma.lenhDieuXe.count({ where }),
    ]);

    return { duLieu, tong, trang, kichThuoc };
  }

  async chiTiet(id: string) {
    const lenh = await this.prisma.lenhDieuXe.findUnique({ where: { id } });
    if (!lenh) {
      throw new NotFoundException("Không tìm thấy lệnh điều xe");
    }
    return lenh;
  }

  /**
   * Tao LDX moi - trong 1 transaction duy nhat: cap so (DanhSoService.capSo,
   * dung transaction client `tx` nay), chup lai nguoi ky dang chinh thuc,
   * chup lai lai xe/phuong tien, roi moi tao ban ghi. Dung dung trinh tu
   * CLAUDE.md quy tac TUYET DOI #1 (khoa -> doc -> tang -> tao chung tu ->
   * ghi lich su -> commit).
   */
  async tao(duLieu: TaoLenhDieuXeInput, nguoiThucHienId: string) {
    const nam = duLieu.ngayKy.getFullYear();

    const lenh = await this.prisma.$transaction(async (tx) => {
      const nguoiKyChinhThuc = await tx.nguoiKy.findFirst({
        where: { trangThai: "DANG_KY_CHINH_THUC" },
        include: { nhanVien: { select: { hoTen: true } } },
      });
      if (!nguoiKyChinhThuc) {
        throw new BadRequestException(
          "Chưa có người ký chính thức - vào Danh mục Người ký để thiết lập trước khi lập chứng từ.",
        );
      }

      const laiXe = await tx.nhanVien.findUnique({ where: { id: duLieu.laiXeId } });
      if (!laiXe) {
        throw new BadRequestException("Không tìm thấy lái xe đã chọn");
      }

      const phuongTien = await tx.phuongTien.findUnique({ where: { id: duLieu.phuongTienId } });
      if (!phuongTien) {
        throw new BadRequestException("Không tìm thấy phương tiện đã chọn");
      }

      const soThuTu = await this.danhSo.capSo(LoaiChungTu.LDX, nam, nguoiThucHienId, tx);

      const cauHinh = await tx.cauHinhDanhSo.findUnique({
        where: { loaiChungTu_nam: { loaiChungTu: LoaiChungTu.LDX, nam } },
      });
      const kyHieuHieuLuc = cauHinh?.kyHieu ?? KY_HIEU_LOAI_CHUNG_TU.LDX;
      const soHieu = `${dinhDangSoChungTu(soThuTu)}/${kyHieuHieuLuc}`;

      return tx.lenhDieuXe.create({
        data: {
          nam,
          soThuTu,
          soHieu,
          laiXeId: laiXe.id,
          laiXeHoTen: laiXe.hoTen,
          phuongTienId: phuongTien.id,
          bienSo: phuongTien.bienSo,
          nhanHieu: phuongTien.nhanHieu,
          noiDi: duLieu.noiDi,
          noiDen: duLieu.noiDen,
          mucDich: duLieu.mucDich,
          ngayDi: duLieu.ngayDi,
          ngayVe: duLieu.ngayVe,
          ngayKy: duLieu.ngayKy,
          nguoiKyId: nguoiKyChinhThuc.id,
          nguoiKyHoTen: nguoiKyChinhThuc.nhanVien.hoTen,
          nguoiKyChucDanh: nguoiKyChinhThuc.chucDanhKy,
          nguoiKyTheThuc: nguoiKyChinhThuc.theThucKy,
        },
      });
    });

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiThucHienId,
      hanhDong: "TAO_LENH_DIEU_XE",
      doiTuong: "LenhDieuXe",
      doiTuongId: lenh.id,
      giaTriSau: { soHieu: lenh.soHieu, laiXe: lenh.laiXeHoTen, bienSo: lenh.bienSo },
    });

    return lenh;
  }

  /**
   * Sua duoc bat cu luc nao (khong cho duyet, khong khoa theo "da in" -
   * Van thu lap va in truc tiep, xem NHAT_KY_QUYET_DINH.md muc "Bo luong
   * phe duyet") - chi chan khi chung tu da huy.
   */
  async sua(id: string, duLieu: SuaLenhDieuXeInput, nguoiThucHienId: string) {
    const truoc = await this.chiTiet(id);

    if (truoc.daHuy) {
      throw new ConflictException("Chứng từ này đã hủy, không sửa được nữa");
    }

    // Kiem tra cheo ngay di/ve so voi gia tri SAU KHI ap thay doi (ghep gia
    // tri moi len gia tri dang luu) - phong truong hop chi gui 1 trong 2
    // truong qua API (schema chi bat duoc khi ca 2 cung co trong payload).
    const ngayDiSau = duLieu.ngayDi ?? truoc.ngayDi;
    const ngayVeSau = duLieu.ngayVe ?? truoc.ngayVe;
    if (ngayVeSau < ngayDiSau) {
      throw new BadRequestException("Ngày về không được sớm hơn ngày đi");
    }

    const sau = await this.prisma.$transaction(async (tx) => {
      let laiXeHoTen: string | undefined;
      if (duLieu.laiXeId) {
        const laiXe = await tx.nhanVien.findUnique({ where: { id: duLieu.laiXeId } });
        if (!laiXe) {
          throw new BadRequestException("Không tìm thấy lái xe đã chọn");
        }
        laiXeHoTen = laiXe.hoTen;
      }

      let bienSo: string | undefined;
      let nhanHieu: string | undefined;
      if (duLieu.phuongTienId) {
        const phuongTien = await tx.phuongTien.findUnique({ where: { id: duLieu.phuongTienId } });
        if (!phuongTien) {
          throw new BadRequestException("Không tìm thấy phương tiện đã chọn");
        }
        bienSo = phuongTien.bienSo;
        nhanHieu = phuongTien.nhanHieu;
      }

      return tx.lenhDieuXe.update({
        where: { id },
        data: {
          laiXeId: duLieu.laiXeId,
          laiXeHoTen,
          phuongTienId: duLieu.phuongTienId,
          bienSo,
          nhanHieu,
          noiDi: duLieu.noiDi,
          noiDen: duLieu.noiDen,
          mucDich: duLieu.mucDich,
          ngayDi: duLieu.ngayDi,
          ngayVe: duLieu.ngayVe,
          ngayKy: duLieu.ngayKy,
        },
      });
    });

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiThucHienId,
      hanhDong: "SUA_LENH_DIEU_XE",
      doiTuong: "LenhDieuXe",
      doiTuongId: id,
      giaTriTruoc: truoc,
      giaTriSau: sau,
    });

    return sau;
  }

  /** Huy chi danh dau daHuy=true (khong xoa cung) - CLAUDE.md quy tac TUYET DOI #6: khong tai su dung so cua chung tu da huy. */
  async huy(id: string, duLieu: HuyLenhDieuXeInput, nguoiThucHienId: string) {
    const truoc = await this.chiTiet(id);

    if (truoc.daHuy) {
      throw new ConflictException("Chứng từ này đã hủy rồi");
    }

    // LDX sinh kem tu LDCT (co lenhDieuCongTacId) phai dong bo voi doan cong
    // tac - khong cho huy rieng le tai day, tranh lech trang thai voi LDCT
    // (nguoi dung yeu cau 2026-08-10, xem NHAT_KY_QUYET_DINH.md).
    if (truoc.lenhDieuCongTacId) {
      throw new BadRequestException(
        "Lệnh điều xe này sinh kèm theo lệnh điều công tác, không hủy riêng được. Muốn hủy, vào lệnh điều công tác liên quan và loại tài xế khỏi đoàn (hoặc hủy cả lệnh điều công tác).",
      );
    }

    const sau = await this.prisma.lenhDieuXe.update({
      where: { id },
      data: { daHuy: true, lyDoHuy: duLieu.lyDoHuy },
    });

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiThucHienId,
      hanhDong: "HUY_LENH_DIEU_XE",
      doiTuong: "LenhDieuXe",
      doiTuongId: id,
      giaTriTruoc: { daHuy: truoc.daHuy },
      giaTriSau: { daHuy: sau.daHuy, lyDoHuy: sau.lyDoHuy },
    });

    return sau;
  }
}
