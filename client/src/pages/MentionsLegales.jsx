export default function MentionsLegales() {
  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Mentions légales</h1>
          <p>Informations légales relatives au site PrestoLocation</p>
        </div>
      </div>
      <div className="page">
        <div className="container" style={{ maxWidth: 800 }}>
          <LegalSection title="1. Éditeur du site">
            <p>Le présent site est édité par :</p>
            <ul>
              <li><strong>Raison sociale :</strong> PrestoLocation</li>
              <li><strong>Forme juridique :</strong> Société par actions simplifiée (SAS), <strong>société en cours de formation</strong> — immatriculation au RCS en cours</li>
              <li><strong>Capital social :</strong> [à compléter dès l'immatriculation]</li>
              <li><strong>Siège social :</strong> 3B rue de la Guadeloupe, Moufia, Sainte-Clotilde, 97490 Saint-Denis, La Réunion</li>
              <li><strong>SIREN / SIRET :</strong> [à compléter dès l'immatriculation]</li>
              <li><strong>RCS :</strong> [à compléter dès l'immatriculation] — Saint-Denis de La Réunion</li>
              <li><strong>N° TVA intracommunautaire :</strong> [à compléter dès l'immatriculation]</li>
              <li><strong>Téléphone :</strong> 06 93 83 96 54</li>
              <li><strong>Email :</strong> contact@prestolocation.re</li>
            </ul>
          </LegalSection>

          <LegalSection title="2. Directeur de la publication">
            <p>Le directeur de la publication est le Président de la société PrestoLocation.</p>
          </LegalSection>

          <LegalSection title="3. Hébergement">
            <p>Le site est hébergé par :</p>
            <ul>
              <li><strong>Railway Corporation</strong></li>
              <li>2261 Market Street #4667, San Francisco, CA 94114, États-Unis</li>
              <li>Contact : <a href="https://railway.app" target="_blank" rel="noreferrer">railway.app</a> — team@railway.app</li>
            </ul>
          </LegalSection>

          <LegalSection title="4. Propriété intellectuelle">
            <p>L'ensemble des contenus présents sur ce site (textes, images, logos, icônes, etc.) est la propriété exclusive de PrestoLocation ou de ses partenaires, et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.</p>
            <p>Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sauf autorisation écrite préalable de PrestoLocation.</p>
          </LegalSection>

          <LegalSection title="5. Responsabilité">
            <p>PrestoLocation s'efforce d'assurer au mieux l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, PrestoLocation ne peut garantir l'exhaustivité et l'absence d'erreur des informations disponibles sur le site.</p>
            <p>PrestoLocation ne pourra être tenu responsable des dommages directs ou indirects résultant de l'utilisation de ce site ou des informations qui y sont contenues.</p>
          </LegalSection>

          <LegalSection title="6. Liens hypertextes">
            <p>Le site peut contenir des liens vers d'autres sites internet. PrestoLocation n'est pas responsable du contenu de ces sites tiers et ne peut être tenu responsable des dommages qui pourraient résulter de leur consultation.</p>
          </LegalSection>

          <LegalSection title="7. Médiation de la consommation">
            <p>Conformément aux articles L.616-1 et R.616-1 du Code de la consommation, le client consommateur peut recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable d'un litige, après avoir adressé une réclamation écrite préalable à PrestoLocation restée sans réponse satisfaisante.</p>
            <ul>
              <li><strong>Médiateur désigné :</strong> [nom du médiateur à compléter] — [adresse / site du médiateur]</li>
              <li><strong>Plateforme européenne de règlement en ligne des litiges (RLL) :</strong> <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer">ec.europa.eu/consumers/odr</a></li>
            </ul>
          </LegalSection>

          <LegalSection title="8. Droit applicable">
            <p>Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.</p>
          </LegalSection>

          <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 40 }}>
            Dernière mise à jour : juillet 2026
          </p>
        </div>
      </div>
    </div>
  );
}

function LegalSection({ title, children }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary)', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid var(--gray-200)' }}>{title}</h2>
      <div style={{ color: 'var(--gray-600)', lineHeight: 1.8, fontSize: 15 }}>
        {children}
      </div>
      <style>{`
        ul { padding-left: 20px; margin-top: 8px; }
        li { margin-bottom: 6px; }
        p { margin-bottom: 10px; }
      `}</style>
    </div>
  );
}
