const router = require('express').Router();
const { cars } = require('../database');
const { authMiddleware } = require('../middleware/auth');

function parseCar(car) {
  let specs = [];
  try { specs = JSON.parse(car.specs || '[]'); } catch {}
  return { ...car, specs };
}

// Public — liste des voitures actives
router.get('/', (req, res) => {
  res.json(cars.all().filter(c => c.active !== 0).map(parseCar));
});

// Admin — liste complète
router.get('/all', authMiddleware, (req, res) => {
  res.json(cars.all().map(parseCar));
});

// Admin — ajouter
router.post('/', authMiddleware, (req, res) => {
  const { name, category, description, specs, price_day, price_5days, price_2weeks, min_days, caution, image, active } = req.body;
  if (!name) return res.status(400).json({ error: 'Nom requis' });
  const { lastInsertRowid: id } = cars.insert({
    name,
    category: category || '',
    description: description || '',
    specs: JSON.stringify(Array.isArray(specs) ? specs : []),
    price_day: Number(price_day) || 0,
    price_5days: Number(price_5days) || 0,
    price_2weeks: Number(price_2weeks) || 0,
    min_days: min_days ? Number(min_days) : null,
    caution: caution ? Number(caution) : null,
    image: image || '',
    active: active !== false ? 1 : 0,
  });
  res.json(parseCar(cars.getById(id)));
});

// Admin — modifier
router.put('/:id', authMiddleware, (req, res) => {
  const { name, category, description, specs, price_day, price_5days, price_2weeks, min_days, caution, image, active } = req.body;
  cars.update(Number(req.params.id), {
    name,
    category: category || '',
    description: description || '',
    specs: JSON.stringify(Array.isArray(specs) ? specs : []),
    price_day: Number(price_day) || 0,
    price_5days: Number(price_5days) || 0,
    price_2weeks: Number(price_2weeks) || 0,
    min_days: min_days ? Number(min_days) : null,
    caution: caution ? Number(caution) : null,
    image: image || '',
    active: active !== false ? 1 : 0,
  });
  res.json(parseCar(cars.getById(Number(req.params.id))));
});

// Admin — supprimer
router.delete('/:id', authMiddleware, (req, res) => {
  cars.delete(Number(req.params.id));
  res.json({ success: true });
});

module.exports = router;
