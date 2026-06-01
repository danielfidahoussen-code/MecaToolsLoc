import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

function FaqItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1.5px solid var(--gray-200)', borderRadius: 12, overflow: 'hidden', marginBottom: 12, transition: 'var(--transition)' }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 22px', background: open ? 'var(--primary)' : 'white', transition: 'var(--transition)',
        color: open ? 'white' : 'var(--primary)'
      }}>
        <span style={{ fontWeight: 700, fontSize: 15, textAlign: 'left', lineHeight: 1.4 }}>{faq.question}</span>
        <span style={{ flexShrink: 0, marginLeft: 16 }}>
          {open ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
        </span>
      </button>
      {open && (
        <div style={{ padding: '18px 22px', background: 'var(--light)', borderTop: '1px solid var(--gray-200)' }}>
          <p style={{ color: 'var(--gray-700)', lineHeight: 1.8, fontSize: 15 }}>{faq.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    axios.get('/api/faqs').then(r => { setFaqs(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const categories = ['all', ...new Set(faqs.map(f => f.category))];
  const catLabels = { all: '📋 Toutes', reservation: '📅 Réservation', paiement: '💳 Paiement', livraison: '🚚 Livraison', contact: '📞 Contact', general: '❓ Général' };
  const filtered = activeCategory === 'all' ? faqs : faqs.filter(f => f.category === activeCategory);

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Questions fréquentes</h1>
          <p>Trouvez rapidement une réponse à vos questions</p>
        </div>
      </div>

      <div className="page">
        <div className="container" style={{ maxWidth: 860 }}>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
            {categories.map(c => (
              <button key={c} className={`btn btn-sm ${activeCategory === c ? 'btn-dark' : 'btn-outline'}`}
                onClick={() => setActiveCategory(c)}>
                {catLabels[c] || c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner"/></div>
          ) : (
            <div>
              {filtered.map(faq => <FaqItem key={faq.id} faq={faq}/>)}
            </div>
          )}

          {/* Still have questions? */}
          <div style={{ background: 'var(--primary)', borderRadius: 20, padding: '40px', textAlign: 'center', marginTop: 60 }}>
            <h3 style={{ color: 'white', fontWeight: 800, fontSize: 22, marginBottom: 12 }}>
              Vous n'avez pas trouvé votre réponse ?
            </h3>
            <p style={{ color: 'rgba(255,255,255,.75)', marginBottom: 24 }}>
              Notre équipe est disponible pour répondre à toutes vos questions
            </p>
            <Link to="/contact" className="btn btn-primary btn-lg">
              Contactez-nous
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
