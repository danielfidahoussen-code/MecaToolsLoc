export default function Confidentialite() {
  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Politique de confidentialité</h1>
          <p>Comment nous traitons et protégeons vos données personnelles</p>
        </div>
      </div>
      <div className="page">
        <div className="container" style={{ maxWidth: 800 }}>

          <LegalSection title="1. Responsable du traitement">
            <p>Le responsable du traitement des données personnelles collectées via ce site est :</p>
            <ul>
              <li><strong>PRESTO EQUIPEMENT</strong> (SAS), exploitant les enseignes LVTools et PrestoLoc</li>
              <li>3B rue de la Guadeloupe, Moufia, 97490 Saint-Denis, La Réunion</li>
              <li>SIREN 851 826 537</li>
              <li>Téléphone : 06 93 83 96 54</li>
              <li>Email : contact@lvtools.re</li>
            </ul>
          </LegalSection>

          <LegalSection title="2. Données collectées">
            <p>Dans le cadre de l'utilisation du site et de la passation de commandes, nous collectons les données suivantes :</p>
            <ul>
              <li><strong>Données d'identification :</strong> nom, prénom</li>
              <li><strong>Coordonnées :</strong> adresse email, numéro de téléphone, adresse de livraison</li>
              <li><strong>Données de commande :</strong> articles commandés, montants, mode de livraison, dates de location</li>
              <li><strong>Données de navigation :</strong> adresse IP, cookies techniques nécessaires au fonctionnement du site</li>
              <li><strong>Location de véhicules uniquement :</strong> numéro et photo du permis de conduire, date de naissance. Ces données, nécessaires à l'établissement du contrat de location, sont conservées de manière sécurisée et ne sont utilisées qu'à cette fin.</li>
            </ul>
            <p>Aucune donnée bancaire n'est stockée sur nos serveurs. Les paiements sont traités par notre prestataire de paiement certifié PCI-DSS (Stripe).</p>
          </LegalSection>

          <LegalSection title="3. Finalités du traitement">
            <p>Vos données sont collectées et traitées pour les finalités suivantes :</p>
            <ul>
              <li>Traitement et suivi de vos commandes (achat ou location)</li>
              <li>Gestion des contrats de location et des cautions</li>
              <li>Organisation des livraisons et retraits</li>
              <li>Communication relative à votre commande (confirmation, réclamation)</li>
              <li>Respect des obligations légales et comptables</li>
            </ul>
          </LegalSection>

          <LegalSection title="4. Base légale">
            <p>Le traitement de vos données est fondé sur :</p>
            <ul>
              <li>L'<strong>exécution du contrat</strong> : pour traiter vos commandes et locations</li>
              <li>L'<strong>obligation légale</strong> : pour la comptabilité et les obligations fiscales</li>
              <li>L'<strong>intérêt légitime</strong> : pour améliorer nos services</li>
            </ul>
          </LegalSection>

          <LegalSection title="5. Durée de conservation">
            <p>Vos données sont conservées pour les durées suivantes :</p>
            <ul>
              <li><strong>Données de commande :</strong> 5 ans à compter de la commande (obligation comptable)</li>
              <li><strong>Données de contrat de location :</strong> 5 ans à compter de la fin du contrat</li>
              <li><strong>Données de navigation :</strong> 13 mois maximum</li>
            </ul>
          </LegalSection>

          <LegalSection title="6. Destinataires et sous-traitants">
            <p>Vos données ne sont ni vendues ni cédées à des tiers à des fins commerciales. Elles sont traitées par PRESTO EQUIPEMENT et par les sous-traitants techniques strictement nécessaires au fonctionnement du service :</p>
            <ul>
              <li><strong>Stripe</strong> — traitement des paiements (certifié PCI-DSS)</li>
              <li><strong>Railway</strong> — hébergement du site et de la base de données</li>
              <li><strong>Cloudinary</strong> — hébergement des images (y compris, pour la location de véhicules, les photos de permis de conduire)</li>
              <li><strong>OpenStreetMap / Nominatim</strong> — calcul de la distance de livraison à partir de l'adresse saisie</li>
            </ul>
            <p><strong>Transferts hors Union européenne :</strong> certains de ces prestataires (notamment Railway, Stripe et Cloudinary) sont susceptibles d'héberger ou de traiter des données en dehors de l'Union européenne, notamment aux États-Unis. Ces transferts sont encadrés par des garanties appropriées (clauses contractuelles types de la Commission européenne ou mécanismes équivalents).</p>
            <p>Vos données peuvent également être communiquées aux autorités compétentes en cas d'obligation légale.</p>
          </LegalSection>

          <LegalSection title="7. Vos droits">
            <p>Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez des droits suivants :</p>
            <ul>
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
              <li><strong>Droit de rectification :</strong> corriger des données inexactes</li>
              <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
              <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
              <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
              <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
            </ul>
            <p>Pour exercer ces droits, contactez-nous à : <strong>contact@lvtools.re</strong></p>
            <p>Vous avez également le droit d'introduire une réclamation auprès de la <strong>CNIL</strong> (Commission Nationale de l'Informatique et des Libertés) — <em>cnil.fr</em>.</p>
          </LegalSection>

          <LegalSection title="8. Cookies">
            <p>Le site utilise des cookies techniques strictement nécessaires au fonctionnement (session, panier). Aucun cookie de tracking publicitaire ou analytique tiers n'est déposé sans votre consentement.</p>
          </LegalSection>

          <LegalSection title="9. Sécurité">
            <p>LVTools met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou divulgation. Les données transmises lors du paiement sont chiffrées via le protocole SSL.</p>
          </LegalSection>

          <LegalSection title="10. Modifications">
            <p>La présente politique de confidentialité peut être modifiée à tout moment. Nous vous invitons à la consulter régulièrement. La date de dernière mise à jour est indiquée ci-dessous.</p>
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
