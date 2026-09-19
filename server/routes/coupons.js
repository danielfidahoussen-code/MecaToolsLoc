const router = require('express').Router();
const { coupons, referral_codes } = require('../database');
const { authMiddleware } = require('../middleware/auth');
const { resolveCode } = require('../loyalty');

// Public — vérifie un code promo avant paiement (n'écrit rien, juste une validation)
router.post('/validate', (req, res) => {
  const { code, customer_email } = req.body;
  const result = resolveCode(code, customer_email);
  if (!result.valid) return res.status(400).json({ valid: false, error: result.error });
  res.json({ valid: true, percent: result.percent, source: result.source });
});

// Admin — liste des coupons émis et des codes de parrainage
router.get('/', authMiddleware, (req, res) => {
  res.json({
    coupons: coupons.all().sort((a, b) => b.created_at.localeCompare(a.created_at)),
    referral_codes: referral_codes.all().sort((a, b) => b.created_at.localeCompare(a.created_at)),
  });
});

module.exports = router;
