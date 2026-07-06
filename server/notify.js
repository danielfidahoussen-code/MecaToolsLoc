// Notification par email — envoie un email au propriétaire à chaque commande / réservation / message.
// Configurer les variables d'environnement (Railway) :
//   SMTP_USER      → ton adresse Gmail (ex: Locationautopresto@gmail.com)
//   SMTP_PASS      → un "mot de passe d'application" Google (16 lettres, PAS ton mot de passe habituel)
//   NOTIFY_EMAIL   → (optionnel) adresse qui reçoit les notifs. Par défaut = SMTP_USER
// Si SMTP_USER / SMTP_PASS manquent, la notification est simplement ignorée (aucune erreur).

const nodemailer = require('nodemailer');

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || SMTP_USER;

let transporter = null;
if (SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

async function sendEmail(subject, html) {
  if (!transporter) {
    console.warn('[NOTIFY] Email non configuré (SMTP_USER / SMTP_PASS) — notification ignorée');
    return;
  }
  try {
    await transporter.sendMail({
      from: `"LVTools" <${SMTP_USER}>`,
      to: NOTIFY_EMAIL,
      subject,
      html,
    });
  } catch (err) {
    console.error('[NOTIFY] Erreur email:', err.message);
  }
}

const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const row = (label, val) => `<tr><td style="padding:4px 12px 4px 0;color:#666;">${label}</td><td style="padding:4px 0;font-weight:600;">${val || '—'}</td></tr>`;

// Notifie une nouvelle commande d'outils
async function notifyNewOrder({ customer_name, customer_email, customer_phone, customer_address, items, total_price, caution_total }) {
  const lignes = (items || []).map(i => {
    const type = i.type === 'rent' ? 'Location' : 'Achat';
    const dates = (i.start || i.rentDates?.startDate)
      ? ` (${i.start || i.rentDates?.startDate} au ${i.end || i.rentDates?.endDate})`
      : '';
    const nom = i.name ? esc(i.name) : `Produit #${i.id}`;
    return `<li>${type} — ${nom} x${i.qty || i.quantity || 1}${dates}</li>`;
  }).join('');

  const livraison = customer_address && customer_address !== 'Retrait sur place'
    ? `Livraison : ${esc(customer_address)}`
    : 'Retrait sur place';

  const html =
    `<h2>Nouvelle commande LVTools</h2>` +
    `<table style="font-size:14px;border-collapse:collapse;">` +
    row('Client', `<b>${esc(customer_name)}</b>`) +
    row('Email', esc(customer_email)) +
    row('Téléphone', esc(customer_phone)) +
    row('Récupération', livraison) +
    `</table>` +
    `<h3>Articles</h3><ul style="font-size:14px;">${lignes || '<li>—</li>'}</ul>` +
    `<p style="font-size:16px;"><b>Total payé : ${Number(total_price || 0).toFixed(2)} €</b></p>` +
    (Number(caution_total) > 0 ? `<p style="font-size:14px;">Caution à collecter à la remise : ${Number(caution_total).toFixed(2)} €</p>` : '');

  await sendEmail(`Nouvelle commande — ${customer_name || 'client'} (${Number(total_price || 0).toFixed(2)} €)`, html);
}

// Notifie une nouvelle réservation de véhicule
async function notifyNewCarReservation(r) {
  if (!r) return;
  const livraison = r.delivery
    ? `Livraison : ${esc(r.delivery_address) || 'à domicile'}`
    : 'Retrait sur place';

  const html =
    `<h2>Nouvelle réservation véhicule</h2>` +
    `<table style="font-size:14px;border-collapse:collapse;">` +
    row('Véhicule', `<b>${esc(r.car_name)}</b>`) +
    row('Client', `<b>${esc(r.customer_name)}</b>`) +
    row('Email', esc(r.customer_email)) +
    row('Téléphone', esc(r.customer_phone)) +
    row('Période', `${esc(r.start_date)} au ${esc(r.end_date)} (${r.days} jour${r.days > 1 ? 's' : ''})`) +
    row('Récupération', livraison) +
    `</table>` +
    `<p style="font-size:16px;"><b>Total payé : ${Number(r.total || 0).toFixed(2)} €</b></p>` +
    (Number(r.caution_amount) > 0 ? `<p style="font-size:14px;">Caution : ${Number(r.caution_amount).toFixed(2)} €</p>` : '');

  await sendEmail(`Nouvelle réservation véhicule — ${r.car_name || ''} (${r.customer_name || ''})`, html);
}

// Notifie un nouveau message envoyé via le formulaire de contact
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

// Test de configuration
async function sendTest() {
  await sendEmail('Test LVTools', '<p>Si tu reçois cet email, les notifications par email fonctionnent correctement.</p>');
}

const isConfigured = () => !!transporter;

module.exports = { sendEmail, sendTest, isConfigured, notifyNewOrder, notifyNewCarReservation, notifyContactMessage };
