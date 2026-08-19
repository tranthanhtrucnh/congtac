/**
 * Nguong CANH BAO do dai noi dung "Noi di" + "Noi den" (Dia diem cong tac)
 * cua Lenh dieu cong tac - dung CHUNG cho 2 tang:
 *
 * 1. Backend (apps/api/src/lenh-dieu-cong-tac/lenh-dieu-cong-tac-mau-in.ts,
 *    ham noiDungMatTruocGdd) - vuot NGUONG_NHE thi tu dong bat che do "gon"
 *    (giam line-height/dem bang) cho mau in Cong lenh kiem giay di duong
 *    (GDD) mat truoc, tranh tran sang trang 2 - GDD LUON co dinh kho A5,
 *    KHONG tu dong doi sang A4 nhu Lenh dieu cong tac khi noi dung dai.
 * 2. Frontend (dialog Tao/Sua Lenh dieu cong tac) - hien canh bao SOM ngay
 *    khi nguoi dung dang go o o "Noi di"/"Noi den", TRUOC khi luu/in, de biet
 *    truoc kha nang anh huong bo cuc ban in - khong chan luu (chi la canh
 *    bao/huong dan, khong phai loi validation cung).
 *
 * Dat CHUNG 1 noi (thay vi hardcode rieng o tung tang) de backend/frontend
 * khong bi lech nguong voi nhau khi sua sau nay. Nguoi dung yeu cau
 * 2026-08-14 (sau khi xac nhan che do "gon" hoat dong tot voi 1 vi du thuc
 * te ~50 ky tu), xem NHAT_KY_QUYET_DINH.md.
 *
 * CHUA do bang ban in Chromium that trong moi truong lam viec cua Claude
 * (sandbox chan tai trinh duyet) - 2 nguong duoi la UOC LUONG thu cong dua
 * tren kich thuoc phong/dong, can nguoi dung xac nhan lai qua thuc te in.
 */

/** Vuot nguong nay: backend tu bat che do "gon" (van in duoc, chi thu gon
 * khoang cach) - frontend hien canh bao NHE (amber), chi mang tinh thong
 * bao, khong can hanh dong ngay. */
export const NGUONG_CANH_BAO_NHE_DO_DAI_NOI_DI_DEN = 35;

/** Vuot nguong nay: kha nang cao van anh huong bo cuc du da bat che do "gon"
 * (vd tran sang trang 2 that su) - frontend hien canh bao MANH (do/destructive),
 * khuyen nguoi dung nen rut gon Noi di/Noi den truoc khi luu. */
export const NGUONG_CANH_BAO_MANH_DO_DAI_NOI_DI_DEN = 70;
