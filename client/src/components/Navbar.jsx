import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Wrench, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const { count, setIsOpen } = useCart();
  const { isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/catalogue', label: 'Catalogue' },
    { to: '/a-propos', label: 'À propos' },
    { to: '/faq', label: 'FAQ' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      {/* Top bar */}
      <div style={{ background: 'var(--primary)', color: 'white', padding: '8px 0', fontSize: '13px' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Phone size={13}/> 06 93 83 96 54
          </span>
          <span style={{ opacity: 0.7 }}>Par un mécanicien, pour les mécaniciens</span>
          <span>Locationautopresto@gmail.com</span>
        </div>
      </div>

      {/* Main navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 1000,
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'var(--white)',
        boxShadow: scrolled ? 'var(--shadow)' : 'var(--shadow-sm)',
        borderBottom: '1px solid var(--gray-200)',
        transition: 'var(--transition)'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
          <Link to="/"><Logo size={38}/></Link>

          {/* Desktop links */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="desktop-nav">
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
                padding: '8px 14px', borderRadius: 8, fontWeight: 600, fontSize: 14,
                color: isActive ? 'var(--accent-dark)' : 'var(--gray-800)',
                background: isActive ? 'rgba(245,197,24,.1)' : 'transparent',
                transition: 'var(--transition)'
              })}>
                {label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" style={({ isActive }) => ({
                padding: '8px 14px', borderRadius: 8, fontWeight: 600, fontSize: 14,
                color: isActive ? 'var(--accent-dark)' : 'var(--primary)',
                background: isActive ? 'rgba(245,197,24,.1)' : 'rgba(26,35,64,.05)',
              })}>
                Admin
              </NavLink>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isAdmin && (
              <button className="btn btn-sm btn-outline" onClick={logout}>Déconnexion</button>
            )}
            <button
              onClick={() => setIsOpen(true)}
              style={{
                position: 'relative', padding: '10px 12px', borderRadius: 10,
                background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', gap: 6,
                fontWeight: 600, fontSize: 14
              }}
            >
              <ShoppingCart size={18}/>
              Panier
              {count > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  background: 'var(--accent)', color: 'var(--primary)',
                  borderRadius: '50%', width: 20, height: 20,
                  fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{count}</span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              className="mobile-only"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ padding: 8, borderRadius: 8, background: 'var(--gray-100)' }}
            >
              {menuOpen ? <X size={22}/> : <Menu size={22}/>}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ borderTop: '1px solid var(--gray-200)', background: 'white', padding: '12px 20px 16px' }}>
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '12px 0', fontWeight: 600, fontSize: 15, borderBottom: '1px solid var(--gray-100)' }}>
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <CartDrawer/>

      <style>{`
        .desktop-nav { display: flex; }
        .mobile-only { display: none; }
        @media (max-width: 768px) {
          .desktop-nav { display: none; }
          .mobile-only { display: flex !important; }
        }
      `}</style>
    </>
  );
}
