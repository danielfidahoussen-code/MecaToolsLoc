import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

function startPriceOf(car) {
  const tiers = [car.price_1_3, car.price_4_10, car.price_11_20, car.price_21_29, car.price_30plus,
    car.price_day, car.price_5days, car.price_2weeks].filter(v => v > 0);
  return tiers.length ? Math.min(...tiers) : null;
}

function CarPreviewCard({ car }) {
  const price = startPriceOf(car);
  return (
    <Link to="/autres-services" style={{ textDecoration: 'none', flexShrink: 0, width: 220 }}>
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ height: 130, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--gray-100)', overflow: 'hidden' }}>
          {car.image
            ? <img src={car.image} alt={car.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            : <p style={{ color: 'var(--gray-400)', fontSize: 12, fontWeight: 600 }}>Photo à venir</p>}
        </div>
        <div style={{ padding: '12px 14px' }}>
          <p style={{ fontWeight: 800, fontSize: 14, color: 'var(--primary)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{car.name}</p>
          {price != null && (
            <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>À partir de <strong style={{ color: 'var(--accent)' }}>{price} €/j</strong></p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [activeType, setActiveType] = useState('');
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState([]);

  useEffect(() => {
    axios.get('/api/products/categories').then(r => setCategories(r.data));
    axios.get('/api/cars').then(r => setCars(r.data.slice(0, 6))).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 50 });
    if (activeCategory) params.set('category', activeCategory);
    if (activeType) params.set('type', activeType);
    axios.get(`/api/products?${params}`).then(r => {
      setProducts(r.data.products);
      setLoading(false);
    });
  }, [activeCategory, activeType]);

  const types = [
    { id: '', label: 'Tout' },
    { id: 'rent', label: 'Location' },
    { id: 'sale', label: 'Achat' },
  ];

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>

      {/* Bannière Location de véhicules */}
      <Link to="/autres-services" style={{ textDecoration: 'none', display: 'block', marginBottom: 24 }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, #3a0808 100%)',
          borderRadius: 16,
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          boxShadow: 'var(--shadow)',
          cursor: 'pointer',
          transition: 'var(--transition)',
        }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={e => e.currentTarget.style.transform = ''}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ background: 'rgba(255,51,51,0.25)', borderRadius: 12, padding: 10, flexShrink: 0 }}>
              <Car size={24} color="white"/>
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 15, color: 'white', lineHeight: 1.2 }}>Location de véhicules</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 3 }}>Yaris, Picanto, C3, Auris, Lexus CT200h, Outlander…</p>
            </div>
          </div>
          <div style={{
            background: 'var(--accent)',
            color: 'white',
            fontWeight: 700,
            fontSize: 13,
            padding: '9px 18px',
            borderRadius: 10,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            Louer
          </div>
        </div>
      </Link>

      {/* Aperçu véhicules disponibles */}
      {cars.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>Véhicules à louer</h2>
            <Link to="/autres-services" style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>Voir tout →</Link>
          </div>
          <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 4 }}>
            {cars.map(car => <CarPreviewCard key={car.id} car={car}/>)}
          </div>
        </div>
      )}

      <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)', marginBottom: 12 }}>Outillage</h2>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
        {types.map(t => (
          <button key={t.id} onClick={() => setActiveType(t.id)} style={{
            padding: '7px 16px', borderRadius: 20, fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            background: activeType === t.id ? 'var(--primary)' : 'var(--gray-100)',
            color: activeType === t.id ? 'white' : 'var(--gray-700)',
            border: 'none',
          }}>{t.label}</button>
        ))}
        <div style={{ width: 1, background: 'var(--gray-200)', margin: '0 4px', flexShrink: 0 }}/>
        {categories.map(c => (
          <button key={c.id} onClick={() => setActiveCategory(activeCategory === c.slug ? '' : c.slug)} style={{
            padding: '7px 16px', borderRadius: 20, fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            background: activeCategory === c.slug ? 'var(--accent)' : 'var(--gray-100)',
            color: activeCategory === c.slug ? 'white' : 'var(--gray-700)',
            border: 'none',
          }}>{c.name}</button>
        ))}
      </div>

      {/* Grille produits */}
      {loading
        ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner"/></div>
        : products.length === 0
          ? <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: 60 }}>Aucun produit trouvé</p>
          : <div className="grid-4">{products.map(p => <ProductCard key={p.id} product={p}/>)}</div>
      }
    </div>
  );
}
