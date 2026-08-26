import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Xoa TOAN BO du lieu chung tu (LDCT + thanh vien + GDD + LDX), bo dem cap so
 * (cau_hinh_danh_so), va nhat ky he thong - dung 1 LAN truoc khi giao may cho
 * Van thu dung that, de xoa sach du lieu mau/test da tao trong luc phat
 * trien. KHONG dung ung dung (nut "Huy") vi CLAUDE.md quy tac TUYET DOI #6
 * cam tai su dung so chung tu da huy - cong cu nay xoa CUNG luon o tang
 * database, chi dung 1 lan duy nhat truoc ngay van hanh that.
 *
 * KHONG dong den: tai khoan (nguoi_dung), vai tro/quyen, danh muc Nhan vien/
 * Phuong tien/Dia diem/Nguoi ky, cau hinh don vi - gia dinh day la du lieu
 * THAT da nhap dung, khong phai du lieu mau (xac nhan voi nguoi dung truoc
 * khi viet script nay, xem NHAT_KY_QUYET_DINH.md).
 *
 * Sau khi chay, dãy so ca 3 loai chung tu (LDCT/GDD/LDX) tro ve trang thai
 * "chua thiet lap" - chung tu THAT dau tien se tu dong bat dau tu so 1 (hoac
 * vao trang /danh-so de tu chon so bat dau khac neu can noi tiep so giay cu).
 *
 * Cach dung (BAT BUOC co --xac-nhan de tranh chay nham):
 *   pnpm --filter @congtac/api run du-lieu:xoa-mau-chung-tu -- --xac-nhan
 */
async function main() {
  if (!process.argv.includes("--xac-nhan")) {
    // eslint-disable-next-line no-console
    console.error(
      'Chua xac nhan. Chay lai voi co "--xac-nhan" neu chac chan muon xoa TOAN BO ' +
        "du lieu chung tu (LDCT/GDD/LDX) va nhat ky he thong.\n" +
        "  pnpm --filter @congtac/api run du-lieu:xoa-mau-chung-tu -- --xac-nhan",
    );
    process.exit(1);
  }

  const [soLdx, soGdd, soThanhVien, soLdct, soDanhSo, soNhatKy] = await Promise.all([
    prisma.lenhDieuXe.count(),
    prisma.giayDiDuong.count(),
    prisma.thanhVienLenhDieuCongTac.count(),
    prisma.lenhDieuCongTac.count(),
    prisma.cauHinhDanhSo.count(),
    prisma.nhatKyHeThong.count(),
  ]);

  // eslint-disable-next-line no-console
  console.log(
    `Sap xoa: ${soLdx} Lenh dieu xe, ${soGdd} Giay di duong, ${soThanhVien} thanh vien doan ` +
      `cong tac, ${soLdct} Lenh dieu cong tac, ${soDanhSo} cau hinh danh so, ${soNhatKy} dong nhat ky.`,
  );

  // Thu tu xoa: con truoc cha (LenhDieuXe/GiayDiDuong/ThanhVien tham chieu
  // toi LenhDieuCongTac) de khong vuong rang buoc khoa ngoai.
  await prisma.lenhDieuXe.deleteMany({});
  await prisma.giayDiDuong.deleteMany({});
  await prisma.thanhVienLenhDieuCongTac.deleteMany({});
  await prisma.lenhDieuCongTac.deleteMany({});
  await prisma.cauHinhDanhSo.deleteMany({});
  await prisma.nhatKyHeThong.deleteMany({});

  // eslint-disable-next-line no-console
  console.log(
    "Da xoa xong. Danh muc Nhan vien/Phuong tien/Dia diem/Nguoi ky, tai khoan va cau hinh " +
      "don vi VAN GIU NGUYEN. Chung tu that dau tien se tu dong bat dau tu so 1 (hoac vao " +
      "trang /danh-so de tu chon so bat dau khac).",
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
