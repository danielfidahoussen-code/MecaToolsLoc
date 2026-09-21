const router = require('express').Router();
const QRCode = require('qrcode');
const bwipjs = require('bwip-js');
const { products, categories } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const SITE_URL = process.env.SITE_URL || 'https://www.prestolocation.re';

function withCategory(product) {
  if (!product) return null;
  const cat = categories.getById(product.category_id);
  let images = [];
  try { images = JSON.parse(product.images || '[]'); } catch {}
  return { ...product, images, category_name: cat?.name, category_slug: cat?.slug, category_icon: cat?.icon };
}

router.get('/categories', (req, res) => {
  res.json(categories.all());
});

// QR code d'un produit — encode le lien direct vers sa fiche produit.
// Public : le lien pointe vers une page déjà publique, rien de sensible à protéger.
router.get('/:id/qrcode.png', async (req, res) => {
  const product = products.getById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
  try {
    const url = `${SITE_URL}/produit/${product.id}`;
    const buffer = await QRCode.toBuffer(url, { width: 400, margin: 1, color: { dark: '#220404', light: '#ffffff' } });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Code-barres (Code128) d'un produit — alternative au QR code pour les douchettes
// qui ne lisent pas le 2D. Encode aussi le lien direct vers la fiche produit.
router.get('/:id/barcode.png', async (req, res) => {
  const product = products.getById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
  try {
    // Sans schéma/www pour raccourcir le code-barres — les navigateurs
    // reconnaissent ce format tapé dans la barre d'adresse tout aussi bien.
    const shortUrl = SITE_URL.replace(/^https?:\/\/(www\.)?/, '') + `/produit/${product.id}`;
    const buffer = await bwipjs.toBuffer({
      bcid: 'code128', text: shortUrl, scale: 2, height: 8,
      includetext: true, textxalign: 'center', textfont: 'Helvetica', textsize: 7,
    });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin — feuille imprimable avec le QR code + nom de chaque outil, à coller sur le matériel.
router.get('/qrcodes/print', (req, res, next) => {
  const jwt = require('jsonwebtoken');
  const { JWT_SECRET } = require('../middleware/auth');
  const token = req.headers.authorization?.split(' ')[1] || req.query.token;
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  try { jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'Token invalide' }); }
}, async (req, res) => {
  const rows = products.all().filter(p => p.active !== 0);
  const cards = rows.map(p => `
    <div class="card">
      <img src="/api/products/${p.id}/qrcode.png" alt="QR ${p.name}"/>
      <p class="name">${p.name}</p>
      <p class="ref">Réf. #${p.id}</p>
    </div>
  `).join('');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
<title>Fiches QR — Outillage PrestoLocation</title>
<style>
  body{font-family:Arial,sans-serif;margin:0;padding:24px;color:#111;}
  h1{font-size:18px;text-align:center;margin-bottom:4px;}
  p.sub{text-align:center;color:#666;font-size:12px;margin-bottom:20px;}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:16px;}
  .card{border:1px solid #ccc;border-radius:8px;padding:10px;text-align:center;page-break-inside:avoid;}
  .card img{width:100%;height:auto;max-width:150px;}
  .card .name{font-weight:bold;font-size:12px;margin-top:6px;line-height:1.3;}
  .card .ref{font-size:10px;color:#888;margin-top:2px;}
  .no-print{text-align:center;margin-bottom:20px;}
  @media print{.no-print{display:none;}}
</style></head><body>
<div class="no-print">
  <button onclick="window.print()" style="padding:8px 20px;font-size:13px;font-weight:bold;background:#c0392b;color:white;border:none;border-radius:6px;cursor:pointer;">Imprimer toutes les fiches</button>
</div>
<h1>Fiches QR — Outillage PrestoLocation</h1>
<p class="sub">Scanner un code ouvre directement la fiche produit correspondante sur le site.</p>
<div class="grid">${cards}</div>
</body></html>`);
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
  const { name, description, category_id, price_sale, price_day, price_week, caution, stock, available_for_sale, available_for_rent, image, images, has_qr_notice } = req.body;
  const result = products.insert({ name, description, category_id: Number(category_id), price_sale: Number(price_sale) || null, price_day: Number(price_day) || null, price_week: Number(price_week) || null, caution: Number(caution) || null, stock: Number(stock) || 0, available_for_sale: available_for_sale ? 1 : 0, available_for_rent: available_for_rent ? 1 : 0, image: image || '/api/placeholder/400/300', images: JSON.stringify(images || []), has_qr_notice: has_qr_notice ? 1 : 0 });
  res.status(201).json(withCategory(products.getById(result.lastInsertRowid)));
});

router.put('/:id', authMiddleware, (req, res) => {
  const { name, description, category_id, price_sale, price_day, price_week, caution, stock, available_for_sale, available_for_rent, image, images, has_qr_notice } = req.body;
  products.update(Number(req.params.id), { name, description, category_id: Number(category_id), price_sale: Number(price_sale) || null, price_day: Number(price_day) || null, price_week: Number(price_week) || null, caution: Number(caution) || null, stock: Number(stock) || 0, available_for_sale: available_for_sale ? 1 : 0, available_for_rent: available_for_rent ? 1 : 0, image, images: JSON.stringify(images || []), has_qr_notice: has_qr_notice ? 1 : 0 });
  res.json(withCategory(products.getById(Number(req.params.id))));
});

router.delete('/:id', authMiddleware, (req, res) => {
  products.delete(Number(req.params.id));
  res.json({ success: true });
});

module.exports = router;
