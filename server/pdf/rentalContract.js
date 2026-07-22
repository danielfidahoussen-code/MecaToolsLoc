const PDFDocument = require('pdfkit');
const path = require('path');

const LOGO_PATH = path.join(__dirname, '../../client/public/logo-prestolocation.png');
const LOGO_ASPECT = 1184 / 91; // largeur / hauteur du PNG source (wordmark)

// Dessine le logo PrestoLocation (image du wordmark), à la position (x, y)
// avec une hauteur ~ size (en points PDF).
function drawLogo(doc, x, y, size = 18) {
  doc.image(LOGO_PATH, x, y, { height: size, width: size * LOGO_ASPECT });
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

    // En-tête : logo PrestoLocation + titre du contrat
    drawLogo(doc, MARGIN, MARGIN, 18);
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#111')
      .text(`Contrat de location d'outillage N°${c.id}`, MARGIN, MARGIN + 46, { width: pageWidth, align: 'center' });
    doc.font('Helvetica').fontSize(10).fillColor('#666').text('PrestoLocation', MARGIN, doc.y + 2, { width: pageWidth, align: 'center' });
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
