import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQty, total, clearCart } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div onClick={() => setIsOpen(false)} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1998, backdropFilter: 'blur(3px)'
      }}/>
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0,
        width: 'min(420px, 100vw)',
        background: 'white', zIndex: 1999, display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)', animation: 'slideIn .25s ease'
      }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: 18, color: 'var(--primary)' }}>Mon Panier</h3>
            <p style={{ fontSize: 13, color: 'var(--gray-600)' }}>{items.length} article{items.length !== 1 ? 's' : ''}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {items.length > 0 && (
              <button className="btn btn-sm" onClick={clearCart}
                style={{ background: 'var(--gray-100)', color: 'var(--gray-600)', gap: 4, fontSize: 12 }}>
                <Trash2 size={13}/> Vider
              </button>
            )}
            <button onClick={() => setIsOpen(false)} style={{ padding: 8, borderRadius: 8, background: 'var(--gray-100)' }}>
              <X size={20}/>
            </button>
          </div>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>
              <ShoppingBag size={48} style={{ marginBottom: 16, opacity: 0.4 }}/>
              <p style={{ fontWeight: 600 }}>Votre panier est vide</p>
              <p style={{ fontSize: 13, marginTop: 6 }}>Parcourez notre catalogue pour ajouter des articles</p>
              <Link to="/catalogue" className="btn btn-primary btn-sm" style={{ marginTop: 20 }} onClick={() => setIsOpen(false)}>
                Voir le catalogue
              </Link>
            </div>
          ) : items.map(item => (
            <div key={item.key} style={{ display: 'flex', gap: 12, marginBottom: 16, padding: 12, borderRadius: 12, border: '1px solid var(--gray-200)' }}>
              <img src={item.image} alt={item.name} style={{ width: 70, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--primary)', lineHeight: 1.3, marginBottom: 4 }}>{item.name}</p>
                <span style={{
                  fontSize: 11, padding: '2px 7px', borderRadius: 4, fontWeight: 600,
                  background: item.type === 'sale' ? '#d1fae5' : '#fef3c7',
                  color: item.type === 'sale' ? '#065f46' : '#92400e'
                }}>
                  {item.type === 'sale' ? '🛒 Achat' : '📅 Location'}
                </span>
                {item.rentDates && (
                  <p style={{ fontSize: 11, color: 'var(--gray-600)', marginTop: 3 }}>
                    {new Date(item.rentDates.startDate).toLocaleDateString('fr-FR')} → {new Date(item.rentDates.endDate).toLocaleDateString('fr-FR')}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--gray-100)', borderRadius: 8, padding: '2px 4px' }}>
                    <button onClick={() => updateQty(item.key, item.quantity - 1)} style={{ padding: 4, borderRadius: 6, background: 'white', lineHeight: 0 }}>
                      <Minus size={12}/>
                    </button>
                    <span style={{ fontWeight: 700, fontSize: 13, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.key, item.quantity + 1)} style={{ padding: 4, borderRadius: 6, background: 'white', lineHeight: 0 }}>
                      <Plus size={12}/>
                    </button>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 15 }}>{(item.price * item.quantity).toFixed(2)} €</p>
                    <p style={{ fontSize: 11, color: 'var(--gray-400)' }}>{item.price.toFixed(2)} € / unité</p>
                  </div>
                </div>
              </div>
              <button onClick={() => removeItem(item.key)} style={{ padding: 4, color: 'var(--gray-400)', alignSelf: 'flex-start', lineHeight: 0 }}>
                <X size={16}/>
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid var(--gray-200)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontWeight: 600, color: 'var(--gray-600)' }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: 22, color: 'var(--primary)' }}>{total.toFixed(2)} €</span>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setIsOpen(false)}>
              Passer la commande →
            </Link>
            <button className="btn" style={{ width: '100%', justifyContent: 'center', marginTop: 10, background: 'var(--gray-100)', color: 'var(--gray-800)' }} onClick={() => setIsOpen(false)}>
              Continuer mes achats
            </button>
          </div>
        )}
      </div>
    </>
  );
}
