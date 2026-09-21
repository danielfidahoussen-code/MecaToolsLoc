# Notes pour Claude

## Rappels permanents — à faire à chaque conversation tant que non résolus

### Barème des franchises (location de véhicules)
La page `/contrats-et-franchises` a maintenant un vrai tableau "Réduisez votre franchise" (composant `FranchiseTable` dans `client/src/pages/ContratsEtFranchises.jsx`), sur le modèle demandé par Daniel (3 groupes de catégories × Franchise / Assurance supplémentaire par jour / Franchise non rachetable). Les montants sont encore `null` (affichés "à venir") — Daniel doit fournir les chiffres de son contrat d'assurance.

- Rappelle-lui à chaque conversation de donner ces montants (par catégorie ou groupe de catégories) s'il ne l'a pas encore fait.
- Une fois reçus, remplace les valeurs `null` dans la constante `FRANCHISE_TABLE` (en haut de `ContratsEtFranchises.jsx`) par les montants réels, et adapte les libellés de catégorie si besoin (le tableau utilise actuellement des catégories numérotées 1-2-3 / 4-5-6-7 / 8-9-10 sur le modèle qu'il a montré — à ajuster s'il utilise plutôt les catégories nommées du site : Citadine, Compacte, Hybride, SUV, etc.).
- Mets à jour la mention correspondante dans `VEHICLE_CGL_TEXT` (client/src/data/legalTexts.js, article 13) si besoin.
- Une fois fait et poussé, supprime cette section du fichier CLAUDE.md.
