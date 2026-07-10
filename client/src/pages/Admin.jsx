import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Save, Package, ShoppingBag, Calendar, BarChart3, LogIn, Car, FileText, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

function useIsMobile(bp = 1024) {
  const [mobile, setMobile] = useState(() => window.innerWidth < bp);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return mobile;
}

/* ─── LOGIN ─────────────────────────────────────────────────────────────── */
function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('admin@lvtools.re');
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
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: '0 16px' }}>
      <div className="card" style={{ padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,51,51,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <LogIn size={26} color="var(--primary)"/>
        </div>
        <h2 style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: 4 }}>Administration</h2>
        <p style={{ color: 'var(--gray-500)', fontSize: 13, marginBottom: 24 }}>Connexion espace admin</p>
        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">Email</label>
            <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)}/>
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">Mot de passe</label>
            <input className="form-control" type="password" value={pass} onChange={e => setPass(e.target.value)}/>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── PRODUCT FORM MODAL ─────────────────────────────────────────────────── */
function ProductForm({ product, categories, token, onSave, onClose }) {
  const [form, setForm] = useState(product || {
    name: '', description: '', category_id: '', price_sale: '', price_day: '', price_week: '', caution: '',
    stock: 0, available_for_sale: true, available_for_rent: true, image: '', images: [], has_qr_notice: false
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isMobile = useIsMobile();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await axios.post('/api/upload', fd);
      // Première image = image principale, les suivantes dans images[]
      if (!form.image) {
        set('image', data.url);
      } else {
        setForm(f => ({ ...f, images: [...(f.images || []), data.url] }));
      }
      toast.success('Image importée !');
    } catch { toast.error("Erreur lors de l'import"); }
    finally { setUploading(false); }
  };

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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 2000, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : 16 }}>
      <div className="card" style={{ width: '100%', maxWidth: 680, maxHeight: isMobile ? '92vh' : '90vh', overflow: 'auto', padding: isMobile ? '20px 16px' : 28, borderRadius: isMobile ? '16px 16px 0 0' : 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 800, color: 'var(--primary)', fontSize: isMobile ? 17 : 20 }}>{product ? 'Modifier' : 'Ajouter'} un produit</h3>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 8, background: 'var(--gray-100)', flexShrink: 0 }}><X size={18}/></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Nom du produit *</label>
            <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Clé à chocs 1/2"/>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Description</label>
            <textarea className="form-control" value={form.description} onChange={e => set('description', e.target.value)} rows={3}/>
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
          <div className="form-group" style={{ gridColumn: isMobile ? '1' : undefined }}>
            <label className="form-label">Prix location/semaine (€)</label>
            <input className="form-control" type="number" step="0.01" value={form.price_week} onChange={e => set('price_week', parseFloat(e.target.value) || '')} placeholder="0.00"/>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">🔒 Caution location (€) <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--gray-500)' }}>— collectée à la remise, non débitée en ligne</span></label>
            <input className="form-control" type="number" step="0.01" value={form.caution} onChange={e => set('caution', parseFloat(e.target.value) || '')} placeholder="Ex: 150.00 (laisser vide si pas de caution)"/>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Images (max 3) <span style={{ fontWeight: 400, color: 'var(--gray-500)', fontSize: 12 }}>— 1ère = principale</span></label>
            {/* Aperçu galerie */}
            {(form.image || (form.images || []).length > 0) && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                {form.image && (
                  <div style={{ position: 'relative' }}>
                    <img src={form.image} alt="principale" style={{ width: 90, height: 70, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--accent)' }}/>
                    <button onClick={() => set('image', (form.images || [])[0] ? form.images[0] : '')} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--danger)', color: 'white', fontSize: 11, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>
                )}
                {(form.images || []).map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={url} alt={`img ${i+1}`} style={{ width: 90, height: 70, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--gray-200)' }}/>
                    <button onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--danger)', color: 'white', fontSize: 11, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>
                ))}
              </div>
            )}
            <label style={{ display: 'block', cursor: uploading ? 'wait' : 'pointer', marginBottom: 8 }}>
              <div className="btn btn-outline btn-sm" style={{ justifyContent: 'center', pointerEvents: 'none' }}>
                {uploading ? 'Import en cours...' : `Importer une image${[form.image, ...(form.images||[])].filter(Boolean).length > 0 ? ' supplémentaire' : ''}`}
              </div>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={uploading || [form.image, ...(form.images||[])].filter(Boolean).length >= 3}/>
            </label>
            <input className="form-control" value={form.image} onChange={e => set('image', e.target.value)} placeholder="Ou coller l'URL de l'image principale..."/>
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                <input type="checkbox" checked={!!form.available_for_sale} onChange={e => set('available_for_sale', e.target.checked)} style={{ width: 16, height: 16 }}/> Vente
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                <input type="checkbox" checked={!!form.available_for_rent} onChange={e => set('available_for_rent', e.target.checked)} style={{ width: 16, height: 16 }}/> Location
              </label>
            </div>
            <div onClick={() => set('has_qr_notice', !form.has_qr_notice)} style={{
              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
              padding: '10px 12px', borderRadius: 10, border: '1.5px solid',
              borderColor: form.has_qr_notice ? 'var(--accent)' : 'var(--gray-200)',
              background: form.has_qr_notice ? 'rgba(255,51,51,.06)' : 'var(--gray-100)',
            }}>
              <input type="checkbox" checked={!!form.has_qr_notice} onChange={e => { e.stopPropagation(); set('has_qr_notice', e.target.checked); }} style={{ width: 16, height: 16, accentColor: 'var(--accent)', flexShrink: 0 }}/>
              <span style={{ fontSize: 18 }}>🎬</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)' }}>Vidéo notice disponible</p>
                <p style={{ fontSize: 11, color: 'var(--gray-600)', marginTop: 1 }}>Badge "🎬 Vidéo notice offerte" dans le récapitulatif</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
            <Save size={16}/> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          <button className="btn btn-outline" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Annuler</button>
        </div>
      </div>
    </div>
  );
}

/* ─── PRODUCT CARD (mobile) ──────────────────────────────────────────────── */
function ProductCard({ p, onEdit, onDelete }) {
  return (
    <div className="card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <img src={p.image} alt={p.name} style={{ width: 56, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 14, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
        <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 6 }}>{p.category_icon} {p.category_name}</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12, marginBottom: 6 }}>
          {p.price_sale ? <span style={{ background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 4 }}>Achat : <b>{p.price_sale} €</b></span> : null}
          {p.price_day  ? <span style={{ background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 4 }}>Loc/j : <b>{p.price_day} €</b></span> : null}
          {p.caution    ? <span style={{ background: 'rgba(59,130,246,.1)', padding: '2px 8px', borderRadius: 4, color: '#1e40af' }}>🔒 <b>{p.caution} €</b></span> : null}
          <span style={{ padding: '2px 8px', borderRadius: 4, fontWeight: 700, background: p.stock === 0 ? '#fee2e2' : p.stock < 3 ? '#fef3c7' : '#d1fae5', color: p.stock === 0 ? '#991b1b' : p.stock < 3 ? '#92400e' : '#065f46' }}>
            Stock : {p.stock}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-sm btn-outline" onClick={() => onEdit(p)} style={{ flex: 1, justifyContent: 'center' }}><Edit2 size={13}/> Modifier</button>
          <button className="btn btn-sm btn-danger" onClick={() => onDelete(p.id)} style={{ flex: 1, justifyContent: 'center' }}><Trash2 size={13}/> Supprimer</button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN ADMIN ─────────────────────────────────────────────────────────── */
export default function Admin() {
  const { isAdmin, token } = useAuth();
  const [loggedIn, setLoggedIn] = useState(isAdmin);
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [carReservations, setCarReservations] = useState([]);
  const [carsDb, setCarsDb] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showCarForm, setShowCarForm] = useState(false);
  const [editCar, setEditCar] = useState(null);
  const [carSubTab, setCarSubTab] = useState('reservations');
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => { setLoggedIn(isAdmin); }, [isAdmin]);

  const loadData = async () => {
    if (!loggedIn || !token) return;
    setLoading(true);
    try {
      const [p, o, r, c, cr, cars] = await Promise.all([
        axios.get('/api/products?limit=100'),
        axios.get('/api/orders', API(token)),
        axios.get('/api/reservations', API(token)),
        axios.get('/api/products/categories'),
        axios.get('/api/car-reservations', API(token)),
        axios.get('/api/cars/all', API(token)),
      ]);
      setProducts(p.data.products);
      setOrders(o.data);
      setReservations(r.data);
      setCategories(c.data);
      setCarReservations(cr.data);
      setCarsDb(cars.data);
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

  const updateCarReservationStatus = async (id, status) => {
    await axios.put(`/api/car-reservations/${id}`, { status }, API(token));
    loadData();
  };

  const handleDeleteCar = async (id) => {
    if (!confirm('Supprimer ce véhicule ?')) return;
    await axios.delete(`/api/cars/${id}`, API(token));
    toast.success('Véhicule supprimé');
    loadData();
  };

  const deleteOrder = async (id) => {
    if (!confirm('Supprimer cette commande ?')) return;
    await axios.delete(`/api/orders/${id}`, API(token));
    toast.success('Commande supprimée');
    loadData();
  };
  const clearOrders = async () => {
    if (!confirm('Supprimer TOUTES les commandes ? Cette action est irréversible.')) return;
    await axios.delete('/api/orders/all', API(token));
    toast.success('Historique des commandes vidé');
    loadData();
  };

  const deleteReservation = async (id) => {
    if (!confirm('Supprimer cette réservation ?')) return;
    await axios.delete(`/api/reservations/${id}`, API(token));
    toast.success('Réservation supprimée');
    loadData();
  };
  const clearReservations = async () => {
    if (!confirm('Supprimer TOUTES les réservations ? Cette action est irréversible.')) return;
    await axios.delete('/api/reservations/all', API(token));
    toast.success('Historique des réservations vidé');
    loadData();
  };

  const deleteCarReservation = async (id) => {
    if (!confirm('Supprimer cette réservation ?')) return;
    await axios.delete(`/api/car-reservations/${id}`, API(token));
    toast.success('Réservation supprimée');
    loadData();
  };
  const clearCarReservations = async () => {
    if (!confirm('Supprimer TOUTES les réservations de véhicules ? Cette action est irréversible.')) return;
    await axios.delete('/api/car-reservations/all', API(token));
    toast.success('Historique des réservations vidé');
    loadData();
  };

  const tabs = [
    { id: 'products',        label: 'Produits',        icon: <Package size={15}/> },
    { id: 'orders',          label: 'Commandes',        icon: <ShoppingBag size={15}/> },
    { id: 'reservations',    label: 'Réservations',     icon: <Calendar size={15}/> },
    { id: 'car_reservations',label: 'Location voitures',icon: <Calendar size={15}/> },
    { id: 'stats',           label: 'Tableau de bord',  icon: <BarChart3 size={15}/> },
  ];

  const revenue = orders.filter(o => o.status === 'paid').reduce((s, o) => s + o.total_price, 0);

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ background: 'var(--primary)', color: 'white', padding: isMobile ? '16px 0 0' : '20px 0 0' }}>
        <div className="container">
          <div style={{ marginBottom: 14 }}>
            <h1 style={{ fontWeight: 800, fontSize: isMobile ? 20 : 24 }}>Administration LVTools</h1>
            <p style={{ opacity: 0.7, fontSize: 12, marginTop: 2 }}>Gestion du catalogue et des commandes</p>
          </div>
          {/* Tabs — toujours avec labels, scrollable sur mobile */}
          <div style={{ display: 'flex', gap: 4, overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: isMobile ? '9px 12px' : '10px 18px',
                fontSize: isMobile ? 11 : 13,
                fontWeight: 700, border: 'none', cursor: 'pointer',
                whiteSpace: 'nowrap', flexShrink: 0,
                borderRadius: '8px 8px 0 0',
                background: tab === t.id ? 'white' : 'rgba(255,255,255,0.1)',
                color: tab === t.id ? 'var(--primary)' : 'rgba(255,255,255,0.8)',
              }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: isMobile ? '20px 0' : '32px 0' }}>
        <div className="container">

          {/* ── Stats ── */}
          {tab === 'stats' && (
            <div>
              {/* Sauvegarde des données */}
              <div className="card" style={{ padding: 18, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', background: 'var(--light)' }}>
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 14 }}>Sauvegarde des données</p>
                  <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>Téléchargez et conservez régulièrement une copie de toutes vos commandes, réservations et contrats.</p>
                </div>
                <a className="btn btn-primary btn-sm"
                  href={`/api/admin/backup?stamp=${new Date().toISOString().slice(0,10)}&token=${token}`}
                  style={{ whiteSpace: 'nowrap' }}>
                  <Download size={14}/> Télécharger une sauvegarde
                </a>
              </div>

              {/* Chiffres clés */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(5,1fr)', gap: 14, marginBottom: 28 }}>
                {[
                  { label: 'Produits',          value: products.length,                color: 'var(--primary)' },
                  { label: 'Commandes',          value: orders.length,                  color: '#7c3aed' },
                  { label: 'Résa. outils',       value: reservations.length,            color: '#0891b2' },
                  { label: 'Résa. voitures',     value: carReservations.length,         color: '#d97706' },
                  { label: 'CA Total',           value: `${revenue.toFixed(0)} €`,      color: 'var(--success)' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="card" style={{ padding: isMobile ? 16 : 22, textAlign: 'center' }}>
                    <p style={{ fontSize: isMobile ? 22 : 28, fontWeight: 900, color }}>{value}</p>
                    <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>{label}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {/* Ruptures de stock */}
                <div className="card" style={{ padding: isMobile ? 16 : 22 }}>
                  <h3 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 14, fontSize: 15 }}>Produits en rupture</h3>
                  {products.filter(p => p.stock === 0).map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-100)', fontSize: 13 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>{p.name}</span>
                      <span style={{ color: 'var(--danger)', fontWeight: 700, flexShrink: 0 }}>Rupture</span>
                    </div>
                  ))}
                  {products.filter(p => p.stock === 0).length === 0 && <p style={{ color: 'var(--success)', fontSize: 13 }}>Tous les produits sont en stock</p>}
                </div>

                {/* Réservations outils en attente */}
                <div className="card" style={{ padding: isMobile ? 16 : 22 }}>
                  <h3 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 14, fontSize: 15 }}>Réservations outils en attente</h3>
                  {reservations.filter(r => r.status === 'pending').slice(0, 5).map(r => (
                    <div key={r.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--gray-100)', fontSize: 13 }}>
                      <p style={{ fontWeight: 600 }}>{r.customer_name}</p>
                      <p style={{ color: 'var(--gray-500)', fontSize: 12, marginTop: 2 }}>{r.product_name} — {r.start_date} → {r.end_date}</p>
                    </div>
                  ))}
                  {reservations.filter(r => r.status === 'pending').length === 0 && <p style={{ color: 'var(--success)', fontSize: 13 }}>Aucune réservation en attente</p>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                {/* Réservations voitures récentes */}
                <div className="card" style={{ padding: isMobile ? 16 : 22 }}>
                  <h3 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 14, fontSize: 15 }}>Réservations voitures récentes</h3>
                  {carReservations.slice(0, 5).map(r => (
                    <div key={r.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--gray-100)', fontSize: 13 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p style={{ fontWeight: 600 }}>{r.car_name}</p>
                        <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{r.total} €</span>
                      </div>
                      <p style={{ color: 'var(--gray-500)', fontSize: 12, marginTop: 2 }}>{r.customer_name} — {r.start_date} → {r.end_date} ({r.days} j)</p>
                      <span style={{ display: 'inline-block', marginTop: 3, fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 10,
                        background: r.status === 'confirmed' ? '#d1fae5' : r.status === 'completed' ? '#e0e7ff' : r.status === 'cancelled' ? '#fee2e2' : '#fef3c7',
                        color: r.status === 'confirmed' ? '#065f46' : r.status === 'completed' ? '#3730a3' : r.status === 'cancelled' ? '#991b1b' : '#92400e',
                      }}>{r.status}</span>
                    </div>
                  ))}
                  {carReservations.length === 0 && <p style={{ color: 'var(--gray-500)', fontSize: 13 }}>Aucune réservation voiture</p>}
                </div>

                {/* Dernières commandes */}
                <div className="card" style={{ padding: isMobile ? 16 : 22 }}>
                  <h3 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 14, fontSize: 15 }}>Dernières commandes</h3>
                  {orders.slice(0, 5).map(o => (
                    <div key={o.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--gray-100)', fontSize: 13 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p style={{ fontWeight: 600 }}>{o.customer_name}</p>
                        <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{o.total_price?.toFixed(2)} €</span>
                      </div>
                      <p style={{ color: 'var(--gray-500)', fontSize: 12, marginTop: 2 }}>{o.customer_email}</p>
                    </div>
                  ))}
                  {orders.length === 0 && <p style={{ color: 'var(--gray-500)', fontSize: 13 }}>Aucune commande</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── Products ── */}
          {tab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 10 }}>
                <h2 style={{ fontWeight: 800, color: 'var(--primary)', fontSize: isMobile ? 17 : 22 }}>Catalogue ({products.length} produits)</h2>
                <button className="btn btn-primary btn-sm" onClick={() => { setEditProduct(null); setShowForm(true); }} style={{ flexShrink: 0 }}>
                  <Plus size={15}/> {isMobile ? 'Ajouter' : 'Ajouter un produit'}
                </button>
              </div>
              {loading ? <div className="loading-center"><div className="spinner"/></div> : isMobile ? (
                /* Mobile: cards */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {products.map(p => (
                    <ProductCard key={p.id} p={p}
                      onEdit={p => { setEditProduct(p); setShowForm(true); }}
                      onDelete={handleDelete}/>
                  ))}
                </div>
              ) : (
                /* Desktop: table */
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: 'var(--primary)', color: 'white' }}>
                        {['Produit', 'Catégorie', 'Stock', 'Achat', 'Loc/j', 'Loc/sem', 'Caution', 'Type', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p, i) => (
                        <tr key={p.id} style={{ background: i % 2 ? 'var(--light)' : 'white' }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,51,51,.05)'}
                          onMouseOut={e => e.currentTarget.style.background = i % 2 ? 'var(--light)' : 'white'}>
                          <td style={{ padding: '11px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <img src={p.image} alt={p.name} style={{ width: 40, height: 32, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}/>
                              <span style={{ fontWeight: 600, color: 'var(--primary)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '11px 14px', color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>{p.category_icon} {p.category_name}</td>
                          <td style={{ padding: '11px 14px', fontWeight: 700, color: p.stock === 0 ? 'var(--danger)' : p.stock < 3 ? 'var(--warning)' : 'var(--success)' }}>{p.stock}</td>
                          <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>{p.price_sale ? `${p.price_sale} €` : '—'}</td>
                          <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>{p.price_day ? `${p.price_day} €` : '—'}</td>
                          <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>{p.price_week ? `${p.price_week} €` : '—'}</td>
                          <td style={{ padding: '11px 14px', whiteSpace: 'nowrap', color: p.caution ? '#1e40af' : 'var(--gray-400)', fontWeight: p.caution ? 700 : 400 }}>{p.caution ? `🔒 ${p.caution} €` : '—'}</td>
                          <td style={{ padding: '11px 14px' }}>
                            <div style={{ display: 'flex', gap: 4 }}>
                              {p.available_for_sale ? <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#d1fae5', color: '#065f46', fontWeight: 700, whiteSpace: 'nowrap' }}>Vente</span> : null}
                              {p.available_for_rent ? <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#fef3c7', color: '#92400e', fontWeight: 700, whiteSpace: 'nowrap' }}>Loc.</span> : null}
                            </div>
                          </td>
                          <td style={{ padding: '11px 14px' }}>
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

          {/* ── Orders ── */}
          {tab === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
                <h2 style={{ fontWeight: 800, color: 'var(--primary)', fontSize: isMobile ? 17 : 22 }}>Commandes ({orders.length})</h2>
                {orders.length > 0 && (
                  <button className="btn btn-sm btn-danger" onClick={clearOrders}><Trash2 size={13}/> Tout supprimer</button>
                )}
              </div>
              {orders.length === 0 ? <p style={{ color: 'var(--gray-500)' }}>Aucune commande pour le moment</p> : isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {orders.map(o => (
                    <div key={o.id} className="card" style={{ padding: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--primary)' }}>#{o.id} — {o.customer_name}</p>
                          <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{o.customer_email}</p>
                        </div>
                        <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, flexShrink: 0, background: o.status === 'paid' ? '#d1fae5' : '#fef3c7', color: o.status === 'paid' ? '#065f46' : '#92400e' }}>
                          {o.status === 'paid' ? '✅ Payé' : '⏳ ' + o.status}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{o.total_price.toFixed(2)} €</span>
                        <span style={{ color: 'var(--gray-400)' }}>{new Date(o.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        {o.contract_id && (
                          <a href={`/api/rental-contracts/${o.contract_id}/pdf?token=${token}`} target="_blank" rel="noreferrer"
                            className="btn btn-sm btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
                            <FileText size={13}/> Contrat PDF
                          </a>
                        )}
                        <button className="btn btn-sm btn-danger" onClick={() => deleteOrder(o.id)} style={{ flex: 1, justifyContent: 'center' }}><Trash2 size={13}/> Supprimer</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: 'var(--primary)', color: 'white' }}>
                        {['#', 'Client', 'Email', 'Total', 'Type', 'Statut', 'Date', ''].map((h, hi) => (
                          <th key={hi} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o, i) => (
                        <tr key={o.id} style={{ background: i % 2 ? 'var(--light)' : 'white' }}>
                          <td style={{ padding: '11px 14px', fontWeight: 700 }}>#{o.id}</td>
                          <td style={{ padding: '11px 14px', fontWeight: 600 }}>{o.customer_name}</td>
                          <td style={{ padding: '11px 14px', color: 'var(--gray-500)' }}>{o.customer_email}</td>
                          <td style={{ padding: '11px 14px', fontWeight: 800, color: 'var(--primary)' }}>{o.total_price.toFixed(2)} €</td>
                          <td style={{ padding: '11px 14px' }}>{o.type}</td>
                          <td style={{ padding: '11px 14px' }}>
                            <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: o.status === 'paid' ? '#d1fae5' : '#fef3c7', color: o.status === 'paid' ? '#065f46' : '#92400e' }}>
                              {o.status === 'paid' ? '✅ Payé' : '⏳ ' + o.status}
                            </span>
                          </td>
                          <td style={{ padding: '11px 14px', color: 'var(--gray-500)', fontSize: 12 }}>{new Date(o.created_at).toLocaleDateString('fr-FR')}</td>
                          <td style={{ padding: '11px 14px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {o.contract_id && (
                                <a href={`/api/rental-contracts/${o.contract_id}/pdf?token=${token}`} target="_blank" rel="noreferrer" title="Contrat PDF"
                                  className="btn btn-sm btn-outline"><FileText size={13}/></a>
                              )}
                              <button className="btn btn-sm btn-danger" onClick={() => deleteOrder(o.id)} title="Supprimer"><Trash2 size={13}/></button>
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

          {/* ── Reservations ── */}
          {tab === 'reservations' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
                <h2 style={{ fontWeight: 800, color: 'var(--primary)', fontSize: isMobile ? 17 : 22 }}>Réservations ({reservations.length})</h2>
                {reservations.length > 0 && (
                  <button className="btn btn-sm btn-danger" onClick={clearReservations}><Trash2 size={13}/> Tout supprimer</button>
                )}
              </div>
              {reservations.length === 0 ? <p style={{ color: 'var(--gray-500)' }}>Aucune réservation pour le moment</p> : isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {reservations.map(r => (
                    <div key={r.id} className="card" style={{ padding: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.product_name}</p>
                          <p style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{r.customer_name}</p>
                          <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>{r.customer_email}</p>
                          {r.customer_phone && <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>{r.customer_phone}</p>}
                          <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>{r.start_date} → {r.end_date}</p>
                        </div>
                        <div style={{ flexShrink: 0, textAlign: 'right', marginLeft: 10 }}>
                          <p style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 15 }}>{r.total_price?.toFixed(2)} €</p>
                        </div>
                      </div>
                      <select style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--gray-200)', fontSize: 13, fontWeight: 700 }}
                        value={r.status} onChange={e => updateReservationStatus(r.id, e.target.value)}>
                        <option value="pending">⏳ En attente</option>
                        <option value="confirmed">✅ Confirmée</option>
                        <option value="cancelled">❌ Annulée</option>
                        <option value="completed">🏁 Terminée</option>
                      </select>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteReservation(r.id)} style={{ marginTop: 10, width: '100%', justifyContent: 'center' }}><Trash2 size={13}/> Supprimer</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: 'var(--primary)', color: 'white' }}>
                        {['#', 'Produit', 'Client', 'Téléphone', 'Dates', 'Total', 'Statut', 'Date', ''].map((h, hi) => (
                          <th key={hi} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map((r, i) => (
                        <tr key={r.id} style={{ background: i % 2 ? 'var(--light)' : 'white' }}>
                          <td style={{ padding: '11px 14px', fontWeight: 700 }}>#{r.id}</td>
                          <td style={{ padding: '11px 14px', fontWeight: 600, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.product_name}</td>
                          <td style={{ padding: '11px 14px' }}>
                            <p style={{ fontWeight: 600 }}>{r.customer_name}</p>
                            <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>{r.customer_email}</p>
                          </td>
                          <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>{r.customer_phone || '—'}</td>
                          <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>{r.start_date} → {r.end_date}</td>
                          <td style={{ padding: '11px 14px', fontWeight: 800, color: 'var(--primary)' }}>{r.total_price?.toFixed(2)} €</td>
                          <td style={{ padding: '11px 14px' }}>
                            <select style={{ padding: '4px 8px', borderRadius: 6, border: '1.5px solid var(--gray-200)', fontSize: 12, fontWeight: 700 }}
                              value={r.status} onChange={e => updateReservationStatus(r.id, e.target.value)}>
                              <option value="pending">⏳ En attente</option>
                              <option value="confirmed">✅ Confirmée</option>
                              <option value="cancelled">❌ Annulée</option>
                              <option value="completed">🏁 Terminée</option>
                            </select>
                          </td>
                          <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--gray-400)' }}>{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                          <td style={{ padding: '11px 14px' }}>
                            <button className="btn btn-sm btn-danger" onClick={() => deleteReservation(r.id)} title="Supprimer"><Trash2 size={13}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'car_reservations' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontWeight: 800, color: 'var(--primary)', fontSize: isMobile ? 17 : 22 }}>Location voitures</h2>
                {carSubTab === 'vehicles' && (
                  <button className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={() => { setEditCar(null); setShowCarForm(true); }}>
                    <Plus size={14}/> Ajouter un véhicule
                  </button>
                )}
                {carSubTab === 'reservations' && carReservations.length > 0 && (
                  <button className="btn btn-danger btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={clearCarReservations}>
                    <Trash2 size={14}/> Tout supprimer
                  </button>
                )}
              </div>

              {/* Sous-onglets */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid var(--gray-200)', paddingBottom: 0 }}>
                {[{id:'reservations',label:`Réservations (${carReservations.length})`},{id:'vehicles',label:`Véhicules (${carsDb.length})`}].map(st => (
                  <button key={st.id} onClick={() => setCarSubTab(st.id)} style={{
                    padding: '8px 16px', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer',
                    borderBottom: carSubTab === st.id ? '3px solid var(--accent)' : '3px solid transparent',
                    color: carSubTab === st.id ? 'var(--accent)' : 'var(--gray-600)',
                    background: 'transparent', marginBottom: -2,
                  }}>{st.label}</button>
                ))}
              </div>

              {/* Sous-onglet Réservations */}
              {carSubTab === 'reservations' && (carReservations.length === 0 ? <p style={{ color: 'var(--gray-500)' }}>Aucune réservation pour le moment</p> : isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {carReservations.map(r => (
                    <div key={r.id} className="card" style={{ padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <p style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 15 }}>{r.car_name}</p>
                        <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{r.total} €</span>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>{r.customer_name}</p>
                      <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 4 }}>{r.customer_email} · {r.customer_phone}</p>
                      <p style={{ fontSize: 12, color: 'var(--gray-600)', marginBottom: r.delivery ? 4 : 8 }}>{r.start_date} → {r.end_date} ({r.days} j)</p>
                      {r.delivery && (
                        <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>
                          Livraison à domicile{r.delivery_address ? ` — ${r.delivery_address}` : ''}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        {r.contract_signed_at
                          ? <span style={{ fontSize: 11, fontWeight: 700, background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: 20 }}>Contrat signé</span>
                          : <span style={{ fontSize: 11, fontWeight: 700, background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: 20 }}>Contrat non signé</span>
                        }
                        {r.contract_signed_at && (
                          <a href={`/api/car-reservations/${r.id}/contract/print?token=${token}`} target="_blank" rel="noreferrer"
                            style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                            <FileText size={12}/> Voir
                          </a>
                        )}
                      </div>
                      <select style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1.5px solid var(--gray-200)', fontSize: 13, fontWeight: 700 }}
                        value={r.status} onChange={e => updateCarReservationStatus(r.id, e.target.value)}>
                        <option value="confirmed">Confirmée</option>
                        <option value="pending">En attente</option>
                        <option value="completed">Terminée</option>
                        <option value="cancelled">Annulée</option>
                      </select>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteCarReservation(r.id)} style={{ marginTop: 10, width: '100%', justifyContent: 'center' }}><Trash2 size={13}/> Supprimer</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: 'var(--light)', borderBottom: '2px solid var(--gray-200)' }}>
                        {['#', 'Véhicule', 'Client', 'Téléphone', 'Dates', 'Durée', 'Total', 'Livraison', 'Contrat', 'Statut', ''].map((h, hi) => (
                          <th key={hi} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {carReservations.map((r, i) => (
                        <tr key={r.id} style={{ background: i % 2 ? 'var(--light)' : 'white' }}>
                          <td style={{ padding: '11px 14px', fontWeight: 700 }}>#{r.id}</td>
                          <td style={{ padding: '11px 14px', fontWeight: 700, color: 'var(--primary)' }}>{r.car_name}</td>
                          <td style={{ padding: '11px 14px' }}>
                            <p style={{ fontWeight: 600 }}>{r.customer_name}</p>
                            <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>{r.customer_email}</p>
                          </td>
                          <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600 }}>{r.customer_phone || '—'}</td>
                          <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--gray-600)', whiteSpace: 'nowrap' }}>{r.start_date} → {r.end_date}</td>
                          <td style={{ padding: '11px 14px', fontWeight: 600 }}>{r.days} j</td>
                          <td style={{ padding: '11px 14px', fontWeight: 800, color: 'var(--primary)' }}>{r.total} €</td>
                          <td style={{ padding: '11px 14px' }}>
                            {r.delivery ? (
                              <div>
                                <span style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 4, padding: '2px 6px', fontSize: 11, fontWeight: 700, color: '#92400e', whiteSpace: 'nowrap' }}>Livraison</span>
                                {r.delivery_address && <p style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 3, maxWidth: 180 }}>{r.delivery_address}</p>}
                              </div>
                            ) : <span style={{ color: 'var(--gray-400)', fontSize: 12 }}>—</span>}
                          </td>
                          <td style={{ padding: '11px 14px' }}>
                            {r.contract_signed_at ? (
                              <a href={`/api/car-reservations/${r.id}/contract/print?token=${token}`} target="_blank" rel="noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#065f46', background: '#d1fae5', padding: '3px 8px', borderRadius: 6, textDecoration: 'none' }}>
                                <FileText size={12}/> Voir
                              </a>
                            ) : <span style={{ fontSize: 11, fontWeight: 700, color: '#991b1b', background: '#fee2e2', padding: '2px 6px', borderRadius: 4 }}>Non signé</span>}
                          </td>
                          <td style={{ padding: '11px 14px' }}>
                            <select style={{ padding: '4px 8px', borderRadius: 6, border: '1.5px solid var(--gray-200)', fontSize: 12, fontWeight: 700 }}
                              value={r.status} onChange={e => updateCarReservationStatus(r.id, e.target.value)}>
                              <option value="confirmed">Confirmée</option>
                              <option value="pending">En attente</option>
                              <option value="completed">Terminée</option>
                              <option value="cancelled">Annulée</option>
                            </select>
                          </td>
                          <td style={{ padding: '11px 14px' }}>
                            <button className="btn btn-sm btn-danger" onClick={() => deleteCarReservation(r.id)} title="Supprimer"><Trash2 size={13}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

              {/* Sous-onglet Véhicules */}
              {carSubTab === 'vehicles' && (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                  {carsDb.map(car => (
                    <div key={car.id} className="card" style={{ padding: 16, opacity: car.active === 0 ? 0.5 : 1 }}>
                      {car.image && <img src={car.image} alt={car.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }}/>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <div>
                          <p style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 15 }}>{car.name}</p>
                          <p style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600 }}>{car.category}</p>
                        </div>
                        {car.active === 0 && <span style={{ fontSize: 10, fontWeight: 800, background: 'var(--gray-200)', color: 'var(--gray-500)', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>Masqué</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--gray-600)', marginBottom: 12 }}>
                        <span>{car.price_day} €/j</span>
                        {car.price_5days > 0 && <span>· 5j: {car.price_5days} €</span>}
                        {car.price_2weeks > 0 && <span>· 2sem: {car.price_2weeks} €</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-sm btn-outline" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 4 }}
                          onClick={() => { setEditCar(car); setShowCarForm(true); }}>
                          <Edit2 size={13}/> Modifier
                        </button>
                        <button className="btn btn-sm" style={{ background: '#fee2e2', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, fontWeight: 700 }}
                          onClick={() => handleDeleteCar(car.id)}>
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {showForm && (
        <ProductForm product={editProduct} categories={categories} token={token}
          onSave={() => { loadData(); setShowForm(false); }}
          onClose={() => setShowForm(false)}/>
      )}

      {showCarForm && (
        <CarForm car={editCar} token={token}
          onSave={() => { loadData(); setShowCarForm(false); }}
          onClose={() => setShowCarForm(false)}/>
      )}
    </div>
  );
}

/* ─── CAR FORM MODAL ─────────────────────────────────────────────────────── */
function CarForm({ car, token, onSave, onClose }) {
  const isMobile = useIsMobile();
  const empty = { name: '', category: '', description: '', price_day: '', price_5days: '', price_2weeks: '', min_days: '', caution: '', image: '', active: true,
    specs: [['Carburant',''],['Boîte',''],['Places',''],['Portes',''],['Climatisation',''],['Kilométrage','']] };
  const [form, setForm] = useState(car ? { ...car, active: car.active !== 0 } : empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await axios.post('/api/upload', fd);
      set('image', data.url);
      toast.success('Image importée !');
    } catch { toast.error("Erreur lors de l'import"); }
    finally { setUploading(false); }
  };

  const setSpec = (i, col, val) => {
    const specs = [...(form.specs || [])];
    specs[i] = col === 0 ? [val, specs[i]?.[1] || ''] : [specs[i]?.[0] || '', val];
    set('specs', specs);
  };
  const addSpec = () => set('specs', [...(form.specs || []), ['', '']]);
  const removeSpec = (i) => set('specs', (form.specs || []).filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!form.name) { toast.error('Nom requis'); return; }
    setSaving(true);
    try {
      const payload = { ...form, specs: form.specs || [] };
      if (car?.id) {
        await axios.put(`/api/cars/${car.id}`, payload, API(token));
        toast.success('Véhicule modifié !');
      } else {
        await axios.post('/api/cars', payload, API(token));
        toast.success('Véhicule ajouté !');
      }
      onSave();
    } catch { toast.error('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 2000, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : 16 }}>
      <div className="card" style={{ width: '100%', maxWidth: 640, maxHeight: isMobile ? '92vh' : '90vh', overflow: 'auto', padding: isMobile ? '20px 16px' : 28, borderRadius: isMobile ? '16px 16px 0 0' : 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 800, color: 'var(--primary)', fontSize: isMobile ? 17 : 20 }}>{car ? 'Modifier' : 'Ajouter'} un véhicule</h3>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 8, background: 'var(--gray-100)' }}><X size={18}/></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Nom *</label>
            <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Toyota Yaris"/>
          </div>
          <div className="form-group">
            <label className="form-label">Catégorie</label>
            <input className="form-control" value={form.category} onChange={e => set('category', e.target.value)} placeholder="Ex: Citadine, SUV..."/>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Description</label>
            <textarea className="form-control" rows={3} value={form.description} onChange={e => set('description', e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Prix journalier (€)</label>
            <input className="form-control" type="number" value={form.price_day} onChange={e => set('price_day', e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Prix 5 jours+ (€/j)</label>
            <input className="form-control" type="number" value={form.price_5days} onChange={e => set('price_5days', e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Prix 2 semaines (€/j)</label>
            <input className="form-control" type="number" value={form.price_2weeks} onChange={e => set('price_2weeks', e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Durée minimum (jours)</label>
            <input className="form-control" type="number" value={form.min_days || ''} onChange={e => set('min_days', e.target.value)} placeholder="Aucune"/>
          </div>
          <div className="form-group">
            <label className="form-label">Caution (€)</label>
            <input className="form-control" type="number" value={form.caution || ''} onChange={e => set('caution', e.target.value)} placeholder="Ex: 500"/>
            <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 3 }}>Demandée à la remise des clés (chèque ou CB)</p>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Photo du véhicule</label>
            {form.image && (
              <div style={{ marginBottom: 8, position: 'relative', display: 'inline-block' }}>
                <img src={form.image} alt="Preview" style={{ height: 100, borderRadius: 8, objectFit: 'cover' }}/>
                <button type="button" onClick={() => set('image', '')}
                  style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,.6)', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={12} color="white"/>
                </button>
              </div>
            )}
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '2px dashed var(--gray-200)', borderRadius: 10, cursor: 'pointer', background: 'var(--gray-50)', fontWeight: 600, fontSize: 13, color: 'var(--gray-600)' }}>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }}/>
              {uploading ? 'Import en cours...' : form.image ? 'Remplacer la photo' : 'Choisir une photo'}
            </label>
          </div>
        </div>

        {/* Caractéristiques */}
        <div style={{ marginTop: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Caractéristiques</label>
            <button type="button" className="btn btn-sm btn-outline" onClick={addSpec} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Plus size={12}/> Ajouter
            </button>
          </div>
          {(form.specs || []).map((spec, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <input className="form-control" value={spec[0]} onChange={e => setSpec(i, 0, e.target.value)} placeholder="Label (ex: Boîte)" style={{ fontSize: 13 }}/>
              <input className="form-control" value={spec[1]} onChange={e => setSpec(i, 1, e.target.value)} placeholder="Valeur (ex: Manuelle)" style={{ fontSize: 13 }}/>
              <button type="button" onClick={() => removeSpec(i)} style={{ padding: '0 8px', borderRadius: 6, background: '#fee2e2', color: 'var(--danger)', flexShrink: 0 }}>
                <X size={14}/>
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <input type="checkbox" id="car-active" checked={form.active} onChange={e => set('active', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}/>
          <label htmlFor="car-active" style={{ fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Visible sur le site</label>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }} onClick={handleSave} disabled={saving}>
            <Save size={15}/> {saving ? 'Sauvegarde...' : 'Enregistrer'}
          </button>
          <button className="btn btn-outline" onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
}
