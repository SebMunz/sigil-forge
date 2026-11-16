import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildShield,mothersFromText,figureNames} from '../src/geomancy.js';
import {generate,toSVG,exportRecipe,importRecipe,squares} from '../src/engine.js';

test('seven planetary assignments have the expected order and magic constant',()=>{
  for(const [planet,n,total] of [['saturn',3,15],['jupiter',4,34],['mars',5,65],['sun',6,111],['venus',7,175],['mercury',8,260],['moon',9,369]]){
    assert.equal(squares[planet].length,n);
    assert.equal(squares[planet][0].reduce((a,b)=>a+b),total);
    const a=generate({text:'Floure',planet,correspondence:true});
    assert.ok(a.correspondence.name);
    assert.equal(a.correspondence.number,n);
  }
});
test('known mother figures transpose and combine into a hand-calculated shield',()=>{
  const chart=buildShield('1111222212122121');
  assert.deepEqual(chart.daughters,[[1,2,1,2],[1,2,2,1],[1,2,1,2],[1,2,2,1]]);
  assert.deepEqual(chart.nieces,[[1,1,1,1],[1,1,1,1],[2,2,1,1],[2,2,1,1]]);
  assert.deepEqual(chart.witnesses,[[2,2,2,2],[2,2,2,2]]);
  assert.equal(chart.judgeName,'Populus');
});
test('all 65,536 mother combinations produce a named judge with even point parity',()=>{
  assert.equal(Object.keys(figureNames).length,16);
  const seen=new Set();
  for(let bits=0;bits<65536;bits++){
    const seed=Array.from({length:16},(_,i)=>(bits>>>i)&1?'1':'2').join('');
    const chart=buildShield(seed);
    assert.equal(chart.figures.length,15);
    assert.ok(chart.judgeName);
    assert.equal(chart.judge.reduce((a,b)=>a+b)%2,0);
    seen.add(chart.judgeName);
  }
  assert.equal(seen.size,8);
});
test('manual and text-derived charts export reproducibly without spurious planetary sources',()=>{
  for(const mothers of ['', '1111222212122121']){
    const a=generate({text:'FLOURE',method:'geomantic',mothers,stroke:8,correspondence:true});
    assert.equal(a.matrix,null);assert.equal(a.correspondence,null);
    assert.deepEqual(a.sourceIds,['geomancy']);
    assert.ok(a.strokes.every(s=>s.role==='dot'));
    assert.deepEqual(importRecipe(exportRecipe(a)),a);
    const svg=toSVG(a,{guides:true});
    assert.match(svg,/stroke="none"/);assert.match(svg,/>XV<\/text>/);
    assert.doesNotMatch(svg,/NaN|Infinity|undefined/);
  }
  const manual=generate({text:'',method:'geomantic',mothers:'1111222212122121'});
  assert.equal(manual.geomancy.judgeName,'Populus');
  assert.equal(mothersFromText('FLOURE'),mothersFromText('FLOURE'));
  assert.notEqual(mothersFromText('FLOURE'),mothersFromText('NOZOMI'));
  for(const mothers of ['1111','0000000000000000','111122221212212X',null])assert.throws(()=>generate({method:'geomantic',mothers}));
});
test('engine 0.2 recipes retain their previous ligature and version',()=>{
  const a=importRecipe(JSON.stringify({schema:'sigil-forge/recipe@1',engine:'0.2.0',recipe:{text:'Floure',method:'hybrid'}}));
  assert.equal(a.engine,'0.2.0');
  assert.equal(JSON.parse(exportRecipe(a)).engine,'0.2.0');
  assert.deepEqual(importRecipe(exportRecipe(a)),a);
  assert.doesNotMatch(toSVG(a),/NaN|undefined/);
});
