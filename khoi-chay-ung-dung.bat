@echo off
cd /d "%~dp0"
echo === Cai dat / cap nhat goi thu vien (bo qua neu da du) ===
call pnpm install
echo.
echo === Khoi dong web + api ===
echo Web:  http://localhost:3000
echo API:  http://localhost:3001/api/health
echo (Dong cua so nay de dung server)
echo.
call pnpm dev
pause
