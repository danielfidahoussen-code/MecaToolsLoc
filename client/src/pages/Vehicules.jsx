import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { differenceInDays } from 'date-fns';
import { Phone, Mail, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const DELIVERY_FEE = 20;
const BOOSTER_FEE_PER_DAY = 2;
const BABY_SEAT_FEE_PER_DAY = 4;

const hasTierPricing = (car) => car.price_1_3 != null;

// Grille à 5 paliers (nouveaux véhicules)
function tierRate(car, days) {
  if (days >= 30) return car.price_30plus;
  if (days >= 21) return car.price_21_29;
  if (days >= 11) return car.price_11_20;
  if (days >= 4) return car.price_4_10;
  return car.price_1_3;
}

function calcPrice(car, days) {
  if (!days || days <= 0) return 0;
  if (car.min_days && days < car.min_days) return 0;
  if (hasTierPricing(car)) return tierRate(car, days) * days;
  if (days >= 14) return car.price_2weeks * days;
  if (days >= 5 && car.price_5days) return car.price_5days * days;
  if (car.price_day) return car.price_day * days;
  return 0;
}

function getRateInfo(car, days) {
  if (!days || days <= 0) return null;
  if (car.min_days && days < car.min_days) return { label: `Minimum ${car.min_days} jours pour ce véhicule`, color: 'var(--danger)', invalid: true };
  if (hasTierPricing(car)) {
    const rate = tierRate(car, days);
    const tierLabel = days >= 30 ? '+ de 30 jours' : days >= 21 ? '21 à 29 jours' : days >= 11 ? '11 à 20 jours' : days >= 4 ? '4 à 10 jours' : '1 à 3 jours';
    return { label: `${tierLabel} — ${rate} €/j`, color: '#059669' };
  }
  if (days >= 14) return { label: `Tarif 2 semaines — ${car.price_2weeks} €/j`, color: '#059669' };
  if (days >= 5 && car.price_5days) return { label: `-10% dès 5 jours — ${car.price_5days} €/j`, color: '#d97706' };
  if (car.price_day) return { label: `Tarif journalier — ${car.price_day} €/j`, color: 'var(--gray-500)' };
  return null;
}

// Liste des paliers à afficher (mini-tableau tarifaire sur la fiche)
function getTiers(car) {
  if (hasTierPricing(car)) {
    return [
      { key: '1-3', label: '1-3j', value: car.price_1_3 },
      { key: '4-10', label: '4-10j', value: car.price_4_10 },
      { key: '11-20', label: '11-20j', value: car.price_11_20 },
      { key: '21-29', label: '21-29j', value: car.price_21_29 },
      { key: '30+', label: '30j+', value: car.price_30plus },
    ].filter(t => t.value > 0);
  }
  return [
    { key: 'day', label: 'Journalier', value: car.price_day },
    { key: '5days', label: '5 jours+', value: car.price_5days },
    { key: '2weeks', label: '2 semaines', value: car.price_2weeks },
  ].filter(t => t.value > 0);
}

function CarCard({ car }) {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [deliveryOut, setDeliveryOut] = useState(false);
  const [deliveryIn, setDeliveryIn] = useState(false);
  const [booster, setBooster] = useState(false);
  const [babySeat, setBabySeat] = useState(false);
  const [open, setOpen] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const isRequestOnly = car.booking_mode === 'request';

  const days = startDate && endDate ? Math.max(1, differenceInDays(endDate, startDate)) : 0;
  const carTotal = calcPrice(car, days);
  const boosterTotal = booster ? BOOSTER_FEE_PER_DAY * days : 0;
  const babySeatTotal = babySeat ? BABY_SEAT_FEE_PER_DAY * days : 0;
  const total = carTotal
    + (deliveryOut ? DELIVERY_FEE : 0)
    + (deliveryIn ? DELIVERY_FEE : 0)
    + boosterTotal
    + babySeatTotal;
  const hasOptions = deliveryOut || deliveryIn || booster || babySeat;
  const rateInfo = getRateInfo(car, days);

  const handleReserve = async () => {
    if (!startDate || !endDate) { toast.error('Choisissez vos dates'); return; }
    if (car.min_days && days < car.min_days) { toast.error(`Ce véhicule est disponible à partir de ${car.min_days} jours`); return; }
    if (!form.name || !form.phone || !form.email) { toast.error('Nom, téléphone et email requis'); return; }
    if (rateInfo?.invalid) { toast.error(rateInfo.label); return; }
    setReserving(true);
    const payload = {
      car_id: car.id,
      car_name: car.name,
      start_date: startDate.toLocaleDateString('fr-FR'),
      end_date: endDate.toLocaleDateString('fr-FR'),
      days,
      car_total: carTotal,
      total,
      delivery_out: deliveryOut,
      delivery_in: deliveryIn,
      booster,
      baby_seat: babySeat,
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone,
    };
    try {
      if (isRequestOnly) {
        await axios.post('/api/car-reservations/request', payload);
        setRequestSent(true);
        toast.success('Demande envoyée !');
      } else {
        const { data } = await axios.post('/api/car-reservations/create', payload);
        navigate(`/vehicules/contrat/${data.id}`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Erreur lors de la réservation');
    } finally {
      setReserving(false);
    }
  };

  const tiers = getTiers(car);
  const startPrice = tiers.length > 0 ? tiers[tiers.length - 1].value : 0;

  return (
    <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Image */}
      <div style={{ height: 200, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0, overflow: 'hidden', borderBottom: '1px solid var(--gray-100)' }}>
        {car.image
          ? <img src={car.image} alt={car.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s ease' }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.07)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}/>
          : <p style={{ color: 'var(--gray-400)', fontSize: 13, fontWeight: 600 }}>Photo à venir</p>
        }
        <div style={{ position: 'absolute', top: 12, left: 12, background: 'var(--accent)', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {(car.category || '').split('—')[0].trim()}
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
        {car.specs && car.specs.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--gray-100)' }}>
            {car.specs.map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--gray-500)', fontWeight: 500 }}>{k}</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tarifs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {tiers.map((t, i) => (
            <div key={t.key} style={{
              flex: '1 1 0', minWidth: 56, borderRadius: 8, padding: '8px 4px', textAlign: 'center',
              background: i === tiers.length - 1 ? 'var(--primary)' : i === 0 ? 'var(--gray-100)' : 'rgba(245,197,24,.12)',
              border: i > 0 && i < tiers.length - 1 ? '1px solid rgba(245,197,24,.3)' : 'none',
            }}>
              <p style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', color: i === tiers.length - 1 ? 'rgba(255,255,255,.6)' : 'var(--gray-500)', marginBottom: 2 }}>{t.label}</p>
              <p style={{ fontSize: 14, fontWeight: 900, color: i === tiers.length - 1 ? 'white' : 'var(--primary)' }}>{t.value} €</p>
            </div>
          ))}
        </div>

        {car.caution > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#0c4a6e', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '6px 10px', borderRadius: 8, marginBottom: 8, fontWeight: 600 }}>
            <span>Caution à la remise des clés</span>
            <span style={{ fontWeight: 900, fontSize: 14 }}>{car.caution} €</span>
          </div>
        )}
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

        {open && !requestSent && (
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
                  {!rateInfo?.invalid && <span style={{ fontWeight: 900, fontSize: 18, color: 'var(--primary)' }}>{carTotal} €</span>}
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

            {/* Options : livraison, récupération, sièges enfant */}
            <p style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 6 }}>Pour la livraison / récupération, le lieu sera convenu avec vous par téléphone.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {/* Livraison */}
              <div style={{ border: '1.5px solid var(--gray-200)', borderRadius: 10, padding: '12px 14px', background: deliveryOut ? 'rgba(34,197,94,.06)' : 'var(--gray-50)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14, color: 'var(--primary)' }}>
                  <input type="checkbox" checked={deliveryOut} onChange={e => setDeliveryOut(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}/>
                  <span>Livraison du véhicule</span>
                  <span style={{ marginLeft: 'auto', background: 'var(--accent)', color: 'white', padding: '2px 8px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>+{DELIVERY_FEE} €</span>
                </label>
              </div>

              {/* Récupération */}
              <div style={{ border: '1.5px solid var(--gray-200)', borderRadius: 10, padding: '12px 14px', background: deliveryIn ? 'rgba(34,197,94,.06)' : 'var(--gray-50)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14, color: 'var(--primary)' }}>
                  <input type="checkbox" checked={deliveryIn} onChange={e => setDeliveryIn(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}/>
                  <span>Récupération du véhicule</span>
                  <span style={{ marginLeft: 'auto', background: 'var(--accent)', color: 'white', padding: '2px 8px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>+{DELIVERY_FEE} €</span>
                </label>
              </div>

              {/* Réhausseur */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14, color: 'var(--primary)', border: '1.5px solid var(--gray-200)', borderRadius: 10, padding: '12px 14px', background: booster ? 'rgba(34,197,94,.06)' : 'var(--gray-50)' }}>
                <input type="checkbox" checked={booster} onChange={e => setBooster(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}/>
                <span>Réhausseur enfant</span>
                <span style={{ marginLeft: 'auto', background: 'var(--accent)', color: 'white', padding: '2px 8px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>+{BOOSTER_FEE_PER_DAY} €/j</span>
              </label>

              {/* Siège bébé */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14, color: 'var(--primary)', border: '1.5px solid var(--gray-200)', borderRadius: 10, padding: '12px 14px', background: babySeat ? 'rgba(34,197,94,.06)' : 'var(--gray-50)' }}>
                <input type="checkbox" checked={babySeat} onChange={e => setBabySeat(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--accent)', cursor: 'pointer' }}/>
                <span>Siège bébé</span>
                <span style={{ marginLeft: 'auto', background: 'var(--accent)', color: 'white', padding: '2px 8px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>+{BABY_SEAT_FEE_PER_DAY} €/j</span>
              </label>
            </div>

            {/* Récap total */}
            {days > 0 && !rateInfo?.invalid && (
              <div style={{ background: 'var(--light)', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gray-600)', marginBottom: hasOptions ? 4 : 0 }}>
                  <span>Location ({days}j)</span>
                  <span>{carTotal} €</span>
                </div>
                {deliveryOut && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gray-600)', marginBottom: 4 }}>
                    <span>Livraison</span>
                    <span>{DELIVERY_FEE} €</span>
                  </div>
                )}
                {deliveryIn && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gray-600)', marginBottom: 4 }}>
                    <span>Récupération</span>
                    <span>{DELIVERY_FEE} €</span>
                  </div>
                )}
                {booster && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gray-600)', marginBottom: 4 }}>
                    <span>Réhausseur ({days}j)</span>
                    <span>{boosterTotal} €</span>
                  </div>
                )}
                {babySeat && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gray-600)', marginBottom: 4 }}>
                    <span>Siège bébé ({days}j)</span>
                    <span>{babySeatTotal} €</span>
                  </div>
                )}
                {hasOptions && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, color: 'var(--primary)', borderTop: '1px solid var(--gray-200)', paddingTop: 6, marginTop: 4 }}>
                    <span>Total</span>
                    <span>{total} €</span>
                  </div>
                )}
              </div>
            )}

            {/* Info caution */}
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#0c4a6e', lineHeight: 1.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <p style={{ fontWeight: 800 }}>Caution (dépôt de garantie)</p>
                {car.caution > 0 && (
                  <span style={{ fontWeight: 900, fontSize: 15, color: '#0369a1' }}>{car.caution} €</span>
                )}
              </div>
              <p>Demandée à la remise des clés par <strong>chèque ou carte bancaire</strong>. Restituée au retour du véhicule en bon état.</p>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 15 }} onClick={handleReserve} disabled={reserving}>
              {reserving
                ? 'Envoi en cours...'
                : isRequestOnly ? 'Envoyer la demande de réservation →' : 'Réserver et signer le contrat →'}
            </button>
            <p style={{ fontSize: 11, color: 'var(--gray-400)', textAlign: 'center', marginTop: 6 }}>
              {isRequestOnly ? 'Nous vous contactons pour confirmer — paiement et contrat sur place' : 'Vous signerez le contrat avant le paiement en ligne'}
            </p>
          </div>
        )}
        {requestSent && (
          <div style={{ background: '#d1fae5', border: '1.5px solid #86efac', borderRadius: 12, padding: '16px 18px', textAlign: 'center' }}>
            <p style={{ fontWeight: 800, color: '#065f46', marginBottom: 4 }}>Demande envoyée !</p>
            <p style={{ fontSize: 13, color: '#065f46' }}>Nous vous recontactons rapidement pour confirmer votre réservation. Le paiement et le contrat se feront sur place.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Catégorie principale d'un véhicule (avant le "—", ex. "Citadine — Phase 1" -> "Citadine")
const mainCategory = (car) => (car.category || '').split('—')[0].trim();

export default function Vehicules() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || '';

  useEffect(() => {
    axios.get('/api/cars').then(({ data }) => setCars(data)).finally(() => setLoading(false));
  }, []);

  // Remonte en haut quand on change de catégorie (les liens du footer ne changent que le ?category=)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [category]);

  // Catégories disponibles, dans l'ordre d'apparition
  const availableCategories = [...new Set(cars.map(mainCategory).filter(Boolean))];

  const visibleCars = category
    ? cars.filter(c => mainCategory(c).toLowerCase() === category.toLowerCase())
    : cars;

  const setCategory = (val) => {
    const np = new URLSearchParams(searchParams);
    if (val) np.set('category', val); else np.delete('category');
    setSearchParams(np);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #380808 100%)', color: 'white', padding: '48px 0 40px' }}>
        <div className="container">
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,.5)', marginBottom: 6 }}>PrestoLocation</p>
          <h1 style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 900, marginBottom: 10 }}>Location de véhicules</h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 15, maxWidth: 540, marginBottom: 20 }}>
            Large gamme de véhicules. Retrait à Saint-Denis ou livraison sur toute l'île. Jeunes conducteurs acceptés. Tarifs dégressifs dès 5 jours.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="tel:+262693839654" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.15)', color: 'white', padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              <Phone size={15}/> +262 693 83 96 54
            </a>
            <a href="mailto:contact@lvtools.re" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.8)', padding: '10px 18px', borderRadius: 10, fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
              <Mail size={14}/> contact@lvtools.re
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
          <span>Retrait à Saint-Denis · Livraison toute l'île</span>
          <span style={{ color: 'var(--gray-300)' }}>|</span>
          <span style={{ color: '#059669', fontWeight: 700 }}>Livraison 20 € / Récupération 20 €</span>
          <span style={{ color: 'var(--gray-300)' }}>|</span>
          <span style={{ color: '#d97706', fontWeight: 700 }}>-10% dès 5 jours</span>
        </div>
      </div>

      {/* Grille véhicules */}
      <div className="container" style={{ paddingTop: 36, paddingBottom: 60 }}>
        {/* Filtres par catégorie */}
        {!loading && availableCategories.length > 0 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
            <button onClick={() => setCategory('')}
              style={{ padding: '8px 16px', borderRadius: 999, fontWeight: 700, fontSize: 14, border: '1px solid var(--gray-200)',
                background: category === '' ? 'var(--primary)' : 'white', color: category === '' ? 'white' : 'var(--gray-700)', cursor: 'pointer', transition: 'var(--transition)' }}>
              Tous
            </button>
            {availableCategories.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                style={{ padding: '8px 16px', borderRadius: 999, fontWeight: 700, fontSize: 14, border: '1px solid var(--gray-200)',
                  background: category.toLowerCase() === cat.toLowerCase() ? 'var(--primary)' : 'white',
                  color: category.toLowerCase() === cat.toLowerCase() ? 'white' : 'var(--gray-700)', cursor: 'pointer', transition: 'var(--transition)' }}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>Chargement...</div>
        ) : visibleCars.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>
            {category ? `Aucun véhicule dans la catégorie « ${category} ».` : 'Aucun véhicule disponible pour le moment.'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24, marginBottom: 48 }}>
            {visibleCars.map(car => <CarCard key={car.id} car={car}/>)}
          </div>
        )}

        {/* Pied de page contact */}
        <div style={{ background: 'var(--primary)', borderRadius: 20, padding: '28px 32px', color: 'white', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 10, letterSpacing: 1 }}>Contact</p>
            <a href="tel:+262693839654" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
              <Phone size={15} color="rgba(255,255,255,.5)"/> +262 693 83 96 54
            </a>
            <a href="mailto:contact@lvtools.re" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.6)', textDecoration: 'none', fontSize: 13 }}>
              <Mail size={14} color="rgba(255,255,255,.4)"/> contact@lvtools.re
            </a>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 10, letterSpacing: 1 }}>Retrait &amp; livraison</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'rgba(255,255,255,.7)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <MapPin size={14} color="rgba(255,255,255,.4)" style={{ flexShrink: 0, marginTop: 2 }}/>
                <span>Retrait : 3b, Rue de la Guadeloupe 97490 — <strong style={{ color: 'white' }}>Saint-Denis</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <MapPin size={14} color="rgba(255,255,255,.4)" style={{ flexShrink: 0, marginTop: 2 }}/>
                <span>Livraison possible sur <strong style={{ color: 'white' }}>toute l'île</strong></span>
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
