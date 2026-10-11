import { foundationVariables, semanticTokens, resolveFoundation } from './foundation.mjs';
export { foundation, resolveFoundation, semanticTokens, tokenDocument, dtcgTokens } from './foundation.mjs';
import neutralData from './neutral.json' with { type: 'json' };
import goldbachData from './goldbach.json' with { type: 'json' };
import sygnumData from './sygnum.json' with { type: 'json' };
import dominicanoExpressData from './dominicano-express.json' with { type: 'json' };
import rapoldData from './rapold.json' with { type: 'json' };

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
export const optionalBrandKeys = Object.freeze(['palette','tokens','assets','presentation','genAI']);
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
  resolveFoundation(input);
  const result = structuredClone(input);
  function freeze(value) { Object.values(value).forEach(v => { if (v && typeof v === 'object') freeze(v); }); return Object.freeze(value); }
  return freeze(result);
}
export const neutral = defineBrand(neutralData);
export const goldbach = defineBrand(goldbachData);
export const sygnum = defineBrand(sygnumData);
export const dominicanoExpress = defineBrand(dominicanoExpressData);
export const rapold = defineBrand(rapoldData);
export const brands = Object.freeze([neutral, goldbach, sygnum, dominicanoExpress, rapold]);

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

export function contrast(a,b) {
  const luminance = hex => {
    const [r,g,b] = hex.slice(1).match(/../g).map(v => parseInt(v,16)/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4);
    return .2126*r + .7152*g + .0722*b;
  };
  const x=luminance(a),y=luminance(b);
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
