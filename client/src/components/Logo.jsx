export default function Logo({ size = 44, light = false }) {
  const c = light ? '#ffffff' : '#1a0202';
  const red = '#ff3333';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="19" stroke={light ? 'rgba(255,255,255,0.15)' : 'rgba(26,2,2,0.1)'} strokeWidth="1.5" fill="none" strokeDasharray="4 3"/>
        <circle cx="24" cy="24" r="10" stroke={red} strokeWidth="2.5" fill="none"/>
        <circle cx="24" cy="24" r="4" fill={red}/>
        {[0,45,90,135,180,225,270,315].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 24 + 10 * Math.cos(rad), y1 = 24 + 10 * Math.sin(rad);
          const x2 = 24 + 15 * Math.cos(rad), y2 = 24 + 15 * Math.sin(rad);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={red} strokeWidth="3" strokeLinecap="round"/>;
        })}
        {/* clé en bas à gauche, loin du texte */}
        <path d="M15 35 L11 39 M11 39 C9.5 40.5 7 40 7 38 C7 36 9.5 35.5 11 35.5 L15 31"
          stroke={light ? 'rgba(255,255,255,0.7)' : 'rgba(26,2,2,0.6)'} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      </svg>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 0, lineHeight: 1 }}>
          <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: size * 0.38, color: c, letterSpacing: 1 }}>LV</span>
          <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: size * 0.38, color: red, letterSpacing: 1 }}>Tools</span>
        </div>
        <div style={{ fontFamily: 'Inter,Arial,sans-serif', fontSize: size * 0.17, color: light ? 'rgba(255,255,255,0.5)' : 'rgba(26,2,2,0.45)', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 }}>
          Location · Vente · Outillage
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8, paddingLeft: 8, borderLeft: `1px solid ${light ? 'rgba(255,255,255,0.2)' : 'rgba(26,2,2,0.15)'}` }}>
        <img src="https://res.cloudinary.com/dw6hfofqr/image/upload/v1781508023/mecatoolsloc/mhtj0pnnadaelsj0hu3z.jpg" alt="AutoPresto" style={{ height: size * 0.5, width: 'auto', borderRadius: 4, objectFit: 'contain' }}/>
        <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontSize: size * 0.17, color: light ? 'rgba(255,255,255,0.5)' : 'rgba(26,2,2,0.45)', letterSpacing: 1, textTransform: 'uppercase' }}>by AutoPresto</span>
      </div>
    </div>
  );
}
