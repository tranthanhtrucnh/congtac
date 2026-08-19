export type MaLoaiChungTu = "LDCT" | "GDD" | "LDX";

/**
 * Ky hieu in tren chung tu (vd "LDCT", "GDD", "LDX") - KHAC voi ma noi bo
 * LDCT/GDD/LDX dung lam khoa CSDL cho 3 day so doc lap trong CauHinhDanhSo.
 * Ma noi bo la co dinh (gan voi logic 3 day so doc lap, doi se can migration).
 * Ky hieu in la van ban thuan, co the doi theo the thuc hanh chinh cua cong ty
 * ma KHONG can migration - vi ky hieu khong luu trong CauHinhDanhSo, chi la
 * hang so hien thi dung chung o 1 cho nay.
 *
 * QUAN TRONG cho module LDCT/GDD/LDX sau nay: khi tao chung tu, phai LUU LAI
 * chuoi so hieu day du da ghep san (vd "01/LDCT-XSKT") vao chinh ban ghi chung
 * tu tai thoi diem tao - KHONG ghep dong (KY_HIEU_LOAI_CHUNG_TU + soHienTai)
 * moi lan hien thi. Neu ghep dong, sau nay doi ky hieu o day se lam sai lech
 * so hieu cua CA CAC CHUNG TU CU da phat hanh (giay da in voi ky hieu cu).
 */
export const KY_HIEU_LOAI_CHUNG_TU: Record<MaLoaiChungTu, string> = {
  LDCT: "LĐCT",
  GDD: "GĐĐ",
  LDX: "LĐX",
};
