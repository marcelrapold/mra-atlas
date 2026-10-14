import test from 'node:test';
import assert from 'node:assert/strict';
import {validateDeck} from '../packages/brands/src/deck-validation.mjs';
import {brands,defineBrand,neutral,tokenDocument,dtcgTokens,toCssVariables,dtcgFoundation,dtcgColors,dtcgResolver,semanticTokens,derivedColorKeys} from '../packages/brands/src/index.mjs';
import {presentationTheme,presets,slides} from '../packages/brands/src/presentation.mjs';
import {slideScene} from '../packages/brands/src/slide-scene.mjs';
const evidence={id:'repo',path:'README.md',commit:'abc123',retrievedAt:'2026-09-11'};
const working={title:'Belegte Aussage',lead:{period:'2026',source:'repo'},sources:[evidence],takeaway:'Eine belegte Konsequenz',section:'project'};
const valid={decisionQuestion:'Nächste Phase freigeben?',sections:[{id:'project',title:'Projekt'}],slides:[{type:'agenda',title:'Agenda',items:['Projekt']},{...working,type:'karten-steckbrief',introducesSources:true},{...working,type:'kpi-board',metrics:[{value:5,unit:'Module',period:'2026',comparison:4,sourceId:'repo'}]},{...working,type:'entscheid-register',resolution:{kind:'decision',owner:'Projektleitung',dueDate:'2026-10-01'}}]};
test('deck contract accepts evidence chain and accountable section closure',()=>assert.equal(validateDeck(valid).valid,true));
test('deck contract catches the known content failures',()=>{const bad=structuredClone(valid);bad.slides[0].items=['Falscher Titel'];delete bad.slides[1].introducesSources;delete bad.slides[2].metrics[0].comparison;bad.slides[2].alarmCount=2;delete bad.slides[3].resolution.owner;const codes=validateDeck(bad).errors.map(e=>e.code);for(const c of ['agenda','sources-first','comparison','alarm-limit','accountability'])assert.ok(codes.includes(c),c);});
test('evidence must match the metric and must have been introduced earlier',()=>{const bad=structuredClone(valid);bad.slides[2].metrics[0].sourceId='unseen';const codes=validateDeck(bad).errors.map(e=>e.code);assert.ok(codes.includes('sources-first'));assert.ok(codes.includes('source-ref'));});
test('malformed input cannot silently pass or crash the deck validator',()=>{for(const change of [d=>{d.sections=[];d.slides=[];},d=>{d.slides[1].sources=[42];},d=>{d.slides[2].metrics[0].value={};},d=>{d.slides[3].resolution.dueDate='2026-02-31';},d=>{d.sections.push({...d.sections[0]});},d=>{d.slides[2].alarmCount=-1;}]){const d=structuredClone(valid);change(d);assert.equal(validateDeck(d).valid,false);}});
test('every preset resolves to implemented slide recipes and finite geometry',()=>{assert.equal(slides.length,18);assert.equal(presets.length,5);for(const brand of brands){const deck=presentationTheme(brand);assert.equal(Object.keys(deck.typography.scale).length,13);for(const preset of presets)for(const f of preset.folgen)assert.ok(slides.some(s=>s.id===f.typ));for(const s of slides)for(const n of slideScene(s.id,deck).nodes)for(const k of ['x','y','w','h'])assert.ok(Number.isFinite(n[k])&&n[k]>=0,`${s.id}/${k}`);}});
test('brand foundation overrides propagate to CSS and exports; injection rejected',()=>{const custom=defineBrand({...structuredClone(neutral),tokens:{spacing:{4:'18px'}}});assert.equal(toCssVariables(custom)['--spacing-4'],'18px');assert.equal(tokenDocument(custom).foundation.spacing[4],'18px');assert.throws(()=>defineBrand({...structuredClone(neutral),tokens:{spacing:{4:'url(https://example.com)'}}}));for(const brand of brands){const tokens=dtcgTokens(brand);assert.equal(tokens.primary.$value.colorSpace,'srgb');assert.equal(tokens.spacing['4'].$value.unit,'px');}});
test('rendered-preview digest ignores brand metadata that never reaches a slide', async () => {
  const {renderedBrandKeys}=await import('../scripts/reference-cache.mjs');
  for(const key of ['version','status','sources','presentation','genAI'])assert.ok(!renderedBrandKeys.includes(key),`${key} must not invalidate 72 committed renderings`);
  for(const key of ['id','name','modes','typography','shape','assets','deck'])assert.ok(renderedBrandKeys.includes(key),`${key} reaches the slide and must invalidate renderings`);
  const project=brand=>JSON.stringify(Object.fromEntries(renderedBrandKeys.map(k=>[k,brand[k]??null])));
  const documented={...structuredClone(brands.at(-1)),version:'9.9.9',status:'approved',sources:['brands/x/y.md'],presentation:{logoOnCover:false},genAI:{maxKeyVisualsPer12Slides:1}};
  assert.equal(project(documented),project(brands.at(-1)),'documentation-only edits must not force a re-render');
  const repainted={...structuredClone(brands.at(-1)),modes:{light:{...brands.at(-1).modes.light,primary:'#010203'}}};
  assert.notEqual(project(repainted),project(brands.at(-1)),'a changed colour must force a re-render');
  const staged={...structuredClone(brands.at(-1)),deck:{mode:'light'}};
  assert.notEqual(project(staged),project(brands.at(-1)),'a deck render contract must force a re-render');
});

// ---- DTCG 2025.10 integrity of the token exports ----
const isGroup=node=>node&&typeof node==='object'&&!Array.isArray(node)&&!('$value' in node);
function* leaves(node,path=[]){for(const [k,v] of Object.entries(node))if(!k.startsWith('$')){if(isGroup(v))yield* leaves(v,[...path,k]);else yield [[...path,k].join('.'),v];}}
const lookup=(doc,path)=>path.split('.').reduce((n,k)=>n?.[k],doc);
const isAlias=v=>typeof v==='string'&&/^\{[^{}]+\}$/.test(v);
/** Follows {alias} chains to a literal value; throws on cycles and dangling references. */
function resolve(doc,value,seen=[]){
  if(!isAlias(value))return value;
  const path=value.slice(1,-1);assert.ok(!seen.includes(path),`alias cycle: ${[...seen,path].join(' -> ')}`);
  const target=lookup(doc,path);assert.ok(target&&'$value' in target,`dangling alias ${value}`);
  return resolve(doc,target.$value,[...seen,path]);
}
const unit=(v,units)=>v&&typeof v==='object'&&Number.isFinite(v.value)&&units.includes(v.unit);
const validType={
  color:v=>v.colorSpace==='srgb'&&v.components.length===3&&v.components.every(c=>c>=0&&c<=1)&&v.alpha>=0&&v.alpha<=1&&/^#[0-9a-f]{6}$/i.test(v.hex),
  dimension:v=>unit(v,['px','rem']),duration:v=>unit(v,['ms','s']),number:Number.isFinite,
  fontWeight:v=>Number.isInteger(v)&&v>=1&&v<=1000,fontFamily:v=>typeof v==='string'||Array.isArray(v)&&v.length>0&&v.every(f=>typeof f==='string'&&f),
  cubicBezier:v=>Array.isArray(v)&&v.length===4&&v.every(Number.isFinite)&&v[0]>=0&&v[0]<=1&&v[2]>=0&&v[2]<=1,
};
const composite={typography:{fontFamily:'fontFamily',fontSize:'dimension',fontWeight:'fontWeight',letterSpacing:'dimension',lineHeight:'number'},shadow:{color:'color',offsetX:'dimension',offsetY:'dimension',blur:'dimension',spread:'dimension'}};
function assertDocument(doc,label){
  let count=0;
  for(const [path,token] of leaves(doc)){
    count++;const where=`${label}: ${path}`,type=token.$type;
    assert.ok(type in validType||type in composite,`${where}: $type ${type}`);
    const value=resolve(doc,token.$value);
    if(composite[type]){
      assert.deepEqual(Object.keys(value).sort(),Object.keys(composite[type]).sort(),where);
      for(const [part,partType] of Object.entries(composite[type])){
        assert.ok(validType[partType](resolve(doc,value[part])),`${where}.${part}`);
        if(isAlias(value[part]))assert.equal(lookup(doc,value[part].slice(1,-1)).$type,partType,`${where}.${part} references a ${partType}`);
      }
    }else assert.ok(validType[type](value),`${where}: ${JSON.stringify(token.$value)}`);
    if(isAlias(token.$value))assert.equal(lookup(doc,token.$value.slice(1,-1)).$type,type,`${where}: alias changes $type`);
  }
  for(const [key,group] of Object.entries(doc))if(!key.startsWith('$')&&isGroup(group))assert.equal(typeof group.$description,'string',`${label}: group ${key} needs a $description`);
  return count;
}
/** Minimal DTCG resolver: loads each $ref from `files` and deep-merges in resolutionOrder. */
function applyResolver(resolver,files,input){
  const merge=(a,b)=>{for(const [k,v] of Object.entries(b))a[k]=isGroup(v)&&isGroup(a[k])?merge({...a[k]},v):v;return a;};
  const load=sources=>sources.reduce((doc,s)=>{assert.ok(s.$ref in files,`unknown source ${s.$ref}`);return merge(doc,structuredClone(files[s.$ref]));},{});
  return resolver.resolutionOrder.reduce((doc,{$ref})=>{
    const [,kind,name]=$ref.split('/');
    if(kind==='sets')return merge(doc,load(resolver.sets[name].sources));
    const mod=resolver.modifiers[name],ctx=input[name]??mod.default;assert.ok(mod.contexts[ctx],`${name}=${ctx} has no context`);
    return merge(doc,load(mod.contexts[ctx]));
  },{});
}
const strip=({$description,...doc})=>Object.fromEntries(Object.entries(doc).filter(([,v])=>!v?.$deprecated));
test('DTCG exports: aliases resolve without cycles, every leaf has a valid $type and unit',()=>{
  for(const brand of brands){
    assert.ok(assertDocument(dtcgFoundation(brand),`${brand.id}/foundation`)>50);
    for(const mode of Object.keys(brand.modes)){
      assert.equal(assertDocument(dtcgColors(brand,mode),`${brand.id}/${mode}/color`),Object.keys(semanticTokens(brand,mode)).length);
      assertDocument(dtcgTokens(brand,mode),`${brand.id}/${mode}/merged`);
    }
  }
  const cyclic={a:{$type:'color',$value:'{b}'},b:{$type:'color',$value:'{a}'}};
  assert.throws(()=>resolve(cyclic,cyclic.a.$value),/alias cycle/);
});
test('DTCG colours are lossless: aliases for derived roles, values round-trip to CSS',()=>{
  for(const brand of brands)for(const mode of Object.keys(brand.modes)){
    const doc=dtcgColors(brand,mode),css=toCssVariables(brand,mode);
    for(const [key,token] of Object.entries(doc.color))if(!key.startsWith('$')){
      const value=resolve(doc,token.$value);
      assert.equal(value.hex,css[`--${key}`],`${brand.id}/${mode}/${key}`);
      assert.deepEqual(value.components.map(c=>Math.round(c*255)),[1,3,5].map(i=>parseInt(css[`--${key}`].slice(i,i+2),16)));
    }
    for(const key of ['info','info-foreground','sidebar','sidebar-foreground','sidebar-accent','sidebar-border','chart-1','chart-2','chart-3','chart-4','chart-5'])assert.ok(isAlias(doc.color[key].$value),`${key} is an alias`);
    for(const key of derivedColorKeys.filter(k=>k.startsWith('surface-'))){
      const mix=doc.color[key].$extensions['io.rapold.atlas'].mix;
      assert.equal(mix.with,'{color.card}');assert.equal(mix.weight,.08);assert.ok(isAlias(mix.color));
    }
  }
});
test('the resolver plus each context reproduces dtcgTokens; only shipped modes are contexts',()=>{
  for(const brand of [...brands,defineBrand({...structuredClone(neutral),id:'light-only',modes:{light:structuredClone(neutral.modes.light)}})]){
    const resolver=dtcgResolver(brand),modes=Object.keys(brand.modes);
    assert.equal(resolver.version,'2025.10');
    assert.deepEqual(Object.keys(resolver.modifiers.mode.contexts),modes);
    const files={[resolver.sets.foundation.sources[0].$ref]:dtcgFoundation(brand),...Object.fromEntries(modes.map(m=>[resolver.modifiers.mode.contexts[m][0].$ref,dtcgColors(brand,m)]))};
    for(const mode of modes)assert.deepEqual(strip(applyResolver(resolver,files,{mode})),strip(dtcgTokens(brand,mode)),`${brand.id}/${mode}`);
  }
});
test('legacy DTCG URLs keep their shape: root roles stay, marked deprecated',()=>{
  for(const brand of brands)for(const mode of Object.keys(brand.modes)){
    const doc=dtcgTokens(brand,mode);
    for(const [key,value] of Object.entries(semanticTokens(brand,mode))){
      assert.equal(doc[key].$value.hex,value);assert.equal(doc[key].$type,'color');
      assert.ok(doc[key].$deprecated.includes(`{color.${key}}`),key);
      assert.equal(resolve(doc,doc.color[key].$value).hex,value);
    }
    for(const group of ['spacing','fontSize','duration','easing','zIndex'])assert.ok(isGroup(doc[group]),group);
  }
  assert.equal('shadow' in dtcgFoundation(neutral),false,'shadow none is omitted');
  const shadow=dtcgFoundation(brands.find(b=>b.shape.shadow!=='none')).shadow.brand.$value;
  assert.deepEqual([shadow.offsetY,shadow.blur,shadow.color.hex,Math.round(shadow.color.alpha*255)],[{value:1,unit:'px'},{value:3,unit:'px'},'#000000',0x14]);
});
