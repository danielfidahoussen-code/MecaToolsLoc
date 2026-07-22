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

  const vehicleCategories = [
    { name: 'Citadine', to: '/vehicules' },
    { name: 'Compacte', to: '/vehicules' },
    { name: 'Hybride', to: '/vehicules' },
    { name: 'SUV', to: '/vehicules' },
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
                LVTools — Location et vente de matériel d'outillage professionnel et location de véhicules à La Réunion.
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

            {/* Vehicle categories */}
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: 20, color: 'var(--accent)', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>Véhicules</h4>
              {vehicleCategories.map(({ name, to }) => (
                <Link key={name} to={to}
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
                style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14, color: 'rgba(255,255,255,.7)', fontSize: 14, textDecoration: 'none', cursor: 'pointer', borderRadius: 6, padding: '2px 6px', marginLeft: -6, transition: 'background 0.2s, color 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,51,51,.18)'; e.currentTarget.style.color = 'white'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.7)'; }}>
                <span style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }}><Phone size={15}/></span>
                {PHONE.replace(/(\d{2})(?=\d)/g, '$1 ').trim()}
              </a>

              {/* Email — copies to clipboard */}
              <div onClick={() => copyToClipboard(EMAIL, 'Email')}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14, color: 'rgba(255,255,255,.7)', fontSize: 14, cursor: 'pointer', borderRadius: 6, padding: '2px 6px', marginLeft: -6, transition: 'background 0.2s, color 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,51,51,.18)'; e.currentTarget.style.color = 'white'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.7)'; }}>
                <span style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }}><Mail size={15}/></span>
                {EMAIL}
              </div>

              <a
                href="https://www.google.com/maps/place/Auto+Presto/@-20.9048811,55.4930903,17z/data=!3m1!4b1!4m6!3m5!1s0x217881e974a69313:0x172d7cd13ab5eca3!8m2!3d-20.9048811!4d55.4930903!16s%2Fg%2F11k5sgjzsp?entry=ttu&g_ep=EgoyMDI2MDUyNy4wIKXMDSoASAFQAw%3D%3D"
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14, color: 'rgba(255,255,255,.7)', fontSize: 14, textDecoration: 'none', borderRadius: 6, padding: '2px 6px', marginLeft: -6, transition: 'background 0.2s, color 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,51,51,.18)'; e.currentTarget.style.color = 'white'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.7)'; }}>
                <span style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }}><MapPin size={15}/></span>
                3 rue de la Guadeloupe,<br/>Moufia 97490 — La Réunion
              </a>

              <div style={{ background: 'rgba(255,51,51,.15)', border: '1px solid rgba(255,51,51,.3)', borderRadius: 10, padding: '10px 14px', marginTop: 8 }}>
                <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 13 }}>-10% retrait sur place</p>
                <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 12, marginTop: 4 }}>Remise accordée à la récupération chez nous</p>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13 }}>© 2025 LVTools. Tous droits réservés.</p>
            <div style={{ display: 'flex', gap: 24 }}>
              {[
                { l: 'Mentions légales', to: '/mentions-legales' },
                { l: 'CGV', to: '/cgv' },
                { l: 'Politique de confidentialité', to: '/confidentialite' },
              ].map(({ l, to }) => (
                <Link key={l} to={to} style={{ color: 'rgba(255,255,255,.4)', fontSize: 13, transition: 'color .2s' }}
                  onMouseOver={e => e.currentTarget.style.color = 'rgba(255,255,255,.8)'}
                  onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,.4)'}>{l}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
