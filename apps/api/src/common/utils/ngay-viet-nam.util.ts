/**
 * Doc ngay dang chu kieu Viet Nam (dd/mm/yyyy hoac dd-mm-yyyy). CHU Y: khong
 * dung `new Date(chuoi)` cho du lieu nhap tay tu Word/Excel - JS se hieu
 * theo kieu My (mm/dd/yyyy) va lam sai ngay sinh (vd "09/10/1982" se thanh
 * 10 thang 9 thay vi dung la 9 thang 10).
 */
export function docNgayVietNam(giaTri: string): Date | null {
  const khop = giaTri.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!khop) return null;

  const ngay = Number(khop[1]);
  const thang = Number(khop[2]);
  const nam = Number(khop[3]);
  if (thang < 1 || thang > 12 || ngay < 1 || ngay > 31) return null;

  const ketQua = new Date(Date.UTC(nam, thang - 1, ngay));
  // Kiem tra ngay/thang hop le thuc su (vd 31/04 se bi JS "tran" sang thang 5).
  if (
    ketQua.getUTCFullYear() !== nam ||
    ketQua.getUTCMonth() !== thang - 1 ||
    ketQua.getUTCDate() !== ngay
  ) {
    return null;
  }
  return ketQua;
}
