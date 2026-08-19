/**
 * Bo dau tieng Viet + ha chu thuong - dung de tao cot "khong dau" phuc vu
 * tim kiem gan dung khong phu thuoc nguoi dung go co dau hay khong. Lam o
 * tang ung dung (khong dung extension `unaccent` cua Postgres) de khong phu
 * thuoc cau hinh server luc hosting.
 */
export function boDauTiengViet(chuoi: string): string {
  return chuoi
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}
