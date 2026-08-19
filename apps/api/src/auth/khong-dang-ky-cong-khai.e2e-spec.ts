import { type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { NguoiDungController } from "../nguoi-dung/nguoi-dung.controller";
import { NguoiDungService } from "../nguoi-dung/nguoi-dung.service";

/**
 * CLAUDE.md quy tac #4: khong co chuc nang tu dang ky tai khoan. Kiem tra
 * bang cach doan cac duong dan dang ky thuong gap va xac nhan khong co
 * route nao khop (404) - khong dung DB that, chi can controller duoc dang
 * ky vao router de Nest tra ve dung 404 thay vi loi cau hinh.
 */
describe("Khong co endpoint dang ky cong khai (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController, NguoiDungController],
      providers: [
        { provide: AuthService, useValue: {} },
        { provide: NguoiDungService, useValue: {} },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it.each([
    "/api/auth/dang-ky",
    "/api/auth/register",
    "/api/auth/sign-up",
    "/api/auth/tao-tai-khoan",
    "/api/nguoi-dung/dang-ky",
    "/api/nguoi-dung/register",
  ])("khong ton tai endpoint dang ky cong khai: %s", async (duongDan) => {
    const res = await request(app.getHttpServer()).post(duongDan).send({});
    expect(res.status).toBe(404);
  });

  it("route tao nguoi dung that (POST /api/nguoi-dung) van ton tai nhung can dang nhap + quyen", async () => {
    // Chi kiem tra route co dang ky (khong tra 404) - hanh vi chan quyen da
    // kiem tra rieng o kiem-tra-quyen.e2e-spec.ts.
    const res = await request(app.getHttpServer()).post("/api/nguoi-dung").send({});
    expect(res.status).not.toBe(404);
  });
});
