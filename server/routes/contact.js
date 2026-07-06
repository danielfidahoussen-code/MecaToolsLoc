const router = require('express').Router();
const { sendTelegram, notifyContactMessage } = require('../notify');

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

// Route de test — vérifie que Telegram est bien configuré
// Ouvrir dans le navigateur : https://ton-site/api/contact/test
router.get('/test', async (req, res) => {
  const configured = !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
  if (!configured) {
    return res.json({
      ok: false,
      message: 'Telegram non configuré. Ajoute TELEGRAM_BOT_TOKEN et TELEGRAM_CHAT_ID dans les variables Railway.',
      has_token: !!process.env.TELEGRAM_BOT_TOKEN,
      has_chat_id: !!process.env.TELEGRAM_CHAT_ID,
    });
  }
  await sendTelegram('Test LVTools : si tu vois ce message, les notifications Telegram fonctionnent correctement.');
  res.json({ ok: true, message: 'Message de test envoyé. Vérifie ton Telegram.' });
});

module.exports = router;
