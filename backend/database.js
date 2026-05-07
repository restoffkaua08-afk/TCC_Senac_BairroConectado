const Datastore = require('@seald-io/nedb');
const path = require('path');
const fs = require('fs');

const dbDir = path.resolve(__dirname, '../database.db');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const users = new Datastore({ filename: path.join(dbDir, 'users.db'), autoload: true });
const ocorrencias = new Datastore({ filename: path.join(dbDir, 'ocorrencias.db'), autoload: true });
const votos = new Datastore({ filename: path.join(dbDir, 'votos.db'), autoload: true });

users.ensureIndex({ fieldName: 'email', unique: true });
votos.ensureIndex({ fieldName: 'user_occ', unique: true });

module.exports = {
  users,
  ocorrencias,
  votos,
  findUserByEmail: (email, cb) => users.findOne({ email }, cb),
  insertUser: (user, cb) => users.insert(user, cb),
  findAllOcorrencias: (query, cb) => ocorrencias.find(query).sort({ prioridadeMedia: -1 }).exec(cb),
  insertOcorrencia: (data, cb) => ocorrencias.insert(data, cb),
  updateOcorrencia: (id, update, cb) => ocorrencias.update({ _id: id }, { $set: update }, {}, cb),
  findVoto: (userId, occId, cb) => votos.findOne({ user_occ: `${userId}_${occId}` }, cb),
  insertVoto: (voto, cb) => {
    voto.user_occ = `${voto.user_id}_${voto.ocorrencia_id}`;
    votos.insert(voto, cb);
  },
  getAvgNota: (occId, cb) => {
    votos.find({ ocorrencia_id: occId }, (err, docs) => {
      if (err) return cb(err);
      const total = docs.reduce((acc, v) => acc + v.nota, 0);
      const media = docs.length ? total / docs.length : 0;
      cb(null, media);
    });
  },
  getRanking: (cb) => ocorrencias.find({}).sort({ prioridadeMedia: -1 }).limit(3).exec(cb)
};
