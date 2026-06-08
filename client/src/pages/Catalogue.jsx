import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Catalogue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const type = searchParams.get('type') || '';
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const setParam = (key, val) => {
    const np = new URLSearchParams(searchParams);
    if (val) np.set(key, val); else np.delete(key);
    np.delete('page');
    setSearchParams(np);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    const params = { type, category, search, page, limit: 12 };
    axios.get('/api/products', { params }).then(r => {
      setProducts(r.data.products);
      setTotal(r.data.total);
      setPages(r.data.pages);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [type, category, search, page]);

  useEffect(() => {
    axios.get('/api/products/categories').then(r => setCategories(r.data));
  }, []);

  const typeLabels = { '': 'Tout', 'rent': 'Location', 'sale': 'Achat' };

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Notre Catalogue</h1>
          <p>Outillage professionnel à louer et à acheter</p>
        </div>
      </div>

      <div className="page" style={{ paddingTop: 40 }}>
        <div className="container">
          {/* Filters */}
          <div style={{ background: 'var(--light)', borderRadius: 14, padding: '20px 24px', marginBottom: 32, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ flex: '1 1 240px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}/>
              <input className="form-control" placeholder="Rechercher un outil..." value={search}
                onChange={e => setParam('search', e.target.value)}
                style={{ paddingLeft: 38 }}/>
            </div>

            {/* Type */}
            <div style={{ display: 'flex', gap: 6 }}>
              {Object.entries(typeLabels).map(([val, label]) => (
                <button key={val} className={`btn btn-sm ${type === val ? 'btn-dark' : 'btn-outline'}`}
                  onClick={() => setParam('type', val)}>{label}</button>
              ))}
            </div>

            {/* Category */}
            <select className="form-control" value={category} onChange={e => setParam('category', e.target.value)} style={{ flex: '0 0 200px' }}>
              <option value="">Toutes catégories</option>
              {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>

            {/* Clear */}
            {(type || category || search) && (
              <button className="btn btn-sm" style={{ background: 'var(--gray-200)', color: 'var(--gray-700)' }}
                onClick={() => setSearchParams({})}>
                <X size={14}/> Effacer
              </button>
            )}
          </div>

          {/* Results count */}
          <p style={{ color: 'var(--gray-600)', fontSize: 14, marginBottom: 24 }}>
            {loading ? 'Chargement...' : `${total} produit${total !== 1 ? 's' : ''} trouvé${total !== 1 ? 's' : ''}`}
          </p>

          {/* Grid */}
          {loading ? (
            <div className="loading-center"><div className="spinner"/></div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray-400)' }}>
              <SlidersHorizontal size={48} style={{ marginBottom: 16, opacity: 0.3 }}/>
              <p style={{ fontWeight: 700, fontSize: 18 }}>Aucun produit trouvé</p>
              <p style={{ fontSize: 14, marginTop: 8 }}>Essayez de modifier vos filtres</p>
            </div>
          ) : (
            <div className="grid-4">
              {products.map(p => <ProductCard key={p.id} product={p}/>)}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}>
              {[...Array(pages)].map((_, i) => (
                <button key={i} className={`btn btn-sm ${page === i + 1 ? 'btn-dark' : 'btn-outline'}`}
                  onClick={() => { const np = new URLSearchParams(searchParams); np.set('page', i + 1); setSearchParams(np); }}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
