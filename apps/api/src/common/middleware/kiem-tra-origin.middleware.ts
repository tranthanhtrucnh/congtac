import type { NextFunction, Request, Response } from "express";

const PHUONG_THUC_CAN_KIEM_TRA = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Chan CSRF o muc toi thieu: voi cac request lam thay doi du lieu, header
 * Origin (trinh duyet luon tu gui kem tren fetch/XHR) phai khop dung origin
 * cua web. Ket hop voi cookie SameSite=Lax + httpOnly da khai bao o
 * auth.constants.ts. Phu hop quy mo noi bo hien tai (xem NHAT_KY_QUYET_DINH.md).
 */
export function kiemTraOrigin(webOrigin: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!PHUONG_THUC_CAN_KIEM_TRA.has(req.method)) {
      next();
      return;
    }
    const origin = req.headers.origin;
    if (origin && origin !== webOrigin) {
      res.status(403).json({ message: "Yêu cầu bị từ chối (Origin không hợp lệ)" });
      return;
    }
    next();
  };
}
