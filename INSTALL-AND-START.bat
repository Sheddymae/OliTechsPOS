@echo off
setlocal
cd /d "%~dp0"
echo ========================================
echo OliTechs PMS ^& POS Local Test
 echo ========================================
where node >nul 2>nul || (echo Node.js is not installed. Install Node.js 20+ first. & pause & exit /b 1)
echo Installing dependencies...
call npm install
if errorlevel 1 (echo npm install failed. & pause & exit /b 1)
echo Starting OliTechs PMS, POS and Central Licensing Platform...
call npm run dev
