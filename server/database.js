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

// Seed products
if (products.count() === 0) {
  [
    { name: 'Coffret de clés mixtes 25 pièces',    description: 'Coffret professionnel de clés mixtes en acier chrome-vanadium, tailles de 6 à 32mm.', category_id: 1, price_sale: 89.90,   price_day: 8,  price_week: 35,  stock: 15, available_for_sale: 1, available_for_rent: 1, image: '/api/placeholder/400/300?text=Clés+Mixtes' },
    { name: 'Perceuse-visseuse sans fil 18V',       description: 'Perceuse-visseuse à percussion 18V avec 2 batteries Li-Ion, chargeur et mallette.',    category_id: 2, price_sale: 149.00,  price_day: 15, price_week: 60,  stock: 8,  available_for_sale: 1, available_for_rent: 1, image: '/api/placeholder/400/300?text=Perceuse+18V' },
    { name: 'Cric hydraulique 3 tonnes',           description: 'Cric rouleur hydraulique professionnel capacité 3T, course 135-500mm.',                  category_id: 3, price_sale: 189.00,  price_day: 20, price_week: 80,  stock: 5,  available_for_sale: 1, available_for_rent: 1, image: '/api/placeholder/400/300?text=Cric+Hydraulique' },
    { name: 'Valise de diagnostic OBD2',           description: 'Scanner multimarques compatible OBD2, lecture et effacement des codes défauts.',          category_id: 4, price_sale: 299.00,  price_day: 25, price_week: 95,  stock: 6,  available_for_sale: 1, available_for_rent: 1, image: '/api/placeholder/400/300?text=Valise+OBD2' },
    { name: 'Compresseur 50L 2CV',                 description: 'Compresseur à courroie 50 litres 2CV, débit 200L/min, pression max 10 bars.',            category_id: 5, price_sale: 329.00,  price_day: 30, price_week: 110, stock: 4,  available_for_sale: 1, available_for_rent: 1, image: '/api/placeholder/400/300?text=Compresseur+50L' },
    { name: 'Clé à chocs pneumatique 1/2"',        description: 'Clé à chocs pneumatique 1/2" couple max 1355Nm, idéale pour roues et boulons.',          category_id: 5, price_sale: 129.00,  price_day: 12, price_week: 48,  stock: 10, available_for_sale: 1, available_for_rent: 1, image: '/api/placeholder/400/300?text=Clé+Impacts' },
    { name: 'Pont élévateur 2 colonnes 4T',        description: 'Pont élévateur hydraulique 4 tonnes, 2 colonnes, hauteur de levage 1850mm.',             category_id: 3, price_sale: 2490.00, price_day: 80, price_week: 300, stock: 2,  available_for_sale: 1, available_for_rent: 1, image: '/api/placeholder/400/300?text=Pont+Élevateur' },
    { name: 'Jeu de tournevis 12 pièces',           description: 'Jeu de 12 tournevis professionnels plats et cruciformes, manche bi-matière.',            category_id: 1, price_sale: 45.90,   price_day: 5,  price_week: 20,  stock: 20, available_for_sale: 1, available_for_rent: 1, image: '/api/placeholder/400/300?text=Tournevis' },
    { name: 'Meuleuse angulaire 125mm',             description: 'Meuleuse angulaire 900W, disque 125mm, protection réglable, démarrage progressif.',       category_id: 2, price_sale: 79.00,   price_day: 10, price_week: 40,  stock: 7,  available_for_sale: 1, available_for_rent: 1, image: '/api/placeholder/400/300?text=Meuleuse' },
    { name: 'Établi pliable professionnel',         description: 'Établi pliable acier avec plateau bois, capacité 200kg, hauteur réglable.',              category_id: 1, price_sale: 119.00,  price_day: 12, price_week: 45,  stock: 6,  available_for_sale: 1, available_for_rent: 1, image: '/api/placeholder/400/300?text=Etabli' },
    { name: 'Testeur de batterie 12/24V',           description: 'Testeur de batterie et alternateur 12/24V, imprimante intégrée, affichage LCD.',          category_id: 4, price_sale: 189.00,  price_day: 18, price_week: 70,  stock: 8,  available_for_sale: 1, available_for_rent: 1, image: '/api/placeholder/400/300?text=Testeur+Batterie' },
    { name: 'Kit de protection EPI',                description: 'Kit équipement de protection : lunettes, gants, casque, chaussures de sécurité.',         category_id: 6, price_sale: 65.00,   price_day: 8,  price_week: 30,  stock: 25, available_for_sale: 1, available_for_rent: 1, image: '/api/placeholder/400/300?text=Kit+EPI' },
  ].forEach(p => products.insert(p));
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
if (cars.count() === 0) {
  [
    {
      name: 'Toyota Yaris', category: 'Citadine',
      description: "Citadine compacte idéale pour se déplacer sur l'île. Économique, facile à garer et agréable à conduire au quotidien.",
      specs: JSON.stringify([['Carburant','Essence'],['Boîte','Manuelle'],['Places','5'],['Portes','5'],['Climatisation','Oui'],['Kilométrage','Illimité']]),
      price_day: 30, price_5days: 27, price_2weeks: 25, min_days: null, image: '', active: 1,
    },
    {
      name: 'Kia Picanto 3', category: 'Citadine — Phase 1',
      description: 'Petite citadine maniable et économique. Parfaite pour la ville et les routes de montagne de La Réunion.',
      specs: JSON.stringify([['Carburant','Essence'],['Boîte','Manuelle'],['Places','5'],['Portes','5'],['Climatisation','Oui'],['Kilométrage','Illimité']]),
      price_day: 30, price_5days: 28, price_2weeks: 27, min_days: null, image: '', active: 1,
    },
    {
      name: 'Citroën C3', category: 'Compacte',
      description: 'Conçue pour La Réunion. Confortable, moderne et polyvalente. Un bon équilibre entre espace, confort et consommation.',
      specs: JSON.stringify([['Carburant','Essence'],['Boîte','Manuelle'],['Places','5'],['Portes','5'],['Climatisation','Oui'],['Kilométrage','Illimité']]),
      price_day: 43, price_5days: 41, price_2weeks: 39, min_days: null, image: '', active: 1,
    },
    {
      name: 'Toyota Auris', category: 'Hybride',
      description: "Compacte hybride polyvalente. Faible consommation, conduite agréable et coffre spacieux pour explorer l'île sans contrainte.",
      specs: JSON.stringify([['Carburant','Hybride'],['Boîte','Automatique'],['Places','5'],['Portes','5'],['Climatisation','Oui'],['Kilométrage','Illimité']]),
      price_day: 39, price_5days: 37, price_2weeks: 35, min_days: null, image: '', active: 1,
    },
    {
      name: 'Lexus CT200h', category: 'Hybride — Premium',
      description: 'Berline hybride haut de gamme. Silencieuse, économique et raffinée. Pour ceux qui veulent le meilleur confort sur La Réunion.',
      specs: JSON.stringify([['Carburant','Hybride'],['Boîte','Automatique'],['Places','5'],['Portes','5'],['Climatisation','Oui'],['GPS','Intégré']]),
      price_day: 45, price_5days: 43, price_2weeks: 39, min_days: null, image: '', active: 1,
    },
    {
      name: 'Mitsubishi Outlander', category: 'SUV — Longue durée',
      description: "Grand SUV familial, idéal pour les groupes ou les longues distances. Disponible en location longue durée (2 semaines minimum).",
      specs: JSON.stringify([['Carburant','Essence'],['Boîte','Automatique'],['Places','7'],['Portes','5'],['Climatisation','Oui'],['Kilométrage','Illimité']]),
      price_day: 39, price_5days: 35, price_2weeks: Math.round(35 * 0.85), min_days: null, image: '', active: 1,
    },
  ].forEach(c => cars.insert(c));
}

module.exports = { categories, products, reservations, orders, users, faqs, car_reservations, cars };
