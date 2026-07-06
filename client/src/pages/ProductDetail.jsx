import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ShoppingCart, Calendar, ChevronLeft, Package, Info, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { addDays, differenceInDays } from 'date-fns';

function ProductGallery({ product }) {
  const allImages = [product.image, ...(product.images || [])].filter(Boolean);
  const [active, setActive] = useState(0);

  return (
    <div>
      {/* Image principale avec zoom */}
      <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--gray-200)', marginBottom: 10, cursor: 'zoom-in', background: 'var(--light)' }}>
        <img
          key={active}
          src={allImages[active]}
          alt={product.name}
          style={{ width: '100%', height: 380, objectFit: 'contain', transition: 'transform 0.3s ease' }}
          onMouseMove={e => {
            if (window.matchMedia('(hover: none)').matches) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            e.currentTarget.style.transformOrigin = `${x}% ${y}%`;
            e.currentTarget.style.transform = 'scale(2.5)';
          }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        />
      </div>
      {/* Miniatures */}
      {allImages.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {allImages.map((url, i) => (
            <button key={i} onClick={() => setActive(i)} style={{
              width: 72, height: 60, borderRadius: 10, overflow: 'hidden', padding: 0,
              border: `2px solid ${active === i ? 'var(--accent)' : 'var(--gray-200)'}`,
              cursor: 'pointer', background: 'var(--light)', flexShrink: 0,
              transition: 'border-color .2s',
            }}>
              <img src={url} alt={`vue ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }}/>
            </button>
          ))}
        </div>
      )}
      {/* Description */}
      <div style={{ background: 'var(--light)', borderRadius: 14, padding: '16px 20px' }}>
        <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)', marginBottom: 10 }}>Détails</p>
        <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{product.description}</p>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('buy');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [qty, setQty] = useState(1);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    axios.get(`/api/products/${id}`).then(r => {
      setProduct(r.data);
      const wantRent = searchParams.get('tab') === 'rent';
      if (r.data.available_for_rent && (wantRent || !r.data.available_for_sale)) setActiveTab('rent');
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-center"><div className="spinner"/></div>;
  if (!product) return <div style={{ padding: '80px 20px', textAlign: 'center' }}><p>Produit non trouvé</p><Link to="/catalogue" className="btn btn-primary" style={{ marginTop: 16 }}>Retour au catalogue</Link></div>;

  // Build a map: date string -> number of overlapping reservations
  const reservationCountByDate = {};
  (product.reservations || []).forEach(res => {
    let d = new Date(res.start_date);
    const end = new Date(res.end_date);
    while (d <= end) {
      const key = d.toISOString().split('T')[0];
      reservationCountByDate[key] = (reservationCountByDate[key] || 0) + (res.quantity || 1);
      d = addDays(d, 1);
    }
  });

  // Dates fully booked (reservations >= stock) — blocked in calendar
  const fullyBookedDates = Object.entries(reservationCountByDate)
    .filter(([, count]) => count >= product.stock)
    .map(([dateStr]) => new Date(dateStr));

  // Partially reserved dates (highlighted in orange)
  const partialDates = Object.entries(reservationCountByDate)
    .filter(([, count]) => count < product.stock)
    .map(([dateStr]) => new Date(dateStr));

  // Check if selected range overlaps a fully booked date
  const isRangeAvailable = () => {
    if (!startDate || !endDate) return true;
    let d = new Date(startDate);
    while (d <= endDate) {
      const key = d.toISOString().split('T')[0];
      if ((reservationCountByDate[key] || 0) >= product.stock) return false;
      d = addDays(d, 1);
    }
    return true;
  };

  const rangeAvailable = isRangeAvailable();

  const days = startDate && endDate ? Math.max(1, differenceInDays(endDate, startDate)) : 0;
  const rentPriceTTC = days >= 7
    ? Math.ceil(days / 7) * (product.price_week || product.price_day * 5)
    : days * (product.price_day || 0);
  const rentPrice = rentPriceTTC.toFixed(2);

  const handleAddToCart = () => {
    addItem(product, 'sale', qty);
    toast.success('Ajouté au panier !');
  };

  const handleReserve = async () => {
    if (!startDate || !endDate) return toast.error('Choisissez vos dates');
    setReserving(true);
    try {
      addItem(product, 'rent', qty, {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });
      toast.success('Réservation ajoutée — finalisez votre commande');
      navigate('/checkout');
    } catch (e) {
      toast.error('Erreur lors de la réservation');
    } finally {
      setReserving(false);
    }
  };

  const stockColor = product.stock > 5 ? 'var(--success)' : product.stock > 0 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div>
      <div style={{ background: 'var(--light)', borderBottom: '1px solid var(--gray-200)', padding: '14px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--gray-600)' }}>
            <Link to="/" style={{ color: 'var(--gray-600)' }}>Accueil</Link> /
            <Link to="/catalogue" style={{ color: 'var(--gray-600)' }}>Catalogue</Link> /
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{product.name}</span>
          </div>
        </div>
      </div>

      <div className="page" style={{ paddingTop: 40 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>

            {/* Left: Galerie + description */}
            <ProductGallery product={product}/>

            {/* Right: Info + action */}
            <div>
              <p style={{ fontSize: 12, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>
                {product.category_name}
              </p>
              <h1 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800, color: 'var(--primary)', marginBottom: 12 }}>{product.name}</h1>

              {/* Stock */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700, color: stockColor }}>
                  ● {product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
                </span>
                {product.available_for_rent && <span className="badge badge-rent">Location</span>}
                {product.available_for_sale && <span className="badge badge-sale">Achat</span>}
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderRadius: 12, background: 'var(--gray-100)', padding: 4 }}>
                {product.available_for_sale && (
                  <button style={{ flex: 1, padding: '10px', borderRadius: 10, fontWeight: 700, fontSize: 14, transition: 'var(--transition)', background: activeTab === 'buy' ? 'white' : 'transparent', color: activeTab === 'buy' ? 'var(--primary)' : 'var(--gray-500)', boxShadow: activeTab === 'buy' ? 'var(--shadow-sm)' : 'none' }} onClick={() => setActiveTab('buy')}>
                    Acheter
                  </button>
                )}
                {product.available_for_rent && (
                  <button style={{ flex: 1, padding: '10px', borderRadius: 10, fontWeight: 700, fontSize: 14, transition: 'var(--transition)', background: activeTab === 'rent' ? 'white' : 'transparent', color: activeTab === 'rent' ? 'var(--primary)' : 'var(--gray-500)', boxShadow: activeTab === 'rent' ? 'var(--shadow-sm)' : 'none' }} onClick={() => setActiveTab('rent')}>
                    Louer
                  </button>
                )}
              </div>

              {/* Buy panel */}
              {activeTab === 'buy' && product.available_for_sale && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                    <span style={{ fontSize: 36, fontWeight: 900, color: 'var(--primary)' }}>{product.price_sale?.toFixed(2)} €</span>
                    <span style={{ fontSize: 14, color: 'var(--gray-500)' }}>TTC</span>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quantité</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                      <span style={{ fontWeight: 700, fontSize: 18, minWidth: 30, textAlign: 'center' }}>{qty}</span>
                      <button className="btn btn-outline btn-sm" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-lg" onClick={handleAddToCart} disabled={product.stock === 0} style={{ width: '100%', justifyContent: 'center' }}>
                    <ShoppingCart size={18}/> Ajouter au panier — {(product.price_sale * qty).toFixed(2)} €
                  </button>
                </div>
              )}

              {/* Rent panel */}
              {activeTab === 'rent' && product.available_for_rent && (
                <div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: product.caution ? 12 : 20, flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(245,197,24,.1)', padding: '10px 16px', borderRadius: 10 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase' }}>Par jour</p>
                      <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{product.price_day?.toFixed(2)} €</p>
                    </div>
                    {product.price_week && (
                      <div style={{ background: 'rgba(245,197,24,.15)', padding: '10px 16px', borderRadius: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase' }}>Par semaine</p>
                        <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{product.price_week?.toFixed(2)} €</p>
                      </div>
                    )}
                  </div>
                  {product.caution > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(59,130,246,.07)', border: '1.5px solid rgba(59,130,246,.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 20 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#1e40af' }}>C</span>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 13, color: '#1e40af' }}>Caution : {product.caution.toFixed(2)} €</p>
                        <p style={{ fontSize: 11, color: 'var(--gray-600)', marginTop: 1 }}>Collectée à la remise du matériel — restituée en fin de location</p>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Date de début</label>
                      <DatePicker selected={startDate}
                        onChange={d => { setStartDate(d); if (endDate && d > endDate) setEndDate(null); }}
                        minDate={new Date()}
                        excludeDates={fullyBookedDates}
                        highlightDates={[{ 'react-datepicker__day--highlighted': partialDates }]}
                        placeholderText="Choisir..." dateFormat="dd/MM/yyyy" className="form-control"/>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Date de fin</label>
                      <DatePicker selected={endDate}
                        onChange={setEndDate}
                        minDate={startDate || new Date()}
                        excludeDates={fullyBookedDates}
                        highlightDates={[{ 'react-datepicker__day--highlighted': partialDates }]}
                        placeholderText="Choisir..." dateFormat="dd/MM/yyyy" className="form-control"/>
                    </div>
                  </div>

                  {days > 0 && rangeAvailable && (
                    <div style={{ background: 'rgba(245,197,24,.1)', border: '1.5px solid rgba(245,197,24,.3)', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{days} jour{days > 1 ? 's' : ''}</span>
                        <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--primary)' }}>{rentPriceTTC.toFixed(2)} €</span>
                      </div>
                    </div>
                  )}

                  {days > 0 && !rangeAvailable && (
                    <div style={{ background: '#fee2e2', border: '1.5px solid #fca5a5', borderRadius: 12, padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>🚫</span>
                      <span style={{ fontWeight: 700, color: 'var(--danger)', fontSize: 14 }}>Ces dates sont déjà entièrement réservées. Veuillez choisir d'autres dates.</span>
                    </div>
                  )}

                  {fullyBookedDates.length > 0 && (
                    <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 12 }}>
                      <Info size={12} style={{ verticalAlign: 'middle', marginRight: 4 }}/> Les dates grisées sont complètes — sélection impossible
                    </p>
                  )}

                  {product.stock === 0 ? (
                    <button className="btn btn-lg" disabled style={{ width: '100%', justifyContent: 'center', background: '#fee2e2', color: 'var(--danger)', cursor: 'not-allowed' }}>
                      🚫 Rupture de stock
                    </button>
                  ) : !rangeAvailable ? (
                    <button className="btn btn-lg" disabled style={{ width: '100%', justifyContent: 'center', background: '#fee2e2', color: 'var(--danger)', cursor: 'not-allowed' }}>
                      🚫 Dates non disponibles
                    </button>
                  ) : (
                    <button className="btn btn-primary btn-lg" onClick={handleReserve} disabled={reserving || !startDate || !endDate} style={{ width: '100%', justifyContent: 'center' }}>
                      <Calendar size={18}/> {reserving ? 'En cours...' : `Réserver — ${rentPriceTTC ? rentPriceTTC.toFixed(2) + ' €' : '?'}`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .container > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
