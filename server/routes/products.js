const router = require('express').Router();
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

router.get('/', (req, res) => {
  const { category, type, search, page = 1, limit = 12 } = req.query;
  let query = `SELECT p.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon
               FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1`;
  const params = [];
  if (category) { query += ' AND c.slug = ?'; params.push(category); }
  if (type === 'rent') { query += ' AND p.available_for_rent = 1'; }
  if (type === 'sale') { query += ' AND p.available_for_sale = 1'; }
  if (search) { query += ' AND p.name LIKE ?'; params.push(`%${search}%`); }
  const offset = (parseInt(page) - 1) * parseInt(limit);
  let countQuery = 'SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
  if (category) countQuery += ' AND c.slug = ?';
  if (type === 'rent') countQuery += ' AND p.available_for_rent = 1';
  if (type === 'sale') countQuery += ' AND p.available_for_sale = 1';
  if (search) countQuery += ' AND p.name LIKE ?';
  const countResult = db.prepare(countQuery).get(...params);
  const total = countResult ? countResult.total : 0;
  query += ` LIMIT ? OFFSET ?`;
  const products = db.prepare(query).all(...params, parseInt(limit), offset);
  res.json({ products, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

router.get('/categories', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories').all();
  res.json(categories);
});

router.get('/:id', (req, res) => {
  const product = db.prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `).get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Produit non trouvé' });

  // Get reservations for availability calendar
  const reservations = db.prepare(`
    SELECT start_date, end_date, quantity FROM reservations
    WHERE product_id = ? AND status != 'cancelled' AND end_date >= date('now')
  `).all(req.params.id);
  res.json({ ...product, reservations });
});

// Admin routes
router.post('/', authMiddleware, (req, res) => {
  const { name, description, category_id, price_sale, price_day, price_week, stock, available_for_sale, available_for_rent, image } = req.body;
  const result = db.prepare(`
    INSERT INTO products (name, description, category_id, price_sale, price_day, price_week, stock, available_for_sale, available_for_rent, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, description, category_id, price_sale, price_day, price_week, stock, available_for_sale ? 1 : 0, available_for_rent ? 1 : 0, image || '/api/placeholder/400/300');
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(product);
});

router.put('/:id', authMiddleware, (req, res) => {
  const { name, description, category_id, price_sale, price_day, price_week, stock, available_for_sale, available_for_rent, image } = req.body;
  db.prepare(`
    UPDATE products SET name=?, description=?, category_id=?, price_sale=?, price_day=?, price_week=?,
    stock=?, available_for_sale=?, available_for_rent=?, image=?, updated_at=datetime('now') WHERE id=?
  `).run(name, description, category_id, price_sale, price_day, price_week, stock, available_for_sale ? 1 : 0, available_for_rent ? 1 : 0, image, req.params.id);
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json(product);
});

router.delete('/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
