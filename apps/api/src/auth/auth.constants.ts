import type { CookieOptions } from "express";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

export const THOI_HAN_ACCESS_TOKEN = "15m";
export const THOI_HAN_REFRESH_TOKEN_NGAY = 7;

const CO_SO: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

/** Cookie access token: dung cho moi request API, thoi han ngan. */
export function tuyChonCookieAccessToken(): CookieOptions {
  return { ...CO_SO, path: "/", maxAge: 15 * 60 * 1000 };
}

/**
 * Cookie refresh token: chi gui kem khi goi cac route duoi /api/auth
 * (giam be mat lo token neu co loi o noi khac).
 */
export function tuyChonCookieRefreshToken(): CookieOptions {
  return {
    ...CO_SO,
    path: "/api/auth",
    maxAge: THOI_HAN_REFRESH_TOKEN_NGAY * 24 * 60 * 60 * 1000,
  };
}
