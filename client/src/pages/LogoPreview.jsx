import Logo from '../components/Logo';

const variants = [
  { id: 'A', label: 'A — Clé à molette traversant le V' },
  { id: 'B', label: 'B — Hexagone écrou' },
  { id: 'C', label: 'C — Compteur / jauge vitesse' },
  { id: 'D', label: 'D — Bouclier mécanique' },
  { id: 'E', label: 'E — Engrenage premium' },
];

export default function LogoPreview() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', padding: '32px 24px' }}>
      <h1 style={{ color: '#fff', fontFamily: 'Inter,Arial,sans-serif', marginBottom: 4, fontSize: 20, fontWeight: 700 }}>
        Propositions de logo LVTools
      </h1>
      <p style={{ color: '#666', fontFamily: 'Inter,Arial,sans-serif', marginBottom: 32, fontSize: 13 }}>
        Chaque option est affichée sans tagline (navbar) · avec tagline · fond clair · grand format
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {variants.map(v => (
          <div key={v.id} style={{ background: '#1c1c1c', borderRadius: 14, padding: '20px 24px', border: '1px solid #2a2a2a' }}>
            <p style={{ color: '#888', fontFamily: 'Inter,Arial,sans-serif', fontSize: 11, marginBottom: 18, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              {v.label}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              {/* navbar dark — sans tagline */}
              <div style={{ background: '#220404', padding: '12px 18px', borderRadius: 8, minWidth: 140 }}>
                <p style={{ color: '#555', fontSize: 9, fontFamily: 'Inter', marginBottom: 8, letterSpacing: 1 }}>NAVBAR</p>
                <Logo variant={v.id} size={40} light />
              </div>
              {/* avec tagline — dark */}
              <div style={{ background: '#220404', padding: '12px 18px', borderRadius: 8, minWidth: 200 }}>
                <p style={{ color: '#555', fontSize: 9, fontFamily: 'Inter', marginBottom: 8, letterSpacing: 1 }}>AVEC TAGLINE</p>
                <Logo variant={v.id} size={40} light tagline />
              </div>
              {/* fond blanc */}
              <div style={{ background: '#ffffff', padding: '12px 18px', borderRadius: 8, minWidth: 200 }}>
                <p style={{ color: '#bbb', fontSize: 9, fontFamily: 'Inter', marginBottom: 8, letterSpacing: 1 }}>FOND CLAIR</p>
                <Logo variant={v.id} size={40} light={false} tagline />
              </div>
              {/* grand format */}
              <div style={{ background: '#1a0202', padding: '16px 22px', borderRadius: 8 }}>
                <p style={{ color: '#555', fontSize: 9, fontFamily: 'Inter', marginBottom: 8, letterSpacing: 1 }}>GRAND FORMAT</p>
                <Logo variant={v.id} size={56} light tagline />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
