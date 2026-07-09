const router = require('express').Router();
const { tool_contracts } = require('../database');

// Signature du contrat de location d'un ou plusieurs outils, avant paiement.
// Le dataURL de signature + horodatage + IP sont conservés comme preuve d'acceptation.
router.post('/', (req, res) => {
  const { customer_name, customer_email, items, signature } = req.body;
  if (!signature) return res.status(400).json({ error: 'Signature requise' });
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "Aucun article en location à signer" });

  const result = tool_contracts.insert({
    customer_name: customer_name || '',
    customer_email: customer_email || '',
    items: JSON.stringify(items),
    signature,
    signed_at: new Date().toISOString(),
    ip: req.ip || '',
  });
  res.status(201).json({ id: result.lastInsertRowid, signed_at: new Date().toISOString() });
});

router.get('/:id', (req, res) => {
  const contract = tool_contracts.getById(req.params.id);
  if (!contract) return res.status(404).json({ error: 'Contrat introuvable' });
  res.json(contract);
});

module.exports = router;
