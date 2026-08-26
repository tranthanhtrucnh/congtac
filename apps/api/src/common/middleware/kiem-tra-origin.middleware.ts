import type { NextFunction, Request, Response } from "express";

const PHUONG_THUC_CAN_KIEM_TRA = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Chan CSRF o muc toi thieu: voi cac request lam thay doi du lieu, header
 * Origin (trinh duyet luon tu gui kem tren fetch/XHR) phai khop 1 trong cac
 * origin duoc phep. Ket hop voi cookie SameSite=Lax + httpOnly da khai bao o
 * auth.constants.ts. Phu hop quy mo noi bo hien tai (xem NHAT_KY_QUYET_DINH.md).
 *
 * `webOrigin` nhan 1 CHUOI (nhu truoc) hoac 1 MANG nhieu origin duoc phep
 * cung luc - dung khi truy cap web tu nhieu dia chi khac nhau (vd vua
 * localhost luc dang phat trien, vua dia chi Tailscale khi truy cap tu xa).
 * Xem NHAT_KY_QUYET_DINH.md muc "Truy cap tu xa qua Tailscale".
 */
export function kiemTraOrigin(webOrigin: string | string[]) {
  const dsChoPhep = Array.isArray(webOrigin) ? webOrigin : [webOrigin];
  return (req: Request, res: Response, next: NextFunction) => {
    if (!PHUONG_THUC_CAN_KIEM_TRA.has(req.method)) {
      next();
      return;
    }
    const origin = req.headers.origin;
    if (origin && !dsChoPhep.includes(origin)) {
      res.status(403).json({ message: "Yêu cầu bị từ chối (Origin không hợp lệ)" });
      return;
    }
    next();
  };
}
