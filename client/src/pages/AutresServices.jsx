import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Calendar } from 'lucide-react';

const CARS = [
  {
    name: 'Lexus CT200h',
    subtitle: 'Hybride',
    description: 'Berline hybride compacte haut de gamme. Silencieuse, économique et fiable. Idéale pour les trajets quotidiens ou les longues distances sur La Réunion.',
    specs: ['Hybride essence/électrique', 'Boîte automatique', '5 places', 'Climatisation', 'GPS intégré'],
    price_day: 45,
    price_2weeks: 39,
    image: null,
  },
  {
    name: 'Toyota Auris',
    subtitle: 'Hybride',
    description: 'Compacte hybride polyvalente, parfaite pour découvrir l\'île. Conduite agréable, faible consommation et espace généreux pour vos bagages.',
    specs: ['Hybride essence/électrique', 'Boîte automatique', '5 places', 'Climatisation', 'Coffre spacieux'],
    price_day: 39,
    price_2weeks: 35,
    image: null,
  },
];

export default function AutresServices() {
  return (
    <div>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', padding: '48px 0 40px' }}>
        <div className="container">
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,.5)', marginBottom: 8 }}>Groupe AutoPresto</p>
          <h1 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, marginBottom: 12 }}>Location de véhicules</h1>
          <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 16, maxWidth: 520 }}>
            Véhicules hybrides disponibles à Saint-Denis et Saint-Pierre. Ouverts aux jeunes conducteurs.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>

        {/* Véhicules */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28, marginBottom: 48 }}>
          {CARS.map(car => (
            <div key={car.name} className="card" style={{ overflow: 'hidden' }}>
              {/* Image placeholder */}
              <div style={{ height: 240, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {car.image
                  ? <img src={car.image} alt={car.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  : <div style={{ textAlign: 'center', color: 'rgba(255,255,255,.3)' }}>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>Photo à venir</p>
                      <p style={{ fontSize: 12, marginTop: 4 }}>{car.name} {car.subtitle}</p>
                    </div>
                }
                <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: 'white' }}>
                  Hybride
                </div>
              </div>

              <div style={{ padding: '22px 24px' }}>
                <h2 style={{ fontWeight: 900, fontSize: 22, color: 'var(--primary)', marginBottom: 2 }}>
                  {car.name} <span style={{ fontWeight: 400, color: 'var(--gray-500)' }}>{car.subtitle}</span>
                </h2>
                <p style={{ color: 'var(--gray-600)', fontSize: 14, lineHeight: 1.7, margin: '10px 0 16px' }}>{car.description}</p>

                {/* Specs */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                  {car.specs.map(s => (
                    <span key={s} style={{ fontSize: 12, fontWeight: 600, background: 'var(--gray-100)', color: 'var(--gray-700)', padding: '3px 10px', borderRadius: 6 }}>{s}</span>
                  ))}
                </div>

                {/* Tarifs */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                  <div style={{ flex: 1, background: '#0f172a', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Par jour</p>
                    <p style={{ fontSize: 26, fontWeight: 900, color: 'white' }}>{car.price_day} €</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2 }}>offre journalière</p>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(245,197,24,.12)', border: '1.5px solid rgba(245,197,24,.3)', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                    <p style={{ fontSize: 11, color: 'var(--gray-600)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>2 semaines</p>
                    <p style={{ fontSize: 26, fontWeight: 900, color: 'var(--primary)' }}>{car.price_2weeks} €</p>
                    <p style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 2 }}>par jour</p>
                  </div>
                </div>

                <a href="tel:+262693839654" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <Phone size={15}/> Réserver par téléphone
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Infos contact */}
        <div style={{ background: '#0f172a', borderRadius: 20, padding: '32px 36px', color: 'white', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 12, letterSpacing: 1 }}>Contact</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href="tel:+262693839654" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
                <Phone size={16} color="rgba(255,255,255,.5)"/> +262 693 83 96 54
              </a>
              <a href="mailto:locationautopresto@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,.7)', textDecoration: 'none', fontSize: 13 }}>
                <Mail size={15} color="rgba(255,255,255,.5)"/> locationautopresto@gmail.com
              </a>
            </div>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 12, letterSpacing: 1 }}>Points de retrait</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'rgba(255,255,255,.7)' }}>
                <MapPin size={15} color="rgba(255,255,255,.5)" style={{ flexShrink: 0, marginTop: 1 }}/>
                <span>3b, Rue de la Guadeloupe, 97490<br/><strong style={{ color: 'white' }}>Saint-Denis</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,.7)' }}>
                <MapPin size={15} color="rgba(255,255,255,.5)"/>
                <span><strong style={{ color: 'white' }}>Saint-Pierre</strong></span>
              </div>
            </div>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 12, letterSpacing: 1 }}>Infos</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'rgba(255,255,255,.7)' }}>
              <p>Ouvert aux jeunes conducteurs</p>
              <p>Véhicules hybrides uniquement</p>
              <p>Permis B requis</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
