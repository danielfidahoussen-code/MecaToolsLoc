export default function Logo({ size = 44, light = false }) {
  const c = light ? '#ffffff' : '#1a0202';
  const red = '#ff3333';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <img src={light ? '/logo-lvtools-icon-light.png' : '/logo-lvtools-icon.png'} alt="LVTools"
        style={{ height: size, width: 'auto', display: 'block' }}/>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 0, lineHeight: 1 }}>
          <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: size * 0.38, color: red, letterSpacing: 1 }}>LV</span>
          <span style={{ fontFamily: 'Inter,Arial,sans-serif', fontWeight: 900, fontSize: size * 0.38, color: c, letterSpacing: 1 }}>TOOLS</span>
        </div>
        <div style={{ fontFamily: 'Inter,Arial,sans-serif', fontSize: size * 0.17, color: light ? 'rgba(255,255,255,0.5)' : 'rgba(26,2,2,0.45)', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 }}>
          Location · Vente · Outillage
        </div>
      </div>
    </div>
  );
}
