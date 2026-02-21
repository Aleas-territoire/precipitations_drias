#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Script d'initialisation du dépôt GitHub
# Usage : ./init-repo.sh <votre-username-github>
# ─────────────────────────────────────────────────────────────────────────────

set -e

USERNAME="${1:-votre-username}"
REPO="tracc-pluies-intenses"
REMOTE="https://github.com/${USERNAME}/${REPO}.git"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Initialisation du dépôt TRACC Pluies Intenses"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Init git
git init
git add .
git commit -m "🌧️ Initial commit — TRACC +4°C Pluies Intenses

Application cartographique responsive pour visualiser les projections
de pluies intenses du scénario +4°C de la TRACC pour les communes de France.

Fonctionnalités :
- Choroplèthe communale (35 417 communes)
- 6 variables DRIAS (cumuls saisonniers, intensité, fréquence)
- Mode bivarié Intensité × Fréquence
- Recherche de commune
- Design responsive dark theme
- Déploiement GitHub Pages via Actions"

git branch -M main

echo ""
echo "📋 Étapes suivantes :"
echo ""
echo "1. Créez le dépôt sur GitHub : https://github.com/new"
echo "   Nom : ${REPO}"
echo "   Visibilité : Public (requis pour GitHub Pages gratuit)"
echo ""
echo "2. Poussez le code :"
echo "   git remote add origin ${REMOTE}"
echo "   git push -u origin main"
echo ""
echo "3. Activez GitHub Pages :"
echo "   Settings → Pages → Source : GitHub Actions"
echo ""
echo "4. Votre app sera disponible sur :"
echo "   https://${USERNAME}.github.io/${REPO}/"
echo ""
echo "✅ Dépôt local initialisé avec succès !"
