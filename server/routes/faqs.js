const router = require('express').Router();
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

router.get('/', (req, res) => {
  const faqs = db.prepare('SELECT * FROM faqs ORDER BY sort_order ASC').all();
  res.json(faqs);
});

router.post('/', authMiddleware, (req, res) => {
  const { question, answer, category, sort_order } = req.body;
  const result = db.prepare('INSERT INTO faqs (question, answer, category, sort_order) VALUES (?, ?, ?, ?)').run(question, answer, category, sort_order || 0);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', authMiddleware, (req, res) => {
  const { question, answer, category, sort_order } = req.body;
  db.prepare('UPDATE faqs SET question=?, answer=?, category=?, sort_order=? WHERE id=?').run(question, answer, category, sort_order, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM faqs WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
