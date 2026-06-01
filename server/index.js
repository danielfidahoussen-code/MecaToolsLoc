const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
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

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/dist/index.html')));
}

app.listen(PORT, () => console.log(`MecaToolsLoc server running on port ${PORT}`));
