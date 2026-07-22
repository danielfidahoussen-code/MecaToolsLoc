export default function Logo({ size = 26, light = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img src={light ? '/logo-prestolocation-light.png' : '/logo-prestolocation.png'} alt="PrestoLocation"
        style={{ height: size, width: 'auto', display: 'block' }}/>
    </div>
  );
}
