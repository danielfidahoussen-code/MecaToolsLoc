const router = require('express').Router();
const crypto = require('crypto');
const Stripe = require('stripe');
const { car_reservations } = require('../database');
const { authMiddleware } = require('../middleware/auth');
const { notifyNewCarReservation, confirmCustomerCarReservation, notifyCarReservationRequest, confirmCustomerCarRequest, sendLoyaltyCoupon, sendReferralRewardEmail } = require('../notify');
const { resolveCode, markCouponUsed, hasPriorBooking, issueLoyaltyCoupon, issueReferralReward, getOrCreateReferralCode } = require('../loyalty');

const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;
if (!stripe) console.error('[STRIPE] STRIPE_SECRET_KEY manquante — paiements véhicules désactivés');

const DEPOSIT_RATE = 0.20; // Acompte de 20% à la réservation, solde réglé en personne à la remise
const FREE_CANCEL_DAYS = 2; // Annulation gratuite jusqu'à 2 jours avant le début de la location

// Nombre de jours pleins avant la date de début (arrondi au jour)
function daysUntil(dateStr) {
  const start = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  return Math.ceil((start - now) / (1000 * 60 * 60 * 24));
}

// Crée une réservation en attente (avant contrat + paiement)
router.post('/create', (req, res) => {
  try {
    const { cars } = require('../database');
    const {
      car_id, car_name, start_date, end_date, days, car_total, total,
      delivery_out, delivery_out_address, delivery_in, delivery_in_address,
      booster, baby_seat,
      customer_name, customer_email, customer_phone,
    } = req.body;
    if (!car_name || !customer_name || !customer_email) return res.status(400).json({ error: 'Champs requis manquants' });
    const carRecord = car_id ? cars.getById(Number(car_id)) : null;
    const { lastInsertRowid: id } = car_reservations.insert({
      car_id, car_name, start_date, end_date,
      days: parseInt(days), car_total: parseFloat(car_total || total),
      total: parseFloat(total),
      delivery_out: !!delivery_out, delivery_out_address: delivery_out_address || '',
      delivery_in: !!delivery_in, delivery_in_address: delivery_in_address || '',
      booster: !!booster, baby_seat: !!baby_seat,
      customer_name, customer_email, customer_phone: customer_phone || '',
      caution_amount: carRecord?.caution || null,
      cancel_token: crypto.randomBytes(16).toString('hex'),
      status: 'pending',
    });
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Simple demande de réservation (pas de paiement en ligne, pas de contrat sur le site —
// tout se règle en personne). Utilisée pour les véhicules avec booking_mode: 'request'.
router.post('/request', (req, res) => {
  try {
    const { cars } = require('../database');
    const {
      car_id, car_name, start_date, end_date, days, car_total, total,
      delivery_out, delivery_in, booster, baby_seat,
      customer_name, customer_email, customer_phone,
    } = req.body;
    if (!car_name || !customer_name || !customer_email) return res.status(400).json({ error: 'Champs requis manquants' });
    const carRecord = car_id ? cars.getById(Number(car_id)) : null;
    const { lastInsertRowid: id } = car_reservations.insert({
      car_id, car_name, start_date, end_date,
      days: parseInt(days), car_total: parseFloat(car_total || total),
      total: parseFloat(total),
      delivery_out: !!delivery_out, delivery_in: !!delivery_in,
      booster: !!booster, baby_seat: !!baby_seat,
      customer_name, customer_email, customer_phone: customer_phone || '',
      caution_amount: carRecord?.caution || null,
      cancel_token: crypto.randomBytes(16).toString('hex'),
      booking_mode: 'request',
      status: 'pending',
    });
    const r = car_reservations.getById(id);
    notifyCarReservationRequest(r).catch(err => console.error('[NOTIFY] notifyCarReservationRequest:', err.message));
    confirmCustomerCarRequest(r).catch(err => console.error('[NOTIFY] confirmCustomerCarRequest:', err.message));
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crée une session Stripe pour une réservation existante
router.post('/:id/checkout', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Paiement momentanément indisponible' });
  try {
    const r = car_reservations.getById(Number(req.params.id));
    if (!r) return res.status(404).json({ error: 'Réservation introuvable' });

    const host = req.headers.host || '';
    const proto = host.includes('localhost') ? 'http' : 'https';
    const origin = req.headers.origin || `${proto}://${host}`;

    const days = r.days;
    const carTotal = r.car_total || r.total;

    // Total du panier (location + options) — sert de base au calcul de l'acompte de 20%
    let totalCents = Math.round(carTotal * 100);
    if (r.delivery_out) totalCents += 2000;
    if (r.delivery_in) totalCents += 2000;
    if (r.booster) totalCents += 200 * days;
    if (r.baby_seat) totalCents += 400 * days;

    // Code promo éventuel (fidélité ou parrainage)
    let promo = null;
    const { promo_code } = req.body;
    if (promo_code) {
      const result = resolveCode(promo_code, r.customer_email);
      if (!result.valid) return res.status(400).json({ error: result.error });
      promo = result;
      totalCents = Math.round(totalCents * (1 - promo.percent / 100));
    }

    const depositCents = Math.round(totalCents * DEPOSIT_RATE);
    const depositAmount = depositCents / 100;
    const balanceDue = (totalCents - depositCents) / 100;

    const lineItems = [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: `Acompte de réservation (20%) — ${r.car_name} — ${r.start_date} au ${r.end_date}`,
          description: promo
            ? `Code promo ${promo_code.trim().toUpperCase()} appliqué (-${promo.percent}%). Solde de ${balanceDue.toFixed(2)} € à régler en personne à la remise du véhicule.`
            : `Solde de ${balanceDue.toFixed(2)} € à régler en personne à la remise du véhicule.`,
        },
        unit_amount: depositCents,
      },
      quantity: 1,
    }];

    // Fidélité : ce client a-t-il déjà une réservation ? (calculé avant la mise à jour de statut ci-dessous)
    const isFirstBooking = !hasPriorBooking(r.customer_email);

    car_reservations.update(r.id, {
      deposit_amount: depositAmount, balance_due: balanceDue,
      promo_code: promo ? promo_code.trim().toUpperCase() : null,
      promo_percent: promo ? promo.percent : null,
      promo_source: promo ? promo.source : null,
      promo_coupon_id: promo?.couponId || null,
      promo_referral_owner_email: promo?.referralOwnerEmail || null,
      promo_referral_owner_name: promo?.referralOwnerName || null,
      is_first_booking: isFirstBooking,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: r.customer_email,
      success_url: `${origin}/vehicules/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/vehicules/contrat/${r.id}`,
      metadata: { reservation_id: String(r.id) },
      payment_intent_data: {
        description: `PrestoLocation — ${r.car_name} du ${r.start_date} au ${r.end_date}`,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Car checkout error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Ancien endpoint checkout (conservé pour rétrocompatibilité)
router.post('/checkout', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Paiement momentanément indisponible' });
  try {
    const { car_id, car_name, start_date, end_date, days, car_total, total, delivery, delivery_address, customer_name, customer_email, customer_phone } = req.body;

    const host = req.headers.host || '';
    const proto = host.includes('localhost') ? 'http' : 'https';
    const origin = req.headers.origin || `${proto}://${host}`;

    const lineItems = [{
      price_data: {
        currency: 'eur',
        product_data: { name: `Location ${car_name} — ${start_date} au ${end_date} (${days} jour${days > 1 ? 's' : ''})` },
        unit_amount: Math.round((car_total || total) * 100),
      },
      quantity: 1,
    }];

    if (delivery) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: { name: `Livraison / récupération à domicile${delivery_address ? ` — ${delivery_address.slice(0, 100)}` : ''}` },
          unit_amount: 2000,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email,
      success_url: `${origin}/vehicules/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/vehicules`,
      metadata: {
        type: 'car_rental',
        car_id: String(car_id),
        car_name: car_name.slice(0, 200),
        start_date,
        end_date,
        days: String(days),
        total: String(total),
        delivery: delivery ? 'true' : 'false',
        delivery_address: (delivery_address || '').slice(0, 200),
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
  if (!stripe) return res.status(503).json({ error: 'Paiement momentanément indisponible' });
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    if (session.payment_status === 'paid') {
      let existing = car_reservations.all().find(r => r.stripe_session_id === session.id);
      if (!existing) {
        const meta = session.metadata || {};
        // Nouveau flux : mise à jour de la réservation existante
        if (meta.reservation_id) {
          const rid = Number(meta.reservation_id);
          car_reservations.update(rid, { status: 'confirmed', stripe_session_id: session.id, stripe_payment_intent_id: session.payment_intent || null });
          existing = car_reservations.getById(rid);
        } else {
          // Ancien flux (rétrocompat)
          car_reservations.insert({
            car_id: meta.car_id, car_name: meta.car_name,
            start_date: meta.start_date, end_date: meta.end_date,
            days: parseInt(meta.days || 1), total: parseFloat(meta.total || 0),
            delivery: meta.delivery === 'true', delivery_address: meta.delivery_address || '',
            customer_name: meta.customer_name, customer_email: session.customer_email,
            customer_phone: meta.customer_phone, status: 'confirmed', stripe_session_id: session.id,
          });
          existing = car_reservations.all().find(r => r.stripe_session_id === session.id);
        }
        // Notification Telegram au propriétaire (seulement à la 1ère confirmation)
        notifyNewCarReservation(existing).catch(err => console.error('[NOTIFY] notifyNewCarReservation:', err.message));
        // Email de confirmation au client
        confirmCustomerCarReservation(existing).catch(err => console.error('[NOTIFY] confirmCustomerCarReservation:', err.message));

        // Fidélité & parrainage (une seule fois, à la 1ère confirmation de cette réservation)
        if (existing.promo_source === 'coupon' && existing.promo_coupon_id) {
          markCouponUsed(existing.promo_coupon_id);
        } else if (existing.promo_source === 'referral' && existing.promo_referral_owner_email) {
          const reward = issueReferralReward(existing.promo_referral_owner_email, existing.promo_referral_owner_name);
          sendReferralRewardEmail(existing.promo_referral_owner_email, existing.promo_referral_owner_name, reward)
            .catch(err => console.error('[NOTIFY] sendReferralRewardEmail:', err.message));
        }
        if (existing.is_first_booking) {
          const coupon = issueLoyaltyCoupon(existing.customer_email, existing.customer_name);
          const referral = getOrCreateReferralCode(existing.customer_email, existing.customer_name);
          sendLoyaltyCoupon(existing.customer_email, existing.customer_name, coupon, referral?.code)
            .catch(err => console.error('[NOTIFY] sendLoyaltyCoupon:', err.message));
        }
      }
      res.json({ paid: true, reservation_id: existing?.id, customer_name: existing?.customer_name, customer_email: existing?.customer_email });
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

// Public — récupère une réservation pour le contrat (champs limités)
router.get('/public/:id', (req, res) => {
  const r = car_reservations.getById(Number(req.params.id));
  if (!r) return res.status(404).json({ error: 'Réservation introuvable' });
  res.json({
    id: r.id, car_name: r.car_name, car_id: r.car_id,
    start_date: r.start_date, end_date: r.end_date, days: r.days,
    total: r.total, car_total: r.car_total, customer_name: r.customer_name, customer_email: r.customer_email,
    customer_phone: r.customer_phone,
    delivery_out: r.delivery_out, delivery_out_address: r.delivery_out_address,
    delivery_in: r.delivery_in, delivery_in_address: r.delivery_in_address,
    booster: r.booster, baby_seat: r.baby_seat,
    caution_amount: r.caution_amount || null,
  });
});

// Public — infos d'annulation (le lien vient de l'email de confirmation, protégé par le token)
router.get('/cancel/:id/:token', (req, res) => {
  const r = car_reservations.getById(Number(req.params.id));
  if (!r || r.cancel_token !== req.params.token) return res.status(404).json({ error: 'Lien invalide' });
  if (r.status === 'cancelled') return res.json({ already_cancelled: true, refunded: !!r.refunded });
  const days = daysUntil(r.start_date);
  res.json({
    car_name: r.car_name, start_date: r.start_date, end_date: r.end_date,
    deposit_amount: r.deposit_amount || null, balance_due: r.balance_due || null,
    days_until_start: days,
    refund_eligible: days >= FREE_CANCEL_DAYS,
  });
});

// Public — confirme l'annulation (rembourse l'acompte si à ≥ 2 jours du départ)
router.post('/cancel/:id/:token', async (req, res) => {
  const r = car_reservations.getById(Number(req.params.id));
  if (!r || r.cancel_token !== req.params.token) return res.status(404).json({ error: 'Lien invalide' });
  if (r.status === 'cancelled') return res.status(400).json({ error: 'Cette réservation est déjà annulée' });

  const days = daysUntil(r.start_date);
  const eligible = days >= FREE_CANCEL_DAYS;
  let refunded = false;

  if (eligible && r.stripe_payment_intent_id && stripe) {
    try {
      await stripe.refunds.create({ payment_intent: r.stripe_payment_intent_id });
      refunded = true;
    } catch (err) {
      console.error('[REFUND] Échec remboursement réservation véhicule', r.id, ':', err.message);
      return res.status(500).json({ error: 'Le remboursement a échoué, contactez-nous directement.' });
    }
  }

  car_reservations.update(r.id, { status: 'cancelled', cancelled_at: new Date().toISOString(), refunded });
  res.json({ success: true, refunded });
});

// Admin — mise à jour statut
router.put('/:id', authMiddleware, (req, res) => {
  car_reservations.update(Number(req.params.id), { status: req.body.status });
  res.json({ success: true });
});

// Admin — supprime toutes les réservations véhicules (doit être AVANT /:id)
router.delete('/all', authMiddleware, (req, res) => {
  car_reservations.all().forEach(r => car_reservations.delete(r.id));
  res.json({ success: true });
});

router.delete('/:id', authMiddleware, (req, res) => {
  car_reservations.delete(Number(req.params.id));
  res.json({ success: true });
});

module.exports = router;
