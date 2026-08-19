import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { chuanHoaBienSo } from "@congtac/validation";

const prisma = new PrismaClient();

/**
 * Cong cu dong lenh nhap 1 lan danh sach phuong tien do nguoi dung cung cap
 * (anh chup danh sach xe cua don vi, khong phai file Excel/Word nen khong
 * dung duoc man "Nhap tu Excel/Word"). Idempotent - chay lai nhieu lan
 * khong tao trung (kiem tra theo bienSoChuan truoc khi tao).
 *
 * Cach dung: pnpm phuong-tien:them-mau
 */
interface PhuongTienMau {
  bienSo: string;
  nhanHieu: string;
  soCho?: number;
  ghiChu?: string;
  /** Ten tai xe - doi chieu voi Danh muc Nhan vien (laTaiXe = true) theo ten. */
  tenTaiXe?: string;
}

const DANH_SACH: PhuongTienMau[] = [
  { bienSo: "67B-005.24", nhanHieu: "Toyota", soCho: 16, tenTaiXe: "Nguyễn Quang Thi" },
  {
    bienSo: "67A-114.95",
    nhanHieu: "Toyota Camry",
    ghiChu: "Xe dùng chung",
    tenTaiXe: "Nguyễn Thành Trung",
  },
  { bienSo: "67D-000.99", nhanHieu: "Ford Transit", tenTaiXe: "Nguyễn Thành Trung" },
  { bienSo: "67D-000.72", nhanHieu: "Ford Transit", tenTaiXe: "Lê Minh Phụng" },
  { bienSo: "67A-127.52", nhanHieu: "Ford Tourneo", tenTaiXe: "Trịnh Hoàng Mỹ" },
  { bienSo: "67A-068.77", nhanHieu: "Land Cruiser", tenTaiXe: "Nguyễn Quang Thi" },
  { bienSo: "67C-187.75", nhanHieu: "Isuzu", tenTaiXe: "Nguyễn Quang Thi" },
];

async function main() {
  let daThem = 0;
  let daBoQua = 0;
  let khongKhopTaiXe = 0;

  for (const pt of DANH_SACH) {
    const bienSoChuan = chuanHoaBienSo(pt.bienSo);

    const daTonTai = await prisma.phuongTien.findUnique({ where: { bienSoChuan } });
    if (daTonTai) {
      // eslint-disable-next-line no-console
      console.log(`Bỏ qua (biển số đã có trong danh mục): ${pt.bienSo}`);
      daBoQua++;
      continue;
    }

    const taiXe = pt.tenTaiXe
      ? await prisma.nhanVien.findFirst({ where: { hoTen: pt.tenTaiXe, laTaiXe: true } })
      : null;

    const ghiChu = [pt.ghiChu];
    if (pt.tenTaiXe && !taiXe) {
      ghiChu.push(
        `Tài xế "${pt.tenTaiXe}" chưa khớp trong Danh mục Nhân viên - vui lòng gán tay ở màn Sửa`,
      );
      khongKhopTaiXe++;
    }

    const phuongTien = await prisma.phuongTien.create({
      data: {
        bienSo: pt.bienSo,
        bienSoChuan,
        nhanHieu: pt.nhanHieu,
        soCho: pt.soCho,
        ghiChu: ghiChu.filter(Boolean).join(" - ") || undefined,
        taiXeThuongDungId: taiXe?.id,
      },
    });

    await prisma.nhatKyHeThong.create({
      data: {
        hanhDong: "TAO_PHUONG_TIEN",
        doiTuong: "PhuongTien",
        doiTuongId: phuongTien.id,
        giaTriSau: { kenh: "cli-them-phuong-tien-mau", bienSo: phuongTien.bienSo },
      },
    });

    // eslint-disable-next-line no-console
    console.log(
      `Đã thêm: ${pt.bienSo} - ${pt.nhanHieu}${taiXe ? ` (tài xế: ${taiXe.hoTen})` : ""}`,
    );
    daThem++;
  }

  // eslint-disable-next-line no-console
  console.log(
    `\nHoàn tất: thêm ${daThem}, bỏ qua ${daBoQua} (đã có sẵn)${
      khongKhopTaiXe > 0 ? `, ${khongKhopTaiXe} xe chưa khớp được tài xế` : ""
    }.`,
  );
}

main()
  .catch((loi) => {
    // eslint-disable-next-line no-console
    console.error(loi);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
