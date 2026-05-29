$ErrorActionPreference = "Continue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$desktopPath = "C:\Users\1050029\Downloads\TCC_Senac_BairroConectado\aplicativo desktop projeto"
$csprojPath = "C:\Users\1050029\Downloads\TCC_Senac_BairroConectado\aplicativo desktop projeto\novatentativa projeto.csproj"

Write-Host "
[JARVIS] Abrindo Forms administrador..." -ForegroundColor Cyan
Write-Host "Projeto: $csprojPath" -ForegroundColor Yellow

Set-Location -LiteralPath "$desktopPath"

dotnet clean "$csprojPath"
dotnet build "$csprojPath" -c Debug

if ($LASTEXITCODE -eq 0) {
    dotnet run --project "$csprojPath"
} else {
    Write-Host "
[JARVIS] Build falhou. Veja o erro acima." -ForegroundColor Red
}
