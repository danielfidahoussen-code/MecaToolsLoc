const router = require('express').Router();
const { products, categories } = require('../database');
const { authMiddleware } = require('../middleware/auth');

function withCategory(product) {
  if (!product) return null;
  const cat = categories.getById(product.category_id);
  return { ...product, category_name: cat?.name, category_slug: cat?.slug, category_icon: cat?.icon };
}

router.get('/categories', (req, res) => {
  res.json(categories.all());
});

router.get('/', (req, res) => {
  const { category, type, search, page = 1, limit = 12 } = req.query;
  let rows = products.all();

  if (category) {
    const cat = categories.all(c => c.slug === category)[0];
    if (cat) rows = rows.filter(p => p.category_id === cat.id);
  }
  if (type === 'rent') rows = rows.filter(p => p.available_for_rent);
  if (type === 'sale') rows = rows.filter(p => p.available_for_sale);
  if (search) rows = rows.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const total = rows.length;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  rows = rows.slice(offset, offset + parseInt(limit)).map(withCategory);

  res.json({ products: rows, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) || 1 });
});

router.get('/:id', (req, res) => {
  const product = withCategory(products.getById(req.params.id));
  if (!product) return res.status(404).json({ error: 'Produit non trouvé' });

  const { reservations } = require('../database');
  const today = new Date().toISOString().split('T')[0];
  const res_list = reservations.all(r =>
    r.product_id === product.id && r.status !== 'cancelled' && r.end_date >= today
  ).map(r => ({ start_date: r.start_date, end_date: r.end_date, quantity: r.quantity }));

  res.json({ ...product, reservations: res_list });
});

router.post('/', authMiddleware, (req, res) => {
  const { name, description, category_id, price_sale, price_day, price_week, stock, available_for_sale, available_for_rent, image, has_qr_notice } = req.body;
  const result = products.insert({ name, description, category_id: Number(category_id), price_sale: Number(price_sale) || null, price_day: Number(price_day) || null, price_week: Number(price_week) || null, stock: Number(stock) || 0, available_for_sale: available_for_sale ? 1 : 0, available_for_rent: available_for_rent ? 1 : 0, image: image || '/api/placeholder/400/300', has_qr_notice: has_qr_notice ? 1 : 0 });
  res.status(201).json(withCategory(products.getById(result.lastInsertRowid)));
});

router.put('/:id', authMiddleware, (req, res) => {
  const { name, description, category_id, price_sale, price_day, price_week, stock, available_for_sale, available_for_rent, image, has_qr_notice } = req.body;
  products.update(Number(req.params.id), { name, description, category_id: Number(category_id), price_sale: Number(price_sale) || null, price_day: Number(price_day) || null, price_week: Number(price_week) || null, stock: Number(stock) || 0, available_for_sale: available_for_sale ? 1 : 0, available_for_rent: available_for_rent ? 1 : 0, image, has_qr_notice: has_qr_notice ? 1 : 0 });
  res.json(withCategory(products.getById(Number(req.params.id))));
});

router.delete('/:id', authMiddleware, (req, res) => {
  products.delete(Number(req.params.id));
  res.json({ success: true });
});

module.exports = router;
