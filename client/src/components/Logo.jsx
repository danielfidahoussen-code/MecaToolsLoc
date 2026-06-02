// variant prop: 'A' | 'B' | 'C' | 'D' | 'E' (default: current 'E')
export default function Logo({ size = 44, light = false, variant = 'E' }) {
  const c = light ? '#ffffff' : '#220404';
  const red = '#ff3333';

  if (variant === 'A') {
    // Clé à molette traversant le V
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* V shape */}
          <path d="M8 10 L24 38 L40 10" stroke={red} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          {/* wrench crossing diagonally */}
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

  if (variant === 'B') {
    // Double éclair rouge entre LV et Tools
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <svg width={size * 0.6} height={size} viewBox="0 0 28 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="18,2 8,26 16,26 10,46 26,18 17,18 24,2" fill={red}/>
          <polygon points="10,2 0,26 8,26 2,46 18,18 9,18 16,2" fill={red} opacity="0.4"/>
        </svg>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: size * 0.4, color: c, letterSpacing: 1 }}>LV</span>
          <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: size * 0.4, color: red, letterSpacing: 1 }}>Tools</span>
        </div>
      </div>
    );
  }

  if (variant === 'C') {
    // Hexagone écrou avec LV intérieur
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* hexagon */}
          <polygon points="24,3 42,13.5 42,34.5 24,45 6,34.5 6,13.5"
            stroke={red} strokeWidth="2.5" fill={light ? 'rgba(255,51,51,0.12)' : 'rgba(34,4,4,0.08)'}/>
          {/* inner hex hole (nut shape) */}
          <polygon points="24,13 33,18 33,30 24,35 15,30 15,18"
            stroke={red} strokeWidth="1.5" fill="none" opacity="0.5"/>
          {/* LV text */}
          <text x="24" y="28" fontFamily="Inter,Arial,sans-serif" fontWeight="900" fontSize="13"
            fill={red} textAnchor="middle">LV</text>
        </svg>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: size * 0.4, color: c, letterSpacing: 1 }}>LV</span>
          <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: size * 0.4, color: red, letterSpacing: 1 }}>Tools</span>
        </div>
      </div>
    );
  }

  if (variant === 'D') {
    // Initiales L et V entrelacées monogramme
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* L */}
          <path d="M10 8 L10 40 L26 40" stroke={c} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          {/* V overlapping */}
          <path d="M18 8 L31 36 L44 8" stroke={red} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          {/* overlap mask to create interlock illusion */}
          <path d="M24 26 L26 40" stroke={c} strokeWidth="5" strokeLinecap="round" fill="none"/>
        </svg>
        <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: size * 0.4, color: red, letterSpacing: 1 }}>Tools</span>
      </div>
    );
  }

  // variant E — gear (default, current style, no LOC badge)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="9" stroke={red} strokeWidth="2.5" fill="none"/>
        <circle cx="24" cy="24" r="3.5" fill={red}/>
        {[0,40,80,120,160,200,240,280,320].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 24 + 9 * Math.cos(rad), y1 = 24 + 9 * Math.sin(rad);
          const x2 = 24 + 14 * Math.cos(rad), y2 = 24 + 14 * Math.sin(rad);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={red} strokeWidth="2.5" strokeLinecap="round"/>;
        })}
        <path d="M33 15 L39 9 M39 9 C41 7 44 8 44 11 C44 14 41 15 39 15 L33 21"
          stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6"/>
      </svg>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
        <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: size * 0.4, color: c, letterSpacing: 1 }}>LV</span>
        <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: size * 0.4, color: red, letterSpacing: 1 }}>Tools</span>
      </div>
    </div>
  );
}
