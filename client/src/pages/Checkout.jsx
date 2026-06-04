import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, CreditCard, Lock, CheckCircle, ArrowLeft, AlertTriangle, MapPin, Loader } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

// Prix par trajet (aller seul = 1 trajet, aller-retour = 2 trajets)
const ZONES = [
  { id: '0-15',  label: '0 – 15 km',   fee: 14.99 },
  { id: '16-35', label: '16 – 35 km',  fee: 24.99 },
  { id: '36-50', label: '36 – 50 km',  fee: 39.99 },
  { id: '50+',   label: '50 km et +',  fee: 49.99 },
];

// Coordonnées de l'adresse du magasin (Auto Presto, Moufia)
const SHOP_LAT = -20.9048811;
const SHOP_LNG = 55.4930903;

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function kmToZone(km) {
  if (km <= 15) return '0-15';
  if (km <= 35) return '16-35';
  if (km <= 50) return '36-50';
  return '50+';
}

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState('delivery');
  const [deliveryTrips, setDeliveryTrips] = useState({ aller: true, retour: false });
  const [deliveryZone, setDeliveryZone] = useState(null); // null = pas encore calculé
  const [detectedKm, setDetectedKm] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [detectedCity, setDetectedCity] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', cardNumber: '', cardExpiry: '', cardCVC: '' });
  const debounceRef = useRef(null);
  const suggestionsRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Ferme les suggestions si clic en dehors
  useEffect(() => {
    const handler = (e) => { if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) setShowSuggestions(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Recherche de suggestions (debounce 400ms)
  const searchSuggestions = useCallback((value) => {
    clearTimeout(debounceRef.current);
    if (value.length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const q = encodeURIComponent(`${value}, La Réunion`);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=5&countrycodes=fr&addressdetails=1`,
          { headers: { 'Accept-Language': 'fr' } }
        );
        const data = await res.json();
        setSuggestions(data.map(d => ({
          label: d.display_name.split(', ').slice(0, 3).join(', '),
          full: d.display_name,
          city: d.address?.city || d.address?.town || d.address?.village || d.address?.municipality || '',
          road: d.address?.road || d.address?.pedestrian || '',
          number: d.address?.house_number || '',
          lat: d.lat, lon: d.lon,
        })));
        setShowSuggestions(data.length > 0);
      } catch { /* silently ignore */ }
    }, 400);
  }, []);

  const selectSuggestion = (s) => {
    const addr = [s.number, s.road].filter(Boolean).join(' ') || s.label.split(',')[0];
    setDetectedCity(s.city || '');
    setForm(f => ({ ...f, address: addr }));
    setSuggestions([]);
    setShowSuggestions(false);
    // Auto-calcul distance
    const km = haversineKm(SHOP_LAT, SHOP_LNG, parseFloat(s.lat), parseFloat(s.lon));
    const zone = kmToZone(km);
    setDetectedKm(km);
    setDeliveryZone(zone);
    setGeoResult({ km, label: s.label.split(', ').slice(0, 2).join(', '), precise: true });
  };

  const hasRentals = items.some(i => i.type === 'rent');
  const isPickup = deliveryMode === 'pickup';

  const currentZone = ZONES.find(z => z.id === deliveryZone);
  const tripCount = isPickup ? 0 : ((deliveryTrips.aller ? 1 : 0) + (deliveryTrips.retour ? 1 : 0));
  const deliveryFee = isPickup ? 0 : (currentZone?.fee ?? 0) * tripCount;
  const discount = isPickup ? total * 0.1 : 0;
  const finalTotal = total - discount + deliveryFee;
  const totalCaution = items.filter(i => i.type === 'rent').reduce((s, i) => s + (i.caution || 0) * i.quantity, 0);
  const rentalZoneError = !isPickup && hasRentals && deliveryZone && deliveryZone !== '0-15';

  const [geoResult, setGeoResult] = useState(null); // { km, label, precise }

  // Géocodage de l'adresse + calcul distance
  const calculateDistance = async () => {
    if (!form.address) {
      toast.error('Entrez votre adresse de livraison');
      return;
    }
    setGeoLoading(true);
    setGeoResult(null);

    const addr = form.address.trim();

    // Séquence de tentatives : du plus précis au plus large
    const attempts = [
      // 1. Adresse complète avec île
      `${addr}, La Réunion`,
      // 2. Sans accents
      `${addr.normalize('NFD').replace(/[̀-ͯ]/g, '')}, Reunion`,
      // 3. Juste les premiers mots (lieu, quartier)
      addr.split(',')[0] ? `${addr.split(',')[0].trim()}, La Réunion` : null,
      // 4. Idem sans accents
      addr.split(',')[0] ? `${addr.split(',')[0].trim().normalize('NFD').replace(/[̀-ͯ]/g, '')}, Reunion` : null,
    ].filter(Boolean);

    const geo = async (q) => {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=fr`,
        { headers: { 'Accept-Language': 'fr' } }
      );
      const d = await r.json();
      return d.length > 0 ? d[0] : null;
    };

    let found = null;
    let attemptIndex = 0;
    for (const q of attempts) {
      try {
        found = await geo(q);
        if (found) break;
      } catch { /* continue */ }
      attemptIndex++;
    }

    if (!found) {
      toast.error('Adresse introuvable — essayez avec juste le nom de votre ville (ex: Saint-Denis)');
      setGeoLoading(false);
      return;
    }

    const km = haversineKm(SHOP_LAT, SHOP_LNG, parseFloat(found.lat), parseFloat(found.lon));
    const zone = kmToZone(km);
    setDetectedKm(km);
    setDeliveryZone(zone);

    // Extrait ville depuis la réponse Nominatim
    const parts = found.display_name.split(',');
    const shortName = parts.slice(0, 2).join(',').trim();
    // Cherche la ville dans les parts (généralement position 2-4)
    const cityPart = parts.find(p => /saint|port|tampon|saint-pierre|sainte|entre|cilaos|salazie|plaine/i.test(p.trim())) || parts[2] || '';
    if (cityPart) setDetectedCity(cityPart.trim());

    const precise = attemptIndex <= 1;
    setGeoResult({ km, label: shortName, precise });
    toast.success(`📍 ${shortName} — ${km.toFixed(1)} km`);
    setGeoLoading(false);
  };

  const validateStep1 = () => {
    if (!form.name || !form.email || !form.phone) { toast.error('Remplissez tous les champs obligatoires'); return; }
    if (!isPickup && !deliveryZone) { toast.error('Calculez d\'abord votre zone de livraison'); return; }
    if (!isPickup && !deliveryTrips.aller && !deliveryTrips.retour) { toast.error('Sélectionnez au moins un trajet (aller ou retour)'); return; }
    if (rentalZoneError) { toast.error('La livraison des locations est limitée à 15 km'); return; }
    setStep(2);
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      const { data } = await axios.post('/api/stripe/create-checkout-session', {
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        customer_address: isPickup ? 'Retrait sur place' : [form.address, detectedCity].filter(Boolean).join(', '),
        delivery_mode: isPickup ? 'pickup' : `delivery-${deliveryZone}-${[deliveryTrips.aller && 'aller', deliveryTrips.retour && 'retour'].filter(Boolean).join('+')}`,
        delivery_fee: deliveryFee,
        discount,
        items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price, type: i.type, rentDates: i.rentDates || null, caution: i.caution || 0 })),
        total_price: finalTotal,
      });
      // Redirige vers la page de paiement Stripe
      window.location.href = data.url;
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Erreur inconnue';
      console.error('Stripe checkout error:', msg);
      toast.error(`Erreur paiement : ${msg}`);
      setPaying(false);
    }
  };

  if (items.length === 0 && !success) return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <ShoppingBag size={60} style={{ color: 'var(--gray-300)', marginBottom: 16 }}/>
      <h2 style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: 12 }}>Panier vide</h2>
      <p style={{ color: 'var(--gray-600)', marginBottom: 24 }}>Vous n'avez aucun article dans votre panier</p>
      <Link to="/catalogue" className="btn btn-primary btn-lg">Voir le catalogue</Link>
    </div>
  );

  if (success) return (
    <div style={{ textAlign: 'center', padding: '100px 20px', maxWidth: 500, margin: '0 auto' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
        <CheckCircle size={40} color="var(--success)"/>
      </div>
      <h2 style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 28, marginBottom: 12 }}>Commande confirmée !</h2>
      <p style={{ color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: 8 }}>Merci {form.name} ! Votre commande a été enregistrée.</p>
      <p style={{ color: 'var(--gray-600)', fontSize: 14, marginBottom: 32 }}>Un email de confirmation a été envoyé à <strong>{form.email}</strong></p>
      <Link to="/" className="btn btn-primary btn-lg">Retour à l'accueil</Link>
    </div>
  );

  return (
    <div>
      <div className="page-header"><div className="container"><h1>Finaliser ma commande</h1></div></div>
      <div className="page" style={{ paddingTop: 40 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'start' }}>

            {/* Left */}
            <div>
              {/* Steps */}
              <div style={{ display: 'flex', gap: 0, marginBottom: 36 }}>
                {[1, 2].map(s => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: s <= step ? 'var(--primary)' : 'var(--gray-200)', color: s <= step ? 'white' : 'var(--gray-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                      {s < step ? '✓' : s}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 14, color: s === step ? 'var(--primary)' : 'var(--gray-400)' }}>
                      {s === 1 ? 'Coordonnées' : 'Paiement'}
                    </span>
                    {s < 2 && <div style={{ flex: 1, height: 2, background: step > s ? 'var(--primary)' : 'var(--gray-200)', marginLeft: 10 }}/>}
                  </div>
                ))}
              </div>

              {step === 1 && (
                <div className="card" style={{ padding: 28 }}>
                  <h3 style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: 24 }}>Vos coordonnées</h3>

                  {/* Toggle Livraison / Retrait */}
                  <div className="form-group">
                    <label className="form-label">Mode de récupération</label>
                    <div style={{ display: 'flex', background: 'var(--gray-100)', borderRadius: 14, padding: 4, gap: 4 }}>
                      <button onClick={() => setDeliveryMode('delivery')} style={{
                        flex: 1, padding: '11px 16px', borderRadius: 10, fontWeight: 700, fontSize: 14, transition: 'all 0.2s',
                        background: !isPickup ? 'white' : 'transparent',
                        boxShadow: !isPickup ? '0 2px 8px rgba(0,0,0,.1)' : 'none',
                        color: !isPickup ? 'var(--primary)' : 'var(--gray-500)',
                      }}>🚚 Livraison</button>

                      <button onClick={() => setDeliveryMode('pickup')} style={{
                        flex: 1, padding: '11px 16px', borderRadius: 10, fontWeight: 700, fontSize: 14, transition: 'all 0.2s',
                        background: isPickup ? '#16a34a' : 'transparent',
                        boxShadow: isPickup ? '0 4px 12px rgba(22,163,74,.35)' : 'none',
                        color: isPickup ? 'white' : 'var(--gray-500)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      }}>
                        🏪 Retrait sur place
                        {/* Badge -10% toujours visible */}
                        <span style={{
                          background: isPickup ? 'rgba(255,255,255,.28)' : 'rgba(220,38,38,.12)',
                          color: isPickup ? 'white' : 'var(--danger)',
                          border: isPickup ? 'none' : '1px solid rgba(220,38,38,.3)',
                          borderRadius: 6, padding: '2px 7px', fontSize: 12, fontWeight: 800,
                        }}>-10%</span>
                      </button>
                    </div>
                    {isPickup && (
                      <p style={{ fontSize: 13, color: '#16a34a', fontWeight: 600, marginTop: 8 }}>
                        ✓ Remise de 10 % appliquée — 3 rue de la Guadeloupe, Moufia 97490
                      </p>
                    )}
                  </div>

                  {/* Coordonnées */}
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Nom complet *</label>
                      <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jean Dupont"/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Téléphone *</label>
                      <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="06 xx xx xx xx"/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input className="form-control" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="vous@exemple.fr"/>
                  </div>

                  {/* Adresse + calcul distance automatique */}
                  {!isPickup && (
                    <>
                      <div className="form-group" ref={suggestionsRef} style={{ position: 'relative' }}>
                        <label className="form-label">Adresse de livraison</label>
                        <input className="form-control" value={form.address}
                          onChange={e => {
                            set('address', e.target.value);
                            setDeliveryZone(null); setDetectedKm(null); setGeoResult(null);
                            searchSuggestions(e.target.value);
                          }}
                          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                          placeholder="Ex: 12 rue des Fleurs, Saint-Denis…"
                          autoComplete="off"/>
                        {showSuggestions && suggestions.length > 0 && (
                          <div style={{
                            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 500,
                            background: 'white', border: '1.5px solid var(--gray-200)',
                            borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                            overflow: 'hidden', marginTop: 4,
                          }}>
                            {suggestions.map((s, i) => (
                              <button key={i} onMouseDown={() => selectSuggestion(s)}
                                style={{
                                  display: 'flex', alignItems: 'flex-start', gap: 10,
                                  width: '100%', padding: '11px 14px', textAlign: 'left',
                                  borderBottom: i < suggestions.length - 1 ? '1px solid var(--gray-100)' : 'none',
                                  background: 'white', transition: 'background .15s',
                                }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,51,51,.05)'}
                                onMouseOut={e => e.currentTarget.style.background = 'white'}>
                                <MapPin size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }}/>
                                <span style={{ fontSize: 13, color: 'var(--gray-800)', lineHeight: 1.4 }}>{s.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        <button className="btn btn-outline btn-sm" onClick={calculateDistance} disabled={geoLoading}
                          style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {geoLoading ? <><Loader size={14} style={{ animation: 'spin .8s linear infinite' }}/> Calcul en cours...</> : <><MapPin size={14}/> Calculer la livraison</>}
                        </button>
                      </div>

                      {/* Résultat du calcul */}
                      {geoResult && (
                        <div style={{
                          background: rentalZoneError ? 'rgba(239,68,68,.06)' : 'rgba(16,185,129,.06)',
                          border: `1px solid ${rentalZoneError ? 'rgba(239,68,68,.3)' : 'rgba(16,185,129,.3)'}`,
                          borderRadius: 10, padding: '14px 16px', marginBottom: 12,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <MapPin size={15} color={rentalZoneError ? 'var(--danger)' : 'var(--success)'} style={{ flexShrink: 0, marginTop: 2 }}/>
                            <div>
                              <p style={{ fontWeight: 700, fontSize: 14, color: rentalZoneError ? 'var(--danger)' : 'var(--success)' }}>
                                📍 {geoResult.label}
                              </p>
                              <p style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 2 }}>
                                Distance estimée : <strong>{geoResult.km.toFixed(1)} km</strong>
                                &nbsp;→&nbsp;
                                <strong>{currentZone?.fee.toFixed(2)} € / trajet</strong>
                              </p>
                              {!geoResult.precise && (
                                <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>
                                  ⚠️ Adresse exacte non trouvée — estimation basée sur votre quartier
                                </p>
                              )}
                            </div>
                          </div>
                          {rentalZoneError && (
                            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(239,68,68,.2)' }}>
                              <AlertTriangle size={15} color="var(--danger)" style={{ flexShrink: 0, marginTop: 1 }}/>
                              <p style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 600 }}>
                                La livraison des locations est limitée à 15 km. Optez pour le retrait sur place (−10% !) ou ne commandez que des achats.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Sélection aller / retour */}
                      {deliveryZone && !rentalZoneError && (
                        <div className="form-group">
                          <label className="form-label">Trajets souhaités</label>
                          <div style={{ display: 'flex', gap: 10 }}>
                            {[
                              { key: 'aller', label: '🚚 Livraison aller', desc: `${currentZone?.fee.toFixed(2)} €` },
                              { key: 'retour', label: '↩️ Retour / récupération', desc: `${currentZone?.fee.toFixed(2)} €` },
                            ].map(({ key, label, desc }) => (
                              <button key={key} onClick={() => setDeliveryTrips(t => ({ ...t, [key]: !t[key] }))}
                                style={{
                                  flex: 1, padding: '12px 14px', borderRadius: 10, border: '1.5px solid',
                                  borderColor: deliveryTrips[key] ? 'var(--accent)' : 'var(--gray-200)',
                                  background: deliveryTrips[key] ? 'rgba(255,51,51,.06)' : 'white',
                                  textAlign: 'left', transition: 'all .2s',
                                }}>
                                <p style={{ fontWeight: 700, fontSize: 13, color: deliveryTrips[key] ? 'var(--accent)' : 'var(--gray-600)' }}>{label}</p>
                                <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{desc}</p>
                              </button>
                            ))}
                          </div>
                          {(deliveryTrips.aller || deliveryTrips.retour) && (
                            <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 6 }}>
                              Total livraison : <strong>{deliveryFee.toFixed(2)} €</strong>
                              {deliveryTrips.aller && deliveryTrips.retour && ' (aller + retour)'}
                            </p>
                          )}
                        </div>
                      )}

                      {!deliveryZone && (
                        <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16 }}>
                          ↑ Entrez votre adresse complète — choisissez une suggestion ou cliquez sur <strong>Calculer la livraison</strong>.
                        </p>
                      )}
                    </>
                  )}

                  <button className="btn btn-primary btn-lg" onClick={validateStep1} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                    Continuer vers le paiement →
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="card" style={{ padding: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ fontWeight: 800, color: 'var(--primary)' }}>Paiement sécurisé</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
                      <Lock size={14}/> SSL Stripe
                    </div>
                  </div>

                  {/* Récap commande */}
                  <div style={{ background: 'var(--light)', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)', marginBottom: 10 }}>Résumé de votre commande</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: 'var(--gray-600)' }}>Client</span>
                      <span style={{ fontWeight: 600 }}>{form.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: 'var(--gray-600)' }}>Email</span>
                      <span style={{ fontWeight: 600 }}>{form.email}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: 'var(--gray-600)' }}>Livraison</span>
                      <span style={{ fontWeight: 600 }}>{isPickup ? 'Retrait sur place' : `Livraison — ${deliveryFee.toFixed(2)} €`}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800, color: 'var(--primary)', borderTop: '1.5px solid var(--gray-200)', paddingTop: 10, marginTop: 8 }}>
                      <span>Total à payer</span>
                      <span>{finalTotal.toFixed(2)} €</span>
                    </div>
                    {totalCaution > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, padding: '8px 10px', background: 'rgba(59,130,246,.07)', border: '1.5px solid rgba(59,130,246,.2)', borderRadius: 8 }}>
                        <span>🔒</span>
                        <span style={{ fontSize: 12, color: '#1e40af', fontWeight: 600 }}>Caution : {totalCaution.toFixed(2)} € — collectée à la remise, non débitée</span>
                      </div>
                    )}
                  </div>

                  {/* Info Stripe */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
                    <Lock size={16} color="#6366f1" style={{ flexShrink: 0, marginTop: 1 }}/>
                    <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.5 }}>
                      Vous allez être redirigé vers la page de paiement sécurisée <strong>Stripe</strong>. Carte bancaire, Apple Pay et Google Pay acceptés. Vos données ne transitent jamais par nos serveurs.
                    </p>
                  </div>

                  <button className="btn btn-primary btn-lg" onClick={handlePay} disabled={paying}
                    style={{ width: '100%', justifyContent: 'center', fontSize: 16 }}>
                    <CreditCard size={18}/>
                    {paying ? 'Redirection vers Stripe...' : `Payer ${finalTotal.toFixed(2)} € →`}
                  </button>
                  <button className="btn" onClick={() => setStep(1)}
                    style={{ width: '100%', justifyContent: 'center', marginTop: 10, background: 'var(--gray-100)', color: 'var(--gray-700)' }}>
                    <ArrowLeft size={14}/> Retour
                  </button>
                </div>
              )}
            </div>

            {/* Right: Récapitulatif */}
            <div className="card" style={{ padding: 24, position: 'sticky', top: 100 }}>
              <h3 style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: 20 }}>Récapitulatif</h3>
              {items.map(item => (
                <div key={item.key} style={{ display: 'flex', gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--gray-100)' }}>
                  <img src={item.image} alt={item.name} style={{ width: 56, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--primary)', lineHeight: 1.3 }}>{item.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>{item.type === 'sale' ? '🛒 Achat' : '📅 Location'} × {item.quantity}</p>
                    {item.rentDates && <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>{new Date(item.rentDates.startDate).toLocaleDateString('fr-FR')} → {new Date(item.rentDates.endDate).toLocaleDateString('fr-FR')}</p>}
                    {item.has_qr_notice && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 5, fontSize: 11, fontWeight: 700, color: '#7c3aed', background: 'rgba(124,58,237,.1)', border: '1px solid rgba(124,58,237,.25)', borderRadius: 6, padding: '3px 8px' }}>
                        🎬 Vidéo notice d'utilisation offerte
                      </span>
                    )}
                  </div>
                  <p style={{ fontWeight: 800, fontSize: 14, color: 'var(--primary)', whiteSpace: 'nowrap' }}>{(item.price * item.quantity).toFixed(2)} €</p>
                </div>
              ))}
              <div style={{ paddingTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: 'var(--gray-600)' }}>Sous-total</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>🏷️ Remise retrait (-10%)</span>
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>-{discount.toFixed(2)} €</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: 'var(--gray-600)' }}>Livraison {geoResult && !isPickup ? `(${geoResult.km.toFixed(1)} km)` : ''}</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    {isPickup ? '—' : deliveryZone ? `${deliveryFee.toFixed(2)} €` : 'À calculer'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18, color: 'var(--primary)', borderTop: '2px solid var(--gray-200)', paddingTop: 12, marginTop: 8 }}>
                  <span>Total TTC</span>
                  <span>{finalTotal.toFixed(2)} €</span>
                </div>
                {totalCaution > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '10px 12px', background: 'rgba(59,130,246,.07)', border: '1.5px solid rgba(59,130,246,.2)', borderRadius: 10, fontSize: 13 }}>
                    <span style={{ fontSize: 16 }}>🔒</span>
                    <div>
                      <p style={{ fontWeight: 700, color: '#1e40af' }}>Caution : {totalCaution.toFixed(2)} €</p>
                      <p style={{ fontSize: 11, color: 'var(--gray-600)', marginTop: 1 }}>Non débitée — collectée à la remise du matériel</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .container > div[style*="grid-template-columns: 1fr 380px"] { grid-template-columns: 1fr !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
