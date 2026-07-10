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

  const MARGIN = 50;
  const doc = new PDFDocument({ size: 'A4', margin: MARGIN });
  const pageWidth = doc.page.width - MARGIN * 2;
  doc.pipe(res);

  // Toujours ancrer le curseur à la marge gauche avant un bloc pleine largeur —
  // sinon PDFKit hérite de la position/largeur du dernier texte positionné (colonnes du tableau).
  const fullWidthText = (text, opts = {}) => doc.text(text, MARGIN, doc.y, { width: pageWidth, ...opts });

  // En-tête
  doc.font('Helvetica-Bold').fontSize(16).fillColor('#111').text(`Contrat de location d'outillage N°${c.id}`, MARGIN, MARGIN, { width: pageWidth, align: 'center' });
  doc.font('Helvetica').fontSize(10).fillColor('#666').text('Auto Presto / LVTools', MARGIN, doc.y + 2, { width: pageWidth, align: 'center' });
  doc.moveDown(1.5);

  // Bloc client
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#111');
  fullWidthText('Client');
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(10).fillColor('#333');
  fullWidthText(`Nom : ${c.customer_name}`);
  fullWidthText(`Email : ${c.customer_email}`);
  fullWidthText(`Téléphone : ${c.customer_phone || '—'}`);
  fullWidthText(`Signé le : ${signedAt}    IP : ${c.ip || '—'}`);
  doc.moveDown(1);

  // Tableau des articles loués
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#111');
  fullWidthText('Articles loués');
  doc.moveDown(0.4);

  const cols = [
    { label: 'Outil',    x: MARGIN,       width: 160 },
    { label: 'Période',  x: MARGIN + 165, width: 120 },
    { label: 'Qté',      x: MARGIN + 290, width: 35 },
    { label: 'Prix',     x: MARGIN + 330, width: 65 },
    { label: 'Caution',  x: MARGIN + 400, width: 95 },
  ];
  const headerHeight = 22;
  const rowHeight = 34; // assez haut pour la période affichée sur 2 lignes
  const tableTop = doc.y;

  const drawRow = (y, cells, opts = {}) => {
    cols.forEach((col, i) => doc.text(cells[i], col.x + 4, y + 8, { width: col.width - 8, ...opts }));
  };

  // En-tête du tableau
  doc.rect(MARGIN, tableTop, pageWidth, headerHeight).fill('#f4f4f4');
  doc.fillColor('#111').font('Helvetica-Bold').fontSize(9);
  drawRow(tableTop, cols.map(c => c.label));

  // Lignes
  doc.font('Helvetica').fontSize(9).fillColor('#333');
  let y = tableTop + headerHeight;
  items.forEach(i => {
    const periode = i.rentDates ? `${i.rentDates.startDate}\nau ${i.rentDates.endDate}` : '—';
    drawRow(y, [
      i.name || `Produit #${i.id}`,
      periode,
      String(i.quantity || 1),
      `${Number(i.price || 0).toFixed(2)} €`,
      i.caution ? `${Number(i.caution).toFixed(2)} €` : '—',
    ]);
    doc.moveTo(MARGIN, y).lineTo(MARGIN + pageWidth, y).strokeColor('#e0e0e0').stroke();
    y += rowHeight;
  });

  const tableBottom = y;

  // Grille : bordure extérieure + séparateurs de colonnes
  doc.rect(MARGIN, tableTop, pageWidth, tableBottom - tableTop).strokeColor('#ccc').stroke();
  cols.slice(1).forEach(col => {
    doc.moveTo(col.x, tableTop).lineTo(col.x, tableBottom).strokeColor('#e0e0e0').stroke();
  });
  doc.moveTo(MARGIN, tableTop + headerHeight).lineTo(MARGIN + pageWidth, tableTop + headerHeight).strokeColor('#ccc').stroke();

  doc.x = MARGIN;
  doc.y = tableBottom + 20;

  // Conditions
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#111');
  fullWidthText('Conditions');
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(9).fillColor('#333');
  fullWidthText(
    "Le client reconnaît avoir lu et accepté le contrat de location d'outillage ainsi que les conditions générales de vente du site (CGV, articles 6 à 8) préalablement à la signature ci-dessous. La caution indiquée, si applicable, est prise lors de la remise du matériel et restituée en fin de location si celui-ci est rendu complet et en bon état.",
    { align: 'justify' }
  );
  doc.moveDown(1.5);

  // Signature
  doc.x = MARGIN;
  doc.fillColor('#111').font('Helvetica-Bold').fontSize(10);
  fullWidthText('Signature du client :');
  doc.moveDown(0.4);
  const sigBoxY = doc.y;
  doc.rect(MARGIN, sigBoxY, 240, 100).stroke('#ccc');
  if (c.signature && c.signature.startsWith('data:image')) {
    try {
      const base64 = c.signature.split(',')[1];
      const imgBuffer = Buffer.from(base64, 'base64');
      doc.image(imgBuffer, MARGIN + 10, sigBoxY + 10, { fit: [220, 80] });
    } catch {
      doc.font('Helvetica').fontSize(9).text('(signature illisible)', MARGIN + 10, sigBoxY + 40);
    }
  } else {
    doc.font('Helvetica').fontSize(9).text('(aucune signature enregistrée)', MARGIN + 10, sigBoxY + 40);
  }

  doc.end();
});

module.exports = router;
