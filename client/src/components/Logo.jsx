export default function Logo({ size = 44, light = false }) {
  const c = light ? '#ffffff' : '#220404';
  const red = '#ff3333';
  const imgSize = size * 0.7;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {/* Icône engrenage + clé */}
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="9" stroke={red} strokeWidth="2.5" fill="none"/>
        <circle cx="24" cy="24" r="3.5" fill={red}/>
        {[0,40,80,120,160,200,240,280,320].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 24 + 9 * Math.cos(rad), y1 = 24 + 9 * Math.sin(rad);
          const x2 = 24 + 14 * Math.cos(rad), y2 = 24 + 14 * Math.sin(rad);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={red} strokeWidth="2.5" strokeLinecap="round"/>;
        })}
        <path d="M33 15 L39 9 M39 9 C41 7 44 8 44 11 C44 14 41 15 39 15 L33 21" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6"/>
      </svg>

      {/* Texte LVTools */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: size * 0.38, color: c, letterSpacing: 1 }}>LV</span>
          <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: size * 0.38, color: red, letterSpacing: 1 }}>Tools</span>
        </div>
        {/* Séparateur + logo AutoPresto */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
          <div style={{ height: 1, width: size * 0.9, background: `${red}66` }}/>
          <img
            src="/autopresto-logo.jpeg"
            alt="AutoPresto"
            style={{ width: imgSize, height: imgSize, borderRadius: '50%', objectFit: 'cover', border: `1px solid ${light ? 'rgba(255,255,255,0.3)' : 'rgba(34,4,4,0.15)'}` }}
          />
        </div>
      </div>
    </div>
  );
}
