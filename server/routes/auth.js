const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users } = require('../database');
const { JWT_SECRET, authMiddleware } = require('../middleware/auth');

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.all(u => u.email === email)[0];
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

router.post('/change-password', authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' });
  }
  const user = users.getById(req.user.id);
  if (!user || !bcrypt.compareSync(currentPassword || '', user.password)) {
    return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
  }
  users.update(user.id, { password: bcrypt.hashSync(newPassword, 10) });
  res.json({ ok: true });
});

router.post('/change-email', authMiddleware, (req, res) => {
  const { password, newEmail } = req.body;
  if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
    return res.status(400).json({ error: 'Adresse email invalide' });
  }
  const user = users.getById(req.user.id);
  if (!user || !bcrypt.compareSync(password || '', user.password)) {
    return res.status(401).json({ error: 'Mot de passe incorrect' });
  }
  if (users.all(u => u.email === newEmail && u.id !== user.id).length > 0) {
    return res.status(409).json({ error: 'Cette adresse email est déjà utilisée' });
  }
  users.update(user.id, { email: newEmail });
  const token = jwt.sign({ id: user.id, email: newEmail, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ ok: true, token, user: { id: user.id, email: newEmail, role: user.role } });
});

module.exports = router;
