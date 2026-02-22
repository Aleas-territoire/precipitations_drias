// ── Legend management ──────────────────────────────────────────────────────

function renderUnivarLegend(variable, stats) {
  var container   = document.getElementById('legend-container');
  var bivarLegend = document.getElementById('bivar-legend');
  bivarLegend.classList.remove('visible');

  var colors  = PALETTES[variable.palette];
  var breaks  = stats.breaks5;

  var intervals = [
    [stats.min,  breaks[0]],
    [breaks[0],  breaks[1]],
    [breaks[1],  breaks[2]],
    [breaks[2],  breaks[3]],
    [breaks[3],  stats.max]
  ];

  var items = intervals.map(function(iv, i) {
    var label;
    if (i === 0)
      label = '< ' + formatVal(iv[1], variable.key) + '\u00a0' + variable.unit;
    else if (i === intervals.length - 1)
      label = '\u2265 ' + formatVal(iv[0], variable.key) + '\u00a0' + variable.unit;
    else
      label = formatVal(iv[0], variable.key) + ' \u2013 ' + formatVal(iv[1], variable.key) + '\u00a0' + variable.unit;

    return '<div class="legend-item">' +
      '<span class="legend-swatch" style="background:' + colors[i] + '"></span>' +
      '<span class="legend-label">' + label + '</span>' +
      '</div>';
  }).join('');

  container.innerHTML =
    '<div class="legend-title">' + variable.label + '</div>' +
    '<div class="legend-method">Quintiles &mdash; 5 classes &agrave; effectifs &eacute;gaux</div>' +
    '<div class="legend-items-wrap">' + items + '</div>';
}

function renderBivarLegend() {
  var container   = document.getElementById('legend-container');
  var bivarLegend = document.getElementById('bivar-legend');

  container.innerHTML =
    '<div class="legend-title">Intensit&eacute; &times; Fr&eacute;quence</div>' +
    '<div class="legend-method">Tertiles sur chaque axe &mdash; 9 classes</div>';

  bivarLegend.classList.add('visible');

  var rows = [2, 1, 0].map(function(row) {
    return [0, 1, 2].map(function(col) {
      var labels = ['faible', 'moyenne', 'forte'];
      return '<div style="background:' + BIVAR_COLORS[row][col] +
        ';border-radius:2px;width:26px;height:26px" ' +
        'title="Intensit\u00e9\u00a0: ' + labels[col] +
        ' | Fr\u00e9quence\u00a0: ' + labels[row] + '"></div>';
    }).join('');
  }).join('');

  bivarLegend.innerHTML =
    '<div style="display:flex;gap:8px;align-items:flex-end">' +
      // Grille 3x3
      '<div>' +
        '<div style="display:grid;grid-template-columns:repeat(3,26px);gap:2px">' +
          rows +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;font-size:0.6rem;color:var(--muted);margin-top:3px">' +
          '<span>faible</span>' +
          '<span style="text-align:center;flex:1">intensit\u00e9 \u2192</span>' +
          '<span>forte</span>' +
        '</div>' +
      '</div>' +
      // Label fréquence vertical
      '<div style="writing-mode:vertical-lr;font-size:0.6rem;color:var(--muted);margin-bottom:18px;line-height:1">' +
        'fr\u00e9q. \u2191' +
      '</div>' +
    '</div>' +
    '<div style="font-size:0.63rem;color:var(--muted);margin-top:8px;line-height:1.5">' +
      '<span style="display:inline-block;width:9px;height:9px;background:#3b4994;border-radius:2px;vertical-align:middle;margin-right:4px"></span>' +
      'Risque max. (intensit\u00e9 <strong>ET</strong> fr\u00e9q. \u00e9lev\u00e9es)<br>' +
      '<span style="display:inline-block;width:9px;height:9px;background:#e8e8e8;border-radius:2px;vertical-align:middle;margin-right:4px"></span>' +
      'Faible risque sur les deux axes' +
    '</div>';
}

function formatVal(v, key) {
  if (v === undefined || v === null) return '\u2013';
  if (key === 'drias_Fr\u00e9') return v.toFixed(1);
  return Math.round(v).toString();
}

window.renderUnivarLegend = renderUnivarLegend;
window.renderBivarLegend  = renderBivarLegend;
window.formatVal          = formatVal;
