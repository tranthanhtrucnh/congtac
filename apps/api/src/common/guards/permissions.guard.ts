import { Injectable, type CanActivate, type ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../constants/metadata-keys";

/**
 * Kiem tra quyen theo hanh dong cu the (vd "nguoi-dung.them"), khai bao qua
 * @CanDo(...). Day la noi kiem tra quyen THAT o backend - giao dien chi an/
 * hien nut, khong thay the duoc buoc nay (CLAUDE.md quy tac #3).
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const quyenYeuCau = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!quyenYeuCau || quyenYeuCau.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const nguoiDung = request.nguoiDung;
    if (!nguoiDung) {
      throw new ForbiddenException("Không xác định được người dùng đang đăng nhập");
    }

    const coDuQuyen = quyenYeuCau.every((quyen) => nguoiDung.quyen?.includes(quyen));
    if (!coDuQuyen) {
      throw new ForbiddenException("Bạn không có quyền thực hiện thao tác này");
    }

    return true;
  }
}
