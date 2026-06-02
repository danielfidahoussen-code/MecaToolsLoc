export default function Logo({ size = 44, light = false }) {
  const c = light ? '#ffffff' : '#220404';
  const red = '#ff3333';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* V rouge */}
        <path d="M8 10 L24 38 L40 10" stroke={red} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* clé à molette inclinée qui traverse le V */}
        <g transform="rotate(-35 24 24)">
          <rect x="21" y="6" width="6" height="36" rx="3" fill={c} opacity="0.85"/>
          <circle cx="24" cy="9" r="5" stroke={c} strokeWidth="2.5" fill="none"/>
          <path d="M19 7 C19 4 29 4 29 7" stroke={c} strokeWidth="2" fill="none"/>
        </g>
      </svg>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
        <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: size * 0.4, color: c, letterSpacing: 1 }}>LV</span>
        <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: size * 0.4, color: red, letterSpacing: 1 }}>Tools</span>
      </div>
    </div>
  );
}
