const router = require('express').Router();
const Stripe = require('stripe');
const { orders, products, reservations } = require('../database');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Crée une session Stripe Checkout et retourne l'URL de paiement
router.post('/create-checkout-session', async (req, res) => {
  try {
    const {
      customer_name, customer_email, customer_phone, customer_address,
      delivery_mode, delivery_fee, discount, items, total_price,
    } = req.body;

    const origin = req.headers.origin || `https://${req.headers.host}`;

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.type === 'rent'
            ? `📅 Location — ${item.name} (${item.rentDates?.startDate} → ${item.rentDates?.endDate})`
            : `🛒 Achat — ${item.name}`,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    if (delivery_fee > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: { name: `🚚 Frais de livraison` },
          unit_amount: Math.round(delivery_fee * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      metadata: {
        customer_name,
        customer_phone: customer_phone || '',
        customer_address: customer_address || '',
        delivery_mode: delivery_mode || '',
        delivery_fee: String(delivery_fee || 0),
        discount: String(discount || 0),
        total_price: String(total_price),
        items: JSON.stringify(items),
      },
      payment_intent_data: {
        description: `LVTools — commande de ${customer_name}`,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Webhook Stripe — confirmation paiement (body raw configuré dans index.js)
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    if (session.payment_status === 'paid') {
      const existing = orders.all().find(o => o.stripe_session_id === session.id);
      if (!existing) await createOrderFromSession(session);
    }
  }

  res.json({ received: true });
});

// Vérifie une session après retour sur /checkout/success (fallback sans webhook)
router.get('/session/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    if (session.payment_status === 'paid') {
      const existing = orders.all().find(o => o.stripe_session_id === session.id);
      if (!existing) await createOrderFromSession(session);
      res.json({ paid: true, customer_email: session.customer_email, customer_name: session.metadata?.customer_name });
    } else {
      res.json({ paid: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Retourne la clé publique Stripe pour le front
router.get('/config', (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

async function createOrderFromSession(session) {
  const meta = session.metadata || {};
  const items = JSON.parse(meta.items || '[]');

  orders.insert({
    customer_name: meta.customer_name || '',
    customer_email: session.customer_email || '',
    customer_phone: meta.customer_phone || '',
    customer_address: meta.customer_address || '',
    items: meta.items || '[]',
    total_price: parseFloat(meta.total_price || 0),
    type: 'mixed',
    status: 'paid',
    stripe_session_id: session.id,
  });

  items.forEach(item => {
    if (item.type === 'sale') {
      const p = products.getById(item.id);
      if (p) products.update(item.id, { stock: Math.max(0, p.stock - item.quantity) });
    } else if (item.type === 'rent' && item.rentDates) {
      reservations.insert({
        product_id: item.id,
        customer_name: meta.customer_name || '',
        customer_email: session.customer_email || '',
        customer_phone: meta.customer_phone || '',
        start_date: item.rentDates.startDate,
        end_date: item.rentDates.endDate,
        quantity: item.quantity,
        total_price: item.price * item.quantity,
        status: 'confirmed',
      });
    }
  });
}

module.exports = router;
