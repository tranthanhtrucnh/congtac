import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import * as argon2 from "argon2";
import { PrismaService } from "../prisma/prisma.service";
import { NhatKyService } from "../common/nhat-ky/nhat-ky.service";
import { sinhMatKhauTam } from "../common/utils/mat-khau-tam.util";
import type { PhanTrangInput, TaoNguoiDungInput, SuaNguoiDungInput } from "@congtac/validation";
import { MA_VAI_TRO } from "@congtac/shared";

const CHON_CO_BAN = {
  id: true,
  tenDangNhap: true,
  hoTen: true,
  trangThai: true,
  phaiDoiMatKhau: true,
  ngayTao: true,
  ngayCapNhat: true,
  vaiTro: { select: { vaiTro: { select: { id: true, ma: true, ten: true } } } },
  // Quyen gan RIENG (ngoai vai tro) - xem NguoiDungQuyen trong schema.prisma
  // va NHAT_KY_QUYET_DINH.md muc "Phan quyen rieng theo nguoi dung".
  quyenRieng: { select: { quyen: { select: { ma: true, nhom: true, moTa: true } } } },
} satisfies Prisma.NguoiDungSelect;

function dinhDangNguoiDung(nguoiDung: Prisma.NguoiDungGetPayload<{ select: typeof CHON_CO_BAN }>) {
  const { vaiTro, quyenRieng, ...conLai } = nguoiDung;
  return { ...conLai, vaiTro: vaiTro.map((v) => v.vaiTro), quyenRieng: quyenRieng.map((q) => q.quyen) };
}

@Injectable()
export class NguoiDungService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly nhatKy: NhatKyService,
  ) {}

  async danhSach(phanTrang: PhanTrangInput) {
    const { trang, kichThuoc, tuKhoa } = phanTrang;
    const where: Prisma.NguoiDungWhereInput = tuKhoa
      ? {
          OR: [
            { tenDangNhap: { contains: tuKhoa, mode: "insensitive" } },
            { hoTen: { contains: tuKhoa, mode: "insensitive" } },
          ],
        }
      : {};

    const [duLieu, tong] = await this.prisma.$transaction([
      this.prisma.nguoiDung.findMany({
        where,
        select: CHON_CO_BAN,
        orderBy: { ngayTao: "desc" },
        skip: (trang - 1) * kichThuoc,
        take: kichThuoc,
      }),
      this.prisma.nguoiDung.count({ where }),
    ]);

    return {
      duLieu: duLieu.map(dinhDangNguoiDung),
      tong,
      trang,
      kichThuoc,
    };
  }

  async chiTiet(id: string) {
    const nguoiDung = await this.prisma.nguoiDung.findUnique({ where: { id }, select: CHON_CO_BAN });
    if (!nguoiDung) {
      throw new NotFoundException("Không tìm thấy người dùng");
    }
    return dinhDangNguoiDung(nguoiDung);
  }

  async tao(duLieu: TaoNguoiDungInput, nguoiTaoId: string) {
    const matKhauTam = sinhMatKhauTam();
    const matKhauBam = await argon2.hash(matKhauTam);

    try {
      const nguoiDung = await this.prisma.nguoiDung.create({
        data: {
          tenDangNhap: duLieu.tenDangNhap,
          hoTen: duLieu.hoTen,
          matKhauBam,
          phaiDoiMatKhau: true,
          nguoiTaoId,
          vaiTro: { create: duLieu.vaiTroIds.map((vaiTroId) => ({ vaiTroId })) },
        },
        select: CHON_CO_BAN,
      });

      await this.nhatKy.ghiNhan({
        nguoiDungId: nguoiTaoId,
        hanhDong: "TAO_NGUOI_DUNG",
        doiTuong: "NguoiDung",
        doiTuongId: nguoiDung.id,
        giaTriSau: { tenDangNhap: nguoiDung.tenDangNhap, hoTen: nguoiDung.hoTen },
      });

      return { nguoiDung: dinhDangNguoiDung(nguoiDung), matKhauTam };
    } catch (loi) {
      if (loi instanceof Prisma.PrismaClientKnownRequestError && loi.code === "P2002") {
        throw new ConflictException("Tên đăng nhập đã tồn tại");
      }
      throw loi;
    }
  }

  async sua(id: string, duLieu: SuaNguoiDungInput, nguoiThucHienId: string) {
    const truoc = await this.chiTiet(id);

    await this.prisma.$transaction(async (tx) => {
      if (duLieu.hoTen !== undefined) {
        await tx.nguoiDung.update({ where: { id }, data: { hoTen: duLieu.hoTen } });
      }
      if (duLieu.vaiTroIds !== undefined) {
        await tx.nguoiDungVaiTro.deleteMany({ where: { nguoiDungId: id } });
        await tx.nguoiDungVaiTro.createMany({
          data: duLieu.vaiTroIds.map((vaiTroId) => ({ nguoiDungId: id, vaiTroId })),
        });
      }
      // Thay THE TOAN BO tap quyen rieng (khong phai them/bot tung phan) -
      // giong het quy uoc cua VaiTroService.suaQuyen(). Day la quyen CONG
      // THEM vao quyen tu vai tro, khong phai thay the - xem
      // NHAT_KY_QUYET_DINH.md muc "Phan quyen rieng theo nguoi dung".
      if (duLieu.quyenRieng !== undefined) {
        const danhSachQuyen = await tx.quyen.findMany({
          where: { ma: { in: duLieu.quyenRieng } },
          select: { id: true },
        });
        await tx.nguoiDungQuyen.deleteMany({ where: { nguoiDungId: id } });
        await tx.nguoiDungQuyen.createMany({
          data: danhSachQuyen.map((q) => ({ nguoiDungId: id, quyenId: q.id })),
        });
      }
    });

    const sau = await this.chiTiet(id);

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiThucHienId,
      hanhDong: "SUA_NGUOI_DUNG",
      doiTuong: "NguoiDung",
      doiTuongId: id,
      giaTriTruoc: truoc,
      giaTriSau: sau,
    });

    return sau;
  }

  async khoa(id: string, nguoiThucHienId: string) {
    if (id === nguoiThucHienId) {
      throw new BadRequestException("Không thể tự khóa tài khoản của chính mình");
    }
    await this.kiemTraKhongPhaiQuanTriCuoiCung(id);

    await this.prisma.$transaction([
      this.prisma.nguoiDung.update({ where: { id }, data: { trangThai: "KHOA" } }),
      // Khoa tai khoan thi thu hoi toan bo phien dang nhap dang hoat dong.
      this.prisma.phienLamMoi.updateMany({
        where: { nguoiDungId: id, thuHoi: false },
        data: { thuHoi: true, thoiGianThuHoi: new Date() },
      }),
    ]);

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiThucHienId,
      hanhDong: "KHOA_TAI_KHOAN",
      doiTuong: "NguoiDung",
      doiTuongId: id,
    });

    return this.chiTiet(id);
  }

  async moKhoa(id: string, nguoiThucHienId: string) {
    await this.prisma.nguoiDung.update({ where: { id }, data: { trangThai: "HOAT_DONG" } });

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiThucHienId,
      hanhDong: "MO_KHOA_TAI_KHOAN",
      doiTuong: "NguoiDung",
      doiTuongId: id,
    });

    return this.chiTiet(id);
  }

  /**
   * Quan tri dat lai mat khau cho nguoi dung khac - sinh mat khau tam moi
   * (khong cho quan tri tu chon mat khau, tranh dat mat khau yeu/de doan),
   * bat buoc doi ngay lan dang nhap ke tiep, va thu hoi toan bo phien dang
   * nhap dang hoat dong cua tai khoan do (giong het khi khoa tai khoan).
   */
  async datLaiMatKhau(id: string, nguoiThucHienId: string) {
    if (id === nguoiThucHienId) {
      throw new BadRequestException(
        "Không thể tự đặt lại mật khẩu của chính mình tại đây - dùng chức năng Đổi mật khẩu",
      );
    }
    const nguoiDung = await this.chiTiet(id);

    const matKhauTam = sinhMatKhauTam();
    const matKhauBam = await argon2.hash(matKhauTam);

    await this.prisma.$transaction([
      this.prisma.nguoiDung.update({
        where: { id },
        data: { matKhauBam, phaiDoiMatKhau: true },
      }),
      this.prisma.phienLamMoi.updateMany({
        where: { nguoiDungId: id, thuHoi: false },
        data: { thuHoi: true, thoiGianThuHoi: new Date() },
      }),
    ]);

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiThucHienId,
      hanhDong: "DAT_LAI_MAT_KHAU",
      doiTuong: "NguoiDung",
      doiTuongId: id,
    });

    return { nguoiDung, matKhauTam };
  }

  /** Khong cho khoa neu day la Quan tri he thong dang hoat dong cuoi cung. */
  private async kiemTraKhongPhaiQuanTriCuoiCung(id: string) {
    const nguoiDung = await this.prisma.nguoiDung.findUnique({
      where: { id },
      select: { vaiTro: { select: { vaiTro: { select: { ma: true } } } } },
    });
    if (!nguoiDung) {
      throw new NotFoundException("Không tìm thấy người dùng");
    }
    const laQuanTri = nguoiDung.vaiTro.some((v) => v.vaiTro.ma === MA_VAI_TRO.QUAN_TRI_HE_THONG);
    if (!laQuanTri) {
      return;
    }

    const soQuanTriDangHoatDong = await this.prisma.nguoiDung.count({
      where: {
        trangThai: "HOAT_DONG",
        vaiTro: { some: { vaiTro: { ma: MA_VAI_TRO.QUAN_TRI_HE_THONG } } },
      },
    });
    if (soQuanTriDangHoatDong <= 1) {
      throw new BadRequestException(
        "Không thể khóa tài khoản Quản trị hệ thống đang hoạt động cuối cùng",
      );
    }
  }
}
