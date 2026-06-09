import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { differenceInDays } from 'date-fns';
import { Phone, Mail, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const CARS = [
  {
    id: 'lexus',
    name: 'Lexus CT200h',
    subtitle: 'Hybride',
    description: 'Berline hybride compacte haut de gamme. Silencieuse, économique et confortable. Idéale pour les trajets quotidiens ou les longues distances sur La Réunion.',
    specs: ['Hybride automatique', '5 places', 'Climatisation', 'GPS intégré', 'Faible consommation'],
    price_day: 45,
    price_5days: 40,
    price_2weeks: 39,
    image: null,
  },
  {
    id: 'auris',
    name: 'Toyota Auris',
    subtitle: 'Hybride',
    description: 'Compacte hybride polyvalente, parfaite pour découvrir l\'île en toute tranquillité. Conduite agréable et coffre spacieux pour vos bagages.',
    specs: ['Hybride automatique', '5 places', 'Climatisation', 'Coffre spacieux', 'Faible consommation'],
    price_day: 39,
    price_5days: 35,
    price_2weeks: 35,
    image: null,
  },
];

function calcPrice(car, days) {
  if (!days || days <= 0) return 0;
  if (days >= 14) return car.price_2weeks * days;
  if (days >= 5) return car.price_5days * days;
  return car.price_day * days;
}

function getRateLabel(car, days) {
  if (!days || days <= 0) return null;
  if (days >= 14) return { label: `Tarif 2 semaines — ${car.price_2weeks} €/j`, color: '#059669' };
  if (days >= 5) return { label: `Tarif -10% à partir de 5 jours — ${car.price_5days} €/j`, color: '#d97706' };
  return { label: `Tarif journalier — ${car.price_day} €/j`, color: 'var(--gray-500)' };
}

function CarCard({ car }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });

  const days = startDate && endDate ? Math.max(1, differenceInDays(endDate, startDate)) : 0;
  const total = calcPrice(car, days);
  const rate = getRateLabel(car, days);

  const handleReserve = () => {
    if (!startDate || !endDate) { toast.error('Choisissez vos dates'); return; }
    if (!form.name || !form.phone) { toast.error('Nom et téléphone requis'); return; }
    const msg = `Bonjour, je souhaite réserver la ${car.name} du ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')} (${days} jour${days > 1 ? 's' : ''} — ${total} €). Nom : ${form.name}, Tél : ${form.phone}${form.email ? `, Email : ${form.email}` : ''}.`;
    window.open(`https://wa.me/262693839654?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Image */}
      <div style={{ height: 240, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {car.image
          ? <img src={car.image} alt={car.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          : <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 13 }}>Photo à venir — {car.name}</p>
        }
        <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: 'white' }}>Hybride</div>
      </div>

      <div style={{ padding: '22px 24px' }}>
        <h2 style={{ fontWeight: 900, fontSize: 22, color: 'var(--primary)', marginBottom: 4 }}>
          {car.name} <span style={{ fontWeight: 400, color: 'var(--gray-500)', fontSize: 17 }}>{car.subtitle}</span>
        </h2>
        <p style={{ color: 'var(--gray-600)', fontSize: 14, lineHeight: 1.7, marginBottom: 14 }}>{car.description}</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
          {car.specs.map(s => <span key={s} style={{ fontSize: 12, fontWeight: 600, background: 'var(--gray-100)', color: 'var(--gray-700)', padding: '3px 10px', borderRadius: 6 }}>{s}</span>)}
        </div>

        {/* Grille tarifs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
          {[
            { label: 'Par jour', price: car.price_day, note: '1–4 jours' },
            { label: '5 jours+', price: car.price_5days, note: '-10%', highlight: true },
            { label: '2 semaines', price: car.price_2weeks, note: 'meilleur tarif', highlight: true },
          ].map(t => (
            <div key={t.label} style={{ background: t.highlight ? '#0f172a' : 'var(--gray-100)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: t.highlight ? 'rgba(255,255,255,.5)' : 'var(--gray-500)', marginBottom: 3 }}>{t.label}</p>
              <p style={{ fontSize: 20, fontWeight: 900, color: t.highlight ? 'white' : 'var(--primary)' }}>{t.price} €</p>
              <p style={{ fontSize: 10, color: t.highlight ? 'rgba(255,255,255,.4)' : 'var(--gray-400)', marginTop: 2 }}>{t.note}</p>
            </div>
          ))}
        </div>

        {/* Calendrier */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Date de début</label>
            <DatePicker selected={startDate} onChange={d => { setStartDate(d); if (endDate && d > endDate) setEndDate(null); }}
              minDate={new Date()} placeholderText="Choisir..." dateFormat="dd/MM/yyyy" className="form-control"/>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Date de fin</label>
            <DatePicker selected={endDate} onChange={setEndDate}
              minDate={startDate || new Date()} placeholderText="Choisir..." dateFormat="dd/MM/yyyy" className="form-control"/>
          </div>
        </div>

        {/* Récap prix */}
        {days > 0 && (
          <div style={{ background: 'var(--light)', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>{days} jour{days > 1 ? 's' : ''}</span>
              <span style={{ fontWeight: 900, fontSize: 20, color: 'var(--primary)' }}>{total} €</span>
            </div>
            {rate && <p style={{ fontSize: 12, color: rate.color, fontWeight: 600, marginTop: 4 }}>{rate.label}</p>}
          </div>
        )}

        {/* Formulaire */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nom *</label>
            <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jean Dupont"/>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Téléphone *</label>
            <input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="06 xx xx xx xx"/>
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Email</label>
          <input className="form-control" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="vous@exemple.fr"/>
        </div>

        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 15 }} onClick={handleReserve}>
          Demande de réservation →
        </button>
        <p style={{ fontSize: 11, color: 'var(--gray-400)', textAlign: 'center', marginTop: 8 }}>Redirige vers WhatsApp — confirmation sous 24h</p>
      </div>
    </div>
  );
}

export default function AutresServices() {
  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', padding: '48px 0 40px' }}>
        <div className="container">
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,.5)', marginBottom: 8 }}>Groupe AutoPresto</p>
          <h1 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, marginBottom: 12 }}>Location de véhicules</h1>
          <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 15, maxWidth: 520, marginBottom: 0 }}>
            Véhicules hybrides à Saint-Denis et Saint-Pierre. Ouverts aux jeunes conducteurs. Tarifs dégressifs dès 5 jours.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 28, marginBottom: 48 }}>
          {CARS.map(car => <CarCard key={car.id} car={car}/>)}
        </div>

        {/* Contact bas de page */}
        <div style={{ background: '#0f172a', borderRadius: 20, padding: '28px 32px', color: 'white', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 10, letterSpacing: 1 }}>Contact</p>
            <a href="tel:+262693839654" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
              <Phone size={15} color="rgba(255,255,255,.5)"/> +262 693 83 96 54
            </a>
            <a href="mailto:locationautopresto@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.6)', textDecoration: 'none', fontSize: 13 }}>
              <Mail size={14} color="rgba(255,255,255,.4)"/> locationautopresto@gmail.com
            </a>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 10, letterSpacing: 1 }}>Points de retrait</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'rgba(255,255,255,.7)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <MapPin size={14} color="rgba(255,255,255,.4)" style={{ flexShrink: 0, marginTop: 1 }}/>
                <span>3b, Rue de la Guadeloupe 97490<br/><strong style={{ color: 'white' }}>Saint-Denis</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={14} color="rgba(255,255,255,.4)"/>
                <strong style={{ color: 'white' }}>Saint-Pierre</strong>
              </div>
            </div>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 10, letterSpacing: 1 }}>Conditions</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13, color: 'rgba(255,255,255,.7)' }}>
              <p>Permis B requis</p>
              <p>Jeunes conducteurs acceptés</p>
              <p>Véhicules hybrides uniquement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
