export default function Logo({ size = 44, light = false }) {
  const c = light ? '#ffffff' : '#220404';
  const red = '#ff3333';
  return (
    <svg width={size * 3.2} height={size} viewBox="0 0 180 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Gear body */}
      <circle cx="24" cy="24" r="9" stroke={red} strokeWidth="2.5" fill="none"/>
      <circle cx="24" cy="24" r="3.5" fill={red}/>
      {/* Gear teeth */}
      {[0,40,80,120,160,200,240,280,320].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 24 + 9 * Math.cos(rad), y1 = 24 + 9 * Math.sin(rad);
        const x2 = 24 + 14 * Math.cos(rad), y2 = 24 + 14 * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={red} strokeWidth="2.5" strokeLinecap="round"/>;
      })}
      {/* Wrench detail */}
      <path d="M33 15 L39 9 M39 9 C41 7 44 8 44 11 C44 14 41 15 39 15 L33 21" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6"/>

      {/* MECA */}
      <text x="50" y="20" fontFamily="Inter,Arial,sans-serif" fontWeight="900" fontSize="15" fill={c} letterSpacing="1">MECA</text>
      {/* TOOLS */}
      <text x="50" y="36" fontFamily="Inter,Arial,sans-serif" fontWeight="900" fontSize="15" fill={red} letterSpacing="1">TOOLS</text>
      {/* LOC */}
      <text x="104" y="20" fontFamily="Inter,Arial,sans-serif" fontWeight="700" fontSize="10" fill={light ? 'rgba(255,255,255,0.5)' : '#9a8080'}>LOC</text>
      {/* separator */}
      <line x1="50" y1="40" x2="130" y2="40" stroke={red} strokeWidth="1.5" opacity="0.4"/>
      {/* by Autopresto */}
      <text x="50" y="47" fontFamily="Inter,Arial,sans-serif" fontWeight="500" fontSize="7.5" fill={light ? 'rgba(255,255,255,0.4)' : '#9a8080'} letterSpacing="0.3">by Autopresto</text>
    </svg>
  );
}
