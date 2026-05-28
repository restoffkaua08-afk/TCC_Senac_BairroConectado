USE BairroConectadoDB;

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
