@echo off
REM Chay file nay THU CONG moi khi co code moi tren GitHub can cap nhat vao
REM may Van thu. Khong dung hang ngay - chi dung khi ban (nguoi phat trien)
REM bao co ban moi.
REM
REM Lam gi: dung app dang chay -> lay code moi -> cai lai thu vien (neu can)
REM -> cap nhat cau truc du lieu (neu co migration moi) -> build lai ban
REM chinh thuc -> khoi dong lai.

cd /d "%~dp0"

echo === Dang dung ung dung hien tai (neu co) ===
taskkill /FI "WINDOWTITLE eq API - Cong lenh*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq WEB - Cong lenh*" /T /F >nul 2>&1

echo.
echo === Lay code moi tu GitHub ===
git pull origin main
if errorlevel 1 (
  echo LOI: git pull that bai. Kiem tra lai ket noi mang / xung dot file roi chay lai.
  pause
  exit /b 1
)

echo.
echo === Cai / cap nhat thu vien ===
call pnpm install
if errorlevel 1 (
  echo LOI: pnpm install that bai.
  pause
  exit /b 1
)

echo.
echo === Cap nhat cau truc du lieu (an toan, khong xoa du lieu cu) ===
call pnpm --filter @congtac/api exec prisma migrate deploy
if errorlevel 1 (
  echo LOI: migrate deploy that bai. KHONG build/khoi dong lai - kiem tra loi truoc.
  pause
  exit /b 1
)

echo.
echo === Dong bo quyen/vai tro moi (an toan, khong ghi de quyen da tuy chinh
echo qua /vai-tro cua Van thu/Lanh dao/Nguoi xem - chi Quan tri he thong luon
echo dong bo lai, xem seed.ts) ===
call pnpm --filter @congtac/api run prisma:seed
if errorlevel 1 (
  echo LOI: chay seed that bai. KHONG build/khoi dong lai - kiem tra loi truoc.
  pause
  exit /b 1
)

echo.
echo === Build ban chinh thuc ===
call pnpm build
if errorlevel 1 (
  echo LOI: build that bai. KHONG khoi dong lai ban cu bi loi.
  pause
  exit /b 1
)

echo.
echo === Khoi dong lai ===
call chay-san-xuat.bat

echo.
echo Hoan tat cap nhat.
pause
