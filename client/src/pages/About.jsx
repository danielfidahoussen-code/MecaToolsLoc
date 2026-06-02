import { Link } from 'react-router-dom';
import { Wrench, Heart, Award } from 'lucide-react';

export default function About() {
  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>À propos de MecaToolsLoc</h1>
          <p>"Par un mécanicien, pour les mécaniciens"</p>
        </div>
      </div>

      <div className="page">
        <div className="container">
          {/* Story */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', marginBottom: 80 }}>
            <div>
              <span className="section-label">Notre histoire</span>
              <h2 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, color: 'var(--primary)', marginBottom: 20, lineHeight: 1.2 }}>
                Né de la passion<br/>de la mécanique
              </h2>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.8, marginBottom: 16 }}>
                MecaToolsLoc est née d'un constat simple : le matériel d'outillage professionnel coûte cher à l'achat,
                et de nombreux mécaniciens — qu'ils soient indépendants ou amateurs passionnés — n'ont pas toujours
                besoin d'un outil pour longtemps.
              </p>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.8, marginBottom: 16 }}>
                Fondée par un mécanicien de métier avec plus de 8 ans d'expérience en mécanique automobile,
                notre entreprise vous propose la location et la vente d'outillage professionnel de qualité,
                à des prix accessibles, directement à La Réunion.
              </p>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.8, marginBottom: 28 }}>
                Nous croyons que chaque mécanicien mérite d'avoir accès aux bons outils, sans se ruiner. C'est pourquoi
                nous sélectionnons rigoureusement chaque référence de notre catalogue et entretenons notre matériel
                avec le même soin que si c'était le nôtre.
              </p>
              <Link to="/catalogue" className="btn btn-primary btn-lg">
                Découvrir notre catalogue <Wrench size={18}/>
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <img src="/api/placeholder/540/440?text=MecaToolsLoc+Atelier" alt="Notre atelier"
                style={{ width: '100%', borderRadius: 20, boxShadow: 'var(--shadow-lg)' }}/>
              <div style={{ position: 'absolute', bottom: -20, left: -20, background: 'var(--accent)', borderRadius: 16, padding: '20px 28px', boxShadow: 'var(--shadow)' }}>
                <p style={{ fontWeight: 900, fontSize: 32, color: 'white', lineHeight: 1 }}>8+</p>
                <p style={{ fontWeight: 700, fontSize: 13, color: 'white' }}>Ans d'expérience</p>
              </div>
            </div>
          </div>

          {/* Values */}
          <div style={{ marginBottom: 80 }}>
            <div className="section-header">
              <span className="section-label">Nos valeurs</span>
              <h2 className="section-title">Ce qui nous guide chaque jour</h2>
            </div>
            <div className="grid-3">
              {[
                { icon: <Wrench size={32}/>, title: 'Qualité avant tout', desc: 'Chaque outil est contrôlé, nettoyé et vérifié avant et après chaque utilisation. Nous ne proposons que du matériel en parfait état.' },
                { icon: <Heart size={32}/>, title: 'Service client', desc: 'Vous avez une question ? Un problème ? Contactez-nous directement, nous répondons rapidement.' },
                { icon: <Award size={32}/>, title: 'Prix honnêtes', desc: 'Pas de frais cachés, pas de mauvaises surprises. Nos tarifs sont transparents. Remise de 10 % pour le retrait sur place.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ textAlign: 'center', padding: 32 }}>
                  <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,51,51,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', margin: '0 auto 20px' }}>
                    {icon}
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary)', marginBottom: 12 }}>{title}</h3>
                  <p style={{ color: 'var(--gray-600)', lineHeight: 1.7 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ background: 'var(--primary)', borderRadius: 24, padding: '60px 40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, textAlign: 'center' }}>
              {[
                { n: '8+', l: "Années d'expérience en mécanique automobile" },
                { n: '10%', l: 'De remise pour retrait sur place' },
              ].map(({ n, l }) => (
                <div key={l}>
                  <p style={{ fontSize: 52, fontWeight: 900, color: 'var(--accent)', lineHeight: 1 }}>{n}</p>
                  <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 15, marginTop: 10 }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .container > div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
