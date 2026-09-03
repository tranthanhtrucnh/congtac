import { z } from "zod";

// Xoa CUNG (mat han khoi CSDL, khac Huy) - bat go XAC NHAN de chan xoa nham,
// kiem tra lai o CA server (khong tin client) vi day la thao tac khong the
// hoan tac. Server con tu kiem tra rieng dieu kien "dang la so MOI NHAT ca 3
// day LDCT/GDD/LDX" - khong the bieu dien bang zod don thuan, xem
// LenhDieuCongTacService.xoaCung(). Ban DON GIAN HOA 2026-08-20 (khong con
// bang "so trong"/chon thu cong nhu ban dau) - xem NHAT_KY_QUYET_DINH.md muc
// "Xoa cung chung tu - don gian hoa 2026-08-20".
//
// LICH SU xac nhan: ban dau bat go LAI DUNG so hieu chung tu (vd
// "459/LĐCT-XSKT") - nguoi dung phan hoi 2026-08-28 khong xoa duoc, rat co
// the do chuoi so hieu that co dinh dang phuc tap (dau /, chu viet tat) de
// go sai/khong khop chinh xac. Doi sang go 1 chu cai "Y" (viet hoa/thuong deu
// duoc) don gian hon nhieu, giam rui ro go sai lam that bai xac nhan - VAN
// giu duoc tinh nang "phai chu dong go them 1 buoc" de tranh bam nham nut
// Xoa, chi khong con doi hoi go CHINH XAC 1 chuoi phuc tap nua. Nguoi dung
// yeu cau 2026-08-28, xem NHAT_KY_QUYET_DINH.md.
export const xoaCungLenhDieuCongTacSchema = z.object({
  xacNhanXoa: z
    .string()
    .trim()
    .refine((v) => v.toUpperCase() === "Y", { message: 'Vui lòng gõ chữ "Y" để xác nhận đồng ý xóa' }),
});

export type XoaCungLenhDieuCongTacInput = z.infer<typeof xoaCungLenhDieuCongTacSchema>;
