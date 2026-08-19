import { ForbiddenException, Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { randomBytes, createHash } from "node:crypto";
import * as argon2 from "argon2";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { NhatKyService } from "../common/nhat-ky/nhat-ky.service";
import { THOI_HAN_ACCESS_TOKEN, THOI_HAN_REFRESH_TOKEN_NGAY } from "./auth.constants";

const INCLUDE_QUYEN = {
  vaiTro: { include: { vaiTro: { include: { quyen: { include: { quyen: true } } } } } },
} satisfies Prisma.NguoiDungInclude;

type NguoiDungVoiQuyen = Prisma.NguoiDungGetPayload<{ include: typeof INCLUDE_QUYEN }>;

export interface BoiCanhYeuCau {
  userAgent?: string;
  diaChiIp?: string;
}

function layDanhSachQuyen(nguoiDung: NguoiDungVoiQuyen): string[] {
  const boQuyen = new Set<string>();
  for (const ndVaiTro of nguoiDung.vaiTro) {
    for (const vtQuyen of ndVaiTro.vaiTro.quyen) {
      boQuyen.add(vtQuyen.quyen.ma);
    }
  }
  return Array.from(boQuyen);
}

function bamRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly nhatKy: NhatKyService,
  ) {}

  async dangNhap(tenDangNhap: string, matKhau: string, boiCanh: BoiCanhYeuCau) {
    const nguoiDung = await this.prisma.nguoiDung.findUnique({
      where: { tenDangNhap },
      include: INCLUDE_QUYEN,
    });

    if (!nguoiDung) {
      throw new UnauthorizedException("Tên đăng nhập hoặc mật khẩu không đúng");
    }
    if (nguoiDung.trangThai === "KHOA") {
      throw new ForbiddenException("Tài khoản đã bị khóa, liên hệ Quản trị hệ thống");
    }

    const matKhauDung = await argon2.verify(nguoiDung.matKhauBam, matKhau);
    if (!matKhauDung) {
      throw new UnauthorizedException("Tên đăng nhập hoặc mật khẩu không đúng");
    }

    const quyen = layDanhSachQuyen(nguoiDung);
    const accessToken = await this.taoAccessToken(nguoiDung, quyen);
    const refreshToken = await this.taoPhienLamMoi(nguoiDung.id, boiCanh);

    await this.nhatKy.ghiNhan({
      nguoiDungId: nguoiDung.id,
      hanhDong: "DANG_NHAP",
      doiTuong: "NguoiDung",
      doiTuongId: nguoiDung.id,
      diaChiIp: boiCanh.diaChiIp,
    });

    return {
      accessToken,
      refreshToken,
      nguoiDung: this.thongTinCoBan(nguoiDung, quyen),
    };
  }

  async lamMoi(refreshTokenCu: string, boiCanh: BoiCanhYeuCau) {
    const tokenBam = bamRefreshToken(refreshTokenCu);
    const phien = await this.prisma.phienLamMoi.findUnique({ where: { tokenBam } });

    if (!phien || phien.thuHoi || phien.thoiGianHetHan < new Date()) {
      throw new UnauthorizedException("Phiên đăng nhập không hợp lệ hoặc đã hết hạn");
    }

    const nguoiDung = await this.prisma.nguoiDung.findUnique({
      where: { id: phien.nguoiDungId },
      include: INCLUDE_QUYEN,
    });
    if (!nguoiDung || nguoiDung.trangThai === "KHOA") {
      throw new UnauthorizedException("Tài khoản không còn hiệu lực");
    }

    // Xoay vong: thu hoi refresh token cu, cap moi.
    await this.prisma.phienLamMoi.update({
      where: { id: phien.id },
      data: { thuHoi: true, thoiGianThuHoi: new Date() },
    });

    const quyen = layDanhSachQuyen(nguoiDung);
    const accessToken = await this.taoAccessToken(nguoiDung, quyen);
    const refreshToken = await this.taoPhienLamMoi(nguoiDung.id, boiCanh);

    return {
      accessToken,
      refreshToken,
      nguoiDung: this.thongTinCoBan(nguoiDung, quyen),
    };
  }

  async dangXuat(refreshToken: string | undefined, nguoiDungId: string) {
    if (refreshToken) {
      const tokenBam = bamRefreshToken(refreshToken);
      await this.prisma.phienLamMoi.updateMany({
        where: { tokenBam, thuHoi: false },
        data: { thuHoi: true, thoiGianThuHoi: new Date() },
      });
    }
    await this.nhatKy.ghiNhan({
      nguoiDungId,
      hanhDong: "DANG_XUAT",
      doiTuong: "NguoiDung",
      doiTuongId: nguoiDungId,
    });
  }

  async doiMatKhau(
    nguoiDungId: string,
    matKhauHienTai: string,
    matKhauMoi: string,
  ): Promise<{ accessToken: string; quyen: string[] }> {
    const nguoiDung = await this.prisma.nguoiDung.findUnique({
      where: { id: nguoiDungId },
      include: INCLUDE_QUYEN,
    });
    if (!nguoiDung) {
      throw new UnauthorizedException("Không tìm thấy tài khoản");
    }

    const dungMatKhau = await argon2.verify(nguoiDung.matKhauBam, matKhauHienTai);
    if (!dungMatKhau) {
      throw new BadRequestException("Mật khẩu hiện tại không đúng");
    }

    const matKhauBamMoi = await argon2.hash(matKhauMoi);
    const capNhat = await this.prisma.nguoiDung.update({
      where: { id: nguoiDungId },
      data: { matKhauBam: matKhauBamMoi, phaiDoiMatKhau: false },
      include: INCLUDE_QUYEN,
    });

    await this.nhatKy.ghiNhan({
      nguoiDungId,
      hanhDong: "DOI_MAT_KHAU",
      doiTuong: "NguoiDung",
      doiTuongId: nguoiDungId,
    });

    const quyen = layDanhSachQuyen(capNhat);
    const accessToken = await this.taoAccessToken(capNhat, quyen);
    return { accessToken, quyen };
  }

  private async taoAccessToken(nguoiDung: NguoiDungVoiQuyen, quyen: string[]): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: nguoiDung.id,
        tenDangNhap: nguoiDung.tenDangNhap,
        hoTen: nguoiDung.hoTen,
        quyen,
        phaiDoiMatKhau: nguoiDung.phaiDoiMatKhau,
      },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: THOI_HAN_ACCESS_TOKEN },
    );
  }

  private async taoPhienLamMoi(nguoiDungId: string, boiCanh: BoiCanhYeuCau): Promise<string> {
    const token = randomBytes(48).toString("hex");
    const thoiGianHetHan = new Date();
    thoiGianHetHan.setDate(thoiGianHetHan.getDate() + THOI_HAN_REFRESH_TOKEN_NGAY);

    await this.prisma.phienLamMoi.create({
      data: {
        nguoiDungId,
        tokenBam: bamRefreshToken(token),
        thoiGianHetHan,
        userAgent: boiCanh.userAgent,
        diaChiIp: boiCanh.diaChiIp,
      },
    });

    return token;
  }

  private thongTinCoBan(nguoiDung: NguoiDungVoiQuyen, quyen: string[]) {
    return {
      id: nguoiDung.id,
      tenDangNhap: nguoiDung.tenDangNhap,
      hoTen: nguoiDung.hoTen,
      phaiDoiMatKhau: nguoiDung.phaiDoiMatKhau,
      quyen,
    };
  }
}
