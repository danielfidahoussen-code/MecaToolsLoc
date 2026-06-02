export default function Logo({ size = 44, light = false, variant = 'A', tagline = false }) {
  const c = light ? '#ffffff' : '#1a0202';
  const red = '#ff3333';
  const ts = size * 0.38;
  const sub = size * 0.19;

  // ── A : Grand V rouge + clé à molette qui traverse ──────────────────────────
  if (variant === 'A') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size * 1.1} height={size} viewBox="0 0 52 48" fill="none">
        {/* V bold */}
        <path d="M4 6 L26 44 L48 6" stroke={red} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        {/* wrench handle */}
        <g transform="translate(26,24) rotate(-42) translate(-26,-24)">
          <rect x="23.5" y="4" width="5" height="32" rx="2.5" fill={light ? 'rgba(255,255,255,0.9)' : 'rgba(26,2,2,0.85)'}/>
          {/* wrench head */}
          <circle cx="26" cy="7" r="5.5" stroke={light ? '#ffffff' : '#1a0202'} strokeWidth="2.2" fill="none"/>
          <path d="M20.5 5 C20.5 2 31.5 2 31.5 5" stroke={light ? '#ffffff' : '#1a0202'} strokeWidth="2" fill="none" strokeLinecap="round"/>
        </g>
      </svg>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 1, lineHeight: 1 }}>
          <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: ts, color: c, letterSpacing: 1 }}>LV</span>
          <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: ts, color: red, letterSpacing: 1 }}>Tools</span>
        </div>
        {tagline && <div style={{ fontFamily: 'Inter,Arial,sans-serif', fontSize: sub, color: light ? 'rgba(255,255,255,0.55)' : 'rgba(26,2,2,0.45)', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 }}>Location · Vente · Outillage</div>}
      </div>
    </div>
  );

  // ── B : Hexagone écrou avec initiales LV ────────────────────────────────────
  if (variant === 'B') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        {/* outer hex */}
        <polygon points="24,2 43,12.5 43,35.5 24,46 5,35.5 5,12.5"
          stroke={red} strokeWidth="2.5" fill={light ? 'rgba(255,51,51,0.12)' : 'rgba(255,51,51,0.08)'}/>
        {/* inner hex (nut hole) */}
        <polygon points="24,14 33,19 33,29 24,34 15,29 15,19"
          stroke={light ? 'rgba(255,255,255,0.3)' : 'rgba(26,2,2,0.18)'} strokeWidth="1.5" fill="none"/>
        {/* LV text centred */}
        <text x="24" y="29" fontFamily="Inter,Arial,sans-serif" fontWeight="900" fontSize="16"
          fill={red} textAnchor="middle">LV</text>
      </svg>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 1, lineHeight: 1 }}>
          <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: ts, color: c, letterSpacing: 1 }}>LV</span>
          <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: ts, color: red, letterSpacing: 1 }}>Tools</span>
        </div>
        {tagline && <div style={{ fontFamily: 'Inter,Arial,sans-serif', fontSize: sub, color: light ? 'rgba(255,255,255,0.55)' : 'rgba(26,2,2,0.45)', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 }}>Location · Vente · Outillage</div>}
      </div>
    </div>
  );

  // ── C : Compteur vitesse / jauge ────────────────────────────────────────────
  if (variant === 'C') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        {/* arc de fond */}
        <path d="M8 36 A18 18 0 0 1 40 36" stroke={light ? 'rgba(255,255,255,0.2)' : 'rgba(26,2,2,0.15)'} strokeWidth="4" strokeLinecap="round" fill="none"/>
        {/* arc rouge actif */}
        <path d="M8 36 A18 18 0 0 1 33 16" stroke={red} strokeWidth="4" strokeLinecap="round" fill="none"/>
        {/* aiguille */}
        <line x1="24" y1="36" x2="33" y2="16" stroke={light ? '#ffffff' : '#1a0202'} strokeWidth="2.5" strokeLinecap="round"/>
        {/* pivot */}
        <circle cx="24" cy="36" r="3.5" fill={red}/>
        {/* graduation marks */}
        {[0,30,60,90,120,150,180].map((a,i) => {
          const rad = ((180 - a) * Math.PI) / 180;
          const x1 = 24 + 18 * Math.cos(rad), y1 = 36 - 18 * Math.sin(rad);
          const x2 = 24 + 14 * Math.cos(rad), y2 = 36 - 14 * Math.sin(rad);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={light ? 'rgba(255,255,255,0.35)' : 'rgba(26,2,2,0.25)'} strokeWidth={i % 3 === 0 ? 2 : 1} strokeLinecap="round"/>;
        })}
      </svg>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 1, lineHeight: 1 }}>
          <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: ts, color: c, letterSpacing: 1 }}>LV</span>
          <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: ts, color: red, letterSpacing: 1 }}>Tools</span>
        </div>
        {tagline && <div style={{ fontFamily: 'Inter,Arial,sans-serif', fontSize: sub, color: light ? 'rgba(255,255,255,0.55)' : 'rgba(26,2,2,0.45)', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 }}>Location · Vente · Outillage</div>}
      </div>
    </div>
  );

  // ── D : Bouclier mécanique ───────────────────────────────────────────────────
  if (variant === 'D') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size * 0.9} height={size} viewBox="0 0 44 48" fill="none">
        {/* shield */}
        <path d="M22 2 L40 9 L40 26 C40 36 22 46 22 46 C22 46 4 36 4 26 L4 9 Z"
          stroke={red} strokeWidth="2.5" fill={light ? 'rgba(255,51,51,0.12)' : 'rgba(255,51,51,0.08)'}/>
        {/* LV inside */}
        <text x="22" y="32" fontFamily="Inter,Arial,sans-serif" fontWeight="900" fontSize="18"
          fill={red} textAnchor="middle">LV</text>
        {/* small wrench accent bottom right */}
        <path d="M33 35 L37 31 M37 31 C38.5 29.5 40.5 30 40.5 31.5 C40.5 33 38.5 33.5 37 33.5 L33 37"
          stroke={light ? 'rgba(255,255,255,0.5)' : 'rgba(26,2,2,0.4)'} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      </svg>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 1, lineHeight: 1 }}>
          <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: ts, color: c, letterSpacing: 1 }}>LV</span>
          <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: ts, color: red, letterSpacing: 1 }}>Tools</span>
        </div>
        {tagline && <div style={{ fontFamily: 'Inter,Arial,sans-serif', fontSize: sub, color: light ? 'rgba(255,255,255,0.55)' : 'rgba(26,2,2,0.45)', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 }}>Location · Vente · Outillage</div>}
      </div>
    </div>
  );

  // ── E : Engrenage + clé (style garage premium) ──────────────────────────────
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        {/* outer ring */}
        <circle cx="24" cy="24" r="19" stroke={light ? 'rgba(255,255,255,0.15)' : 'rgba(26,2,2,0.1)'} strokeWidth="1.5" fill="none" strokeDasharray="4 3"/>
        {/* gear */}
        <circle cx="24" cy="24" r="10" stroke={red} strokeWidth="2.5" fill="none"/>
        <circle cx="24" cy="24" r="4" fill={red}/>
        {[0,45,90,135,180,225,270,315].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 24 + 10 * Math.cos(rad), y1 = 24 + 10 * Math.sin(rad);
          const x2 = 24 + 15 * Math.cos(rad), y2 = 24 + 15 * Math.sin(rad);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={red} strokeWidth="3" strokeLinecap="round"/>;
        })}
        {/* mini wrench accent */}
        <path d="M33 13 L37 9 M37 9 C38.5 7.5 41 8 41 10 C41 12 38.5 12.5 37 12.5 L33 17"
          stroke={light ? 'rgba(255,255,255,0.7)' : 'rgba(26,2,2,0.6)'} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      </svg>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 1, lineHeight: 1 }}>
          <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: ts, color: c, letterSpacing: 1 }}>LV</span>
          <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: ts, color: red, letterSpacing: 1 }}>Tools</span>
        </div>
        {tagline && <div style={{ fontFamily: 'Inter,Arial,sans-serif', fontSize: sub, color: light ? 'rgba(255,255,255,0.55)' : 'rgba(26,2,2,0.45)', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 }}>Location · Vente · Outillage</div>}
      </div>
    </div>
  );
}
