import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const { count, setIsOpen } = useCart();
  const { isAdmin, logout } = useAuth();
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
    { to: '/', label: 'Accueil' },
    { to: '/catalogue', label: 'Catalogue' },
    { to: '/autres-services', label: 'Location de véhicules' },
    { to: '/a-propos', label: 'À propos' },
    { to: '/faq', label: 'FAQ' },
    { to: '/contact', label: 'Contact' },
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
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenuOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center',
                  padding: '14px 20px', fontWeight: 600, fontSize: 15,
                  borderBottom: '1px solid var(--gray-100)',
                  color: isActive ? 'var(--accent)' : 'var(--gray-800)',
                  background: isActive ? 'rgba(255,51,51,.04)' : 'transparent',
                })}>
                {label}
              </NavLink>
            ))}
            {isAdmin && (
              <>
                <NavLink to="/admin" onClick={() => setMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', fontWeight: 700, fontSize: 15, borderBottom: '1px solid var(--gray-100)', color: 'var(--primary)' }}>
                  Admin
                </NavLink>
                <button onClick={() => { logout(); setMenuOpen(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', fontWeight: 600, fontSize: 15, width: '100%', color: 'var(--danger)', borderBottom: '1px solid var(--gray-100)' }}>
                  Déconnexion
                </button>
              </>
            )}
            {/* Contact rapide dans le menu */}
            <div style={{ padding: '14px 20px', display: 'flex', gap: 12 }}>
              <a href="tel:+262693839654" className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Appeler</a>
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
