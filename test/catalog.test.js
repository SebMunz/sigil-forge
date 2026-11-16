import {test} from 'node:test';
import assert from 'node:assert/strict';
import {catalog,families,kindLabels} from '../src/catalog.js';
import {sources} from '../src/sources.js';
import {plate,recipeFingerprint,inscriptionBytes} from '../src/ornament.js';
import {generate,exportRecipe,importRecipe} from '../src/engine.js';

test('reference IDs are unique, categorized and include every engine source',()=>{
  assert.equal(new Set(catalog.map(s=>s.id)).size,catalog.length);
  for(const source of catalog){assert.ok(source.title&&source.author);assert.ok(!('verification' in source));assert.ok(!('note' in source));assert.ok(!('use' in source));assert.ok(families[source.family]);assert.ok(kindLabels[source.kind]);if(source.url)assert.match(source.url,/^https:\/\//);}
  for(const source of sources)assert.ok(catalog.find(s=>s.id===source.id));
});
test('public references exclude editorial research notes',()=>{
  assert.equal(catalog.find(s=>s.id==='lovecraft').kind,'ficcion');
  assert.ok(catalog.find(s=>s.id==='borges'));
  assert.ok(catalog.find(s=>s.id==='thule'));
  assert.doesNotMatch(JSON.stringify(catalog),/pendientes de cotejo|No llamarlo|no convertirlo|por cotejar|por identificar|selección pendiente/i);
});
test('ornamental frame and visual ID are deterministic and do not alter recipes',()=>{
  const a=generate({text:'Floure',planet:'jupiter'}),saved=exportRecipe(a);
  assert.equal(plate(),plate());assert.match(plate(),/aria-hidden="true"/);
  assert.match(recipeFingerprint(a.recipe),/^[0-9A-F]{8}$/);
  assert.equal(recipeFingerprint(a.recipe),recipeFingerprint(importRecipe(saved).recipe));
  assert.notEqual(recipeFingerprint(a.recipe),recipeFingerprint({...a.recipe,rotation:25}));
  assert.equal(exportRecipe(a),saved);
});
test('byte panel displays actual UTF-8 and caps the visible dump',()=>{
  assert.deepEqual(inscriptionBytes('ÑA'),['C3','91','41']);
  assert.equal(inscriptionBytes('a'.repeat(100)).length,48);
});
