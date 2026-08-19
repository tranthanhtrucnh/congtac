import { Injectable, type CanActivate, type ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SKIP_PASSWORD_CHECK_KEY } from "../constants/metadata-keys";

/**
 * Chan moi API khac khi tai khoan dang o trang thai bat buoc doi mat khau
 * (lan dang nhap dau, hoac sau khi Quan tri dat lai mat khau). Route can mo
 * (doi mat khau, dang xuat, xem thong tin ban than) danh dau
 * @BoQuaKiemTraDoiMatKhau().
 */
@Injectable()
export class BatBuocDoiMatKhauGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const boQua = this.reflector.getAllAndOverride<boolean>(SKIP_PASSWORD_CHECK_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (boQua) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const nguoiDung = request.nguoiDung;
    if (nguoiDung?.phaiDoiMatKhau) {
      throw new ForbiddenException("Vui lòng đổi mật khẩu trước khi tiếp tục sử dụng hệ thống");
    }

    return true;
  }
}
