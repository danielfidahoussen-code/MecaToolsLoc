const router = require('express').Router();
const Stripe = require('stripe');
const { car_reservations } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Crée une session Stripe pour une location de voiture
router.post('/checkout', async (req, res) => {
  try {
    const { car_id, car_name, start_date, end_date, days, total, customer_name, customer_email, customer_phone } = req.body;

    const host = req.headers.host || '';
    const proto = host.includes('localhost') ? 'http' : 'https';
    const origin = req.headers.origin || `${proto}://${host}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: `Location ${car_name} — ${start_date} au ${end_date} (${days} jour${days > 1 ? 's' : ''})` },
          unit_amount: Math.round(total * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email,
      success_url: `${origin}/autres-services/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/autres-services`,
      metadata: {
        type: 'car_rental',
        car_id: String(car_id),
        car_name: car_name.slice(0, 200),
        start_date,
        end_date,
        days: String(days),
        total: String(total),
        customer_name: (customer_name || '').slice(0, 200),
        customer_phone: (customer_phone || '').slice(0, 50),
      },
      payment_intent_data: {
        description: `PrestoLocation — ${car_name} du ${start_date} au ${end_date}`,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Car checkout error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Vérifie la session après paiement
router.get('/session/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    if (session.payment_status === 'paid') {
      const existing = car_reservations.all().find(r => r.stripe_session_id === session.id);
      if (!existing) {
        const meta = session.metadata || {};
        car_reservations.insert({
          car_id: meta.car_id,
          car_name: meta.car_name,
          start_date: meta.start_date,
          end_date: meta.end_date,
          days: parseInt(meta.days || 1),
          total: parseFloat(meta.total || 0),
          customer_name: meta.customer_name,
          customer_email: session.customer_email,
          customer_phone: meta.customer_phone,
          status: 'confirmed',
          stripe_session_id: session.id,
        });
      }
      res.json({ paid: true, customer_name: session.metadata?.customer_name, customer_email: session.customer_email });
    } else {
      res.json({ paid: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin — liste toutes les réservations voitures
router.get('/', authMiddleware, (req, res) => {
  res.json(car_reservations.all().reverse());
});

// Admin — mise à jour statut
router.put('/:id', authMiddleware, (req, res) => {
  car_reservations.update(Number(req.params.id), { status: req.body.status });
  res.json({ success: true });
});

module.exports = router;
