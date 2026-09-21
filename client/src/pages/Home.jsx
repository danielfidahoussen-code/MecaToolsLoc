import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Shield, Truck, CreditCard, CalendarClock, ArrowRight } from 'lucide-react';
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
          <h1 style={{ fontSize: 'clamp(28px,4.5vw,44px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 14, maxWidth: 660 }}>
            Outillage professionnel et véhicules, à la location comme à l'achat.
          </h1>
          <p style={{ color: 'rgba(255,255,255,.72)', fontSize: 16, maxWidth: 540, marginBottom: 28, lineHeight: 1.6 }}>
            Par un mécanicien, pour les mécaniciens. Matériel pro dispo tout de suite, jeunes conducteurs acceptés.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/outillage" className="btn btn-primary btn-lg">Voir l'outillage</Link>
            <Link to="/vehicules" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '13px 26px', borderRadius: 10, fontWeight: 700, fontSize: 15,
              background: 'rgba(255,255,255,.12)', color: 'white', border: '1.5px solid rgba(255,255,255,.3)', textDecoration: 'none',
            }}>Voir les véhicules</Link>
          </div>
        </div>
      </div>

      {/* Barre infos rapides */}
      <div style={{ background: 'var(--light)', borderBottom: '1px solid var(--gray-200)', padding: '14px 0' }}>
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

      <div className="container" style={{ paddingTop: 44, paddingBottom: 56 }}>

        {/* Catégories */}
        {categories.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)', marginBottom: 16 }}>Parcourir par catégorie</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
              {categories.map(c => <CategoryTile key={c.id} cat={c}/>)}
            </div>
          </div>
        )}

        {/* Véhicules à louer */}
        {cars.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>Véhicules à louer</h2>
              <Link to="/vehicules" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>
                Voir tout <ArrowRight size={14}/>
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 4 }}>
              {cars.map(car => <CarPreviewCard key={car.id} car={car}/>)}
            </div>
          </div>
        )}

        {/* Outillage populaire */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>Outillage populaire</h2>
            <Link to="/outillage" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>
              Voir tout l'outillage <ArrowRight size={14}/>
            </Link>
          </div>
          {loadingProducts
            ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner"/></div>
            : popularProducts.length === 0
              ? <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: 60 }}>Aucun produit trouvé</p>
              : <div className="grid-4">{popularProducts.map(p => <ProductCard key={p.id} product={p}/>)}</div>
          }
        </div>

        {/* Pourquoi PrestoLocation */}
        <div>
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
    </div>
  );
}
