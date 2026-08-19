import { Injectable, type CanActivate, type ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY } from "../constants/metadata-keys";
import { ACCESS_TOKEN_COOKIE } from "../../auth/auth.constants";

/**
 * Kiem tra access token trong cookie httpOnly. Route co @Public() bo qua.
 * Ap dung toan cuc trong AppModule (APP_GUARD) - moi route mac dinh yeu cau
 * dang nhap, chi rieng le mo ra bang @Public().
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token: string | undefined = request.cookies?.[ACCESS_TOKEN_COOKIE];
    if (!token) {
      throw new UnauthorizedException("Chưa đăng nhập");
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      request.nguoiDung = {
        id: payload.sub,
        tenDangNhap: payload.tenDangNhap,
        hoTen: payload.hoTen,
        quyen: payload.quyen ?? [],
        phaiDoiMatKhau: payload.phaiDoiMatKhau ?? false,
      };
      return true;
    } catch {
      throw new UnauthorizedException("Phiên đăng nhập không hợp lệ hoặc đã hết hạn");
    }
  }
}
