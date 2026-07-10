const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { rental_contracts } = require('../database');
const { JWT_SECRET } = require('../middleware/auth');

// Enregistre la signature du contrat de location d'outillage, avant le paiement.
router.post('/', (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, items, signature } = req.body;
    if (!customer_name || !customer_email) return res.status(400).json({ error: 'Coordonnées client manquantes' });
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Aucun article en location' });
    if (!signature) return res.status(400).json({ error: 'Signature requise' });

    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim();

    const { lastInsertRowid: id } = rental_contracts.insert({
      customer_name, customer_email, customer_phone: customer_phone || '',
      items: JSON.stringify(items),
      signature,
      accepted_terms: true,
      ip,
      user_agent: (req.headers['user-agent'] || '').slice(0, 300),
      signed_at: new Date().toISOString(),
    });

    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin — contrat en HTML imprimable
router.get('/:id/print', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.query.token;
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'Token invalide' }); }
}, (req, res) => {
  const c = rental_contracts.getById(Number(req.params.id));
  if (!c) return res.status(404).json({ error: 'Introuvable' });
  let items = []; try { items = JSON.parse(c.items || '[]'); } catch {}
  const signedAt = c.signed_at ? new Date(c.signed_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const rows = items.map(i => `<tr>
    <td>${i.name || ''}</td>
    <td>${i.rentDates ? `${i.rentDates.startDate} → ${i.rentDates.endDate}` : ''}</td>
    <td>${i.quantity || 1}</td>
    <td>${(i.price || 0).toFixed ? i.price.toFixed(2) : i.price} €</td>
    <td>${i.caution ? Number(i.caution).toFixed(2) + ' €' : '—'}</td>
  </tr>`).join('');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
<title>Contrat de location outillage N°${c.id}</title>
<style>
  body{font-family:Arial,sans-serif;font-size:12px;margin:0;padding:24px;color:#111;}
  h1{font-size:16px;text-align:center;margin-bottom:14px;}
  table{width:100%;border-collapse:collapse;margin-bottom:16px;}
  th,td{border:1px solid #ccc;padding:6px 8px;text-align:left;font-size:11px;}
  th{background:#eee;}
  .sig-box{border:1px solid #999;width:260px;min-height:90px;padding:8px;margin-top:10px;}
  .sig-img{max-width:240px;max-height:80px;}
  @media print{.no-print{display:none;}}
</style></head><body>
<div class="no-print" style="text-align:center;margin-bottom:16px;">
  <button onclick="window.print()" style="padding:8px 20px;font-weight:bold;background:#c0392b;color:white;border:none;border-radius:6px;cursor:pointer;">Imprimer / Enregistrer en PDF</button>
</div>
<h1>Contrat de location d'outillage N°${c.id} — Auto Presto / LVTools</h1>
<p><strong>Client :</strong> ${c.customer_name} — ${c.customer_email} — ${c.customer_phone || ''}</p>
<p><strong>Signé le :</strong> ${signedAt} — <strong>IP :</strong> ${c.ip || '—'}</p>
<table>
  <thead><tr><th>Outil</th><th>Période</th><th>Qté</th><th>Prix</th><th>Caution</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<p>Le client reconnaît avoir lu et accepté les conditions générales de location (voir CGV, article 6 à 8) préalablement à la signature ci-dessous.</p>
<div class="sig-box">
  <div style="font-size:10px;font-weight:bold;margin-bottom:6px;">Signature du client</div>
  ${c.signature ? `<img class="sig-img" src="${c.signature}" alt="Signature"/>` : ''}
</div>
</body></html>`);
});

module.exports = router;
