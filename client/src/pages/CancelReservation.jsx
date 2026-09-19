import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle, XCircle, Loader } from 'lucide-react';
import axios from 'axios';

// Page générique d'annulation — utilisée pour les réservations véhicules (/annulation-vehicule)
// et les commandes outillage (/annulation-commande). `apiBase` distingue les deux.
export default function CancelReservation({ apiBase, itemLabel }) {
  const { id, token } = useParams();
  const [state, setState] = useState('loading'); // loading | ready | cancelling | done | error
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    axios.get(`${apiBase}/cancel/${id}/${token}`)
      .then(({ data }) => {
        if (data.already_cancelled) { setResult({ refunded: data.refunded }); setState('done'); return; }
        setInfo(data);
        setState('ready');
      })
      .catch(() => { setError("Ce lien d'annulation n'est plus valide."); setState('error'); });
  }, [id, token]);

  const confirmCancel = async () => {
    setState('cancelling');
    try {
      const { data } = await axios.post(`${apiBase}/cancel/${id}/${token}`);
      setResult(data);
      setState('done');
    } catch (err) {
      setError(err.response?.data?.error || "L'annulation a échoué.");
      setState('error');
    }
  };

  if (state === 'loading') return (
    <div style={{ textAlign: 'center', padding: '120px 20px' }}>
      <Loader size={48} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite', marginBottom: 20 }}/>
      <p style={{ color: 'var(--gray-500)' }}>Chargement...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (state === 'error') return (
    <div style={{ textAlign: 'center', padding: '100px 20px', maxWidth: 500, margin: '0 auto' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
        <XCircle size={40} color="var(--danger)"/>
      </div>
      <h2 style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 24, marginBottom: 12 }}>Erreur</h2>
      <p style={{ color: 'var(--gray-600)', marginBottom: 32 }}>{error}</p>
      <Link to="/contact" className="btn btn-primary">Nous contacter</Link>
    </div>
  );

  if (state === 'done') return (
    <div style={{ textAlign: 'center', padding: '100px 20px', maxWidth: 520, margin: '0 auto' }}>
      <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
        <CheckCircle size={46} color="#059669"/>
      </div>
      <h2 style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 26, marginBottom: 12 }}>{itemLabel} annulée</h2>
      <p style={{ color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: 24 }}>
        {result?.refunded
          ? "Votre acompte vous a été remboursé — comptez quelques jours pour qu'il apparaisse sur votre compte."
          : "Comme l'annulation intervient à moins de 2 jours du début, l'acompte reste acquis, conformément à notre politique d'annulation."}
      </p>
      <Link to="/" className="btn btn-primary btn-lg">Retour à l'accueil</Link>
    </div>
  );

  // state === 'ready' ou 'cancelling'
  const refundEligible = info?.refund_eligible;
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px', maxWidth: 520, margin: '0 auto' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
        <AlertTriangle size={38} color="#d97706"/>
      </div>
      <h2 style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 24, marginBottom: 16 }}>Annuler {itemLabel === 'Réservation' ? 'votre réservation' : 'votre commande'} ?</h2>

      <div style={{ background: 'var(--light)', borderRadius: 12, padding: '18px 22px', marginBottom: 24, fontSize: 14, color: 'var(--gray-700)', textAlign: 'left' }}>
        {info?.car_name && <p style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>{info.car_name}</p>}
        {info?.start_date && <p>Du {info.start_date} au {info.end_date}</p>}
        {info?.deposit_amount != null && <p style={{ marginTop: 8 }}>Acompte payé : <strong>{Number(info.deposit_amount).toFixed(2)} €</strong></p>}
      </div>

      <div style={{
        borderRadius: 12, padding: '16px 20px', marginBottom: 28, fontSize: 14, textAlign: 'left',
        background: refundEligible ? '#d1fae5' : '#fee2e2', color: refundEligible ? '#065f46' : '#991b1b',
      }}>
        {refundEligible
          ? `Vous êtes à ${info.days_until_start} jour${info.days_until_start > 1 ? 's' : ''} du début — l'annulation est gratuite, votre acompte sera intégralement remboursé.`
          : `Vous êtes à moins de 2 jours du début — l'annulation entraîne la perte de l'acompte versé, conformément à notre politique d'annulation.`}
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-outline" onClick={() => window.history.back()} disabled={state === 'cancelling'}>Retour</button>
        <button className="btn btn-danger" onClick={confirmCancel} disabled={state === 'cancelling'}>
          {state === 'cancelling' ? 'Annulation...' : `Confirmer l'annulation`}
        </button>
      </div>
    </div>
  );
}
