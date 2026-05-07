const db = require('../database');

exports.getProfile = (req, res) => {
  db.users.findOne({ _id: req.userId }, (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({
      id: user._id, name: user.name, email: user.email,
      telefone: user.telefone || '', endereco: user.endereco || '', foto: user.foto || ''
    });
  });
};

exports.updateProfile = (req, res) => {
  const { name, telefone, endereco, foto } = req.body;
  const update = {};
  if (name) update.name = name;
  if (telefone) update.telefone = telefone;
  if (endereco) update.endereco = endereco;
  if (foto) update.foto = foto;
  db.users.update({ _id: req.userId }, { $set: update }, {}, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Perfil atualizado' });
  });
};
