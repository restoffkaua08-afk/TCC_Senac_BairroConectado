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

function score(priority) {
  const value = String(priority || "media").toLowerCase();
  if (value === "baixa") return 1;
  if (value === "media" || value === "média") return 2;
  if (value === "alta") return 3;
  if (value === "urgente") return 4;
  return 2;
}

function svgImage(title, subtitle, colorA = "#0f172a", colorB = "#334155") {
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
    <circle cx="980" cy="120" r="170" fill="rgba(255,255,255,.08)"/>
    <circle cx="130" cy="610" r="210" fill="rgba(255,255,255,.07)"/>
    <rect x="72" y="84" width="1056" height="552" rx="34" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.16)"/>
    <text x="110" y="320" fill="#ffffff" font-size="58" font-family="Arial" font-weight="800">${safeTitle}</text>
    <text x="110" y="392" fill="#e2e8f0" font-size="32" font-family="Arial">${safeSubtitle}</text>
    <text x="110" y="520" fill="#ffffff" opacity=".74" font-size="23" font-family="Arial">Bairro Conectado • Registro comunitário</text>
  </svg>`;

  return "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
}

async function main() {
  const now = new Date().toISOString();

  const exemplos = [
    {
      titulo: "Faixa de pedestre apagada",
      descricao: "A sinalização horizontal está desgastada em uma via movimentada, dificultando a travessia segura de pedestres nos horários de maior fluxo.",
      categoria: "Sinalização urbana",
      bairro: "Centro",
      endereco: "Próximo ao cruzamento da avenida principal",
      prioridade: "alta",
      corA: "#111827",
      corB: "#475569"
    },
    {
      titulo: "Árvore com risco de queda",
      descricao: "Árvore inclinada próxima à calçada e à rede elétrica, gerando preocupação entre moradores em dias de chuva e vento forte.",
      categoria: "Meio ambiente",
      bairro: "Inconfidentes",
      endereco: "Rua próxima à praça do bairro",
      prioridade: "urgente",
      corA: "#14532d",
      corB: "#854d0e"
    },
    {
      titulo: "Ponto de ônibus sem cobertura",
      descricao: "Moradores aguardam transporte expostos ao sol e à chuva em ponto de grande circulação, sem abrigo adequado.",
      categoria: "Transporte público",
      bairro: "Industrial",
      endereco: "Avenida de acesso ao bairro",
      prioridade: "media",
      corA: "#172554",
      corB: "#334155"
    },
    {
      titulo: "Esgoto aparente em via residencial",
      descricao: "Moradores relataram vazamento recorrente de esgoto em trecho residencial, causando mau cheiro e risco sanitário.",
      categoria: "Saneamento",
      bairro: "Água Branca",
      endereco: "Rua residencial próxima ao comércio local",
      prioridade: "urgente",
      corA: "#0f172a",
      corB: "#991b1b"
    }
  ];

  let inserted = 0;

  for (const item of exemplos) {
    const exists = await one(ocorrencias, { titulo: item.titulo });

    if (exists) continue;

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

  console.log(`[JARVIS] Novas ocorrências adicionadas: ${inserted}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
