// ── Map module ─────────────────────────────────────────────────────────────
// All state lives here inside the mapModule object — no top-level lets
// that could collide with app.js declarations.

window.mapModule = (function () {
  let _map        = null;
  let _layer      = null;
  let _statsCache = {};
  let _allData    = [];

  function initMap() {
    _map = L.map('map', {
      center: [46.5, 2.5],
      zoom: 6,
      zoomControl: true,
      preferCanvas: true
    });

    // Dark basemap (no labels)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
      opacity: 0.7
    }).addTo(_map);

    // Label overlay on top
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
      attribution: '',
      subdomains: 'abcd',
      maxZoom: 19,
      pane: 'shadowPane'
    }).addTo(_map);
  }

  function loadData(data) {
    _allData = data;
    VARIABLES.forEach(v => {
      _statsCache[v.key] = computeStats(data, v.key);
    });
  }

  return {
    initMap,
    loadData,
    get map()        { return _map; },
    get statsCache() { return _statsCache; },
    get allData()    { return _allData; },
    setLayer(layer)  { _layer = layer; },
    getLayer()       { return _layer; }
  };
})();
