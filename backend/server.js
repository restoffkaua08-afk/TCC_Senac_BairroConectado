require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sql = require("mssql/msnodesqlv8");

const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "bairro-conectado-secret-dev";
const ADMIN_KEY = process.env.ADMIN_KEY || "bairro-admin-2026";
const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING;

if (!DB_CONNECTION_STRING) {
  console.error("DB_CONNECTION_STRING não configurada no .env.");
  process.exit(1);
}

const frontendDir = path.join(__dirname, "..", "frontend");

app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

let pool;

async function getPool() {
  if (pool && pool.connected) return pool;

  pool = await new sql.ConnectionPool({
    connectionString: DB_CONNECTION_STRING
  }).connect();

  return pool;
}

function asyncRoute(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function cleanText(value) {
  return String(value ?? "").trim();
}

function score(priority) {
  const value = cleanText(priority).toLowerCase();

  if (value === "baixa") return 1;
  if (value === "media" || value === "média") return 2;
  if (value === "alta") return 3;
  if (value === "urgente") return 4;

  return 2;
}

function priorityFromScore(value) {
  if (value >= 3.5) return "urgente";
  if (value >= 2.5) return "alta";
  if (value >= 1.5) return "media";
  return "baixa";
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.Id,
      email: user.Email,
      nome: user.Nome
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function userSafe(user) {
  if (!user) return null;

  return {
    id: String(user.Id),
    nome: user.Nome || "",
    email: user.Email || "",
    telefone: user.Telefone || "",
    endereco: user.Endereco || "",
    foto: user.Foto || ""
  };
}

function occurrenceSafe(item) {
  if (!item) return null;

  return {
    id: String(item.Id),
    _id: String(item.Id),
    titulo: item.Titulo || "",
    descricao: item.Descricao || "",
    categoria: item.Categoria || "Geral",
    bairro: item.Bairro || "",
    endereco: item.Endereco || "",
    foto: item.Foto || item.Imagem || "",
    imagem: item.Imagem || item.Foto || "",
    status: item.Status || "pendente",
    adminStatus: item.AdminStatus || "",
    prioridade: item.Prioridade || "media",
    prioridadeScore: Number(item.PrioridadeScore || 2),
    totalVotos: Number(item.TotalVotos || 0),
    createdByName: item.CreatedByName || "Sistema",
    createdAt: item.CreatedAt,
    updatedAt: item.UpdatedAt,
    rejectionReason: item.RejectionReason || ""
  };
}

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";

    if (!token) {
      return res.status(401).json({ message: "Sessão inválida ou expirada." });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const db = await getPool();

    const result = await db.request()
      .input("id", sql.Int, Number(payload.id))
      .query("SELECT TOP 1 * FROM dbo.Usuarios WHERE Id = @id;");

    if (!result.recordset.length) {
      return res.status(401).json({ message: "Sessão inválida ou expirada." });
    }

    req.user = result.recordset[0];
    next();
  } catch {
    return res.status(401).json({ message: "Sessão inválida ou expirada." });
  }
}

function adminAuth(req, res, next) {
  const key =
    req.headers["x-admin-key"] ||
    req.body.adminKey ||
    req.query.adminKey ||
    "";

  if (!key || key !== ADMIN_KEY) {
    return res.status(401).json({
      message: "Acesso administrativo não autorizado."
    });
  }

  next();
}

app.get("/api/health", asyncRoute(async (req, res) => {
  const db = await getPool();
  await db.request().query("SELECT 1 AS Ok;");

  res.json({
    ok: true,
    database: "sqlserver",
    message: "Backend conectado ao SQL Server."
  });
}));

app.post("/api/auth/register", asyncRoute(async (req, res) => {
  const nome = cleanText(req.body.nome);
  const email = cleanText(req.body.email).toLowerCase();
  const senha = cleanText(req.body.senha);

  if (!nome || !email || senha.length < 6) {
    return res.status(400).json({
      message: "Nome, email e senha com pelo menos 6 caracteres são obrigatórios."
    });
  }

  const db = await getPool();

  const exists = await db.request()
    .input("email", sql.NVarChar(255), email)
    .query("SELECT TOP 1 Id FROM dbo.Usuarios WHERE Email = @email;");

  if (exists.recordset.length) {
    return res.status(409).json({ message: "Este email já está cadastrado." });
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const created = await db.request()
    .input("nome", sql.NVarChar(160), nome)
    .input("email", sql.NVarChar(255), email)
    .input("senhaHash", sql.NVarChar(255), senhaHash)
    .query(`
      INSERT INTO dbo.Usuarios (Nome, Email, SenhaHash)
      OUTPUT INSERTED.*
      VALUES (@nome, @email, @senhaHash);
    `);

  const user = created.recordset[0];

  res.status(201).json({
    token: createToken(user),
    user: userSafe(user)
  });
}));

app.post("/api/auth/login", asyncRoute(async (req, res) => {
  const email = cleanText(req.body.email).toLowerCase();
  const senha = cleanText(req.body.senha);

  const db = await getPool();

  const result = await db.request()
    .input("email", sql.NVarChar(255), email)
    .query("SELECT TOP 1 * FROM dbo.Usuarios WHERE Email = @email;");

  const user = result.recordset[0];

  if (!user) {
    return res.status(401).json({ message: "Email ou senha inválidos." });
  }

  const ok = await bcrypt.compare(senha, user.SenhaHash);

  if (!ok) {
    return res.status(401).json({ message: "Email ou senha inválidos." });
  }

  res.json({
    token: createToken(user),
    user: userSafe(user)
  });
}));

app.get("/api/auth/profile", auth, asyncRoute(async (req, res) => {
  res.json({ user: userSafe(req.user) });
}));

app.put("/api/auth/profile", auth, asyncRoute(async (req, res) => {
  const nome = cleanText(req.body.nome || req.user.Nome);
  const telefone = cleanText(req.body.telefone);
  const endereco = cleanText(req.body.endereco);
  const foto = cleanText(req.body.foto);

  const db = await getPool();

  const result = await db.request()
    .input("id", sql.Int, req.user.Id)
    .input("nome", sql.NVarChar(160), nome)
    .input("telefone", sql.NVarChar(60), telefone)
    .input("endereco", sql.NVarChar(255), endereco)
    .input("foto", sql.NVarChar(sql.MAX), foto)
    .query(`
      UPDATE dbo.Usuarios
      SET Nome = @nome,
          Telefone = @telefone,
          Endereco = @endereco,
          Foto = @foto,
          UpdatedAt = SYSUTCDATETIME()
      OUTPUT INSERTED.*
      WHERE Id = @id;
    `);

  res.json({ user: userSafe(result.recordset[0]) });
}));

app.get("/api/ocorrencias", asyncRoute(async (req, res) => {
  const db = await getPool();

  const result = await db.request().query(`
    SELECT o.*, COUNT(v.UsuarioId) AS TotalVotos
    FROM dbo.Ocorrencias o
    LEFT JOIN dbo.OcorrenciaVotos v ON v.OcorrenciaId = o.Id
    WHERE o.Status = 'aberta'
    GROUP BY
      o.Id, o.Titulo, o.Descricao, o.Categoria, o.Bairro, o.Endereco, o.Foto, o.Imagem,
      o.Status, o.AdminStatus, o.Prioridade, o.PrioridadeScore, o.CreatedBy,
      o.CreatedByName, o.CreatedAt, o.UpdatedAt, o.ApprovedAt, o.ApprovedBy,
      o.RejectedAt, o.RejectedBy, o.RejectionReason
    ORDER BY o.CreatedAt DESC;
  `);

  res.json({
    ocorrencias: result.recordset.map(occurrenceSafe)
  });
}));

app.post("/api/ocorrencias", auth, asyncRoute(async (req, res) => {
  const titulo = cleanText(req.body.titulo);
  const descricao = cleanText(req.body.descricao);
  const foto = cleanText(req.body.foto || req.body.imagem);

  if (!titulo || !descricao) {
    return res.status(400).json({ message: "Título e descrição são obrigatórios." });
  }

  if (!foto) {
    return res.status(400).json({ message: "A ocorrência precisa ter pelo menos uma foto." });
  }

  const prioridade = cleanText(req.body.prioridade || "media").toLowerCase();
  const prioridadeScore = score(prioridade);

  const db = await getPool();

  const result = await db.request()
    .input("titulo", sql.NVarChar(180), titulo)
    .input("descricao", sql.NVarChar(sql.MAX), descricao)
    .input("categoria", sql.NVarChar(120), cleanText(req.body.categoria || "Geral"))
    .input("bairro", sql.NVarChar(120), cleanText(req.body.bairro))
    .input("endereco", sql.NVarChar(255), cleanText(req.body.endereco))
    .input("foto", sql.NVarChar(sql.MAX), foto)
    .input("prioridade", sql.NVarChar(30), prioridade)
    .input("prioridadeScore", sql.Decimal(6, 2), prioridadeScore)
    .input("createdBy", sql.Int, req.user.Id)
    .input("createdByName", sql.NVarChar(160), req.user.Nome)
    .query(`
      INSERT INTO dbo.Ocorrencias
      (
        Titulo, Descricao, Categoria, Bairro, Endereco, Foto, Imagem,
        Status, AdminStatus, Prioridade, PrioridadeScore,
        CreatedBy, CreatedByName
      )
      OUTPUT INSERTED.*
      VALUES
      (
        @titulo, @descricao, @categoria, @bairro, @endereco, @foto, @foto,
        'pendente', 'pendente', @prioridade, @prioridadeScore,
        @createdBy, @createdByName
      );
    `);

  res.status(201).json({
    message: "Ocorrência enviada para análise do administrador.",
    ocorrencia: occurrenceSafe(result.recordset[0])
  });
}));

app.post("/api/ocorrencias/:id/vote", auth, asyncRoute(async (req, res) => {
  const id = Number(req.params.id);

  const db = await getPool();

  const found = await db.request()
    .input("id", sql.Int, id)
    .query("SELECT TOP 1 * FROM dbo.Ocorrencias WHERE Id = @id;");

  const item = found.recordset[0];

  if (!item) {
    return res.status(404).json({ message: "Ocorrência não encontrada." });
  }

  if (item.Status !== "aberta") {
    return res.status(403).json({ message: "Apenas ocorrências aprovadas podem receber votos." });
  }

  const prioridade = cleanText(req.body.prioridade || req.body.voto || "media").toLowerCase();

  await db.request()
    .input("ocorrenciaId", sql.Int, id)
    .input("usuarioId", sql.Int, req.user.Id)
    .input("prioridade", sql.NVarChar(30), prioridade)
    .query(`
      MERGE dbo.OcorrenciaVotos AS target
      USING (SELECT @ocorrenciaId AS OcorrenciaId, @usuarioId AS UsuarioId) AS source
      ON target.OcorrenciaId = source.OcorrenciaId AND target.UsuarioId = source.UsuarioId
      WHEN MATCHED THEN
        UPDATE SET Prioridade = @prioridade, UpdatedAt = SYSUTCDATETIME()
      WHEN NOT MATCHED THEN
        INSERT (OcorrenciaId, UsuarioId, Prioridade)
        VALUES (@ocorrenciaId, @usuarioId, @prioridade);
    `);

  const avg = await db.request()
    .input("id", sql.Int, id)
    .query(`
      SELECT AVG(CAST(
        CASE
          WHEN Prioridade = 'baixa' THEN 1
          WHEN Prioridade = 'media' THEN 2
          WHEN Prioridade = N'média' THEN 2
          WHEN Prioridade = 'alta' THEN 3
          WHEN Prioridade = 'urgente' THEN 4
          ELSE 2
        END AS DECIMAL(6,2)
      )) AS Media
      FROM dbo.OcorrenciaVotos
      WHERE OcorrenciaId = @id;
    `);

  const media = Number(avg.recordset[0].Media || 2);
  const novaPrioridade = priorityFromScore(media);

  await db.request()
    .input("id", sql.Int, id)
    .input("prioridade", sql.NVarChar(30), novaPrioridade)
    .input("score", sql.Decimal(6, 2), Number(media.toFixed(2)))
    .query(`
      UPDATE dbo.Ocorrencias
      SET Prioridade = @prioridade,
          PrioridadeScore = @score,
          UpdatedAt = SYSUTCDATETIME()
      WHERE Id = @id;
    `);

  res.json({ message: "Voto registrado com sucesso." });
}));

app.get("/api/ocorrencias/ranking", asyncRoute(async (req, res) => {
  const db = await getPool();

  const result = await db.request().query(`
    SELECT TOP 10 o.*, COUNT(v.UsuarioId) AS TotalVotos
    FROM dbo.Ocorrencias o
    LEFT JOIN dbo.OcorrenciaVotos v ON v.OcorrenciaId = o.Id
    WHERE o.Status = 'aberta'
    GROUP BY
      o.Id, o.Titulo, o.Descricao, o.Categoria, o.Bairro, o.Endereco, o.Foto, o.Imagem,
      o.Status, o.AdminStatus, o.Prioridade, o.PrioridadeScore, o.CreatedBy,
      o.CreatedByName, o.CreatedAt, o.UpdatedAt, o.ApprovedAt, o.ApprovedBy,
      o.RejectedAt, o.RejectedBy, o.RejectionReason
    ORDER BY o.PrioridadeScore DESC, TotalVotos DESC, o.CreatedAt DESC;
  `);

  res.json({
    ranking: result.recordset.map(occurrenceSafe)
  });
}));

app.get("/api/admin/ocorrencias", adminAuth, asyncRoute(async (req, res) => {
  const status = cleanText(req.query.status || "pendente");

  const db = await getPool();

  let where = "";

  if (status !== "todas") {
    where = "WHERE o.Status = @status";
  }

  const request = db.request();

  if (status !== "todas") {
    request.input("status", sql.NVarChar(30), status);
  }

  const result = await request.query(`
    SELECT o.*, COUNT(v.UsuarioId) AS TotalVotos
    FROM dbo.Ocorrencias o
    LEFT JOIN dbo.OcorrenciaVotos v ON v.OcorrenciaId = o.Id
    ${where}
    GROUP BY
      o.Id, o.Titulo, o.Descricao, o.Categoria, o.Bairro, o.Endereco, o.Foto, o.Imagem,
      o.Status, o.AdminStatus, o.Prioridade, o.PrioridadeScore, o.CreatedBy,
      o.CreatedByName, o.CreatedAt, o.UpdatedAt, o.ApprovedAt, o.ApprovedBy,
      o.RejectedAt, o.RejectedBy, o.RejectionReason
    ORDER BY o.CreatedAt DESC;
  `);

  const resumo = await db.request().query(`
    SELECT
      SUM(CASE WHEN Status = 'pendente' THEN 1 ELSE 0 END) AS Pendentes,
      SUM(CASE WHEN Status = 'aberta' THEN 1 ELSE 0 END) AS Publicadas,
      SUM(CASE WHEN Status = 'recusada' THEN 1 ELSE 0 END) AS Recusadas,
      COUNT(*) AS Total
    FROM dbo.Ocorrencias;
  `);

  const r = resumo.recordset[0] || {};

  res.json({
    ocorrencias: result.recordset.map(occurrenceSafe),
    resumo: {
      pendentes: Number(r.Pendentes || 0),
      publicadas: Number(r.Publicadas || 0),
      recusadas: Number(r.Recusadas || 0),
      total: Number(r.Total || 0)
    }
  });
}));

app.post("/api/admin/ocorrencias/:id/aprovar", adminAuth, asyncRoute(async (req, res) => {
  const id = Number(req.params.id);
  const db = await getPool();

  const result = await db.request()
    .input("id", sql.Int, id)
    .query(`
      UPDATE dbo.Ocorrencias
      SET Status = 'aberta',
          AdminStatus = 'aprovada',
          ApprovedAt = SYSUTCDATETIME(),
          ApprovedBy = N'Administrador',
          RejectionReason = NULL,
          UpdatedAt = SYSUTCDATETIME()
      OUTPUT INSERTED.*
      WHERE Id = @id;
    `);

  if (!result.recordset.length) {
    return res.status(404).json({ message: "Solicitação não encontrada." });
  }

  res.json({
    message: "Ocorrência aprovada e publicada.",
    ocorrencia: occurrenceSafe(result.recordset[0])
  });
}));

app.post("/api/admin/ocorrencias/:id/recusar", adminAuth, asyncRoute(async (req, res) => {
  const id = Number(req.params.id);
  const motivo = cleanText(req.body.motivo || "Ocorrência recusada na moderação.");
  const db = await getPool();

  const result = await db.request()
    .input("id", sql.Int, id)
    .input("motivo", sql.NVarChar(sql.MAX), motivo)
    .query(`
      UPDATE dbo.Ocorrencias
      SET Status = 'recusada',
          AdminStatus = 'recusada',
          RejectedAt = SYSUTCDATETIME(),
          RejectedBy = N'Administrador',
          RejectionReason = @motivo,
          UpdatedAt = SYSUTCDATETIME()
      OUTPUT INSERTED.*
      WHERE Id = @id;
    `);

  if (!result.recordset.length) {
    return res.status(404).json({ message: "Solicitação não encontrada." });
  }

  res.json({
    message: "Ocorrência recusada.",
    ocorrencia: occurrenceSafe(result.recordset[0])
  });
}));

app.use(express.static(frontendDir));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: "Erro interno no servidor.",
    detail: process.env.NODE_ENV === "production" ? undefined : err.message
  });
});

getPool()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[Bairro Conectado] Backend SQL Server rodando em http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erro ao conectar ao SQL Server:");
    console.error(err);
    process.exit(1);
  });
