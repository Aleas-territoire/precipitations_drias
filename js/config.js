// ── Variable definitions ───────────────────────────────────────────────────
const VARIABLES = [
  {
    key: 'drias_Cumu',
    label: 'Cumul annuel',
    desc: 'Précipitations totales annuelles projetées',
    unit: 'mm/an',
    palette: 'blues',
    category: 'cumuls'
  },
  {
    key: 'drias_Cu_1',
    label: 'Cumul hivernal',
    desc: 'Précipitations en saison froide (DJF)',
    unit: 'mm',
    palette: 'purples',
    category: 'cumuls'
  },
  {
    key: 'drias_Cu_2',
    label: 'Cumul printanier',
    desc: 'Précipitations au printemps (MAM)',
    unit: 'mm',
    palette: 'greens',
    category: 'cumuls'
  },
  {
    key: 'drias_Cu_3',
    label: 'Cumul estival',
    desc: 'Précipitations en été (JJA) — pluies convectives',
    unit: 'mm',
    palette: 'oranges',
    category: 'cumuls'
  },
  {
    key: 'drias_Inte',
    label: 'Intensité des pluies intenses',
    desc: 'Intensité maximale journalière projetée sous +4°C',
    unit: 'mm/j',
    palette: 'reds',
    category: 'intenses',
    isBivar: true,
    bivarRole: 'x'
  },
  {
    key: 'drias_Fré',
    label: 'Fréquence des pluies intenses',
    desc: "Nombre d'épisodes intenses projetés par an sous +4°C",
    unit: 'épisodes/an',
    palette: 'yellows',
    category: 'intenses',
    isBivar: true,
    bivarRole: 'y'
  }
];

// ── Color palettes (5 classes) ─────────────────────────────────────────────
const PALETTES = {
  blues:   ['#dce9f5','#9dc4e0','#5b9ec9','#2476b5','#084594'],
  purples: ['#eee5f4','#c5aede','#9970c1','#7441b5','#49006a'],
  greens:  ['#e5f5e0','#a1d99b','#41ab5d','#238b45','#005a32'],
  oranges: ['#feedde','#fdbe85','#fd8d3c','#e6550d','#a63603'],
  reds:    ['#fee5d9','#fc9272','#fb6a4a','#de2d26','#a50f15'],
  yellows: ['#ffffd4','#fed98e','#fe9929','#d95f0e','#993404']
};

// Bivariate 3x3 palette (intensity × frequency)
// Rows = frequency tertile (low→high), Cols = intensity tertile (low→high)
const BIVAR_COLORS = [
  ['#e8e8e8','#ace4e4','#5ac8c8'],  // freq: low
  ['#dfb0d6','#a5add3','#5698b9'],  // freq: mid
  ['#be64ac','#8c62aa','#3b4994']   // freq: high
];

// ── Quantile classification ────────────────────────────────────────────────
// Calcule les seuils de N quantiles égaux sur les valeurs triées.
// Retourne un tableau de (N-1) seuils internes, ex. pour N=5 :
//   [Q20, Q40, Q60, Q80]  → 5 classes [min–Q20[ [Q20–Q40[ ... [Q80–max]
function computeQuantileBreaks(sortedVals, nClasses) {
  const breaks = [];
  for (var i = 1; i < nClasses; i++) {
    var idx = Math.floor(sortedVals.length * i / nClasses);
    breaks.push(sortedVals[idx]);
  }
  return breaks;
}

// ── Compute stats + quantile breaks ───────────────────────────────────────
function computeStats(data, key) {
  var vals = data.map(function(d) { return d[key]; })
                 .filter(function(v) { return v !== null && v !== undefined; });
  vals.sort(function(a, b) { return a - b; });

  var n    = vals.length;
  var min  = vals[0];
  var max  = vals[n - 1];
  var mean = vals.reduce(function(s, v) { return s + v; }, 0) / n;
  var p5   = vals[Math.floor(n * 0.05)];
  var p95  = vals[Math.floor(n * 0.95)];

  // 5 classes (quintiles) pour la colorisation univariée
  var breaks5 = computeQuantileBreaks(vals, 5);
  // 3 classes (tertiles) pour la colorisation bivariée
  var breaks3 = computeQuantileBreaks(vals, 3);

  return { min: min, max: max, mean: mean, p5: p5, p95: p95,
           breaks5: breaks5, breaks3: breaks3 };
}

// ── Couleur univariée par classe de quantile ───────────────────────────────
// Affecte l'une des 5 couleurs de la palette selon la classe du quintile.
function getColorForValue(value, stats, palette) {
  var colors = PALETTES[palette];
  if (value === null || value === undefined) return '#333';
  var breaks = stats.breaks5;
  var cls = 0;
  for (var i = 0; i < breaks.length; i++) {
    if (value >= breaks[i]) cls = i + 1;
  }
  return colors[cls];
}

// ── Couleur bivariée par tertile (3×3) ────────────────────────────────────
function getBivarColor(inteVal, freqVal, inteStats, freqStats) {
  function tertile(val, stats) {
    var breaks = stats.breaks3;
    var cls = 0;
    for (var i = 0; i < breaks.length; i++) {
      if (val >= breaks[i]) cls = i + 1;
    }
    return cls; // 0, 1 ou 2
  }
  var ci = tertile(inteVal, inteStats);
  var cf = tertile(freqVal, freqStats);
  return BIVAR_COLORS[cf][ci];
}

// ── lerpColor (conservé pour usage éventuel) ──────────────────────────────
function lerpColor(a, b, t) {
  var ar = parseInt(a.slice(1,3),16), ag = parseInt(a.slice(3,5),16), ab = parseInt(a.slice(5,7),16);
  var br = parseInt(b.slice(1,3),16), bg = parseInt(b.slice(3,5),16), bb = parseInt(b.slice(5,7),16);
  var r  = Math.round(ar + (br-ar)*t);
  var g  = Math.round(ag + (bg-ag)*t);
  var bl = Math.round(ab + (bb-ab)*t);
  return '#' + r.toString(16).padStart(2,'0') + g.toString(16).padStart(2,'0') + bl.toString(16).padStart(2,'0');
}

window.VARIABLES    = VARIABLES;
window.PALETTES     = PALETTES;
window.BIVAR_COLORS = BIVAR_COLORS;
window.getColorForValue = getColorForValue;
window.getBivarColor    = getBivarColor;
window.computeStats     = computeStats;
window.lerpColor        = lerpColor;
