import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Wrench, Zap, Shield, Truck, Star, ChevronRight, ArrowRight, ChevronLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';

function ProductCarousel({ products }) {
  const trackRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const CARD_WIDTH = 220; // px including gap

  useEffect(() => {
    if (!products.length) return;
    const interval = setInterval(() => {
      setOffset(prev => {
        const maxOffset = products.length * CARD_WIDTH;
        return (prev + 1) % maxOffset;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [products]);

  // Duplicate items for infinite loop effect
  const doubled = [...products, ...products];

  return (
    <div style={{ overflow: 'hidden', width: '100%', position: 'relative' }}>
      {/* Fade edges */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to right, var(--primary), transparent)', zIndex: 2, pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to left, var(--primary), transparent)', zIndex: 2, pointerEvents: 'none' }}/>

      <div ref={trackRef} style={{ display: 'flex', gap: 20, transform: `translateX(-${offset}px)`, transition: 'none', willChange: 'transform' }}>
        {doubled.map((p, i) => (
          <Link key={`${p.id}-${i}`} to={`/produit/${p.id}`} style={{ flexShrink: 0, width: 200, textDecoration: 'none' }}>
            <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.06)', transition: 'var(--transition)' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,.12)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.transform = ''; }}>
              <img src={p.image} alt={p.name} style={{ width: '100%', height: 130, objectFit: 'cover' }}/>
              <div style={{ padding: '10px 12px' }}>
                <p style={{ color: 'white', fontWeight: 700, fontSize: 12, lineHeight: 1.3, marginBottom: 4 }}>{p.name}</p>
                <p style={{ color: 'var(--accent)', fontWeight: 800, fontSize: 13 }}>
                  {p.price_day ? `${p.price_day} €/j` : p.price_sale ? `${p.price_sale} €` : ''}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get('/api/products?limit=12').then(r => setProducts(r.data.products));
    axios.get('/api/products/categories').then(r => setCategories(r.data));
  }, []);

  return (
    <div>
      {/* Hero with integrated carousel */}
      <section style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 60%, #2d4a7a 100%)', color: 'white', padding: '80px 0 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(245,197,24,.08) 0%, transparent 60%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(245,197,24,.05)', pointerEvents: 'none' }}/>
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ maxWidth: 640 }}>
            <span className="section-label" style={{ color: 'var(--accent)' }}>🔧 MecaToolsLoc — La Réunion</span>
            <h1 style={{ fontSize: 'clamp(32px,5.5vw,58px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20 }}>
              L'outillage pro,<br/>
              <span style={{ color: 'var(--accent)' }}>au bon prix.</span>
            </h1>
            <p style={{ fontSize: 18, opacity: 0.85, marginBottom: 12, lineHeight: 1.7 }}>
              Location et vente d'outillage professionnel à La Réunion.
              <br/>Des outils de qualité pour les mécaniciens exigeants.
            </p>
            <p style={{ fontStyle: 'italic', color: 'var(--accent)', fontWeight: 600, fontSize: 15, marginBottom: 36 }}>
              "Par un mécanicien, pour les mécaniciens"
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/catalogue" className="btn btn-primary btn-lg">
                Voir le catalogue <ArrowRight size={18}/>
              </Link>
              <Link to="/catalogue?type=rent" className="btn btn-outline-light btn-lg">
                📅 Louer du matériel
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 30, marginTop: 44, flexWrap: 'wrap' }}>
              {[['100+', 'Références'], ['⭐ 5/5', 'Satisfaction'], ['48h', 'Réponse max']].map(([v, l]) => (
                <div key={l}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>{v}</p>
                  <p style={{ fontSize: 13, opacity: 0.7 }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Carousel directly in hero */}
        {products.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.5)', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
              ✦ Nos produits phares ✦
            </p>
            <ProductCarousel products={products}/>
          </div>
        )}
      </section>

      {/* Why us */}
      <section style={{ padding: '70px 0', background: 'var(--light)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {[
              { icon: <Wrench size={28}/>, title: 'Matériel pro', desc: 'Outils de qualité professionnelle, entretenus et vérifiés avant chaque location.' },
              { icon: <Zap size={28}/>, title: 'Disponibilité rapide', desc: 'Réservation en ligne 24/7 avec confirmation immédiate et calendrier en temps réel.' },
              { icon: <Truck size={28}/>, title: 'Livraison sur île', desc: 'Livraison possible sur La Réunion. Retrait sur place également disponible.' },
              { icon: <Shield size={28}/>, title: 'Paiement sécurisé', desc: 'Paiement en ligne sécurisé par carte bancaire. Caution remboursée à la restitution.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="card" style={{ padding: '28px 24px', transition: 'var(--transition)' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(245,197,24,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-dark)', marginBottom: 16 }}>
                  {icon}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary)', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '70px 0' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">Nos catégories</span>
            <h2 className="section-title">Tout ce qu'il faut pour votre atelier</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
            {categories.map(cat => (
              <Link key={cat.id} to={`/catalogue?category=${cat.slug}`}
                style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '24px 16px', borderRadius: 14, border: '1.5px solid var(--gray-200)',
                  textAlign: 'center', background: 'white', transition: 'var(--transition)'
                }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'rgba(245,197,24,.05)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = ''; }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>{cat.icon}</div>
                  <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)', lineHeight: 1.3 }}>{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section style={{ padding: '70px 0', background: 'var(--light)' }}>
        <div className="container">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', textAlign: 'left' }}>
            <div>
              <span className="section-label">Sélection</span>
              <h2 className="section-title">Nos produits phares</h2>
            </div>
            <Link to="/catalogue" className="btn btn-outline btn-sm" style={{ flexShrink: 0 }}>
              Tout voir <ChevronRight size={14}/>
            </Link>
          </div>
          <div className="grid-4">
            {products.map(p => <ProductCard key={p.id} product={p}/>)}
          </div>
        </div>
      </section>

      {/* Testimonial / Trust */}
      <section style={{ background: 'var(--primary)', padding: '70px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="section-label">Ils nous font confiance</span>
          <h2 style={{ color: 'white', fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, marginBottom: 48 }}>
            Ce que nos clients disent
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {[
              { name: 'Thomas M.', role: 'Mécanicien indépendant', text: 'Matériel impeccable, toujours propre et bien entretenu. La réservation en ligne est super pratique !', stars: 5 },
              { name: 'Karim B.', role: 'Garage auto', text: 'Super service, livraison rapide et prix très compétitifs. Je recommande à tous mes confrères.', stars: 5 },
              { name: 'Marie-Laure P.', role: 'Bricoleur passionné', text: 'Enfin un service de location d\'outillage pro à La Réunion ! Le patron connaît vraiment son métier.', stars: 5 },
            ].map(({ name, role, text, stars }) => (
              <div key={name} style={{ background: 'rgba(255,255,255,.08)', borderRadius: 16, padding: '24px', textAlign: 'left', border: '1px solid rgba(255,255,255,.1)' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                  {[...Array(stars)].map((_, i) => <Star key={i} size={16} fill="var(--accent)" color="var(--accent)"/>)}
                </div>
                <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>"{text}"</p>
                <div>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{name}</p>
                  <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 12 }}>{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '70px 0' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-label">Comment ça marche ?</span>
            <h2 className="section-title">Location en 4 étapes simples</h2>
          </div>
          <div className="grid-4">
            {[
              { n: '01', title: 'Choisissez', desc: 'Parcourez notre catalogue et sélectionnez l\'outil souhaité' },
              { n: '02', title: 'Réservez', desc: 'Choisissez vos dates sur le calendrier de disponibilité' },
              { n: '03', title: 'Payez', desc: 'Paiement sécurisé en ligne par carte bancaire' },
              { n: '04', title: 'Récupérez', desc: 'Venez chercher votre matériel ou optez pour la livraison' },
            ].map(({ n, title, desc }) => (
              <div key={n} style={{ textAlign: 'center', padding: 24 }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--accent)', color: 'var(--primary)', fontWeight: 900, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>{n}</div>
                <h3 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
