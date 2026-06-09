import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);

  const handleBuy = (e) => {
    e.preventDefault();
    addItem(product, 'sale', 1);
    toast.success(`${product.name} ajouté au panier !`);
  };

  const stockColor = product.stock > 5 ? 'var(--success)' : product.stock > 0 ? 'var(--warning)' : 'var(--danger)';
  const stockLabel = product.stock > 5 ? 'En stock' : product.stock > 0 ? `${product.stock} restant${product.stock > 1 ? 's' : ''}` : 'Rupture';

  return (
    <Link to={`/produit/${product.id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ transition: 'var(--transition)', cursor: 'pointer' }}
        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
        onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>

        {/* Image */}
        <div style={{ position: 'relative', overflow: 'hidden', height: 200, background: 'var(--gray-100)' }}>
          {product.image && !imgError ? (
            <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s ease' }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.06)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              onError={() => setImgError(true)}/>
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--gray-400)', fontSize: 13, fontWeight: 600 }}>Photo à venir</p>
            </div>
          )}
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 5 }}>
            {product.available_for_rent && <span className="badge badge-rent">Location</span>}
            {product.available_for_sale && <span className="badge badge-sale">Achat</span>}
          </div>
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <span style={{ background: 'white', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: stockColor, boxShadow: 'var(--shadow-sm)' }}>
              ● {stockLabel}
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '16px 18px' }}>
          <p style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5 }}>
            {product.category_name}
          </p>
          <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--primary)', marginBottom: 10, lineHeight: 1.3 }}>
            {product.name}
          </h3>

          {/* Prices */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            {product.available_for_sale && product.price_sale && (
              <div style={{ background: 'rgba(16,185,129,.08)', padding: '5px 10px', borderRadius: 8 }}>
                <p style={{ fontSize: 10, color: 'var(--gray-600)', fontWeight: 600 }}>ACHAT</p>
                <p style={{ fontWeight: 800, fontSize: 17, color: 'var(--primary)' }}>{product.price_sale.toFixed(2)} €</p>
              </div>
            )}
            {product.available_for_rent && product.price_day && (
              <div style={{ background: 'rgba(245,197,24,.1)', padding: '5px 10px', borderRadius: 8 }}>
                <p style={{ fontSize: 10, color: 'var(--gray-600)', fontWeight: 600 }}>LOCATION</p>
                <p style={{ fontWeight: 800, fontSize: 17, color: 'var(--primary)' }}>{product.price_day.toFixed(2)} €<span style={{ fontSize: 11, fontWeight: 500 }}>/j</span></p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Link to={`/produit/${product.id}`} className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
              <Eye size={14}/> Détails
            </Link>
            {product.available_for_sale && product.stock > 0 && (
              <button className="btn btn-primary btn-sm" onClick={handleBuy} style={{ flex: 1, justifyContent: 'center' }}>
                <ShoppingCart size={14}/> Acheter
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
