const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET || 'fallback';

function generateToken(user) {
  return jwt.sign({ id: user.id, name: user.name, email: user.email }, secret, { expiresIn: '7d' });
}

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, secret);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = { generateToken, verifyToken };
