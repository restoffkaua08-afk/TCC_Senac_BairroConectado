const db = require('../database');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../auth');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Campos obrigatórios' });
  const hashed = await bcrypt.hash(password, 10);
  db.insertUser({ name, email, password: hashed, createdAt: new Date() }, (err, user) => {
    if (err) {
      if (err.errorType === 'uniqueViolated') return res.status(400).json({ error: 'E-mail já cadastrado' });
      return res.status(500).json({ error: err.message });
    }
    const token = generateToken({ id: user._id, name, email });
    res.status(201).json({ user: { id: user._id, name, email }, token });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Campos obrigatórios' });
  db.findUserByEmail(email, async (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Credenciais inválidas' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' });
    const token = generateToken({ id: user._id, name: user.name, email: user.email });
    res.json({ user: { id: user._id, name: user.name, email: user.email }, token });
  });
};
