import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Wrench, Zap, Shield, Truck, Star, ChevronRight, ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import HeroLogo from '../components/HeroLogo';

function ProductCarousel({ products }) {
  const [paused, setPaused] = useState(false);
  const offsetRef = useRef(0);
  const animRef = useRef(null);
  const trackRef = useRef(null);
  const CARD_WIDTH = 230;

  useEffect(() => {
    if (!products.length) return;
    const total = products.length * CARD_WIDTH;
    const step = () => {
      if (!paused) {
        offsetRef.current = (offsetRef.current + 0.7) % total;
        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
        }
      }
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [products, paused]);

  const doubled = [...products, ...products, ...products];

  return (
    <div style={{ overflow: 'hidden', width: '100%', position: 'relative', padding: '8px 0' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 100, background: 'linear-gradient(to right, var(--primary), transparent)', zIndex: 2, pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 100, background: 'linear-gradient(to left, var(--primary), transparent)', zIndex: 2, pointerEvents: 'none' }}/>
      <div ref={trackRef} style={{ display: 'flex', gap: 16, willChange: 'transform' }}>
        {doubled.map((p, i) => (
          <Link key={`${p.id}-${i}`} to={`/produit/${p.id}`} style={{ flexShrink: 0, width: 214, textDecoration: 'none' }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}>
            <div style={{
              borderRadius: 16, overflow: 'hidden',
              border: '1px solid rgba(255,255,255,.1)',
              background: 'rgba(255,255,255,.06)',
              transition: 'all 0.25s ease',
              boxShadow: '0 4px 20px rgba(0,0,0,.3)',
            }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,32,32,.12)'; e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)'; e.currentTarget.style.borderColor = 'rgba(255,32,32,.4)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(255,32,32,.2)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,.3)'; }}>
              <div style={{ height: 150, overflow: 'hidden' }}>
                <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s ease' }}
                  onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
                  onMouseOut={e => e.currentTarget.style.transform = ''}/>
              </div>
              <div style={{ padding: '12px 14px' }}>
                <p style={{ color: 'white', fontWeight: 700, fontSize: 13, lineHeight: 1.3, marginBottom: 6 }}>{p.name}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {p.price_day && <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: 13 }}>{p.price_day} €/j</span>}
                  {p.price_sale && <span style={{ color: 'rgba(255,255,255,.5)', fontWeight: 600, fontSize: 12 }}>{p.price_sale} € achat</span>}
                </div>
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
      {/* Hero — logo 3D + texte + carrousel immédiat */}
      <section style={{ background: 'linear-gradient(160deg, #110000 0%, #1e0505 50%, #0d0000 100%)', color: 'white', paddingTop: 40, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(255,32,32,.08) 0%, transparent 55%)', pointerEvents: 'none' }}/>

        {/* Logo 3D animé au scroll */}
        <HeroLogo />

        {/* Texte centré */}
        <div style={{ textAlign: 'center', padding: '0 20px 40px' }}>
          <p style={{ fontSize: 'clamp(15px,2vw,18px)', opacity: 0.75, marginBottom: 8, lineHeight: 1.7 }}>
            Location et vente d'outillage professionnel à La Réunion.<br/>
            Des outils de qualité pour les mécaniciens de l'auto.
          </p>
          <p style={{ fontStyle: 'italic', color: 'var(--accent)', fontWeight: 700, fontSize: 'clamp(16px,2.5vw,22px)' }}>
            "Par un mécanicien, pour les mécaniciens"
          </p>
        </div>

        {/* Carrousel produits — visible dès l'arrivée */}
        {products.length > 0 && (
          <div>
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.4)', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 14 }}>
              ✦ Nos produits phares ✦
            </p>
            <ProductCarousel products={products}/>
          </div>
        )}

        {/* CTA sous le carrousel */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', padding: '32px 20px 48px' }}>
          <Link to="/catalogue" className="btn btn-primary btn-lg">Voir le catalogue <ArrowRight size={18}/></Link>
          <Link to="/catalogue?type=rent" className="btn btn-outline-light btn-lg">📅 Louer du matériel</Link>
        </div>
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
