// ══════════════════════════════════════════════════════════════════════════
//  CONTROLS — ovládání času (step/play/speed) a vrstev (setVar/updateLegend)
//  Načítá se PŘED hlavním <script> blokem v index.html (za js/map.js).
//  Obsahuje: setStep, toCEST, go, togglePlay, cycleSpeed, setVar, updateLegend,
//  buildTicks.
//  Odkazuje na globály z hlavního bloku (step, varName, playing, playTmr, spdIdx,
//  SPEEDS, metadata, allTimesteps, TEMP_STOPS, PREC_STOPS) a volá render() (map.js)
//  — vše až za běhu.
// ══════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════
//  STEP / TIME
// ══════════════════════════════════════════════════════════════════════════
function setStep(idx){
  if(!allTimesteps.length)return;
  step=Math.max(0,Math.min(idx,metadata.n_timesteps-1));
  document.getElementById('slider').value=step;
  const ts=allTimesteps[step];
  
  const utcTime=ts.time.replace('T',' ')+' UTC';
  const cestTime=toCEST(ts.time);
  document.getElementById('t-display').textContent=`${utcTime} | ${cestTime} CEST`;
  
  document.getElementById('t-sub').textContent=
    `step ${step+1} / ${metadata.n_timesteps}  ·  +${step}h from init`;
  render();
}

function toCEST(isoStr){
  const d=new Date(isoStr+'Z');
  const utcH=d.getUTCHours();
  const cestH=(utcH+2)%24;
  const mm=String(d.getUTCMinutes()).padStart(2,'0');
  return`${String(cestH).padStart(2,'0')}:${mm}`;
}

function go(d){setStep(step+d);}

function togglePlay(){
  playing=!playing;
  document.getElementById('playbtn').textContent=playing?'⏸':'▶';
  if(playing){
    playTmr=setInterval(()=>
      setStep(step>=metadata.n_timesteps-1?0:step+1),
      1000/SPEEDS[spdIdx]);
  }else{
    clearInterval(playTmr);
  }
}

function cycleSpeed(){
  spdIdx=(spdIdx+1)%SPEEDS.length;
  document.getElementById('spd').textContent=`${SPEEDS[spdIdx]}×`;
  if(playing){
    clearInterval(playTmr);
    playTmr=setInterval(()=>
      setStep(step>=metadata.n_timesteps-1?0:step+1),
      1000/SPEEDS[spdIdx]);
  }
}

function setVar(v){
  varName=v;
  document.getElementById('btn-t').classList.toggle('active',v==='temp_c');
  document.getElementById('btn-p').classList.toggle('active',v==='precip_mm');
  updateLegend();
  render();
}

// ══════════════════════════════════════════════════════════════════════════
//  LEGEND
// ══════════════════════════════════════════════════════════════════════════
function updateLegend(){
  const isTmp=varName==='temp_c';
  const stops=isTmp?TEMP_STOPS:PREC_STOPS;
  const unit=isTmp?'[°C]':'[mm·h⁻¹]';
  document.getElementById('leg-title').textContent=isTmp?`TEMPERATURE ${unit}`:`PRECIPITATION ${unit}`;
  const minV=stops[0].v,maxV=stops[stops.length-1].v;
  const grad=stops.map(s=>
    `rgba(${s.r},${s.g},${s.b},${(s.a/255).toFixed(2)}) ${((s.v-minV)/(maxV-minV)*100).toFixed(0)}%`
  ).join(', ');
  document.getElementById('leg-bar').style.background=`linear-gradient(to right, ${grad})`;
  document.getElementById('leg-labs').innerHTML=
    `<span>${minV}${isTmp?'°C':''}</span><span>${((minV+maxV)/2).toFixed(0)}${isTmp?'°C':''}</span><span>${maxV}${isTmp?'°C':''}</span>`;
}

// ══════════════════════════════════════════════════════════════════════════
//  SLIDER UPDATE (pro progresivní načítání)
// ══════════════════════════════════════════════════════════════════════════
function updateSliderMax(){
  if(!metadata || !metadata.n_timesteps)return;
  const sl=document.getElementById('slider');
  sl.max=metadata.n_timesteps-1;
  // Pokud jsme na posledním kroku, přejdi na nový poslední
  if(step >= metadata.n_timesteps-1){
    step = metadata.n_timesteps - 1;
    sl.value = step;
  }
  // Aktualizuj text počtu kroků
  const tSub = document.getElementById('t-sub');
  if(tSub && allTimesteps[step]){
    tSub.textContent = `step ${step+1} / ${metadata.n_timesteps}  ·  +${step}h from init`;
  }
}

// ══════════════════════════════════════════════════════════════════════════
//  TICKS
// ══════════════════════════════════════════════════════════════════════════
function buildTicks(){
  const c = document.getElementById('ticks');
  c.innerHTML = '';
  if (!allTimesteps || !allTimesteps.length) return;

  const n = allTimesteps.length;
  const seen = new Set();
  const days = [];

  for (let i = 0; i < n; i++) {
    const d = (allTimesteps[i].time || '').split('T')[0];
    if (d && !seen.has(d)) {
      seen.add(d);
      days.push({ idx: i, date: d });
    }
  }

  days.forEach((t, j) => {
    const tick = document.createElement('div');
    tick.className = 'day-tick';
    if (j === 0) tick.classList.add('first');
    if (j === days.length - 1) tick.classList.add('last');

    const pct = n > 1 ? (t.idx / (n - 1) * 100) : 50;
    tick.style.left = pct + '%';

    const line = document.createElement('div');
    line.className = 'day-line';
    tick.appendChild(line);

    const label = document.createElement('div');
    label.className = 'day-label';
    label.textContent = t.date.substring(5);  // MM-DD
    tick.appendChild(label);

    c.appendChild(tick);
  });
}
