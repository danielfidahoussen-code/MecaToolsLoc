# Notes pour Claude

## Rappels permanents — à faire à chaque conversation tant que non résolus

### Intégration Swikly (caution en ligne)
Daniel veut une intégration automatique complète de Swikly (dépôt de garantie/caution en ligne) : à chaque réservation, le site doit créer et envoyer automatiquement une demande de caution Swikly au client.

- Il est en train de faire les démarches d'inscription chez Swikly (compte + clé API).
- Rappelle-lui à chaque conversation de finir ça et de m'envoyer : sa clé API (idéalement une clé test/sandbox d'abord) et leur documentation développeur (PDF, capture d'écran, ou copier-coller — je ne peux pas accéder à swikly.com ni ses sous-domaines depuis cet environnement, bloqué par le proxy).
- Une fois reçu, construire l'intégration (probablement dans server/routes/car-reservations.js et/ou server/routes/stripe.js, au moment de la confirmation de réservation) pour créer la demande de caution automatiquement, et mettre à jour les textes du site (CGV, contrats, emails) qui mentionnent la caution prise "en personne".
- Une fois fait et poussé, supprime cette section du fichier CLAUDE.md.
