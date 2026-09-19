// Fidélité & parrainage
//  - Code de fidélité : -15%, envoyé automatiquement après la 1ère réservation payée d'un client
//  - Code de parrainage : chaque client reçoit un code personnel à partager ; un nouveau client qui
//    l'utilise a -10% sur sa réservation, et le parrain reçoit ensuite un code -10% pour la sienne
const crypto = require('crypto');
const { orders, car_reservations, coupons, referral_codes } = require('./database');

const LOYALTY_PERCENT = 15;
const REFERRAL_PERCENT = 10;

function genCode(prefix) {
  return `${prefix}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

// Un client a-t-il déjà une réservation payée/confirmée (outillage ou véhicule) ?
function hasPriorBooking(email) {
  if (!email) return false;
  const e = email.toLowerCase();
  const hasOrder = orders.all().some(o => (o.customer_email || '').toLowerCase() === e && o.status !== 'cancelled');
  if (hasOrder) return true;
  return car_reservations.all().some(r => (r.customer_email || '').toLowerCase() === e && r.status !== 'cancelled' && r.status !== 'pending');
}

// Code de parrainage personnel du client — créé au besoin, réutilisable (pas à usage unique)
function getOrCreateReferralCode(email, name) {
  if (!email) return null;
  const e = email.toLowerCase();
  let r = referral_codes.all().find(x => (x.owner_email || '').toLowerCase() === e);
  if (!r) {
    const { lastInsertRowid: id } = referral_codes.insert({
      code: genCode('PARRAIN'),
      owner_email: email,
      owner_name: name || '',
    });
    r = referral_codes.getById(id);
  }
  return r;
}

function issueLoyaltyCoupon(email, name) {
  const { lastInsertRowid: id } = coupons.insert({
    code: genCode('FIDELE'),
    percent: LOYALTY_PERCENT,
    kind: 'loyalty',
    owner_email: email,
    owner_name: name || '',
    used: false,
  });
  return coupons.getById(id);
}

function issueReferralReward(ownerEmail, ownerName) {
  const { lastInsertRowid: id } = coupons.insert({
    code: genCode('MERCI'),
    percent: REFERRAL_PERCENT,
    kind: 'referral_reward',
    owner_email: ownerEmail,
    owner_name: ownerName || '',
    used: false,
  });
  return coupons.getById(id);
}

// Valide un code saisi au checkout (coupon personnel OU code de parrainage d'un tiers)
// Ne consomme rien — juste une vérification. `markCouponUsed` / `issueReferralReward` sont appelés après paiement.
function resolveCode(code, customerEmail) {
  if (!code) return { valid: false, error: 'Code manquant' };
  const clean = code.trim().toUpperCase();

  const coupon = coupons.all().find(c => c.code === clean);
  if (coupon) {
    if (coupon.used) return { valid: false, error: 'Ce code a déjà été utilisé' };
    return { valid: true, percent: coupon.percent, source: 'coupon', couponId: coupon.id };
  }

  const referral = referral_codes.all().find(r => r.code === clean);
  if (referral) {
    if ((referral.owner_email || '').toLowerCase() === (customerEmail || '').toLowerCase()) {
      return { valid: false, error: 'Vous ne pouvez pas utiliser votre propre code de parrainage' };
    }
    if (hasPriorBooking(customerEmail)) {
      return { valid: false, error: 'Ce code de parrainage est réservé aux nouveaux clients' };
    }
    return { valid: true, percent: REFERRAL_PERCENT, source: 'referral', referralOwnerEmail: referral.owner_email, referralOwnerName: referral.owner_name };
  }

  return { valid: false, error: 'Code promo invalide' };
}

function markCouponUsed(couponId) {
  if (!couponId) return;
  coupons.update(couponId, { used: true, used_at: new Date().toISOString() });
}

module.exports = {
  LOYALTY_PERCENT, REFERRAL_PERCENT,
  hasPriorBooking, getOrCreateReferralCode,
  issueLoyaltyCoupon, issueReferralReward,
  resolveCode, markCouponUsed,
};
