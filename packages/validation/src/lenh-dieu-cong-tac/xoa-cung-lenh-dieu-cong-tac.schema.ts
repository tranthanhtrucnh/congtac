import { z } from "zod";

// Xoa CUNG (mat han khoi CSDL, khac Huy) - bat go lai DUNG so hieu chung tu de
// xac nhan (chan xoa nham), kiem tra lai o CA server (khong tin client) vi
// day la thao tac khong the hoan tac. Server con tu kiem tra rieng dieu kien
// "dang la so MOI NHAT ca 3 day LDCT/GDD/LDX" - khong the bieu dien bang zod
// don thuan, xem LenhDieuCongTacService.xoaCung(). Ban DON GIAN HOA 2026-08-20
// (khong con bang "so trong"/chon thu cong nhu ban dau) - xem
// NHAT_KY_QUYET_DINH.md muc "Xoa cung chung tu - don gian hoa 2026-08-20".
export const xoaCungLenhDieuCongTacSchema = z.object({
  xacNhanSoHieu: z.string().trim().min(1, "Vui lòng gõ lại số hiệu chứng từ để xác nhận"),
});

export type XoaCungLenhDieuCongTacInput = z.infer<typeof xoaCungLenhDieuCongTacSchema>;
