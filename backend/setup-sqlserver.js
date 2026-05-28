require("dotenv").config();

const sql = require("mssql/msnodesqlv8");

const dbName = process.env.DB_NAME || "BairroConectadoDB";
const masterConnectionString = process.env.DB_MASTER_CONNECTION_STRING;
const dbConnectionString = process.env.DB_CONNECTION_STRING;

if (!masterConnectionString || !dbConnectionString) {
  console.error("Connection strings não configuradas no .env.");
  process.exit(1);
}

async function main() {
  console.log("[JARVIS] Conectando ao SQL Server em master...");

  const masterPool = await new sql.ConnectionPool({
    connectionString: masterConnectionString
  }).connect();

  await masterPool.request().query(`
    IF DB_ID(N'${dbName}') IS NULL
    BEGIN
      CREATE DATABASE [${dbName}];
    END
  `);

  await masterPool.close();

  console.log("[JARVIS] Banco conferido/criado:", dbName);

  const pool = await new sql.ConnectionPool({
    connectionString: dbConnectionString
  }).connect();

  console.log("[JARVIS] Criando tabelas...");

  await pool.request().query(`
    IF OBJECT_ID('dbo.Usuarios', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.Usuarios (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Nome NVARCHAR(160) NOT NULL,
        Email NVARCHAR(255) NOT NULL UNIQUE,
        SenhaHash NVARCHAR(255) NOT NULL,
        Telefone NVARCHAR(60) NULL,
        Endereco NVARCHAR(255) NULL,
        Foto NVARCHAR(MAX) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
      );
    END;

    IF OBJECT_ID('dbo.Ocorrencias', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.Ocorrencias (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Titulo NVARCHAR(180) NOT NULL,
        Descricao NVARCHAR(MAX) NOT NULL,
        Categoria NVARCHAR(120) NULL,
        Bairro NVARCHAR(120) NULL,
        Endereco NVARCHAR(255) NULL,
        Foto NVARCHAR(MAX) NOT NULL,
        Imagem NVARCHAR(MAX) NULL,
        Status NVARCHAR(30) NOT NULL DEFAULT 'pendente',
        AdminStatus NVARCHAR(30) NULL,
        Prioridade NVARCHAR(30) NOT NULL DEFAULT 'media',
        PrioridadeScore DECIMAL(6,2) NOT NULL DEFAULT 2,
        CreatedBy INT NULL,
        CreatedByName NVARCHAR(160) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        ApprovedAt DATETIME2 NULL,
        ApprovedBy NVARCHAR(160) NULL,
        RejectedAt DATETIME2 NULL,
        RejectedBy NVARCHAR(160) NULL,
        RejectionReason NVARCHAR(MAX) NULL
      );
    END;

    IF OBJECT_ID('dbo.OcorrenciaVotos', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.OcorrenciaVotos (
        OcorrenciaId INT NOT NULL,
        UsuarioId INT NOT NULL,
        Prioridade NVARCHAR(30) NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_OcorrenciaVotos PRIMARY KEY (OcorrenciaId, UsuarioId),
        CONSTRAINT FK_OcorrenciaVotos_Ocorrencias FOREIGN KEY (OcorrenciaId) REFERENCES dbo.Ocorrencias(Id),
        CONSTRAINT FK_OcorrenciaVotos_Usuarios FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(Id)
      );
    END;
  `);

  console.log("[JARVIS] Tabelas prontas.");

  const count = await pool.request().query("SELECT COUNT(*) AS Total FROM dbo.Ocorrencias;");

  if (count.recordset[0].Total === 0) {
    console.log("[JARVIS] Inserindo ocorrências iniciais aprovadas...");

    await pool.request().query(`
      INSERT INTO dbo.Ocorrencias
      (Titulo, Descricao, Categoria, Bairro, Endereco, Foto, Imagem, Status, AdminStatus, Prioridade, PrioridadeScore, CreatedByName)
      VALUES
      (
        N'Buraco na via principal',
        N'Buraco em trecho de alto movimento, oferecendo risco para veículos, motos e pedestres.',
        N'Infraestrutura',
        N'Centro',
        N'Avenida principal do bairro',
        N'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjcyMCI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNzIwIiBmaWxsPSIjMGYxNzJhIi8+PHRleHQgeD0iODAiIHk9IjM0MCIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCI+QnVyYWNvIG5hIHZpYTwvdGV4dD48L3N2Zz4=',
        N'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjcyMCI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNzIwIiBmaWxsPSIjMGYxNzJhIi8+PHRleHQgeD0iODAiIHk9IjM0MCIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCI+QnVyYWNvIG5hIHZpYTwvdGV4dD48L3N2Zz4=',
        N'aberta',
        N'aprovada',
        N'alta',
        3,
        N'Sistema'
      ),
      (
        N'Iluminação pública apagada',
        N'Postes apagados em rua residencial, reduzindo a segurança no período noturno.',
        N'Iluminação',
        N'Jardim Industrial',
        N'Rua das Acácias',
        N'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjcyMCI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNzIwIiBmaWxsPSIjMWUzYThhIi8+PHRleHQgeD0iODAiIHk9IjM0MCIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iNTQiIGZvbnQtZmFtaWx5PSJBcmlhbCI+SWx1bWluYWNhbyBwdWJsaWNhPC90ZXh0Pjwvc3ZnPg==',
        N'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjcyMCI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNzIwIiBmaWxsPSIjMWUzYThhIi8+PHRleHQgeD0iODAiIHk9IjM0MCIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iNTQiIGZvbnQtZmFtaWx5PSJBcmlhbCI+SWx1bWluYWNhbyBwdWJsaWNhPC90ZXh0Pjwvc3ZnPg==',
        N'aberta',
        N'aprovada',
        N'urgente',
        4,
        N'Sistema'
      );
    `);
  }

  await pool.close();

  console.log("[JARVIS] Setup SQL Server concluído.");
}

main().catch((err) => {
  console.error("[JARVIS] Erro no setup SQL Server:");
  console.error(err);
  process.exit(1);
});
