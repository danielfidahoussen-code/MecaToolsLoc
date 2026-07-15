export default function Logo({ size = 44, light = false }) {
  const c = light ? '#ffffff' : '#1a0202';
  const orange = '#f7941d';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        {/* Engrenage : symbole mécanique */}
        <path d="M 24.00,5.00 L 29.74,10.14 L 37.44,10.56 L 37.86,18.26 L 43.00,24.00 L 37.86,29.74 L 37.44,37.44 L 29.74,37.86 L 24.00,43.00 L 18.26,37.86 L 10.56,37.44 L 10.14,29.74 L 5.00,24.00 L 10.14,18.26 L 10.56,10.56 L 18.26,10.14 Z M 13,24 A 11,11 0 1,0 35,24 A 11,11 0 1,0 13,24 Z"
          fill={c} fillRule="evenodd"/>
        {/* Lettres "Lv" au centre de l'engrenage */}
        <text x="21" y="29.5" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="15" fill={c}>Lv</text>
        {/* Clé qui traverse en diagonale : symbole outillage */}
        <g>
          <rect x="14.5" y="22.3" width="19" height="3.4" rx="1.7" fill={orange} transform="rotate(-45 24 24)"/>
          <path d="M 10.00,32.50 L 14.76,35.25 L 14.76,40.75 L 10.00,43.50 L 5.24,40.75 L 5.24,35.25 Z M 7,38 A 3,3 0 1,0 13,38 A 3,3 0 1,0 7,38 Z"
            fill={orange} fillRule="evenodd"/>
          <path d="M 38.00,4.50 L 42.76,7.25 L 42.76,12.75 L 38.00,15.50 L 33.24,12.75 L 33.24,7.25 Z M 35,10 A 3,3 0 1,0 41,10 A 3,3 0 1,0 35,10 Z"
            fill={orange} fillRule="evenodd"/>
        </g>
      </svg>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 0, lineHeight: 1 }}>
          <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: size * 0.38, color: orange, letterSpacing: 1 }}>LV</span>
          <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: size * 0.38, color: c, letterSpacing: 1 }}>TOOLS</span>
        </div>
        <div style={{ fontFamily: 'Inter,Arial,sans-serif', fontSize: size * 0.17, color: light ? 'rgba(255,255,255,0.5)' : 'rgba(26,2,2,0.45)', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 }}>
          Location · Vente · Outillage
        </div>
      </div>
    </div>
  );
}
