// ══════════════════════════════════════════════════════════════════════════
//  BOUNDARIES — hranice ČR a povodí Ohře z GeoJSON
//  Načítá se PŘED hlavním <script> blokem v index.html (za js/layers.js).
//  Obsahuje: initBoundaryLayers
//
//  Data pocházejí z původních ESRI shapefile v S-JTSK / Krovak East North
//  (EPSG:5514), převedených do WGS84 GeoJSON (scriptem, přesnost zjednodušena
//  na ~80–100 m). Soubory leží v boundaries/ (mimo data/), aby je rclone
//  frontendový deploy nahrál spolu s aplikací (data/** je z deploye vyloučena).
// ══════════════════════════════════════════════════════════════════════════

// Vlastní pane nad forecast overlayem, ale pod ovládacími prvky (z-index: 700
// — shodné s předchozím boundaryPane). pointer-events: none, ať hranice
// neblokují hover nad mapou.
function ensureBoundaryPane(map) {
  map.createPane('boundaryPane');
  map.getPane('boundaryPane').style.zIndex = 700;
  map.getPane('boundaryPane').style.pointerEvents = 'none';
}

// Načte a vykreslí obě hranice (ČR + povodí Ohře). Hranice jsou jen čáry
// (outline) — žádné výplně. Povodí Ohře je zvýrazněno tučněji, protože leží
// uvnitř ČR a obě čáry by jinak splývaly.
// Přepínač zobrazení povodí Ohře (2026-08-28): vypnuto na přání uživatele —
// vrstva se jen nezobrazuje, kód i data (boundaries/ohre.geojson) zůstávají.
// Pro obnovení stačí přepnout na true.
const SHOW_OHRE_BASIN = false;

function initBoundaryLayers() {
  if (typeof map === 'undefined' || !map) return; // mapa ještě není hotová

  ensureBoundaryPane(map);

  const styles = {
    czechia: { color: '#c0392b', weight: 2.2, opacity: 0.95, fill: false },
    ohre:    { color: '#7d0f0f', weight: 3.4, opacity: 0.95, fill: false },
  };

  const jobs = [
    { id: 'czechia', url: 'boundaries/czechia.geojson' },
    { id: 'ohre',    url: 'boundaries/ohre.geojson', enabled: SHOW_OHRE_BASIN },
  ].filter(job => job.enabled !== false);

  for (const job of jobs) {
    fetch(job.url, { cache: 'no-cache' })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status + ' (' + job.url + ')'); return r.json(); })
      .then(gj => drawBoundary(gj, styles[job.id]))
      .catch(err => console.warn('[boundaries.js] ' + job.id + ' load failed:', err.message));
  }
}

// Vykreslí GeoJSON polyliny do boundaryPane. Jen obrysy (L.polygon s
// fill:false → hranice), body a multipolygony převede na ploché řetězce čar.
function drawBoundary(gj, style) {
  const coords = [];
  collectRings(gj, coords);

  if (!coords.length) {
    console.warn('[boundaries.js] no coordinates found in GeoJSON');
    return;
  }

  // Spojit všechny prstence do jednoho setu lomených čar.
  L.polyline(coords, {
    color: style.color,
    weight: style.weight,
    opacity: style.opacity,
    fill: false,
    lineCap: 'round',
    lineJoin: 'round',
    pane: 'boundaryPane',
  }).addTo(map);
}

// GeoJSON ukládá souřadnice jako [lon, lat]. Leaflet ale očekává [lat, lon],
// proto každou pozici otočíme. To je jediné místo, kde se pořadí překlápí.
function swapLL(c) {
  return [c[1], c[0]];
}

// Rekurzivně nasbírá všechny souřadnicové prstence (z Polygon i MultiPolygon)
// do jednoho plochého pole segmentů. Každý prsten je samostatná lomená čára.
function collectRings(gj, out) {
  if (gj.type === 'FeatureCollection') {
    for (const f of gj.features) collectGeom(f.geometry, out);
  } else if (gj.type === 'Feature') {
    collectGeom(gj.geometry, out);
  } else if (gj.type === 'GeometryCollection') {
    for (const g of gj.geometries) collectGeom(g, out);
  } else {
    collectGeom(gj, out);
  }
}

function collectGeom(geom, out) {
  if (!geom) return;
  if (geom.type === 'Polygon') {
    for (const ring of geom.coordinates) out.push(ring.map(swapLL));
  } else if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates) {
      for (const ring of poly) out.push(ring.map(swapLL));
    }
  } else if (geom.type === 'LineString') {
    out.push(geom.coordinates.map(swapLL));
  } else if (geom.type === 'MultiLineString') {
    for (const line of geom.coordinates) out.push(line.map(swapLL));
  } else if (geom.type === 'Point') {
    // ignorovat
  }
}
