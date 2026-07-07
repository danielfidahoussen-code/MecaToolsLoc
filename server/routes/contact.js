const router = require('express').Router();
const { sendTelegramTest, telegramConfigured, notifyContactMessage, notifyNewOrder, notifyNewCarReservation } = require('../notify');

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
  if (!telegramConfigured()) {
    return res.json({
      ok: false,
      message: 'Telegram non configuré. Ajoute TELEGRAM_BOT_TOKEN et TELEGRAM_CHAT_ID dans les variables Railway.',
      has_token: !!process.env.TELEGRAM_BOT_TOKEN,
      has_chat_id: !!process.env.TELEGRAM_CHAT_ID,
    });
  }
  await sendTelegramTest();

  // Exemple de commande (aucun vrai achat)
  await notifyNewOrder({
    customer_name: 'EXEMPLE - Jean Dupont',
    customer_email: 'jean@exemple.fr',
    customer_phone: '06 12 34 56 78',
    customer_address: 'Retrait sur place',
    items: [
      { name: 'Kit de calage distribution Opel', type: 'rent', qty: 1, start: '2026-07-10', end: '2026-07-15' },
      { name: 'Testeur d\'étanchéité', type: 'sale', qty: 1 },
    ],
    total_price: 264.98,
    caution_total: 150,
  });

  // Exemple de réservation véhicule (aucune vraie résa)
  await notifyNewCarReservation({
    car_name: 'EXEMPLE - Toyota Yaris',
    customer_name: 'Marie Martin',
    customer_email: 'marie@exemple.fr',
    customer_phone: '06 98 76 54 32',
    start_date: '2026-07-20', end_date: '2026-07-25', days: 5,
    delivery: false,
    total: 175, caution_amount: 500,
  });

  res.json({ ok: true, message: 'Test envoyé : 1 message de test + 1 exemple de commande + 1 exemple de réservation. Vérifie ton Telegram.' });
});

module.exports = router;
