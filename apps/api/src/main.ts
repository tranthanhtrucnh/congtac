import "dotenv/config";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { json, urlencoded } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { kiemTraOrigin } from "./common/middleware/kiem-tra-origin.middleware";
import { tatCache } from "./common/middleware/tat-cache.middleware";

async function bootstrap() {
  // bodyParser:false - tat body parser mac dinh cua Nest (gioi han 100kb,
  // qua nho cho payload sua CauHinhDonVi khi co logoBase64 dang data URL,
  // toi ~2.9 trieu ky tu ~ gan 3MB) - tu gan lai json()/urlencoded() ben
  // duoi voi gioi han rong hon. Nguoi dung yeu cau tinh nang cau hinh logo
  // watermark 2026-08-17, xem NHAT_KY_QUYET_DINH.md.
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  // helmet: bo sung cac header bao mat chuan (X-Content-Type-Options,
  // X-Frame-Options, tat X-Powered-By...) cho API JSON/PDF. An toan voi luong
  // xem PDF hien tai vi web luon goi API qua duong dan tuong doi "/api" (proxy
  // server-to-server cua Next.js, xem next.config.ts) nen tu trinh duyet moi
  // thu deu la CUNG origin, khong bi CORP/embedder mac dinh cua helmet chan.
  //
  // contentSecurityPolicy: false - TAT rieng CSP (giu nguyen moi header khac
  // cua helmet). Mac dinh helmet bat script-src 'self', chan luon script
  // inline ma chenCongCuXemPhongChu() chen vao HTML debug (?xemHtml=1, xem
  // mau-in-dung-chung.ts) - phat hien 2026-08-26 khi cong cu "xem co chu" bao
  // bam khong an duoc. API nay khong serve trang web nao khac cho trinh duyet
  // ngoai HTML debug noi bo nay (toan bo giao dien that do Next.js dam nhiem
  // rieng) nen loi ich CSP o day rat nho so voi thiet hai lam hong cong cu
  // dang dung. Xem NHAT_KY_QUYET_DINH.md.
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(json({ limit: "5mb" }));
  app.use(urlencoded({ extended: true, limit: "5mb" }));

  // Xem doc comment day du o tat-cache.middleware.ts.
  app.use(tatCache);

  app.setGlobalPrefix("api");

  // WEB_ORIGIN: 1 hoac NHIEU origin duoc phep, cach nhau dau phay (vd truy
  // cap tu ca localhost lan dia chi Tailscale cung luc khi lam viec tu xa) -
  // xem NHAT_KY_QUYET_DINH.md muc "Truy cap tu xa qua Tailscale".
  const dsWebOrigin = (process.env.WEB_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({ origin: dsWebOrigin, credentials: true });
  app.use(cookieParser());
  app.use(kiemTraOrigin(dsWebOrigin));

  const port = process.env.API_PORT ? Number(process.env.API_PORT) : 3001;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API dang chay tai http://localhost:${port}/api`);
}

bootstrap();
