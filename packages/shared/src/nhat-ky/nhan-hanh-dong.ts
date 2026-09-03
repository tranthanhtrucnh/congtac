/**
 * Anh xa MOI ma `hanhDong` dang ghi vao NhatKyHeThong (xem
 * apps/api/src/common/nhat-ky/nhat-ky.service.ts) sang nhan tieng Viet cu
 * the, cong voi 1 "nhom" rong hon dung lam tag loc o trang /nhat-ky (giong
 * cach lam voi tag loc loaiMauIn o /lenh-dieu-cong-tac). Dung CHUNG giua
 * backend (validate gia tri "nhom" truyen len query) va frontend (hien thi
 * nhan + tag loc) - tranh 2 noi dinh nghia lech nhau.
 *
 * QUAN TRONG: khi them 1 lenh ghiNhan() hanhDong MOI o bat ky service/
 * controller nao, PHAI them dong tuong ung vao THONG_TIN_HANH_DONG ben duoi -
 * khong thi se hien nhan fallback la chinh ma tho (xem nhanHanhDong()).
 */

export const NHOM_HANH_DONG = {
  TAO: "TAO",
  SUA: "SUA",
  XOA_HUY: "XOA_HUY",
  IN: "IN",
  DANH_SO: "DANH_SO",
  DANG_NHAP_XUAT: "DANG_NHAP_XUAT",
  MAT_KHAU: "MAT_KHAU",
  TAI_KHOAN: "TAI_KHOAN",
  SAO_LUU: "SAO_LUU",
  KHAC: "KHAC",
} as const;

export type MaNhomHanhDong = (typeof NHOM_HANH_DONG)[keyof typeof NHOM_HANH_DONG];

export const TAT_CA_NHOM_HANH_DONG: MaNhomHanhDong[] = Object.values(NHOM_HANH_DONG);

export const NHAN_NHOM_HANH_DONG: Record<MaNhomHanhDong, string> = {
  TAO: "Tạo mới",
  SUA: "Sửa",
  XOA_HUY: "Xóa / Hủy",
  IN: "In",
  DANH_SO: "Đánh số chứng từ",
  DANG_NHAP_XUAT: "Đăng nhập / Đăng xuất",
  MAT_KHAU: "Mật khẩu",
  TAI_KHOAN: "Khóa / Mở khóa tài khoản",
  SAO_LUU: "Sao lưu / Phục hồi",
  KHAC: "Khác",
};

export interface ThongTinHanhDong {
  /** Nhan cu the, hien o cot "Hanh dong" cua bang nhat ky. */
  nhan: string;
  /** Nhom rong hon, dung cho tag loc. */
  nhom: MaNhomHanhDong;
}

export const THONG_TIN_HANH_DONG: Record<string, ThongTinHanhDong> = {
  // Xac thuc (auth.service.ts)
  DANG_NHAP: { nhan: "Đăng nhập", nhom: "DANG_NHAP_XUAT" },
  DANG_XUAT: { nhan: "Đăng xuất", nhom: "DANG_NHAP_XUAT" },
  DOI_MAT_KHAU: { nhan: "Đổi mật khẩu", nhom: "MAT_KHAU" },

  // Nguoi dung (nguoi-dung.service.ts)
  TAO_NGUOI_DUNG: { nhan: "Tạo tài khoản người dùng", nhom: "TAO" },
  SUA_NGUOI_DUNG: { nhan: "Sửa tài khoản người dùng", nhom: "SUA" },
  KHOA_TAI_KHOAN: { nhan: "Khóa tài khoản", nhom: "TAI_KHOAN" },
  MO_KHOA_TAI_KHOAN: { nhan: "Mở khóa tài khoản", nhom: "TAI_KHOAN" },
  DAT_LAI_MAT_KHAU: { nhan: "Đặt lại mật khẩu", nhom: "MAT_KHAU" },

  // Dia diem (dia-diem.service.ts)
  TAO_DIA_DIEM: { nhan: "Thêm địa điểm", nhom: "TAO" },
  SUA_DIA_DIEM: { nhan: "Sửa địa điểm", nhom: "SUA" },
  XOA_DIA_DIEM: { nhan: "Xóa địa điểm", nhom: "XOA_HUY" },
  XOA_NHIEU_DIA_DIEM: { nhan: "Xóa nhiều địa điểm", nhom: "XOA_HUY" },

  // Cau hinh don vi (cau-hinh-don-vi.service.ts)
  SUA_CAU_HINH_DON_VI: { nhan: "Sửa thông tin đơn vị", nhom: "SUA" },

  // Danh so (danh-so.service.ts)
  THIET_LAP_DAY_SO: { nhan: "Thiết lập dãy số chứng từ", nhom: "DANH_SO" },
  CAP_SO: { nhan: "Cấp số chứng từ", nhom: "DANH_SO" },

  // Lenh dieu xe (lenh-dieu-xe.service.ts)
  TAO_LENH_DIEU_XE: { nhan: "Tạo lệnh điều xe", nhom: "TAO" },
  SUA_LENH_DIEU_XE: { nhan: "Sửa lệnh điều xe", nhom: "SUA" },
  HUY_LENH_DIEU_XE: { nhan: "Hủy lệnh điều xe", nhom: "XOA_HUY" },

  // Lenh dieu cong tac (lenh-dieu-cong-tac.service.ts)
  TAO_LENH_DIEU_CONG_TAC: { nhan: "Tạo lệnh điều công tác", nhom: "TAO" },
  SUA_LENH_DIEU_CONG_TAC: { nhan: "Sửa lệnh điều công tác", nhom: "SUA" },
  HUY_LENH_DIEU_CONG_TAC: { nhan: "Hủy lệnh điều công tác", nhom: "XOA_HUY" },
  // Xoa CUNG (mat han khoi CSDL, cascade GDD+LDX) - khac Huy. Xem
  // NHAT_KY_QUYET_DINH.md muc "Xoa cung chung tu - don gian hoa 2026-08-20".
  XOA_LENH_DIEU_CONG_TAC: { nhan: "Xóa cứng lệnh điều công tác", nhom: "XOA_HUY" },

  // In chung tu (bo sung 2026-08-14 - xem NHAT_KY_QUYET_DINH.md muc "Nhat ky
  // he thong"). 6 endpoint xem/in PDF, moi endpoint 1 ma rieng.
  XEM_IN_LENH_DIEU_XE: { nhan: "Xem/in lệnh điều xe", nhom: "IN" },
  // Bo sung 2026-08-26 - xem NHAT_KY_QUYET_DINH.md muc "In nhieu lenh dieu
  // xe cung luc".
  XEM_IN_NHIEU_LENH_DIEU_XE: { nhan: "Xem/in nhiều lệnh điều xe đã chọn", nhom: "IN" },
  XEM_IN_LENH_DIEU_CONG_TAC: { nhan: "Xem/in lệnh điều công tác (riêng)", nhom: "IN" },
  // Bo sung 2026-08-28 - xem NHAT_KY_QUYET_DINH.md muc "In nhieu lenh dieu
  // cong tac cung luc".
  XEM_IN_NHIEU_LENH_DIEU_CONG_TAC: { nhan: "Xem/in nhiều lệnh điều công tác đã chọn", nhom: "IN" },
  XEM_IN_LENH_DIEU_CONG_TAC_VA_LENH_DIEU_XE: {
    nhan: "Xem/in lệnh điều công tác kèm lệnh điều xe",
    nhom: "IN",
  },
  XEM_IN_TOAN_BO_GIAY_DI_DUONG: { nhan: "Xem/in toàn bộ công lệnh/giấy đi đường của đoàn", nhom: "IN" },
  XEM_IN_GIAY_DI_DUONG: { nhan: "Xem/in công lệnh/giấy đi đường (riêng 1 người)", nhom: "IN" },
  XEM_IN_NHIEU_GIAY_DI_DUONG: { nhan: "Xem/in nhiều công lệnh/giấy đi đường đã chọn", nhom: "IN" },
  // Bo sung 2026-08-26 - xem NHAT_KY_QUYET_DINH.md muc "So theo doi cong lenh
  // - mau in".
  XEM_IN_SO_THEO_DOI_CONG_LENH: { nhan: "Xem/in sổ theo dõi công lệnh", nhom: "IN" },
  // Bo sung 2026-08-26 - xem NHAT_KY_QUYET_DINH.md muc "Bao cao phuong tien".
  XEM_IN_BAO_CAO_PHUONG_TIEN: { nhan: "Xem/in báo cáo phương tiện", nhom: "IN" },
  // Bo sung 2026-08-26 - "Mau in nhap" cho Van thu xem truoc layout (khong
  // luu CSDL, khong cap so). Xem NHAT_KY_QUYET_DINH.md muc "Mau in nhap".
  XEM_IN_NHAP_LENH_DIEU_CONG_TAC: { nhan: "Xem/in nháp lệnh điều công tác", nhom: "IN" },
  XEM_IN_NHAP_GIAY_DI_DUONG: { nhan: "Xem/in nháp công lệnh/giấy đi đường", nhom: "IN" },
  XEM_IN_NHAP_LENH_DIEU_XE: { nhan: "Xem/in nháp lệnh điều xe", nhom: "IN" },

  // Nhan vien (nhan-vien.service.ts, nhap/nhap-nhan-vien.service.ts)
  TAO_NHAN_VIEN: { nhan: "Thêm nhân viên", nhom: "TAO" },
  SUA_NHAN_VIEN: { nhan: "Sửa nhân viên", nhom: "SUA" },
  XOA_NHAN_VIEN: { nhan: "Xóa nhân viên", nhom: "XOA_HUY" },
  XOA_NHIEU_NHAN_VIEN: { nhan: "Xóa nhiều nhân viên", nhom: "XOA_HUY" },
  NHAP_DANH_SACH_NHAN_VIEN: { nhan: "Nhập danh sách nhân viên từ file", nhom: "KHAC" },

  // Phuong tien (phuong-tien.service.ts)
  TAO_PHUONG_TIEN: { nhan: "Thêm phương tiện", nhom: "TAO" },
  SUA_PHUONG_TIEN: { nhan: "Sửa phương tiện", nhom: "SUA" },
  XOA_PHUONG_TIEN: { nhan: "Xóa phương tiện", nhom: "XOA_HUY" },
  XOA_NHIEU_PHUONG_TIEN: { nhan: "Xóa nhiều phương tiện", nhom: "XOA_HUY" },

  // Nguoi ky (nguoi-ky.service.ts)
  TAO_NGUOI_KY: { nhan: "Thêm người ký", nhom: "TAO" },
  SUA_NGUOI_KY: { nhan: "Sửa người ký", nhom: "SUA" },
  XOA_NGUOI_KY: { nhan: "Xóa người ký", nhom: "XOA_HUY" },
  DAT_NGUOI_KY_CHINH_THUC: { nhan: "Đặt người ký chính thức", nhom: "KHAC" },

  // Sao luu / phuc hoi (sao-luu.service.ts) - bo sung 2026-08-14, xem
  // docs/superpowers/specs/2026-08-14-sao-luu-phuc-hoi-du-lieu-design.md.
  SAO_LUU_THU_CONG: { nhan: "Sao lưu dữ liệu", nhom: "SAO_LUU" },
  PHUC_HOI_DU_LIEU: { nhan: "Phục hồi dữ liệu", nhom: "SAO_LUU" },

  // Vai tro / phan quyen (vai-tro.service.ts) - bo sung 2026-08-17, xem
  // docs/superpowers/specs/2026-08-17-vai-tro-phan-quyen-design.md.
  SUA_QUYEN_VAI_TRO: { nhan: "Sửa quyền vai trò", nhom: "SUA" },
};

/** Nhan hien thi - fallback ve chinh ma tho neu chua khai bao (khong lam vo
 * giao dien, chi thieu dep). */
export function nhanHanhDong(ma: string): string {
  return THONG_TIN_HANH_DONG[ma]?.nhan ?? ma;
}

/** Nhom dung cho tag loc - fallback ve "KHAC" neu chua khai bao. */
export function nhomHanhDong(ma: string): MaNhomHanhDong {
  return THONG_TIN_HANH_DONG[ma]?.nhom ?? "KHAC";
}
