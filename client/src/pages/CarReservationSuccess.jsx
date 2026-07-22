import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, FileText } from 'lucide-react';
import axios from 'axios';

export default function CarReservationSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [info, setInfo] = useState({});

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) { setStatus('failed'); return; }
    axios.get(`/api/car-reservations/session/${sessionId}`)
      .then(({ data }) => {
        if (data.paid) { setInfo(data); setStatus('paid'); }
        else setStatus('failed');
      })
      .catch(() => setStatus('failed'));
  }, []);

  if (status === 'loading') return (
    <div style={{ textAlign: 'center', padding: '120px 20px' }}>
      <Loader size={48} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite', marginBottom: 20 }}/>
      <p style={{ color: 'var(--gray-500)' }}>Vérification du paiement...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (status === 'failed') return (
    <div style={{ textAlign: 'center', padding: '100px 20px', maxWidth: 500, margin: '0 auto' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
        <XCircle size={40} color="var(--danger)"/>
      </div>
      <h2 style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 26, marginBottom: 12 }}>Paiement non confirmé</h2>
      <p style={{ color: 'var(--gray-600)', marginBottom: 32 }}>Le paiement n'a pas pu être vérifié. Si vous avez été débité, contactez-nous.</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Link to="/vehicules" className="btn btn-primary">Réessayer</Link>
        <Link to="/contact" className="btn btn-outline">Nous contacter</Link>
      </div>
    </div>
  );

  return (
    <div style={{ textAlign: 'center', padding: '100px 20px', maxWidth: 520, margin: '0 auto' }}>
      <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
        <CheckCircle size={46} color="#059669"/>
      </div>
      <h2 style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 28, marginBottom: 12 }}>Réservation confirmée !</h2>
      <p style={{ color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: 8 }}>
        Merci {info.customer_name} ! Votre réservation a bien été enregistrée.
      </p>
      <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 32 }}>
        Un reçu a été envoyé à <strong>{info.customer_email}</strong>
      </p>
      <div style={{ background: 'var(--light)', borderRadius: 12, padding: '16px 20px', marginBottom: 32, fontSize: 14, color: 'var(--gray-600)', textAlign: 'left' }}>
        <p style={{ fontWeight: 700, marginBottom: 8, color: 'var(--primary)' }}>Prochaines étapes</p>
        <p>Nous vous contacterons sous 24h pour confirmer les détails</p>
        <p style={{ marginTop: 6 }}>Remise des clés au point de retrait choisi — caution demandée sur place</p>
      </div>
      <Link to="/" className="btn btn-primary btn-lg">Retour à l'accueil</Link>
    </div>
  );
}
