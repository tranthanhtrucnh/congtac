/**
 * Danh sach ma quyen chuan hoa - nguon duy nhat dung chung giua seed du lieu
 * (apps/api), guard kiem tra quyen (apps/api) va an/hien nut o giao dien
 * (apps/web). Xem docs/QUY_TAC_NGHIEP_VU.md muc "Phan quyen".
 *
 * Quy uoc ma: "<nhom>.<hanh-dong>". Cac nhom chua co module thuc thi
 * (nhan-vien, chung-tu, danh-so) van khai bao san de khong phai sua lai
 * bang phan quyen moi lan them module moi.
 */
export const MA_QUYEN = {
  NGUOI_DUNG_XEM: "nguoi-dung.xem",
  NGUOI_DUNG_THEM: "nguoi-dung.them",
  NGUOI_DUNG_SUA: "nguoi-dung.sua",
  NGUOI_DUNG_KHOA: "nguoi-dung.khoa",

  NHAN_VIEN_XEM: "nhan-vien.xem",
  NHAN_VIEN_THEM: "nhan-vien.them",
  NHAN_VIEN_SUA: "nhan-vien.sua",
  NHAN_VIEN_XOA: "nhan-vien.xoa",

  PHUONG_TIEN_XEM: "phuong-tien.xem",
  PHUONG_TIEN_THEM: "phuong-tien.them",
  PHUONG_TIEN_SUA: "phuong-tien.sua",
  PHUONG_TIEN_XOA: "phuong-tien.xoa",

  DIA_DIEM_XEM: "dia-diem.xem",
  DIA_DIEM_THEM: "dia-diem.them",
  DIA_DIEM_SUA: "dia-diem.sua",
  DIA_DIEM_XOA: "dia-diem.xoa",

  // Tach rieng .xem voi .tao de gan cho ca Van thu/Lanh dao/Nguoi xem doc lap.
  // KHONG co quyen phe duyet/tu choi/trinh duyet - da bo luong duyet, Van
  // thu lap va in truc tiep (xem NHAT_KY_QUYET_DINH.md muc "Bo luong phe
  // duyet", 2026-08-10).
  CHUNG_TU_XEM: "chung-tu.xem",
  CHUNG_TU_TAO: "chung-tu.tao",
  CHUNG_TU_SUA: "chung-tu.sua",
  CHUNG_TU_IN: "chung-tu.in",
  // Rieng cho "Mau in nhap" (/mau-nhap) - TACH khoi CHUNG_TU_IN tu 2026-08-27
  // (ban dau dung chung "In chung tu" theo quyet dinh 2026-08-26, sau do
  // nguoi dung phat hien vai tro "Nguoi xem" da duoc cap CHUNG_TU_IN nen vo
  // tinh thay duoc ca mau in nhap - muon tach rieng de co the cho phep in
  // chung tu THAT ma khong can cho xem mau in nhap, hoac nguoc lai). Xem
  // NHAT_KY_QUYET_DINH.md.
  CHUNG_TU_IN_NHAP: "chung-tu.in-nhap",
  CHUNG_TU_HUY: "chung-tu.huy",
  // Xoa CUNG (mat han khoi CSDL, khac Huy) - CHI ap dung cho Lenh dieu cong
  // tac dang giu SO MOI NHAT ca 3 day (LDCT/GDD/LDX), tu dong lui bo dem ve
  // dung MAX con ton tai (khong dung bang "so trong" rieng) - xem
  // NHAT_KY_QUYET_DINH.md muc "Xoa cung chung tu - don gian hoa 2026-08-20".
  CHUNG_TU_XOA: "chung-tu.xoa",

  DANH_SO_THIET_LAP: "danh-so.thiet-lap",
  DANH_SO_CAP: "danh-so.cap",

  // Thong tin don vi (ten co quan chu quan/cong ty dung tren mau in + sidebar)
  // - xem chia cho ca 4 vai tro (hien thi sidebar can), sua chi Quan tri he
  // thong. Xem NHAT_KY_QUYET_DINH.md muc doi ten don vi khi sap nhap.
  DON_VI_XEM: "don-vi.xem",
  DON_VI_SUA: "don-vi.sua",

  NGUOI_KY_XEM: "nguoi-ky.xem",
  NGUOI_KY_THEM: "nguoi-ky.them",
  NGUOI_KY_SUA: "nguoi-ky.sua",
  NGUOI_KY_XOA: "nguoi-ky.xoa",
  // Hanh dong rieng (khac .sua) vi duoc cap cho ca Lanh dao Phong TC-HC,
  // khong chi Quan tri he thong - xem QUY_TAC_NGHIEP_VU.md muc "Danh muc
  // nguoi ky".
  NGUOI_KY_DAT_CHINH_THUC: "nguoi-ky.dat-chinh-thuc",

  // Chi cap cho vai tro Quan tri he thong (khong cap Van thu/Lanh dao/Nguoi
  // xem) - xem docs/QUY_TAC_NGHIEP_VU.md muc "Nhat ky he thong": "khong duoc
  // sua/xoa boi nguoi dung thuong; chi Quan tri he thong xem toan bo". Chi co
  // 1 hanh dong .xem (khong co .sua/.xoa - nhat ky khong sua/xoa duoc qua UI).
  NHAT_KY_XEM: "nhat-ky.xem",

  // Gop sao luu + phuc hoi lam 1 quyen duy nhat (trang chi danh Quan tri he
  // thong, khong can tach nho hon o ban dau) - xem docs/superpowers/specs/
  // 2026-08-14-sao-luu-phuc-hoi-du-lieu-design.md.
  SAO_LUU_QUAN_LY: "sao-luu.quan-ly",

  // Sua tap quyen cua vai tro qua trang /vai-tro - CHI cap Quan tri he thong.
  // Rieng quyen cua CHINH vai tro Quan tri he thong van co dinh (khong sua
  // duoc qua UI du co quyen nay) - chan o tang backend, xem
  // docs/superpowers/specs/2026-08-17-vai-tro-phan-quyen-design.md.
  VAI_TRO_SUA: "vai-tro.sua",
} as const;

export type MaQuyen = (typeof MA_QUYEN)[keyof typeof MA_QUYEN];

export const TAT_CA_MA_QUYEN: MaQuyen[] = Object.values(MA_QUYEN);

/**
 * Ma 4 vai tro mac dinh - xem docs/QUY_TAC_NGHIEP_VU.md muc "Phan quyen".
 * Vai tro moi (ngoai 4 vai tro nay) co the them qua bang VaiTro sau nay.
 */
export const MA_VAI_TRO = {
  QUAN_TRI_HE_THONG: "quan-tri-he-thong",
  VAN_THU: "van-thu",
  LANH_DAO_TC_HC: "lanh-dao-tc-hc",
  NGUOI_XEM: "nguoi-xem",
} as const;

export type MaVaiTro = (typeof MA_VAI_TRO)[keyof typeof MA_VAI_TRO];
