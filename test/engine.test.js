import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generate,toSVG,exportRecipe,importRecipe,squares,normalize} from '../src/engine.js';
import {sources} from '../src/sources.js';

test('every planetary matrix is a normal magic square, including both diagonals',()=>{
  for(const matrix of Object.values(squares)){
    const n=matrix.length,sum=n*(n*n+1)/2;
    assert.deepEqual(matrix.flat().toSorted((a,b)=>a-b),Array.from({length:n*n},(_,i)=>i+1));
    for(let i=0;i<n;i++){
      assert.equal(matrix[i].reduce((a,b)=>a+b),sum);
      assert.equal(matrix.reduce((s,row)=>s+row[i],0),sum);
    }
    assert.equal(matrix.reduce((s,row,i)=>s+row[i],0),sum);
    assert.equal(matrix.reduce((s,row,i)=>s+row[n-i-1],0),sum);
  }
});
test('known Latin sequence traverses the declared Saturn cells',()=>{
  const a=generate({text:'AJZ'});
  assert.deepEqual(a.values,[1,10,26]);assert.deepEqual(a.numbers,[1,1,8]);
  assert.deepEqual(a.points,[[300,393.333],[300,393.333],[206.667,393.333]]);
});
test('normalization and artistic filters are explicit, not hidden',()=>{
  assert.equal(normalize('Ñandú! café 123'),'NANDUCAFE');
  assert.equal(generate({text:'café café',removeVowels:true,deduplicate:true}).letters,'CF');
  assert.equal(generate({text:'AA'}).letters,'AA');
  assert.ok(generate({text:'hola',removeVowels:true}).adaptations.some(t=>t.includes('AEIOU')));
});
test('every method has finite geometry, valid provenance and deterministic roundtrip',()=>{
  for(const method of ['planetary','letters','hybrid'])for(const planet of Object.keys(squares)){
    const a=generate({text:'ABCDEFGHIJKLMNOPQRSTUVWXYZ',method,planet,correspondence:true,rotation:127,mirror:true});
    assert.deepEqual(importRecipe(exportRecipe(a)),a);
    assert.equal(toSVG(a),toSVG(generate(a.recipe)));
    assert.doesNotMatch(toSVG(a,{guides:true}),/NaN|undefined|Infinity/);
    for(const id of a.sourceIds)assert.ok(sources.find(s=>s.id===id&&s.status==='consultada'));
    for(const [x,y] of a.points)assert.ok(x>=0&&y>=0&&x<=600&&y<=600);
  }
});
test('single letters and repeated cells still have a visible marker',()=>{
  for(const text of ['A','AAAA'])assert.match(toSVG(generate({text,ring:false})),/r="7"/);
});
test('SVG escapes user text and rejects attribute injection',()=>{
  const svg=toSVG(generate({text:'<script>alert("x")</script>'}));
  assert.doesNotMatch(svg,/<script>/);assert.match(svg,/&lt;script&gt;/);
  assert.throws(()=>generate({ink:'#fff" onload="alert(1)'}));
  assert.throws(()=>generate({planet:'__proto__'}));
  assert.throws(()=>generate({method:'__proto__'}));
  assert.throws(()=>generate({ring:'false'}));
});
test('malformed, empty, unsupported and incompatible recipes fail clearly',()=>{
  for(const text of ['', '123!','你好','אור'])assert.throws(()=>generate({text}));
  assert.throws(()=>generate({text:'AEIOU',removeVowels:true}));
  assert.throws(()=>generate({text:'a'.repeat(281)}));
  assert.throws(()=>generate({rotation:NaN}));
  assert.throws(()=>generate({stroke:0}));
  assert.throws(()=>generate({unknown:1}));
  assert.throws(()=>importRecipe('{invalid'));
  assert.throws(()=>importRecipe(JSON.stringify({schema:'sigil-forge/recipe@1',engine:'99',recipe:{text:'A'}})));
  assert.throws(()=>importRecipe('a'.repeat(32001)));
});
test('SVG geometry cannot be replaced by hostile imported artifact fields',()=>{
  const a=generate({text:'Floure'});
  assert.equal(toSVG({...a,strokes:[{d:'" onload="alert(1)'}]}),toSVG(a));
});
