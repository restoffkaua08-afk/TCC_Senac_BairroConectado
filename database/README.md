# Database — Bairro Conectado

Esta pasta contém os arquivos necessários para recriar o banco SQL Server LocalDB em outro computador.

Servidor:

(localdb)\MSSQLLocalDB

Banco:

BairroConectadoDB

Como recriar:

powershell -ExecutionPolicy Bypass -File .\database\setup-database.ps1

Tabelas principais:

Usuarios
Ocorrencias
OcorrenciaVotos
