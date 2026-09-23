@echo off
setlocal
cd /d "%~dp0"
echo ========================================
echo OliTechs PMS ^& POS Local Installer
echo ========================================
where node >nul 2>nul || (echo Node.js is not installed. Install Node.js 20+ first. & pause & exit /b 1)
echo.
echo Installing dependencies...
call npm install
if errorlevel 1 (echo npm install failed. & pause & exit /b 1)
echo.
choice /C YN /N /M "Create Desktop and Start Menu shortcuts for OliTechs PMS ^& POS? [Y/N]: "
if errorlevel 2 goto START
if errorlevel 1 (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scriptscreate-shortcut.ps1"
  if errorlevel 1 echo Shortcut creation failed. You can still start OliTechs manually.
)
:START
echo.
echo Starting OliTechs PMS, POS and Central Licensing Platform...
call npm run dev
