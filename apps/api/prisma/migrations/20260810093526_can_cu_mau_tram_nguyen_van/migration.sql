-- Doi quy uoc canCuHtml(): tu "tu dong them Căn cứ ...;" sang "in nguyen
-- van" (nguoi dung yeu cau 2026-08-10, xem NHAT_KY_QUYET_DINH.md). Migration
-- truoc (20260810092215_backfill_can_cu_mau_tram) da chen san 2 dong o dang
-- CHUA co tien to/hau to (dung quy uoc CU). Migration nay chi cap nhat lai
-- dung dinh dang MOI (co san "Căn cứ "/";") NEU cot van con dung y het gia
-- tri da chen o migration truoc - de KHONG ghi de bat ky noi dung nao nguoi
-- dung da tu sua qua /cau-hinh-don-vi tu luc do den nay.
UPDATE "cau_hinh_don_vi"
SET "canCuMauTram" = 'Căn cứ Quyết định số 07/QĐ-XSKT ngày 23/01/2026 của Công ty TNHH MTV Xổ số Kiến thiết An Giang về việc ban hành Quy chế làm việc tại Trạm phát hành vé số An Giang, Thành phố Hồ Chí Minh của Công ty TNHH MTV Xổ số kiến thiết An Giang;
Căn cứ Quyết định số 15/QĐ-XSKT ngày 27/02/2026 của Công ty TNHH MTV Xổ số Kiến thiết An Giang về việc lịch công tác, thư ký Hội đồng giám sát xổ số và hủy vé ế các tỉnh tháng 03 năm 2026;'
WHERE "id" = 'mac-dinh' AND "canCuMauTram" = 'Quyết định số 07/QĐ-XSKT ngày 23/01/2026 của Công ty TNHH MTV Xổ số Kiến thiết An Giang về việc ban hành Quy chế làm việc tại Trạm phát hành vé số An Giang, Thành phố Hồ Chí Minh của Công ty TNHH MTV Xổ số kiến thiết An Giang
Quyết định số 15/QĐ-XSKT ngày 27/02/2026 của Công ty TNHH MTV Xổ số Kiến thiết An Giang về việc lịch công tác, thư ký Hội đồng giám sát xổ số và hủy vé ế các tỉnh tháng 03 năm 2026';
