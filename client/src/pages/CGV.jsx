export default function CGV() {
  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Conditions Générales de Vente</h1>
          <p>CGV applicables aux locations et ventes MecaToolsLoc</p>
        </div>
      </div>
      <div className="page">
        <div className="container" style={{ maxWidth: 800 }}>

          <LegalSection title="1. Objet">
            <p>Les présentes Conditions Générales de Vente (CGV) régissent l'ensemble des transactions conclues entre <strong>MecaToolsLoc</strong> (ci-après « le Vendeur ») et tout client (ci-après « le Client ») pour la location et la vente d'outillage professionnel.</p>
            <p>Toute commande passée sur le site implique l'acceptation pleine et entière des présentes CGV.</p>
          </LegalSection>

          <LegalSection title="2. Produits et services">
            <p>MecaToolsLoc propose :</p>
            <ul>
              <li><strong>La location de matériel :</strong> mise à disposition temporaire d'outillage professionnel pour une durée définie.</li>
              <li><strong>La vente de matériel :</strong> cession définitive d'outillage professionnel.</li>
            </ul>
            <p>Les descriptions, photos et tarifs présents sur le site sont donnés à titre indicatif et peuvent être modifiés sans préavis.</p>
          </LegalSection>

          <LegalSection title="3. Tarifs">
            <p>Les prix sont indiqués en euros TTC. MecaToolsLoc se réserve le droit de modifier ses tarifs à tout moment, les prix applicables étant ceux en vigueur au moment de la commande.</p>
            <p><strong>Remise retrait sur place :</strong> une remise de 10 % est accordée au Client qui récupère le matériel directement à notre adresse (3 rue de la Guadeloupe, Moufia 97490 Saint-Denis).</p>
          </LegalSection>

          <LegalSection title="4. Livraison">
            <p>La livraison est assurée sur l'île de La Réunion. Les frais sont calculés automatiquement selon la distance entre le domicile du Client et notre entrepôt :</p>
            <ul>
              <li>0 – 15 km : 14,99 € par trajet</li>
              <li>16 – 35 km : 24,99 € par trajet</li>
              <li>36 – 50 km : 39,99 € par trajet</li>
              <li>50 km et plus : 49,99 € par trajet</li>
            </ul>
            <p>Le Client choisit librement s'il souhaite la livraison aller uniquement, le retour uniquement, ou les deux trajets. Chaque trajet est facturé séparément au tarif de la zone.</p>
            <p><strong>Restriction location :</strong> la livraison des articles en location est limitée à 15 km. Au-delà, le retrait sur place est requis.</p>
            <p>Les délais de livraison sont donnés à titre indicatif. MecaToolsLoc ne pourra être tenu responsable de retards dus à des circonstances indépendantes de sa volonté.</p>
          </LegalSection>

          <LegalSection title="5. Commande et paiement">
            <p>Toute commande est ferme et définitive après confirmation du paiement. Le paiement s'effectue en ligne par carte bancaire (Visa, Mastercard, CB) via un système sécurisé SSL.</p>
            <p>MecaToolsLoc ne stocke aucune donnée bancaire. Les transactions sont traitées par un prestataire de paiement certifié PCI-DSS.</p>
          </LegalSection>

          <LegalSection title="6. Chèque de caution (Location)">
            <p>Pour toute location, un chèque de caution est demandé. Ce chèque de caution :</p>
            <ul>
              <li>Est signé en ligne via un contrat électronique sécurisé</li>
              <li><strong>Ne bloque pas les fonds</strong> sur le compte bancaire du Client</li>
              <li>Est encaissé uniquement en cas de dommage, perte ou non-restitution du matériel dans les délais convenus</li>
              <li>Est restitué (annulé) automatiquement à la fin de la période de location, si le matériel est rendu en bon état</li>
            </ul>
            <p>Le montant de la caution est précisé pour chaque article et varie selon la valeur du matériel loué.</p>
          </LegalSection>

          <LegalSection title="7. Contrat de location">
            <p>Chaque location fait l'objet d'un contrat en bonne et due forme, signé électroniquement par le Client avant la mise à disposition du matériel. Ce contrat précise :</p>
            <ul>
              <li>La durée de la location et les dates de début/fin</li>
              <li>Le descriptif précis du matériel loué</li>
              <li>Le montant de la caution et les conditions d'encaissement</li>
              <li>Les conditions de restitution et l'état du matériel</li>
              <li>Les responsabilités du Client pendant la période de location</li>
            </ul>
          </LegalSection>

          <LegalSection title="8. Obligations du locataire">
            <p>Le Client s'engage à :</p>
            <ul>
              <li>Utiliser le matériel conformément à sa destination et dans le respect des règles de sécurité</li>
              <li>Restituer le matériel en bon état, propre et complet à la date convenue</li>
              <li>Signaler immédiatement tout incident ou dommage survenu pendant la location</li>
              <li>Ne pas sous-louer ou prêter le matériel à un tiers sans accord préalable</li>
            </ul>
            <p>En cas de dommage, perte ou vol, le Client sera tenu responsable et la caution pourra être encaissée. Des frais supplémentaires pourront être facturés si les dommages excèdent le montant de la caution.</p>
          </LegalSection>

          <LegalSection title="9. Rétractation">
            <p>Conformément à l'article L.221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux contrats de location pour une date ou période déterminée. Pour les achats, le droit de rétractation de 14 jours s'applique pour tout produit non utilisé et retourné dans son emballage d'origine.</p>
          </LegalSection>

          <LegalSection title="10. Responsabilité">
            <p>MecaToolsLoc garantit que le matériel loué ou vendu est en bon état de fonctionnement au moment de la mise à disposition. La responsabilité de MecaToolsLoc ne saurait être engagée pour tout dommage résultant d'une mauvaise utilisation du matériel.</p>
          </LegalSection>

          <LegalSection title="11. Litiges">
            <p>En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux compétents du ressort de Saint-Denis de La Réunion seront saisis. Le droit français est applicable.</p>
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
