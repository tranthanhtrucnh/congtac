import { Controller, Get, type INestApplication } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";
import { CanDo } from "../decorators/can-do.decorator";
import { Public } from "../decorators/public.decorator";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { PermissionsGuard } from "./permissions.guard";
import { ACCESS_TOKEN_COOKIE } from "../../auth/auth.constants";

@Controller("thu-nghiem")
class ThuNghiemController {
  @Public()
  @Get("cong-khai")
  congKhai() {
    return { ok: true };
  }

  @CanDo("nguoi-dung.them")
  @Get("can-quyen")
  canQuyen() {
    return { ok: true };
  }
}

/**
 * Kiem tra ca chuoi guard that (JwtAuthGuard + PermissionsGuard) qua HTTP
 * that su, khong dung PrismaService/DB - chi can JwtService de ky token thu.
 * Xac nhan dung yeu cau CLAUDE.md quy tac #3: nguoi khong du quyen bi chan
 * o backend, khong chi an nut giao dien.
 */
describe("JwtAuthGuard + PermissionsGuard (e2e)", () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = "bi-mat-kiem-thu";

    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({})],
      controllers: [ThuNghiemController],
      providers: [
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: PermissionsGuard },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init();
    jwtService = moduleRef.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  it("cho phep route @Public khong can dang nhap", async () => {
    await request(app.getHttpServer()).get("/thu-nghiem/cong-khai").expect(200);
  });

  it("tra 401 khi chua co cookie dang nhap", async () => {
    await request(app.getHttpServer()).get("/thu-nghiem/can-quyen").expect(401);
  });

  it("tra 403 khi da dang nhap nhung thieu quyen", async () => {
    const token = await jwtService.signAsync(
      {
        sub: "1",
        tenDangNhap: "vanthu",
        hoTen: "Van Thu",
        quyen: ["nguoi-dung.xem"],
        phaiDoiMatKhau: false,
      },
      { secret: process.env.JWT_ACCESS_SECRET },
    );

    await request(app.getHttpServer())
      .get("/thu-nghiem/can-quyen")
      .set("Cookie", [`${ACCESS_TOKEN_COOKIE}=${token}`])
      .expect(403);
  });

  it("tra 200 khi co du quyen", async () => {
    const token = await jwtService.signAsync(
      {
        sub: "2",
        tenDangNhap: "quantri",
        hoTen: "Quan Tri",
        quyen: ["nguoi-dung.them"],
        phaiDoiMatKhau: false,
      },
      { secret: process.env.JWT_ACCESS_SECRET },
    );

    await request(app.getHttpServer())
      .get("/thu-nghiem/can-quyen")
      .set("Cookie", [`${ACCESS_TOKEN_COOKIE}=${token}`])
      .expect(200);
  });
});
