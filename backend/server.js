require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Datastore = require("@seald-io/nedb");

const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "bairro-conectado-secret-dev";
const frontendDir = path.join(__dirname, "..", "frontend");
const dbDir = path.join(__dirname, "..", "database.db");

fs.mkdirSync(dbDir, { recursive: true });

const users = new Datastore({
  filename: path.join(dbDir, "users.db"),
  autoload: true
});

const ocorrencias = new Datastore({
  filename: path.join(dbDir, "ocorrencias.db"),
  autoload: true
});

users.ensureIndex({ fieldName: "email", unique: true }, () => {});
ocorrencias.ensureIndex({ fieldName: "createdAt" }, () => {});
ocorrencias.ensureIndex({ fieldName: "prioridadeScore" }, () => {});

app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

function one(db, query) {
  return new Promise((resolve, reject) => {
    db.findOne(query, (err, doc) => err ? reject(err) : resolve(doc));
  });
}

function many(db, query = {}, sort = null) {
  return new Promise((resolve, reject) => {
    let cursor = db.find(query);
    if (sort) cursor = cursor.sort(sort);
    cursor.exec((err, docs) => err ? reject(err) : resolve(docs));
  });
}

function insert(db, doc) {
  return new Promise((resolve, reject) => {
    db.insert(doc, (err, newDoc) => err ? reject(err) : resolve(newDoc));
  });
}

function update(db, query, data, options = {}) {
  return new Promise((resolve, reject) => {
    db.update(query, data, options, (err, affected) => err ? reject(err) : resolve(affected));
  });
}

function count(db, query = {}) {
  return new Promise((resolve, reject) => {
    db.count(query, (err, total) => err ? reject(err) : resolve(total));
  });
}

function cleanText(value) {
  return String(value || "").trim();
}

function cleanEmail(value) {
  return cleanText(value).toLowerCase();
}

function defaultOccurrenceImage(title = "Ocorrência") {
  const safeTitle = String(title).replace(/[<>&'"]/g, "");
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#2563eb"/>
      </linearGradient>
    </defs>
    <rect width="900" height="520" fill="url(#g)"/>
    <circle cx="720" cy="110" r="120" fill="rgba(255,255,255,.12)"/>
    <circle cx="120" cy="420" r="160" fill="rgba(255,255,255,.10)"/>
    <text x="70" y="230" fill="#ffffff" font-size="54" font-family="Arial" font-weight="800">Bairro Conectado</text>
    <text x="70" y="305" fill="#dbeafe" font-size="32" font-family="Arial">${safeTitle}</text>
  </svg>`;

  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
}

function userSafe(user) {
  return {
    id: user._id,
    _id: user._id,
    nome: user.nome || "",
    email: user.email || "",
    telefone: user.telefone || "",
    endereco: user.endereco || "",
    foto: user.foto || "",
    createdAt: user.createdAt || "",
    updatedAt: user.updatedAt || ""
  };
}

function tokenFor(user) {
  return jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";

    if (!token) {
      return res.status(401).json({ message: "Faça login para continuar." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await one(users, { _id: decoded.id });

    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado." });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Sessão inválida ou expirada." });
  }
}

function asyncRoute(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Erro interno do servidor.",
        detail: err.message
      });
    }
  };
}

function score(priority) {
  const value = String(priority || "media").toLowerCase();

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

function occurrenceSafe(item) {
  const votos = item.votos || {};
  const values = Object.values(votos).map(score);
  const base = item.prioridadeScore || score(item.prioridade);
  const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : base;

  return {
    ...item,
    id: item._id,
    foto: item.foto || item.imagem || defaultOccurrenceImage(item.titulo),
    imagem: item.foto || item.imagem || defaultOccurrenceImage(item.titulo),
    prioridadeScore: Number(average.toFixed(2)),
    prioridade: priorityFromScore(average),
    totalVotos: values.length
  };
}

async function seed() {
  const total = await count(ocorrencias);
  if (total > 0) {
    const docs = await many(ocorrencias, {});
    for (const item of docs) {
      if (!item.foto && !item.imagem) {
        await update(ocorrencias, { _id: item._id }, {
          $set: {
            foto: defaultOccurrenceImage(item.titulo),
            imagem: defaultOccurrenceImage(item.titulo),
            updatedAt: new Date().toISOString()
          }
        });
      }
    }
    return;
  }

  const now = new Date().toISOString();

  const dados = [
    {
      titulo: "Buraco na rua principal",
      descricao: "Buraco grande atrapalhando o trânsito e oferecendo risco para moradores, motos e carros.",
      categoria: "Infraestrutura",
      bairro: "Centro",
      endereco: "Rua Principal",
      status: "aberta",
      prioridade: "alta",
      prioridadeScore: 3
    },
    {
      titulo: "Poste sem iluminação",
      descricao: "Rua escura durante a noite por falha na iluminação pública.",
      categoria: "Iluminação",
      bairro: "Residencial",
      endereco: "Avenida das Flores",
      status: "aberta",
      prioridade: "media",
      prioridadeScore: 2
    },
    {
      titulo: "Acúmulo de lixo",
      descricao: "Descarte irregular de lixo gerando mau cheiro e risco sanitário.",
      categoria: "Limpeza urbana",
      bairro: "Vila Nova",
      endereco: "Rua das Palmeiras",
      status: "aberta",
      prioridade: "urgente",
      prioridadeScore: 4
    }
  ];

  for (const item of dados) {
    await insert(ocorrencias, {
      ...item,
      foto: defaultOccurrenceImage(item.titulo),
      imagem: defaultOccurrenceImage(item.titulo),
      votos: {},
      createdAt: now,
      updatedAt: now
    });
  }
}

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    sistema: "Bairro Conectado",
    backend: "Node.js + Express",
    banco: "NeDB",
    status: "Funcionando",
    url: `http://localhost:${PORT}`
  });
});

app.post("/api/auth/register", asyncRoute(async (req, res) => {
  const nome = cleanText(req.body.nome);
  const email = cleanEmail(req.body.email);
  const senha = cleanText(req.body.senha || req.body.password);
  const foto = cleanText(req.body.foto);

  if (!nome || !email || !senha) {
    return res.status(400).json({ message: "Nome, email e senha são obrigatórios." });
  }

  if (senha.length < 6) {
    return res.status(400).json({ message: "A senha precisa ter pelo menos 6 caracteres." });
  }

  const exists = await one(users, { email });

  if (exists) {
    return res.status(409).json({ message: "Este email já está cadastrado." });
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const now = new Date().toISOString();

  const user = await insert(users, {
    nome,
    email,
    senhaHash,
    telefone: "",
    endereco: "",
    foto,
    createdAt: now,
    updatedAt: now
  });

  res.status(201).json({
    message: "Cadastro realizado com sucesso.",
    token: tokenFor(user),
    user: userSafe(user)
  });
}));

app.post("/api/auth/login", asyncRoute(async (req, res) => {
  const email = cleanEmail(req.body.email);
  const senha = cleanText(req.body.senha || req.body.password);

  if (!email || !senha) {
    return res.status(400).json({ message: "Email e senha são obrigatórios." });
  }

  const user = await one(users, { email });

  if (!user) {
    return res.status(401).json({ message: "Email ou senha inválidos." });
  }

  const ok = await bcrypt.compare(senha, user.senhaHash);

  if (!ok) {
    return res.status(401).json({ message: "Email ou senha inválidos." });
  }

  res.json({
    message: "Login realizado com sucesso.",
    token: tokenFor(user),
    user: userSafe(user)
  });
}));

app.get("/api/auth/profile", auth, asyncRoute(async (req, res) => {
  res.json({ user: userSafe(req.user) });
}));

app.put("/api/auth/profile", auth, asyncRoute(async (req, res) => {
  const nome = cleanText(req.body.nome);

  if (!nome) {
    return res.status(400).json({ message: "Nome é obrigatório." });
  }

  await update(users, { _id: req.user._id }, {
    $set: {
      nome,
      telefone: cleanText(req.body.telefone),
      endereco: cleanText(req.body.endereco),
      foto: cleanText(req.body.foto),
      updatedAt: new Date().toISOString()
    }
  });

  const updated = await one(users, { _id: req.user._id });

  res.json({
    message: "Perfil atualizado com sucesso.",
    user: userSafe(updated)
  });
}));

app.get("/api/ocorrencias", asyncRoute(async (req, res) => {
  const docs = await many(ocorrencias, {}, { createdAt: -1 });
  res.json({ ocorrencias: docs.map(occurrenceSafe) });
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
  const now = new Date().toISOString();

  const created = await insert(ocorrencias, {
    titulo,
    descricao,
    categoria: cleanText(req.body.categoria || "Geral"),
    bairro: cleanText(req.body.bairro),
    endereco: cleanText(req.body.endereco),
    foto,
    imagem: foto,
    status: "aberta",
    prioridade,
    prioridadeScore: score(prioridade),
    votos: {},
    createdBy: req.user._id,
    createdByName: req.user.nome,
    createdAt: now,
    updatedAt: now
  });

  res.status(201).json({
    message: "Ocorrência criada com sucesso.",
    ocorrencia: occurrenceSafe(created)
  });
}));

app.post("/api/ocorrencias/:id/vote", auth, asyncRoute(async (req, res) => {
  const item = await one(ocorrencias, { _id: req.params.id });

  if (!item) {
    return res.status(404).json({ message: "Ocorrência não encontrada." });
  }

  const voto = cleanText(req.body.prioridade || req.body.voto || "media").toLowerCase();
  const votos = { ...(item.votos || {}), [req.user._id]: voto };
  const values = Object.values(votos).map(score);
  const average = values.reduce((a, b) => a + b, 0) / values.length;

  await update(ocorrencias, { _id: req.params.id }, {
    $set: {
      votos,
      prioridade: priorityFromScore(average),
      prioridadeScore: Number(average.toFixed(2)),
      updatedAt: new Date().toISOString()
    }
  });

  const updated = await one(ocorrencias, { _id: req.params.id });

  res.json({
    message: "Voto registrado com sucesso.",
    ocorrencia: occurrenceSafe(updated)
  });
}));

app.get("/api/ocorrencias/ranking", asyncRoute(async (req, res) => {
  const docs = await many(ocorrencias, {});
  const ranking = docs
    .map(occurrenceSafe)
    .sort((a, b) => b.prioridadeScore - a.prioridadeScore || b.totalVotos - a.totalVotos || new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  res.json({ ranking });
}));

app.use(express.static(frontendDir));

app.get("/ocorrencias", (req, res) => {
  res.sendFile(path.join(frontendDir, "ocorrencias.html"));
});

app.get("/perfil", (req, res) => {
  res.sendFile(path.join(frontendDir, "perfil.html"));
});

app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "Rota de API não encontrada." });
  }

  res.sendFile(path.join(frontendDir, "index.html"));
});

seed().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Backend: Node.js + Express`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
});
