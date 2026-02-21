// ── Main application ───────────────────────────────────────────────────────
(function () {
'use strict';

const DATA_URL = 'data/communes_drias.json';
const GEOM_URLS = [
  'data/communes.geojson',
  'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/communes.geojson'
];

let driasByInsee  = {};
let currentVarKey = 'drias_Inte';
let currentMode   = 'univar';
let geojsonLayer  = null;

// ── Init ───────────────────────────────────────────────────────────────────
async function init() {
  mapModule.initMap();
  setupUI();

  setLoadingText('Chargement des données DRIAS…');
  const driaData = await fetch(DATA_URL).then(r => r.json());
  mapModule.loadData(driaData);
  driaData.forEach(d => { driasByInsee[d.code_insee] = d; });

  setLoadingText('Chargement des géométries communes… (peut prendre quelques secondes)');
  let geomData = null;
  for (let i = 0; i < GEOM_URLS.length; i++) {
    try {
      const res = await fetch(GEOM_URLS[i]);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      geomData = await res.json();
      console.info('[TRACC] Géométries chargées depuis :', GEOM_URLS[i]);
      break;
    } catch(e) {
      console.warn('[TRACC] Source inaccessible :', GEOM_URLS[i], e.message);
    }
  }
  if (!geomData) {
    showOfflineWarning();
    hideLoading();
    return;
  }

  setLoadingText('Rendu cartographique…');
  renderGeoLayer(geomData);
  hideLoading();
  selectVariable('drias_Inte', 'univar');
}

// ── Rendu couche GeoJSON ───────────────────────────────────────────────────
function renderGeoLayer(geomData) {
  const renderer = L.canvas({ padding: 0.5 });

  geojsonLayer = L.geoJSON(geomData, {
    renderer,
    style: feature => {
      const insee = getInsee(feature);
      const drias = driasByInsee[insee];
      return {
        weight: 0.3,
        color: '#0f1923',
        opacity: 0.6,
        fillOpacity: 0.85,
        fillColor: drias ? getColor(drias, currentVarKey, currentMode) : '#2a3a4a'
      };
    },
    onEachFeature: (feature, layer) => {
      const insee = getInsee(feature);
      const drias = driasByInsee[insee];

      layer.on({
        mouseover(e) {
          const l = e.target;
          l.setStyle({ weight: 1.5, color: '#fff', fillOpacity: 1 });
          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) l.bringToFront();
          if (drias) {
            l.bindTooltip(buildTooltip(drias), { className: 'commune-tooltip', sticky: true }).openTooltip();
          }
        },
        mouseout(e) {
          geojsonLayer.resetStyle(e.target);
          e.target.closeTooltip();
        },
        click() {
          if (drias) showInfo(drias);
        }
      });
    }
  }).addTo(mapModule.map);

  mapModule.setLayer(geojsonLayer);

  // Diagnostic jointure
  let joined = 0, missing = 0;
  geojsonLayer.eachLayer(l => {
    if (driasByInsee[getInsee(l.feature)]) joined++; else missing++;
  });
  console.info('[TRACC] Communes avec données DRIAS :', joined, '/ sans correspondance :', missing);
}

function getInsee(feature) {
  const p = feature.properties;
  const raw = p.code || p.insee || p.code_insee || p.INSEE_COM || p.codgeo || '';
  // Normalisation Corse : 201xx → 2Axxx, 202xx → 2Bxxx
  if (/^201\d{2}$/.test(raw)) return '2A' + raw.slice(2);
  if (/^202\d{2}$/.test(raw)) return '2B' + raw.slice(2);
  return raw;
}

function buildTooltip(drias) {
  const varDef = VARIABLES.find(v => v.key === currentVarKey);
  let html = '<div class="tt-name">' + drias.nom_offici + '</div>';
  if (currentMode === 'bivar') {
    html += '<div>Intensité : <span class="tt-val">' + drias.drias_Inte.toFixed(1) + ' mm/j</span></div>';
    html += '<div>Fréquence : <span class="tt-val">' + drias['drias_Fré'].toFixed(1) + ' ép/an</span></div>';
  } else {
    const val = drias[currentVarKey];
    html += '<div class="tt-val">' + formatVal(val, currentVarKey) + ' ' + (varDef ? varDef.unit : '') + '</div>';
  }
  return html;
}

// ── Couleurs ───────────────────────────────────────────────────────────────
function getColor(drias, varKey, mode) {
  const stats = mapModule.statsCache;
  if (mode === 'bivar') {
    return getBivarColor(
      drias['drias_Inte'], drias['drias_Fré'],
      stats['drias_Inte'], stats['drias_Fré']
    );
  }
  const varDef = VARIABLES.find(v => v.key === varKey);
  const st = stats[varKey];
  return getColorForValue(drias[varKey], st, varDef.palette);
}

function refreshColors() {
  if (!geojsonLayer) return;
  geojsonLayer.eachLayer(layer => {
    const drias = driasByInsee[getInsee(layer.feature)];
    layer.setStyle({ fillColor: drias ? getColor(drias, currentVarKey, currentMode) : '#2a3a4a' });
  });
}

// ── Sélection variable ─────────────────────────────────────────────────────
function selectVariable(varKey, mode) {
  currentVarKey = varKey;
  currentMode   = mode;

  document.querySelectorAll('.var-card').forEach(el => {
    el.classList.remove('active', 'active-bivar');
    if (el.dataset.varkey === varKey) {
      el.classList.add(mode === 'bivar' ? 'active-bivar' : 'active');
    }
  });

  refreshColors();

  const varDef = VARIABLES.find(v => v.key === varKey);
  if (mode === 'bivar') {
    renderBivarLegend();
  } else {
    renderUnivarLegend(varDef, mapModule.statsCache[varKey]);
  }
  updateStats(varKey, mode);
}

// ── Mode toggle ────────────────────────────────────────────────────────────
function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
  });

  if (mode === 'bivar') {
    document.querySelectorAll('.var-card').forEach(el => el.classList.remove('active', 'active-bivar'));
    document.querySelectorAll('.var-card[data-bivar="true"]').forEach(el => el.classList.add('active-bivar'));
    refreshColors();
    renderBivarLegend();
    updateStats(null, 'bivar');
  } else {
    selectVariable(currentVarKey, 'univar');
  }
}

// ── Stats ──────────────────────────────────────────────────────────────────
function updateStats(varKey, mode) {
  const bar = document.getElementById('stats-bar');
  if (mode === 'bivar') {
    const si = mapModule.statsCache['drias_Inte'];
    const sf = mapModule.statsCache['drias_Fré'];
    bar.classList.add('visible');
    bar.innerHTML =
      '<div class="stats-title">Statistiques nationales</div>' +
      '<div class="stats-grid">' +
        '<div class="stat-item"><div class="sval">' + si.mean.toFixed(1) + '</div><div class="slbl">Intensité moy. (mm/j)</div></div>' +
        '<div class="stat-item"><div class="sval">' + si.max.toFixed(1) + '</div><div class="slbl">Intensité max.</div></div>' +
        '<div class="stat-item"><div class="sval">' + sf.mean.toFixed(1) + '</div><div class="slbl">Fréquence moy. (ép/an)</div></div>' +
      '</div>';
    return;
  }
  if (!varKey) { bar.classList.remove('visible'); return; }
  const st = mapModule.statsCache[varKey];
  const varDef = VARIABLES.find(v => v.key === varKey);
  bar.classList.add('visible');
  bar.innerHTML =
    '<div class="stats-title">Statistiques nationales — ' + varDef.label + '</div>' +
    '<div class="stats-grid">' +
      '<div class="stat-item"><div class="sval">' + formatVal(st.min, varKey) + '</div><div class="slbl">Min</div></div>' +
      '<div class="stat-item"><div class="sval">' + formatVal(st.mean, varKey) + '</div><div class="slbl">Moyenne</div></div>' +
      '<div class="stat-item"><div class="sval">' + formatVal(st.max, varKey) + '</div><div class="slbl">Max</div></div>' +
    '</div>';
}

// ── Panneau commune ────────────────────────────────────────────────────────
function showInfo(drias) {
  const panel = document.getElementById('info-panel');
  panel.classList.add('visible');
  document.getElementById('info-name').textContent = drias.nom_offici;
  document.getElementById('info-insee').textContent =
    'Code INSEE : ' + drias.code_insee + ' · Population : ' +
    (drias.population ? drias.population.toLocaleString('fr-FR') : 'N/A') + ' hab.';

  const rows = VARIABLES.map(v => {
    const val = drias[v.key];
    const highlight = currentMode === 'bivar' && v.isBivar;
    return '<div class="info-row">' +
      '<span class="lbl">' + v.label + '</span>' +
      '<span class="val ' + (highlight ? 'highlight' : '') + '">' +
      (val !== undefined ? formatVal(val, v.key) : '–') + ' ' + v.unit +
      '</span></div>';
  }).join('');
  document.getElementById('info-rows').innerHTML = rows;
}

// ── Recherche ──────────────────────────────────────────────────────────────
function setupSearch() {
  const input   = document.getElementById('search-box');
  const results = document.getElementById('search-results');

  input.addEventListener('input', function() {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) { results.style.display = 'none'; return; }

    // Lecture dynamique : mapModule.allData est rempli après loadData()
    const matches = mapModule.allData
      .filter(d => d.nom_offici.toLowerCase().includes(q) || d.code_insee.startsWith(q))
      .slice(0, 8);

    if (!matches.length) { results.style.display = 'none'; return; }

    results.style.display = 'block';
    results.innerHTML = matches.map(d =>
      '<div class="search-item" data-insee="' + d.code_insee + '">' +
      d.nom_offici + ' <span class="dept">· ' + d.code_insee.slice(0, 2) + '</span></div>'
    ).join('');

    results.querySelectorAll('.search-item').forEach(el => {
      el.addEventListener('click', function() {
        input.value = '';
        results.style.display = 'none';
        zoomToCommune(el.dataset.insee);
      });
    });
  });

  document.addEventListener('click', function(e) {
    if (!results.contains(e.target) && e.target !== input) results.style.display = 'none';
  });
}

function zoomToCommune(insee) {
  if (!geojsonLayer) return;
  geojsonLayer.eachLayer(function(layer) {
    if (getInsee(layer.feature) !== insee) return;
    const drias = driasByInsee[insee];
    const bounds = layer.getBounds ? layer.getBounds() : null;
    if (bounds) mapModule.map.fitBounds(bounds, { maxZoom: 12, padding: [60, 60] });
    layer.setStyle({ weight: 2.5, color: '#fff', fillOpacity: 1 });
    if (drias) showInfo(drias);
    setTimeout(function() { geojsonLayer.resetStyle(layer); }, 3000);
  });
}

// ── UI setup ───────────────────────────────────────────────────────────────
function setupUI() {
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
  });

  document.querySelectorAll('.var-card').forEach(card => {
    card.addEventListener('click', () => {
      const varKey  = card.dataset.varkey;
      const isBivar = card.dataset.bivar === 'true';
      if (isBivar) {
        setMode('bivar');
      } else {
        if (currentMode !== 'univar') setMode('univar');
        selectVariable(varKey, 'univar');
      }
    });
  });

  // Burger mobile
  const burger  = document.getElementById('burger');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay-close');
  burger.addEventListener('click', () => {
    const open = sidebar.classList.toggle('open');
    overlay.style.display = open ? 'block' : 'none';
  });
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.style.display = 'none';
  });

  setupSearch();
}

// ── Loading ────────────────────────────────────────────────────────────────
function setLoadingText(txt) {
  const el = document.querySelector('.loading-text');
  if (el) el.textContent = txt;
}

function hideLoading() {
  const el = document.getElementById('loading');
  if (!el) return;
  el.classList.add('hidden');
  setTimeout(() => el.remove(), 600);
}

function showOfflineWarning() {
  const el = document.getElementById('loading');
  if (!el) return;
  el.innerHTML =
    '<div style="text-align:center;padding:30px;max-width:420px">' +
    '<div style="font-size:2.5rem;margin-bottom:16px">⚠️</div>' +
    '<h2 style="margin-bottom:10px;color:#fff">Géométries inaccessibles</h2>' +
    '<p style="color:var(--muted);line-height:1.7">' +
    'Impossible de charger les contours communaux.<br><br>' +
    'Solution : placez un fichier <code>communes.geojson</code> dans <code>data/</code> ' +
    'et commitez-le dans votre dépôt GitHub.' +
    '</p></div>';
}

// ── Start ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);

})();
