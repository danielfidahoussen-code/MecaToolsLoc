const router = require('express').Router();
const fs = require('fs');
const jwt = require('jsonwebtoken');
const db = require('../jsondb');
const { JWT_SECRET } = require('../middleware/auth');

// Auth acceptant le token en header OU en query (pour les téléchargements via <a>)
const authFlexible = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.query.token;
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'Token invalide' }); }
};

// Télécharge la sauvegarde complète (le fichier data.json) — à conserver hors ligne
router.get('/backup', authFlexible, (req, res) => {
  const dbPath = db.getDbPath();
  if (!fs.existsSync(dbPath)) return res.status(404).json({ error: 'Aucune donnée' });
  // Fabrique aussi un snapshot rotatif dans le volume au passage
  const stamp = (req.query.stamp || 'manual').toString().replace(/[^0-9a-zA-Z_-]/g, '');
  db.makeBackup(stamp);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="sauvegarde-prestolocation-${stamp}.json"`);
  fs.createReadStream(dbPath).pipe(res);
});

module.exports = router;
