import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

/**
 * Cong cu dong lenh de dat lai mat khau khi khong con nho - ung dung noi bo
 * KHONG co luong "quen mat khau" tu phuc vu qua giao dien (CLAUDE.md quy tac
 * #4), nen day la cach duy nhat o giai doan phat trien nay. Luon bat buoc
 * doi mat khau o lan dang nhap ke tiep, giong het luong tao tai khoan moi.
 *
 * Cach dung:
 *   pnpm prisma:reset-mat-khau -- quantri MatKhauMoi@123
 *   pnpm prisma:reset-mat-khau                # mac dinh "quantri" + ADMIN_DEFAULT_PASSWORD
 */
async function main() {
  const tenDangNhap = process.argv[2] ?? "quantri";
  const matKhauMoi = process.argv[3] ?? process.env.ADMIN_DEFAULT_PASSWORD ?? "DoiMatKhau@123";

  const nguoiDung = await prisma.nguoiDung.findUnique({ where: { tenDangNhap } });
  if (!nguoiDung) {
    // eslint-disable-next-line no-console
    console.error(`Không tìm thấy tài khoản "${tenDangNhap}".`);
    process.exit(1);
  }

  const matKhauBam = await argon2.hash(matKhauMoi);

  await prisma.nguoiDung.update({
    where: { tenDangNhap },
    data: {
      matKhauBam,
      phaiDoiMatKhau: true,
      trangThai: "HOAT_DONG",
    },
  });

  // Ghi nhat ky theo CLAUDE.md quy tac #7 - danh dau ro day la thao tac lam
  // qua dong lenh (khong phai qua giao dien voi nguoi thuc hien xac thuc).
  await prisma.nhatKyHeThong.create({
    data: {
      hanhDong: "DAT_LAI_MAT_KHAU",
      doiTuong: "NguoiDung",
      doiTuongId: nguoiDung.id,
      giaTriSau: { kenh: "cli-reset-mat-khau", tenDangNhap },
    },
  });

  // eslint-disable-next-line no-console
  console.log(
    `Đã đặt lại mật khẩu cho "${tenDangNhap}". Mật khẩu tạm: ${matKhauMoi} (bắt buộc đổi khi đăng nhập lần đầu).`,
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
