import { useState } from 'react';
import axios from 'axios';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error('Veuillez remplir tous les champs obligatoires'); return; }
    setSending(true);
    try {
      await axios.post('/api/contact', form);
      setSent(true);
      toast.success('Message envoyé ! Nous vous répondrons sous 24h.');
    } catch (err) {
      toast.error('Erreur lors de l\'envoi — réessayez ou appelez-nous.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Contactez-nous</h1>
          <p>Nous sommes là pour vous aider — réponse sous 24h</p>
        </div>
      </div>

      <div className="page">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 60, alignItems: 'start' }}>

            {/* Left: Contact info */}
            <div>
              <h2 style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 26, marginBottom: 16 }}>
                On vous répond vite !
              </h2>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: 36 }}>
                Vous avez une question sur notre catalogue, une demande de devis, ou besoin d'un conseil technique ?
                N'hésitez pas à nous contacter par le moyen qui vous convient.
              </p>

              {[
                { icon: <Phone size={22}/>, title: 'Téléphone', val: '06 93 83 96 54', sub: 'Du lundi au samedi, 8h–18h', href: 'tel:0693839654' },
                { icon: <Mail size={22}/>, title: 'Email', val: 'contact@lvtools.re', sub: 'Réponse sous 24h', href: 'mailto:contact@lvtools.re' },
                { icon: <MapPin size={22}/>, title: 'Localisation', val: 'La Réunion', sub: 'Livraison sur toute l\'île', href: null },
                { icon: <Clock size={22}/>, title: 'Horaires', val: 'Lun – Sam : 8h à 18h', sub: 'Dimanche : sur rendez-vous', href: null },
              ].map(({ icon, title, val, sub, href }) => (
                <div key={title} style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(245,197,24,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-dark)', flexShrink: 0 }}>
                    {icon}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 2 }}>{title}</p>
                    {href ? (
                      <a href={href} style={{ fontWeight: 600, fontSize: 15, color: 'var(--primary)' }}>{val}</a>
                    ) : (
                      <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--primary)' }}>{val}</p>
                    )}
                    <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>{sub}</p>
                  </div>
                </div>
              ))}

              <div style={{ background: 'var(--primary)', borderRadius: 16, padding: '24px', marginTop: 20 }}>
                <p style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: 6 }}>Besoin urgent ?</p>
                <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 14, lineHeight: 1.7 }}>
                  Pour toute demande urgente, appelez-nous directement au <strong style={{ color: 'white' }}>06 93 83 96 54</strong>.
                  Nous ferons notre maximum pour vous aider immédiatement.
                </p>
              </div>
            </div>

            {/* Right: Form */}
            <div className="card" style={{ padding: 36 }}>
              {sent ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <CheckCircle size={36} color="var(--success)"/>
                  </div>
                  <h3 style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 22, marginBottom: 12 }}>Message envoyé !</h3>
                  <p style={{ color: 'var(--gray-600)' }}>Merci {form.name}, nous vous répondrons sous 24h à {form.email}.</p>
                  <button className="btn btn-outline" style={{ marginTop: 24 }} onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}>
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 20, marginBottom: 24 }}>Envoyez-nous un message</h3>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Nom complet *</label>
                      <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jean Dupont"/>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Téléphone</label>
                      <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="06 xx xx xx xx"/>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input className="form-control" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="vous@exemple.fr"/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sujet</label>
                    <select className="form-control" value={form.subject} onChange={e => set('subject', e.target.value)}>
                      <option value="">Sélectionnez un sujet</option>
                      <option>Demande de location</option>
                      <option>Demande d'achat</option>
                      <option>Devis personnalisé</option>
                      <option>Question technique</option>
                      <option>Autre</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message *</label>
                    <textarea className="form-control" value={form.message} onChange={e => set('message', e.target.value)} placeholder="Décrivez votre besoin..."/>
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={sending} style={{ width: '100%', justifyContent: 'center' }}>
                    <Send size={16}/> {sending ? 'Envoi en cours...' : 'Envoyer le message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .container > div[style*="grid-template-columns: 1fr 1.3fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
