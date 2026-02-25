# 🌧️ TRACC +4°C — Pluies intenses par commune

Application cartographique responsive et pédagogique pour visualiser les projections de **pluies intenses** du scénario climatique **+4°C de la TRACC** pour les 35 000 communes de France métropolitaine.

---

## ✨ Fonctionnalités

### Carte interactive
- Navigation fluide (zoom, panoramique) grâce à **Leaflet.js** et un rendu Canvas optimisé
- Choroplèthe communale colorée selon la variable sélectionnée
- Infobulle au survol : nom de la commune + valeur de la variable
- Clic sur une commune → panneau de détail complet

### Variables disponibles
| Variable | Description | Unité |
|---|---|---|
| Cumul annuel | Précipitations totales projetées | mm/an |
| Cumul hivernal | Saison DJF | mm |
| Cumul printanier | Saison MAM | mm |
| Cumul estival | Saison JJA | mm |
| **Intensité des pluies intenses** | Max. journalier projeté | mm/j |
| **Fréquence des épisodes** | Nombre d'épisodes par an | ép/an |

### Modes de visualisation
- **Univarié** : palette de couleurs séquentielle pour chaque variable
- **Bivarié** ✦ : représentation combinée Intensité × Fréquence sur une grille 3×3 de couleurs (palette de Brewer)

### Interface
- Design responsive, utilisable sur mobile et desktop
- Recherche de commune par nom ou code INSEE
- Statistiques nationales (min, moyenne, max) dans la barre de stats
- Légende dynamique adaptée au mode sélectionné
- Panneau pédagogique expliquant la TRACC et les pluies intenses

---

## 🚀 Déploiement

### Option 1 : GitHub Pages (recommandé)
1. Forkez ce dépôt
2. Activez GitHub Pages sur la branche `main` (Settings → Pages)
3. L'app sera disponible sur `https://votre-username.github.io/tracc-pluies-intenses/`

### Option 2 : Serveur local (développement)
```bash
# Python
python3 -m http.server 8080

# Node.js
npx serve .

# PHP
php -S localhost:8080
```
Puis ouvrez `http://localhost:8080`

> ⚠️ Un serveur HTTP est obligatoire (même en local) pour charger le fichier JSON via `fetch()`.

---

## 📦 Structure du projet

```
tracc-pluies-intenses/
├── index.html              # Page principale
├── data/
│   └── communes_drias.json # Données DRIAS (35 417 communes)
├── js/
│   ├── config.js           # Variables, palettes, utilitaires couleurs
│   ├── legend.js           # Rendu des légendes (univarié + bivarié)
│   ├── map.js              # Module carte Leaflet
│   └── app.js              # Logique principale, chargement, UI
├── css/
│   └── style.css           # Styles (dark theme responsive)
└── README.md
```

---

## 🗺️ Sources de données

### Données climatiques
- **DRIAS** (Données et Ressources pour l'Information sur la vulnérabilité et l'Adaptation des territoires au changement climatique)
- Météo-France, 2024
- Scénario : **TRACC +4°C**
- Variables : cumuls saisonniers, intensité et fréquence des pluies intenses

### Géométries communales
Chargées dynamiquement depuis :
- [`france-geojson`](https://github.com/gregoiredavid/france-geojson) — GeoJSON simplifié des communes françaises

Pour une utilisation hors-ligne ou sur réseau restreint, téléchargez le fichier et placez-le dans `data/communes.geojson`, puis modifiez la constante `GEOM_URL` dans `js/app.js` :
```js
const GEOM_URL = 'data/communes.geojson';
```

### Fonds cartographiques
- Basemap sombre : [CartoDB Dark Matter](https://carto.com/basemaps/)

---

## 🎨 Choix de design

### Palettes univariées
| Variable | Palette |
|---|---|
| Cumul annuel | Blues |
| Cumul hivernal | Purples |
| Cumul printanier | Greens |
| Cumul estival | Oranges |
| Intensité | Reds |
| Fréquence | Yellow-Orange-Brown |

### Palette bivariée
Grille 3×3 inspirée de la palette de [Joshua Stevens](https://www.joshuastevens.net/cartography/make-a-bivariate-choropleth-map/) :
- **Violet foncé** (#3b4994) : forte intensité ET forte fréquence → risque maximal
- **Gris clair** (#e8e8e8) : faible intensité ET faible fréquence → risque minimal
- **Teal** (#5ac8c8) : forte intensité, faible fréquence (épisodes rares mais violents)
- **Rose** (#be64ac) : faible intensité, forte fréquence (épisodes fréquents mais modérés)

---

## 📖 Glossaire pédagogique

**TRACC** — *Trajectoires de Réchauffement de Référence pour l'Adaptation au Changement Climatique* : référentiel défini par le gouvernement français pour calibrer les politiques d'adaptation territoriale.

**Scénario +4°C** — Horizon de réchauffement le plus élevé de la TRACC, correspondant à l'absence de politiques d'atténuation ambitieuses. Basé sur RCP 8.5 / SSP5-8.5.

**Pluies intenses** — Épisodes de précipitations dépassant un seuil statistique élevé (souvent le 95e percentile de la distribution). Deux indicateurs complémentaires :
- **Intensité** : quantité de pluie lors de l'épisode le plus intense de l'année (mm/j)
- **Fréquence** : nombre d'épisodes intenses par an

---

## 🛠️ Technologies

- [Leaflet.js](https://leafletjs.com/) 1.9.4 — cartographie interactive
- Rendu Canvas (`L.canvas`) — performance avec 35 000 polygones
- CSS custom properties + Flexbox — responsive design
- Vanilla JS (pas de framework) — zéro dépendance de build

---

## 📄 Licence

- Code : MIT
- Données DRIAS : usage libre pour des applications non commerciales, avec mention de la source Météo-France/DRIAS

---

## 🗺️ Bundler les géométries en local (recommandé)

Pour éviter toute dépendance CORS à des sources externes, téléchargez le fichier GeoJSON et placez-le dans `data/` :

```bash
# Télécharger le fichier (~8 Mo simplifié)
curl -L "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/communes.geojson" \
     -o data/communes.geojson
```

L'app détecte automatiquement `data/communes.geojson` en priorité — aucune modification de code nécessaire.

> **Attention** : ne committez pas un fichier >100 Mo sur GitHub. Le fichier simplifié fait ~8 Mo, ce qui est dans les limites acceptables. Pour réduire davantage, vous pouvez utiliser [mapshaper](https://mapshaper.org/) pour simplifier la géométrie.
