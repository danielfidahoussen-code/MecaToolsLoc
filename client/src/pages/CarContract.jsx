import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Loader, PenLine, Trash2, Upload, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CGC_TEXT = `CONDITIONS GÉNÉRALES DE LOCATION (CGL) – LOCATION DE VÉHICULE SANS CHAUFFEUR
PRESTOLOC — Date : 22/01/2026

1) Objet – Champ d'application
Les présentes CGL encadrent toute location de véhicule sans chauffeur entre le Loueur et le Locataire. En signant, le Locataire reconnaît avoir pris connaissance des CGL et les accepter.

2) Conducteurs autorisés
Seules les personnes indiquées au contrat peuvent conduire. Tout ajout doit être déclaré avant départ.

3) Caution / Dépôt de garantie
Le Loueur peut encaisser tout ou partie de la caution pour couvrir : dommages, franchise, carburant manquant, nettoyage, retard, amendes, frais de dossier, immobilisation, accessoires manquants.

4) Utilisation du Véhicule
Ne pas : sous-louer, prêter à un conducteur non autorisé, conduire sous alcool/stupéfiants, participer à des courses, transporter des matières dangereuses.

5) Carburant
Le niveau doit être rendu identique au départ. Tout carburant manquant est facturé.

6) Sinistre / Accident (procédure obligatoire)
(a) Sécuriser. (b) Prévenir le Loueur immédiatement. (c) Constat amiable + photos. (d) Ne pas reconnaître de responsabilité.

7) Restitution – Retard
Retour à la date/heure convenus. Prolongation validée avant l'échéance. Retard non autorisé : jours supplémentaires + pénalités.

8) Nettoyage
Véhicule rendu anormalement sale : frais de nettoyage facturés selon grille.

9) Infractions
Le Locataire est responsable des infractions (stationnement, vitesse, péages).

10) Données personnelles (RGPD)
Données utilisées pour gérer la réservation, le contrat, la facturation. Contact : locationautopresto@gmail.com

11) Loi applicable
Droit français. Juridictions compétentes en cas de litige après tentative de médiation.`;

function SignaturePad({ onSign }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * (canvas.width / rect.width), y: (src.clientY - rect.top) * (canvas.height / rect.height) };
  };

  const start = (e) => {
    e.preventDefault();
    drawing.current = true;
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e, canvasRef.current);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const move = (e) => {
    e.preventDefault();
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const pos = getPos(e, canvasRef.current);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSignature(true);
  };

  const end = () => {
    drawing.current = false;
    if (hasSignature) onSign(canvasRef.current.toDataURL('image/png'));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSign(null);
  };

  return (
    <div>
      <div style={{ position: 'relative', border: '2px solid var(--gray-200)', borderRadius: 10, background: '#fafafa', overflow: 'hidden' }}>
        <canvas ref={canvasRef} width={560} height={150} style={{ width: '100%', height: 150, touchAction: 'none', cursor: 'crosshair', display: 'block' }}
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end}/>
        {!hasSignature && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <p style={{ color: 'var(--gray-400)', fontSize: 13, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 6 }}>
              <PenLine size={16}/> Signez ici avec votre doigt ou la souris
            </p>
          </div>
        )}
      </div>
      {hasSignature && (
        <button type="button" onClick={clear} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12, color: 'var(--danger)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <Trash2 size={13}/> Effacer la signature
        </button>
      )}
    </div>
  );
}

export default function CarContract() {
  const { id } = useParams();
  const [reservation, setReservation] = useState(null);
  const [pageStatus, setPageStatus] = useState('loading');
  const [step, setStep] = useState(1);
  const [driver, setDriver] = useState({ prenom: '', nom: '', naissance: '', permis: '', permis_date: '', conducteur2_prenom: '', conducteur2_nom: '', conducteur2_permis: '' });
  const [vehicle, setVehicle] = useState({ immatriculation: '', caution: '', km: '', carburant: '', lavage: 'Oui', options: '', observations: '' });
  const [signature, setSignature] = useState(null);
  const [cgcRead, setCgcRead] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [signed, setSigned] = useState(false);
  const [paying, setPaying] = useState(false);
  const [secondDriver, setSecondDriver] = useState(false);
  const [permisPhoto, setPermisPhoto] = useState(null);
  const [uploadingPermis, setUploadingPermis] = useState(false);

  useEffect(() => {
    axios.get(`/api/car-reservations/public/${id}`)
      .then(({ data }) => {
        setReservation(data);
        if (data.contract_signed) { setSigned(true); setPageStatus('ready'); return; }
        const parts = (data.customer_name || '').split(' ');
        setDriver(d => ({ ...d, prenom: parts[0] || '', nom: parts.slice(1).join(' ') || '' }));
        setPageStatus('ready');
      })
      .catch(() => setPageStatus('error'));
  }, [id]);

  const setD = (k, v) => setDriver(d => ({ ...d, [k]: v }));

  const handlePermisUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPermis(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await axios.post('/api/upload', fd);
      setPermisPhoto(data.url);
      toast.success('Permis importé !');
    } catch { toast.error("Erreur lors de l'import"); }
    finally { setUploadingPermis(false); }
  };
  const setV = (k, v) => setVehicle(v2 => ({ ...v2, [k]: v }));

  const handleSubmit = async () => {
    if (!signature) { toast.error('Veuillez signer le contrat'); return; }
    if (!cgcRead) { toast.error('Veuillez accepter les conditions générales'); return; }
    if (!driver.prenom || !driver.nom || !driver.naissance || !driver.permis || !driver.permis_date) {
      toast.error('Tous les champs conducteur sont requis'); return;
    }
    setSubmitting(true);
    try {
      await axios.post(`/api/car-reservations/${id}/contract`, { driver: { ...driver, permis_photo: permisPhoto }, vehicle_state: vehicle, signature });
      toast.success('Contrat signé !');
      setSigned(true);
    } catch { toast.error('Erreur lors de la signature'); }
    finally { setSubmitting(false); }
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      const { data } = await axios.post(`/api/car-reservations/${id}/checkout`);
      window.location.href = data.url;
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Erreur paiement');
      setPaying(false);
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
      <Link to="/autres-services" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>Retour</Link>
    </div>
  );

  if (signed && reservation) return (
    <div style={{ maxWidth: 540, margin: '60px auto', padding: '0 16px' }}>
      <div className="card" style={{ padding: '32px 28px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle size={38} color="#059669"/>
        </div>
        <h2 style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 22, marginBottom: 8 }}>Contrat signé !</h2>
        <p style={{ color: 'var(--gray-600)', marginBottom: 20, lineHeight: 1.6 }}>
          Votre contrat pour <strong>{reservation.car_name}</strong> est signé.<br/>
          Il ne reste plus qu'à procéder au paiement de la location.
        </p>

        {/* Récap */}
        <div style={{ background: 'var(--light)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, textAlign: 'left', fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: 'var(--gray-600)' }}>Location {reservation.days} jour{reservation.days > 1 ? 's' : ''}</span>
            <span style={{ fontWeight: 700 }}>{reservation.car_total || reservation.total} €</span>
          </div>
          {reservation.delivery && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: 'var(--gray-600)' }}>Livraison / récupération</span>
              <span style={{ fontWeight: 700 }}>20 €</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--gray-200)', paddingTop: 8, marginTop: 4, fontWeight: 900, fontSize: 15 }}>
            <span>Total à payer</span>
            <span style={{ color: 'var(--primary)' }}>{reservation.total} €</span>
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
        </div>

        <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', fontSize: 16 }}
          onClick={handlePay} disabled={paying}>
          {paying ? 'Redirection vers le paiement...' : `Payer ${reservation.total} € →`}
        </button>
        <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 8 }}>Paiement sécurisé par Stripe</p>
      </div>
    </div>
  );

  const r = reservation;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px 60px' }}>
      <h1 style={{ fontWeight: 900, color: 'var(--primary)', fontSize: 'clamp(20px,4vw,28px)', marginBottom: 4 }}>Contrat de location N°{id}</h1>
      <p style={{ color: 'var(--gray-500)', fontSize: 13, marginBottom: 28 }}>
        {r.car_name} — du {r.start_date} au {r.end_date} ({r.days} jour{r.days > 1 ? 's' : ''}) — <strong>{r.total} €</strong>
      </p>

      {/* Étapes */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
        {['Conducteur', 'Véhicule', 'CGC & Signature'].map((label, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ height: 4, borderRadius: 2, background: step > i ? 'var(--accent)' : step === i + 1 ? 'var(--primary)' : 'var(--gray-200)', marginBottom: 4 }}/>
            <span style={{ fontSize: 11, fontWeight: 700, color: step === i + 1 ? 'var(--primary)' : step > i + 1 ? 'var(--accent)' : 'var(--gray-400)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Étape 1 — Conducteur */}
      {step === 1 && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: 20, fontSize: 17 }}>Informations conducteur</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Prénom *</label>
              <input className="form-control" value={driver.prenom} onChange={e => setD('prenom', e.target.value)}/>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nom *</label>
              <input className="form-control" value={driver.nom} onChange={e => setD('nom', e.target.value)}/>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date de naissance *</label>
              <input className="form-control" type="date" value={driver.naissance} onChange={e => setD('naissance', e.target.value)}/>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">N° de permis *</label>
              <input className="form-control" value={driver.permis} onChange={e => setD('permis', e.target.value)} placeholder="Ex: 12AA34567"/>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date d'obtention du permis *</label>
              <input className="form-control" type="date" value={driver.permis_date} onChange={e => setD('permis_date', e.target.value)}/>
            </div>
          </div>

          {/* Upload photo permis */}
          <div style={{ marginTop: 16, padding: '14px 16px', border: `2px solid ${permisPhoto ? '#86efac' : '#fca5a5'}`, borderRadius: 12, background: permisPhoto ? 'rgba(134,239,172,.08)' : 'rgba(252,165,165,.06)' }}>
            <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: permisPhoto ? '#166534' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Upload size={14}/> Photo du permis de conduire *
              {!permisPhoto && <span style={{ fontWeight: 500, color: 'var(--gray-500)', fontSize: 12 }}>(recto ou recto/verso)</span>}
            </p>

            {permisPhoto ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={permisPhoto} alt="Permis" style={{ height: 80, borderRadius: 8, objectFit: 'cover', border: '1px solid #86efac' }}/>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#166534', marginBottom: 6 }}>Permis importé</p>
                  <button type="button" onClick={() => setPermisPhoto(null)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--danger)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <X size={12}/> Supprimer
                  </button>
                </div>
              </div>
            ) : (
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '2px dashed #fca5a5', borderRadius: 10, cursor: 'pointer', background: 'white', fontWeight: 600, fontSize: 13, color: 'var(--gray-600)' }}>
                <input type="file" accept="image/*" onChange={handlePermisUpload} style={{ display: 'none' }}/>
                <Upload size={16} color="var(--danger)"/>
                {uploadingPermis ? 'Import en cours...' : 'Choisir une photo (JPG, PNG…)'}
              </label>
            )}
          </div>

          <div style={{ marginTop: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
              <input type="checkbox" checked={secondDriver} onChange={e => setSecondDriver(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}/>
              Ajouter un 2ème conducteur
            </label>
          </div>

          {secondDriver && (
            <div style={{ marginTop: 14, padding: 14, background: 'var(--light)', borderRadius: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Prénom</label>
                <input className="form-control" value={driver.conducteur2_prenom} onChange={e => setD('conducteur2_prenom', e.target.value)}/>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nom</label>
                <input className="form-control" value={driver.conducteur2_nom} onChange={e => setD('conducteur2_nom', e.target.value)}/>
              </div>
              <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">N° de permis</label>
                <input className="form-control" value={driver.conducteur2_permis} onChange={e => setD('conducteur2_permis', e.target.value)}/>
              </div>
            </div>
          )}

          <button className="btn btn-primary" style={{ marginTop: 24, width: '100%', justifyContent: 'center' }}
            onClick={() => {
              if (!driver.prenom || !driver.nom || !driver.naissance || !driver.permis_date) {
                toast.error('Remplissez tous les champs obligatoires'); return;
              }
              if (!driver.permis.trim()) {
                toast.error('Le numéro de permis est requis'); return;
              }
              if (!permisPhoto) {
                toast.error('Veuillez téléverser une photo de votre permis de conduire'); return;
              }
              setStep(2);
            }}>
            Suivant →
          </button>
        </div>
      )}

      {/* Étape 2 — État du véhicule (optionnel, peut être rempli par admin) */}
      {step === 2 && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: 6, fontSize: 17 }}>État du véhicule au départ</h3>
          <p style={{ color: 'var(--gray-500)', fontSize: 12, marginBottom: 20 }}>Ces informations seront complétées lors de la remise des clés. Vous pouvez les laisser vides.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Immatriculation</label>
              <input className="form-control" value={vehicle.immatriculation} onChange={e => setV('immatriculation', e.target.value)} placeholder="Ex: AA-123-BB"/>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Caution versée</label>
              <input className="form-control" value={vehicle.caution} onChange={e => setV('caution', e.target.value)} placeholder="Ex: 500 €"/>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Km compteur départ</label>
              <input className="form-control" value={vehicle.km} onChange={e => setV('km', e.target.value)} placeholder="Ex: 45 230"/>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Carburant au départ</label>
              <select className="form-control" value={vehicle.carburant} onChange={e => setV('carburant', e.target.value)}>
                <option value="">—</option>
                <option>Plein</option>
                <option>3/4</option>
                <option>1/2</option>
                <option>1/4</option>
                <option>Vide</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Lavage effectué</label>
              <select className="form-control" value={vehicle.lavage} onChange={e => setV('lavage', e.target.value)}>
                <option>Oui</option>
                <option>Non</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Options</label>
              <input className="form-control" value={vehicle.options} onChange={e => setV('options', e.target.value)} placeholder="Ex: GPS, siège bébé…"/>
            </div>
            <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
              <label className="form-label">Observations / dommages préexistants</label>
              <textarea className="form-control" rows={3} value={vehicle.observations} onChange={e => setV('observations', e.target.value)} placeholder="Décrivez tout dommage visible sur le véhicule au départ"/>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button className="btn btn-outline" onClick={() => setStep(1)}>← Retour</button>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(3)}>Suivant →</button>
          </div>
        </div>
      )}

      {/* Étape 3 — CGC + Signature */}
      {step === 3 && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: 16, fontSize: 17 }}>Conditions générales & Signature</h3>

          {/* Affichage des CGC */}
          <div style={{ background: 'var(--light)', borderRadius: 10, padding: '14px 16px', maxHeight: 260, overflowY: 'auto', fontSize: 12, lineHeight: 1.7, color: 'var(--gray-700)', marginBottom: 16, whiteSpace: 'pre-wrap', border: '1px solid var(--gray-200)' }}>
            {CGC_TEXT}
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20, cursor: 'pointer' }}>
            <input type="checkbox" checked={cgcRead} onChange={e => setCgcRead(e.target.checked)}
              style={{ width: 16, height: 16, marginTop: 2, accentColor: 'var(--accent)', flexShrink: 0 }}/>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>
              J'ai lu et j'accepte les conditions générales de location. Je reconnais que ma signature électronique a la même valeur qu'une signature manuscrite.
            </span>
          </label>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <PenLine size={14}/> Votre signature *
            </label>
            <SignaturePad onSign={setSignature}/>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button className="btn btn-outline" onClick={() => setStep(2)}>← Retour</button>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 15 }} onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Envoi en cours...' : 'Signer et valider le contrat'}
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--gray-400)', textAlign: 'center', marginTop: 8 }}>
            Réservation N°{id} — {r.customer_name} — {r.car_name}
          </p>
        </div>
      )}
    </div>
  );
}
