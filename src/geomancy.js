// Four-level figures and parity derivation: Crowley, International, January 1918, pp. 28–29.
// Text -> Mothers and the vector layout are contemporary workshop adaptations.
export const figureNames=Object.freeze({
  '1121':'Puer','1212':'Amissio','2212':'Albus','2222':'Populus',
  '1111':'Via','2211':'Fortuna Major','1122':'Fortuna Minor','2112':'Conjunctio',
  '1211':'Puella','2122':'Rubeus','2121':'Acquisitio','1221':'Carcer',
  '2221':'Tristitia','1222':'Laetitia','2111':'Caput Draconis','1112':'Cauda Draconis'
});

export function mothersFromText(text){
  let seed=0x811c9dc5;
  for(const byte of new TextEncoder().encode(text))seed=Math.imul(seed^byte,0x01000193)>>>0;
  return Array.from({length:16},(_,i)=>(seed>>>i)&1?'1':'2').join('');
}

export function buildShield(seed){
  if(typeof seed!=='string'||!/^[12]{16}$/.test(seed))throw new Error('Las madres necesitan 16 líneas de uno o dos puntos.');
  const mothers=Array.from({length:4},(_,i)=>[...seed.slice(i*4,i*4+4)].map(Number));
  const daughters=Array.from({length:4},(_,line)=>mothers.map(m=>m[line]));
  const add=(a,b)=>a.map((value,i)=>(value+b[i])%2?1:2);
  const nieces=[add(mothers[0],mothers[1]),add(mothers[2],mothers[3]),add(daughters[0],daughters[1]),add(daughters[2],daughters[3])];
  const witnesses=[add(nieces[0],nieces[1]),add(nieces[2],nieces[3])];
  const judge=add(witnesses[0],witnesses[1]);
  const figures=[...mothers,...daughters,...nieces,...witnesses,judge];
  // Traditional right-to-left reading: Mothers I–IV at the top right.
  const positions=[{x:496,y:140},{x:440,y:140},{x:384,y:140},{x:328,y:140},
    {x:272,y:140},{x:216,y:140},{x:160,y:140},{x:104,y:140},
    {x:468,y:230},{x:356,y:230},{x:244,y:230},{x:132,y:230},
    {x:412,y:320},{x:188,y:320},{x:300,y:410}];
  return {seed,mothers,daughters,nieces,witnesses,judge,judgeName:figureNames[judge.join('')],figures,positions};
}

export function shieldStrokes(shield,stroke){
  const radius=Math.min(4.5,1.5+stroke*.3),d=radius*2;
  const dot=(x,y)=>({role:'dot',d:`M${x-radius} ${y}a${radius} ${radius} 0 1 0 ${d} 0a${radius} ${radius} 0 1 0 ${-d} 0`});
  return shield.figures.flatMap((figure,i)=>figure.flatMap((count,line)=>{
    const {x,y}=shield.positions[i],cy=y+line*16;
    return count===1?[dot(x,cy)]:[dot(x-7,cy),dot(x+7,cy)];
  }));
}

export function shieldGuides(shield,ink){
  const labels=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV'];
  const pairs=[[0,8],[1,8],[2,9],[3,9],[4,10],[5,10],[6,11],[7,11],[8,12],[9,12],[10,13],[11,13],[12,14],[13,14]];
  const lines=pairs.map(([a,b])=>`<path d="M${shield.positions[a].x} ${shield.positions[a].y+58}L${shield.positions[b].x} ${shield.positions[b].y-30}"/>`).join('');
  const texts=shield.positions.map((p,i)=>`<text x="${p.x}" y="${p.y-14}" text-anchor="middle" fill="${ink}" stroke="none" font-size="10">${labels[i]}</text>`).join('');
  return `<g fill="none" stroke="${ink}" opacity="0.32" stroke-width="0.8">${lines}${texts}</g>`;
}
