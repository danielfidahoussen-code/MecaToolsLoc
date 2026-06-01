import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, CreditCard, Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', cardNumber: '', cardExpiry: '', cardCVC: '' });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validateStep1 = () => {
    if (!form.name || !form.email || !form.phone) { toast.error('Remplissez tous les champs obligatoires'); return; }
    setStep(2);
  };

  const handlePay = async () => {
    if (!form.cardNumber || !form.cardExpiry || !form.cardCVC) { toast.error('Remplissez les informations de carte'); return; }
    setPaying(true);
    try {
      await axios.post('/api/orders', {
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        customer_address: `${form.address}, ${form.city}`,
        items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price, type: i.type, rentDates: i.rentDates || null })),
        total_price: total,
        type: 'mixed',
      });
      clearCart();
      setSuccess(true);
    } catch (e) {
      toast.error('Erreur lors du paiement. Réessayez.');
    } finally {
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
      <p style={{ color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: 8 }}>
        Merci {form.name} ! Votre commande a été enregistrée.
      </p>
      <p style={{ color: 'var(--gray-600)', fontSize: 14, marginBottom: 32 }}>
        Un email de confirmation a été envoyé à <strong>{form.email}</strong>
      </p>
      <Link to="/" className="btn btn-primary btn-lg">Retour à l'accueil</Link>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Finaliser ma commande</h1>
        </div>
      </div>
      <div className="page" style={{ paddingTop: 40 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'start' }}>

            {/* Left: Form */}
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
                  <div className="form-group">
                    <label className="form-label">Adresse</label>
                    <input className="form-control" value={form.address} onChange={e => set('address', e.target.value)} placeholder="34 Rue Exemple"/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ville</label>
                    <input className="form-control" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Saint-Denis"/>
                  </div>
                  <button className="btn btn-primary btn-lg" onClick={validateStep1} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                    Continuer vers le paiement →
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="card" style={{ padding: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 style={{ fontWeight: 800, color: 'var(--primary)' }}>Paiement sécurisé</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--success)' }}>
                      <Lock size={14}/> SSL sécurisé
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                    {['VISA', 'MC', 'CB'].map(c => (
                      <div key={c} style={{ padding: '6px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 8, fontSize: 12, fontWeight: 800, color: 'var(--gray-600)' }}>{c}</div>
                    ))}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Numéro de carte</label>
                    <input className="form-control" value={form.cardNumber}
                      onChange={e => set('cardNumber', e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19))}
                      placeholder="1234 5678 9012 3456" maxLength={19}/>
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Date d'expiration</label>
                      <input className="form-control" value={form.cardExpiry}
                        onChange={e => { let v = e.target.value.replace(/\D/g, ''); if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2); set('cardExpiry', v.slice(0, 5)); }}
                        placeholder="MM/AA" maxLength={5}/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVC</label>
                      <input className="form-control" value={form.cardCVC} onChange={e => set('cardCVC', e.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="123" maxLength={3}/>
                    </div>
                  </div>

                  <div style={{ background: 'var(--light)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--gray-600)', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Lock size={14}/> Vos données sont chiffrées et sécurisées. Nous ne stockons pas vos informations bancaires.
                  </div>

                  <button className="btn btn-primary btn-lg" onClick={handlePay} disabled={paying} style={{ width: '100%', justifyContent: 'center' }}>
                    <CreditCard size={18}/> {paying ? 'Traitement...' : `Payer ${total.toFixed(2)} €`}
                  </button>
                  <button className="btn" style={{ width: '100%', justifyContent: 'center', marginTop: 10, background: 'var(--gray-100)', color: 'var(--gray-700)' }} onClick={() => setStep(1)}>
                    <ArrowLeft size={14}/> Retour
                  </button>
                </div>
              )}
            </div>

            {/* Right: Order summary */}
            <div className="card" style={{ padding: 24, position: 'sticky', top: 100 }}>
              <h3 style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: 20 }}>Récapitulatif</h3>
              {items.map(item => (
                <div key={item.key} style={{ display: 'flex', gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--gray-100)' }}>
                  <img src={item.image} alt={item.name} style={{ width: 56, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--primary)', lineHeight: 1.3 }}>{item.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                      {item.type === 'sale' ? '🛒 Achat' : '📅 Location'} × {item.quantity}
                    </p>
                    {item.rentDates && <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>{new Date(item.rentDates.startDate).toLocaleDateString('fr-FR')} → {new Date(item.rentDates.endDate).toLocaleDateString('fr-FR')}</p>}
                  </div>
                  <p style={{ fontWeight: 800, fontSize: 14, color: 'var(--primary)', whiteSpace: 'nowrap' }}>{(item.price * item.quantity).toFixed(2)} €</p>
                </div>
              ))}
              <div style={{ paddingTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: 'var(--gray-600)' }}>Sous-total</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: 'var(--gray-600)' }}>Livraison</span>
                  <span style={{ color: 'var(--success)' }}>Gratuite</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18, color: 'var(--primary)', borderTop: '2px solid var(--gray-200)', paddingTop: 12, marginTop: 8 }}>
                  <span>Total TTC</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .container > div[style*="grid-template-columns: 1fr 380px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
