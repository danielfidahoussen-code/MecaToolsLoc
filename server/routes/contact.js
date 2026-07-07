const router = require('express').Router();
const { sendEmailTest, sendTelegramTest, emailConfigured, telegramConfigured, notifyContactMessage } = require('../notify');

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

// Route de test — vérifie les deux canaux (email pour contact, Telegram pour commandes)
// Ouvrir dans le navigateur : https://ton-site/api/contact/test
router.get('/test', async (req, res) => {
  const email = emailConfigured();
  const telegram = telegramConfigured();
  if (email) await sendEmailTest();
  if (telegram) await sendTelegramTest();
  res.json({
    email: {
      configured: email,
      message: email ? 'Email de test envoyé — vérifie ta boîte (et les spams).' : 'Non configuré : ajoute SMTP_USER et SMTP_PASS sur Railway.',
    },
    telegram: {
      configured: telegram,
      message: telegram ? 'Message Telegram de test envoyé.' : 'Non configuré : ajoute TELEGRAM_BOT_TOKEN et TELEGRAM_CHAT_ID sur Railway.',
    },
  });
});

module.exports = router;
