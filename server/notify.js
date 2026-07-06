// Notification Telegram — envoie un message au propriétaire à chaque commande.
// Configurer 2 variables d'environnement :
//   TELEGRAM_BOT_TOKEN  → jeton du bot (donné par @BotFather)
//   TELEGRAM_CHAT_ID    → identifiant de ton chat (donné par @userinfobot)
// Si l'une manque, la notification est simplement ignorée (aucune erreur).

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
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error('[NOTIFY] Échec Telegram:', res.status, body);
    }
  } catch (err) {
    console.error('[NOTIFY] Erreur Telegram:', err.message);
  }
}

const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Notifie une nouvelle commande d'outils
async function notifyNewOrder({ customer_name, customer_email, customer_phone, customer_address, items, total_price, delivery_mode, caution_total }) {
  const lignes = (items || []).map(i => {
    const type = i.type === 'rent' ? '📅 Location' : '🛒 Achat';
    const dates = (i.start || i.rentDates?.startDate)
      ? ` (${i.start || i.rentDates?.startDate} → ${i.end || i.rentDates?.endDate})`
      : '';
    const nom = i.name ? esc(i.name) : `Produit #${i.id}`;
    return `• ${type} — ${nom} ×${i.qty || i.quantity || 1}${dates}`;
  }).join('\n');

  const livraison = customer_address && customer_address !== 'Retrait sur place'
    ? `📍 Livraison : ${esc(customer_address)}`
    : '🏪 Retrait sur place';

  const text =
    `🔔 <b>Nouvelle commande LVTools</b>\n\n` +
    `👤 <b>${esc(customer_name) || 'Client'}</b>\n` +
    `📧 ${esc(customer_email) || '—'}\n` +
    `📞 ${esc(customer_phone) || '—'}\n` +
    `${livraison}\n\n` +
    `<b>Articles :</b>\n${lignes || '—'}\n\n` +
    `💰 <b>Total payé : ${Number(total_price || 0).toFixed(2)} €</b>` +
    (Number(caution_total) > 0 ? `\n🔒 Caution à collecter à la remise : ${Number(caution_total).toFixed(2)} €` : '');

  await sendTelegram(text);
}

module.exports = { sendTelegram, notifyNewOrder };
