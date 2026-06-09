import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { differenceInDays } from 'date-fns';
import { Phone, Mail, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const CARS = [
  {
    id: 'yaris',
    name: 'Toyota Yaris',
    category: 'Citadine',
    description: 'Citadine compacte idéale pour se déplacer sur l\'île. Économique, facile à garer et agréable à conduire au quotidien.',
    specs: [
      ['Carburant', 'Essence'],
      ['Boîte', 'Manuelle'],
      ['Places', '5'],
      ['Portes', '5'],
      ['Climatisation', 'Oui'],
      ['Kilométrage', 'Illimité'],
    ],
    price_day: 30,
    price_5days: 27,
    price_2weeks: 25,
    image: null,
  },
  {
    id: 'picanto',
    name: 'Kia Picanto 3',
    category: 'Citadine — Phase 1',
    description: 'Petite citadine maniable et économique. Parfaite pour la ville et les routes de montagne de La Réunion.',
    specs: [
      ['Carburant', 'Essence'],
      ['Boîte', 'Manuelle'],
      ['Places', '5'],
      ['Portes', '5'],
      ['Climatisation', 'Oui'],
      ['Kilométrage', 'Illimité'],
    ],
    price_day: 30,
    price_5days: 28,
    price_2weeks: 27,
    image: null,
  },
  {
    id: 'c3',
    name: 'Citroën C3',
    category: 'Compacte',
    description: 'Conçue pour La Réunion. Confortable, moderne et polyvalente. Un bon équilibre entre espace, confort et consommation.',
    specs: [
      ['Carburant', 'Essence'],
      ['Boîte', 'Manuelle'],
      ['Places', '5'],
      ['Portes', '5'],
      ['Climatisation', 'Oui'],
      ['Kilométrage', 'Illimité'],
    ],
    price_day: 43,
    price_5days: 41,
    price_2weeks: 39,
    image: null,
  },
  {
    id: 'auris',
    name: 'Toyota Auris',
    category: 'Hybride',
    description: 'Compacte hybride polyvalente. Faible consommation, conduite agréable et coffre spacieux pour explorer l\'île sans contrainte.',
    specs: [
      ['Carburant', 'Hybride'],
      ['Boîte', 'Automatique'],
      ['Places', '5'],
      ['Portes', '5'],
      ['Climatisation', 'Oui'],
      ['Kilométrage', 'Illimité'],
    ],
    price_day: 39,
    price_5days: 37,
    price_2weeks: 35,
    image: null,
  },
  {
    id: 'lexus',
    name: 'Lexus CT200h',
    category: 'Hybride — Premium',
    description: 'Berline hybride haut de gamme. Silencieuse, économique et raffinée. Pour ceux qui veulent le meilleur confort sur La Réunion.',
    specs: [
      ['Carburant', 'Hybride'],
      ['Boîte', 'Automatique'],
      ['Places', '5'],
      ['Portes', '5'],
      ['Climatisation', 'Oui'],
      ['GPS', 'Intégré'],
    ],
    price_day: 45,
    price_5days: 43,
    price_2weeks: 39,
    image: null,
  },
  {
    id: 'outlander',
    name: 'Mitsubishi Outlander',
    category: 'SUV — Longue durée',
    description: 'Grand SUV familial, idéal pour les groupes ou les longues distances. Disponible en location longue durée (2 semaines minimum).',
    specs: [
      ['Carburant', 'Essence'],
      ['Boîte', 'Automatique'],
      ['Places', '7'],
      ['Portes', '5'],
      ['Climatisation', 'Oui'],
      ['Kilométrage', 'Illimité'],
    ],
    price_day: null,
    price_5days: null,
    price_2weeks: 35,
    min_days: 14,
    image: null,
  },
];

function calcPrice(car, days) {
  if (!days || days <= 0) return 0;
  if (car.min_days && days < car.min_days) return 0;
  if (days >= 14) return car.price_2weeks * days;
  if (days >= 5 && car.price_5days) return car.price_5days * days;
  if (car.price_day) return car.price_day * days;
  return 0;
}

function getRateInfo(car, days) {
  if (!days || days <= 0) return null;
  if (car.min_days && days < car.min_days) return { label: `Minimum ${car.min_days} jours pour ce véhicule`, color: 'var(--danger)', invalid: true };
  if (days >= 14) return { label: `Tarif 2 semaines — ${car.price_2weeks} €/j`, color: '#059669' };
  if (days >= 5 && car.price_5days) return { label: `-10% dès 5 jours — ${car.price_5days} €/j`, color: '#d97706' };
  if (car.price_day) return { label: `Tarif journalier — ${car.price_day} €/j`, color: 'var(--gray-500)' };
  return null;
}

function CarCard({ car }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [open, setOpen] = useState(false);

  const days = startDate && endDate ? Math.max(1, differenceInDays(endDate, startDate)) : 0;
  const total = calcPrice(car, days);
  const rateInfo = getRateInfo(car, days);

  const handleReserve = () => {
    if (!startDate || !endDate) { toast.error('Choisissez vos dates'); return; }
    if (car.min_days && days < car.min_days) { toast.error(`Ce véhicule est disponible à partir de ${car.min_days} jours`); return; }
    if (!form.name || !form.phone) { toast.error('Nom et téléphone requis'); return; }
    const msg = `Bonjour PrestoLocation,\n\nJe souhaite réserver : ${car.name} (${car.category})\nDu : ${startDate.toLocaleDateString('fr-FR')}\nAu : ${endDate.toLocaleDateString('fr-FR')}\nDurée : ${days} jour${days > 1 ? 's' : ''}\nTotal estimé : ${total} €\n\nNom : ${form.name}\nTél : ${form.phone}${form.email ? `\nEmail : ${form.email}` : ''}`;
    window.open(`https://wa.me/262693839654?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const startPrice = car.price_2weeks || car.price_5days || car.price_day;

  return (
    <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Image */}
      <div style={{ height: 200, background: 'linear-gradient(135deg, #0f172a, #1e293b)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
        {car.image
          ? <img src={car.image} alt={car.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
          : <p style={{ color: 'rgba(255,255,255,.25)', fontSize: 13 }}>Photo à venir</p>
        }
        <div style={{ position: 'absolute', top: 12, left: 12, background: 'var(--accent)', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {car.category.split('—')[0].trim()}
        </div>
        <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(6px)', padding: '6px 12px', borderRadius: 10, textAlign: 'right' }}>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>À PARTIR DE</p>
          <p style={{ fontSize: 20, fontWeight: 900, color: 'white', lineHeight: 1 }}>{startPrice} €<span style={{ fontSize: 11, fontWeight: 500 }}>/j</span></p>
        </div>
      </div>

      <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>{car.category}</p>
          <h2 style={{ fontWeight: 900, fontSize: 20, color: 'var(--primary)', marginBottom: 8 }}>{car.name}</h2>
          <p style={{ color: 'var(--gray-600)', fontSize: 13, lineHeight: 1.6 }}>{car.description}</p>
        </div>

        {/* Specs grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--gray-100)' }}>
          {car.specs.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--gray-500)', fontWeight: 500 }}>{k}</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Tarifs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {car.price_day && (
            <div style={{ flex: 1, background: 'var(--gray-100)', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-500)', marginBottom: 2 }}>Journalier</p>
              <p style={{ fontSize: 16, fontWeight: 900, color: 'var(--primary)' }}>{car.price_day} €</p>
            </div>
          )}
          {car.price_5days && (
            <div style={{ flex: 1, background: 'rgba(245,197,24,.12)', border: '1px solid rgba(245,197,24,.3)', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-500)', marginBottom: 2 }}>5 jours+</p>
              <p style={{ fontSize: 16, fontWeight: 900, color: 'var(--primary)' }}>{car.price_5days} €</p>
            </div>
          )}
          <div style={{ flex: 1, background: 'var(--primary)', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,.6)', marginBottom: 2 }}>2 semaines</p>
            <p style={{ fontSize: 16, fontWeight: 900, color: 'white' }}>{car.price_2weeks} €</p>
          </div>
        </div>

        {car.min_days && (
          <div style={{ fontSize: 12, color: 'var(--gray-500)', background: 'var(--gray-100)', padding: '6px 10px', borderRadius: 8, marginBottom: 12, fontWeight: 600 }}>
            Durée minimum : {car.min_days} jours
          </div>
        )}

        {/* Toggle formulaire */}
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: open ? 16 : 0 }}
          onClick={() => setOpen(o => !o)}>
          {open ? 'Fermer' : 'Réserver ce véhicule'}
        </button>

        {open && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Début</label>
                <DatePicker selected={startDate} onChange={d => { setStartDate(d); if (endDate && d >= endDate) setEndDate(null); }}
                  minDate={new Date()} placeholderText="jj/mm/aaaa" dateFormat="dd/MM/yyyy" className="form-control"/>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Fin</label>
                <DatePicker selected={endDate} onChange={setEndDate}
                  minDate={startDate ? new Date(startDate.getTime() + 86400000) : new Date()} placeholderText="jj/mm/aaaa" dateFormat="dd/MM/yyyy" className="form-control"/>
              </div>
            </div>

            {days > 0 && (
              <div style={{ background: rateInfo?.invalid ? '#fee2e2' : 'var(--light)', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>{days} jour{days > 1 ? 's' : ''}</span>
                  {!rateInfo?.invalid && <span style={{ fontWeight: 900, fontSize: 18, color: 'var(--primary)' }}>{total} €</span>}
                </div>
                {rateInfo && <p style={{ fontSize: 12, color: rateInfo.color, fontWeight: 600, marginTop: 3 }}>{rateInfo.label}</p>}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nom *</label>
                <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jean Dupont"/>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Téléphone *</label>
                <input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="06 xx xx xx xx"/>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Email</label>
              <input className="form-control" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="vous@exemple.fr"/>
            </div>

            <button className="btn" style={{ width: '100%', justifyContent: 'center', background: '#25D366', color: 'white', fontWeight: 700 }} onClick={handleReserve}>
              Envoyer sur WhatsApp
            </button>
            <p style={{ fontSize: 11, color: 'var(--gray-400)', textAlign: 'center', marginTop: 6 }}>Confirmation sous 24h</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AutresServices() {
  return (
    <div>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #380808 100%)', color: 'white', padding: '48px 0 40px' }}>
        <div className="container">
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,.5)', marginBottom: 6 }}>PrestoLocation — Groupe AutoPresto</p>
          <h1 style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 900, marginBottom: 10 }}>Location de véhicules</h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 15, maxWidth: 540, marginBottom: 20 }}>
            Large gamme de véhicules disponibles à Saint-Denis et Saint-Pierre. Jeunes conducteurs acceptés. Tarifs dégressifs dès 5 jours.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="tel:+262693839654" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.15)', color: 'white', padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              <Phone size={15}/> +262 693 83 96 54
            </a>
            <a href="mailto:locationautopresto@gmail.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.8)', padding: '10px 18px', borderRadius: 10, fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
              <Mail size={14}/> locationautopresto@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Infos rapides */}
      <div style={{ background: 'var(--light)', borderBottom: '1px solid var(--gray-200)', padding: '14px 0' }}>
        <div className="container" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13, color: 'var(--gray-600)', fontWeight: 600 }}>
          <span>Jeunes conducteurs acceptés</span>
          <span style={{ color: 'var(--gray-300)' }}>|</span>
          <span>Kilométrage illimité</span>
          <span style={{ color: 'var(--gray-300)' }}>|</span>
          <span>Saint-Denis &amp; Saint-Pierre</span>
          <span style={{ color: 'var(--gray-300)' }}>|</span>
          <span style={{ color: '#d97706', fontWeight: 700 }}>-10% dès 5 jours</span>
        </div>
      </div>

      {/* Grille véhicules */}
      <div className="container" style={{ paddingTop: 36, paddingBottom: 60 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24, marginBottom: 48 }}>
          {CARS.map(car => <CarCard key={car.id} car={car}/>)}
        </div>

        {/* Pied de page contact */}
        <div style={{ background: 'var(--primary)', borderRadius: 20, padding: '28px 32px', color: 'white', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'rgba(255,255,255,.7)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <MapPin size={14} color="rgba(255,255,255,.4)" style={{ flexShrink: 0, marginTop: 2 }}/>
                <span>3b, Rue de la Guadeloupe 97490 — <strong style={{ color: 'white' }}>Saint-Denis</strong></span>
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
              <p>Kilométrage illimité</p>
              <p>Assistance disponible</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
