import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import Logo from './Logo';
import toast from 'react-hot-toast';

const PHONE = '0693839654';
const EMAIL = 'Locationautopresto@gmail.com';

function copyToClipboard(text, label) {
  navigator.clipboard.writeText(text).then(() => toast.success(`${label} copié !`)).catch(() => {});
}

export default function Footer() {
  const categories = [
    { name: 'Outillage à main', slug: 'outillage-main' },
    { name: 'Outillage électroportatif', slug: 'outillage-electro' },
    { name: 'Équipement de levage', slug: 'levage' },
    { name: 'Diagnostic auto', slug: 'diagnostic' },
    { name: 'Compresseurs & pneumatique', slug: 'compresseurs' },
    { name: 'Équipement de sécurité', slug: 'securite' },
  ];

  return (
    <footer>
      {/* CTA Banner */}
      <div style={{ background: 'var(--primary)', padding: '60px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white', fontSize: 'clamp(22px,4vw,34px)', fontWeight: 800, marginBottom: 12 }}>
            Besoin d'un outil ? On a ce qu'il vous faut.
          </h2>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 16, marginBottom: 28 }}>
            Consultez notre catalogue ou contactez-nous directement
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/catalogue" className="btn btn-primary btn-lg">Voir le catalogue</Link>
            <Link to="/contact" className="btn btn-outline-light btn-lg">Nous contacter</Link>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div style={{ background: 'var(--dark)', color: 'white', padding: '60px 0 30px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 48 }}>
            {/* Brand */}
            <div>
              <Logo size={38} light/>
              <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 14, marginTop: 16, lineHeight: 1.7 }}>
                MecaToolsLoc — Location et vente de matériel d'outillage professionnel à La Réunion.
              </p>
              <p style={{ color: 'var(--accent)', fontStyle: 'italic', fontSize: 13, marginTop: 10, fontWeight: 600 }}>
                "Par un mécanicien, pour les mécaniciens"
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                {[
                  { icon: <span style={{fontSize:14,fontWeight:900}}>FB</span>, href: '#' },
                  { icon: <span style={{fontSize:14,fontWeight:900}}>IG</span>, href: '#' },
                ].map((s, i) => (
                  <a key={i} href={s.href} style={{
                    width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'var(--transition)', color: 'white'
                  }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--accent)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,.1)'}
                  >{s.icon}</a>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: 20, color: 'var(--accent)', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>Navigation</h4>
              {[
                { to: '/', l: 'Accueil' },
                { to: '/catalogue', l: 'Catalogue' },
                { to: '/a-propos', l: 'À propos' },
                { to: '/faq', l: 'FAQ' },
                { to: '/contact', l: 'Contact' },
              ].map(({ to, l }) => (
                <Link key={to} to={to} style={{ display: 'block', color: 'rgba(255,255,255,.65)', fontSize: 14, padding: '5px 0', transition: 'var(--transition)' }}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,.65)'}
                >{l}</Link>
              ))}
            </div>

            {/* Categories */}
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: 20, color: 'var(--accent)', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>Catégories</h4>
              {categories.map(({ name, slug }) => (
                <Link key={slug} to={`/catalogue?category=${slug}`}
                  style={{ display: 'block', color: 'rgba(255,255,255,.65)', fontSize: 14, padding: '5px 0', transition: 'var(--transition)' }}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,.65)'}
                >{name}</Link>
              ))}
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: 20, color: 'var(--accent)', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>Contact</h4>

              {/* Phone — opens dialer on mobile, copies on desktop */}
              <a href={`tel:+262${PHONE.slice(1)}`}
                onClick={(e) => { if (!('ontouchstart' in window)) { e.preventDefault(); copyToClipboard(PHONE, 'Numéro'); } }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14, color: 'rgba(255,255,255,.7)', fontSize: 14, textDecoration: 'none', cursor: 'pointer' }}>
                <span style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }}><Phone size={15}/></span>
                {PHONE.replace(/(\d{2})(?=\d)/g, '$1 ').trim()}
              </a>

              {/* Email — copies to clipboard */}
              <div onClick={() => copyToClipboard(EMAIL, 'Email')}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14, color: 'rgba(255,255,255,.7)', fontSize: 14, cursor: 'pointer' }}>
                <span style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }}><Mail size={15}/></span>
                {EMAIL}
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14, color: 'rgba(255,255,255,.7)', fontSize: 14 }}>
                <span style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }}><MapPin size={15}/></span>
                La Réunion
              </div>

              <div style={{ background: 'rgba(255,51,51,.15)', border: '1px solid rgba(255,51,51,.3)', borderRadius: 10, padding: '10px 14px', marginTop: 8 }}>
                <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 13 }}>🏷️ -10% retrait sur place</p>
                <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 12, marginTop: 4 }}>Remise accordée à la récupération chez nous</p>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13 }}>© 2025 MecaToolsLoc. Tous droits réservés.</p>
            <div style={{ display: 'flex', gap: 24 }}>
              {['Mentions légales', 'CGV', 'Politique de confidentialité'].map(l => (
                <Link key={l} to="#" style={{ color: 'rgba(255,255,255,.4)', fontSize: 13 }}>{l}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
