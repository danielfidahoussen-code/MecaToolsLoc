import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [activeType, setActiveType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/products/categories').then(r => setCategories(r.data));
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

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {types.map(t => (
          <button key={t.id} onClick={() => setActiveType(t.id)} style={{
            padding: '7px 16px', borderRadius: 20, fontWeight: 700, fontSize: 13, cursor: 'pointer',
            background: activeType === t.id ? 'var(--primary)' : 'var(--gray-100)',
            color: activeType === t.id ? 'white' : 'var(--gray-700)',
            border: 'none',
          }}>{t.label}</button>
        ))}
        <div style={{ width: 1, background: 'var(--gray-200)', margin: '0 4px' }}/>
        {categories.map(c => (
          <button key={c.id} onClick={() => setActiveCategory(activeCategory === c.slug ? '' : c.slug)} style={{
            padding: '7px 16px', borderRadius: 20, fontWeight: 700, fontSize: 13, cursor: 'pointer',
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
