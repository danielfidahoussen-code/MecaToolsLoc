export default function CGV() {
  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Conditions Générales de Vente</h1>
          <p>CGV applicables aux locations et ventes PrestoLocation</p>
        </div>
      </div>
      <div className="page">
        <div className="container" style={{ maxWidth: 800 }}>

          <LegalSection title="1. Objet">
            <p>Les présentes Conditions Générales de Vente (CGV) régissent l'ensemble des transactions conclues entre la société <strong>PrestoLocation</strong> (SAS, société en cours de formation, siège 3B rue de la Guadeloupe, Moufia, 97490 Saint-Denis) (ci-après « le Vendeur »), et tout client (ci-après « le Client ») pour la location et la vente d'outillage.</p>
            <p>Toute commande passée sur le site implique l'acceptation pleine et entière des présentes CGV.</p>
          </LegalSection>

          <LegalSection title="2. Produits et services">
            <p>PrestoLocation propose :</p>
            <ul>
              <li><strong>La location de matériel :</strong> mise à disposition temporaire d'outillage pour une durée définie.</li>
              <li><strong>La vente de matériel :</strong> cession définitive d'outillage.</li>
            </ul>
            <p>Les descriptions et photos des produits sont fournies avec le plus grand soin. Le Vendeur s'efforce d'en assurer l'exactitude, sans que d'éventuelles erreurs ou omissions puissent engager sa responsabilité.</p>
          </LegalSection>

          <LegalSection title="3. Tarifs">
            <p>Les prix sont indiqués en euros toutes taxes comprises (TTC). Le prix applicable à une commande est celui affiché sur le site au moment de la validation de la commande par le Client. Le Vendeur peut faire évoluer ses tarifs à tout moment, sans que cela n'affecte les commandes déjà validées.</p>
            <p>Le montant total dû (produits + frais de livraison éventuels) est présenté au Client avant la validation définitive de sa commande.</p>
            <p><strong>Remise retrait sur place :</strong> une remise de 10 % est accordée au Client qui récupère le matériel directement à notre adresse (3B rue de la Guadeloupe, Moufia, 97490 Saint-Denis).</p>
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
            <p>Sauf indication contraire au moment de la commande, le matériel est livré ou mis à disposition dans un délai maximum de <strong>30 jours</strong> à compter de la validation du paiement (art. L.216-1 du Code de la consommation). En cas de dépassement de ce délai et après mise en demeure restée infructueuse, le Client peut annuler sa commande et être remboursé.</p>
          </LegalSection>

          <LegalSection title="5. Commande et paiement">
            <p>Toute commande est ferme et définitive après confirmation du paiement. Le paiement s'effectue en ligne par carte bancaire (Visa, Mastercard, CB) via un système sécurisé SSL.</p>
            <p>PrestoLocation ne stocke aucune donnée bancaire. Les transactions sont traitées par un prestataire de paiement certifié PCI-DSS.</p>
          </LegalSection>

          <LegalSection title="6. Caution (Location)">
            <p>Pour toute location, une caution (dépôt de garantie) est demandée. Cette caution :</p>
            <ul>
              <li>Est constituée <strong>lors de la remise du matériel</strong>, par empreinte de carte bancaire, chèque non encaissé ou tout autre moyen convenu ;</li>
              <li><strong>Ne bloque pas les fonds</strong> sur le compte bancaire du Client : aucun montant n'est débité tant que le matériel est restitué en bon état ;</li>
              <li>N'est débitée ou encaissée qu'en cas de dommage, de perte, de vol ou de non-restitution du matériel dans les délais convenus, à hauteur du préjudice réellement subi ;</li>
              <li>Est libérée (empreinte annulée ou chèque restitué) à la fin de la période de location, dès lors que le matériel est rendu complet et en bon état.</li>
            </ul>
            <p>Le montant de la caution correspond à la valeur du matériel loué ; il est communiqué au Client lors de la remise du matériel. Si les dommages excèdent le montant de la caution, la différence pourra être facturée au Client.</p>
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

          <LegalSection title="9. Droit de rétractation (Achat)">
            <p>Conformément aux articles L.221-18 et suivants du Code de la consommation, le Client consommateur dispose d'un délai de <strong>14 jours</strong> à compter de la réception du produit pour exercer son droit de rétractation, sans avoir à motiver sa décision.</p>
            <p>Pour exercer ce droit, le Client informe le Vendeur de sa décision par une déclaration dénuée d'ambiguïté (courrier ou email à contact@prestolocation.re), le cas échéant au moyen du formulaire type de rétractation. Le produit doit ensuite être renvoyé dans un délai de 14 jours.</p>
            <p>Le Client peut manipuler et essayer le produit comme il pourrait le faire en magasin ; sa responsabilité n'est engagée qu'à raison de la <strong>dépréciation</strong> résultant de manipulations excédant ce qui est nécessaire pour établir la nature et les caractéristiques du bien.</p>
            <p><strong>Les frais de retour sont à la charge du Client.</strong> Le Vendeur rembourse le Client de la totalité des sommes versées, y compris les frais de livraison initiaux (hors frais supplémentaires liés à un mode de livraison plus coûteux choisi par le Client), au plus tard dans les 14 jours suivant la récupération du produit ou la preuve de son expédition.</p>
            <p>Conformément à l'article L.221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux contrats de <strong>location</strong> pour une date ou une période déterminée.</p>
          </LegalSection>

          <LegalSection title="10. Garanties légales (Achat)">
            <p>Indépendamment de toute garantie commerciale, le Vendeur reste tenu des garanties légales suivantes pour les produits vendus :</p>
            <ul>
              <li><strong>Garantie légale de conformité</strong> (art. L.217-3 et suivants du Code de la consommation) : le Client dispose d'un délai de <strong>2 ans</strong> à compter de la délivrance du bien pour agir ; il peut choisir entre la réparation ou le remplacement du bien, et bénéficie d'une présomption d'antériorité du défaut.</li>
              <li><strong>Garantie des vices cachés</strong> (art. 1641 et suivants du Code civil) : le Client peut obtenir la résolution de la vente ou une réduction du prix, dans un délai de 2 ans à compter de la découverte du vice.</li>
            </ul>
            <p>Pour toute mise en œuvre de ces garanties, le Client peut contacter le Vendeur à contact@prestolocation.re.</p>
          </LegalSection>

          <LegalSection title="11. Responsabilité">
            <p>Le Vendeur garantit que le matériel loué ou vendu est en bon état de fonctionnement au moment de la mise à disposition. Sa responsabilité ne saurait être engagée pour tout dommage résultant d'une mauvaise utilisation du matériel par le Client.</p>
          </LegalSection>

          <LegalSection title="12. Médiation et litiges">
            <p>En cas de litige, le Client adresse au préalable une réclamation écrite au Vendeur (contact@prestolocation.re). À défaut de résolution amiable, le Client consommateur peut recourir gratuitement à un médiateur de la consommation :</p>
            <ul>
              <li><strong>Médiateur désigné :</strong> [nom du médiateur à compléter] — [adresse / site du médiateur]</li>
              <li><strong>Plateforme européenne RLL :</strong> <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer">ec.europa.eu/consumers/odr</a></li>
            </ul>
            <p>À défaut d'accord amiable, les tribunaux compétents seront saisis. Le droit français est applicable.</p>
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
