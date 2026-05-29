$ErrorActionPreference = "Continue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$repoPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $repoPath "backend"
$desktopPath = Join-Path $repoPath "aplicativo desktop projeto"
$csprojPath = Join-Path $desktopPath "novatentativa projeto.csproj"

Write-Host "`n[JARVIS] Abrindo Bairro Conectado em modo portátil..." -ForegroundColor Cyan

Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process | Where-Object {
    $_.ProcessName -like "*novatentativa*" -or
    $_.ProcessName -like "*WindowsFormsApp*" -or
    $_.ProcessName -like "*Bairro*"
} | Stop-Process -Force -ErrorAction SilentlyContinue

Set-Location -LiteralPath $backendPath

if (-not (Test-Path "node_modules")) {
    npm install
}

node --check ".\server.js"

Start-Process powershell.exe -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    "Set-Location -LiteralPath '$backendPath'; npm start"
)

$ok = $false

for ($i = 1; $i -le 12; $i++) {
    Start-Sleep -Seconds 2

    try {
        Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET -TimeoutSec 3 | Out-Null
        $ok = $true
        break
    } catch {
        Write-Host "[...] Aguardando backend subir... $i" -ForegroundColor Yellow
    }
}

if ($ok) {
    Start-Process "http://localhost:3000"
    Start-Process "http://localhost:3000/ocorrencias.html"
    Start-Process "http://localhost:3000/perfil.html"
} else {
    Write-Host "[ERRO] Backend não respondeu. Veja a janela do npm start." -ForegroundColor Red
}

if (Test-Path $csprojPath) {
    Start-Process powershell.exe -ArgumentList @(
        "-NoExit",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        "Set-Location -LiteralPath '$desktopPath'; dotnet run --project '$csprojPath'"
    )
}

if (Get-Command code -ErrorAction SilentlyContinue) {
    code $repoPath
}

Write-Host "`n[JARVIS] Sistema portátil iniciado." -ForegroundColor Green
Write-Host "Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Código admin Forms: bairro-admin-2026" -ForegroundColor Cyan
