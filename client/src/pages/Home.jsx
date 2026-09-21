import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Shield, Truck, CreditCard, CalendarClock, ArrowRight, Wrench, Car } from 'lucide-react';
import ProductCard from '../components/ProductCard';

function startPriceOf(car) {
  const tiers = [car.price_1_3, car.price_4_10, car.price_11_20, car.price_21_29, car.price_30plus,
    car.price_day, car.price_5days, car.price_2weeks].filter(v => v > 0);
  return tiers.length ? Math.min(...tiers) : null;
}

function CarPreviewCard({ car }) {
  const price = startPriceOf(car);
  return (
    <Link to="/vehicules" style={{ textDecoration: 'none', flexShrink: 0, width: 230 }}>
      <div className="card" style={{ overflow: 'hidden', transition: 'var(--transition)' }}
        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(34,4,4,.12)'; }}
        onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
        <div style={{ height: 136, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--gray-100)', overflow: 'hidden' }}>
          {car.image
            ? <img src={car.image} alt={car.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            : <p style={{ color: 'var(--gray-400)', fontSize: 12, fontWeight: 600 }}>Photo à venir</p>}
        </div>
        <div style={{ padding: '13px 14px' }}>
          {car.category && (
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--gray-400)', marginBottom: 4 }}>{car.category}</p>
          )}
          <p style={{ fontWeight: 800, fontSize: 14, color: 'var(--primary)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{car.name}</p>
          {price != null && (
            <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>À partir de <strong style={{ color: 'var(--accent)' }}>{price} €/j</strong></p>
          )}
        </div>
      </div>
    </Link>
  );
}

function CategoryTile({ cat }) {
  return (
    <Link to={`/outillage?category=${cat.slug}`} style={{
      textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      padding: '20px 12px', borderRadius: 14, background: 'white', border: '1px solid var(--gray-200)', transition: 'var(--transition)',
    }}
      onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.transform = 'none'; }}>
      <span style={{ fontSize: 26 }}>{cat.icon}</span>
      <span style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--primary)', textAlign: 'center', lineHeight: 1.3 }}>{cat.name}</span>
    </Link>
  );
}

// Bandeau d'en-tête de zone — marque clairement le début d'un des deux marchés
function MarketHeader({ icon, eyebrow, title, linkTo, linkLabel }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--accent)', marginBottom: 2 }}>{eyebrow}</p>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--primary)' }}>{title}</h2>
        </div>
      </div>
      <Link to={linkTo} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', flexShrink: 0 }}>
        {linkLabel} <ArrowRight size={14}/>
      </Link>
    </div>
  );
}

const REASSURANCE = [
  { icon: <CreditCard size={22}/>, title: 'Acompte 20% seulement', text: "Le solde se règle en personne, à la remise. Annulation gratuite jusqu'à 2 jours avant." },
  { icon: <Shield size={22}/>, title: 'Caution non bloquée', text: "Prise par empreinte, jamais débitée si le matériel revient en bon état." },
  { icon: <Truck size={22}/>, title: 'Retrait ou livraison', text: "À notre atelier de Saint-Denis, ou livré partout sur l'île." },
  { icon: <CalendarClock size={22}/>, title: 'Dispo tout de suite', text: "Matériel professionnel vérifié, prêt à partir sans attendre." },
];

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cars, setCars] = useState([]);

  useEffect(() => {
    axios.get('/api/products/categories').then(r => setCategories(r.data)).catch(() => {});
    axios.get('/api/cars').then(r => setCars(r.data.slice(0, 6))).catch(() => {});
    axios.get('/api/products', { params: { limit: 8 } }).then(r => {
      setPopularProducts(r.data.products);
      setLoadingProducts(false);
    }).catch(() => setLoadingProducts(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #3a0808 100%)', color: 'white', padding: '56px 0 40px' }}>
        <div className="container">
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,.55)', marginBottom: 10 }}>La Réunion</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.25)', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
              🔧 Outillage — location & vente
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.25)', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
              🚗 Véhicules — location
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px,4.5vw,44px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 14, maxWidth: 660 }}>
            Location & vente d'outillage professionnel. Location de véhicules.
          </h1>
          <p style={{ color: 'rgba(255,255,255,.72)', fontSize: 16, maxWidth: 540, marginBottom: 28, lineHeight: 1.6 }}>
            Par un mécanicien, pour les mécaniciens. Matériel pro dispo tout de suite, jeunes conducteurs acceptés.
          </p>
        </div>
      </div>

      {/* Les deux marchés — séparation claire dès l'arrivée */}
      <div className="container" style={{ marginTop: -28, marginBottom: 8, position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          <Link to="/outillage" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '26px 28px', display: 'flex', alignItems: 'center', gap: 18, transition: 'var(--transition)' }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, background: 'rgba(255,51,51,.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Wrench size={26}/>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 900, fontSize: 18, color: 'var(--primary)', marginBottom: 3 }}>Outillage professionnel</p>
                <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>Location et vente de matériel pro</p>
              </div>
              <ArrowRight size={20} color="var(--gray-300)"/>
            </div>
          </Link>
          <Link to="/vehicules" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '26px 28px', display: 'flex', alignItems: 'center', gap: 18, transition: 'var(--transition)' }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, background: 'rgba(255,51,51,.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Car size={26}/>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 900, fontSize: 18, color: 'var(--primary)', marginBottom: 3 }}>Location de véhicules</p>
                <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>Toute l'île, jeunes conducteurs acceptés</p>
              </div>
              <ArrowRight size={20} color="var(--gray-300)"/>
            </div>
          </Link>
        </div>
      </div>

      {/* Barre infos rapides */}
      <div style={{ background: 'var(--light)', borderBottom: '1px solid var(--gray-200)', padding: '14px 0', marginTop: 36 }}>
        <div className="container" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13, color: 'var(--gray-600)', fontWeight: 600 }}>
          <span>Acompte 20% seulement</span>
          <span style={{ color: 'var(--gray-300)' }}>|</span>
          <span>Caution non bloquée</span>
          <span style={{ color: 'var(--gray-300)' }}>|</span>
          <span>Retrait Saint-Denis · Livraison toute l'île</span>
          <span style={{ color: 'var(--gray-300)' }}>|</span>
          <span style={{ color: '#d97706', fontWeight: 700 }}>-10% retrait sur place</span>
        </div>
      </div>

      {/* ── Zone Outillage ── */}
      <div style={{ background: 'white', padding: '48px 0' }}>
        <div className="container">
          <MarketHeader icon={<Wrench size={20}/>} eyebrow="Marché n°1" title="Outillage professionnel"
            linkTo="/outillage" linkLabel="Voir tout l'outillage"/>

          {/* Pitch — pourquoi louer plutôt qu'acheter */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 40, alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--primary)', marginBottom: 10 }}>
                Pourquoi louer votre outillage plutôt que l'acheter ?
              </h3>
              <p style={{ fontSize: 14.5, color: 'var(--gray-600)', lineHeight: 1.75 }}>
                Certaines réparations demandent un outil très spécifique, que vous n'utiliserez peut-être qu'une seule fois.
                Plutôt que d'investir plusieurs centaines, voire plusieurs milliers d'euros dans du matériel qui dormira
                ensuite dans un coin de l'atelier, louez-le chez PrestoLocation le temps de l'intervention —
                puis refacturez cette location à votre client, comme n'importe quelle fourniture nécessaire à la réparation.
              </p>
            </div>
            <div style={{ background: 'var(--light)', border: '1px solid var(--gray-200)', borderRadius: 14, padding: '22px 24px' }}>
              <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--accent)', marginBottom: 8 }}>Exemple concret</p>
              <p style={{ fontSize: 14.5, color: 'var(--gray-700)', lineHeight: 1.7 }}>
                Une distribution à refaire, mais pas de <strong>kit de calage moteur</strong> (souvent autour de <strong>1 500 €</strong> à l'achat) ?
                Louez-le chez nous pour la durée du chantier, réalisez l'intervention, et rendez l'outil une fois le travail terminé.
                Vous ne perdez pas le chantier, et vous n'immobilisez pas votre trésorerie dans un outil que vous ne ressortirez peut-être plus.
              </p>
            </div>
          </div>

          {categories.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12, marginBottom: 28 }}>
              {categories.map(c => <CategoryTile key={c.id} cat={c}/>)}
            </div>
          )}

          {loadingProducts
            ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner"/></div>
            : popularProducts.length === 0
              ? <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: 60 }}>Aucun produit trouvé</p>
              : <div className="grid-4">{popularProducts.map(p => <ProductCard key={p.id} product={p}/>)}</div>
          }
        </div>
      </div>

      {/* ── Zone Véhicules ── */}
      {cars.length > 0 && (
        <div style={{ background: 'var(--light)', padding: '48px 0', borderTop: '1px solid var(--gray-200)' }}>
          <div className="container">
            <MarketHeader icon={<Car size={20}/>} eyebrow="Marché n°2" title="Location de véhicules"
              linkTo="/vehicules" linkLabel="Voir tous les véhicules"/>

            {/* Pitch — flotte hybride & vérifiée */}
            <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 14, padding: '24px 28px', marginBottom: 32 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--primary)', marginBottom: 10 }}>
                Une flotte hybride, économique et vérifiée avant chaque départ
              </h3>
              <p style={{ fontSize: 14.5, color: 'var(--gray-600)', lineHeight: 1.75, marginBottom: 16 }}>
                Notre flotte est composée majoritairement de véhicules <strong>hybrides</strong> : moins de consommation à la pompe,
                moins d'émissions, et une conduite plus sereine sur les routes de La Réunion. Et parce que la sécurité ne se
                négocie pas, nous sommes associés au garage <strong>Auto Presto</strong>, qui vérifie chaque véhicule avant
                chaque départ — pneus, freins, niveaux — pour que vous preniez la route l'esprit tranquille.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {['🔋 Flotte majoritairement hybride', '🛠️ Vérifié par Auto Presto avant chaque départ', '🛡️ Sécurité et fiabilité'].map(b => (
                  <span key={b} style={{ background: 'var(--light)', border: '1px solid var(--gray-200)', padding: '6px 14px', borderRadius: 20, fontSize: 12.5, fontWeight: 700, color: 'var(--primary)' }}>{b}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 4 }}>
              {cars.map(car => <CarPreviewCard key={car.id} car={car}/>)}
            </div>
          </div>
        </div>
      )}

      {/* Pourquoi PrestoLocation — socle commun aux deux marchés */}
      <div className="container" style={{ paddingTop: 48, paddingBottom: 56 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)', marginBottom: 20 }}>Pourquoi PrestoLocation ?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
          {REASSURANCE.map((r, i) => (
            <div key={i} style={{ background: 'var(--light)', border: '1px solid var(--gray-200)', borderRadius: 14, padding: '20px 20px' }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                {r.icon}
              </div>
              <p style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--primary)', marginBottom: 6 }}>{r.title}</p>
              <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6 }}>{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
