// ══════════════════════════════════════════════════════════════════════════
//  COLORS — barevné funkce
//  Načítá se PŘED hlavním <script> blokem v index.html.
//  Závisí na globálních konstantách TEMP_STOPS / PREC_STOPS a globální proměnné
//  varName (definované v hlavním bloku) — čte je až při volání, takže tyto
//  funkce musí být globálně dostupné, ale jejich pořadí načtení je nezávislé.
// ══════════════════════════════════════════════════════════════════════════
function lerp(a,b,t){ return a+(b-a)*t; }
function colorAt(stops,v){
  if(v<=stops[0].v)return stops[0];
  const last=stops[stops.length-1];
  if(v>=last.v)return last;
  for(let i=0;i<stops.length-1;i++){
    if(v>=stops[i].v&&v<=stops[i+1].v){
      const t=(v-stops[i].v)/(stops[i+1].v-stops[i].v);
      return{
        r:Math.round(lerp(stops[i].r,stops[i+1].r,t)),
        g:Math.round(lerp(stops[i].g,stops[i+1].g,t)),
        b:Math.round(lerp(stops[i].b,stops[i+1].b,t)),
        a:Math.round(lerp(stops[i].a,stops[i+1].a,t)),
      };
    }
  }
}
function getColor(v){
  if(v<=-999)return null;
  return colorAt(varName==='temp_c'?TEMP_STOPS:PREC_STOPS,v);
}
