// ══════════════════════════════════════════════════════════════════════════
//  TOOLTIP — popisek u myši (onHover)
//  Načítá se PŘED hlavním <script> blokem v index.html (za js/controls.js).
//  Odkazuje na globály z hlavního bloku (allTimesteps, gridData, step, map) —
//  čte je až při volání. Registruje ji map.js (initApp) jako mousemove handler.
// ══════════════════════════════════════════════════════════════════════════
function onHover(e){
  if (window.innerWidth <= 768) {
    document.getElementById('tip').style.display='none';
    return;
  }

  if(!allTimesteps.length)return;
  const g=gridData;
  const ts=allTimesteps[step];
  const clat=e.latlng.lat,clon=e.latlng.lng;

  const bounds=map.getBounds();
  if(!bounds.contains(e.latlng)){
    document.getElementById('tip').style.display='none';
    return;
  }

  let best=0,bd=Infinity;
  for(let i=0;i<g.lat.length;i++){
    const d=(g.lat[i]-clat)**2+(g.lon[i]-clon)**2;
    if(d<bd){bd=d;best=i;}
  }

  if(Math.sqrt(bd)>1.5){
    document.getElementById('tip').style.display='none';
    return;
  }

  const t=ts.temp_c[best];
  const p=ts.precip_mm[best];
  const hgt=g.hgt?g.hgt[best]:null;
  const lat=g.lat[best].toFixed(3);
  const lon=g.lon[best].toFixed(3);

  const tc=t<=0?'#00a8ff':t<=15?'#3fb950':t<=25?'#f0883e':'#f85149';

  const hgtRow=hgt!==null
    ?`<div class="tr"><span class="tk">ELEV</span><span class="tv" style="color:#1f883d">${hgt<=-999?'N/A':Math.round(hgt)+' m'}</span></div>`
    :'';

  // ZMĚNA: Tlak byl odstraněn ze zobrazení v infoboxu u myši
  document.getElementById('tip').innerHTML=`
    <div class="tr"><span class="tk">LAT</span><span class="tv">${lat}°N</span></div>
    <div class="tr"><span class="tk">LON</span><span class="tv">${lon}°E</span></div>
    <div class="tsep"></div>
    <div class="tr"><span class="tk">TEMP</span><span class="tv" style="color:${tc}">${t<=-999?'N/A':t.toFixed(1)+' °C'}</span></div>
    <div class="tr"><span class="tk">PRECIP</span><span class="tv" style="color:#0969da">${p<=-999?'N/A':p.toFixed(2)+' mm·h⁻¹'}</span></div>
    ${hgtRow}
  `;
  const tip=document.getElementById('tip');
  tip.style.display='block';
  tip.style.left=(e.originalEvent.clientX+16)+'px';
  tip.style.top=(e.originalEvent.clientY-10)+'px';
}
