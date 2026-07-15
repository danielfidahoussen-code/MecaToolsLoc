const PDFDocument = require('pdfkit');

// Dessine le logo LVTools (engrenage + clé + wordmark), identique au composant client Logo.jsx,
// à la position (x, y) avec une hauteur d'icône ~ size (en points PDF).
function drawLogo(doc, x, y, size = 32) {
  const scale = size / 48; // le SVG source est en viewBox 0 0 48 48
  const red = '#ff3333';
  const dark = '#1a0202';

  doc.save();
  doc.translate(x, y);
  doc.scale(scale, scale);

  // Engrenage (symbole mécanique)
  doc.path('M 24.00,7.00 L 28.97,11.99 L 36.02,11.98 L 36.01,19.03 L 41.00,24.00 L 36.01,28.97 L 36.02,36.02 L 28.97,36.01 L 24.00,41.00 L 19.03,36.01 L 11.98,36.02 L 11.99,28.97 L 7.00,24.00 L 11.99,19.03 L 11.98,11.98 L 19.03,11.99 Z M 17.5,24 A 6.5,6.5 0 1,0 30.5,24 A 6.5,6.5 0 1,0 17.5,24 Z')
    .fillColor(dark).fill('even-odd');

  // Clé qui traverse en diagonale (symbole outillage)
  doc.save();
  doc.translate(24, 24);
  doc.rotate(-45);
  doc.roundedRect(-9.5, -1.7, 19, 3.4, 1.7).fillColor(red).fill();
  doc.restore();
  doc.path('M 10.00,32.50 L 14.76,35.25 L 14.76,40.75 L 10.00,43.50 L 5.24,40.75 L 5.24,35.25 Z M 7,38 A 3,3 0 1,0 13,38 A 3,3 0 1,0 7,38 Z')
    .fillColor(red).fill('even-odd');
  doc.path('M 38.00,4.50 L 42.76,7.25 L 42.76,12.75 L 38.00,15.50 L 33.24,12.75 L 33.24,7.25 Z M 35,10 A 3,3 0 1,0 41,10 A 3,3 0 1,0 35,10 Z')
    .fillColor(red).fill('even-odd');

  doc.restore();

  // Wordmark texte, à droite de l'icône
  const textX = x + size + 8;
  const lvFontSize = size * 0.42;
  doc.font('Helvetica-Bold').fontSize(lvFontSize);
  doc.fillColor('#1a0202').text('LV', textX, y + size * 0.08, { continued: true, lineBreak: false });
  doc.fillColor(red).text('Tools', { lineBreak: false });
  doc.font('Helvetica').fontSize(size * 0.17).fillColor('#8a7a7a')
    .text('LOCATION · VENTE · OUTILLAGE', textX, y + size * 0.62, { lineBreak: false, characterSpacing: 0.5 });
}

// Construit le PDF du contrat de location d'outillage et le retourne en Buffer
// (réutilisé à la fois pour le téléchargement admin et pour la pièce jointe email client).
function buildRentalContractPdf(c) {
  return new Promise((resolve, reject) => {
    let items = []; try { items = JSON.parse(c.items || '[]'); } catch {}
    const signedAt = c.signed_at ? new Date(c.signed_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

    const MARGIN = 50;
    const doc = new PDFDocument({ size: 'A4', margin: MARGIN });
    const pageWidth = doc.page.width - MARGIN * 2;
    const chunks = [];
    doc.on('data', (d) => chunks.push(d));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Toujours ancrer le curseur à la marge gauche avant un bloc pleine largeur —
    // sinon PDFKit hérite de la position/largeur du dernier texte positionné (colonnes du tableau).
    const fullWidthText = (text, opts = {}) => doc.text(text, MARGIN, doc.y, { width: pageWidth, ...opts });

    // En-tête : logo LVTools + titre du contrat
    drawLogo(doc, MARGIN, MARGIN, 32);
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#111')
      .text(`Contrat de location d'outillage N°${c.id}`, MARGIN, MARGIN + 46, { width: pageWidth, align: 'center' });
    doc.font('Helvetica').fontSize(10).fillColor('#666').text('Auto Presto', MARGIN, doc.y + 2, { width: pageWidth, align: 'center' });
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
}

module.exports = { buildRentalContractPdf };
