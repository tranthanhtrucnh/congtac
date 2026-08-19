-- Backfill noi dung "Can cu" mac dinh cho mau in LDCT Tram TP.HCM (nguoi
-- dung cung cap noi dung that 2026-08-10, xem NHAT_KY_QUYET_DINH.md). Moi
-- dong da bo san tien to "Căn cứ " va dau ";" cuoi dong - canCuHtml() trong
-- lenh-dieu-cong-tac-mau-in.ts se tu them lai 2 phan nay khi in. CHI cap
-- nhat neu cot dang rong (NULL hoac chuoi rong) de KHONG ghi de neu quan
-- tri da tu sua qua /cau-hinh-don-vi truoc khi migration nay chay.
UPDATE "cau_hinh_don_vi"
SET "canCuMauTram" = 'Quyết định số 07/QĐ-XSKT ngày 23/01/2026 của Công ty TNHH MTV Xổ số Kiến thiết An Giang về việc ban hành Quy chế làm việc tại Trạm phát hành vé số An Giang, Thành phố Hồ Chí Minh của Công ty TNHH MTV Xổ số kiến thiết An Giang
Quyết định số 15/QĐ-XSKT ngày 27/02/2026 của Công ty TNHH MTV Xổ số Kiến thiết An Giang về việc lịch công tác, thư ký Hội đồng giám sát xổ số và hủy vé ế các tỉnh tháng 03 năm 2026'
WHERE "id" = 'mac-dinh' AND ("canCuMauTram" IS NULL OR "canCuMauTram" = '');
