@echo off
REM Khoi dong ban CHINH THUC (production) - dung hang ngay tren may Van thu.
REM Khac voi khoi-chay-ung-dung.bat (che do dev, danh cho luc dang phat trien):
REM script nay chay ban da build san (pnpm build), khoi dong nhanh hon va on
REM dinh hon, KHONG tu cai lai thu vien moi lan chay.
REM
REM Dieu kien: da chay "pnpm build" it nhat 1 lan (xem cap-nhat-ung-dung.bat).

cd /d "%~dp0"

echo === Khoi dong ung dung Lenh cong tac - Cong lenh - Dieu xe (production) ===
echo Web:  http://localhost:3000
echo API:  http://localhost:3001/api/health
echo.
echo Se mo 2 cua so thu nho (API, WEB) duoi thanh taskbar - dung de xem log
echo khi can. Dong 2 cua so do se tat ung dung.
echo.

start "API - Cong lenh" /min cmd /k "cd /d %~dp0apps\api && pnpm run start"
start "WEB - Cong lenh" /min cmd /k "cd /d %~dp0apps\web && pnpm run start"

echo Da khoi dong xong.
