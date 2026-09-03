import { z } from "zod";

/** Truy van "chung tu dang giu so hieu LON NHAT hien co" cho 1 (loaiChungTu,
 * nam) - dung de canh bao MEM (khong chan luu) khi Van thu nhap "Ngay lap"
 * cho 1 chung tu MOI/dang sua SOM HON ngay lap cua chung tu da duoc cap so
 * LON HON no trong CUNG nam (xem DanhSoService.layChungTuSoLonNhat() va
 * apps/web/components/canh-bao-ngay-lap-khong-theo-thu-tu.tsx). CHI ho tro
 * LDCT/LDX (KHONG co GDD) - GiayDiDuong khong co truong ngayKy rieng (live-
 * derive tu LenhDieuCongTac cha) va giao dien cung khong co o nhap Ngay lap
 * doc lap cho GDD. loaiTruId (tuy chon) - loai chinh ban ghi dang SUA khoi
 * ket qua so sanh, tranh so sanh voi chinh no. Nguoi dung yeu cau 2026-08-27,
 * xem NHAT_KY_QUYET_DINH.md. */
export const chungTuSoLonNhatSchema = z.object({
  loaiChungTu: z.enum(["LDCT", "LDX"]),
  nam: z.coerce
    .number()
    .int()
    .min(2000, "Năm không hợp lệ")
    .max(2100, "Năm không hợp lệ"),
  loaiTruId: z.string().optional(),
});

export type ChungTuSoLonNhatInput = z.infer<typeof chungTuSoLonNhatSchema>;
