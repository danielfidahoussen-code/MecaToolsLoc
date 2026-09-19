const router = require('express').Router();
const Stripe = require('stripe');
const { orders, products, reservations } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;
const FREE_CANCEL_DAYS = 2;

function daysUntil(dateStr) {
  const start = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  return Math.ceil((start - now) / (1000 * 60 * 60 * 24));
}

router.post('/', (req, res) => {
  const { customer_name, customer_email, customer_phone, customer_address, items, total_price, type } = req.body;
  try {
    const result = orders.insert({ customer_name, customer_email, customer_phone: customer_phone || '', customer_address: customer_address || '', items: JSON.stringify(items), total_price, type: type || 'mixed', status: 'paid' });

    (items || []).forEach(item => {
      if (item.type === 'sale') {
        // Deduct stock for purchases
        const p = products.getById(item.id);
        if (p) products.update(item.id, { stock: Math.max(0, p.stock - item.quantity) });
      } else if (item.type === 'rent' && item.rentDates) {
        // Create a reservation entry for rental items
        reservations.insert({
          product_id: item.id,
          customer_name,
          customer_email,
          customer_phone: customer_phone || '',
          start_date: item.rentDates.startDate,
          end_date: item.rentDates.endDate,
          quantity: item.quantity,
          total_price: item.price * item.quantity,
          status: 'confirmed',
        });
      }
    });

    res.status(201).json({ id: result.lastInsertRowid, message: 'Commande créée avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/create-payment-intent', (req, res) => {
  res.json({ clientSecret: `mock_pi_${Date.now()}_secret_demo`, amount: req.body.amount, message: 'Paiement en mode démonstration' });
});

// Public — infos d'annulation (lien envoyé par email, protégé par le token)
router.get('/cancel/:id/:token', (req, res) => {
  const o = orders.getById(Number(req.params.id));
  if (!o || !o.cancel_token || o.cancel_token !== req.params.token) return res.status(404).json({ error: 'Lien invalide' });
  if (o.status === 'cancelled') return res.json({ already_cancelled: true, refunded: !!o.refunded });
  const days = o.rental_start ? daysUntil(o.rental_start) : null;
  res.json({
    deposit_amount: o.deposit_amount || null, balance_due: o.balance_due || null,
    start_date: o.rental_start || null,
    days_until_start: days,
    refund_eligible: days != null && days >= FREE_CANCEL_DAYS,
  });
});

// Public — confirme l'annulation (rembourse l'acompte si à ≥ 2 jours du début de la location)
router.post('/cancel/:id/:token', async (req, res) => {
  const o = orders.getById(Number(req.params.id));
  if (!o || !o.cancel_token || o.cancel_token !== req.params.token) return res.status(404).json({ error: 'Lien invalide' });
  if (o.status === 'cancelled') return res.status(400).json({ error: 'Cette commande est déjà annulée' });

  const days = o.rental_start ? daysUntil(o.rental_start) : null;
  const eligible = days != null && days >= FREE_CANCEL_DAYS;
  let refunded = false;

  if (eligible && o.stripe_payment_intent_id && stripe) {
    try {
      await stripe.refunds.create({ payment_intent: o.stripe_payment_intent_id });
      refunded = true;
    } catch (err) {
      console.error('[REFUND] Échec remboursement commande', o.id, ':', err.message);
      return res.status(500).json({ error: 'Le remboursement a échoué, contactez-nous directement.' });
    }
  }

  orders.update(o.id, { status: 'cancelled', cancelled_at: new Date().toISOString(), refunded });
  res.json({ success: true, refunded });
});

router.get('/', authMiddleware, (req, res) => {
  const all = orders.all().sort((a, b) => b.created_at.localeCompare(a.created_at));
  res.json(all);
});

router.put('/:id/status', authMiddleware, (req, res) => {
  orders.update(Number(req.params.id), { status: req.body.status });
  res.json({ success: true });
});

// Supprime toutes les commandes (doit être AVANT /:id)
router.delete('/all', authMiddleware, (req, res) => {
  orders.all().forEach(o => orders.delete(o.id));
  res.json({ success: true });
});

router.delete('/:id', authMiddleware, (req, res) => {
  orders.delete(Number(req.params.id));
  res.json({ success: true });
});

module.exports = router;
