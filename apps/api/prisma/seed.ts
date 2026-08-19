import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";
import { MA_QUYEN, MA_VAI_TRO, TAT_CA_MA_QUYEN } from "@congtac/shared";

const prisma = new PrismaClient();

const DANH_SACH_QUYEN: { ma: string; nhom: string; moTa: string }[] = [
  { ma: MA_QUYEN.NGUOI_DUNG_XEM, nhom: "nguoi-dung", moTa: "Xem danh sách người dùng" },
  { ma: MA_QUYEN.NGUOI_DUNG_THEM, nhom: "nguoi-dung", moTa: "Tạo tài khoản người dùng" },
  { ma: MA_QUYEN.NGUOI_DUNG_SUA, nhom: "nguoi-dung", moTa: "Sửa thông tin người dùng" },
  { ma: MA_QUYEN.NGUOI_DUNG_KHOA, nhom: "nguoi-dung", moTa: "Khóa/mở khóa tài khoản" },

  { ma: MA_QUYEN.NHAN_VIEN_XEM, nhom: "nhan-vien", moTa: "Xem danh mục nhân viên" },
  { ma: MA_QUYEN.NHAN_VIEN_THEM, nhom: "nhan-vien", moTa: "Thêm nhân viên" },
  { ma: MA_QUYEN.NHAN_VIEN_SUA, nhom: "nhan-vien", moTa: "Sửa nhân viên" },
  { ma: MA_QUYEN.NHAN_VIEN_XOA, nhom: "nhan-vien", moTa: "Xóa nhân viên" },

  { ma: MA_QUYEN.PHUONG_TIEN_XEM, nhom: "phuong-tien", moTa: "Xem danh mục phương tiện" },
  { ma: MA_QUYEN.PHUONG_TIEN_THEM, nhom: "phuong-tien", moTa: "Thêm phương tiện" },
  { ma: MA_QUYEN.PHUONG_TIEN_SUA, nhom: "phuong-tien", moTa: "Sửa phương tiện" },
  { ma: MA_QUYEN.PHUONG_TIEN_XOA, nhom: "phuong-tien", moTa: "Xóa phương tiện" },

  { ma: MA_QUYEN.DIA_DIEM_XEM, nhom: "dia-diem", moTa: "Xem danh mục địa điểm" },
  { ma: MA_QUYEN.DIA_DIEM_THEM, nhom: "dia-diem", moTa: "Thêm địa điểm" },
  { ma: MA_QUYEN.DIA_DIEM_SUA, nhom: "dia-diem", moTa: "Sửa địa điểm" },
  { ma: MA_QUYEN.DIA_DIEM_XOA, nhom: "dia-diem", moTa: "Xóa địa điểm" },

  { ma: MA_QUYEN.CHUNG_TU_XEM, nhom: "chung-tu", moTa: "Xem chứng từ" },
  { ma: MA_QUYEN.CHUNG_TU_TAO, nhom: "chung-tu", moTa: "Tạo chứng từ" },
  { ma: MA_QUYEN.CHUNG_TU_SUA, nhom: "chung-tu", moTa: "Sửa chứng từ" },
  { ma: MA_QUYEN.CHUNG_TU_IN, nhom: "chung-tu", moTa: "In chứng từ" },
  { ma: MA_QUYEN.CHUNG_TU_HUY, nhom: "chung-tu", moTa: "Hủy chứng từ" },

  { ma: MA_QUYEN.DANH_SO_THIET_LAP, nhom: "danh-so", moTa: "Thiết lập dãy số chứng từ" },
  { ma: MA_QUYEN.DANH_SO_CAP, nhom: "danh-so", moTa: "Cấp số chứng từ" },

  { ma: MA_QUYEN.NGUOI_KY_XEM, nhom: "nguoi-ky", moTa: "Xem danh mục người ký" },
  { ma: MA_QUYEN.NGUOI_KY_THEM, nhom: "nguoi-ky", moTa: "Thêm người ký" },
  { ma: MA_QUYEN.NGUOI_KY_SUA, nhom: "nguoi-ky", moTa: "Sửa thông tin người ký" },
  { ma: MA_QUYEN.NGUOI_KY_XOA, nhom: "nguoi-ky", moTa: "Xóa người ký" },
  { ma: MA_QUYEN.NGUOI_KY_DAT_CHINH_THUC, nhom: "nguoi-ky", moTa: "Đặt làm người ký chính thức" },

  { ma: MA_QUYEN.DON_VI_XEM, nhom: "don-vi", moTa: "Xem thông tin đơn vị" },
  { ma: MA_QUYEN.DON_VI_SUA, nhom: "don-vi", moTa: "Sửa thông tin đơn vị" },

  { ma: MA_QUYEN.NHAT_KY_XEM, nhom: "nhat-ky", moTa: "Xem nhật ký hệ thống" },

  { ma: MA_QUYEN.SAO_LUU_QUAN_LY, nhom: "sao-luu", moTa: "Sao lưu và phục hồi dữ liệu" },

  { ma: MA_QUYEN.VAI_TRO_SUA, nhom: "vai-tro", moTa: "Sửa quyền của vai trò" },
];

const VAI_TRO_DINH_NGHIA: { ma: string; ten: string; moTa: string; quyen: readonly string[] }[] = [
  {
    ma: MA_VAI_TRO.QUAN_TRI_HE_THONG,
    ten: "Quản trị hệ thống",
    moTa: "Toàn quyền quản trị hệ thống",
    quyen: TAT_CA_MA_QUYEN,
  },
  {
    ma: MA_VAI_TRO.VAN_THU,
    ten: "Văn thư",
    moTa: "Lập và in chứng từ",
    quyen: [
      MA_QUYEN.NHAN_VIEN_XEM,
      MA_QUYEN.NHAN_VIEN_THEM,
      MA_QUYEN.NHAN_VIEN_SUA,
      MA_QUYEN.PHUONG_TIEN_XEM,
      MA_QUYEN.PHUONG_TIEN_THEM,
      MA_QUYEN.PHUONG_TIEN_SUA,
      MA_QUYEN.DIA_DIEM_XEM,
      MA_QUYEN.DIA_DIEM_THEM,
      MA_QUYEN.DIA_DIEM_SUA,
      MA_QUYEN.CHUNG_TU_XEM,
      MA_QUYEN.CHUNG_TU_TAO,
      MA_QUYEN.CHUNG_TU_SUA,
      MA_QUYEN.CHUNG_TU_IN,
      MA_QUYEN.CHUNG_TU_HUY,
      MA_QUYEN.DANH_SO_CAP,
      MA_QUYEN.NGUOI_KY_XEM,
      MA_QUYEN.DON_VI_XEM,
    ],
  },
  {
    ma: MA_VAI_TRO.LANH_DAO_TC_HC,
    ten: "Lãnh đạo Phòng TC-HC",
    // Khong con quyen phe duyet/tu choi (da bo luong duyet, xem
    // NHAT_KY_QUYET_DINH.md muc "Bo luong phe duyet") - giu lai vai tro nay
    // (khong xoa) de danh cho nhu cau khac sau nay (vd xem bao cao, thay
    // nguoi ky khi vang mat).
    moTa: "Xem chứng từ/báo cáo, thay người ký khi vắng mặt",
    quyen: [
      MA_QUYEN.NHAN_VIEN_XEM,
      MA_QUYEN.PHUONG_TIEN_XEM,
      MA_QUYEN.DIA_DIEM_XEM,
      MA_QUYEN.CHUNG_TU_XEM,
      MA_QUYEN.NGUOI_KY_XEM,
      // Cap rieng cho Lanh dao TC-HC (khong chi Quan tri) - nguoi truc tiep
      // biet khi nao minh vang mat de tu doi nguoi ky thay, khong can cho
      // Quan tri (xem NHAT_KY_QUYET_DINH.md).
      MA_QUYEN.NGUOI_KY_DAT_CHINH_THUC,
      MA_QUYEN.DON_VI_XEM,
    ],
  },
  {
    ma: MA_VAI_TRO.NGUOI_XEM,
    ten: "Người xem/tra cứu",
    moTa: "Chỉ xem, không chỉnh sửa dữ liệu",
    quyen: [
      MA_QUYEN.NHAN_VIEN_XEM,
      MA_QUYEN.PHUONG_TIEN_XEM,
      MA_QUYEN.DIA_DIEM_XEM,
      MA_QUYEN.CHUNG_TU_XEM,
      MA_QUYEN.NGUOI_KY_XEM,
      MA_QUYEN.DON_VI_XEM,
    ],
  },
];

async function main() {
  for (const quyen of DANH_SACH_QUYEN) {
    await prisma.quyen.upsert({
      where: { ma: quyen.ma },
      update: { nhom: quyen.nhom, moTa: quyen.moTa },
      create: quyen,
    });
  }

  for (const vaiTroDinhNghia of VAI_TRO_DINH_NGHIA) {
    const daTonTaiTruoc = await prisma.vaiTro.findUnique({ where: { ma: vaiTroDinhNghia.ma } });
    const vaiTro = await prisma.vaiTro.upsert({
      where: { ma: vaiTroDinhNghia.ma },
      update: { ten: vaiTroDinhNghia.ten, moTa: vaiTroDinhNghia.moTa, heThong: true },
      create: {
        ma: vaiTroDinhNghia.ma,
        ten: vaiTroDinhNghia.ten,
        moTa: vaiTroDinhNghia.moTa,
        heThong: true,
      },
    });

    // Quan tri he thong: LUON dong bo lai = TAT_CA_MA_QUYEN moi lan seed (co
    // dinh, khong sua qua UI /vai-tro). 3 vai tro con lai: CHI dat quyen mac
    // dinh o LAN DAU tao (chua ton tai truoc do) - sau do nguoi dung tu quan
    // ly qua UI /vai-tro, seed KHONG dung toi quyen cua 3 vai tro nay nua. Xem
    // docs/superpowers/specs/2026-08-17-vai-tro-phan-quyen-design.md muc 3.1.
    const laQuanTri = vaiTroDinhNghia.ma === MA_VAI_TRO.QUAN_TRI_HE_THONG;
    if (laQuanTri || !daTonTaiTruoc) {
      const danhSachQuyen = await prisma.quyen.findMany({
        where: { ma: { in: [...vaiTroDinhNghia.quyen] } },
      });

      await prisma.vaiTroQuyen.deleteMany({ where: { vaiTroId: vaiTro.id } });
      await prisma.vaiTroQuyen.createMany({
        data: danhSachQuyen.map((quyen) => ({ vaiTroId: vaiTro.id, quyenId: quyen.id })),
      });
    }
  }

  const vaiTroQuanTri = await prisma.vaiTro.findUniqueOrThrow({
    where: { ma: MA_VAI_TRO.QUAN_TRI_HE_THONG },
  });

  const matKhauMacDinh = process.env.ADMIN_DEFAULT_PASSWORD ?? "DoiMatKhau@123";
  const matKhauBam = await argon2.hash(matKhauMacDinh);

  const daTonTai = await prisma.nguoiDung.findUnique({ where: { tenDangNhap: "quantri" } });
  if (!daTonTai) {
    await prisma.nguoiDung.create({
      data: {
        tenDangNhap: "quantri",
        hoTen: "Quản trị hệ thống",
        matKhauBam,
        phaiDoiMatKhau: true,
        vaiTro: { create: [{ vaiTroId: vaiTroQuanTri.id }] },
      },
    });
    // eslint-disable-next-line no-console
    console.log(
      `Đã tạo tài khoản "quantri" - mật khẩu tạm: ${matKhauMacDinh} (bắt buộc đổi khi đăng nhập lần đầu)`,
    );
  } else {
    // eslint-disable-next-line no-console
    console.log('Tài khoản "quantri" đã tồn tại, giữ nguyên mật khẩu hiện tại.');
  }

  // eslint-disable-next-line no-console
  console.log("Seed hoàn tất: 4 vai trò, %d quyền.", DANH_SACH_QUYEN.length);
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
