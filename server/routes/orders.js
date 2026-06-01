const router = require('express').Router();
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

router.post('/', async (req, res) => {
  const { customer_name, customer_email, customer_phone, customer_address, items, total_price, type } = req.body;
  try {
    const result = db.prepare(`
      INSERT INTO orders (customer_name, customer_email, customer_phone, customer_address, items, total_price, type, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'paid')
    `).run(customer_name, customer_email, customer_phone, customer_address, JSON.stringify(items), total_price, type || 'mixed');

    // Update stock for purchases
    const parsedItems = JSON.parse(JSON.stringify(items));
    parsedItems.forEach(item => {
      if (item.type === 'sale') {
        db.prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?').run(item.quantity, item.id);
      }
    });

    res.status(201).json({ id: result.lastInsertRowid, message: 'Commande créée avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body;
  // In production, use Stripe: const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
  // For demo, simulate a payment intent
  res.json({
    clientSecret: `mock_pi_${Date.now()}_secret_demo`,
    amount,
    message: 'Paiement en mode démonstration'
  });
});

// Admin
router.get('/', authMiddleware, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  res.json(orders);
});

router.put('/:id/status', authMiddleware, (req, res) => {
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(req.body.status, req.params.id);
  res.json({ success: true });
});

module.exports = router;
