import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { NhatKyModule } from "./common/nhat-ky/nhat-ky.module";
import { PdfModule } from "./common/pdf/pdf.module";
import { AuthModule } from "./auth/auth.module";
import { NguoiDungModule } from "./nguoi-dung/nguoi-dung.module";
import { VaiTroModule } from "./vai-tro/vai-tro.module";
import { NhanVienModule } from "./nhan-vien/nhan-vien.module";
import { PhuongTienModule } from "./phuong-tien/phuong-tien.module";
import { DiaDiemModule } from "./dia-diem/dia-diem.module";
import { DanhSoModule } from "./danh-so/danh-so.module";
import { NguoiKyModule } from "./nguoi-ky/nguoi-ky.module";
import { CauHinhDonViModule } from "./cau-hinh-don-vi/cau-hinh-don-vi.module";
import { LenhDieuXeModule } from "./lenh-dieu-xe/lenh-dieu-xe.module";
import { LenhDieuCongTacModule } from "./lenh-dieu-cong-tac/lenh-dieu-cong-tac.module";
import { SoCongLenhModule } from "./so-cong-lenh/so-cong-lenh.module";
import { NhatKyXemModule } from "./nhat-ky/nhat-ky.module";
import { SaoLuuModule } from "./sao-luu/sao-luu.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { BatBuocDoiMatKhauGuard } from "./common/guards/bat-buoc-doi-mat-khau.guard";
import { PermissionsGuard } from "./common/guards/permissions.guard";

@Module({
  imports: [
    PrismaModule,
    NhatKyModule,
    PdfModule,
    HealthModule,
    AuthModule,
    NguoiDungModule,
    VaiTroModule,
    NhanVienModule,
    PhuongTienModule,
    DiaDiemModule,
    DanhSoModule,
    NguoiKyModule,
    CauHinhDonViModule,
    LenhDieuXeModule,
    LenhDieuCongTacModule,
    SoCongLenhModule,
    NhatKyXemModule,
    SaoLuuModule,
  ],
  providers: [
    // Thu tu ap dung: xac thuc -> kiem tra bat buoc doi mat khau -> kiem tra quyen.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: BatBuocDoiMatKhauGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
