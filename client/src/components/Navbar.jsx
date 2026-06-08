import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { usePrice } from '../context/PriceContext';
import Logo from './Logo';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const { count, setIsOpen } = useCart();
  const { isAdmin, logout } = useAuth();
  const { isPro, toggle } = usePrice();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Ferme le menu quand on resize vers desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const navLinks = [
    { to: '/', label: 'Accueil', icon: '🏠' },
    { to: '/catalogue', label: 'Catalogue', icon: '🔧' },
    { to: '/a-propos', label: 'À propos', icon: 'ℹ️' },
    { to: '/faq', label: 'FAQ', icon: '❓' },
    { to: '/contact', label: 'Contact', icon: '📞' },
  ];

  return (
    <>
      {/* Top bar */}
      <div style={{ background: 'var(--primary)', color: 'white', padding: '7px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,.7)', fontStyle: 'italic', fontSize: 13, letterSpacing: '0.4px' }}>
            Par un mécanicien, pour les mécaniciens
          </span>
        </div>
      </div>

      {/* Main navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 1000,
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'var(--white)',
        boxShadow: scrolled ? 'var(--shadow)' : 'var(--shadow-sm)',
        borderBottom: '1px solid var(--gray-200)',
        transition: 'var(--transition)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link to="/" onClick={() => setMenuOpen(false)}><Logo size={34}/></Link>

          {/* Desktop links */}
          <div style={{ display: 'flex', gap: 2, alignItems: 'center' }} className="desktop-nav">
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
                padding: '8px 13px', borderRadius: 8, fontWeight: 600, fontSize: 14,
                color: isActive ? 'var(--accent)' : 'var(--gray-800)',
                background: isActive ? 'rgba(255,51,51,.08)' : 'transparent',
                transition: 'var(--transition)',
              })}>
                {label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" style={({ isActive }) => ({
                padding: '8px 13px', borderRadius: 8, fontWeight: 600, fontSize: 14,
                color: isActive ? 'var(--accent)' : 'var(--primary)',
                background: isActive ? 'rgba(255,51,51,.08)' : 'rgba(34,4,4,.05)',
              })}>Admin</NavLink>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isAdmin && (
              <button className="btn btn-sm btn-outline desktop-nav" onClick={logout}>Déconnexion</button>
            )}

            {/* Toggle HT / TTC */}
            <button onClick={toggle} title={isPro ? 'Passer en mode Particulier (TTC)' : 'Passer en mode Pro (HT)'} style={{
              display: 'flex', alignItems: 'center', gap: 0,
              borderRadius: 20, overflow: 'hidden', border: '1.5px solid var(--gray-200)',
              background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 700, height: 36,
            }}>
              <span style={{ padding: '0 10px', background: !isPro ? 'var(--primary)' : 'transparent', color: !isPro ? 'white' : 'var(--gray-500)', transition: 'var(--transition)', height: '100%', display: 'flex', alignItems: 'center' }}>TTC</span>
              <span style={{ padding: '0 10px', background: isPro ? 'var(--accent)' : 'transparent', color: isPro ? 'white' : 'var(--gray-500)', transition: 'var(--transition)', height: '100%', display: 'flex', alignItems: 'center' }}>HT Pro</span>
            </button>

            {/* Panier */}
            <button onClick={() => setIsOpen(true)} style={{
              position: 'relative', padding: '10px 14px', borderRadius: 10,
              background: 'var(--primary)', color: 'white',
              display: 'flex', alignItems: 'center', gap: 6,
              fontWeight: 700, fontSize: 14, minHeight: 44,
            }}>
              <ShoppingCart size={18}/>
              <span className="cart-label">Panier</span>
              {count > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  background: 'var(--accent)', color: 'white',
                  borderRadius: '50%', width: 20, height: 20,
                  fontSize: 11, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{count}</span>
              )}
            </button>

            {/* Hamburger */}
            <button className="mobile-only" onClick={() => setMenuOpen(m => !m)}
              style={{ padding: 10, borderRadius: 10, background: menuOpen ? 'var(--primary)' : 'var(--gray-100)', minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {menuOpen ? <X size={22} color={menuOpen ? 'white' : undefined}/> : <Menu size={22}/>}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ borderTop: '1px solid var(--gray-100)', background: 'white', paddingBottom: 16 }}>
            {navLinks.map(({ to, label, icon }) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenuOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 20px', fontWeight: 600, fontSize: 15,
                  borderBottom: '1px solid var(--gray-100)',
                  color: isActive ? 'var(--accent)' : 'var(--gray-800)',
                  background: isActive ? 'rgba(255,51,51,.04)' : 'transparent',
                })}>
                <span style={{ fontSize: 18 }}>{icon}</span> {label}
              </NavLink>
            ))}
            {isAdmin && (
              <>
                <NavLink to="/admin" onClick={() => setMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', fontWeight: 700, fontSize: 15, borderBottom: '1px solid var(--gray-100)', color: 'var(--primary)' }}>
                  ⚙️ Admin
                </NavLink>
                <button onClick={() => { logout(); setMenuOpen(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', fontWeight: 600, fontSize: 15, width: '100%', color: 'var(--danger)', borderBottom: '1px solid var(--gray-100)' }}>
                  🚪 Déconnexion
                </button>
              </>
            )}
            {/* Toggle HT/TTC mobile */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-100)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: 8 }}>Affichage des prix</p>
              <button onClick={toggle} style={{ display: 'flex', borderRadius: 20, overflow: 'hidden', border: '1.5px solid var(--gray-200)', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700, height: 38 }}>
                <span style={{ padding: '0 16px', background: !isPro ? 'var(--primary)' : 'transparent', color: !isPro ? 'white' : 'var(--gray-500)', height: '100%', display: 'flex', alignItems: 'center' }}>Particulier (TTC)</span>
                <span style={{ padding: '0 16px', background: isPro ? 'var(--accent)' : 'transparent', color: isPro ? 'white' : 'var(--gray-500)', height: '100%', display: 'flex', alignItems: 'center' }}>Pro (HT)</span>
              </button>
            </div>

            {/* Contact rapide dans le menu */}
            <div style={{ padding: '14px 20px', display: 'flex', gap: 12 }}>
              <a href="tel:+262693839654" className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>📞 Appeler</a>
              <Link to="/contact" className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>Nous écrire</Link>
            </div>
          </div>
        )}
      </nav>

      <CartDrawer/>

      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-only { display: none !important; }
        .cart-label { display: inline; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-only { display: flex !important; }
          .cart-label { display: none; }
        }
      `}</style>
    </>
  );
}
