import { z } from "zod";
import { TIEU_CHI_SAP_XEP_TAN_SUAT } from "./tan-suat-phuong-tien.schema";

/** Truy van cho phan "Thong ke tan suat cong tac cua tai xe" - CUNG hinh
 * dang/y nghia voi tanSuatPhuongTienSchema (xem file do de biet chi tiet quy
 * uoc): loc theo khoang ngay DI, bo trong = tinh toan bo lich su, tra ve
 * TOAN BO nhan vien co laTaiXe=true (ke ca da nghi viec/thoi tai xe - van co
 * gia tri thong ke lich su, va ke ca chua tung co luot di nao trong ky - de
 * thay ro tai xe "khong dung toi"). Dung chung 2 tieu chi sap xep voi phan
 * phuong tien (TIEU_CHI_SAP_XEP_TAN_SUAT) vi cung y nghia "so luot di" / "tong
 * so ngay su dung", chi khac doi tuong dem la tai xe thay vi xe. Xem
 * NHAT_KY_QUYET_DINH.md muc "Bao cao phuong tien". */
export const tanSuatTaiXeSchema = z.object({
  tuNgay: z.coerce.date({ invalid_type_error: "Từ ngày không hợp lệ" }).optional(),
  denNgay: z.coerce.date({ invalid_type_error: "Đến ngày không hợp lệ" }).optional(),
  sapXepTheo: z.enum(TIEU_CHI_SAP_XEP_TAN_SUAT).default("luotDi"),
  huongSapXep: z.enum(["asc", "desc"]).default("desc"),
});

export type TanSuatTaiXeInput = z.infer<typeof tanSuatTaiXeSchema>;
