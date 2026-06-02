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

  return (
    <div ref={heroRef} style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', padding: '10px 0 20px' }}>
      <svg width="320" height="300" viewBox="0 0 320 300" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 0 30px rgba(255,51,51,0.35))' }}>

        {/* ── Cercle pointillé extérieur ── */}
        <g style={partStyle(0, -70, 360, 0.2)}>
          <circle cx="160" cy="100" r="78" stroke="#ff3333" strokeWidth="1.5" fill="none" strokeDasharray="6 4" opacity="0.35"/>
        </g>

        {/* ── Corps engrenage : anneau + centre ── */}
        <g style={partStyle(0, -80, -180, 0.1)}>
          <circle cx="160" cy="100" r="46" stroke="#ff3333" strokeWidth="3" fill="rgba(20,2,2,0.95)"/>
          {/* anneau intérieur décoratif */}
          <circle cx="160" cy="100" r="30" stroke="rgba(255,51,51,0.25)" strokeWidth="1" fill="none"/>
          {/* centre rouge */}
          <circle cx="160" cy="100" r="14" fill="#ff3333" opacity="0.95"/>
          <circle cx="160" cy="100" r="7" fill="#1a0202"/>
        </g>

        {/* ── Dents engrenage ── */}
        <g style={partStyle(0, -100, -90, 0.2, 0.05)}>
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const x1 = 160 + 46 * Math.cos(rad), y1 = 100 + 46 * Math.sin(rad);
            const x2 = 160 + 63 * Math.cos(rad), y2 = 100 + 63 * Math.sin(rad);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ff3333" strokeWidth={i % 3 === 0 ? 6 : 4} strokeLinecap="round"/>;
          })}
        </g>

        {/* ── Texte LV ── */}
        <g style={partStyle(-80, 60, -10, 0.3, 0.1)}>
          <text x="118" y="188" fontFamily="Inter,Arial,sans-serif" fontWeight="900" fontSize="42"
            fill="white" letterSpacing="2" textAnchor="middle">LV</text>
        </g>

        {/* ── Texte Tools ── */}
        <g style={partStyle(80, 70, 10, 0.3, 0.15)}>
          <text x="212" y="188" fontFamily="Inter,Arial,sans-serif" fontWeight="900" fontSize="42"
            fill="#ff3333" letterSpacing="2" textAnchor="middle">Tools</text>
        </g>

        {/* ── Séparateur ── */}
        <g style={partStyle(0, 80, 0, 0.1, 0.25)}>
          <line x1="80" y1="192" x2="240" y2="192" stroke="#ff3333" strokeWidth="1.5" opacity="0.4"/>
        </g>

        {/* ── By AutoPresto ── */}
        <g style={partStyle(0, 90, 0, 0.5, 0.3)}>
          <image href="/autopresto-logo.jpeg" x="130" y="198" width="24" height="24"
            clipPath="url(#apCircle2)"/>
          <defs>
            <clipPath id="apCircle2">
              <circle cx="142" cy="210" r="12"/>
            </clipPath>
          </defs>
          <text x="162" y="214" fontFamily="Inter,Arial,sans-serif" fontWeight="600" fontSize="13"
            fill="rgba(255,255,255,0.5)" letterSpacing="0.5">by AutoPresto</text>
        </g>

      </svg>
    </div>
  );
}
