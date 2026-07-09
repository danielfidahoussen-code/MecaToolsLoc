const router = require('express').Router();
const { reservations, products } = require('../database');
const { authMiddleware } = require('../middleware/auth');

function datesOverlap(s1, e1, s2, e2) {
  return s1 <= e2 && e1 >= s2;
}

router.post('/', (req, res) => {
  const { product_id, customer_name, customer_email, customer_phone, start_date, end_date, quantity, total_price } = req.body;
  const pid = Number(product_id);
  const product = products.getById(pid);
  if (!product) return res.status(404).json({ error: 'Produit non trouvé' });

  const conflicts = reservations.count(r =>
    r.product_id === pid && r.status !== 'cancelled' &&
    datesOverlap(r.start_date, r.end_date, start_date, end_date)
  );

  if (conflicts >= product.stock) {
    return res.status(409).json({ error: 'Matériel non disponible pour ces dates' });
  }

  const result = reservations.insert({ product_id: pid, customer_name, customer_email, customer_phone: customer_phone || '', start_date, end_date, quantity: quantity || 1, total_price: total_price || 0, status: 'pending' });
  res.status(201).json({ id: result.lastInsertRowid, message: 'Réservation créée avec succès' });
});

router.get('/check-availability/:product_id', (req, res) => {
  const pid = Number(req.params.product_id);
  const { start_date, end_date } = req.query;
  const product = products.getById(pid);
  const conflicts = reservations.count(r =>
    r.product_id === pid && r.status !== 'cancelled' &&
    datesOverlap(r.start_date, r.end_date, start_date, end_date)
  );
  res.json({ available: conflicts < (product?.stock || 0), reserved: conflicts, stock: product?.stock || 0 });
});

router.get('/', authMiddleware, (req, res) => {
  const all = reservations.all().map(r => {
    const p = products.getById(r.product_id);
    return { ...r, product_name: p?.name };
  }).sort((a, b) => b.created_at.localeCompare(a.created_at));
  res.json(all);
});

router.put('/:id/status', authMiddleware, (req, res) => {
  reservations.update(Number(req.params.id), { status: req.body.status });
  res.json({ success: true });
});

// Supprime toutes les réservations (doit être AVANT /:id)
router.delete('/all', authMiddleware, (req, res) => {
  reservations.all().forEach(r => reservations.delete(r.id));
  res.json({ success: true });
});

router.delete('/:id', authMiddleware, (req, res) => {
  reservations.delete(Number(req.params.id));
  res.json({ success: true });
});

module.exports = router;
