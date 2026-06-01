export default function Logo({ size = 44, light = false }) {
  return (
    <svg width={size * 2.6} height={size} viewBox="0 0 140 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Gear icon */}
      <circle cx="22" cy="22" r="10" stroke={light ? '#f5c518' : '#1a2340'} strokeWidth="2.5" fill="none"/>
      <circle cx="22" cy="22" r="4" fill={light ? '#f5c518' : '#1a2340'}/>
      {[0,45,90,135,180,225,270,315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 22 + 10 * Math.cos(rad);
        const y1 = 22 + 10 * Math.sin(rad);
        const x2 = 22 + 14 * Math.cos(rad);
        const y2 = 22 + 14 * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={light ? '#f5c518' : '#1a2340'} strokeWidth="2.5" strokeLinecap="round"/>;
      })}
      {/* Wrench */}
      <path d="M32 12 L38 6 M38 6 C40 4 43 5 43 8 C43 11 40 12 38 12 L32 18" stroke={light ? '#ffffff' : '#f5c518'} strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Text */}
      <text x="52" y="17" fontFamily="Inter,Arial,sans-serif" fontWeight="800" fontSize="13" fill={light ? '#ffffff' : '#1a2340'} letterSpacing="0.5">MECA</text>
      <text x="52" y="32" fontFamily="Inter,Arial,sans-serif" fontWeight="800" fontSize="13" fill="#f5c518" letterSpacing="0.5">TOOLS</text>
      <text x="96" y="17" fontFamily="Inter,Arial,sans-serif" fontWeight="700" fontSize="10" fill={light ? 'rgba(255,255,255,0.7)' : '#9aa0b4'}>LOC</text>
      <line x1="52" y1="36" x2="130" y2="36" stroke="#f5c518" strokeWidth="1.5" opacity="0.5"/>
    </svg>
  );
}
