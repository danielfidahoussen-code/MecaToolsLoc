import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function CarContract() {
  const { id } = useParams();
  const [reservation, setReservation] = useState(null);
  const [pageStatus, setPageStatus] = useState('loading');
  const [paying, setPaying] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promo, setPromo] = useState(null); // { percent, source }
  const [promoChecking, setPromoChecking] = useState(false);
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    axios.get(`/api/car-reservations/public/${id}`)
      .then(({ data }) => {
        setReservation(data);
        setPageStatus('ready');
      })
      .catch(() => setPageStatus('error'));
  }, [id]);

  const handlePay = async () => {
    setPaying(true);
    try {
      const { data } = await axios.post(`/api/car-reservations/${id}/checkout`, { promo_code: promo ? promoCode.trim() : undefined });
      window.location.href = data.url;
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Erreur paiement');
      setPaying(false);
    }
  };

  const checkPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoChecking(true);
    setPromoError('');
    try {
      const { data } = await axios.post('/api/coupons/validate', { code: promoCode.trim(), customer_email: reservation.customer_email });
      setPromo({ percent: data.percent, source: data.source });
      toast.success(`Code appliqué : -${data.percent}% !`);
    } catch (err) {
      setPromo(null);
      setPromoError(err?.response?.data?.error || 'Code invalide');
    } finally {
      setPromoChecking(false);
    }
  };

  if (pageStatus === 'loading') return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <Loader size={40} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (pageStatus === 'error') return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <p style={{ color: 'var(--danger)', fontWeight: 700 }}>Réservation introuvable.</p>
      <Link to="/vehicules" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>Retour</Link>
    </div>
  );

  const discountedTotal = promo ? reservation.total * (1 - promo.percent / 100) : reservation.total;

  return (
    <div style={{ maxWidth: 540, margin: '60px auto', padding: '0 16px' }}>
      <div className="card" style={{ padding: '32px 28px' }}>
        <h2 style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 22, marginBottom: 8 }}>Réservation N°{id}</h2>
        <p style={{ color: 'var(--gray-600)', marginBottom: 20, lineHeight: 1.6 }}>
          <strong>{reservation.car_name}</strong> — du {reservation.start_date} au {reservation.end_date}.<br/>
          Il ne reste plus qu'à régler l'acompte pour confirmer votre réservation.
        </p>

        {/* Récap */}
        <div style={{ background: 'var(--light)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'var(--gray-600)' }}>Location {reservation.days} jour{reservation.days > 1 ? 's' : ''}</span>
            <span style={{ fontWeight: 700 }}>{reservation.car_total || reservation.total} €</span>
          </div>
          {reservation.delivery_out && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: 'var(--gray-600)' }}>Livraison</span>
              <span style={{ fontWeight: 700 }}>20 €</span>
            </div>
          )}
          {reservation.delivery_in && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: 'var(--gray-600)' }}>Récupération</span>
              <span style={{ fontWeight: 700 }}>20 €</span>
            </div>
          )}
          {reservation.booster && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: 'var(--gray-600)' }}>Réhausseur enfant ({reservation.days}j)</span>
              <span style={{ fontWeight: 700 }}>{2 * reservation.days} €</span>
            </div>
          )}
          {reservation.baby_seat && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: 'var(--gray-600)' }}>Siège bébé ({reservation.days}j)</span>
              <span style={{ fontWeight: 700 }}>{4 * reservation.days} €</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--gray-200)', paddingTop: 8, marginTop: 4, fontWeight: 900, fontSize: 15 }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>{reservation.total} €</span>
          </div>
          {promo && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 13 }}>
              <span style={{ color: '#16a34a' }}>Code promo (-{promo.percent}%)</span>
              <span style={{ fontWeight: 700, color: '#16a34a' }}>-{(reservation.total * promo.percent / 100).toFixed(2)} €</span>
            </div>
          )}
          <div style={{ marginTop: 8, padding: '10px 12px', background: '#fff7ed', borderRadius: 8, fontSize: 12, color: '#7c2d12', lineHeight: 1.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <strong>Acompte à payer maintenant (20%)</strong>
              <span style={{ fontWeight: 900, fontSize: 15 }}>{(discountedTotal * 0.2).toFixed(2)} €</span>
            </div>
            <p>Solde de {(discountedTotal * 0.8).toFixed(2)} € réglé en personne à la remise du véhicule. Annulation gratuite jusqu'à 2 jours avant le départ.</p>
          </div>
          <div style={{ marginTop: 10, padding: '10px 12px', background: '#f0f9ff', borderRadius: 8, fontSize: 12, color: '#0c4a6e', lineHeight: 1.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <strong>Caution (dépôt de garantie)</strong>
              {reservation.caution_amount > 0 && (
                <span style={{ fontWeight: 900, fontSize: 15 }}>{reservation.caution_amount} €</span>
              )}
            </div>
            <p>Demandée à la remise des clés par <strong>chèque ou carte bancaire</strong>. Restituée au retour du véhicule en bon état.</p>
          </div>
          <div style={{ marginTop: 10, padding: '10px 12px', background: '#f0f9ff', borderRadius: 8, fontSize: 12, color: '#0c4a6e', lineHeight: 1.5 }}>
            Le contrat de location et l'état des lieux se font <strong>sur place</strong>, lors de la remise des clés, avec votre permis de conduire et une pièce d'identité.
          </div>
        </div>

        {/* Code promo */}
        <div style={{ marginBottom: 16 }}>
          <label className="form-label">Code promo</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-control" placeholder="FIDELE-XXXXXX / PARRAIN-XXXXXX"
              value={promoCode} onChange={e => { setPromoCode(e.target.value); setPromo(null); setPromoError(''); }}
              disabled={!!promo}/>
            <button type="button" className="btn btn-outline" onClick={checkPromo} disabled={promoChecking || !!promo || !promoCode.trim()}>
              {promo ? 'Appliqué ✓' : promoChecking ? '...' : 'Valider'}
            </button>
          </div>
          {promoError && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{promoError}</p>}
        </div>

        <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', fontSize: 16 }}
          onClick={handlePay} disabled={paying}>
          {paying ? 'Redirection vers le paiement...' : `Payer l'acompte de ${(discountedTotal * 0.2).toFixed(2)} € →`}
        </button>
        <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 8 }}>Paiement sécurisé par Stripe</p>
      </div>
    </div>
  );
}
