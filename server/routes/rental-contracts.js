const router = require('express').Router();
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const { rental_contracts } = require('../database');
const { JWT_SECRET } = require('../middleware/auth');

// Auth acceptant le token en header OU en query (pour les liens de téléchargement)
const authFlexible = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.query.token;
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'Token invalide' }); }
};

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
router.get('/:id/print', authFlexible, (req, res) => {
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

// Admin — vrai PDF téléchargeable (généré côté serveur, pas d'impression navigateur)
router.get('/:id/pdf', authFlexible, (req, res) => {
  const c = rental_contracts.getById(Number(req.params.id));
  if (!c) return res.status(404).json({ error: 'Introuvable' });
  let items = []; try { items = JSON.parse(c.items || '[]'); } catch {}
  const signedAt = c.signed_at ? new Date(c.signed_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="contrat-location-outillage-${c.id}.pdf"`);

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  doc.pipe(res);

  doc.fontSize(16).font('Helvetica-Bold').text(`Contrat de location d'outillage N°${c.id}`, { align: 'center' });
  doc.fontSize(10).font('Helvetica').fillColor('#666').text('Auto Presto / LVTools', { align: 'center' });
  doc.moveDown(1.2);

  doc.fillColor('#111').fontSize(11).font('Helvetica-Bold').text('Client');
  doc.font('Helvetica').fontSize(10)
    .text(`Nom : ${c.customer_name}`)
    .text(`Email : ${c.customer_email}`)
    .text(`Téléphone : ${c.customer_phone || '—'}`)
    .text(`Signé le : ${signedAt}    IP : ${c.ip || '—'}`);
  doc.moveDown(1);

  doc.font('Helvetica-Bold').fontSize(11).text('Articles loués');
  doc.moveDown(0.3);
  const colX = [50, 220, 340, 400, 470];
  doc.fontSize(9).font('Helvetica-Bold');
  doc.text('Outil', colX[0], doc.y, { width: 160 });
  doc.text('Période', colX[1], doc.y - 10, { width: 110 });
  doc.text('Qté', colX[2], doc.y - 10, { width: 50 });
  doc.text('Prix', colX[3], doc.y - 10, { width: 60 });
  doc.text('Caution', colX[4], doc.y - 10, { width: 80 });
  doc.moveDown(0.5);
  doc.font('Helvetica').fontSize(9);
  items.forEach(i => {
    const y = doc.y;
    const periode = i.rentDates ? `${i.rentDates.startDate} au ${i.rentDates.endDate}` : '—';
    doc.text(i.name || `Produit #${i.id}`, colX[0], y, { width: 160 });
    doc.text(periode, colX[1], y, { width: 110 });
    doc.text(String(i.quantity || 1), colX[2], y, { width: 50 });
    doc.text(`${Number(i.price || 0).toFixed(2)} €`, colX[3], y, { width: 60 });
    doc.text(i.caution ? `${Number(i.caution).toFixed(2)} €` : '—', colX[4], y, { width: 80 });
    doc.moveDown(0.6);
  });
  doc.moveDown(1);

  doc.font('Helvetica-Bold').fontSize(11).text('Conditions');
  doc.font('Helvetica').fontSize(9).fillColor('#333').text(
    'Le client reconnaît avoir lu et accepté le contrat de location d\'outillage ainsi que les conditions générales de vente du site (CGV, articles 6 à 8) préalablement à la signature ci-dessous. La caution indiquée, si applicable, est prise lors de la remise du matériel et restituée en fin de location si celui-ci est rendu complet et en bon état.',
    { align: 'justify' }
  );
  doc.moveDown(1.2);

  doc.fillColor('#111').font('Helvetica-Bold').fontSize(10).text('Signature du client :');
  doc.moveDown(0.3);
  if (c.signature && c.signature.startsWith('data:image')) {
    try {
      const base64 = c.signature.split(',')[1];
      const imgBuffer = Buffer.from(base64, 'base64');
      doc.image(imgBuffer, { fit: [220, 90] });
    } catch { doc.font('Helvetica').fontSize(9).text('(signature illisible)'); }
  } else {
    doc.font('Helvetica').fontSize(9).text('(aucune signature enregistrée)');
  }

  doc.end();
});

module.exports = router;
