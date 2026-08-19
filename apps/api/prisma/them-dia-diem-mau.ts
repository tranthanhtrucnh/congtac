import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Cong cu dong lenh nhap 1 lan danh sach dia diem thuc te rut ra tu cac file
 * Cong lenh/Giay di duong that do nguoi dung cung cap (5 file .doc/.docx).
 * Idempotent - chay lai nhieu lan khong tao trung (kiem tra theo tenDayDu).
 *
 * Cac ten viet tat giu nguyen y nhu tren mau in - KHONG tu doan nghia day
 * du (vd MT, THạnh, TVinh) de tranh sai, nguoi dung tu sua qua man Sua neu
 * can. Xem NHAT_KY_QUYET_DINH.md muc "Danh muc Dia diem".
 *
 * Cach dung: pnpm dia-diem:them-mau
 */
interface DiaDiemMau {
  tenDayDu: string;
  cacTenTat?: string[];
  ghiChu?: string;
  thuongDung?: boolean;
  diemDiMacDinh?: boolean;
}

const DANH_SACH: DiaDiemMau[] = [
  {
    // Doi tu "Long Xuyen" sang ten hanh chinh day du sau sap nhap/doi ten don
    // vi hanh chinh 2025 (Long Xuyen thanh 1 phuong truc thuoc tinh An Giang) -
    // nguoi dung yeu cau 2026-08-14, xem NHAT_KY_QUYET_DINH.md.
    tenDayDu: "P. Long Xuyên, An Giang",
    cacTenTat: ["Long Xuyên", "P. Long Xuyên, AG", "LX"],
    ghiChu: "Trụ sở Công ty",
    thuongDung: true,
    diemDiMacDinh: true,
  },
  { tenDayDu: "Rạch Giá", cacTenTat: ["P. Rạch Giá, AG", "RG"], thuongDung: true },
  { tenDayDu: "Tri Tôn", cacTenTat: ["X. Tri Tôn, T. An Giang", "H. Tri Tôn, T. An Giang"] },
  { tenDayDu: "Châu Đốc", cacTenTat: ["X. Phú Hữu, P. Châu Đốc (An Giang)"] },
  { tenDayDu: "Tịnh Biên", cacTenTat: ["TX. Tịnh Biên, T. An Giang"] },
  { tenDayDu: "TP. Hồ Chí Minh", cacTenTat: ["TP.HCM"], thuongDung: true },
  { tenDayDu: "Cần Thơ", cacTenTat: ["TP. Cần Thơ", "NKiều", "Vị Tân"], thuongDung: true },
  { tenDayDu: "Đồng Tháp", cacTenTat: ["ĐTháp", "CL", "MT", "Sa Đéc"], thuongDung: true },
  { tenDayDu: "Vĩnh Long", cacTenTat: ["VLong", "THạnh", "TVinh"] },
  { tenDayDu: "Cà Mau", cacTenTat: ["AXuyên", "Bliêu"] },
  { tenDayDu: "Tây Ninh", cacTenTat: ["LA"] },
];

async function main() {
  let daThem = 0;
  let daBoQua = 0;

  for (const dd of DANH_SACH) {
    const daTonTai = await prisma.diaDiem.findFirst({ where: { tenDayDu: dd.tenDayDu } });
    if (daTonTai) {
      // eslint-disable-next-line no-console
      console.log(`Bỏ qua (đã có trong danh mục): ${dd.tenDayDu}`);
      daBoQua++;
      continue;
    }

    const diaDiem = await prisma.diaDiem.create({
      data: {
        tenDayDu: dd.tenDayDu,
        cacTenTat: dd.cacTenTat ?? [],
        ghiChu: dd.ghiChu,
        thuongDung: dd.thuongDung ?? false,
        diemDiMacDinh: dd.diemDiMacDinh ?? false,
      },
    });

    await prisma.nhatKyHeThong.create({
      data: {
        hanhDong: "TAO_DIA_DIEM",
        doiTuong: "DiaDiem",
        doiTuongId: diaDiem.id,
        giaTriSau: { kenh: "cli-them-dia-diem-mau", tenDayDu: diaDiem.tenDayDu },
      },
    });

    // eslint-disable-next-line no-console
    console.log(`Đã thêm: ${dd.tenDayDu}${dd.cacTenTat?.length ? ` (${dd.cacTenTat.join(", ")})` : ""}`);
    daThem++;
  }

  // eslint-disable-next-line no-console
  console.log(`\nHoàn tất: thêm ${daThem}, bỏ qua ${daBoQua} (đã có sẵn).`);
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
