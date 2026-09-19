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
            <p>Les présentes Conditions Générales de Vente (CGV) régissent l'ensemble des transactions conclues entre la société <strong>PrestoLocation</strong> (SARL au capital de 1 €, SIREN 109 850 941, RCS Saint-Denis de La Réunion, siège 3 rue de la Guadeloupe, Sainte-Clotilde, 97490 Saint-Denis) (ci-après « le Vendeur »), et tout client (ci-après « le Client ») pour la location et la vente d'outillage.</p>
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
            <p>Les prix sont indiqués en euros. PrestoLocation bénéficie de la franchise en base de TVA (article 293 B du Code général des impôts) : les prix affichés ne comportent donc pas de TVA. Le prix applicable à une commande est celui affiché sur le site au moment de la validation de la commande par le Client. Le Vendeur peut faire évoluer ses tarifs à tout moment, sans que cela n'affecte les commandes déjà validées.</p>
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

          <LegalSection title="6. Acompte et annulation (Location)">
            <p>Pour toute réservation de location (outillage ou véhicule), un <strong>acompte de 20 % du montant total</strong> est demandé en ligne au moment de la réservation. Le solde, soit 80 % du montant total, est réglé en personne lors de la remise du matériel ou du véhicule.</p>
            <p>Le Client peut annuler sa réservation à tout moment avant la date de début de location prévue au contrat :</p>
            <ul>
              <li><strong>Annulation à 2 jours ou plus avant le début de la location :</strong> l'acompte est intégralement remboursé.</li>
              <li><strong>Annulation à moins de 2 jours avant le début de la location :</strong> l'acompte reste acquis à PrestoLocation et n'est pas remboursé.</li>
            </ul>
            <p>L'annulation s'effectue via le lien dédié fourni dans l'email de confirmation de réservation. Le remboursement, lorsqu'il est dû, est effectué sur le moyen de paiement utilisé lors de la réservation, dans un délai habituel de quelques jours ouvrés.</p>
          </LegalSection>

          <LegalSection title="7. Caution (Location)">
            <p>Pour toute location, une caution (dépôt de garantie) est demandée. Cette caution :</p>
            <ul>
              <li>Est constituée <strong>lors de la remise du matériel</strong>, par empreinte de carte bancaire, chèque non encaissé ou tout autre moyen convenu ;</li>
              <li><strong>Ne bloque pas les fonds</strong> sur le compte bancaire du Client : aucun montant n'est débité tant que le matériel est restitué en bon état ;</li>
              <li>N'est débitée ou encaissée qu'en cas de dommage, de perte, de vol ou de non-restitution du matériel dans les délais convenus, à hauteur du préjudice réellement subi ;</li>
              <li>Est libérée (empreinte annulée ou chèque restitué) à la fin de la période de location, dès lors que le matériel est rendu complet et en bon état.</li>
            </ul>
            <p>Le montant de la caution correspond à la valeur du matériel loué ; il est communiqué au Client lors de la remise du matériel. Si les dommages excèdent le montant de la caution, la différence pourra être facturée au Client.</p>
          </LegalSection>

          <LegalSection title="8. Contrat de location">
            <p>Chaque location fait l'objet d'un contrat en bonne et due forme, signé par le Client sur place, lors de la remise du matériel ou du véhicule. Ce contrat précise :</p>
            <ul>
              <li>La durée de la location et les dates de début/fin</li>
              <li>Le descriptif précis du matériel loué</li>
              <li>Le montant de la caution et les conditions d'encaissement</li>
              <li>Les conditions de restitution et l'état du matériel</li>
              <li>Les responsabilités du Client pendant la période de location</li>
            </ul>
          </LegalSection>

          <LegalSection title="9. Obligations du locataire">
            <p>Le Client s'engage à :</p>
            <ul>
              <li>Utiliser le matériel conformément à sa destination et dans le respect des règles de sécurité</li>
              <li>Restituer le matériel en bon état, propre et complet à la date convenue</li>
              <li>Signaler immédiatement tout incident ou dommage survenu pendant la location</li>
              <li>Ne pas sous-louer ou prêter le matériel à un tiers sans accord préalable</li>
            </ul>
            <p>En cas de dommage, perte ou vol, le Client sera tenu responsable et la caution pourra être encaissée. Des frais supplémentaires pourront être facturés si les dommages excèdent le montant de la caution.</p>
          </LegalSection>

          <LegalSection title="10. Droit de rétractation (Achat)">
            <p>Conformément aux articles L.221-18 et suivants du Code de la consommation, le Client consommateur dispose d'un délai de <strong>14 jours</strong> à compter de la réception du produit pour exercer son droit de rétractation, sans avoir à motiver sa décision.</p>
            <p>Pour exercer ce droit, le Client informe le Vendeur de sa décision par une déclaration dénuée d'ambiguïté (courrier ou email à contact@prestolocation.re), le cas échéant au moyen du formulaire type de rétractation. Le produit doit ensuite être renvoyé dans un délai de 14 jours.</p>
            <p>Le Client peut manipuler et essayer le produit comme il pourrait le faire en magasin ; sa responsabilité n'est engagée qu'à raison de la <strong>dépréciation</strong> résultant de manipulations excédant ce qui est nécessaire pour établir la nature et les caractéristiques du bien.</p>
            <p><strong>Les frais de retour sont à la charge du Client.</strong> Le Vendeur rembourse le Client de la totalité des sommes versées, y compris les frais de livraison initiaux (hors frais supplémentaires liés à un mode de livraison plus coûteux choisi par le Client), au plus tard dans les 14 jours suivant la récupération du produit ou la preuve de son expédition.</p>
            <p>Conformément à l'article L.221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux contrats de <strong>location</strong> pour une date ou une période déterminée.</p>
          </LegalSection>

          <LegalSection title="11. Garanties légales (Achat)">
            <p>Indépendamment de toute garantie commerciale, le Vendeur reste tenu des garanties légales suivantes pour les produits vendus :</p>
            <ul>
              <li><strong>Garantie légale de conformité</strong> (art. L.217-3 et suivants du Code de la consommation) : le Client dispose d'un délai de <strong>2 ans</strong> à compter de la délivrance du bien pour agir ; il peut choisir entre la réparation ou le remplacement du bien, et bénéficie d'une présomption d'antériorité du défaut.</li>
              <li><strong>Garantie des vices cachés</strong> (art. 1641 et suivants du Code civil) : le Client peut obtenir la résolution de la vente ou une réduction du prix, dans un délai de 2 ans à compter de la découverte du vice.</li>
            </ul>
            <p>Pour toute mise en œuvre de ces garanties, le Client peut contacter le Vendeur à contact@prestolocation.re.</p>
          </LegalSection>

          <LegalSection title="12. Responsabilité">
            <p>Le Vendeur garantit que le matériel loué ou vendu est en bon état de fonctionnement au moment de la mise à disposition. Sa responsabilité ne saurait être engagée pour tout dommage résultant d'une mauvaise utilisation du matériel par le Client.</p>
          </LegalSection>

          <LegalSection title="13. Médiation et litiges">
            <p>En cas de litige, le Client adresse au préalable une réclamation écrite au Vendeur (contact@prestolocation.re). À défaut de résolution amiable, le Client consommateur peut recourir gratuitement à un médiateur de la consommation :</p>
            <ul>
              <li><strong>Médiateur désigné :</strong> [nom du médiateur à compléter] — [adresse / site du médiateur]</li>
              <li><strong>Plateforme européenne RLL :</strong> <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer">ec.europa.eu/consumers/odr</a></li>
            </ul>
            <p>À défaut d'accord amiable, les tribunaux compétents seront saisis. Le droit français est applicable.</p>
          </LegalSection>

          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary)', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid var(--gray-200)' }}>
              Annexe — Conditions Générales de Location de Véhicules (CGL)
            </h2>
            <p style={{ color: 'var(--gray-600)', lineHeight: 1.8, fontSize: 15, marginBottom: 14 }}>
              Ce texte est fourni <strong>à titre informatif</strong>. Pour toute location de véhicule, le contrat papier signé par le Client sur place, lors de la remise du véhicule, fait foi.
            </p>
            <div style={{ background: 'var(--light)', borderRadius: 10, padding: '16px 18px', fontSize: 13, lineHeight: 1.8, color: 'var(--gray-700)', whiteSpace: 'pre-wrap', border: '1px solid var(--gray-200)' }}>
              {VEHICLE_CGL_TEXT}
            </div>
          </div>

          <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 40 }}>
            Dernière mise à jour : juillet 2026
          </p>
        </div>
      </div>
    </div>
  );
}

const VEHICLE_CGL_TEXT = `CONDITIONS GÉNÉRALES DE LOCATION (CGL) – LOCATION DE VÉHICULE SANS CHAUFFEUR
PrestoLocation, SARL au capital de 1 €, SIREN 109 850 941, RCS Saint-Denis de La Réunion, siège social 3 rue de la Guadeloupe, Sainte-Clotilde, 97490 Saint-Denis (ci-après "PrestoLoc" ou "le Loueur") — Date : 22/01/2026

1) Objet – Champ d'application
Les présentes Conditions Générales de Location ("CGL") encadrent toute location de véhicule sans chauffeur conclue entre le Loueur et le client ("Locataire"). En signant le contrat de location/état des lieux, le Locataire reconnaît avoir pris connaissance des CGL et les accepter.

2) Définitions
"Véhicule" : véhicule loué + accessoires fournis (clés, documents, triangle, gilet, etc.).
"Franchise" : somme restant à charge du Locataire en cas de sinistre selon les conditions du contrat/assurance.
"Dépôt de garantie / Caution" : somme (ou préautorisation) destinée à couvrir frais, dommages, franchises, pénalités.
"État des lieux" : constat départ/retour (extérieur/intérieur, km, carburant, accessoires).

3) Conditions pour louer (admissibilité)
Le Locataire et tout conducteur autorisé doivent : (i) présenter un permis de conduire valide adapté au véhicule, (ii) une pièce d'identité valide, (iii) un justificatif de domicile si demandé, (iv) être en capacité de payer la location et la caution. Le Loueur peut refuser la remise du Véhicule si ces conditions ne sont pas remplies.

4) Conducteurs autorisés
Seules les personnes indiquées au contrat peuvent conduire. Tout ajout de conducteur doit être déclaré avant départ. Le Locataire reste responsable du Véhicule et des conducteurs autorisés.

5) Réservation – Paiement – Caution
Le prix comprend la location et les options indiquées au contrat. La caution est versée par (préautorisation CB / chèque / espèces / virement) selon le contrat. Le Loueur peut encaisser tout ou partie de la caution (ou la conserver/ajuster) pour couvrir : dommages, franchise, carburant manquant, kilomètres supplémentaires, nettoyage, retard, amendes/infractions, frais de dossier, immobilisation, remorquage, accessoires manquants, ou toute somme due.

5 bis) Acompte et annulation
Un acompte de 20 % du montant total est réglé en ligne au moment de la réservation ; le solde (80 %) est réglé en personne lors de la remise du Véhicule. En cas d'annulation par le Locataire à 2 jours ou plus avant le début de la location, l'acompte est intégralement remboursé. En cas d'annulation à moins de 2 jours du début de la location, l'acompte reste acquis au Loueur et n'est pas remboursé. L'annulation s'effectue via le lien dédié communiqué dans l'email de confirmation.

6) Remise du Véhicule – État des lieux départ
Le Véhicule est remis avec un état des lieux départ (photos possibles) mentionnant km, carburant, et défauts visibles. Le Locataire doit vérifier immédiatement et signaler toute anomalie déterminante avant de quitter le lieu de départ ; à défaut, l'état des lieux départ fait foi.

7) Utilisation du Véhicule (interdictions essentielles)
Le Locataire s'engage à utiliser le Véhicule en "bon père de famille" (usage normal), et notamment à ne pas :
– sous-louer, prêter à un conducteur non autorisé, transporter des matières dangereuses illégales, participer à des courses/essais, conduite sur voies non adaptées (pistes/chemins) si non autorisé, surcharge, remorquage sans accord, usage professionnel intensif non déclaré, conduite sous alcool/stupéfiants, ou toute utilisation contraire au Code de la route.
Le Locataire s'engage à fermer le Véhicule, conserver les clés et papiers, et ne jamais laisser les clés à bord.

8) Kilométrage – Carburant
Le forfait kilométrique est celui indiqué au contrat (limité ou illimité). En cas de kilométrage limité, les kilomètres supplémentaires sont facturés selon le tarif indiqué au contrat. Carburant : sauf mention contraire, le niveau doit être rendu identique au départ (ou "plein/plein" si prévu). Tout carburant manquant est facturé selon la grille du Loueur + frais de service éventuels.

9) Entretien – Pannes – Voyants
Le Locataire doit surveiller les voyants (huile, température, etc.) et arrêter le véhicule en cas d'alerte critique. Les opérations d'entretien/ajouts (huile, liquide) ne se font qu'avec accord du Loueur sauf urgence avérée. En cas de panne, le Locataire contacte immédiatement le Loueur (et/ou l'assistance si fournie au contrat).

10) Assurance (socle) – Options
Le Véhicule est assuré au minimum en responsabilité civile (RC) et cette assurance est incluse dans le prix de la location. Le Loueur remet, sur demande, les justificatifs. Des garanties complémentaires peuvent être proposées (dommages, vol, conducteur, assistance) et restent optionnelles selon le contrat.

11) Sinistre / Accident (procédure obligatoire)
En cas d'accident, choc, vandalisme, bris de glace, ou tout dommage :
a) Sécuriser, appeler les secours si nécessaire.
b) Prévenir le Loueur immédiatement.
c) Remplir un constat amiable (même sans tiers si possible) + photos.
d) Ne pas reconnaître de responsabilité à la place des assureurs.
Sans constat/éléments permettant un recours contre un tiers identifié, la franchise peut rester entièrement à charge du Locataire selon le contrat.

12) Vol – Tentative de vol – Perte de clés
En cas de vol : dépôt de plainte immédiat + transmission au Loueur (récépissé). En cas de perte/vol des clés ou documents, des frais s'appliquent (reproduction clés, serrures, immobilisation, etc.). L'absence de respect de la procédure (plainte/justificatifs) peut entraîner la facturation selon la franchise/valeur du véhicule dans les limites contractuelles.

13) Franchise – Réduction de franchise (si option)
La franchise applicable est celle indiquée au contrat (variable selon catégorie). Une option de réduction/rachat de franchise peut être proposée au tarif indiqué. La réduction peut comporter une "franchise non rachetable" (restant à charge du Locataire) selon le tableau tarifaire. Rappel : les détériorations intérieures, brûlures, et dégâts aux pneumatiques peuvent rester à la charge du Locataire (hors cas couverts explicitement au contrat).

14) Restitution – Retard – Prolongation
Le Véhicule doit être rendu à la date/heure et au lieu convenus, avec accessoires et documents. Toute prolongation doit être validée par le Loueur avant l'échéance. En cas de retard non autorisé : facturation d'heures/jours supplémentaires + pénalités selon la grille du Loueur, et possibilité de déclaration du Véhicule comme "non restitué" si le Locataire reste injoignable.

15) État des lieux retour – Dommages – Nettoyage
L'état des lieux retour est réalisé au retour (photos possibles). Tout dommage non mentionné au départ est présumé survenu pendant la location, sauf preuve contraire. Nettoyage : si le véhicule est rendu anormalement sale (intérieur/extérieur), odeurs, poils, taches, sable, boue, etc., des frais de nettoyage peuvent être facturés selon la grille.

16) Infractions – Amendes – Frais de dossier
Le Locataire est responsable des infractions (stationnement, vitesse, péages, etc.) et des frais associés. Le Loueur peut transmettre les coordonnées du Locataire aux autorités et facturer des frais de traitement/dossier selon la grille.

17) Données personnelles (RGPD)
Les données sont utilisées pour gérer la réservation, le contrat, le dépôt de garantie, la relation client, la facturation, et le traitement des sinistres/infractions. Le Locataire dispose de droits d'accès/rectification/effacement dans les limites légales ; contact : contact@prestolocation.re

18) Réclamations – Service client
Réclamation écrite préalable obligatoire : contact@prestolocation.re — 3 B, Rue de la Guadeloupe, 97490 Saint-Denis, en décrivant les faits, date, véhicule, n° contrat et pièces.

19) Médiation de la consommation (obligatoire pour les pros)
En cas d'échec de la réclamation écrite, le Locataire (consommateur) peut saisir gratuitement un médiateur de la consommation dans les conditions légales (délai d'1 an après la réclamation écrite).

20) Loi applicable – Litiges
Les présentes CGL sont soumises au droit français. À défaut d'accord amiable (réclamation puis médiation le cas échéant), le litige relève des juridictions compétentes.

ANNEXES (remises ou affichées lors de la signature)
A1) Grille tarifaire (retard, km supp, carburant, nettoyage, accessoires)
A2) Tableau franchise / réduction franchise / franchise non rachetable
A3) État des lieux départ/retour + photos
A4) Politique RGPD simplifiée — contact@prestolocation.re`;

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
