import { randomInt } from "node:crypto";

// Bo cac ky tu de nham lan khi doc: 0/O, 1/l/I.
const BANG_KY_TU = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

/** Sinh mat khau tam ngau nhien de cap cho tai khoan moi tao. */
export function sinhMatKhauTam(doDai = 12): string {
  let ketQua = "";
  for (let i = 0; i < doDai; i++) {
    ketQua += BANG_KY_TU[randomInt(0, BANG_KY_TU.length)];
  }
  return ketQua;
}
