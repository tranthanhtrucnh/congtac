import "dotenv/config";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { json, urlencoded } from "express";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { kiemTraOrigin } from "./common/middleware/kiem-tra-origin.middleware";

async function bootstrap() {
  // bodyParser:false - tat body parser mac dinh cua Nest (gioi han 100kb,
  // qua nho cho payload sua CauHinhDonVi khi co logoBase64 dang data URL,
  // toi ~2.9 trieu ky tu ~ gan 3MB) - tu gan lai json()/urlencoded() ben
  // duoi voi gioi han rong hon. Nguoi dung yeu cau tinh nang cau hinh logo
  // watermark 2026-08-17, xem NHAT_KY_QUYET_DINH.md.
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.use(json({ limit: "5mb" }));
  app.use(urlencoded({ extended: true, limit: "5mb" }));
  app.setGlobalPrefix("api");

  const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";
  app.enableCors({ origin: webOrigin, credentials: true });
  app.use(cookieParser());
  app.use(kiemTraOrigin(webOrigin));

  const port = process.env.API_PORT ? Number(process.env.API_PORT) : 3001;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API dang chay tai http://localhost:${port}/api`);
}

bootstrap();
