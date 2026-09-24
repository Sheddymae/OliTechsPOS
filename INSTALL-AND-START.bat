@echo off
setlocal
cd /d "%~dp0"
echo ========================================
echo OliTechs PMS ^& POS Local Installer
echo ========================================
where node >nul 2>nul || (echo Node.js is not installed. Install Node.js 20+ first. ^& pause ^& exit /b 1)
echo.
echo Installing dependencies...
call npm install
if errorlevel 1 (echo npm install failed. ^& pause ^& exit /b 1)
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p='%~dp0START-OLITECHS.bat';$w=New-Object -ComObject WScript.Shell;$d=[Environment]::GetFolderPath('Desktop');$s=$w.CreateShortcut((Join-Path $d 'OliTechs PMS ^& POS.lnk'));$s.TargetPath=$p;$s.WorkingDirectory='%~dp0';$s.Description='OliTechs PMS ^& POS';$ico=Join-Path '%~dp0' 'public\olitechs.ico';if(Test-Path $ico){$s.IconLocation=$ico};$s.Save();Write-Host 'Desktop shortcut created successfully.' -ForegroundColor Green"
echo.
echo Desktop shortcut installed: OliTechs PMS ^& POS
echo Login: Admin
echo Password: Trial2026
echo.
echo Starting OliTechs PMS, POS and Central Licensing Platform...
call npm run dev
