# Notes pour Claude

## Rappels permanents — à faire à chaque conversation tant que non résolus

### Barème des franchises (location de véhicules)
La page `/contrats-et-franchises` (client/src/pages/ContratsEtFranchises.jsx) a une section "Barème des franchises" avec un encadré provisoire — les montants réels n'ont pas encore été fournis par Daniel.

- Rappelle-lui à chaque conversation de donner les montants de franchise (par véhicule ou par catégorie, + option de rachat/réduction de franchise s'il y en a une) s'il ne l'a pas encore fait.
- Une fois reçus, remplace l'encadré provisoire par un vrai tableau des franchises dans `ContratsEtFranchises.jsx`, et mets à jour la mention correspondante dans `VEHICLE_CGL_TEXT` (client/src/data/legalTexts.js, article 13) si besoin.
- Une fois fait et poussé, supprime cette section du fichier CLAUDE.md.
