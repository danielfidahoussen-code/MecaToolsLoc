// Notifications Telegram :
//   - Commandes d'outils
//   - Réservations de véhicules
//   - Messages du formulaire de contact
//
// Variables d'environnement (Railway) : TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
// Si elles manquent, la notification est simplement ignorée (aucune erreur).

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const SITE_URL = process.env.SITE_URL || 'https://www.prestolocation.re';

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
const FROM_HEADER = `Auto Presto - PrestoLocation <${MAIL_FROM}>`;

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
async function sendViaResend(to, subject, html, attachments = [], replyTo) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM_HEADER, to, subject, html,
      ...(replyTo ? { reply_to: replyTo } : {}),
      ...(attachments.length ? { attachments: attachments.map(a => ({ filename: a.filename, content: a.content.toString('base64') })) } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

async function sendCustomerEmail(to, subject, html, attachments = [], replyTo) {
  if (!to) return;
  if (!RESEND_API_KEY && !mailer) { console.warn('[NOTIFY] Email non configuré (RESEND_API_KEY ou SMTP) — ignoré'); return; }
  try {
    if (RESEND_API_KEY) await sendViaResend(to, subject, html, attachments, replyTo);
    else await mailer.sendMail({ from: FROM_HEADER, to, subject, html, attachments, ...(replyTo ? { replyTo } : {}) });
  } catch (err) {
    console.error('[NOTIFY] Erreur email client:', err.message);
  }
}

const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// En-tête wordmark PrestoLocation pour les emails (texte stylé, pas de SVG — compatibilité email fiable)
const PRESTOLOCATION_EMAIL_HEADER = `<div style="margin-bottom:22px;">` +
  `<span style="font-family:Arial,Helvetica,sans-serif;font-weight:900;font-style:italic;font-size:22px;letter-spacing:0.5px;color:#1a0202;">PRESTO</span>` +
  `<span style="font-family:Arial,Helvetica,sans-serif;font-weight:900;font-style:italic;font-size:22px;letter-spacing:0.5px;color:#ff3333;">LOCATION</span>` +
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
    `<b>Nouvelle commande PrestoLocation</b>\n\n` +
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

// Nouvelle demande de réservation véhicule (pas de paiement en ligne, tout se fait en personne)
async function notifyCarReservationRequest(r) {
  if (!r) return;
  const options = [
    r.delivery_out ? 'Livraison souhaitée' : null,
    r.delivery_in ? 'Récupération souhaitée' : null,
    r.booster ? 'Réhausseur' : null,
    r.baby_seat ? 'Siège bébé' : null,
  ].filter(Boolean).join(', ');

  const text =
    `<b>Nouvelle demande de réservation véhicule</b>\n` +
    `<i>(à traiter en personne — pas de paiement en ligne)</i>\n\n` +
    `Véhicule : <b>${esc(r.car_name) || '—'}</b>\n` +
    `Client : <b>${esc(r.customer_name) || '—'}</b>\n` +
    `Email : ${esc(r.customer_email) || '—'}\n` +
    `Téléphone : ${esc(r.customer_phone) || '—'}\n\n` +
    `Période : ${esc(r.start_date)} au ${esc(r.end_date)} (${r.days} jour${r.days > 1 ? 's' : ''})\n` +
    (options ? `Options : ${options}\n` : '') +
    `\n<b>Total estimé : ${Number(r.total || 0).toFixed(2)} €</b>`;

  await sendTelegram(text);
}

// Confirmation client — demande de réservation reçue
async function confirmCustomerCarRequest(r) {
  if (!r) return;
  const html =
    `<p>Bonjour ${esc(r.customer_name) || ''},</p>` +
    `<p>Nous avons bien reçu votre demande de réservation pour <strong>${esc(r.car_name)}</strong>, du ${esc(r.start_date)} au ${esc(r.end_date)} (${r.days} jour${r.days > 1 ? 's' : ''}).</p>` +
    `<p>Nous vous recontactons rapidement pour confirmer la disponibilité. Le paiement, le contrat et les modalités de livraison/récupération se règlent directement avec vous.</p>` +
    `<p>Une question ? Répondez à cet email ou appelez le 06 93 83 96 54.</p>` +
    `<p>À très vite,<br/>L'équipe Auto Presto — PrestoLocation</p>`;

  await sendCustomerEmail(r.customer_email, 'Votre demande de réservation — PrestoLocation', html);
}

// Message de contact
const CONTACT_RECIPIENT = process.env.CONTACT_EMAIL || 'contact@prestolocation.re';
async function notifyContactMessage({ name, email, phone, subject, message }) {
  const text =
    `<b>Nouveau message de contact</b>\n\n` +
    `Nom : <b>${esc(name) || '—'}</b>\n` +
    `Email : ${esc(email) || '—'}\n` +
    `Téléphone : ${esc(phone) || '—'}\n` +
    `Sujet : ${esc(subject) || '—'}\n\n` +
    `Message :\n${esc(message) || '—'}`;

  await sendTelegram(text);

  // Copie par email — Reply-To = le client, pour pouvoir répondre en un clic
  const html =
    `<p><strong>Nouveau message via le formulaire de contact du site.</strong></p>` +
    `<p>Nom : <strong>${esc(name) || '—'}</strong><br/>` +
    `Email : ${esc(email) || '—'}<br/>` +
    `Téléphone : ${esc(phone) || '—'}<br/>` +
    `Sujet : ${esc(subject) || '—'}</p>` +
    `<p>Message :<br/>${esc(message).replace(/\n/g, '<br/>') || '—'}</p>` +
    `<p style="color:#888;font-size:12px;">Répondez directement à cet email pour contacter le client.</p>`;
  await sendCustomerEmail(CONTACT_RECIPIENT, `Contact site — ${esc(subject) || esc(name) || 'Nouveau message'}`, html, [], email);
}

// Confirmation client — commande d'outils
// `contract` (optionnel) : enregistrement rental_contracts déjà signé -> joint en PDF à l'email.
async function confirmCustomerOrder({ id, customer_name, customer_email, customer_address, items, total_price, deposit_amount, balance_due, cancel_token, contract }) {
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
  const hasDeposit = Number(deposit_amount) > 0;

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

  const paiement = hasDeposit
    ? `<p><strong>Acompte payé : ${Number(deposit_amount).toFixed(2)} €</strong> (20% du total)<br/>Solde à régler en personne à la remise du matériel : <strong>${Number(balance_due || 0).toFixed(2)} €</strong></p>`
    : `<p><strong>Total payé : ${Number(total_price || 0).toFixed(2)} €</strong></p>`;
  const cancelLink = (hasDeposit && cancel_token && id)
    ? `<p style="color:#666;font-size:13px;">Besoin d'annuler ? <a href="${SITE_URL}/annulation-commande/${id}/${cancel_token}">Annulez votre commande ici</a>. Gratuite jusqu'à 2 jours avant le début de la location — au-delà, l'acompte reste acquis.</p>`
    : '';

  const html =
    PRESTOLOCATION_EMAIL_HEADER +
    `<p>Bonjour ${esc(customer_name) || ''},</p>` +
    `<p>Merci pour votre commande chez <strong>PrestoLocation</strong> (Auto Presto). Voici le récapitulatif :</p>` +
    `<ul>${lignes || '<li>—</li>'}</ul>` +
    paiement +
    recup +
    (aRent ? `<p><strong>Pour votre location :</strong> merci de vous munir d'une <strong>pièce d'identité</strong> et d'un <strong>moyen de caution</strong> (carte bancaire ou chèque). La caution est prise lors de la remise du matériel et n'est pas débitée si le matériel est rendu en bon état.</p>` : '') +
    (attachments.length ? `<p>Vous trouverez en pièce jointe une copie de votre <strong>contrat de location signé</strong>.</p>` : '') +
    cancelLink +
    `<p>Une question ? Répondez à cet email ou appelez le 06 93 83 96 54.</p>` +
    `<p>À très vite,<br/>L'équipe Auto Presto — PrestoLocation</p>`;

  await sendCustomerEmail(customer_email, 'Confirmation de votre commande — PrestoLocation', html, attachments);
}

// Confirmation client — réservation véhicule
async function confirmCustomerCarReservation(r) {
  if (!r) return;
  const recup = r.delivery
    ? `<p><strong>Livraison prévue à :</strong> ${esc(r.delivery_address) || 'votre adresse'}. Nous vous contacterons pour le créneau.</p>`
    : `<p><strong>Retrait sur place :</strong> 3B rue de la Guadeloupe, Moufia, 97490 Saint-Denis.</p>`;
  const hasDeposit = Number(r.deposit_amount) > 0;
  const paiement = hasDeposit
    ? `<p><strong>Acompte payé : ${Number(r.deposit_amount).toFixed(2)} €</strong> (20% du total)<br/>Solde à régler en personne à la remise du véhicule : <strong>${Number(r.balance_due || 0).toFixed(2)} €</strong></p>`
    : `<p><strong>Total payé : ${Number(r.total || 0).toFixed(2)} €</strong></p>`;
  const cancelLink = r.cancel_token
    ? `<p style="color:#666;font-size:13px;">Besoin d'annuler ? <a href="${SITE_URL}/annulation-vehicule/${r.id}/${r.cancel_token}">Annulez votre réservation ici</a>. Gratuite jusqu'à 2 jours avant le début de la location — au-delà, l'acompte reste acquis.</p>`
    : '';
  const html =
    `<p>Bonjour ${esc(r.customer_name) || ''},</p>` +
    `<p>Votre réservation de véhicule chez <strong>PrestoLoc</strong> (Auto Presto) est confirmée :</p>` +
    `<ul><li><strong>${esc(r.car_name)}</strong></li>` +
    `<li>Du ${esc(r.start_date)} au ${esc(r.end_date)} (${r.days} jour${r.days > 1 ? 's' : ''})</li></ul>` +
    paiement +
    recup +
    `<p>Merci de vous munir de votre <strong>permis de conduire</strong>, d'une <strong>pièce d'identité</strong> et d'un <strong>moyen de caution</strong>. L'état du véhicule et la caution seront vérifiés lors de la remise des clés.</p>` +
    cancelLink +
    `<p>Une question ? Répondez à cet email ou appelez le 06 93 83 96 54.</p>` +
    `<p>À très vite,<br/>L'équipe Auto Presto — PrestoLoc</p>`;

  await sendCustomerEmail(r.customer_email, 'Confirmation de votre location — PrestoLoc', html);
}

const emailConfigured = () => !!(RESEND_API_KEY || mailer);
async function sendEmailTest(to) {
  await sendCustomerEmail(to, 'Test email — Auto Presto / PrestoLocation',
    '<p>Si vous recevez cet email, l\'envoi des confirmations de commande par email fonctionne correctement.</p>');
}
// Diagnostic : tente un envoi RÉEL en remontant l'erreur exacte
async function emailDiagnostic(to) {
  const provider = RESEND_API_KEY ? 'resend' : (mailer ? 'smtp' : null);
  if (!provider) return { configured: false, error: 'Ni RESEND_API_KEY ni SMTP configurés sur Railway' };
  if (!to) return { configured: true, provider, sent: false, message: 'Configuré. Ajoute ?email=... pour tester un envoi réel.' };
  try {
    if (RESEND_API_KEY) await sendViaResend(to, 'Test email — Auto Presto / PrestoLocation', '<p>Si vous recevez cet email, l\'envoi fonctionne correctement.</p>');
    else await mailer.sendMail({ from: FROM_HEADER, to, subject: 'Test email — Auto Presto / PrestoLocation', html: '<p>Test.</p>' });
    return { configured: true, provider, sent: true, from: MAIL_FROM, message: `Email réellement envoyé à ${to}.` };
  } catch (err) {
    return { configured: true, provider, sent: false, from: MAIL_FROM, error: err.message };
  }
}

const telegramConfigured = () => !!(BOT_TOKEN && CHAT_ID);
async function sendTelegramTest() {
  await sendTelegram('Test PrestoLocation : si tu vois ce message, les notifications Telegram fonctionnent (commandes, réservations et contact).');
}

module.exports = {
  notifyNewOrder, notifyNewCarReservation, notifyContactMessage,
  confirmCustomerOrder, confirmCustomerCarReservation,
  notifyCarReservationRequest, confirmCustomerCarRequest,
  telegramConfigured, sendTelegramTest,
  emailConfigured, sendEmailTest, emailDiagnostic,
};
