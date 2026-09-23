param([string]$BackupDir="C:\OliTechsBackups",[string]$PostgresBin="C:\Program Files\PostgreSQL\17\bin",[string]$DbUser="postgres",[string]$DbName="olitech_pms")
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
$pgdump=Join-Path $PostgresBin "pg_dump.exe"
if(!(Test-Path $pgdump)){Write-Host "pg_dump.exe not found." -ForegroundColor Red; exit 1}
$stamp=Get-Date -Format "yyyyMMdd-HHmmss"
& $pgdump -U $DbUser -d $DbName -F c -f (Join-Path $BackupDir "olitech-$stamp.dump")
Write-Host "Backup created." -ForegroundColor Green
