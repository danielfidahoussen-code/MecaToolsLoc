import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { getTiers } from '../utils/carPricing';

// Carte résumé — cliquer n'importe où dessus amène à la fiche véhicule complète,
// où se trouvent les caractéristiques et le formulaire de réservation (dates, options, etc.)
function CarCard({ car }) {
  const navigate = useNavigate();
  const tiers = getTiers(car);
  const startPrice = tiers.length > 0 ? tiers[tiers.length - 1].value : 0;

  return (
    <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
      onClick={() => navigate(`/vehicules/${car.id}`)}>
      <div style={{ height: 200, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0, overflow: 'hidden', borderBottom: '1px solid var(--gray-100)' }}>
        {car.image
          ? <img src={car.image} alt={car.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s ease' }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.07)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}/>
          : <p style={{ color: 'var(--gray-400)', fontSize: 13, fontWeight: 600 }}>Photo à venir</p>
        }
        <div style={{ position: 'absolute', top: 12, left: 12, background: 'var(--accent)', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {(car.category || '').split('—')[0].trim()}
        </div>
        <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(6px)', padding: '6px 12px', borderRadius: 10, textAlign: 'right' }}>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>À PARTIR DE</p>
          <p style={{ fontSize: 20, fontWeight: 900, color: 'white', lineHeight: 1 }}>{startPrice} €<span style={{ fontSize: 11, fontWeight: 500 }}>/j</span></p>
        </div>
      </div>

      <div style={{ padding: '20px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>{car.category}</p>
          <h2 style={{ fontWeight: 900, fontSize: 20, color: 'var(--primary)', marginBottom: 8 }}>{car.name}</h2>
          <p style={{ color: 'var(--gray-600)', fontSize: 13, lineHeight: 1.6 }}>{car.description}</p>
        </div>

        {car.specs && car.specs.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--gray-100)' }}>
            {car.specs.slice(0, 4).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--gray-500)', fontWeight: 500 }}>{k}</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        {!!car.available_for_sale && car.price_sale > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#c2410c', background: '#fff7ed', border: '1px solid #fed7aa', padding: '6px 10px', borderRadius: 8, marginBottom: 12, fontWeight: 700 }}>
            <span>Également à vendre</span>
            <span style={{ fontWeight: 900, fontSize: 14 }}>{car.price_sale} €</span>
          </div>
        )}

        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
          Voir le véhicule et réserver <ArrowRight size={16}/>
        </button>
      </div>
    </div>
  );
}

// Catégorie principale d'un véhicule (avant le "—", ex. "Citadine — Phase 1" -> "Citadine")
const mainCategory = (car) => (car.category || '').split('—')[0].trim();

export default function Vehicules() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || '';

  useEffect(() => {
    axios.get('/api/cars').then(({ data }) => setCars(data)).finally(() => setLoading(false));
  }, []);

  // Remonte en haut quand on change de catégorie (les liens du footer ne changent que le ?category=)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [category]);

  // Catégories disponibles, dans l'ordre d'apparition
  const availableCategories = [...new Set(cars.map(mainCategory).filter(Boolean))];

  const visibleCars = category
    ? cars.filter(c => mainCategory(c).toLowerCase() === category.toLowerCase())
    : cars;

  const setCategory = (val) => {
    const np = new URLSearchParams(searchParams);
    if (val) np.set('category', val); else np.delete('category');
    setSearchParams(np);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #380808 100%)', color: 'white', padding: '48px 0 40px' }}>
        <div className="container">
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,.5)', marginBottom: 6 }}>PrestoLocation</p>
          <h1 style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 900, marginBottom: 10 }}>Location de véhicules</h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 15, maxWidth: 540, marginBottom: 20 }}>
            Large gamme de véhicules. Retrait à Saint-Denis ou livraison sur toute l'île. Jeunes conducteurs acceptés. Tarifs dégressifs dès 5 jours.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="tel:+262693839654" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.15)', color: 'white', padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              <Phone size={15}/> +262 693 83 96 54
            </a>
            <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.8)', padding: '10px 18px', borderRadius: 10, fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
              <Mail size={14}/> contact@prestolocation.re
            </Link>
          </div>
        </div>
      </div>

      {/* Infos rapides */}
      <div style={{ background: 'var(--light)', borderBottom: '1px solid var(--gray-200)', padding: '14px 0' }}>
        <div className="container" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13, color: 'var(--gray-600)', fontWeight: 600 }}>
          <span>Jeunes conducteurs acceptés</span>
          <span style={{ color: 'var(--gray-300)' }}>|</span>
          <span>Kilométrage illimité</span>
          <span style={{ color: 'var(--gray-300)' }}>|</span>
          <span>Retrait à Saint-Denis · Livraison toute l'île</span>
          <span style={{ color: 'var(--gray-300)' }}>|</span>
          <span style={{ color: '#059669', fontWeight: 700 }}>Livraison 20 € / Récupération 20 €</span>
          <span style={{ color: 'var(--gray-300)' }}>|</span>
          <span style={{ color: '#d97706', fontWeight: 700 }}>-10% dès 5 jours</span>
        </div>
      </div>

      {/* Grille véhicules */}
      <div className="container" style={{ paddingTop: 36, paddingBottom: 60 }}>
        {/* Filtres par catégorie */}
        {!loading && availableCategories.length > 0 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
            <button onClick={() => setCategory('')}
              style={{ padding: '8px 16px', borderRadius: 999, fontWeight: 700, fontSize: 14, border: '1px solid var(--gray-200)',
                background: category === '' ? 'var(--primary)' : 'white', color: category === '' ? 'white' : 'var(--gray-700)', cursor: 'pointer', transition: 'var(--transition)' }}>
              Tous
            </button>
            {availableCategories.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                style={{ padding: '8px 16px', borderRadius: 999, fontWeight: 700, fontSize: 14, border: '1px solid var(--gray-200)',
                  background: category.toLowerCase() === cat.toLowerCase() ? 'var(--primary)' : 'white',
                  color: category.toLowerCase() === cat.toLowerCase() ? 'white' : 'var(--gray-700)', cursor: 'pointer', transition: 'var(--transition)' }}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>Chargement...</div>
        ) : visibleCars.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>
            {category ? `Aucun véhicule dans la catégorie « ${category} ».` : 'Aucun véhicule disponible pour le moment.'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24, marginBottom: 48 }}>
            {visibleCars.map(car => <CarCard key={car.id} car={car}/>)}
          </div>
        )}

        {/* Informations générales */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(20px,3vw,26px)', color: 'var(--primary)', marginBottom: 6 }}>
            Les informations générales concernant la location d'un véhicule avec PrestoLocation
          </h2>
          <p style={{ color: 'var(--gray-600)', fontSize: 14, marginBottom: 20 }}>
            En plus des <Link to="/contrats-et-franchises" style={{ color: 'var(--accent)', fontWeight: 600 }}>conditions générales de location</Link>, voici quelques informations utiles avant de réserver.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            <div style={{ background: 'var(--light)', border: '1px solid var(--gray-200)', borderRadius: 14, padding: '22px 24px' }}>
              <p style={{ fontWeight: 800, fontSize: 13, letterSpacing: 0.5, color: 'var(--primary)', marginBottom: 14 }}>INFORMATIONS GÉNÉRALES</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: 'var(--gray-700)', paddingLeft: 18 }}>
                <li>La location à la journée s'étend par tranche de 24 h.</li>
                <li>Le carburant est à la charge du client, à restituer au même niveau qu'au départ.</li>
                <li>Possibilité de louer un siège-bébé pour 4 € / jour.</li>
                <li>Possibilité de louer un réhausseur pour 2 € / jour.</li>
                <li>Kilométrage illimité. Jeunes conducteurs acceptés.</li>
              </ul>
            </div>
            <div style={{ background: 'var(--light)', border: '1px solid var(--gray-200)', borderRadius: 14, padding: '22px 24px' }}>
              <p style={{ fontWeight: 800, fontSize: 13, letterSpacing: 0.5, color: 'var(--primary)', marginBottom: 14 }}>LIVRAISON & ASSURANCE</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: 'var(--gray-700)', paddingLeft: 18 }}>
                <li>Prise en charge à l'aéroport jusqu'à notre agence : 20 € (offert si la location dépasse 20 jours).</li>
                <li>Livraison du véhicule sur l'île : 28 € (Est / Ouest) ou 35 € (Sud).</li>
                <li>L'assurance couvre les dommages causés au tiers, le vol, l'incendie et le bris de glace.</li>
                <li>Annulation gratuite jusqu'à 2 jours avant le départ (voir nos <Link to="/cgv" style={{ color: 'var(--accent)', fontWeight: 600 }}>CGV</Link>).</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Pied de page contact */}
        <div style={{ background: 'var(--primary)', borderRadius: 20, padding: '28px 32px', color: 'white', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 10, letterSpacing: 1 }}>Contact</p>
            <a href="tel:+262693839654" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
              <Phone size={15} color="rgba(255,255,255,.5)"/> +262 693 83 96 54
            </a>
            <Link to="/contact" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.6)', textDecoration: 'none', fontSize: 13 }}>
              <Mail size={14} color="rgba(255,255,255,.4)"/> contact@prestolocation.re
            </Link>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 10, letterSpacing: 1 }}>Retrait &amp; livraison</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'rgba(255,255,255,.7)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <MapPin size={14} color="rgba(255,255,255,.4)" style={{ flexShrink: 0, marginTop: 2 }}/>
                <span>Retrait : 3b, Rue de la Guadeloupe 97490 — <strong style={{ color: 'white' }}>Saint-Denis</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <MapPin size={14} color="rgba(255,255,255,.4)" style={{ flexShrink: 0, marginTop: 2 }}/>
                <span>Livraison possible sur <strong style={{ color: 'white' }}>toute l'île</strong></span>
              </div>
            </div>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 10, letterSpacing: 1 }}>Conditions</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13, color: 'rgba(255,255,255,.7)' }}>
              <p>Permis B requis</p>
              <p>Jeunes conducteurs acceptés</p>
              <p>Kilométrage illimité</p>
              <p>Assistance disponible</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
