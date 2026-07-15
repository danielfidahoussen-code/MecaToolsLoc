// Notifications Telegram :
//   - Commandes d'outils
//   - Réservations de véhicules
//   - Messages du formulaire de contact
//
// Variables d'environnement (Railway) : TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
// Si elles manquent, la notification est simplement ignorée (aucune erreur).

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegram(text) {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('[NOTIFY] Telegram non configuré (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID) — notification ignorée');
    return;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
    if (!res.ok) console.error('[NOTIFY] Échec Telegram:', res.status, await res.text());
  } catch (err) {
    console.error('[NOTIFY] Erreur Telegram:', err.message);
  }
}

// ---------- Email de confirmation au CLIENT ----------
// Recommandé sur Railway : Resend via API HTTP (port 443, non bloqué).
//   RESEND_API_KEY = clé API Resend (re_...)
//   MAIL_FROM      = adresse d'envoi (ex. onboarding@resend.dev pour démarrer,
//                    ou contact@ton-domaine une fois le domaine vérifié)
// Le SMTP (Gmail/autre) reste possible mais Railway bloque souvent les ports SMTP.
const nodemailer = require('nodemailer');
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const MAIL_FROM = process.env.MAIL_FROM || (RESEND_API_KEY ? 'onboarding@resend.dev' : SMTP_USER);
const FROM_HEADER = `Auto Presto - LVTools <${MAIL_FROM}>`;

let mailer = null;
if (!RESEND_API_KEY) {
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    mailer = nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT) || 587, secure: Number(SMTP_PORT) === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } });
  } else if (SMTP_USER && SMTP_PASS) {
    mailer = nodemailer.createTransport({ service: 'gmail', auth: { user: SMTP_USER, pass: SMTP_PASS } });
  }
}

// Envoi via l'API HTTP de Resend (lève une erreur en cas d'échec)
// attachments: [{ filename, content: Buffer }]
async function sendViaResend(to, subject, html, attachments = []) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM_HEADER, to, subject, html,
      ...(attachments.length ? { attachments: attachments.map(a => ({ filename: a.filename, content: a.content.toString('base64') })) } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

async function sendCustomerEmail(to, subject, html, attachments = []) {
  if (!to) return;
  if (!RESEND_API_KEY && !mailer) { console.warn('[NOTIFY] Email non configuré (RESEND_API_KEY ou SMTP) — ignoré'); return; }
  try {
    if (RESEND_API_KEY) await sendViaResend(to, subject, html, attachments);
    else await mailer.sendMail({ from: FROM_HEADER, to, subject, html, attachments });
  } catch (err) {
    console.error('[NOTIFY] Erreur email client:', err.message);
  }
}

const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// En-tête wordmark LVTools pour les emails (texte stylé, pas de SVG — compatibilité email fiable)
const LVTOOLS_EMAIL_HEADER = `<div style="margin-bottom:22px;">` +
  `<span style="font-family:Arial,Helvetica,sans-serif;font-weight:900;font-size:22px;letter-spacing:1px;color:#f7941d;">LV</span>` +
  `<span style="font-family:Arial,Helvetica,sans-serif;font-weight:900;font-size:22px;letter-spacing:1px;color:#1a0202;">TOOLS</span>` +
  `<div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:1.5px;color:#8a7a7a;text-transform:uppercase;margin-top:2px;">Location · Vente · Outillage</div>` +
  `</div>`;

// Commande d'outils
async function notifyNewOrder({ customer_name, customer_email, customer_phone, customer_address, items, total_price, caution_total }) {
  const lignes = (items || []).map(i => {
    const type = i.type === 'rent' ? 'Location' : 'Achat';
    const dates = (i.start || i.rentDates?.startDate)
      ? ` (${i.start || i.rentDates?.startDate} au ${i.end || i.rentDates?.endDate})`
      : '';
    const nom = i.name ? esc(i.name) : `Produit #${i.id}`;
    return `- ${type} — ${nom} x${i.qty || i.quantity || 1}${dates}`;
  }).join('\n');

  const livraison = customer_address && customer_address !== 'Retrait sur place'
    ? `Livraison : ${esc(customer_address)}`
    : 'Retrait sur place';

  const text =
    `<b>Nouvelle commande LVTools</b>\n\n` +
    `Client : <b>${esc(customer_name) || '—'}</b>\n` +
    `Email : ${esc(customer_email) || '—'}\n` +
    `Téléphone : ${esc(customer_phone) || '—'}\n` +
    `${livraison}\n\n` +
    `<b>Articles :</b>\n${lignes || '—'}\n\n` +
    `<b>Total payé : ${Number(total_price || 0).toFixed(2)} €</b>` +
    (Number(caution_total) > 0 ? `\nCaution à collecter à la remise : ${Number(caution_total).toFixed(2)} €` : '');

  await sendTelegram(text);
}

// Réservation de véhicule
async function notifyNewCarReservation(r) {
  if (!r) return;
  const livraison = r.delivery ? `Livraison : ${esc(r.delivery_address) || 'à domicile'}` : 'Retrait sur place';

  const text =
    `<b>Nouvelle réservation véhicule</b>\n\n` +
    `Véhicule : <b>${esc(r.car_name) || '—'}</b>\n` +
    `Client : <b>${esc(r.customer_name) || '—'}</b>\n` +
    `Email : ${esc(r.customer_email) || '—'}\n` +
    `Téléphone : ${esc(r.customer_phone) || '—'}\n\n` +
    `Période : ${esc(r.start_date)} au ${esc(r.end_date)} (${r.days} jour${r.days > 1 ? 's' : ''})\n` +
    `${livraison}\n\n` +
    `<b>Total payé : ${Number(r.total || 0).toFixed(2)} €</b>` +
    (Number(r.caution_amount) > 0 ? `\nCaution : ${Number(r.caution_amount).toFixed(2)} €` : '');

  await sendTelegram(text);
}

// Message de contact
async function notifyContactMessage({ name, email, phone, subject, message }) {
  const text =
    `<b>Nouveau message de contact</b>\n\n` +
    `Nom : <b>${esc(name) || '—'}</b>\n` +
    `Email : ${esc(email) || '—'}\n` +
    `Téléphone : ${esc(phone) || '—'}\n` +
    `Sujet : ${esc(subject) || '—'}\n\n` +
    `Message :\n${esc(message) || '—'}`;

  await sendTelegram(text);
}

// Confirmation client — commande d'outils
// `contract` (optionnel) : enregistrement rental_contracts déjà signé -> joint en PDF à l'email.
async function confirmCustomerOrder({ customer_name, customer_email, customer_address, items, total_price, contract }) {
  const lignes = (items || []).map(i => {
    const type = i.type === 'rent' ? 'Location' : 'Achat';
    const dates = (i.start || i.rentDates?.startDate) ? ` — du ${i.start || i.rentDates?.startDate} au ${i.end || i.rentDates?.endDate}` : '';
    return `<li>${type} : ${esc(i.name) || 'Produit'} × ${i.qty || i.quantity || 1}${dates}</li>`;
  }).join('');
  const isPickup = !customer_address || customer_address === 'Retrait sur place';
  const recup = isPickup
    ? `<p><strong>Retrait sur place :</strong> 3B rue de la Guadeloupe, Moufia, 97490 Saint-Denis. Du lundi au samedi, 8h–18h.</p>`
    : `<p><strong>Livraison prévue à :</strong> ${esc(customer_address)}. Nous vous contacterons pour convenir du créneau.</p>`;
  const aRent = (items || []).some(i => i.type === 'rent');

  let attachments = [];
  if (contract) {
    try {
      const { buildRentalContractPdf } = require('./pdf/rentalContract');
      const buffer = await buildRentalContractPdf(contract);
      attachments = [{ filename: `contrat-location-outillage-${contract.id}.pdf`, content: buffer }];
    } catch (err) {
      console.error('[NOTIFY] Génération PDF contrat (email client) échouée:', err.message);
    }
  }

  const html =
    LVTOOLS_EMAIL_HEADER +
    `<p>Bonjour ${esc(customer_name) || ''},</p>` +
    `<p>Merci pour votre commande chez <strong>LVTools</strong> (Auto Presto). Voici le récapitulatif :</p>` +
    `<ul>${lignes || '<li>—</li>'}</ul>` +
    `<p><strong>Total payé : ${Number(total_price || 0).toFixed(2)} €</strong></p>` +
    recup +
    (aRent ? `<p><strong>Pour votre location :</strong> merci de vous munir d'une <strong>pièce d'identité</strong> et d'un <strong>moyen de caution</strong> (carte bancaire ou chèque). La caution est prise lors de la remise du matériel et n'est pas débitée si le matériel est rendu en bon état.</p>` : '') +
    (attachments.length ? `<p>Vous trouverez en pièce jointe une copie de votre <strong>contrat de location signé</strong>.</p>` : '') +
    `<p>Une question ? Répondez à cet email ou appelez le 06 93 83 96 54.</p>` +
    `<p>À très vite,<br/>L'équipe Auto Presto — LVTools</p>`;

  await sendCustomerEmail(customer_email, 'Confirmation de votre commande — LVTools', html, attachments);
}

// Confirmation client — réservation véhicule
async function confirmCustomerCarReservation(r) {
  if (!r) return;
  const recup = r.delivery
    ? `<p><strong>Livraison prévue à :</strong> ${esc(r.delivery_address) || 'votre adresse'}. Nous vous contacterons pour le créneau.</p>`
    : `<p><strong>Retrait sur place :</strong> 3B rue de la Guadeloupe, Moufia, 97490 Saint-Denis.</p>`;
  const html =
    `<p>Bonjour ${esc(r.customer_name) || ''},</p>` +
    `<p>Votre réservation de véhicule chez <strong>PrestoLoc</strong> (Auto Presto) est confirmée :</p>` +
    `<ul><li><strong>${esc(r.car_name)}</strong></li>` +
    `<li>Du ${esc(r.start_date)} au ${esc(r.end_date)} (${r.days} jour${r.days > 1 ? 's' : ''})</li></ul>` +
    `<p><strong>Total payé : ${Number(r.total || 0).toFixed(2)} €</strong></p>` +
    recup +
    `<p>Merci de vous munir de votre <strong>permis de conduire</strong>, d'une <strong>pièce d'identité</strong> et d'un <strong>moyen de caution</strong>. L'état du véhicule et la caution seront vérifiés lors de la remise des clés.</p>` +
    `<p>Une question ? Répondez à cet email ou appelez le 06 93 83 96 54.</p>` +
    `<p>À très vite,<br/>L'équipe Auto Presto — PrestoLoc</p>`;

  await sendCustomerEmail(r.customer_email, 'Confirmation de votre location — PrestoLoc', html);
}

const emailConfigured = () => !!(RESEND_API_KEY || mailer);
async function sendEmailTest(to) {
  await sendCustomerEmail(to, 'Test email — Auto Presto / LVTools',
    '<p>Si vous recevez cet email, l\'envoi des confirmations de commande par email fonctionne correctement.</p>');
}
// Diagnostic : tente un envoi RÉEL en remontant l'erreur exacte
async function emailDiagnostic(to) {
  const provider = RESEND_API_KEY ? 'resend' : (mailer ? 'smtp' : null);
  if (!provider) return { configured: false, error: 'Ni RESEND_API_KEY ni SMTP configurés sur Railway' };
  if (!to) return { configured: true, provider, sent: false, message: 'Configuré. Ajoute ?email=... pour tester un envoi réel.' };
  try {
    if (RESEND_API_KEY) await sendViaResend(to, 'Test email — Auto Presto / LVTools', '<p>Si vous recevez cet email, l\'envoi fonctionne correctement.</p>');
    else await mailer.sendMail({ from: FROM_HEADER, to, subject: 'Test email — Auto Presto / LVTools', html: '<p>Test.</p>' });
    return { configured: true, provider, sent: true, from: MAIL_FROM, message: `Email réellement envoyé à ${to}.` };
  } catch (err) {
    return { configured: true, provider, sent: false, from: MAIL_FROM, error: err.message };
  }
}

const telegramConfigured = () => !!(BOT_TOKEN && CHAT_ID);
async function sendTelegramTest() {
  await sendTelegram('Test LVTools : si tu vois ce message, les notifications Telegram fonctionnent (commandes, réservations et contact).');
}

module.exports = {
  notifyNewOrder, notifyNewCarReservation, notifyContactMessage,
  confirmCustomerOrder, confirmCustomerCarReservation,
  telegramConfigured, sendTelegramTest,
  emailConfigured, sendEmailTest, emailDiagnostic,
};
