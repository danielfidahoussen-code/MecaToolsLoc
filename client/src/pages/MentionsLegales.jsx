export default function MentionsLegales() {
  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Mentions légales</h1>
          <p>Informations légales relatives au site MecaToolsLoc</p>
        </div>
      </div>
      <div className="page">
        <div className="container" style={{ maxWidth: 800 }}>
          <LegalSection title="1. Éditeur du site">
            <p>Le site <strong>mecatoolsloc.re</strong> est édité par :</p>
            <ul>
              <li><strong>Raison sociale :</strong> MecaToolsLoc</li>
              <li><strong>Forme juridique :</strong> Entreprise individuelle</li>
              <li><strong>Adresse :</strong> 3 rue de la Guadeloupe, Moufia 97490 Saint-Denis, La Réunion</li>
              <li><strong>Téléphone :</strong> 06 93 83 96 54</li>
              <li><strong>Email :</strong> Locationautopresto@gmail.com</li>
            </ul>
          </LegalSection>

          <LegalSection title="2. Directeur de la publication">
            <p>Le directeur de la publication est le gérant de MecaToolsLoc.</p>
          </LegalSection>

          <LegalSection title="3. Hébergement">
            <p>Le site est hébergé par un prestataire d'hébergement web. Pour toute demande concernant l'hébergement, vous pouvez contacter MecaToolsLoc à l'adresse indiquée ci-dessus.</p>
          </LegalSection>

          <LegalSection title="4. Propriété intellectuelle">
            <p>L'ensemble des contenus présents sur ce site (textes, images, logos, icônes, etc.) est la propriété exclusive de MecaToolsLoc ou de ses partenaires, et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.</p>
            <p>Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sauf autorisation écrite préalable de MecaToolsLoc.</p>
          </LegalSection>

          <LegalSection title="5. Responsabilité">
            <p>MecaToolsLoc s'efforce d'assurer au mieux l'exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, MecaToolsLoc ne peut garantir l'exhaustivité et l'absence d'erreur des informations disponibles sur le site.</p>
            <p>MecaToolsLoc ne pourra être tenu responsable des dommages directs ou indirects résultant de l'utilisation de ce site ou des informations qui y sont contenues.</p>
          </LegalSection>

          <LegalSection title="6. Liens hypertextes">
            <p>Le site peut contenir des liens vers d'autres sites internet. MecaToolsLoc n'est pas responsable du contenu de ces sites tiers et ne peut être tenu responsable des dommages qui pourraient résulter de leur consultation.</p>
          </LegalSection>

          <LegalSection title="7. Droit applicable">
            <p>Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.</p>
          </LegalSection>

          <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 40 }}>
            Dernière mise à jour : juin 2025
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
