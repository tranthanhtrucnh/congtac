import type { NextFunction, Request, Response } from "express";

/**
 * Tat cache trinh duyet cho MOI response cua API. Khong co header nay, trinh
 * duyet CO THE tra ve ban PDF/JSON da luu cache truoc do cho CUNG 1 URL - ro
 * nhat voi PDF nhung trong <iframe src="..."> o XemTruocPdfDialog (day la
 * kieu tai tai nguyen giong the <img>, trinh duyet ap dung HTTP cache mac
 * dinh cho GET khi server khong noi ro "dung cache") - khien du lieu vua sua
 * (vd ngay di/ve rieng, thong tin thanh vien LDCT) KHONG hien ra du CSDL va
 * API da dung, chi la trinh duyet dang hien lai ban cu da luu tu lan xem
 * truoc. Nguoi dung phat hien 2026-08-28, xem NHAT_KY_QUYET_DINH.md.
 */
export function tatCache(_req: Request, res: Response, next: NextFunction) {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  next();
}
