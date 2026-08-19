import { ForbiddenException, type ExecutionContext } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import { PermissionsGuard } from "./permissions.guard";

function taoContext(nguoiDung: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ nguoiDung }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

function taoReflectorGia(quyenYeuCau: string[] | undefined): Reflector {
  return { getAllAndOverride: () => quyenYeuCau } as unknown as Reflector;
}

describe("PermissionsGuard", () => {
  it("chan khi nguoi dung thieu quyen yeu cau", () => {
    const guard = new PermissionsGuard(taoReflectorGia(["nguoi-dung.them"]));
    const ctx = taoContext({ quyen: ["nguoi-dung.xem"] });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it("cho qua khi nguoi dung co du quyen", () => {
    const guard = new PermissionsGuard(taoReflectorGia(["nguoi-dung.them"]));
    const ctx = taoContext({ quyen: ["nguoi-dung.xem", "nguoi-dung.them"] });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("chan khi khong xac dinh duoc nguoi dung dang dang nhap", () => {
    const guard = new PermissionsGuard(taoReflectorGia(["nguoi-dung.them"]));
    const ctx = taoContext(undefined);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it("cho qua khi route khong khai bao @CanDo nao", () => {
    const guard = new PermissionsGuard(taoReflectorGia(undefined));
    const ctx = taoContext(undefined);
    expect(guard.canActivate(ctx)).toBe(true);
  });
});
