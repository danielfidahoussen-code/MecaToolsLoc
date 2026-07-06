const router = require('express').Router();
const Stripe = require('stripe');
const { car_reservations } = require('../database');
const { authMiddleware } = require('../middleware/auth');
const { notifyNewCarReservation } = require('../notify');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Crée une réservation en attente (avant contrat + paiement)
router.post('/create', (req, res) => {
  try {
    const { cars } = require('../database');
    const { car_id, car_name, start_date, end_date, days, car_total, total, delivery, delivery_address, customer_name, customer_email, customer_phone } = req.body;
    if (!car_name || !customer_name || !customer_email) return res.status(400).json({ error: 'Champs requis manquants' });
    const carRecord = car_id ? cars.getById(Number(car_id)) : null;
    const { lastInsertRowid: id } = car_reservations.insert({
      car_id, car_name, start_date, end_date,
      days: parseInt(days), car_total: parseFloat(car_total || total),
      total: parseFloat(total), delivery: !!delivery,
      delivery_address: delivery_address || '',
      customer_name, customer_email, customer_phone: customer_phone || '',
      caution_amount: carRecord?.caution || null,
      status: 'pending',
    });
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crée une session Stripe pour une réservation existante (après signature du contrat)
router.post('/:id/checkout', async (req, res) => {
  try {
    const r = car_reservations.getById(Number(req.params.id));
    if (!r) return res.status(404).json({ error: 'Réservation introuvable' });
    if (!r.contract_signed_at) return res.status(400).json({ error: 'Le contrat doit être signé avant le paiement' });

    const host = req.headers.host || '';
    const proto = host.includes('localhost') ? 'http' : 'https';
    const origin = req.headers.origin || `${proto}://${host}`;

    const days = r.days;
    const carTotal = r.car_total || r.total;

    const lineItems = [{
      price_data: {
        currency: 'eur',
        product_data: { name: `Location ${r.car_name} — ${r.start_date} au ${r.end_date} (${days} jour${days > 1 ? 's' : ''})` },
        unit_amount: Math.round(carTotal * 100),
      },
      quantity: 1,
    }];

    if (r.delivery) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: { name: `Livraison / récupération${r.delivery_address ? ` — ${r.delivery_address.slice(0, 80)}` : ''}` },
          unit_amount: 2000,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: r.customer_email,
      success_url: `${origin}/autres-services/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/autres-services/contrat/${r.id}`,
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
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    if (session.payment_status === 'paid') {
      let existing = car_reservations.all().find(r => r.stripe_session_id === session.id);
      if (!existing) {
        const meta = session.metadata || {};
        // Nouveau flux : mise à jour de la réservation existante
        if (meta.reservation_id) {
          const rid = Number(meta.reservation_id);
          car_reservations.update(rid, { status: 'confirmed', stripe_session_id: session.id });
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
    customer_phone: r.customer_phone, delivery: r.delivery, delivery_address: r.delivery_address,
    caution_amount: r.caution_amount || null,
    contract_signed: !!r.contract_signed_at,
  });
});

// Soumet le contrat signé
router.post('/:id/contract', (req, res) => {
  const id = Number(req.params.id);
  const r = car_reservations.getById(id);
  if (!r) return res.status(404).json({ error: 'Réservation introuvable' });
  const { driver, vehicle_state, signature } = req.body;
  if (!signature) return res.status(400).json({ error: 'Signature requise' });
  car_reservations.update(id, {
    contract_driver: JSON.stringify(driver || {}),
    contract_vehicle: JSON.stringify(vehicle_state || {}),
    contract_signature: signature,
    contract_signed_at: new Date().toISOString(),
  });
  res.json({ success: true });
});

// Admin — voir le contrat en HTML imprimable (token accepté en query param pour ouverture navigateur)
router.get('/:id/contract/print', (req, res, next) => {
  const { JWT_SECRET } = require('../middleware/auth');
  const jwt = require('jsonwebtoken');
  const token = req.headers.authorization?.split(' ')[1] || req.query.token;
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'Token invalide' }); }
}, (req, res) => {
  const r = car_reservations.getById(Number(req.params.id));
  if (!r) return res.status(404).json({ error: 'Introuvable' });
  let driver = {}; try { driver = JSON.parse(r.contract_driver || '{}'); } catch {}
  let vehicle = {}; try { vehicle = JSON.parse(r.contract_vehicle || '{}'); } catch {}
  const signedAt = r.contract_signed_at ? new Date(r.contract_signed_at).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
<title>Contrat N°${r.id} — ${r.car_name}</title>
<style>
  body{font-family:Arial,sans-serif;font-size:11px;margin:0;padding:20px;color:#111;}
  h1{font-size:16px;text-align:center;margin-bottom:4px;}
  .header-block{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;border-bottom:2px solid #000;padding-bottom:8px;}
  .company{font-weight:bold;font-size:12px;}
  .section{margin-bottom:10px;}
  .section-title{font-weight:bold;font-size:12px;background:#eee;padding:3px 6px;margin-bottom:6px;text-transform:uppercase;}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:4px 20px;}
  .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px 12px;}
  .field{border-bottom:1px solid #999;margin-bottom:4px;min-height:16px;padding:1px 0;}
  .label{font-size:9px;color:#666;text-transform:uppercase;letter-spacing:.3px;}
  .cgl{font-size:9.5px;line-height:1.5;margin-top:10px;border-top:1px solid #ccc;padding-top:8px;page-break-before:always;}
  .cgl h2{font-size:11px;text-align:center;margin-bottom:6px;}
  .cgl h3{font-size:10px;margin:8px 0 2px;}
  .sig-block{display:flex;justify-content:space-between;margin-top:20px;}
  .sig-box{border:1px solid #999;width:220px;min-height:80px;padding:6px;text-align:center;}
  .sig-img{max-width:200px;max-height:70px;}
  @media print{body{padding:0;}.no-print{display:none;}}
</style></head><body>
<div class="no-print" style="margin-bottom:16px;text-align:center;">
  <button onclick="window.print()" style="padding:8px 20px;font-size:13px;font-weight:bold;background:#c0392b;color:white;border:none;border-radius:6px;cursor:pointer;">Imprimer / Enregistrer en PDF</button>
</div>

<div class="header-block">
  <div>
    <div class="company">Auto Presto — PrestoLocation</div>
    <div>Fixe : (+262) 693 012 539 | Portable : 06 93 83 96 54</div>
    <div>3B, Rue de la Guadeloupe — 97490 Saint-Denis</div>
    <div>locationautopresto@gmail.com | SIRET 851 826 537 00025</div>
  </div>
  <div style="text-align:right;">
    <div style="font-size:14px;font-weight:bold;">CONTRAT DE LOCATION N° ${r.id}</div>
    <div>Signé le : ${signedAt}</div>
  </div>
</div>

<div class="section">
  <div class="section-title">Véhicule &amp; Location</div>
  <div class="grid3">
    <div><div class="label">Véhicule</div><div class="field">${r.car_name}</div></div>
    <div><div class="label">Immatriculation</div><div class="field">${vehicle.immatriculation || ''}</div></div>
    <div><div class="label">Caution</div><div class="field">${r.caution_amount ? r.caution_amount + ' €' : vehicle.caution || '—'}</div></div>
    <div><div class="label">Date de début</div><div class="field">${r.start_date}</div></div>
    <div><div class="label">Date de fin</div><div class="field">${r.end_date}</div></div>
    <div><div class="label">Durée</div><div class="field">${r.days} jour${r.days > 1 ? 's' : ''}</div></div>
    <div><div class="label">Prix total</div><div class="field" style="font-weight:bold;">${r.total} €${r.delivery ? ' (dont livraison 20 €)' : ''}</div></div>
    <div><div class="label">Livraison</div><div class="field">${r.delivery ? 'Oui — ' + (r.delivery_address || '') : 'Non'}</div></div>
    <div><div class="label">Options</div><div class="field">${vehicle.options || '—'}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Conducteur(s)</div>
  <div class="grid3">
    <div><div class="label">Prénom</div><div class="field">${driver.prenom || r.customer_name?.split(' ')[0] || ''}</div></div>
    <div><div class="label">Nom</div><div class="field">${driver.nom || r.customer_name?.split(' ').slice(1).join(' ') || ''}</div></div>
    <div><div class="label">Date de naissance</div><div class="field">${driver.naissance || ''}</div></div>
    <div><div class="label">N° de permis</div><div class="field">${driver.permis || ''}</div></div>
    <div><div class="label">Date d'obtention</div><div class="field">${driver.permis_date || ''}</div></div>
    <div><div class="label">Téléphone</div><div class="field">${r.customer_phone || ''}</div></div>
    ${driver.permis_photo ? `<div style="grid-column:1/-1;margin-top:6px;"><div class="label">Photo permis</div><img src="${driver.permis_photo}" style="max-height:80px;border-radius:4px;margin-top:3px;" alt="Permis"/></div>` : ''}
    ${driver.conducteur2_nom ? `
    <div><div class="label">2ème conducteur — Prénom</div><div class="field">${driver.conducteur2_prenom || ''}</div></div>
    <div><div class="label">2ème conducteur — Nom</div><div class="field">${driver.conducteur2_nom}</div></div>
    <div><div class="label">2ème conducteur — Permis</div><div class="field">${driver.conducteur2_permis || ''}</div></div>
    ` : ''}
  </div>
</div>

<div class="section">
  <div class="section-title">État du véhicule au départ</div>
  <div class="grid3">
    <div><div class="label">Km compteur</div><div class="field">${vehicle.km || ''}</div></div>
    <div><div class="label">Carburant</div><div class="field">${vehicle.carburant || ''}</div></div>
    <div><div class="label">Lavage</div><div class="field">${vehicle.lavage || ''}</div></div>
    <div style="grid-column:1/-1;"><div class="label">Observations</div><div class="field" style="min-height:30px;">${vehicle.observations || ''}</div></div>
  </div>
</div>

<div class="sig-block">
  <div class="sig-box">
    <div style="font-size:10px;font-weight:bold;margin-bottom:6px;">Signature du Locataire</div>
    ${r.contract_signature ? `<img class="sig-img" src="${r.contract_signature}" alt="Signature"/>` : '<div style="height:60px;"></div>'}
    <div style="font-size:9px;margin-top:4px;">${r.customer_name}</div>
    <div style="font-size:9px;">Le ${signedAt}</div>
  </div>
  <div class="sig-box">
    <div style="font-size:10px;font-weight:bold;margin-bottom:6px;">Signature Conducteur(s)</div>
    <div style="height:60px;"></div>
    <div style="font-size:9px;margin-top:4px;">&nbsp;</div>
  </div>
  <div class="sig-box">
    <div style="font-size:10px;font-weight:bold;margin-bottom:6px;">PrestoLocation</div>
    <div style="height:60px;"></div>
    <div style="font-size:9px;margin-top:4px;">Fixe : (+262) 693 012 539</div>
  </div>
</div>

<p style="font-size:9px;text-align:center;margin-top:8px;font-style:italic;">En signant le contrat de location, le client accepte les conditions générales de location fournies par le loueur professionnel.</p>

<div class="cgl">
<h2>CONDITIONS GÉNÉRALES DE LOCATION (CGL) — LOCATION DE VÉHICULE SANS CHAUFFEUR<br>PRESTOLOC — Date : 22/01/2026</h2>
<h3>1) Objet – Champ d'application</h3><p>Les présentes Conditions Générales de Location ("CGL") encadrent toute location de véhicule sans chauffeur conclue entre le Loueur et le client ("Locataire"). En signant le contrat de location/état des lieux, le Locataire reconnaît avoir pris connaissance des CGL et les accepter.</p>
<h3>2) Définitions</h3><p>"Véhicule" : véhicule loué + accessoires fournis (clés, documents, triangle, gilet, etc.). "Franchise" : somme restant à charge du Locataire en cas de sinistre. "Dépôt de garantie / Caution" : somme destinée à couvrir frais, dommages, franchises, pénalités. "État des lieux" : constat départ/retour (extérieur/intérieur, km, carburant, accessoires).</p>
<h3>3) Conditions pour louer</h3><p>Le Locataire et tout conducteur autorisé doivent : (i) présenter un permis de conduire valide, (ii) une pièce d'identité valide, (iii) un justificatif de domicile si demandé, (iv) être en capacité de payer la location et la caution.</p>
<h3>4) Conducteurs autorisés</h3><p>Seules les personnes indiquées au contrat peuvent conduire. Tout ajout de conducteur doit être déclaré avant départ. Le Locataire reste responsable du Véhicule et des conducteurs autorisés.</p>
<h3>5) Réservation – Paiement – Caution</h3><p>Le prix comprend la location et les options indiquées. La caution peut être versée par préautorisation CB, chèque, espèces ou virement. Le Loueur peut l'encaisser pour couvrir : dommages, franchise, carburant manquant, nettoyage, retard, amendes, immobilisation.</p>
<h3>6) Remise du Véhicule – État des lieux départ</h3><p>Le Véhicule est remis avec un état des lieux départ mentionnant km, carburant, et défauts visibles. Le Locataire doit vérifier et signaler toute anomalie avant de quitter le lieu de départ.</p>
<h3>7) Utilisation du Véhicule (interdictions)</h3><p>Le Locataire s'engage à utiliser le Véhicule en bon usage et notamment à ne pas : sous-louer, prêter à un conducteur non autorisé, transporter des matières dangereuses, participer à des courses, conduire sous alcool/stupéfiants, ou toute utilisation contraire au Code de la route.</p>
<h3>8) Kilométrage – Carburant</h3><p>Kilométrage illimité sauf mention contraire. Carburant : le niveau doit être rendu identique au départ. Tout carburant manquant est facturé selon la grille du Loueur.</p>
<h3>9) Entretien – Pannes</h3><p>Le Locataire surveille les voyants et arrête le véhicule en cas d'alerte critique. En cas de panne, il contacte immédiatement le Loueur.</p>
<h3>10) Assurance</h3><p>Le Véhicule est assuré au minimum en responsabilité civile incluse dans le prix. Des garanties complémentaires peuvent être proposées en option.</p>
<h3>11) Sinistre / Accident</h3><p>En cas d'accident : (a) Sécuriser et appeler les secours. (b) Prévenir le Loueur immédiatement. (c) Remplir un constat amiable + photos. (d) Ne pas reconnaître de responsabilité.</p>
<h3>12) Vol – Perte de clés</h3><p>En cas de vol : dépôt de plainte immédiat + transmission au Loueur. En cas de perte/vol de clés, des frais s'appliquent (reproduction, immobilisation, etc.).</p>
<h3>13) Franchise</h3><p>La franchise applicable est celle indiquée au contrat. Une option de réduction/rachat peut être proposée. Les dégâts intérieurs, brûlures et pneumatiques peuvent rester à charge du Locataire hors couverture explicite.</p>
<h3>14) Restitution – Retard – Prolongation</h3><p>Le Véhicule doit être rendu à la date/heure et au lieu convenus. Toute prolongation doit être validée avant l'échéance. En cas de retard non autorisé : facturation de jours supplémentaires + pénalités.</p>
<h3>15) État des lieux retour – Dommages – Nettoyage</h3><p>Tout dommage non mentionné au départ est présumé survenu pendant la location. Si le véhicule est rendu anormalement sale, des frais de nettoyage peuvent être facturés.</p>
<h3>16) Infractions – Amendes</h3><p>Le Locataire est responsable des infractions et frais associés. Le Loueur peut transmettre les coordonnées du Locataire aux autorités.</p>
<h3>17) Données personnelles (RGPD)</h3><p>Les données sont utilisées pour gérer la réservation, le contrat, la facturation et le traitement des sinistres. Contact : locationautopresto@gmail.com</p>
<h3>18) Réclamations</h3><p>Réclamation écrite préalable : locationautopresto@gmail.com — 3B, Rue de la Guadeloupe, 97490 Saint-Denis.</p>
<h3>19) Médiation de la consommation</h3><p>En cas d'échec de la réclamation écrite, le Locataire peut saisir gratuitement un médiateur de la consommation dans les conditions légales.</p>
<h3>20) Loi applicable</h3><p>Les présentes CGL sont soumises au droit français. À défaut d'accord amiable, le litige relève des juridictions compétentes.</p>
</div>
</body></html>`);
});

// Admin — mise à jour statut
router.put('/:id', authMiddleware, (req, res) => {
  car_reservations.update(Number(req.params.id), { status: req.body.status });
  res.json({ success: true });
});

module.exports = router;
