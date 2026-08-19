import { randomUUID } from "crypto";
import { spawn } from "child_process";
import { createReadStream, createWriteStream } from "fs";
import { readFile } from "fs/promises";
import { Client as PgClient } from "pg";

/**
 * Ham thuan (khong phu thuoc NestJS/Prisma) cho module sao luu/phuc hoi - xem
 * docs/superpowers/specs/2026-08-14-sao-luu-phuc-hoi-du-lieu-design.md muc 6.1.
 */

export interface ThongTinKetNoiDb {
  host: string;
  port: string;
  tenDb: string;
  nguoiDung: string;
  matKhau: string;
}

export function phanTichDatabaseUrl(url: string): ThongTinKetNoiDb {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: u.port || "5432",
    tenDb: u.pathname.replace(/^\//, ""),
    nguoiDung: decodeURIComponent(u.username),
    matKhau: decodeURIComponent(u.password),
  };
}

// Cho phep cau hinh duong dan day du qua .env de khong khoa cung vao PATH cua
// may (phuc vu doi may Van thu sau nay - xem spec muc 9).
export function duongDanPgDump(): string {
  return process.env.PG_DUMP_PATH?.trim() || "pg_dump";
}
export function duongDanPsql(): string {
  return process.env.PSQL_PATH?.trim() || "psql";
}

// Neu Postgres chay qua Docker (may host KHONG co san binary pg_dump/psql de
// cai them), dat POSTGRES_DOCKER_CONTAINER trong .env = ten container - luc
// do pg_dump/psql duoc goi qua "docker exec" BEN TRONG container thay vi goi
// truc tiep tren host. Phat hien thuc te 2026-08-14 khi nguoi dung xac nhan
// dung Docker (`docker ps` -> container "conglenh-postgres", image
// postgres:16, cong 5432 da publish ra host) - xem NHAT_KY_QUYET_DINH.md.
export function tenContainerDocker(): string | null {
  return process.env.POSTGRES_DOCKER_CONTAINER?.trim() || null;
}

export async function demSoBang(db: ThongTinKetNoiDb): Promise<number> {
  const client = new PgClient({
    host: db.host,
    port: Number(db.port),
    user: db.nguoiDung,
    password: db.matKhau,
    database: db.tenDb,
  });
  await client.connect();
  try {
    const ketQua = await client.query<{ so_luong: number }>(
      "SELECT count(*)::int AS so_luong FROM information_schema.tables WHERE table_schema = 'public'",
    );
    return ketQua.rows[0]?.so_luong ?? 0;
  } finally {
    await client.end();
  }
}

export type OnTienTrinh = (daXong: number, tong: number) => void;

// Dung khi goi truc tiep tren host (KHONG qua docker exec) - can day du
// host/port/username/dbname vi ket noi tu ben ngoai container/server.
function thamSoKetNoiHost(db: ThongTinKetNoiDb): string[] {
  return ["--host", db.host, "--port", db.port, "--username", db.nguoiDung, "--dbname", db.tenDb];
}

// Dung khi goi qua docker exec - da o san BEN TRONG container nen KHONG can
// --host/--port (Postgres luon o "localhost" tu goc nhin trong container),
// chi can username/dbname.
function thamSoKetNoiDocker(db: ThongTinKetNoiDb): string[] {
  return ["--username", db.nguoiDung, "--dbname", db.tenDb];
}

/**
 * Chay pg_dump ghi ra 1 file tam. Tien trinh uoc luong theo so dong log
 * "dumping contents of table" tu --verbose (KHONG phai % chinh xac theo dung
 * luong - pg_dump khong cung cap con so do, xem spec muc 8).
 *
 * 2 che do: goi truc tiep tren host (co -f ghi thang ra file tam), hoac qua
 * "docker exec" (KHONG dung -f - de pg_dump ghi ra stdout BEN TRONG
 * container, docker relay lai stdout do ve host, tu ghi vao file tam qua
 * WriteStream - tranh phai them buoc "docker cp" rieng de lay file ra khoi
 * container).
 */
export function chaySaoLuu(params: {
  db: ThongTinKetNoiDb;
  duongDanFileTam: string;
  tongSoBang: number;
  onTienTrinh?: OnTienTrinh;
}): Promise<void> {
  const { db, duongDanFileTam, tongSoBang, onTienTrinh } = params;
  const container = tenContainerDocker();

  return new Promise((resolve, reject) => {
    const coDinhDang = ["--format=plain", "--clean", "--if-exists", "--no-owner", "--no-privileges", "--verbose"];

    const lenh = container ? "docker" : duongDanPgDump();
    const args = container
      ? ["exec", "-e", `PGPASSWORD=${db.matKhau}`, container, "pg_dump", ...coDinhDang, ...thamSoKetNoiDocker(db)]
      : [...coDinhDang, ...thamSoKetNoiHost(db), "-f", duongDanFileTam];

    const proc = spawn(lenh, args, {
      env: container ? process.env : { ...process.env, PGPASSWORD: db.matKhau },
    });

    let ghiFileXong: Promise<void> = Promise.resolve();
    if (container) {
      const ghiFile = createWriteStream(duongDanFileTam);
      proc.stdout.pipe(ghiFile);
      ghiFileXong = new Promise((res, rej) => {
        ghiFile.on("finish", () => res());
        ghiFile.on("error", rej);
      });
    }

    let daXong = 0;
    let stderrGop = "";
    proc.stderr.on("data", (chunk: Buffer) => {
      const text = chunk.toString("utf8");
      stderrGop += text;
      const soDong = (text.match(/dumping contents of table/g) ?? []).length;
      if (soDong > 0) {
        daXong = Math.min(daXong + soDong, tongSoBang);
        onTienTrinh?.(daXong, tongSoBang);
      }
    });
    proc.on("error", reject);
    proc.on("close", (ma) => {
      if (ma !== 0) {
        reject(new Error(`pg_dump thoát với mã ${ma}: ${stderrGop.slice(-2000)}`));
        return;
      }
      ghiFileXong.then(resolve, reject);
    });
  });
}

/** Dem truoc tong so cau lenh COPY (~ so bang can phuc hoi) de lam mau so %. */
export async function demTongBuocPhucHoi(duongDanFileTam: string): Promise<number> {
  const noiDung = await readFile(duongDanFileTam, "utf8");
  const khop = noiDung.match(/^COPY .+ FROM stdin;/gm);
  return khop?.length ?? 0;
}

/**
 * Ngat cac ket noi Postgres KHAC dang giu database dich (ke ca pool cua chinh
 * NestJS process) truoc khi phuc hoi - ket noi qua database bao tri "postgres",
 * KHONG phai database dich (khong the ngat chinh ket noi minh dang dung).
 * Noi goi PHAI tu prisma.$disconnect() TRUOC ham nay - xem spec muc 6.1.
 */
export async function ngatKetNoiKhac(db: ThongTinKetNoiDb): Promise<void> {
  const client = new PgClient({
    host: db.host,
    port: Number(db.port),
    user: db.nguoiDung,
    password: db.matKhau,
    database: "postgres",
  });
  await client.connect();
  try {
    await client.query(
      "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()",
      [db.tenDb],
    );
  } finally {
    await client.end();
  }
}

/**
 * Chay psql tu file tam. 2 che do giong chaySaoLuu(): goi truc tiep tren host
 * (dung -f doc thang file tam), hoac qua "docker exec -i" - luc nay KHONG
 * dung -f (file tam nam tren host, khong "thay" duoc tu ben trong container)
 * ma PIPE noi dung file vao stdin cua "docker exec -i", psql doc tu stdin.
 */
export function chayPhucHoi(params: {
  db: ThongTinKetNoiDb;
  duongDanFileTam: string;
  tongSoBuoc: number;
  onTienTrinh?: OnTienTrinh;
}): Promise<void> {
  const { db, duongDanFileTam, tongSoBuoc, onTienTrinh } = params;
  const container = tenContainerDocker();

  return new Promise((resolve, reject) => {
    // -a: echo moi cau lenh ra stdout (dung de dem tien trinh qua dong COPY).
    // ON_ERROR_STOP=1: dung ngay neu loi, khong chay tiep phan con lai cua file.
    const coTuyChon = ["-a", "-v", "ON_ERROR_STOP=1"];

    const lenh = container ? "docker" : duongDanPsql();
    const args = container
      ? ["exec", "-i", "-e", `PGPASSWORD=${db.matKhau}`, container, "psql", ...coTuyChon, ...thamSoKetNoiDocker(db)]
      : [...coTuyChon, ...thamSoKetNoiHost(db), "-f", duongDanFileTam];

    const proc = spawn(lenh, args, {
      env: container ? process.env : { ...process.env, PGPASSWORD: db.matKhau },
    });

    if (container) {
      const docFile = createReadStream(duongDanFileTam);
      docFile.on("error", reject);
      docFile.pipe(proc.stdin);
    }

    let daXong = 0;
    let stderrGop = "";
    proc.stdout.on("data", (chunk: Buffer) => {
      const text = chunk.toString("utf8");
      const soDong = (text.match(/^COPY /gm) ?? []).length;
      if (soDong > 0) {
        daXong = Math.min(daXong + soDong, tongSoBuoc);
        onTienTrinh?.(daXong, tongSoBuoc);
      }
    });
    proc.stderr.on("data", (chunk: Buffer) => {
      stderrGop += chunk.toString("utf8");
    });
    proc.on("error", reject);
    proc.on("close", (ma) => {
      if (ma === 0) resolve();
      else reject(new Error(`psql thoát với mã ${ma}: ${stderrGop.slice(-2000)}`));
    });
  });
}

/**
 * Ghi 1 dong nhat ky "Phuc hoi du lieu" SAU KHI phuc hoi xong, bang ket noi pg
 * TRUC TIEP (khong qua Prisma - da bi $disconnect() truoc khi phuc hoi). Bat
 * buoc ghi SAU, khong phai TRUOC: ban than phuc hoi ghi de toan bo bang
 * nhat_ky_he_thong ve dung trang thai trong file sao luu (do --clean
 * --if-exists), nen dong ghi truoc chac chan bi xoa mat - xem spec muc 6.1.
 * Id dung crypto.randomUUID() (khong phai cuid cua Prisma) - cot id la text
 * tu do, khong rang buoc dinh dang, nen van hop le.
 */
export async function ghiNhatKyPhucHoiTrucTiep(db: ThongTinKetNoiDb, tenFile: string): Promise<void> {
  const client = new PgClient({
    host: db.host,
    port: Number(db.port),
    user: db.nguoiDung,
    password: db.matKhau,
    database: db.tenDb,
  });
  await client.connect();
  try {
    await client.query(
      `INSERT INTO nhat_ky_he_thong (id, "nguoiDungId", "hanhDong", "doiTuong", "doiTuongId", "thoiGian")
       VALUES ($1, NULL, 'PHUC_HOI_DU_LIEU', 'SaoLuu', $2, now())`,
      [randomUUID(), tenFile],
    );
  } finally {
    await client.end();
  }
}

export function dinhDangThoiGianTenFile(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`;
}
