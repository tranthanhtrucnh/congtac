/**
 * Suy luan "cap bac" tu chuoi chuc vu tu do (khong co truong rieng trong CSDL) -
 * dung de sap xep mac dinh danh sach nhan vien: cap bac cao hon len truoc.
 * So cang nho = cap bac cang cao. Thu tu kiem tra trong mang QUAN TRONG:
 * bien the "Pho ..." phai duoc kiem truoc dang goc de khong bi khop nham
 * (vi du "Pho Giam doc" cung chua chuoi con "Giam doc").
 *
 * Day la suy doan heuristic tu du lieu chuc danh thuc te cua don vi, khong
 * phai truong du lieu chuan hoa - neu xuat hien chuc danh moi chua luong
 * duoc, ham se xep vao nhom mac dinh (hang thap nhat) thay vi loi.
 */
const THU_TU_CHUC_VU: { mau: RegExp; hang: number }[] = [
  { mau: /chủ tịch/i, hang: 0 },
  { mau: /phó\s*(tổng)?\s*giám đốc/i, hang: 2 },
  { mau: /(tổng)?\s*giám đốc/i, hang: 1 },
  { mau: /kế toán trưởng/i, hang: 3 },
  { mau: /phó\s*(trưởng)?\s*phòng/i, hang: 4 },
  { mau: /trưởng phòng|trưởng ban|trưởng/i, hang: 3 },
];

const HANG_MAC_DINH = 5;

export function xepHangChucVu(chucVu: string | null | undefined): number {
  if (!chucVu) return HANG_MAC_DINH;
  for (const { mau, hang } of THU_TU_CHUC_VU) {
    if (mau.test(chucVu)) return hang;
  }
  return HANG_MAC_DINH;
}
