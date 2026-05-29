require("dotenv").config();

const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "bairro-conectado-secret-dev";
const ADMIN_KEY = process.env.ADMIN_KEY || "bairro-admin-2026";

const frontendDir = path.join(__dirname, "..", "frontend");
const dataDir = path.join(__dirname, "data");
const dbFile = path.join(dataDir, "bairro-db.json");

app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

function ensureDb() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dbFile)) {
    const initial = {
      users: [],
      occurrences: [],
      votes: []
    };

    fs.writeFileSync(dbFile, JSON.stringify(initial, null, 2), "utf8");
  }
}

function readDb() {
  ensureDb();

  try {
    const data = JSON.parse(fs.readFileSync(dbFile, "utf8"));

    return {
      users: Array.isArray(data.users) ? data.users : [],
      occurrences: Array.isArray(data.occurrences) ? data.occurrences : [],
      votes: Array.isArray(data.votes) ? data.votes : []
    };
  } catch {
    return {
      users: [],
      occurrences: [],
      votes: []
    };
  }
}

function writeDb(db) {
  ensureDb();
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), "utf8");
}

function nextId(items) {
  const values = items.map((item) => Number(item.id || 0)).filter(Number.isFinite);
  return values.length ? Math.max(...values) + 1 : 1;
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
      id: user.id,
      email: user.email,
      nome: user.nome
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function userSafe(user) {
  if (!user) return null;

  return {
    id: String(user.id),
    nome: user.nome || "",
    email: user.email || "",
    telefone: user.telefone || "",
    endereco: user.endereco || "",
    foto: user.foto || ""
  };
}

function occurrenceSafe(item, db) {
  if (!item) return null;

  const votes = db ? db.votes.filter((vote) => String(vote.occurrenceId) === String(item.id)) : [];

  return {
    id: String(item.id),
    _id: String(item.id),
    titulo: item.titulo || "",
    descricao: item.descricao || "",
    categoria: item.categoria || "Geral",
    bairro: item.bairro || "",
    endereco: item.endereco || "",
    foto: item.foto || item.imagem || "",
    imagem: item.imagem || item.foto || "",
    status: item.status || "pendente",
    adminStatus: item.adminStatus || "",
    prioridade: item.prioridade || "media",
    prioridadeScore: Number(item.prioridadeScore || 2),
    totalVotos: votes.length,
    createdByName: item.createdByName || "Sistema",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    rejectionReason: item.rejectionReason || ""
  };
}

function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";

    if (!token) {
      return res.status(401).json({ message: "Sessão inválida ou expirada." });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const db = readDb();
    const user = db.users.find((item) => String(item.id) === String(payload.id));

    if (!user) {
      return res.status(401).json({ message: "Sessão inválida ou expirada." });
    }

    req.user = user;
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
  const db = readDb();

  res.json({
    ok: true,
    database: "json-local",
    users: db.users.length,
    occurrences: db.occurrences.length,
    votes: db.votes.length,
    message: "Backend portátil rodando com banco JSON local."
  });
}));

app.post("/api/auth/register", asyncRoute(async (req, res) => {
  const nome = cleanText(req.body.nome);
  const email = cleanText(req.body.email).toLowerCase();
  const senha = cleanText(req.body.senha || req.body.password);

  if (!nome || !email || senha.length < 6) {
    return res.status(400).json({
      message: "Nome, email e senha com pelo menos 6 caracteres são obrigatórios."
    });
  }

  const db = readDb();

  const exists = db.users.find((user) => user.email === email);

  if (exists) {
    return res.status(409).json({ message: "Este email já está cadastrado." });
  }

  const now = new Date().toISOString();

  const user = {
    id: nextId(db.users),
    nome,
    email,
    senhaHash: await bcrypt.hash(senha, 10),
    telefone: "",
    endereco: "",
    foto: "",
    createdAt: now,
    updatedAt: now
  };

  db.users.push(user);
  writeDb(db);

  res.status(201).json({
    token: createToken(user),
    user: userSafe(user)
  });
}));

app.post("/api/auth/login", asyncRoute(async (req, res) => {
  const email = cleanText(req.body.email).toLowerCase();
  const senha = cleanText(req.body.senha || req.body.password);

  const db = readDb();
  const user = db.users.find((item) => item.email === email);

  if (!user) {
    return res.status(401).json({ message: "Email ou senha inválidos." });
  }

  const ok = await bcrypt.compare(senha, user.senhaHash);

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
  const db = readDb();
  const index = db.users.findIndex((user) => String(user.id) === String(req.user.id));

  if (index < 0) {
    return res.status(404).json({ message: "Usuário não encontrado." });
  }

  db.users[index] = {
    ...db.users[index],
    nome: cleanText(req.body.nome || db.users[index].nome),
    telefone: cleanText(req.body.telefone),
    endereco: cleanText(req.body.endereco),
    foto: cleanText(req.body.foto),
    updatedAt: new Date().toISOString()
  };

  writeDb(db);

  res.json({ user: userSafe(db.users[index]) });
}));

app.get("/api/ocorrencias", asyncRoute(async (req, res) => {
  const db = readDb();

  const ocorrencias = db.occurrences
    .filter((item) => item.status === "aberta")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((item) => occurrenceSafe(item, db));

  res.json({ ocorrencias });
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

  const db = readDb();

  const prioridade = cleanText(req.body.prioridade || "media").toLowerCase();
  const now = new Date().toISOString();

  const occurrence = {
    id: nextId(db.occurrences),
    titulo,
    descricao,
    categoria: cleanText(req.body.categoria || "Geral"),
    bairro: cleanText(req.body.bairro),
    endereco: cleanText(req.body.endereco),
    foto,
    imagem: foto,
    status: "pendente",
    adminStatus: "pendente",
    prioridade,
    prioridadeScore: score(prioridade),
    createdBy: req.user.id,
    createdByName: req.user.nome,
    createdAt: now,
    updatedAt: now,
    approvedAt: null,
    approvedBy: "",
    rejectedAt: null,
    rejectedBy: "",
    rejectionReason: ""
  };

  db.occurrences.push(occurrence);
  writeDb(db);

  res.status(201).json({
    message: "Ocorrência enviada para análise do administrador.",
    ocorrencia: occurrenceSafe(occurrence, db)
  });
}));

app.post("/api/ocorrencias/:id/vote", auth, asyncRoute(async (req, res) => {
  const db = readDb();
  const id = String(req.params.id);
  const occurrence = db.occurrences.find((item) => String(item.id) === id);

  if (!occurrence) {
    return res.status(404).json({ message: "Ocorrência não encontrada." });
  }

  if (occurrence.status !== "aberta") {
    return res.status(403).json({ message: "Apenas ocorrências aprovadas podem receber votos." });
  }

  const prioridade = cleanText(req.body.prioridade || req.body.voto || "media").toLowerCase();

  const existing = db.votes.find(
    (vote) => String(vote.occurrenceId) === id && String(vote.userId) === String(req.user.id)
  );

  const now = new Date().toISOString();

  if (existing) {
    existing.prioridade = prioridade;
    existing.updatedAt = now;
  } else {
    db.votes.push({
      occurrenceId: Number(id),
      userId: req.user.id,
      prioridade,
      createdAt: now,
      updatedAt: now
    });
  }

  const votes = db.votes.filter((vote) => String(vote.occurrenceId) === id);
  const average = votes.length
    ? votes.map((vote) => score(vote.prioridade)).reduce((a, b) => a + b, 0) / votes.length
    : score(occurrence.prioridade);

  occurrence.prioridadeScore = Number(average.toFixed(2));
  occurrence.prioridade = priorityFromScore(average);
  occurrence.updatedAt = now;

  writeDb(db);

  res.json({
    message: "Voto registrado com sucesso.",
    ocorrencia: occurrenceSafe(occurrence, db)
  });
}));

app.get("/api/ocorrencias/ranking", asyncRoute(async (req, res) => {
  const db = readDb();

  const ranking = db.occurrences
    .filter((item) => item.status === "aberta")
    .map((item) => occurrenceSafe(item, db))
    .sort((a, b) => {
      return b.prioridadeScore - a.prioridadeScore ||
        b.totalVotos - a.totalVotos ||
        new Date(b.createdAt) - new Date(a.createdAt);
    })
    .slice(0, 10);

  res.json({ ranking });
}));

app.get("/api/admin/ocorrencias", adminAuth, asyncRoute(async (req, res) => {
  const db = readDb();
  const status = cleanText(req.query.status || "pendente");

  const filtered = db.occurrences
    .filter((item) => status === "todas" ? true : item.status === status)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((item) => occurrenceSafe(item, db));

  res.json({
    ocorrencias: filtered,
    resumo: {
      pendentes: db.occurrences.filter((item) => item.status === "pendente").length,
      publicadas: db.occurrences.filter((item) => item.status === "aberta").length,
      recusadas: db.occurrences.filter((item) => item.status === "recusada").length,
      total: db.occurrences.length
    }
  });
}));

app.post("/api/admin/ocorrencias/:id/aprovar", adminAuth, asyncRoute(async (req, res) => {
  const db = readDb();
  const id = String(req.params.id);
  const occurrence = db.occurrences.find((item) => String(item.id) === id);

  if (!occurrence) {
    return res.status(404).json({ message: "Solicitação não encontrada." });
  }

  occurrence.status = "aberta";
  occurrence.adminStatus = "aprovada";
  occurrence.approvedAt = new Date().toISOString();
  occurrence.approvedBy = "Administrador";
  occurrence.rejectionReason = "";
  occurrence.updatedAt = new Date().toISOString();

  writeDb(db);

  res.json({
    message: "Ocorrência aprovada e publicada.",
    ocorrencia: occurrenceSafe(occurrence, db)
  });
}));

app.post("/api/admin/ocorrencias/:id/recusar", adminAuth, asyncRoute(async (req, res) => {
  const db = readDb();
  const id = String(req.params.id);
  const occurrence = db.occurrences.find((item) => String(item.id) === id);

  if (!occurrence) {
    return res.status(404).json({ message: "Solicitação não encontrada." });
  }

  occurrence.status = "recusada";
  occurrence.adminStatus = "recusada";
  occurrence.rejectedAt = new Date().toISOString();
  occurrence.rejectedBy = "Administrador";
  occurrence.rejectionReason = cleanText(req.body.motivo || "Ocorrência recusada na moderação.");
  occurrence.updatedAt = new Date().toISOString();

  writeDb(db);

  res.json({
    message: "Ocorrência recusada.",
    ocorrencia: occurrenceSafe(occurrence, db)
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

ensureDb();

app.listen(PORT, () => {
  console.log(`[Bairro Conectado] Backend portátil rodando em http://localhost:${PORT}`);
  console.log(`[Bairro Conectado] Banco local: ${dbFile}`);
});
