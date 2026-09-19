const router = require('express').Router();
const crypto = require('crypto');
const Stripe = require('stripe');
const { orders, products, reservations, rental_contracts } = require('../database');
const { notifyNewOrder, confirmCustomerOrder } = require('../notify');

// Init tolérante : si la clé manque, le site reste en ligne (seul le paiement échoue proprement)
const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;
if (!stripe) console.error('[STRIPE] STRIPE_SECRET_KEY manquante — les paiements sont désactivés');

const DEPOSIT_RATE = 0.20; // Acompte de 20% quand la commande contient de la location
const FREE_CANCEL_DAYS = 2;

function daysUntil(dateStr) {
  const start = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  return Math.ceil((start - now) / (1000 * 60 * 60 * 24));
}

// Date de début la plus proche parmi les articles en location d'une commande (sert de référence pour l'annulation)
function earliestRentalStart(items) {
  const dates = (items || [])
    .filter(i => i.type === 'rent')
    .map(i => i.start || i.rentDates?.startDate)
    .filter(Boolean);
  return dates.length ? dates.sort()[0] : null;
}

// Crée une session Stripe Checkout
router.post('/create-checkout-session', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Paiement momentanément indisponible' });
  try {
    const {
      customer_name, customer_email, customer_phone, customer_address,
      delivery_mode, delivery_fee, discount, items, total_price, contract_id,
    } = req.body;

    const hasRentalItems = (items || []).some(i => i.type === 'rent');
    if (hasRentalItems && !contract_id) {
      return res.status(400).json({ error: 'Le contrat de location doit être signé avant le paiement' });
    }

    const host = req.headers.host || '';
    const proto = host.includes('localhost') ? 'http' : 'https';
    const origin = req.headers.origin || `${proto}://${host}`;

    // Total du panier en centimes (sert de base à l'acompte s'il y a de la location)
    let cartTotalCents = items.reduce((s, item) => s + Math.round(item.price * 100) * item.quantity, 0);
    if (delivery_fee > 0) cartTotalCents += Math.round(delivery_fee * 100);

    let lineItems;
    let depositAmount = null;
    let balanceDue = null;
    const cancelToken = hasRentalItems ? crypto.randomBytes(16).toString('hex') : null;

    if (hasRentalItems) {
      // Commande avec location : on ne prend que 20% d'acompte, solde réglé en personne à la remise
      const depositCents = Math.round(cartTotalCents * DEPOSIT_RATE);
      depositAmount = depositCents / 100;
      balanceDue = (cartTotalCents - depositCents) / 100;
      lineItems = [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Acompte de réservation (20%)',
            description: `Solde de ${balanceDue.toFixed(2)} € à régler en personne à la remise du matériel.`,
          },
          unit_amount: depositCents,
        },
        quantity: 1,
      }];
    } else {
      // Achat sans location : paiement intégral, comportement inchangé
      lineItems = items.map(item => ({
        price_data: {
          currency: 'eur',
          product_data: { name: `Achat - ${item.name.slice(0, 100)}` },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));
      if (delivery_fee > 0) {
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: { name: 'Frais de livraison' },
            unit_amount: Math.round(delivery_fee * 100),
          },
          quantity: 1,
        });
      }
    }

    // Stripe metadata : max 500 chars par valeur, on compresse les items
    const itemsCompact = items.map(i => ({
      id: i.id, qty: i.quantity, price: i.price,
      type: i.type,
      ...(i.rentDates ? { start: i.rentDates.startDate, end: i.rentDates.endDate } : {}),
    }));
    const itemsMeta = JSON.stringify(itemsCompact);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      metadata: {
        customer_name: (customer_name || '').slice(0, 200),
        customer_phone: (customer_phone || '').slice(0, 50),
        customer_address: (customer_address || '').slice(0, 200),
        delivery_mode: (delivery_mode || '').slice(0, 100),
        delivery_fee: String(delivery_fee || 0),
        discount: String(discount || 0),
        total_price: String(total_price),
        caution_total: String(items.reduce((s, i) => s + (i.caution || 0) * (i.quantity || 1), 0)),
        items: itemsMeta.slice(0, 490),
        contract_id: contract_id ? String(contract_id) : '',
        cancel_token: cancelToken || '',
        deposit_amount: depositAmount != null ? String(depositAmount) : '',
        balance_due: balanceDue != null ? String(balanceDue) : '',
        rental_start: hasRentalItems ? (earliestRentalStart(items) || '') : '',
      },
      payment_intent_data: {
        description: `PrestoLocation - commande de ${(customer_name || '').slice(0, 100)}`,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Webhook Stripe — body raw configuré dans index.js
router.post('/webhook', async (req, res) => {
  if (!stripe) return res.json({ received: true });
  const sig = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('STRIPE_WEBHOOK_SECRET non configuré — webhook ignoré');
    return res.json({ received: true });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    if (session.payment_status === 'paid') {
      const existing = orders.all().find(o => o.stripe_session_id === session.id);
      if (!existing) {
        await createOrderFromSession(session);
        console.log(`Commande créée via webhook : session ${session.id}`);
      }
    }
  }

  res.json({ received: true });
});

// Vérifie une session après retour sur /checkout/success
router.get('/session/:sessionId', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Paiement momentanément indisponible' });
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    if (session.payment_status === 'paid') {
      const existing = orders.all().find(o => o.stripe_session_id === session.id);
      if (!existing) {
        await createOrderFromSession(session);
        console.log(`Commande créée via session check : ${session.id}`);
      }
      res.json({
        paid: true,
        customer_email: session.customer_email,
        customer_name: session.metadata?.customer_name,
      });
    } else {
      res.json({ paid: false });
    }
  } catch (err) {
    console.error('Session check error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Clé publique pour le front (optionnel)
router.get('/config', (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLIC_KEY || process.env.STRIPE_PUBLISHABLE_KEY || '' });
});

async function createOrderFromSession(session) {
  const meta = session.metadata || {};
  let items = [];
  try { items = JSON.parse(meta.items || '[]'); } catch {}

  const { lastInsertRowid: orderId } = orders.insert({
    customer_name: meta.customer_name || '',
    customer_email: session.customer_email || '',
    customer_phone: meta.customer_phone || '',
    customer_address: meta.customer_address || '',
    items: meta.items || '[]',
    total_price: parseFloat(meta.total_price || 0),
    contract_id: meta.contract_id ? Number(meta.contract_id) : null,
    type: 'mixed',
    status: 'paid',
    stripe_session_id: session.id,
    stripe_payment_intent_id: session.payment_intent || null,
    cancel_token: meta.cancel_token || null,
    deposit_amount: meta.deposit_amount ? parseFloat(meta.deposit_amount) : null,
    balance_due: meta.balance_due ? parseFloat(meta.balance_due) : null,
    rental_start: meta.rental_start || null,
  });

  items.forEach(item => {
    if (item.type === 'sale') {
      const p = products.getById(item.id);
      if (p) products.update(item.id, { stock: Math.max(0, p.stock - (item.qty || item.quantity || 1)) });
    } else if (item.type === 'rent' && (item.start || item.rentDates?.startDate)) {
      reservations.insert({
        product_id: item.id,
        customer_name: meta.customer_name || '',
        customer_email: session.customer_email || '',
        customer_phone: meta.customer_phone || '',
        start_date: item.start || item.rentDates?.startDate,
        end_date: item.end || item.rentDates?.endDate,
        quantity: item.qty || item.quantity || 1,
        total_price: item.price * (item.qty || item.quantity || 1),
        status: 'confirmed',
      });
    }
  });

  // Notification Telegram au propriétaire (avec noms de produits résolus)
  const itemsWithNames = items.map(i => {
    const p = products.getById(i.id);
    return { ...i, name: p ? p.name : `Produit #${i.id}` };
  });
  notifyNewOrder({
    customer_name: meta.customer_name,
    customer_email: session.customer_email,
    customer_phone: meta.customer_phone,
    customer_address: meta.customer_address,
    items: itemsWithNames,
    total_price: meta.total_price,
    delivery_mode: meta.delivery_mode,
    caution_total: meta.caution_total,
  }).catch(err => console.error('[NOTIFY] notifyNewOrder:', err.message));

  // Email de confirmation au client — joint le contrat de location signé s'il y en a un
  const contract = meta.contract_id ? rental_contracts.getById(Number(meta.contract_id)) : null;
  confirmCustomerOrder({
    id: orderId,
    customer_name: meta.customer_name,
    customer_email: session.customer_email,
    customer_address: meta.customer_address,
    items: itemsWithNames,
    total_price: meta.total_price,
    deposit_amount: meta.deposit_amount ? parseFloat(meta.deposit_amount) : null,
    balance_due: meta.balance_due ? parseFloat(meta.balance_due) : null,
    cancel_token: meta.cancel_token || null,
    contract,
  }).catch(err => console.error('[NOTIFY] confirmCustomerOrder:', err.message));
}

module.exports = router;
