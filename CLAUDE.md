# Notes pour Claude

## Rappel permanent — à faire à chaque conversation tant que non résolu

Daniel a son propre contrat de location de véhicule (papier, utilisé en vrai) et veut qu'on remplace le texte CGL généré par Claude actuellement affiché sur le site par le sien.

- Rappelle-lui à chaque conversation d'envoyer ce contrat s'il ne l'a pas encore fait.
- Une fois reçu, remplace le contenu de la constante `VEHICLE_CGL_TEXT` dans `client/src/pages/CGV.jsx` (section "Annexe — Conditions Générales de Location de Véhicules (CGL)") par le texte de son contrat.
- Une fois le remplacement fait et poussé, supprime cette section du fichier CLAUDE.md.
