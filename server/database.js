const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, 'mecatoolsloc.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT DEFAULT '🔧'
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    price_sale REAL,
    price_day REAL,
    price_week REAL,
    stock INTEGER DEFAULT 0,
    available_for_sale INTEGER DEFAULT 1,
    available_for_rent INTEGER DEFAULT 1,
    image TEXT DEFAULT '/placeholder.jpg',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER REFERENCES products(id),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    total_price REAL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    customer_address TEXT,
    items TEXT NOT NULL,
    total_price REAL NOT NULL,
    payment_intent TEXT,
    status TEXT DEFAULT 'pending',
    type TEXT DEFAULT 'sale',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    sort_order INTEGER DEFAULT 0
  );
`);

// Seed categories
const catCount = db.prepare('SELECT COUNT(*) as c FROM categories').get();
if (catCount.c === 0) {
  const insertCat = db.prepare('INSERT INTO categories (name, slug, icon) VALUES (?, ?, ?)');
  [
    ['Outillage à main', 'outillage-main', '🔧'],
    ['Outillage électroportatif', 'outillage-electro', '⚡'],
    ['Équipement de levage', 'levage', '🔩'],
    ['Diagnostic auto', 'diagnostic', '🔍'],
    ['Compresseurs & pneumatique', 'compresseurs', '💨'],
    ['Équipement de sécurité', 'securite', '🦺'],
  ].forEach(([name, slug, icon]) => insertCat.run(name, slug, icon));
}

// Seed products
const prodCount = db.prepare('SELECT COUNT(*) as c FROM products').get();
if (prodCount.c === 0) {
  const insertProd = db.prepare(`
    INSERT INTO products (name, description, category_id, price_sale, price_day, price_week, stock, available_for_sale, available_for_rent, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  [
    ['Coffret de clés mixtes 25 pièces', 'Coffret professionnel de clés mixtes en acier chrome-vanadium, tailles de 6 à 32mm.', 1, 89.90, 8.00, 35.00, 15, 1, 1, '/api/placeholder/400/300?text=Clés+Mixtes'],
    ['Perceuse-visseuse sans fil 18V', 'Perceuse-visseuse à percussion 18V avec 2 batteries Li-Ion, chargeur et mallette.', 2, 149.00, 15.00, 60.00, 8, 1, 1, '/api/placeholder/400/300?text=Perceuse+18V'],
    ['Cric hydraulique 3 tonnes', 'Cric rouleur hydraulique professionnel capacité 3T, course 135-500mm.', 3, 189.00, 20.00, 80.00, 5, 1, 1, '/api/placeholder/400/300?text=Cric+Hydraulique'],
    ['Valise de diagnostic OBD2', 'Scanner multimarques compatible OBD2, lecture et effacement des codes défauts.', 4, 299.00, 25.00, 95.00, 6, 1, 1, '/api/placeholder/400/300?text=Valise+OBD2'],
    ['Compresseur 50L 2CV', 'Compresseur à courroie 50 litres 2CV, débit 200L/min, pression max 10 bars.', 5, 329.00, 30.00, 110.00, 4, 1, 1, '/api/placeholder/400/300?text=Compresseur+50L'],
    ['Clé à chocs pneumatique 1/2"', 'Clé à chocs pneumatique 1/2" couple max 1355Nm, idéale pour roues et boulons.', 5, 129.00, 12.00, 48.00, 10, 1, 1, '/api/placeholder/400/300?text=Clé+Impacts'],
    ['Pont élévateur 2 colonnes 4T', 'Pont élévateur hydraulique 4 tonnes, 2 colonnes, hauteur de levage 1850mm.', 3, 2490.00, 80.00, 300.00, 2, 1, 1, '/api/placeholder/400/300?text=Pont+Élevateur'],
    ['Jeu de tournevis 12 pièces', 'Jeu de 12 tournevis professionnels plats et cruciformes, manche bi-matière.', 1, 45.90, 5.00, 20.00, 20, 1, 1, '/api/placeholder/400/300?text=Tournevis'],
    ['Meuleuse angulaire 125mm', 'Meuleuse angulaire 900W, disque 125mm, protection réglable, démarrage progressif.', 2, 79.00, 10.00, 40.00, 7, 1, 1, '/api/placeholder/400/300?text=Meuleuse'],
    ['Établi pliable professionnel', 'Établi pliable acier avec plateau bois, capacité 200kg, hauteur réglable.', 1, 119.00, 12.00, 45.00, 6, 1, 1, '/api/placeholder/400/300?text=Étabi'],
    ['Testeur de batterie 12/24V', 'Testeur de batterie et alternateur 12/24V, imprimante intégrée, affichage LCD.', 4, 189.00, 18.00, 70.00, 8, 1, 1, '/api/placeholder/400/300?text=Testeur+Batterie'],
    ['Kit de protection EPI', 'Kit équipement de protection : lunettes, gants, casque, chaussures de sécurité.', 6, 65.00, 8.00, 30.00, 25, 1, 1, '/api/placeholder/400/300?text=Kit+EPI'],
  ].forEach(args => insertProd.run(...args));
}

// Seed admin user
const adminCount = db.prepare('SELECT COUNT(*) as c FROM users').get();
if (adminCount.c === 0) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)').run('admin@mecatoolsloc.re', hash, 'admin');
}

// Seed FAQs
const faqCount = db.prepare('SELECT COUNT(*) as c FROM faqs').get();
if (faqCount.c === 0) {
  const insertFaq = db.prepare('INSERT INTO faqs (question, answer, category, sort_order) VALUES (?, ?, ?, ?)');
  [
    ['Comment réserver du matériel ?', 'Sélectionnez le produit souhaité, choisissez vos dates de location sur le calendrier, ajoutez au panier et procédez au paiement. Vous recevrez une confirmation par email.', 'reservation', 1],
    ['Quels modes de paiement acceptez-vous ?', 'Nous acceptons les paiements par carte bancaire (Visa, Mastercard), virement bancaire et espèces sur place.', 'paiement', 2],
    ['Peut-on acheter et louer sur le même site ?', 'Oui ! Certains articles sont disponibles à l\'achat et/ou à la location. Vous pouvez filtrer le catalogue selon vos besoins.', 'general', 3],
    ['Quelle est la durée minimale de location ?', 'La durée minimale de location est d\'une journée. Des tarifs dégressifs s\'appliquent pour les locations à la semaine.', 'reservation', 4],
    ['Comment fonctionne la livraison ?', 'Nous proposons la livraison sur La Réunion (zone Sud et Est principalement). Vous pouvez aussi venir récupérer votre matériel directement chez nous.', 'livraison', 5],
    ['Que se passe-t-il si le matériel est endommagé ?', 'Une caution est demandée à la réservation. En cas de dommage, les frais de réparation ou remplacement seront déduits de la caution.', 'reservation', 6],
    ['Puis-je annuler une réservation ?', 'Oui, jusqu\'à 48h avant la date de début de location sans frais. Au-delà, 50% du montant sera retenu.', 'reservation', 7],
    ['Comment contacter le service client ?', 'Vous pouvez nous joindre par téléphone au 06 93 83 96 54 ou par email à Locationautopresto@gmail.com. Nous répondons sous 24h.', 'contact', 8],
  ].forEach(args => insertFaq.run(...args));
}

module.exports = db;
