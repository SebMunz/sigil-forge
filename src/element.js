import {VERSION,defaults,generate,toSVG,exportRecipe,importRecipe,escapeXML,normalize} from './engine.js';
import {sources,correspondences} from './sources.js';
import {catalog,families,kindLabels} from './catalog.js';
import {plate,recipeFingerprint,inscriptionBytes} from './ornament.js';
import {mothersFromText} from './geomancy.js';

export class SigilForge extends HTMLElement {
  constructor(){super();this.attachShadow({mode:'open'});this._recipe={...defaults};this._guides=false;this._legacyArtifact=null;}
  connectedCallback(){if(this.shadowRoot.childElementCount)return;this.mount();}
  get recipe(){return {...this._recipe};}
  set recipe(value){this._legacyArtifact=null;const artifact=generate(value);this._recipe=artifact.recipe;if(this.isConnected){this.sync();this.update();}}
  get artifact(){return this._legacyArtifact||generate(this._recipe);}
  mount(){
    this.shadowRoot.innerHTML=`<link rel="stylesheet" href="${new URL('./workshop.css',import.meta.url).href}">
      <div class="workshop"><div class="crt-sweep atmospheric" aria-hidden="true"></div>
      <header><a class="brand" href="#" aria-label="Sigil Forge, inicio"><span class="brand-mark" aria-hidden="true">⌘</span><span>ALCHEMICAL<br>FIRMWARE</span></a><div class="edition">NECROTECHNOMICON <span>/</span> SIGIL ENGINE</div><span class="version"><i></i> LOCAL EXECUTION · v0.4</span></header>
      <div class="boot-ribbon atmospheric" aria-hidden="true"><span>RECOVERED : BLACK_BIOS / SIGIL_FORGE.EXE</span><span>PALIMPSEST 0x0A // DO NOT EXORCISE</span></div>
      <main>
      <div class="masthead"><div><p class="eyebrow">[ VISUAL CORE ] / INSTRUMENTO DE INSCRIPCIÓN</p><h1>SIGIL FORGE</h1></div><div class="station-note"><span>BLACK BIOS RING0 / 001</span><p>Compila una intención.<br>Conserva la fórmula.</p></div></div>
      <div class="layout">
      <form class="controls" novalidate><div class="rail-title"><span>OPERADOR / 0xF10VЯ_3</span><span class="rail-label">INSCRIPTION BUS</span></div><div class="rail-shrine atmospheric" aria-hidden="true"><div class="rail-seal">${plate('rail-seal-path')}</div><div class="glyph-ribbon">⊹ ╲ ∴ ⌁ ⊕ ╳ ⫶ ⋈ ⌁ ∴ ╱ ⊹</div><div class="shrine-caption">MONAS / SILICON / 0xF10VЯ_3</div></div>
        <section><h2><span>01</span> La inscripción</h2><label for="intent">Nombre, palabra o intención</label><textarea id="intent" name="text" maxlength="280" rows="3" spellcheck="false">Floure</textarea><div class="field-meta"><span>LATÍN A–Z · TILDES NORMALIZADAS</span><output id="count">6 / 280</output></div></section>
        <section><h2><span>02</span> El método</h2><div class="method-list" role="group" aria-label="Método de construcción">
          <label class="method"><input type="radio" name="method" value="planetary" checked><span><strong>Cuadrado planetario</strong><small>Agrippa / matriz y recorrido</small></span><b>↗</b></label>
          <label class="method"><input type="radio" name="method" value="letters"><span><strong>Fusión de letras</strong><small>Spare / composición adaptada</small></span><b>⌁</b></label>
          <label class="method"><input type="radio" name="method" value="hybrid"><span><strong>Ligadura bicolor</strong><small>Ruta planetaria / glifo ligado</small></span><b>⋈</b></label><label class="method"><input type="radio" name="method" value="geomantic"><span><strong>Escudo geomántico</strong><small>Madres / testigos / juez</small></span><b>∴</b></label>
        </div><label for="planet">Matriz planetaria</label><select id="planet" name="planet"><option value="saturn">Saturno · 3 × 3</option><option value="jupiter">Júpiter · 4 × 4</option><option value="mars">Marte · 5 × 5</option><option value="sun">Sol · 6 × 6</option><option value="venus">Venus · 7 × 7</option><option value="mercury">Mercurio · 8 × 8</option><option value="moon">Luna · 9 × 9</option></select><div id="geomancy-controls" class="geomancy-controls" hidden><div class="geomancy-heading"><span>CUATRO MADRES</span><button type="button" id="derive-mothers">Derivar del texto</button></div><div id="mothers-grid" class="mothers-grid"></div></div><input type="hidden" name="mothers" value="">
        <label class="check"><input type="checkbox" name="correspondence">Correspondencia hermética · 777</label>
        <details class="filters"><summary>Preparación de letras</summary><label class="check"><input type="checkbox" name="deduplicate">Conservar solo letras únicas</label><label class="check"><input type="checkbox" name="removeVowels">Retirar vocales · filtro artístico</label></details></section>
        <section><h2><span>03</span> La materia</h2><div class="range-label"><label for="rotation">Rotación</label><output id="rotation-value">0°</output></div><input id="rotation" type="range" name="rotation" min="0" max="360" value="0"><div class="range-label"><label for="stroke">Grosor de tinta</label><output id="stroke-value">3</output></div><input id="stroke" type="range" name="stroke" min="1" max="8" step="0.5" value="3"><div class="finish"><label class="check"><input type="checkbox" name="ring" checked>Anillos</label><label class="check"><input type="checkbox" name="mirror">Espejar</label></div><div class="ink-pair"><label class="ink">Tinta <input type="color" name="ink" value="#e29930" aria-label="Color de tinta"></label><label class="ink" id="accent-control" hidden>Contratinta <input type="color" name="accentInk" value="#b8d0be" aria-label="Color de contratinta"></label></div></section>
      </form>
      <section class="canvas-section" aria-label="Vista previa del sigilo"><div class="canvas-stage"><div class="canvas-toolbar"><span id="classification">ADAPTACIÓN DOCUMENTADA</span><div class="view-options"><label class="check"><input id="atmosphere" type="checkbox" checked>Atmósfera</label><label class="check"><input id="guides" type="checkbox">Ver guías</label></div></div><div class="canvas"><div class="engraving" aria-hidden="true">${plate()}</div><span class="canvas-index">FIG. 001 / LAMINA DE INSCRIPCION</span><span class="canvas-footnote">BLACK BIOS / INSCRIPTION BUS</span><span class="corner tl"></span><span class="corner tr"></span><span class="corner bl"></span><span class="corner br"></span><div id="preview"></div><div id="empty" hidden>La inscripción espera una letra.</div><span class="axis top">N</span><span class="axis bottom">S</span><span class="axis left">O</span><span class="axis right">E</span></div><div class="canvas-caption"><div><span class="eyebrow">PIEZA ACTUAL</span><h2 id="piece-title">FLOURE / SATURNO</h2><div id="ink-legend" class="ink-legend" hidden><span><i id="route-swatch"></i>TRAZADO</span><span><i id="letter-swatch"></i>LIGADURA</span></div></div><span id="correspondence-label">TRAZO REPRODUCIBLE</span></div><p id="error" class="error" role="alert" hidden></p><div class="exports"><button type="button" id="svg" class="primary">Descargar SVG <span>↗</span></button><button type="button" id="png">PNG</button><button type="button" id="json">Receta JSON</button><button type="button" id="import">Abrir receta</button><input id="file" type="file" accept="application/json,.json" hidden></div><p id="status" class="status" role="status" aria-live="polite"></p></div><div class="boot-fragments atmospheric" aria-hidden="true"><section><h3>:: BOOT SECTOR RITE ::</h3><p>0000 <b>4E 45</b> 43 52 4F 54</p><p>0010 42 49 4F 53 <b>00 FF</b></p><div class="fragment-bars"></div></section><section><h3>:: INTERRUPT TABLE ::</h3><div class="interrupt-grid"><span>13</span><b>21</b><span>2F</span><b>33</b><span>80</span><span>A7</span><span>C0</span><span>DE</span><b>EF</b><span>FF</span><span>04</span><b>7B</b></div></section><section><h3>:: SILICON RELIQUARY ::</h3><div class="relic-seal">${plate('relic-seal-path')}</div><p>╲ ∴ ⊕ ╳ ⫶ ⋈ ╱</p></section><section><h3>:: PALIMPSEST LOG ::</h3><p>RING0 / <b>ASH IN THE BUS</b></p><p>0x0A / THE WORD REMAINS</p><p><b>DE AD</b> / NEVER ZERO</p><div class="fragment-bars"></div></section></div></section>
      <aside class="marginalia" aria-label="Lectura de la receta">
        <section class="margin-panel omen-panel atmospheric" aria-hidden="true"><h2>:: RECOVERED OMEN SCROLL ::</h2><div class="omen-seal">${plate('omen-seal-path')}</div><div class="glyph-ribbon">⊹ ╲ ∴ ⊕ ╳ ⫶ ⋈ ╱ ⊹</div><p class="omen-verse">BEHOLD THE TRACE<br>BETWEEN THE ADDRESSES.<br><br>THROUGH COPPER.<br>THROUGH SILENCE.<br>THE INSCRIPTION REMAINS.</p><div class="omen-barcode"></div></section>
        <section class="margin-panel"><h2>:: SEAL TELEMETRY ::</h2><dl class="telemetry"><div><dt id="stat-matrix-label">MATRIZ</dt><dd id="stat-matrix">3 × 3</dd></div><div><dt id="stat-sum-label">CONSTANTE</dt><dd id="stat-sum">15</dd></div><div><dt>LETRAS</dt><dd id="stat-letters">6</dd></div><div><dt>TRAZOS</dt><dd id="stat-strokes">1</dd></div><div><dt>FUENTES ACTIVAS</dt><dd id="stat-sources">1</dd></div></dl></section>
        <section class="margin-panel oracle-panel atmospheric" aria-hidden="true"><h2>:: HEX ORACLE DUMP ::</h2><div class="oracle-row"><span>0043</span>4E 45 <b>43 52</b> 4F 54 45 43</div><div class="oracle-row"><span>0050</span>48 4E 4F <b>4D 49</b> 43 4F 4E</div><div class="oracle-row"><span>0060</span><b>DE AD</b> 0A 66 6F 72 <b>C0 DE</b></div><div class="oracle-row"><span>0070</span>52 49 4E 47 <b>30 00</b> FF 13</div></section>
        <section class="margin-panel null-panel atmospheric" aria-hidden="true"><h2>:: NULL REGISTER ::</h2><div><span>0x CIRCLE ........</span><b>BOUND</b></div><div><span>0x HOST ..........</span><b>UNWRITTEN</b></div><div><span>0x LISTENER ......</span><b>UNKNOWN</b></div><p class="register-glyphs">⊕ ∴ ╳ ⌁ ⫶ ⋈</p></section>
        <section class="margin-panel"><h2>:: INSCRIPCIÓN UTF-8 ::</h2><p id="byte-dump" class="byte-dump"></p></section>
        <section class="margin-panel recipe-panel"><h2>:: RECIPE IMPRINT ::</h2><p id="recipe-code" class="recipe-code"></p><div id="seal-echo" class="seal-echo"></div></section>
        <p class="margin-colophon">THE ANCIENT HARDWARE<br>IS THE DOOR.<br><span>WE ARE THE EXECUTABLE.</span></p></aside>
      </div>
      <section class="trace"><div class="trace-heading"><p class="eyebrow">EL RASTRO / PROCESO VISIBLE</p><h2>ANATOMÍA DE LA INSCRIPCIÓN</h2></div><div class="trace-columns"><div><h3 id="trace-input-label">01 / LETRAS</h3><p id="letters" class="sequence"></p><p id="normalization" class="muted"></p></div><div><h3>02 / TRANSFORMACIÓN</h3><p id="numbers" class="sequence"></p><p id="mapping" class="muted"></p></div><div><h3>03 / PROCEDENCIA</h3><div id="provenance"></div></div></div></section>
      <section class="library"><div class="library-heading"><div><p class="eyebrow">BIBLIOTECA / ABIERTA A EXPANSIÓN</p><h2>ARCHIVO DE REFERENCIAS</h2></div></div><div class="archive-controls"><label class="archive-search" for="archive-search">BUSCAR EN EL ARCHIVO<input type="search" id="archive-search" placeholder="Autor, obra, símbolo o sistema…"></label><label for="archive-kind">CORPUS<select id="archive-kind"><option value="all">Todas las referencias</option><option value="historia">Historia</option><option value="tradicion">Tradiciones</option><option value="ficcion">Ficción</option><option value="arte">Arte</option><option value="investigacion">Investigación</option></select></label><p id="archive-count" role="status"></p></div><div id="source-list"></div><button type="button" id="archive-more">Ampliar archivo</button></section>
      </main><footer><span>ALCHEMICAL FIRMWARE / CRT COVEN</span><span>BROADCASTING FROM BLACK BIOS RING0</span></footer></div>`;
    this.$('form').addEventListener('submit',e=>e.preventDefault());
    this.$('form').addEventListener('input',()=>{this.$('#status').textContent=this._legacyArtifact?'Receta actualizada a v0.3.':'';this._legacyArtifact=null;this.read();this.update();});
    this.$('#guides').addEventListener('change',e=>{this._guides=e.target.checked;this.update();});
    this.$('#svg').addEventListener('click',()=>this.download(toSVG(this.artifact),'image/svg+xml','sigil.svg'));
    this.$('#json').addEventListener('click',()=>this.download(exportRecipe(this.artifact),'application/json','sigil-recipe.json'));
    this.$('#png').addEventListener('click',()=>this.png());
    this.$('#import').addEventListener('click',()=>this.$('#file').click());
    this.$('#file').addEventListener('change',async e=>{
      const input=e.target;const file=input.files[0]; if(!file)return;
      try{if(file.size>32000)throw new Error('El archivo supera 32 KB.');const imported=importRecipe(await file.text());this._legacyArtifact=imported.engine!==VERSION?imported:null;this._recipe={...defaults,...imported.recipe};this.sync();this.update();this.$('#status').textContent=imported.engine!==VERSION?'Receta v'+imported.engine.split('.').slice(0,2).join('.')+' restaurada.':'Receta restaurada.';}
      catch(error){this.$('#status').textContent=`No se abrió la receta: ${error.message}`;}
      finally{input.value='';}
    });
    this.$('#atmosphere').addEventListener('change',e=>this.$('.workshop').classList.toggle('quiet',!e.target.checked));
    for(const id of ['archive-search','archive-kind'])this.$('#'+id).addEventListener('input',()=>{this._expanded=false;this.renderLibrary();});
    this.$('#archive-more').addEventListener('click',()=>{this._expanded=true;this.renderLibrary();});
    this.$('#mothers-grid').addEventListener('click',e=>{
      const button=e.target.closest('button[data-line]');if(!button)return;
      const index=Number(button.dataset.line),seed=(this._recipe.mothers||mothersFromText(normalize(this._recipe.text))).split('');
      seed[index]=seed[index]==='1'?'2':'1';this._recipe.mothers=seed.join('');
      this.$('input[name="mothers"]').value=this._recipe.mothers;this._legacyArtifact=null;this.update();
      this.$('#mothers-grid button[data-line="'+index+'"]').focus();
    });
    this.$('#derive-mothers').addEventListener('click',()=>{this._recipe.mothers='';this.$('input[name="mothers"]').value='';this._legacyArtifact=null;this.update();});
    this.renderLibrary();
    this.sync();this.update();
  }
  renderMothers(seed){
    this.$('#mothers-grid').innerHTML=Array.from({length:4},(_,i)=>'<div class="mother"><span>'+['I','II','III','IV'][i]+'</span>'+[...seed.slice(i*4,i*4+4)].map((count,line)=>'<button type="button" data-line="'+(i*4+line)+'" aria-label="Madre '+(i+1)+', línea '+(line+1)+': '+count+' puntos">'+(count==='1'?'•':'••')+'</button>').join('')+'</div>').join('');
  }
  renderLibrary(){
    const normalize=value=>value.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
    const query=normalize(this.$('#archive-search').value),kind=this.$('#archive-kind').value;
    const matches=catalog.filter(s=>(kind==='all'||s.kind===kind)&&normalize([s.author,s.title,families[s.family]].join(' ')).includes(query));
    const visible=this._expanded?matches:matches.slice(0,12);
    this.$('#archive-count').textContent=matches.length+' / '+catalog.length+' REFERENCIAS';
    this.$('#source-list').innerHTML=visible.length?visible.map(s=>'<details class="source"><summary><span class="source-author">'+escapeXML(s.author)+'</span><span class="source-title">'+escapeXML(s.title)+'</span><span class="source-kind">'+escapeXML(kindLabels[s.kind])+'</span><span class="source-status">'+escapeXML(s.year||'')+'</span></summary><div class="source-body"><p class="source-family">'+escapeXML(families[s.family])+'</p>'+(s.url?'<a href="'+escapeXML(s.url)+'" target="_blank" rel="noopener noreferrer">Abrir referencia ↗</a>':'')+'</div></details>').join(''):'<p class="archive-empty">Sin coincidencias.</p>';
    this.$('#archive-more').hidden=visible.length===matches.length;
    this.$('#archive-more').textContent='Mostrar '+(matches.length-visible.length)+' referencias restantes';
  }
  $(selector){return this.shadowRoot.querySelector(selector);}
  read(){const form=this.$('form');for(const [name,value] of Object.entries(defaults)) {const input=form.elements.namedItem(name);this._recipe[name]=typeof value==='boolean'?input.checked:typeof value==='number'?Number(input.value):input.value;}}
  sync(){const form=this.$('form');for(const [name,value] of Object.entries(this._recipe)){const input=form.elements.namedItem(name);if(typeof value==='boolean')input.checked=value;else input.value=value;}}
  update(){
    const r=this._recipe;
    this.$('#count').textContent=`${r.text.length} / 280`;this.$('#rotation-value').textContent=`${r.rotation}°`;this.$('#stroke-value').textContent=r.stroke;
    this.$('#planet').disabled=r.method==='geomantic'||(r.method==='letters'&&!r.correspondence);
    this.$('input[name=correspondence]').disabled=r.method==='geomantic';
    this.$('#geomancy-controls').hidden=r.method!=='geomantic';
    this.$('#guides').disabled=r.method==='letters';
    this.$('#error').hidden=true;
    try{
      const a=this.artifact;
      const bicolor=r.method==='hybrid'&&a.engine!=='0.1.0';
      this.$('#accent-control').hidden=!bicolor;
      this.$('#ink-legend').hidden=!bicolor;
      this.$('#route-swatch').style.backgroundColor=r.ink;
      this.$('#letter-swatch').style.backgroundColor=r.accentInk;
      this.$('#preview').innerHTML=toSVG(a,{guides:this._guides});this.$('#empty').hidden=true;
      this.$('#classification').textContent=({planetary:'TRAZADO PLANETARIO',letters:'FUSIÓN DE LETRAS',hybrid:'LIGADURA BICOLOR',geomantic:'ESCUDO GEOMÁNTICO'})[r.method];
      this.$('#piece-title').textContent=`${a.normalized.slice(0,32)||'ESCUDO'} / ${r.method==='geomantic'?'GEOMANCIA':r.method==='letters'?'LETRAS':correspondences[r.planet].planet.toUpperCase()}`;
      this.$('#correspondence-label').textContent=a.geomancy?'JUEZ / '+a.geomancy.judgeName:a.correspondence?`${a.correspondence.number} / ${a.correspondence.name} · ${a.correspondence.planet}`:'TRAZO REPRODUCIBLE';
      this.$('#trace-input-label').textContent=a.geomancy?'01 / MADRES':'01 / LETRAS';
      this.$('#letters').textContent=a.geomancy?a.geomancy.mothers.map((m,i)=>['I','II','III','IV'][i]+' '+m.join('')).join(' · '):a.letters.split('').join(' ');
      this.$('#normalization').textContent=a.geomancy?(r.mothers?'SEMILLA MANUAL':'SEMILLA DE TEXTO'):`${a.normalized.length} NORMALIZADAS / ${a.letters.length} INSCRITAS`;
      this.$('#numbers').textContent=a.geomancy?'HIJAS '+a.geomancy.daughters.map(d=>d.join('')).join(' · '):a.numbers.length?a.numbers.join(' · '):'LETRA → TRAZO → FUSIÓN';
      this.$('#mapping').textContent=a.geomancy?'TESTIGOS '+a.geomancy.witnesses.map(w=>w.join('')).join(' / ')+' → JUEZ '+a.geomancy.judge.join(''):a.matrix?`A=1…Z=26 / MÓDULO ${a.matrix.length**2}`:'ALFABETO MONOLINEAL';
      this.$('#provenance').innerHTML=a.sourceIds.map(id=>{const s=sources.find(s=>s.id===id);return `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${escapeXML(s.author)} ↗</a>`;}).join('');
      this.$('#seal-echo').innerHTML=toSVG(a).replaceAll('sigil-title','echo-title');
      this.$('#stat-matrix-label').textContent=a.geomancy?'FIGURAS':'MATRIZ';
      this.$('#stat-sum-label').textContent=a.geomancy?'JUEZ':'CONSTANTE';
      this.$('#stat-matrix').textContent=a.geomancy?15:a.matrix?a.matrix.length+' × '+a.matrix.length:'—';
      this.$('#stat-sum').textContent=a.geomancy?a.geomancy.judge.join(''):a.matrix?a.matrix[0].reduce((x,y)=>x+y,0):'—';
      this.$('#stat-letters').textContent=a.letters.length;
      this.$('#stat-strokes').textContent=a.strokes.length;
      this.$('#stat-sources').textContent=a.sourceIds.length;
      this.$('#byte-dump').textContent=inscriptionBytes(r.text).join(' ');
      this.$('#recipe-code').textContent=recipeFingerprint(a.recipe);
      if(a.geomancy){
        this.renderMothers(a.geomancy.seed);
      }
      this.buttons(false);this.dispatchEvent(new CustomEvent('sigil-change',{detail:a,bubbles:true,composed:true}));
    }catch(error){
      if(r.method==='geomantic')this.renderMothers(r.mothers||mothersFromText(normalize(r.text)));
      this.$('#preview').replaceChildren();this.$('#empty').hidden=false;this.$('#error').hidden=false;this.$('#error').textContent=error.message;this.$('#classification').textContent='INSCRIPCIÓN PENDIENTE';this.$('#piece-title').textContent='SIN PIEZA';this.$('#correspondence-label').textContent='';
      for(const id of ['letters','numbers','mapping','normalization','provenance'])this.$(`#${id}`).replaceChildren();this.buttons(true);
      this.$('#seal-echo').replaceChildren();
      for(const id of ['stat-matrix','stat-sum','stat-letters','stat-strokes','stat-sources','byte-dump','recipe-code'])this.$('#'+id).textContent='—';
    }
  }
  buttons(disabled){for(const id of ['svg','png','json'])this.$(`#${id}`).disabled=disabled;}
  download(data,type,name){const url=URL.createObjectURL(new Blob([data],{type}));const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);this.$('#status').textContent=`Exportado: ${name}`;}
  async png(){
    const url=URL.createObjectURL(new Blob([toSVG(this.artifact)],{type:'image/svg+xml'}));const button=this.$('#png');button.disabled=true;
    try{const image=new Image();image.src=url;await image.decode();const canvas=document.createElement('canvas');canvas.width=canvas.height=1800;const context=canvas.getContext('2d');if(!context)throw new Error('Canvas no disponible.');context.drawImage(image,0,0,1800,1800);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('No se pudo crear el PNG.');this.download(blob,'image/png','sigil.png');}
    catch(error){this.$('#status').textContent=`Error de exportación: ${error.message}`;}
    finally{URL.revokeObjectURL(url);try{this.artifact;button.disabled=false;}catch{button.disabled=true;}}
  }
}
if(!customElements.get('sigil-forge'))customElements.define('sigil-forge',SigilForge);
