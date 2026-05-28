const path = require("path");
const fs = require("fs");
const Datastore = require("@seald-io/nedb");

const dbDir = path.join(__dirname, "..", "database.db");
fs.mkdirSync(dbDir, { recursive: true });

const ocorrencias = new Datastore({
  filename: path.join(dbDir, "ocorrencias.db"),
  autoload: true
});

function one(db, query) {
  return new Promise((resolve, reject) => {
    db.findOne(query, (err, doc) => err ? reject(err) : resolve(doc));
  });
}

function insert(db, doc) {
  return new Promise((resolve, reject) => {
    db.insert(doc, (err, newDoc) => err ? reject(err) : resolve(newDoc));
  });
}

function svgImage(title, subtitle, colorA = "#0f172a", colorB = "#2563eb") {
  const safeTitle = String(title).replace(/[<>&'"]/g, "");
  const safeSubtitle = String(subtitle).replace(/[<>&'"]/g, "");

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="${colorA}"/>
        <stop offset="100%" stop-color="${colorB}"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="720" fill="url(#g)"/>
    <circle cx="980" cy="130" r="180" fill="rgba(255,255,255,.10)"/>
    <circle cx="120" cy="610" r="220" fill="rgba(255,255,255,.08)"/>
    <rect x="70" y="80" width="1060" height="560" rx="42" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.18)"/>
    <text x="110" y="330" fill="#ffffff" font-size="62" font-family="Arial" font-weight="800">${safeTitle}</text>
    <text x="110" y="405" fill="#dbeafe" font-size="34" font-family="Arial">${safeSubtitle}</text>
    <text x="110" y="530" fill="#ffffff" opacity=".80" font-size="24" font-family="Arial">Bairro Conectado • Ocorrência comunitária</text>
  </svg>`;

  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
}

function score(priority) {
  const value = String(priority || "media").toLowerCase();
  if (value === "baixa") return 1;
  if (value === "media" || value === "média") return 2;
  if (value === "alta") return 3;
  if (value === "urgente") return 4;
  return 2;
}

async function main() {
  const now = new Date().toISOString();

  const exemplos = [
    {
      titulo: "Bueiro sem tampa próximo à escola",
      descricao: "Bueiro aberto em área de passagem de estudantes e moradores, oferecendo risco de queda e acidentes no período de maior movimento.",
      categoria: "Segurança urbana",
      bairro: "Jardim Industrial",
      endereco: "Rua das Acácias, próximo à escola municipal",
      prioridade: "urgente",
      corA: "#111827",
      corB: "#b91c1c"
    },
    {
      titulo: "Semáforo intermitente em cruzamento movimentado",
      descricao: "Semáforo apresenta falha constante durante o dia, prejudicando o fluxo de veículos e aumentando o risco para pedestres.",
      categoria: "Trânsito",
      bairro: "Eldorado",
      endereco: "Avenida João César de Oliveira",
      prioridade: "alta",
      corA: "#172554",
      corB: "#ea580c"
    },
    {
      titulo: "Calçada danificada em ponto de ônibus",
      descricao: "Trecho da calçada está quebrado e desnivelado, dificultando o acesso de idosos, cadeirantes e pessoas com mobilidade reduzida.",
      categoria: "Acessibilidade",
      bairro: "Novo Eldorado",
      endereco: "Próximo ao ponto de ônibus da praça",
      prioridade: "alta",
      corA: "#0f172a",
      corB: "#2563eb"
    },
    {
      titulo: "Mato alto em lote vago",
      descricao: "Lote sem manutenção com mato alto, acúmulo de resíduos e possibilidade de presença de insetos e animais peçonhentos.",
      categoria: "Limpeza urbana",
      bairro: "Riacho das Pedras",
      endereco: "Rua lateral ao campo comunitário",
      prioridade: "media",
      corA: "#14532d",
      corB: "#16a34a"
    }
  ];

  let inserted = 0;

  for (const item of exemplos) {
    const exists = await one(ocorrencias, { titulo: item.titulo });

    if (exists) {
      continue;
    }

    const foto = svgImage(item.titulo, item.categoria, item.corA, item.corB);

    await insert(ocorrencias, {
      titulo: item.titulo,
      descricao: item.descricao,
      categoria: item.categoria,
      bairro: item.bairro,
      endereco: item.endereco,
      foto,
      imagem: foto,
      status: "aberta",
      prioridade: item.prioridade,
      prioridadeScore: score(item.prioridade),
      votos: {},
      createdByName: "Sistema",
      createdAt: now,
      updatedAt: now
    });

    inserted++;
  }

  console.log(`[JARVIS] Ocorrências extras adicionadas: ${inserted}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
