import Logo from '../components/Logo';

const variants = [
  { id: 'A', label: 'A — Clé à molette traversant le V' },
  { id: 'B', label: 'B — Double éclair rouge' },
  { id: 'C', label: 'C — Hexagone écrou' },
  { id: 'D', label: 'D — Initiales entrelacées L+V' },
  { id: 'E', label: 'E — Engrenage (actuel amélioré)' },
];

export default function LogoPreview() {
  return (
    <div style={{ minHeight: '100vh', background: '#111', padding: '40px 24px' }}>
      <h1 style={{ color: '#fff', fontFamily: 'Inter,Arial,sans-serif', marginBottom: 8, fontSize: 22 }}>
        Propositions de logo LVTools
      </h1>
      <p style={{ color: '#888', fontFamily: 'Inter,Arial,sans-serif', marginBottom: 40, fontSize: 14 }}>
        Dites-moi lequel vous plait (A, B, C, D ou E) et je l'applique partout.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {variants.map(v => (
          <div key={v.id} style={{ background: '#1a1a1a', borderRadius: 12, padding: '24px 28px' }}>
            <p style={{ color: '#666', fontFamily: 'Inter,Arial,sans-serif', fontSize: 12, marginBottom: 16, letterSpacing: 1 }}>
              {v.label}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 48, flexWrap: 'wrap' }}>
              {/* dark bg (navbar) */}
              <div style={{ background: '#220404', padding: '14px 20px', borderRadius: 8 }}>
                <Logo variant={v.id} size={44} light />
              </div>
              {/* white bg */}
              <div style={{ background: '#fff', padding: '14px 20px', borderRadius: 8 }}>
                <Logo variant={v.id} size={44} light={false} />
              </div>
              {/* large dark */}
              <div style={{ background: '#220404', padding: '14px 20px', borderRadius: 8 }}>
                <Logo variant={v.id} size={64} light />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
