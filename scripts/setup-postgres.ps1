param([string]$PostgresBin="C:\Program Files\PostgreSQL\17\bin",[string]$DbUser="postgres",[string]$DbName="olitech_pms")
$psql=Join-Path $PostgresBin "psql.exe"
if(!(Test-Path $psql)){Write-Host "psql.exe not found. Use -PostgresBin with your PostgreSQL bin folder." -ForegroundColor Yellow; exit 1}
& $psql -U $DbUser -c "CREATE DATABASE $DbName;" 2>$null
& $psql -U $DbUser -d $DbName -f "$PSScriptRoot\..\database\schema.sql"
Write-Host "Database ready: $DbName" -ForegroundColor Green
