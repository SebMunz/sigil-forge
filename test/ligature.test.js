import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {generate,toSVG,importRecipe,exportRecipe} from '../src/engine.js';

test('bicolor ligature stays bounded for long inscriptions and maximum pen width',()=>{
  for(const text of ['g','FLOURE','ALCHEMICAL FIRMWARE','ABCDEFGHIJKLMNOPQRSTUVWXYZ'.repeat(10)]){
    const a=generate({text,method:'hybrid',planet:'mars',stroke:8,rotation:360});
    assert.ok(a.strokes.length<=9);
    assert.equal(a.strokes.filter(s=>s.role==='route').length,1);
    for(const s of a.strokes.filter(s=>s.role==='letter')){
      const coordinates=s.d.match(/-?\d+(?:\.\d+)?/g).map(Number);
      assert.ok(coordinates.every(n=>n>=200&&n<=400));
    }
    const svg=toSVG(a);
    assert.match(svg,/data-layer="letter"/);
    assert.match(svg,/stroke="#b8d0be" stroke-width="4"/);
    assert.doesNotMatch(svg,/NaN|Infinity|undefined/);
    assert.deepEqual(importRecipe(exportRecipe(a)),a);
  }
});
test('secondary ink is validated, serialized and applied only to the ligature',()=>{
  const a=generate({text:'FLOURE',method:'hybrid',ink:'#e29930',accentInk:'#ee7766'});
  assert.match(toSVG(a),/stroke="#ee7766"/);
  assert.equal(importRecipe(exportRecipe(a)).recipe.accentInk,'#ee7766');
  assert.throws(()=>generate({accentInk:'red" onload="alert(1)'}));
});
test('v0.1 recipes restore and export without silently changing their old geometry',()=>{
  const old={schema:'sigil-forge/recipe@1',engine:'0.1.0',recipe:{text:'FLOURE',method:'hybrid',planet:'mars',stroke:8,rotation:360}};
  const restored=importRecipe(JSON.stringify(old));
  assert.equal(restored.engine,'0.1.0');
  assert.equal(createHash('sha256').update(toSVG(restored)).digest('hex'),'d7f1583581a175f60b1c6b14046bfcf9ffa5e05d43cd753026bbab2e516ac23e');
  assert.equal(JSON.parse(exportRecipe(restored)).engine,'0.1.0');
  assert.deepEqual(importRecipe(exportRecipe(restored)),restored);
});
