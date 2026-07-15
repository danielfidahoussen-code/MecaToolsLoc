export default function Logo({ size = 44, light = false }) {
  const c = light ? '#ffffff' : '#1a0202';
  const red = '#ff3333';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        {/* Engrenage : symbole mécanique */}
        <path d="M 24.00,7.00 L 28.97,11.99 L 36.02,11.98 L 36.01,19.03 L 41.00,24.00 L 36.01,28.97 L 36.02,36.02 L 28.97,36.01 L 24.00,41.00 L 19.03,36.01 L 11.98,36.02 L 11.99,28.97 L 7.00,24.00 L 11.99,19.03 L 11.98,11.98 L 19.03,11.99 Z M 17.5,24 A 6.5,6.5 0 1,0 30.5,24 A 6.5,6.5 0 1,0 17.5,24 Z"
          fill={c} fillRule="evenodd"/>
        {/* Clé qui traverse en diagonale : symbole outillage */}
        <g>
          <rect x="14.5" y="22.3" width="19" height="3.4" rx="1.7" fill={red} transform="rotate(-45 24 24)"/>
          <path d="M 10.00,32.50 L 14.76,35.25 L 14.76,40.75 L 10.00,43.50 L 5.24,40.75 L 5.24,35.25 Z M 7,38 A 3,3 0 1,0 13,38 A 3,3 0 1,0 7,38 Z"
            fill={red} fillRule="evenodd"/>
          <path d="M 38.00,4.50 L 42.76,7.25 L 42.76,12.75 L 38.00,15.50 L 33.24,12.75 L 33.24,7.25 Z M 35,10 A 3,3 0 1,0 41,10 A 3,3 0 1,0 35,10 Z"
            fill={red} fillRule="evenodd"/>
        </g>
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
    </div>
  );
}
