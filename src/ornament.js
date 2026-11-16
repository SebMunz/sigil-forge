// Original diagram, designed for the AFW interface. Not a facsimile or a ritual seal.
export function plate(id='forge-plate') {
  const polar=(angle,r)=>[300+Math.cos(angle)*r,300+Math.sin(angle)*r];
  const polygon=(n,r,step=1,phase=-Math.PI/2)=>Array.from({length:n},(_,i)=>polar(phase+i*step/n*Math.PI*2,r).map(v=>v.toFixed(2)).join(',')).join(' ');
  const ticks=Array.from({length:72},(_,i)=>{const angle=i*Math.PI/36;const a=polar(angle,279),b=polar(angle,i%6?283:290);return `<path d="M${a.join(' ')}L${b.join(' ')}"/>`;}).join('');
  const letters=Array.from({length:24},(_,i)=>{const p=polar(i*Math.PI/12-Math.PI/2,265);return `<text x="${p[0]}" y="${p[1]}" text-anchor="middle" dominant-baseline="middle">${String.fromCharCode(65+i)}</text>`;}).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" aria-hidden="true"><defs><path id="${id}" d="M300 47a253 253 0 1 1-.1 0"/></defs><g fill="none" stroke="currentColor" stroke-width=".65"><circle cx="300" cy="300" r="290"/><circle cx="300" cy="300" r="278"/><circle cx="300" cy="300" r="247"/><circle cx="300" cy="300" r="238"/>${ticks}<polygon points="${polygon(3,242)}"/><polygon points="${polygon(5,235,2)}"/><polygon points="${polygon(7,202,2)}"/><path d="M18 300H582M300 18V582" stroke-dasharray="1 8"/><circle cx="300" cy="58" r="8"/><circle cx="300" cy="542" r="8"/><path d="M294 58h12m-6-6v12M294 542h12"/></g><g fill="currentColor" font-family="monospace" font-size="7">${letters}<text font-size="6" letter-spacing="3"><textPath href="#${id}">ALCHEMICAL FIRMWARE / BLACK BIOS RING0 / ORIGINAL SYSTEM GEOMETRY / </textPath></text></g></svg>`;
}

export function recipeFingerprint(recipe){
  // FNV-1a over UTF-8, a visual identifier only; not a cryptographic integrity check.
  let value=0x811c9dc5;
  for(const byte of new TextEncoder().encode(JSON.stringify(recipe))){value=Math.imul(value^byte,0x01000193)>>>0;}
  return value.toString(16).padStart(8,'0').toUpperCase();
}
export function inscriptionBytes(text){return [...new TextEncoder().encode(text)].slice(0,48).map(n=>n.toString(16).padStart(2,'0').toUpperCase());}
