import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Save, Package, ShoppingBag, Calendar, BarChart3, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('admin@mecatoolsloc.re');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await axios.post('/api/auth/login', { email, password: pass });
      login(r.data.user, r.data.token);
      onLogin();
      toast.success('Connexion réussie !');
    } catch {
      toast.error('Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '0 20px' }}>
      <div className="card" style={{ padding: 36, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(245,197,24,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <LogIn size={28} color="var(--accent-dark)"/>
        </div>
        <h2 style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: 6 }}>Administration</h2>
        <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 28 }}>Connexion espace admin</p>
        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">Email</label>
            <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)}/>
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">Mot de passe</label>
            <input className="form-control" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="admin123"/>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
          <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 16 }}>Démo: admin@mecatoolsloc.re / admin123</p>
        </form>
      </div>
    </div>
  );
}

function ProductForm({ product, categories, token, onSave, onClose }) {
  const [form, setForm] = useState(product || {
    name: '', description: '', category_id: '', price_sale: '', price_day: '', price_week: '',
    stock: 0, available_for_sale: true, available_for_rent: true, image: ''
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name) { toast.error('Le nom est requis'); return; }
    setSaving(true);
    try {
      if (product?.id) {
        await axios.put(`/api/products/${product.id}`, form, API(token));
        toast.success('Produit modifié !');
      } else {
        await axios.post('/api/products', form, API(token));
        toast.success('Produit ajouté !');
      }
      onSave();
    } catch { toast.error('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'auto', padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontWeight: 800, color: 'var(--primary)' }}>{product ? 'Modifier' : 'Ajouter'} un produit</h3>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 8, background: 'var(--gray-100)' }}><X size={18}/></button>
        </div>
        <div className="grid-2">
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Nom du produit *</label>
            <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Clé à chocs 1/2"/>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Description</label>
            <textarea className="form-control" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Description détaillée..."/>
          </div>
          <div className="form-group">
            <label className="form-label">Catégorie</label>
            <select className="form-control" value={form.category_id} onChange={e => set('category_id', e.target.value)}>
              <option value="">Choisir...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Stock</label>
            <input className="form-control" type="number" value={form.stock} onChange={e => set('stock', parseInt(e.target.value) || 0)} min={0}/>
          </div>
          <div className="form-group">
            <label className="form-label">Prix achat (€)</label>
            <input className="form-control" type="number" step="0.01" value={form.price_sale} onChange={e => set('price_sale', parseFloat(e.target.value) || '')} placeholder="0.00"/>
          </div>
          <div className="form-group">
            <label className="form-label">Prix location/jour (€)</label>
            <input className="form-control" type="number" step="0.01" value={form.price_day} onChange={e => set('price_day', parseFloat(e.target.value) || '')} placeholder="0.00"/>
          </div>
          <div className="form-group">
            <label className="form-label">Prix location/semaine (€)</label>
            <input className="form-control" type="number" step="0.01" value={form.price_week} onChange={e => set('price_week', parseFloat(e.target.value) || '')} placeholder="0.00"/>
          </div>
          <div className="form-group">
            <label className="form-label">URL Image</label>
            <input className="form-control" value={form.image} onChange={e => set('image', e.target.value)} placeholder="/api/placeholder/400/300"/>
          </div>
          <div className="form-group" style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
              <input type="checkbox" checked={!!form.available_for_sale} onChange={e => set('available_for_sale', e.target.checked)} style={{ width: 16, height: 16 }}/> Vente
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
              <input type="checkbox" checked={!!form.available_for_rent} onChange={e => set('available_for_rent', e.target.checked)} style={{ width: 16, height: 16 }}/> Location
            </label>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={16}/> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          <button className="btn btn-outline" onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const { isAdmin, token } = useAuth();
  const [loggedIn, setLoggedIn] = useState(isAdmin);
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setLoggedIn(isAdmin); }, [isAdmin]);

  const loadData = async () => {
    if (!loggedIn || !token) return;
    setLoading(true);
    try {
      const [p, o, r, c] = await Promise.all([
        axios.get('/api/products?limit=100'),
        axios.get('/api/orders', API(token)),
        axios.get('/api/reservations', API(token)),
        axios.get('/api/products/categories'),
      ]);
      setProducts(p.data.products);
      setOrders(o.data);
      setReservations(r.data);
      setCategories(c.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { if (loggedIn) loadData(); }, [loggedIn, token]);

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;
    await axios.delete(`/api/products/${id}`, API(token));
    toast.success('Produit supprimé');
    loadData();
  };

  const updateReservationStatus = async (id, status) => {
    await axios.put(`/api/reservations/${id}/status`, { status }, API(token));
    toast.success('Statut mis à jour');
    loadData();
  };

  if (!loggedIn) return <LoginForm onLogin={() => setLoggedIn(true)}/>;

  const tabs = [
    { id: 'products', label: 'Produits', icon: <Package size={16}/> },
    { id: 'orders', label: 'Commandes', icon: <ShoppingBag size={16}/> },
    { id: 'reservations', label: 'Réservations', icon: <Calendar size={16}/> },
    { id: 'stats', label: 'Tableau de bord', icon: <BarChart3 size={16}/> },
  ];

  const revenue = orders.filter(o => o.status === 'paid').reduce((s, o) => s + o.total_price, 0);

  return (
    <div>
      <div style={{ background: 'var(--primary)', color: 'white', padding: '24px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: 24 }}>Administration MecaToolsLoc</h1>
            <p style={{ opacity: 0.7, fontSize: 13 }}>Gestion du catalogue et des commandes</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {tabs.map(t => (
              <button key={t.id} className={`btn btn-sm ${tab === t.id ? 'btn-primary' : 'btn-outline-light'}`} onClick={() => setTab(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '40px 0' }}>
        <div className="container">

          {/* Stats tab */}
          {tab === 'stats' && (
            <div>
              <div className="grid-4" style={{ marginBottom: 40 }}>
                {[
                  { label: 'Produits', value: products.length, icon: '📦', color: 'var(--primary)' },
                  { label: 'Commandes', value: orders.length, icon: '🛒', color: '#7c3aed' },
                  { label: 'Réservations', value: reservations.length, icon: '📅', color: '#0891b2' },
                  { label: 'CA Total', value: `${revenue.toFixed(0)} €`, icon: '💰', color: 'var(--success)' },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} className="card" style={{ padding: 24 }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
                    <p style={{ fontSize: 28, fontWeight: 900, color }}>{value}</p>
                    <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>{label}</p>
                  </div>
                ))}
              </div>
              <div className="grid-2">
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 16 }}>Produits en rupture</h3>
                  {products.filter(p => p.stock === 0).map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-100)', fontSize: 14 }}>
                      <span>{p.name}</span>
                      <span style={{ color: 'var(--danger)', fontWeight: 700 }}>Rupture</span>
                    </div>
                  ))}
                  {products.filter(p => p.stock === 0).length === 0 && <p style={{ color: 'var(--success)', fontSize: 14 }}>✅ Tous les produits sont en stock</p>}
                </div>
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 16 }}>Réservations en attente</h3>
                  {reservations.filter(r => r.status === 'pending').slice(0, 5).map(r => (
                    <div key={r.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--gray-100)', fontSize: 14 }}>
                      <p style={{ fontWeight: 600 }}>{r.customer_name}</p>
                      <p style={{ color: 'var(--gray-500)', fontSize: 12 }}>{r.product_name} — {r.start_date} → {r.end_date}</p>
                    </div>
                  ))}
                  {reservations.filter(r => r.status === 'pending').length === 0 && <p style={{ color: 'var(--success)', fontSize: 14 }}>✅ Aucune réservation en attente</p>}
                </div>
              </div>
            </div>
          )}

          {/* Products tab */}
          {tab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontWeight: 800, color: 'var(--primary)' }}>Catalogue ({products.length} produits)</h2>
                <button className="btn btn-primary" onClick={() => { setEditProduct(null); setShowForm(true); }}>
                  <Plus size={16}/> Ajouter un produit
                </button>
              </div>
              {loading ? <div className="loading-center"><div className="spinner"/></div> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: 'var(--primary)', color: 'white' }}>
                        {['Produit', 'Catégorie', 'Stock', 'Achat', 'Loc/j', 'Loc/sem', 'Type', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p, i) => (
                        <tr key={p.id} style={{ background: i % 2 ? 'var(--light)' : 'white', transition: 'var(--transition)' }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(245,197,24,.07)'}
                          onMouseOut={e => e.currentTarget.style.background = i % 2 ? 'var(--light)' : 'white'}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <img src={p.image} alt={p.name} style={{ width: 40, height: 32, objectFit: 'cover', borderRadius: 6 }}/>
                              <span style={{ fontWeight: 600, color: 'var(--primary)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--gray-600)' }}>{p.category_icon} {p.category_name}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: p.stock === 0 ? 'var(--danger)' : p.stock < 3 ? 'var(--warning)' : 'var(--success)' }}>{p.stock}</td>
                          <td style={{ padding: '12px 16px' }}>{p.price_sale ? `${p.price_sale} €` : '—'}</td>
                          <td style={{ padding: '12px 16px' }}>{p.price_day ? `${p.price_day} €` : '—'}</td>
                          <td style={{ padding: '12px 16px' }}>{p.price_week ? `${p.price_week} €` : '—'}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: 4 }}>
                              {p.available_for_sale ? <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#d1fae5', color: '#065f46', fontWeight: 700 }}>Vente</span> : null}
                              {p.available_for_rent ? <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#fef3c7', color: '#92400e', fontWeight: 700 }}>Loc.</span> : null}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-sm btn-outline" onClick={() => { setEditProduct(p); setShowForm(true); }}><Edit2 size={13}/></button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}><Trash2 size={13}/></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Orders tab */}
          {tab === 'orders' && (
            <div>
              <h2 style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: 24 }}>Commandes ({orders.length})</h2>
              {orders.length === 0 ? <p style={{ color: 'var(--gray-500)' }}>Aucune commande pour le moment</p> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: 'var(--primary)', color: 'white' }}>
                        {['#', 'Client', 'Email', 'Total', 'Type', 'Statut', 'Date'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o, i) => (
                        <tr key={o.id} style={{ background: i % 2 ? 'var(--light)' : 'white' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 700 }}>#{o.id}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 600 }}>{o.customer_name}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--gray-500)' }}>{o.customer_email}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--primary)' }}>{o.total_price.toFixed(2)} €</td>
                          <td style={{ padding: '12px 16px' }}>{o.type}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: o.status === 'paid' ? '#d1fae5' : '#fef3c7', color: o.status === 'paid' ? '#065f46' : '#92400e' }}>
                              {o.status === 'paid' ? '✅ Payé' : '⏳ ' + o.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--gray-500)', fontSize: 12 }}>{new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Reservations tab */}
          {tab === 'reservations' && (
            <div>
              <h2 style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: 24 }}>Réservations ({reservations.length})</h2>
              {reservations.length === 0 ? <p style={{ color: 'var(--gray-500)' }}>Aucune réservation pour le moment</p> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: 'var(--primary)', color: 'white' }}>
                        {['#', 'Produit', 'Client', 'Dates', 'Total', 'Statut', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map((r, i) => (
                        <tr key={r.id} style={{ background: i % 2 ? 'var(--light)' : 'white' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 700 }}>#{r.id}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 600, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.product_name}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <p style={{ fontWeight: 600 }}>{r.customer_name}</p>
                            <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>{r.customer_email}</p>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--gray-600)' }}>
                            {r.start_date} → {r.end_date}
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--primary)' }}>{r.total_price?.toFixed(2)} €</td>
                          <td style={{ padding: '12px 16px' }}>
                            <select style={{ padding: '4px 8px', borderRadius: 6, border: '1.5px solid var(--gray-200)', fontSize: 12, fontWeight: 700 }}
                              value={r.status} onChange={e => updateReservationStatus(r.id, e.target.value)}>
                              <option value="pending">⏳ En attente</option>
                              <option value="confirmed">✅ Confirmée</option>
                              <option value="cancelled">❌ Annulée</option>
                              <option value="completed">🏁 Terminée</option>
                            </select>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>{new Date(r.created_at).toLocaleDateString('fr-FR')}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <ProductForm
          product={editProduct}
          categories={categories}
          token={token}
          onSave={() => { loadData(); setShowForm(false); }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
