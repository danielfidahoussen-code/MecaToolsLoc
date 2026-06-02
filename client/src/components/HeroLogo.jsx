import { useEffect, useRef, useState } from 'react';

export default function HeroLogo() {
  const [progress, setProgress] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const hero = heroRef.current;
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const heroH = hero.offsetHeight;
      const p = Math.min(1, Math.max(0, (heroH - rect.top) / (heroH * 2.5)));
      setProgress(p);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const ease = (v) => v * v * (3 - 2 * v);
  const p = ease(progress);

  const partStyle = (tx, ty, rotate = 0, scale = 1, delay = 0) => {
    const dp = Math.min(1, Math.max(0, p - delay));
    return {
      transform: `translate(${tx * dp}px, ${ty * dp}px) rotate(${rotate * dp}deg) scale(${1 - (1 - scale) * dp})`,
      opacity: 1 - dp * 0.85,
      transition: 'none',
      display: 'inline-block',
    };
  };

  // Centre du SVG
  const cx = 160, cy = 78;

  return (
    <div ref={heroRef} style={{ position: 'relative', zIndex: 5, marginTop: -70, pointerEvents: 'none', width: '100%', display: 'flex', justifyContent: 'center', padding: '10px 0 20px' }}>
      <svg width="340" height="280" viewBox="0 0 340 280" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 0 28px rgba(255,51,51,0.3))' }}>

        {/* ── Cercle pointillé extérieur ── */}
        <g style={partStyle(0, -60, 360, 0.2)}>
          <circle cx={cx} cy={cy} r="75" stroke="#ff3333" strokeWidth="1.5" fill="none" strokeDasharray="5 4" opacity="0.3"/>
        </g>

        {/* ── Corps engrenage ── */}
        <g style={partStyle(-20, -80, -180, 0.1)}>
          <circle cx={cx} cy={cy} r="42" stroke="#ff3333" strokeWidth="3" fill="rgba(20,2,2,0.95)"/>
          <circle cx={cx} cy={cy} r="14" fill="#ff3333" opacity="0.95"/>
          <circle cx={cx} cy={cy} r="7" fill="#1a0202"/>
        </g>

        {/* ── Dents engrenage (même angles que navbar) ── */}
        <g style={partStyle(0, -100, -90, 0.2, 0.05)}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const x1 = cx + 42 * Math.cos(rad), y1 = cy + 42 * Math.sin(rad);
            const x2 = cx + 58 * Math.cos(rad), y2 = cy + 58 * Math.sin(rad);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ff3333" strokeWidth="6" strokeLinecap="round"/>;
          })}
        </g>

        {/* ── Clé à molette (coin bas-gauche, relevée) ── */}
        <g style={partStyle(-80, 40, -45, 0.2, 0.08)}>
          <path d="M127 128 L109 146 M109 146 C104 151 96 150 96 144 C96 138 104 137 109 137 L127 119"
            stroke="rgba(255,255,255,0.65)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        </g>

        {/* ── Texte LV ── */}
        <g style={partStyle(-90, 60, -10, 0.3, 0.12)}>
          <text x="116" y="188" fontFamily="Inter,Arial,sans-serif" fontWeight="900" fontSize="44"
            fill="white" letterSpacing="2" textAnchor="middle">LV</text>
        </g>

        {/* ── Texte Tools ── */}
        <g style={partStyle(90, 70, 10, 0.3, 0.18)}>
          <text x="218" y="188" fontFamily="Inter,Arial,sans-serif" fontWeight="900" fontSize="44"
            fill="#ff3333" letterSpacing="2" textAnchor="middle">Tools</text>
        </g>

        {/* ── Ligne séparatrice ── */}
        <g style={partStyle(0, 80, 0, 0.1, 0.24)}>
          <line x1="75" y1="202" x2="265" y2="202" stroke="#ff3333" strokeWidth="1.5" opacity="0.4"/>
        </g>

        {/* ── By AutoPresto (côté droit) ── */}
        <g style={partStyle(0, 90, 0, 0.5, 0.3)}>
          <text x="176" y="224" fontFamily="Inter,Arial,sans-serif" fontWeight="600" fontSize="13"
            fill="rgba(255,255,255,0.5)" letterSpacing="0.5" textAnchor="end">by AutoPresto</text>
          <image href="/autopresto-logo.jpeg" x="179" y="208" width="24" height="24" clipPath="url(#apHero)"/>
          <defs>
            <clipPath id="apHero"><circle cx="191" cy="220" r="12"/></clipPath>
          </defs>
        </g>

      </svg>
    </div>
  );
}
