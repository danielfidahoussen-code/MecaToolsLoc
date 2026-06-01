const router = require('express').Router();
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

router.post('/', (req, res) => {
  const { product_id, customer_name, customer_email, customer_phone, start_date, end_date, quantity, total_price } = req.body;

  // Check availability
  const conflicts = db.prepare(`
    SELECT COUNT(*) as c FROM reservations
    WHERE product_id = ? AND status != 'cancelled'
    AND ((start_date <= ? AND end_date >= ?) OR (start_date <= ? AND end_date >= ?) OR (start_date >= ? AND end_date <= ?))
  `).get(product_id, start_date, start_date, end_date, end_date, start_date, end_date);

  const product = db.prepare('SELECT stock FROM products WHERE id = ?').get(product_id);
  if (conflicts.c >= (product?.stock || 0)) {
    return res.status(409).json({ error: 'Matériel non disponible pour ces dates' });
  }

  const result = db.prepare(`
    INSERT INTO reservations (product_id, customer_name, customer_email, customer_phone, start_date, end_date, quantity, total_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(product_id, customer_name, customer_email, customer_phone, start_date, end_date, quantity || 1, total_price);

  res.status(201).json({ id: result.lastInsertRowid, message: 'Réservation créée avec succès' });
});

router.get('/check-availability/:product_id', (req, res) => {
  const { product_id } = req.params;
  const { start_date, end_date } = req.query;
  const conflicts = db.prepare(`
    SELECT COUNT(*) as c FROM reservations
    WHERE product_id = ? AND status != 'cancelled'
    AND ((start_date <= ? AND end_date >= ?) OR (start_date <= ? AND end_date >= ?) OR (start_date >= ? AND end_date <= ?))
  `).get(product_id, start_date, start_date, end_date, end_date, start_date, end_date);
  const product = db.prepare('SELECT stock FROM products WHERE id = ?').get(product_id);
  const available = conflicts.c < (product?.stock || 0);
  res.json({ available, reserved: conflicts.c, stock: product?.stock || 0 });
});

// Admin
router.get('/', authMiddleware, (req, res) => {
  const reservations = db.prepare(`
    SELECT r.*, p.name as product_name FROM reservations r
    LEFT JOIN products p ON r.product_id = p.id ORDER BY r.created_at DESC
  `).all();
  res.json(reservations);
});

router.put('/:id/status', authMiddleware, (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE reservations SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

module.exports = router;
