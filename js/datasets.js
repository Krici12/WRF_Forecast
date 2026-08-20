// ══════════════════════════════════════════════════════════════════════════
//  DATASETS — dataset switcher (přepínač mezi gfs_wrf, arpege_wrf, atd.)
//  Dynamicky buduje select element z pole datasets v manifestu.
//  Volá switchDataset() z data.js při změně.
// ══════════════════════════════════════════════════════════════════════════

let datasetSelect = null;

function initDatasetSwitcher(manifest) {
  if(!manifest.datasets || manifest.datasets.length === 0){
    console.log('No datasets in manifest, skipping switcher init');
    return;
  }

  // Vytvoříme select element
  const container = document.getElementById('dataset-switcher');
  if(!container){
    console.warn('Dataset switcher container not found');
    return;
  }

  // Vygenerujeme options
  let html = '';
  for(let i = 0; i < manifest.datasets.length; i++){
    const d = manifest.datasets[i];
    const hasData = d.files && d.files.length > 0;
    const selected = (currentDataset && currentDataset.id === d.id) ? 'selected' : '';
    const disabled = !hasData ? 'disabled' : '';
    const label = hasData ? d.label : d.label + ' (coming soon)';
    html += '<option value="'+d.id+'" '+selected+' '+disabled+'>'+label+'</option>\n';
  }

  container.innerHTML = html;
  container.disabled = false;

  // Registrace event listeneru
  container.onchange = function() {
    const newId = this.value;
    switchDataset(newId);
  };
}

// Funkce pro aktualizaci switcheru po přenačtení datasetu
function updateDatasetSwitcher() {
  if(currentManifest && currentManifest.datasets){
    initDatasetSwitcher(currentManifest);
  }
}
