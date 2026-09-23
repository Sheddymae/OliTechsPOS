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
choice /C YN /N /M "Create a Desktop shortcut for OliTechs PMS ^& POS? [Y/N]: "
if errorlevel 2 goto START
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p='%~dp0START-OLITECHS.bat';$w=New-Object -ComObject WScript.Shell;$s=$w.CreateShortcut([Environment]::GetFolderPath('Desktop')+'OliTechs PMS & POS.lnk');$s.TargetPath=$p;$s.WorkingDirectory='%~dp0';$s.Description='OliTechs PMS & POS';$s.Save();Write-Host 'Desktop shortcut created.'"
:START
echo.
echo Starting OliTechs PMS, POS and Central Licensing Platform...
call npm run dev
