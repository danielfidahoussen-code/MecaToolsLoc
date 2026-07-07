const router = require('express').Router();
const { sendTelegramTest, telegramConfigured, notifyContactMessage, notifyNewOrder, notifyNewCarReservation, emailConfigured, sendEmailTest } = require('../notify');

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

// Route de test — vérifie les notifications Telegram ET l'email client.
// Telegram (proprio)  : https://ton-site/api/contact/test
// Email client (test) : https://ton-site/api/contact/test?email=ton-adresse@gmail.com
router.get('/test', async (req, res) => {
  const result = { telegram: {}, email: {} };

  // --- Telegram (notifications proprio) ---
  if (telegramConfigured()) {
    await sendTelegramTest();
    await notifyNewOrder({
      customer_name: 'EXEMPLE - Jean Dupont', customer_email: 'jean@exemple.fr',
      customer_phone: '06 12 34 56 78', customer_address: 'Retrait sur place',
      items: [
        { name: 'Kit de calage distribution Opel', type: 'rent', qty: 1, start: '2026-07-10', end: '2026-07-15' },
        { name: 'Testeur d\'étanchéité', type: 'sale', qty: 1 },
      ],
      total_price: 264.98, caution_total: 150,
    });
    await notifyNewCarReservation({
      car_name: 'EXEMPLE - Toyota Yaris', customer_name: 'Marie Martin',
      customer_email: 'marie@exemple.fr', customer_phone: '06 98 76 54 32',
      start_date: '2026-07-20', end_date: '2026-07-25', days: 5, delivery: false,
      total: 175, caution_amount: 500,
    });
    result.telegram = { configured: true, message: 'Messages de test envoyés sur Telegram.' };
  } else {
    result.telegram = { configured: false, message: 'Non configuré : ajoute TELEGRAM_BOT_TOKEN et TELEGRAM_CHAT_ID sur Railway.' };
  }

  // --- Email (confirmation client) ---
  const testEmail = req.query.email;
  if (!emailConfigured()) {
    result.email = {
      configured: false,
      message: 'Non configuré : ajoute SMTP_USER et SMTP_PASS sur Railway.',
      has_smtp_user: !!process.env.SMTP_USER, has_smtp_pass: !!process.env.SMTP_PASS,
    };
  } else if (!testEmail) {
    result.email = { configured: true, message: 'Email configuré. Ajoute ?email=ton-adresse@gmail.com à l\'URL pour recevoir un email de test.' };
  } else {
    await sendEmailTest(testEmail);
    result.email = { configured: true, message: `Email de test envoyé à ${testEmail}. Vérifie ta boîte (et les spams).` };
  }

  res.json({ ok: true, ...result });
});

module.exports = router;
