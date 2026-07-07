// Notifications :
//   - Commandes d'outils + réservations véhicules  -> Telegram
//   - Messages du formulaire de contact            -> Email
//
// Variables d'environnement (Railway) :
//   Telegram : TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
//   Email    : SMTP_USER, SMTP_PASS, NOTIFY_EMAIL (optionnel, défaut = SMTP_USER)
// Si les variables d'un canal manquent, ce canal est simplement ignoré (aucune erreur).

const nodemailer = require('nodemailer');

// ---------- Telegram (commandes / réservations) ----------
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

// ---------- Email (formulaire de contact) ----------
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || SMTP_USER;

let transporter = null;
if (SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: SMTP_USER, pass: SMTP_PASS } });
}

async function sendEmail(subject, html) {
  if (!transporter) {
    console.warn('[NOTIFY] Email non configuré (SMTP_USER / SMTP_PASS) — notification ignorée');
    return;
  }
  try {
    await transporter.sendMail({ from: `"LVTools" <${SMTP_USER}>`, to: NOTIFY_EMAIL, subject, html });
  } catch (err) {
    console.error('[NOTIFY] Erreur email:', err.message);
  }
}

const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const row = (label, val) => `<tr><td style="padding:4px 12px 4px 0;color:#666;">${label}</td><td style="padding:4px 0;font-weight:600;">${val || '—'}</td></tr>`;

// Commande d'outils -> Telegram
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

// Réservation de véhicule -> Telegram
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

// Message de contact -> Email
async function notifyContactMessage({ name, email, phone, subject, message }) {
  const html =
    `<h2>Nouveau message de contact</h2>` +
    `<table style="font-size:14px;border-collapse:collapse;">` +
    row('Nom', `<b>${esc(name)}</b>`) +
    row('Email', esc(email)) +
    row('Téléphone', esc(phone)) +
    row('Sujet', esc(subject)) +
    `</table>` +
    `<h3>Message</h3><p style="font-size:14px;white-space:pre-line;">${esc(message)}</p>`;

  await sendEmail(`Contact — ${subject || 'message'} de ${name || ''}`, html);
}

const emailConfigured = () => !!transporter;
const telegramConfigured = () => !!(BOT_TOKEN && CHAT_ID);

async function sendEmailTest() {
  await sendEmail('Test LVTools', '<p>Si tu reçois cet email, les notifications de contact par email fonctionnent.</p>');
}
async function sendTelegramTest() {
  await sendTelegram('Test LVTools : si tu vois ce message, les notifications de commandes/réservations fonctionnent.');
}

module.exports = {
  notifyNewOrder, notifyNewCarReservation, notifyContactMessage,
  emailConfigured, telegramConfigured, sendEmailTest, sendTelegramTest,
};
