const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
// Webhook Stripe doit recevoir le body RAW avant express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Placeholder image generator
app.get('/api/placeholder/:w/:h', (req, res) => {
  const { w, h } = req.params;
  const text = req.query.text || 'Image';
  const colors = ['#1a2340', '#2d3a5a', '#344060', '#243050'];
  const bg = colors[Math.floor(Math.random() * colors.length)];
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" fill="${bg}"/>
    <rect x="20" y="20" width="${w-40}" height="${h-40}" fill="none" stroke="#f5c518" stroke-width="2" stroke-dasharray="8,4" opacity="0.5"/>
    <text x="50%" y="45%" font-family="Arial,sans-serif" font-size="18" fill="#f5c518" text-anchor="middle" dy=".3em" font-weight="bold">${decodeURIComponent(text)}</text>
    <text x="50%" y="62%" font-family="Arial,sans-serif" font-size="12" fill="#ffffff" text-anchor="middle" dy=".3em" opacity="0.7">${w}×${h}</text>
    <text x="50%" y="75%" font-family="Arial,sans-serif" font-size="24" fill="#f5c518" text-anchor="middle" dy=".3em">🔧</text>
  </svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/faqs', require('./routes/faqs'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/stripe', require('./routes/stripe'));
app.use('/api/car-reservations', require('./routes/car-reservations'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin', require('./routes/admin'));

// Serve React build in production
const distPath = path.join(__dirname, '../client/dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(distPath, 'index.html'));
});

// Sauvegarde automatique : au démarrage puis toutes les 24h
try {
  const db = require('./jsondb');
  const snapshot = () => db.makeBackup(new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-'));
  snapshot();
  setInterval(snapshot, 24 * 60 * 60 * 1000);
} catch (e) { console.error('[DB] snapshot init:', e.message); }

app.listen(PORT, () => console.log(`MecaToolsLoc server running on port ${PORT}`));
