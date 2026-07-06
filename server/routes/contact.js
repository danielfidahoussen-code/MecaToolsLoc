const router = require('express').Router();
const { sendTest, isConfigured, notifyContactMessage } = require('../notify');

// Envoi d'un message via le formulaire de contact
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }
    await notifyContactMessage({ name, email, phone, subject, message });
    res.json({ success: true });
  } catch (err) {
    console.error('Contact error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Route de test — vérifie que l'email est bien configuré
// Ouvrir dans le navigateur : https://ton-site/api/contact/test
router.get('/test', async (req, res) => {
  if (!isConfigured()) {
    return res.json({
      ok: false,
      message: 'Email non configuré. Ajoute SMTP_USER et SMTP_PASS dans les variables Railway.',
      has_smtp_user: !!process.env.SMTP_USER,
      has_smtp_pass: !!process.env.SMTP_PASS,
    });
  }
  await sendTest();
  res.json({ ok: true, message: 'Email de test envoyé. Vérifie ta boîte mail (et les spams).' });
});

module.exports = router;
