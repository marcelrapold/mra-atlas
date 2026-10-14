import { foundationVariables, semanticTokens, resolveFoundation } from './foundation.mjs';
import { relativeLuminance } from './contrast.mjs';
export { foundation, resolveFoundation, semanticTokens, derivedColorKeys, tokenDocument, dtcgTokens, dtcgFoundation, dtcgColors, dtcgResolver } from './foundation.mjs';
export { contrast, relativeLuminance, apcaContrast, contrastPairs, auditBrand } from './contrast.mjs';
import neutralData from './neutral.json' with { type: 'json' };
import dominicanoExpressData from './dominicano-express.json' with { type: 'json' };
import rapoldData from './rapold.json' with { type: 'json' };
import radioxData from './radiox.json' with { type: 'json' };

export const colorKeys = Object.freeze(Object.keys(neutralData.modes.light));
const hex = /^#[0-9a-f]{6}$/i;
const length = /^(?:0|[1-9][0-9]?)(?:\.[0-9]+)?(?:px|rem)$/;
function keys(value, expected, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${name}: object required`);
  if (Object.keys(value).some(key => !expected.includes(key)) || expected.some(key => !(key in value))) throw new Error(`${name}: invalid keys`);
}
function optionalKeys(value, allowed, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${name}: object required`);
  keys(value, allowed.filter(key => key in value), name);
}
const rule = /^[A-Za-z0-9][A-Za-z0-9 ,.\u2013-]{0,63}$/;
const slug = /^[a-z][a-z0-9-]{0,47}$/;
const docPath = /^[-A-Za-z0-9_/]+\.md$/;
export const requiredBrandKeys = Object.freeze(['schemaVersion','id','name','version','status','modes','typography','shape','sources']);
export const optionalBrandKeys = Object.freeze(['palette','tokens','assets','presentation','genAI','deck']);
// Deck render contract: everything a renderer needs to stage a brand's slides.
// Image paths are repository-relative inside brands/<id>/ and PNG/JPG only.
export const deckLayouts=Object.freeze(['cover','section','content','closing']);
export const deckAnchors=Object.freeze(['top-left','top-right','bottom-left','bottom-right','top-center','bottom-center']);
const face=/^[A-Za-z0-9][A-Za-z0-9 '-]{0,63}$/;
const range=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
export const surfaceMode=surface=>surface.mode??(relativeLuminance(surface.fill)<.4?'dark':'light');
/** Every image file a brand's deck contract references (repository-relative, sorted). */
export function deckAssetPaths(brand){
  const d=brand.deck;
  return d?[...new Set([...Object.values(d.surfaces).map(s=>s.backdrop),d.logo.onDark,d.logo.onLight,...Object.values(d.supergraphic??{}).map(g=>g.path)].filter(Boolean))].sort():[];
}
function checkDeck(brand){
  const d=brand.deck,fail=path=>{throw new Error(`Invalid deck contract: ${path}`);};
  const image=(v,path)=>{
    if(typeof v==='string'&&/\.svg$/i.test(v))throw new Error(`Invalid deck contract: ${path} is SVG. Decks need PNG or JPG; put the SVG into brands/${brand.id}/assets/deck-src/ and run node scripts/build-deck-assets.mjs`);
    if(typeof v!=='string'||!v.startsWith(`brands/${brand.id}/`)||!/^[-A-Za-z0-9_/.]+\.(png|jpe?g)$/i.test(v)||v.split('/').some(s=>!s||s==='.'||s==='..'))fail(path);
  };
  const color=(v,path,refs=false)=>{if(typeof v!=='string'||!(hex.test(v)||refs&&brand.palette&&Object.hasOwn(brand.palette,v)))fail(path);};
  optionalKeys(d,['mode','surfaces','materials','glow','accents','type','logo','supergraphic','punctuation'],'deck');
  for(const key of ['mode','surfaces','materials','glow','accents','type','logo'])if(!(key in d))fail(key);
  if(!['light','dark'].includes(d.mode)||!brand.modes[d.mode])fail('mode');
  optionalKeys(d.surfaces,deckLayouts,'deck.surfaces');
  for(const key of ['cover','section','content'])if(!d.surfaces[key])fail(`surfaces.${key}`);
  for(const [key,s] of Object.entries(d.surfaces)){
    optionalKeys(s,['fill','backdrop','logo','mode','textWidthCm'],`deck.surfaces.${key}`);color(s.fill,`surfaces.${key}.fill`);
    if(s.backdrop!==undefined)image(s.backdrop,`surfaces.${key}.backdrop`);
    if(s.logo!==undefined&&typeof s.logo!=='boolean'){
      optionalKeys(s.logo,['anchor','heightCm'],`deck.surfaces.${key}.logo`);
      if(s.logo.anchor!==undefined&&!deckAnchors.includes(s.logo.anchor)||s.logo.heightCm!==undefined&&!range(s.logo.heightCm,.2,5))fail(`surfaces.${key}.logo`);
    }
    if(s.mode!==undefined&&!['light','dark'].includes(s.mode))fail(`surfaces.${key}.mode`);
    if(s.textWidthCm!==undefined&&!range(s.textWidthCm,10,32))fail(`surfaces.${key}.textWidthCm`);
    // Content slides keep the Atlas title zone top left; the logo must not sit on it.
    if(key==='content'&&s.logo&&['top-left','top-center'].includes(s.logo.anchor??d.logo?.anchor))fail(`surfaces.content.logo collides with the title zone; anchor it top-right or at the bottom`);
    if(!brand.modes[surfaceMode(s)])fail(`surfaces.${key} is ${surfaceMode(s)} but modes.${surfaceMode(s)} is missing`);
  }
  optionalKeys(d.materials,['panel','panelRaised','window'],'deck.materials');
  for(const key of ['panel','panelRaised'])if(!d.materials[key])fail(`materials.${key}`);
  for(const [key,m] of Object.entries(d.materials)){
    optionalKeys(m,['fill','fillOpacity','border','borderOpacity','borderPt','radiusCm','highlight'],`deck.materials.${key}`);
    color(m.fill,`materials.${key}.fill`);color(m.border,`materials.${key}.border`);
    if(!range(m.fillOpacity,0,1)||!range(m.borderOpacity,0,1)||!range(m.borderPt,0,6)||!range(m.radiusCm,0,3))fail(`materials.${key}`);
    if(m.highlight!==undefined){keys(m.highlight,['color','opacity'],`deck.materials.${key}.highlight`);color(m.highlight.color,`materials.${key}.highlight.color`);if(!range(m.highlight.opacity,0,1))fail(`materials.${key}.highlight`);}
  }
  keys(d.glow,['color','opacity','blurPt'],'deck.glow');color(d.glow.color,'glow.color',true);
  if(!range(d.glow.opacity,0,1)||!range(d.glow.blurPt,0,72))fail('glow');
  optionalKeys(d.accents,['primary','signal','chart','chartPrevious'],'deck.accents');
  for(const key of ['primary','signal','chartPrevious'])if(d.accents[key]!==undefined)color(d.accents[key],`accents.${key}`,true);
  if(!Array.isArray(d.accents.chart)||!d.accents.chart.length||d.accents.chart.length>8)fail('accents.chart');
  d.accents.chart.forEach((v,i)=>color(v,`accents.chart.${i}`,true));
  optionalKeys(d.type,['headingFace','bodyFace','displayFace','labelFace','headingWeight','capsTrackingEm','displayScale'],'deck.type');
  for(const key of ['headingFace','bodyFace','displayFace','labelFace'])if((key in d.type||key==='headingFace'||key==='bodyFace')&&(typeof d.type[key]!=='string'||!face.test(d.type[key])))fail(`type.${key}`);
  if(!range(d.type.capsTrackingEm,-.1,.5))fail('type.capsTrackingEm');
  if(d.type.displayScale!==undefined&&!range(d.type.displayScale,1,3))fail('type.displayScale');
  if(d.type.headingWeight!==undefined&&(!Number.isInteger(d.type.headingWeight)||d.type.headingWeight<100||d.type.headingWeight>900))fail('type.headingWeight');
  optionalKeys(d.logo,['onDark','onLight','aspectRatio','heightCm','anchor','plate','marginCm'],'deck.logo');
  for(const key of ['onDark','onLight','aspectRatio','heightCm','anchor','plate'])if(!(key in d.logo))fail(`logo.${key}`);
  image(d.logo.onDark,'logo.onDark');image(d.logo.onLight,'logo.onLight');
  if(!range(d.logo.aspectRatio,.1,100)||!range(d.logo.heightCm,.2,5)||!deckAnchors.includes(d.logo.anchor)||d.logo.plate!==false||d.logo.marginCm!==undefined&&!range(d.logo.marginCm,0,5))fail('logo');
  if(d.supergraphic!==undefined){
    optionalKeys(d.supergraphic,['cover','section','closing'],'deck.supergraphic');
    for(const [key,g] of Object.entries(d.supergraphic)){
      optionalKeys(g,['path','x','y','w','h','opacity'],`deck.supergraphic.${key}`);image(g.path,`supergraphic.${key}.path`);
      if(!range(g.x,-34,68)||!range(g.y,-19,38)||!range(g.w,.1,102)||!range(g.h,.1,57)||g.opacity!==undefined&&!range(g.opacity,0,1))fail(`supergraphic.${key}`);
    }
  }
  if(d.punctuation!==undefined){
    optionalKeys(d.punctuation,['glyph','onDark','onLight','scale','append'],'deck.punctuation');
    if(typeof d.punctuation.glyph!=='string'||!/^[.■-◿]$/u.test(d.punctuation.glyph))fail('punctuation.glyph');
    color(d.punctuation.onDark,'punctuation.onDark',true);color(d.punctuation.onLight,'punctuation.onLight',true);
    if(d.punctuation.scale!==undefined&&!range(d.punctuation.scale,.1,1)||d.punctuation.append!==undefined&&typeof d.punctuation.append!=='boolean')fail('punctuation');
  }
}
export function defineBrand(input) {
  keys(input, [...optionalBrandKeys.filter(key => input[key]), ...requiredBrandKeys], 'brand');
  if (input.schemaVersion !== 1 || !/^[a-z][a-z0-9-]*$/.test(input.id)) throw new Error('Invalid brand identity');
  if (typeof input.name !== 'string' || !input.name.trim() || !/^\d+\.\d+\.\d+$/.test(input.version)) throw new Error('Invalid brand metadata');
  if (!['baseline','draft','approved'].includes(input.status)) throw new Error('Invalid brand status');
  if (!input.modes || !input.modes.light || Object.keys(input.modes).some(k => !['light','dark'].includes(k))) throw new Error('Invalid modes');
  for (const [mode, colors] of Object.entries(input.modes)) {
    keys(colors, colorKeys, mode);
    for (const [key, value] of Object.entries(colors)) if (typeof value !== 'string' || !hex.test(value)) throw new Error(`Invalid color: ${mode}.${key}`);
  }
  keys(input.typography, ['family','bodyWeight','headingWeight',...(input.typography?.bodyFamily?['bodyFamily']:[]),...(input.typography?.headingFamily?['headingFamily']:[])], 'typography');
  if (typeof input.typography.family !== 'string' || !/^[A-Za-z0-9 ,"'-]+$/.test(input.typography.family)) throw new Error('Invalid font family');
  for(const key of ['bodyFamily','headingFamily'])if(input.typography[key]!==undefined&&(typeof input.typography[key]!=='string'||!/^[A-Za-z0-9 ,"'-]+$/.test(input.typography[key])))throw new Error('Invalid font face');
  for (const weight of [input.typography.bodyWeight,input.typography.headingWeight]) if (!Number.isInteger(weight) || weight < 100 || weight > 900) throw new Error('Invalid font weight');
  keys(input.shape, ['radius','shadow','buttonMinHeight'], 'shape');
  if (!length.test(input.shape.radius) || !length.test(input.shape.buttonMinHeight) || !['none','0 1px 3px #00000014'].includes(input.shape.shadow)) throw new Error('Invalid geometry');
  if (!Array.isArray(input.sources) || input.sources.some(s => typeof s !== 'string')) throw new Error('Invalid sources');
  if(input.assets){
    keys(input.assets,['logo'],'assets');
    const logo=input.assets.logo;keys(logo,['path','aspectRatio','background','padding'],'assets.logo');
    if(typeof logo.path!=='string'||!/^[-A-Za-z0-9_/]+\.(svg|png)$/.test(logo.path)||logo.path.startsWith('/')||logo.path.split('/').includes('..')||!Number.isFinite(logo.aspectRatio)||logo.aspectRatio<=0||logo.aspectRatio>100||!hex.test(logo.background)||!Number.isFinite(logo.padding)||logo.padding<0||logo.padding>.4)throw new Error('Invalid brand logo');
  }
  if(input.presentation){
    optionalKeys(input.presentation,['editorialDarkSurfaces','preferIconsForConcepts','preferMermaidForSystems','logoOnCover','preferredDiagramShare','preferredGenAiImages'],'presentation');
    for(const key of ['editorialDarkSurfaces','preferIconsForConcepts','preferMermaidForSystems','logoOnCover'])if(input.presentation[key]!==undefined&&typeof input.presentation[key]!=='boolean')throw new Error(`Invalid presentation contract: ${key}`);
    for(const key of ['preferredDiagramShare','preferredGenAiImages'])if(input.presentation[key]!==undefined&&(typeof input.presentation[key]!=='string'||!rule.test(input.presentation[key])))throw new Error(`Invalid presentation contract: ${key}`);
  }
  if(input.genAI){
    optionalKeys(input.genAI,['contract','families','maxKeyVisualsPer12Slides','logoGeneratedInImage'],'genAI');
    const {contract,families,maxKeyVisualsPer12Slides:maxKeyVisuals,logoGeneratedInImage}=input.genAI;
    if(contract!==undefined&&(typeof contract!=='string'||!docPath.test(contract)||contract.startsWith('/')||contract.split('/').includes('..')))throw new Error('Invalid GenAI contract');
    if(families!==undefined&&(!Array.isArray(families)||!families.length||families.length>8||families.some(f=>typeof f!=='string'||!slug.test(f))))throw new Error('Invalid GenAI families');
    if(maxKeyVisuals!==undefined&&(!Number.isInteger(maxKeyVisuals)||maxKeyVisuals<0||maxKeyVisuals>12))throw new Error('Invalid GenAI key visual budget');
    if(logoGeneratedInImage!==undefined&&typeof logoGeneratedInImage!=='boolean')throw new Error('Invalid GenAI logo rule');
  }
  if (input.palette) {
    if (typeof input.palette !== 'object' || Array.isArray(input.palette) || !Object.keys(input.palette).length || Object.keys(input.palette).length > 32) throw new Error('Invalid brand palette');
    for (const [key,value] of Object.entries(input.palette)) if (!/^[a-z][a-z0-9-]{0,31}$/.test(key) || typeof value !== 'string' || !hex.test(value)) throw new Error('Invalid palette color');
  }
  if(input.deck)checkDeck(input);
  resolveFoundation(input);
  const result = structuredClone(input);
  function freeze(value) { Object.values(value).forEach(v => { if (v && typeof v === 'object') freeze(v); }); return Object.freeze(value); }
  return freeze(result);
}
export const neutral = defineBrand(neutralData);
export const dominicanoExpress = defineBrand(dominicanoExpressData);
export const rapold = defineBrand(rapoldData);
export const radiox = defineBrand(radioxData);
export const brands = Object.freeze([neutral, dominicanoExpress, rapold, radiox]);

export function toCssVariables(brand, requestedMode = 'light') {
  const mode = requestedMode === 'dark' && brand.modes.dark ? 'dark' : 'light';
  return Object.fromEntries([
    ...Object.entries(foundationVariables(brand)),
    ...Object.entries(brand.palette ?? {}).map(([key,value]) => [`--brand-color-${key}`,value]),
    ['--brand-heading-font',brand.typography.headingFamily ? `"${brand.typography.headingFamily}", ${brand.typography.family}` : brand.typography.family],
    ...Object.entries(semanticTokens(brand,mode)).map(([key,value]) => [`--${key}`,value]),
    ['--radius',brand.shape.radius], ['--font-mono','ui-monospace, SFMono-Regular, Menlo, monospace'], ['--brand-font',brand.typography.family], ['--brand-body-weight',brand.typography.bodyWeight],
    ['--brand-heading-weight',brand.typography.headingWeight], ['--brand-radius',brand.shape.radius],
    ['--brand-shadow',brand.shape.shadow], ['--brand-button-height',brand.shape.buttonMinHeight],
  ]);
}
/** Splits the CSS variables into mode-independent values and per-mode colour roles. */
export function cssVariableSets(brand) {
  const names=Object.keys(brand.modes),vars=Object.fromEntries(names.map(m=>[m,toCssVariables(brand,m)]));
  const roles=new Set(Object.keys(semanticTokens(brand)).map(key=>`--${key}`)),shared={},modes=Object.fromEntries(names.map(m=>[m,{}]));
  for(const [key,value] of Object.entries(vars.light)){
    if(!roles.has(key)&&names.every(m=>vars[m][key]===value))shared[key]=value;
    else for(const m of names)modes[m][key]=vars[m][key];
  }
  return {shared,modes};
}
/**
 * One embeddable stylesheet per brand. `data-brand` alone follows the system
 * colour scheme through light-dark(); `data-mode` (same element or a nested
 * section) forces a scheme. Zero specificity, so products can override.
 */
export function toCssText(brand) {
  const {shared,modes:{light,dark}}=cssVariableSets(brand),scope=`[data-brand="${brand.id}"]`;
  const lines=[`  color-scheme: ${dark?'light dark':'light'};`,...Object.entries(shared).map(([k,v])=>`  ${k}: ${v};`),...Object.entries(light).map(([k,v])=>`  ${k}: ${dark?`light-dark(${v}, ${dark[k]})`:v};`)];
  const force=mode=>`:where(${scope}[data-mode="${mode}"], ${scope} [data-mode="${mode}"]) { color-scheme: ${mode}; }\n`;
  return `/* Atlas tokens · ${brand.id} · generated by scripts/build-token-exports.mjs, do not edit */\n:where(${scope}) {\n${lines.join('\n')}\n}\n${dark?force('light')+force('dark'):''}`;
}
