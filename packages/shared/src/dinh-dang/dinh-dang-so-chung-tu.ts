/**
 * Dinh dang so thu tu chung tu (LDCT/GDD/LDX) theo chuan hanh chinh Viet Nam:
 * dem so 0 toi thieu 2 chu so (01, 02, ..., 09, 10, 11, ..., 100...).
 * Ap dung khi HIEN THI/IN "So: xx/LOAI" - khong doi cach luu tru so dem
 * (soHienTai trong CauHinhDanhSo van la Int thuan, chi dinh dang luc hien).
 */
export function dinhDangSoChungTu(so: number): string {
  return String(so).padStart(2, "0");
}
