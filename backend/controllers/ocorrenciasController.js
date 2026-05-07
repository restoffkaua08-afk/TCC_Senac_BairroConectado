const db = require('../database');

function recalcPriority(occId, cb) {
  db.getAvgNota(occId, (err, media) => {
    if (err) return cb(err);
    db.updateOcorrencia(occId, { prioridadeMedia: media }, cb);
  });
}

exports.listar = (req, res) => {
  let query = {};
  const { search, status, prioridade } = req.query;
  if (search) query.$or = [{ titulo: new RegExp(search, 'i') }, { local: new RegExp(search, 'i') }];
  if (status && status !== 'todos') query.status = parseInt(status);
  if (prioridade && prioridade !== '0') {
    const ranges = {1:[0,1.5],2:[1.5,2.5],3:[2.5,3.5],4:[3.5,5]};
    const [min, max] = ranges[prioridade];
    query.prioridadeMedia = { $gte: min, $lt: max };
  }
  db.findAllOcorrencias(query, (err, docs) => {
    if (err) return res.status(500).json({ error: err.message });
    const ocorrencias = docs.map(occ => ({
      id: occ._id, titulo: occ.titulo, descricao: occ.descricao, local: occ.local,
      fotos: occ.fotos || [], status: occ.status, prioridadeMedia: occ.prioridadeMedia,
      data: occ.data, user_id: occ.user_id
    }));
    res.json(ocorrencias);
  });
};

exports.criar = (req, res) => {
  const { titulo, descricao, local, fotos } = req.body;
  if (!titulo || !descricao || !local) return res.status(400).json({ error: 'Preencha título, descrição e local' });
  db.insertOcorrencia({
    titulo, descricao, local, fotos: fotos || [], status: 0,
    prioridadeMedia: 0, data: new Date().toISOString().slice(0,10), user_id: req.userId
  }, (err, doc) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: doc._id });
  });
};

exports.votar = (req, res) => {
  const occId = req.params.id;
  const userId = req.userId;
  const { nota } = req.body;
  if (!nota || nota < 1 || nota > 4) return res.status(400).json({ error: 'Nota inválida' });
  db.findVoto(userId, occId, (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (existing) return res.status(409).json({ error: 'Você já votou' });
    db.insertVoto({ user_id: userId, ocorrencia_id: occId, nota }, (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      recalcPriority(occId, (err3) => {
        if (err3) return res.status(500).json({ error: err3.message });
        res.json({ message: 'Voto registrado' });
      });
    });
  });
};

exports.ranking = (req, res) => {
  db.getRankingOcorrencias((err, docs) => {
    if (err) return res.status(500).json({ error: err.message });
    const ranking = docs.map(r => ({ id: r._id, titulo: r.titulo, prioridadeMedia: r.prioridadeMedia }));
    res.json(ranking);
  });
};
