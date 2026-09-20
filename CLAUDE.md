# Notes pour Claude

## Rappels permanents — à faire à chaque conversation tant que non résolus

### 1. Contrat de location véhicule réel
Daniel a son propre contrat de location de véhicule (papier, utilisé en vrai) et veut qu'on remplace le texte CGL généré par Claude actuellement affiché sur le site par le sien.

- Rappelle-lui à chaque conversation d'envoyer ce contrat s'il ne l'a pas encore fait.
- Une fois reçu, remplace le contenu de la constante `VEHICLE_CGL_TEXT` dans `client/src/data/legalTexts.js` (affichée sur la page `/contrats-et-franchises` et référencée depuis les CGV) par le texte de son contrat.
- Une fois le remplacement fait et poussé, supprime cette section du fichier CLAUDE.md.

### 2. Barème des franchises (location de véhicules)
La page `/contrats-et-franchises` (client/src/pages/ContratsEtFranchises.jsx) a une section "Barème des franchises" avec un encadré provisoire — les montants réels n'ont pas encore été fournis par Daniel.

- Rappelle-lui à chaque conversation de donner les montants de franchise (par véhicule ou par catégorie, + option de rachat/réduction de franchise s'il y en a une) s'il ne l'a pas encore fait.
- Une fois reçus, remplace l'encadré provisoire par un vrai tableau des franchises dans `ContratsEtFranchises.jsx`, et mets à jour la mention correspondante dans `VEHICLE_CGL_TEXT` (article 13) si besoin.
- Une fois fait et poussé, supprime cette section du fichier CLAUDE.md.
