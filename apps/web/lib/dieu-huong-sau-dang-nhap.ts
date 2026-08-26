import { MA_QUYEN } from "@congtac/shared";

/**
 * Trang dich sau khi dang nhap thanh cong (hoac vua doi xong mat khau bat
 * buoc) - Quan tri he thong (nhan biet qua quyen VAI_TRO_SUA, quyen DUY NHAT
 * vai tro nay co - xem packages/shared/src/phan-quyen/ma-quyen.ts) van vao
 * Trang tong quan ("/") nhu cu; cac vai tro con lai (Van thu, Lanh dao TC-HC,
 * Nguoi xem) vao THANG Danh sach lenh dieu cong tac ("/lenh-dieu-cong-tac") -
 * do la man hinh ho thao tac nhieu nhat hang ngay, tranh phai bam them 1 buoc
 * tu Trang tong quan. Nguoi dung yeu cau 2026-08-19, xem NHAT_KY_QUYET_DINH.md.
 */
export function duongDanSauDangNhap(quyen: string[]): string {
  return quyen.includes(MA_QUYEN.VAI_TRO_SUA) ? "/" : "/lenh-dieu-cong-tac";
}
