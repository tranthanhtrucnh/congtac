"use client";

import { useEffect } from "react";
import { goiApi } from "@/lib/api";

// Duoi han access token 15 phut (THOI_HAN_ACCESS_TOKEN, xem
// apps/api/src/auth/auth.constants.ts) mot khoang du de khong bao gio de
// access token het han giua luc dang thao tac.
const CHU_KY_LAM_MOI_PHIEN_MS = 10 * 60 * 1000;

/**
 * Tu dong lam moi phien dang nhap dinh ky (goi /auth/lam-moi moi 10 phut),
 * KHONG QUAN TAM nguoi dung co dang thao tac hay khong - mien trang con mo
 * (tab con song) la phien con duoc gia han vo thoi han. Thay the hoan toan
 * GiamSatKhongHoatDong (component cu, da xoa) von con tu dong DANG XUAT sau
 * N phut khong thao tac - nguoi dung yeu cau bo hang dong nay hoan toan
 * 2026-08-31: "mình muốn chỉ đăng xuất khi người dùng bấm đăng xuất". Vi
 * khong con phan biet "dang hoat dong" hay "idle" nua, KHONG can theo doi su
 * kien chuot/ban phim/cuon/cham nhu truoc, va cung KHONG can ky thuat "bao
 * hieu hoat dong" tu ben trong iframe xem PDF (lib/hoat-dong-nguoi-dung.ts,
 * da xoa cung luc) - toan bo phan phuc tap do bien mat, component nay chi
 * con dung 1 setInterval don gian.
 *
 * refresh token duoc BACKEND xoay vong (rotate) moi lan goi /auth/lam-moi
 * (xem AuthService.lamMoi() - thu hoi token cu, cap token moi voi han 7 ngay
 * TINH LAI TU LUC GOI), nen mien component nay con chay dinh ky (tab con mo)
 * thi ca access token LAN refresh token deu duoc gia han truot (sliding
 * expiration) vo thoi han - dung dung y "chi dang xuat khi bam dang xuat".
 * Neu tab bi dong/may tat qua 7 ngay lien tuc khong mo lai, refresh token se
 * het han that (gioi han cung o tang backend, khong sua o day) - truong hop
 * hiem trong thuc te van phong, chap nhan duoc.
 *
 * Loi mang khi goi lam moi (vd mat mang tam thoi) chi bo qua im lang - lan
 * ke tiep (10 phut sau) se thu lai; neu phien that su het han, cac request
 * API khac se tu bao loi 401 rieng, khong can component nay xu ly.
 *
 * Chi mount o cac trang DA dang nhap (xem AppShell - an hoan toan o
 * /dang-nhap, /doi-mat-khau).
 */
export function TuDongLamMoiPhien() {
  useEffect(() => {
    const hen = setInterval(() => {
      goiApi("/auth/lam-moi", { method: "POST" }).catch(() => {
        // Im lang bo qua - xem giai thich o doc comment dau file.
      });
    }, CHU_KY_LAM_MOI_PHIEN_MS);
    return () => clearInterval(hen);
  }, []);

  return null;
}
