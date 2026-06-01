const router = require('express').Router();
const { faqs } = require('../database');
const { authMiddleware } = require('../middleware/auth');

router.get('/', (req, res) => {
  res.json(faqs.all().sort((a, b) => a.sort_order - b.sort_order));
});

router.post('/', authMiddleware, (req, res) => {
  const { question, answer, category, sort_order } = req.body;
  const result = faqs.insert({ question, answer, category: category || 'general', sort_order: sort_order || 0 });
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', authMiddleware, (req, res) => {
  faqs.update(Number(req.params.id), req.body);
  res.json({ success: true });
});

router.delete('/:id', authMiddleware, (req, res) => {
  faqs.delete(Number(req.params.id));
  res.json({ success: true });
});

module.exports = router;
