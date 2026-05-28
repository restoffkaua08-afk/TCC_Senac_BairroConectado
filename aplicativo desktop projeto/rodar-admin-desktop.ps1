$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
cd "C:\Users\1050029\Downloads\TCC_Senac_BairroConectado\aplicativo desktop projeto"
dotnet restore "C:\Users\1050029\Downloads\TCC_Senac_BairroConectado\aplicativo desktop projeto\novatentativa projeto.csproj"
dotnet run --project "C:\Users\1050029\Downloads\TCC_Senac_BairroConectado\aplicativo desktop projeto\novatentativa projeto.csproj"
