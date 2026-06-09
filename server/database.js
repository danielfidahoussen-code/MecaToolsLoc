const bcrypt = require('bcryptjs');
const db = require('./jsondb');

const categories = db.table('categories');
const products   = db.table('products');
const reservations = db.table('reservations');
const orders     = db.table('orders');
const users      = db.table('users');
const faqs       = db.table('faqs');

// Seed categories
if (categories.count() === 0) {
  [
    { name: 'Outillage à main',         slug: 'outillage-main',  icon: '🔧' },
    { name: 'Outillage électroportatif', slug: 'outillage-electro', icon: '⚡' },
    { name: 'Équipement de levage',      slug: 'levage',          icon: '🔩' },
    { name: 'Diagnostic auto',           slug: 'diagnostic',      icon: '🔍' },
    { name: 'Compresseurs & pneumatique',slug: 'compresseurs',    icon: '💨' },
    { name: 'Équipement de sécurité',    slug: 'securite',        icon: '🦺' },
  ].forEach(c => categories.insert(c));
}


// Seed admin
if (users.count() === 0) {
  users.insert({ email: 'admin@lvtools.re', password: bcrypt.hashSync('admin123', 10), role: 'admin' });
}

// Seed FAQs
if (faqs.count() === 0) {
  [
    { question: 'Comment réserver du matériel ?',               answer: 'Sélectionnez le produit souhaité, choisissez vos dates de location sur le calendrier, ajoutez au panier et procédez au paiement. Vous recevrez une confirmation par email.', category: 'reservation', sort_order: 1 },
    { question: 'Quels modes de paiement acceptez-vous ?',      answer: 'Nous acceptons les paiements par carte bancaire (Visa, Mastercard), virement bancaire et espèces sur place.', category: 'paiement', sort_order: 2 },
    { question: 'Peut-on acheter et louer sur le même site ?',  answer: "Oui ! Certains articles sont disponibles à l'achat et/ou à la location. Vous pouvez filtrer le catalogue selon vos besoins.", category: 'general', sort_order: 3 },
    { question: 'Quelle est la durée minimale de location ?',   answer: "La durée minimale de location est d'une journée. Des tarifs dégressifs s'appliquent pour les locations à la semaine.", category: 'reservation', sort_order: 4 },
    { question: 'Comment fonctionne la livraison ?',            answer: "Nous proposons la livraison sur La Réunion (zone Sud et Est principalement). Vous pouvez aussi venir récupérer votre matériel directement chez nous.", category: 'livraison', sort_order: 5 },
    { question: 'Que se passe-t-il si le matériel est endommagé ?', answer: "Une caution est demandée à la réservation. En cas de dommage, les frais de réparation ou remplacement seront déduits de la caution.", category: 'reservation', sort_order: 6 },
    { question: 'Puis-je annuler une réservation ?',            answer: "Oui, jusqu'à 48h avant la date de début de location sans frais. Au-delà, 50% du montant sera retenu.", category: 'reservation', sort_order: 7 },
    { question: 'Comment contacter le service client ?',        answer: 'Vous pouvez nous joindre par téléphone au 06 93 83 96 54 ou par email à Locationautopresto@gmail.com. Nous répondons sous 24h.', category: 'contact', sort_order: 8 },
  ].forEach(f => faqs.insert(f));
}

const car_reservations = db.table('car_reservations');

const cars = db.table('cars');

module.exports = { categories, products, reservations, orders, users, faqs, car_reservations, cars };
