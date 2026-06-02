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
      // Start disassembly as soon as logo enters view, spread over 2.5× hero height
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
      <svg width="320" height="280" viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 0 30px rgba(255,51,51,0.35))' }}>

        <g style={partStyle(0, -60, 360, 0.2)}>
          <circle cx="160" cy="110" r="72" stroke="#ff3333" strokeWidth="2" fill="none" strokeDasharray="8 4" opacity="0.4"/>
        </g>

        <g style={partStyle(-30, -80, -180, 0.1)}>
          <circle cx="160" cy="110" r="44" stroke="#ff3333" strokeWidth="3" fill="rgba(34,4,4,0.9)"/>
          <circle cx="160" cy="110" r="16" fill="#ff3333" opacity="0.9"/>
          <circle cx="160" cy="110" r="8" fill="#220404"/>
        </g>

        <g style={partStyle(0, -100, -90, 0.2, 0.05)}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const x1 = 160 + 44 * Math.cos(rad), y1 = 110 + 44 * Math.sin(rad);
            const x2 = 160 + 60 * Math.cos(rad), y2 = 110 + 60 * Math.sin(rad);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ff3333" strokeWidth="5" strokeLinecap="round"/>;
          })}
        </g>

        <g style={partStyle(90, -40, 60, 0.3, 0.1)}>
          <path d="M180 80 L210 50 M210 50 C216 44 226 46 226 54 C226 62 216 64 210 64 L180 94"
            stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"/>
          <rect x="176" y="90" width="8" height="24" rx="3" transform="rotate(45 180 94)" fill="white" opacity="0.6"/>
        </g>

        <g style={partStyle(-90, 60, -10, 0.3, 0.15)}>
          <text x="100" y="175" fontFamily="Inter,Arial,sans-serif" fontWeight="900" fontSize="36"
            fill="white" letterSpacing="3" textAnchor="middle">MECA</text>
        </g>

        <g style={partStyle(90, 70, 10, 0.3, 0.2)}>
          <text x="218" y="175" fontFamily="Inter,Arial,sans-serif" fontWeight="900" fontSize="36"
            fill="#ff3333" letterSpacing="3" textAnchor="middle">TOOLS</text>
        </g>

        <g style={partStyle(60, -80, 30, 0.2, 0.08)}>
          <rect x="195" y="85" width="36" height="18" rx="4" fill="#ff3333"/>
          <text x="213" y="97" fontFamily="Inter,Arial,sans-serif" fontWeight="800" fontSize="10"
            fill="white" textAnchor="middle">LOC</text>
        </g>

        <g style={partStyle(0, 80, 0, 0.1, 0.25)}>
          <line x1="80" y1="188" x2="240" y2="188" stroke="#ff3333" strokeWidth="2" opacity="0.5"/>
        </g>

        <g style={partStyle(0, 90, 0, 0.5, 0.3)}>
          <text x="160" y="205" fontFamily="Inter,Arial,sans-serif" fontWeight="500" fontSize="13"
            fill="rgba(255,255,255,0.5)" textAnchor="middle" letterSpacing="1">by Autopresto</text>
        </g>
      </svg>
    </div>
  );
}
