// ══════════════════════════════════════════════════════════════════════════
//  LAYERS — inicializace overlay vrstev (log & hook na hranice)
//  Obsahuje: initBoundaryLayer (staré hardcoded hranice ČR — nahrazeno modulem
//  js/boundaries.js, ponecháno jen jako prázdný hook z důvodu zpětné kompatibility
//  s voláním z map.js), initLogoOverlay
// ══════════════════════════════════════════════════════════════════════════

let boundaryLayer = null;
let logoOverlay = null;

// Hranice ČR se nyní načítají z GeoJSON v js/boundaries.js (initBoundaryLayers).
// Tento hook zůstává jen proto, že ho map.js volá — sám nic nekreslí.
function initBoundaryLayer(map) {
  if (typeof initBoundaryLayers === 'function') {
    initBoundaryLayers();
  }
}

// Logo overlay — NENÍ POTŘEBA, loga jsou v HTML+CSS.
function initLogoOverlay(map) {
  console.log('[layers.js] iniciovano - loga jsou v HTML elementu');
}
