$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "`n[JARVIS] Configurando banco BairroConectadoDB..." -ForegroundColor Cyan

if (Get-Command sqllocaldb -ErrorAction SilentlyContinue) {
    sqllocaldb start MSSQLLocalDB | Out-Null
}

Add-Type -AssemblyName System.Data

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

$masterConnection = "Data Source=(localdb)\MSSQLLocalDB;Initial Catalog=master;Integrated Security=True;TrustServerCertificate=True"
$dbConnection = "Data Source=(localdb)\MSSQLLocalDB;Initial Catalog=BairroConectadoDB;Integrated Security=True;TrustServerCertificate=True"

function Invoke-Sql {
    param(
        [string]$ConnectionString,
        [string]$SqlText
    )

    $conn = New-Object System.Data.SqlClient.SqlConnection $ConnectionString
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = $SqlText
    $cmd.CommandTimeout = 120

    try {
        $conn.Open()
        $cmd.ExecuteNonQuery() | Out-Null
    }
    finally {
        $conn.Close()
    }
}

function Query-Sql {
    param(
        [string]$ConnectionString,
        [string]$SqlText
    )

    $conn = New-Object System.Data.SqlClient.SqlConnection $ConnectionString
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = $SqlText
    $cmd.CommandTimeout = 120
    $table = New-Object System.Data.DataTable

    try {
        $conn.Open()
        $reader = $cmd.ExecuteReader()
        $table.Load($reader)
    }
    finally {
        $conn.Close()
    }

    return $table
}

$createDbSql = Get-Content (Join-Path $scriptDir "01-create-database.sql") -Raw -Encoding UTF8
$createTablesSql = Get-Content (Join-Path $scriptDir "02-create-tables.sql") -Raw -Encoding UTF8

Invoke-Sql -ConnectionString $masterConnection -SqlText $createDbSql
Invoke-Sql -ConnectionString $dbConnection -SqlText $createTablesSql

Write-Host "`n[JARVIS] Banco pronto. Tabelas encontradas:" -ForegroundColor Green

Query-Sql -ConnectionString $dbConnection -SqlText @"
SELECT TABLE_NAME AS Tabela
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
"@ | Format-Table -AutoSize
