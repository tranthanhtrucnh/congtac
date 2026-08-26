import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import type { Request, Response } from "express";
import { dangNhapSchema, doiMatKhauSchema, type DangNhapInput, type DoiMatKhauInput } from "@congtac/validation";
import { Public } from "../common/decorators/public.decorator";
import { BoQuaKiemTraDoiMatKhau } from "../common/decorators/bo-qua-kiem-tra-doi-mat-khau.decorator";
import { NguoiDungHienTai, type NguoiDungYeuCau } from "../common/decorators/nguoi-dung-hien-tai.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { AuthService } from "./auth.service";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  tuyChonCookieAccessToken,
  tuyChonCookieRefreshToken,
} from "./auth.constants";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("dang-nhap")
  async dangNhap(
    @Body(new ZodValidationPipe(dangNhapSchema)) body: DangNhapInput,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ketQua = await this.authService.dangNhap(body.tenDangNhap, body.matKhau, {
      userAgent: req.headers["user-agent"],
      diaChiIp: req.ip,
    });
    this.datCookiePhien(res, ketQua.accessToken, ketQua.refreshToken);
    return { nguoiDung: ketQua.nguoiDung };
  }

  @Public()
  @Post("lam-moi")
  async lamMoi(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!refreshToken) {
      throw new UnauthorizedException("Chưa đăng nhập");
    }
    const ketQua = await this.authService.lamMoi(refreshToken, {
      userAgent: req.headers["user-agent"],
      diaChiIp: req.ip,
    });
    this.datCookiePhien(res, ketQua.accessToken, ketQua.refreshToken);
    return { nguoiDung: ketQua.nguoiDung };
  }

  @BoQuaKiemTraDoiMatKhau()
  @Post("dang-xuat")
  async dangXuat(
    @NguoiDungHienTai() nguoiDung: NguoiDungYeuCau,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    await this.authService.dangXuat(refreshToken, nguoiDung.id);
    res.clearCookie(ACCESS_TOKEN_COOKIE, { path: "/" });
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/api/auth" });
    return { thanhCong: true };
  }

  @BoQuaKiemTraDoiMatKhau()
  @Get("toi")
  layThongTinBanThan(@NguoiDungHienTai() nguoiDung: NguoiDungYeuCau) {
    return { nguoiDung };
  }

  @BoQuaKiemTraDoiMatKhau()
  @Post("doi-mat-khau")
  async doiMatKhau(
    @NguoiDungHienTai() nguoiDung: NguoiDungYeuCau,
    @Body(new ZodValidationPipe(doiMatKhauSchema)) body: DoiMatKhauInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ketQua = await this.authService.doiMatKhau(
      nguoiDung.id,
      body.matKhauHienTai,
      body.matKhauMoi,
    );
    res.cookie(ACCESS_TOKEN_COOKIE, ketQua.accessToken, tuyChonCookieAccessToken());
    return { thanhCong: true, quyen: ketQua.quyen };
  }

  private datCookiePhien(res: Response, accessToken: string, refreshToken: string) {
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, tuyChonCookieAccessToken());
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, tuyChonCookieRefreshToken());
  }
}
