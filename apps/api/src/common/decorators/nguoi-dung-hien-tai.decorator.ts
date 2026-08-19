import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

export interface NguoiDungYeuCau {
  id: string;
  tenDangNhap: string;
  hoTen: string;
  quyen: string[];
  phaiDoiMatKhau: boolean;
}

/** Lay thong tin nguoi dung dang dang nhap (da duoc JwtAuthGuard gan vao request). */
export const NguoiDungHienTai = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): NguoiDungYeuCau => {
    const request = ctx.switchToHttp().getRequest();
    return request.nguoiDung;
  },
);
