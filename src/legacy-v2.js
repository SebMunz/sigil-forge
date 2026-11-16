import { correspondences } from './sources.js';
import {generate as generateV1,toSVG as svgV1,exportRecipe as exportV1} from './legacy-v1.js';

export const VERSION = '0.2.0';
export const squares = {
  saturn: [[4,9,2],[3,5,7],[8,1,6]],
  jupiter: [[4,14,15,1],[9,7,6,12],[5,11,10,8],[16,2,3,13]],
  mars: [[11,24,7,20,3],[4,12,25,8,16],[17,5,13,21,9],[10,18,1,14,22],[23,6,19,2,15]]
};
for (const rows of Object.values(squares)) { for (const row of rows) Object.freeze(row); Object.freeze(rows); }
Object.freeze(squares);
export const defaults = Object.freeze({ text: 'Floure', method: 'planetary', planet: 'saturn', deduplicate: false, removeVowels: false, correspondence: false, rotation: 0, mirror: false, ring: true, stroke: 3, ink: '#e29930', accentInk: '#b8d0be' });
const methods = ['planetary','letters','hybrid'];
const round = n => Math.round(n * 1000) / 1000;
const point = (x,y) => [round(x),round(y)];
const path = points => points.map((p,i) => `${i ? 'L' : 'M'}${p.join(' ')}`).join(' ');
export const escapeXML = value => String(value).replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));

// Original monoline alphabet. Coordinates use a 2×4 unit cell; no historical glyphs copied.
const glyphs = {
  A: [[[0,4],[1,0],[2,4]],[[.5,2],[1.5,2]]], B: [[[0,4],[0,0],[1.5,0],[2,1],[0,2],[1.5,2],[2,3],[1.5,4],[0,4]]],
  C: [[[2,0],[0,0],[0,4],[2,4]]], D: [[[0,0],[0,4],[1,4],[2,3],[2,1],[1,0],[0,0]]], E: [[[2,0],[0,0],[0,4],[2,4]],[[0,2],[1.5,2]]],
  F: [[[0,4],[0,0],[2,0]],[[0,2],[1.5,2]]], G: [[[2,0],[0,0],[0,4],[2,4],[2,2],[1,2]]], H: [[[0,0],[0,4]],[[2,0],[2,4]],[[0,2],[2,2]]],
  I: [[[0,0],[2,0]],[[1,0],[1,4]],[[0,4],[2,4]]], J: [[[0,0],[2,0],[2,4],[0,4],[0,3]]], K: [[[0,0],[0,4]],[[2,0],[0,2],[2,4]]],
  L: [[[0,0],[0,4],[2,4]]], M: [[[0,4],[0,0],[1,2],[2,0],[2,4]]], N: [[[0,4],[0,0],[2,4],[2,0]]], O: [[[0,0],[2,0],[2,4],[0,4],[0,0]]],
  P: [[[0,4],[0,0],[2,0],[2,2],[0,2]]], Q: [[[0,0],[2,0],[2,4],[0,4],[0,0]],[[1,3],[2.5,4.5]]], R: [[[0,4],[0,0],[2,0],[2,2],[0,2],[2,4]]],
  S: [[[2,0],[0,0],[0,2],[2,2],[2,4],[0,4]]], T: [[[0,0],[2,0]],[[1,0],[1,4]]], U: [[[0,0],[0,4],[2,4],[2,0]]],
  V: [[[0,0],[1,4],[2,0]]], W: [[[0,0],[0,4],[1,2],[2,4],[2,0]]], X: [[[0,0],[2,4]],[[2,0],[0,4]]],
  Y: [[[0,0],[1,2],[2,0]],[[1,2],[1,4]]], Z: [[[0,0],[2,0],[0,4],[2,4]]]
};

export function normalize(text) {
  return text.normalize('NFD').replace(/\p{M}/gu,'').toUpperCase().replace(/[^A-Z]/g,'');
}
export function generate(options = {}) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('La receta debe ser un objeto.');
  const unknown = Object.keys(options).filter(k => !Object.hasOwn(defaults,k));
  if (unknown.length) throw new Error(`Opciones desconocidas: ${unknown.join(', ')}`);
  const recipe = {...defaults,...options};
  if (typeof recipe.text !== 'string' || recipe.text.length > 280) throw new Error('Escribe hasta 280 caracteres.');
  if (!methods.includes(recipe.method) || !Object.hasOwn(squares,recipe.planet)) throw new Error('Método o planeta desconocido.');
  for (const key of ['deduplicate','removeVowels','correspondence','mirror','ring']) if (typeof recipe[key] !== 'boolean') throw new Error(`Opción inválida: ${key}`);
  for (const [key,min,max] of [['rotation',0,360],['stroke',1,8]]) if (!Number.isFinite(recipe[key]) || recipe[key]<min || recipe[key]>max) throw new Error(`Fuera de rango: ${key}`);
  if (typeof recipe.ink !== 'string' || !/^#[0-9a-f]{6}$/i.test(recipe.ink)) throw new Error('El color debe ser hexadecimal de seis dígitos.');
  if (typeof recipe.accentInk !== 'string' || !/^#[0-9a-f]{6}$/i.test(recipe.accentInk)) throw new Error('La segunda tinta debe ser hexadecimal de seis dígitos.');
  const normalized = normalize(recipe.text);
  let letters = recipe.removeVowels ? normalized.replace(/[AEIOU]/g,'') : normalized;
  if (recipe.deduplicate) letters = [...new Set(letters)].join('');
  if (!letters) throw new Error('La receta necesita al menos una letra A–Z después de los filtros.');
  const matrix = squares[recipe.planet];
  const size = matrix.length;
  const values = [...letters].map(c=>c.charCodeAt(0)-64);
  const numbers = values.map(n=>(n-1)%(size*size)+1);
  const cell = 280 / size;
  const points = numbers.map(n=>{
    const row = matrix.findIndex(r=>r.includes(n));
    return point(160+(matrix[row].indexOf(n)+.5)*cell,160+(row+.5)*cell);
  });
  const strokes = [];
  if (recipe.method !== 'letters') strokes.push({role:'route',d:path(points)});
  if (recipe.method === 'letters') {
    // Stack independently rotated letter strokes around a shared centre.
    [...letters].forEach((letter,i)=>{
      const angle = (i % 7 - 3)*Math.PI/21;
      for (const segment of glyphs[letter]) {
        const vertices = segment.map(([x,y])=>{
          const dx=(x-1)*42,dy=(y-2)*42;
          return point(300+dx*Math.cos(angle)-dy*Math.sin(angle),300+dx*Math.sin(angle)+dy*Math.cos(angle));
        });
        strokes.push({role:'letter',d:path(vertices)});
      }
    });
  }
  if (recipe.method === 'hybrid') {
    // Contemporary ligature: a common stem with a bounded number of letter-derived branches.
    // Every ordinal contributes; this is intentionally a lossy visual composition.
    const levels=Math.min(7,Math.max(2,Math.ceil(letters.length/2)));
    const bins=Array.from({length:levels},()=>0);
    values.forEach((value,i)=>{bins[i%levels]+=value*(i+1);});
    strokes.push({role:'letter',d:'M300 208 L300 392 M300 208 L291 219 L300 230 L309 219 Z'});
    bins.forEach((value,i)=>{
      const y=244+i/(levels-1)*128;
      const left=24+(value%5)*6,right=24+(Math.floor(value/5)%5)*6;
      const rise=12+(value%3)*4,fall=12+(Math.floor(value/3)%3)*4;
      strokes.push({role:'letter',d:path([point(300-left,y-rise),point(300,y),point(300+right,y-fall)])});
    });
  }
  const sourceIds = recipe.method === 'planetary' ? ['agrippa'] : recipe.method === 'letters' ? ['spare'] : ['agrippa','spare'];
  if (recipe.correspondence) sourceIds.push('crowley');
  const adaptations = ['Normalización latina A–Z (Ñ→N y eliminación de tildes); no es transliteración hebrea.'];
  if (recipe.method !== 'letters') adaptations.push('A=1…Z=26; reducción modular ((n−1) mod n²)+1 y trazado: convención moderna sobre cuadrados tradicionales.');
  if (recipe.method === 'letters') adaptations.push('Alfabeto monolineal y superposición automática originales; no reconstrucción de las figuras de Spare.');
  if (recipe.deduplicate) adaptations.push('Conservar la primera aparición de cada letra: filtro moderno opcional.');
  if (recipe.removeVowels) adaptations.push('Eliminar AEIOU: filtro artístico moderno, no atribuido al pasaje de Spare.');
  if (recipe.method === 'hybrid') adaptations.push('Ligadura contemporánea: los ordinales de las letras se acumulan en un máximo de siete niveles de ramas sobre un eje común, con tinta independiente del recorrido planetario. Transformación visual con pérdida, no cifrado.');
  return { schema:'sigil-forge/artifact@1', engine:VERSION, recipe, normalized, letters, values, numbers:recipe.method==='letters'?[]:numbers, matrix:recipe.method==='letters'?null:matrix, points:recipe.method==='letters'?[]:points, strokes, sourceIds, adaptations, classification:recipe.method==='hybrid'?'Mezcla contemporánea':'Adaptación documentada', correspondence:recipe.correspondence?{...correspondences[recipe.planet],source:'crowley'}:null };
}

export function toSVG(artifact, { guides = false, background = false } = {}) {
  if (artifact.engine === '0.1.0') return svgV1(artifact,{guides,background});
  // Rebuild from the validated recipe; never interpolate geometry from imported JSON.
  const a = generate(artifact.recipe);
  const {recipe:r} = a;
  const ink = r.ink;
  let grid = '';
  if (guides && a.matrix) {
    const size=a.matrix.length, cell=280/size;
    grid = a.matrix.flatMap((row,y)=>row.map((n,x)=>`<rect x="${160+x*cell}" y="${160+y*cell}" width="${cell}" height="${cell}"/><text x="${160+(x+.5)*cell}" y="${160+(y+.5)*cell}" stroke="none" fill="${ink}" text-anchor="middle" dominant-baseline="middle" font-size="14">${n}</text>`)).join('');
    grid=`<g fill="none" stroke="${ink}" opacity="0.28" stroke-width="0.8">${grid}</g>`;
  }
  const terminals = a.points.length ? `<circle cx="${a.points[0][0]}" cy="${a.points[0][1]}" r="7"/><circle cx="${a.points.at(-1)[0]}" cy="${a.points.at(-1)[1]}" r="3" fill="${ink}"/>` : '';
  const geometry=a.strokes.map(s=>`<path data-layer="${s.role}" d="${s.d}"${s.role==='letter' && r.method==='hybrid'?` stroke="${r.accentInk}" stroke-width="${Math.min(4,Math.max(1.5,r.stroke*.65))}"`:''}/>`).join('');
  const metadata=escapeXML(JSON.stringify({schema:a.schema,engine:a.engine,recipe:r,sourceIds:a.sourceIds,adaptations:a.adaptations}));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" role="img" aria-labelledby="sigil-title"><title id="sigil-title">Sigilo: ${escapeXML(r.text)}</title><metadata>${metadata}</metadata>${background?'<rect width="600" height="600" fill="#090b0a"/>':''}<g transform="rotate(${r.rotation} 300 300)"><g transform="${r.mirror?'translate(600 0) scale(-1 1)':'translate(0 0)'}">${grid}<g fill="none" stroke="${ink}" stroke-width="${r.stroke}" stroke-linecap="round" stroke-linejoin="round">${r.ring?'<circle cx="300" cy="300" r="224" stroke-width="1"/><circle cx="300" cy="300" r="216" stroke-width="0.5"/>':''}${geometry}${terminals}</g></g></g></svg>`;
}

export function exportRecipe(artifact) {
  if (artifact.engine === '0.1.0') return exportV1(artifact);
  const a=generate(artifact.recipe);
  return JSON.stringify({schema:'sigil-forge/recipe@1',engine:VERSION,recipe:a.recipe,provenance:{sources:a.sourceIds,adaptations:a.adaptations}},null,2);
}
export function importRecipe(json) {
  if (typeof json !== 'string' || json.length>32000) throw new Error('Receta inválida o demasiado grande.');
  const data=JSON.parse(json);
  if (data.schema==='sigil-forge/recipe@1' && data.engine==='0.1.0' && data.recipe) return generateV1(data.recipe);
  if (data.schema!=='sigil-forge/recipe@1' || data.engine!==VERSION || !data.recipe) throw new Error('Formato o versión de receta no compatible.');
  return generate(data.recipe);
}
