const router = require('express').Router();
const { orders, products, reservations } = require('../database');
const { authMiddleware } = require('../middleware/auth');

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

router.get('/', authMiddleware, (req, res) => {
  const all = orders.all().sort((a, b) => b.created_at.localeCompare(a.created_at));
  res.json(all);
});

router.put('/:id/status', authMiddleware, (req, res) => {
  orders.update(Number(req.params.id), { status: req.body.status });
  res.json({ success: true });
});

module.exports = router;
