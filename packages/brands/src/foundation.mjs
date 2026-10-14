import foundation from './foundation.json' with { type: 'json' };
export { foundation };
export function resolveFoundation(brand) {
  const result=structuredClone(foundation);
  for(const [group,values] of Object.entries(brand.tokens ?? {})) {
    if(!result[group] || typeof result[group] !== 'object') throw new Error(`Unknown token group: ${group}`);
    for(const [key,value] of Object.entries(values)) {
      const baseline=result[group][key];
      if(baseline === undefined || typeof value !== typeof baseline) throw new Error(`Invalid token: ${group}.${key}`);
      if(typeof value === 'number' && (!Number.isFinite(value) || value<0)) throw new Error(`Invalid number: ${group}.${key}`);
      if(typeof value === 'string' && !/^(?:[\d.]+(?:px|rem|ms)|cubic-bezier\([\d., -]+\))$/.test(value)) throw new Error(`Invalid CSS: ${group}.${key}`);
      result[group][key]=value;
    }
  }
  return result;
}
const cssName=group=>group.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());
export function foundationVariables(brand) {
  const tokens=resolveFoundation(brand);
  return Object.fromEntries(Object.entries(tokens).filter(([,v])=>typeof v==='object').flatMap(([group,values])=>Object.entries(values).map(([key,value])=>[`--${cssName(group)}-${key}`,value])));
}
// Derived roles, in output order. A string aliases a base role; `mix` blends the
// role into `with` at `weight` (sRGB, per channel, rounded); `value` is fixed.
const SURFACE_WEIGHT=.08;
const derived=Object.freeze({
  'info':'primary','info-foreground':'primary-foreground','sidebar':'card','sidebar-foreground':'card-foreground','sidebar-accent':'accent','sidebar-border':'border','overlay':{value:'#000000'},
  'chart-1':'primary','chart-2':'success','chart-3':'warning','chart-4':'destructive','chart-5':'muted-foreground',
  'surface-info':{mix:'primary',with:'card',weight:SURFACE_WEIGHT},'surface-success':{mix:'success',with:'card',weight:SURFACE_WEIGHT},'surface-warning':{mix:'warning',with:'card',weight:SURFACE_WEIGHT},'surface-danger':{mix:'destructive',with:'card',weight:SURFACE_WEIGHT},
});
export const derivedColorKeys=Object.freeze(Object.keys(derived));
const mix=(a,b,t)=>'#'+[0,2,4].map(i=>Math.round(parseInt(a.slice(1+i,3+i),16)*t+parseInt(b.slice(1+i,3+i),16)*(1-t)).toString(16).padStart(2,'0')).join('');
const modeOf=(brand,mode)=>brand.modes[mode]?mode:'light';
export function semanticTokens(brand, mode='light') {
  const c=brand.modes[modeOf(brand,mode)];
  return {...c,...Object.fromEntries(Object.entries(derived).map(([key,rule])=>[key,typeof rule==='string'?c[rule]:rule.value??mix(c[rule.mix],c[rule.with],rule.weight)]))};
}
export function tokenDocument(brand,mode='light') {
 return {schemaVersion:1,brand:brand.id,mode:modeOf(brand,mode),foundation:resolveFoundation(brand),semantic:semanticTokens(brand,mode),palette:brand.palette??{},typography:brand.typography,shape:brand.shape};
}

// ---- DTCG 2025.10 -------------------------------------------------------
const NS='io.rapold.atlas';
const color=hex=>({colorSpace:'srgb',components:hex.slice(1,7).match(/../g).map(x=>parseInt(x,16)/255),alpha:hex.length===9?parseInt(hex.slice(7),16)/255:1,hex:hex.slice(0,7)});
const dim=value=>{const m=/^(-?[\d.]+)(px|rem)$/.exec(value);if(!m)throw new Error(`Not a DTCG dimension: ${value}`);return {value:parseFloat(m[1]),unit:m[2]};};
/** Font stack string to a DTCG fontFamily array, quotes removed, duplicates dropped. */
const fontStack=(...stacks)=>[...new Set(stacks.flatMap(s=>s.split(',')).map(s=>s.trim().replace(/^["']|["']$/g,'')).filter(Boolean))];
const groupText={
  color:'Semantic colour roles. Derived roles reference their base role; surface-* are resolved sRGB mixes.',
  palette:'Original identity colours. Never a semantic role.',
  spacing:'Spacing scale.',fontSize:'Font size scale.',lineHeight:'Unitless line heights.',fontWeight:'Generic font weight scale.',radius:'Corner radius scale.',borderWidth:'Border widths.',
  opacity:'Opacity levels.',duration:'Motion durations.',easing:'Motion easing curves.',breakpoint:'Responsive breakpoints (min-width).',layout:'Shell geometry.',zIndex:'Stacking order.',icon:'Icon sizes and stroke width.',
  font:'Brand typefaces and weights.',typography:'Composite text styles.',shadow:'Brand elevation.',shape:'Brand geometry.',
};
const groupType={fontWeight:'fontWeight'};
function scaleToken(group,key,value){
  if(typeof value==='number')return {$type:groupType[group]??'number',$value:value};
  if(/^cubic-bezier\(/.test(value))return {$type:'cubicBezier',$value:value.match(/-?[\d.]+/g).map(Number)};
  if(/^-?[\d.]+(?:ms|s)$/.test(value))return {$type:'duration',$value:{value:parseFloat(value),unit:value.endsWith('ms')?'ms':'s'}};
  if(/^-?[\d.]+(?:px|rem)$/.test(value))return {$type:'dimension',$value:dim(value)};
  throw new Error(`No DTCG type for ${group}.${key}: ${value}`);
}
/** `0 1px 3px #00000014` to a DTCG shadow value; `none` yields undefined. */
function shadowValue(css){
  if(css==='none')return undefined;
  const m=/^(-?[\d.]+(?:px)?) (-?[\d.]+(?:px)?) ([\d.]+(?:px)?)(?: (-?[\d.]+(?:px)?))? (#[0-9a-f]{6}(?:[0-9a-f]{2})?)$/i.exec(css);
  if(!m)throw new Error(`Unsupported shadow: ${css}`);
  const d=v=>dim(v==='0'?'0px':v??'0px');
  return {color:color(m[5]),offsetX:d(m[1]),offsetY:d(m[2]),blur:d(m[3]),spread:d(m[4])};
}
/** Mode-independent tokens: palette, scales, typefaces, composites and shape. */
export function dtcgFoundation(brand) {
  const {typography:t,shape}=brand,result={$description:`${brand.name}: foundation tokens (mode-independent)`};
  if(brand.palette)result.palette={$description:groupText.palette,...Object.fromEntries(Object.entries(brand.palette).map(([key,value])=>[key,{$type:'color',$value:color(value)}]))};
  for(const [group,values] of Object.entries(resolveFoundation(brand)))if(typeof values==='object')
    result[group]={$description:groupText[group]??`Foundation scale: ${group}.`,...Object.fromEntries(Object.entries(values).map(([key,value])=>[key,scaleToken(group,key,value)]))};
  const family=(own,alias)=>own?{$type:'fontFamily',$value:fontStack(own,t.family)}:{$type:'fontFamily',$value:'{font.family.brand}',$description:alias};
  result.font={$description:groupText.font,
    family:{brand:{$type:'fontFamily',$value:fontStack(t.family)},body:family(t.bodyFamily,'Body text uses the brand stack.'),heading:family(t.headingFamily,'Headings use the brand stack.'),mono:{$type:'fontFamily',$value:['ui-monospace','SFMono-Regular','Menlo','monospace']}},
    weight:{body:{$type:'fontWeight',$value:t.bodyWeight},heading:{$type:'fontWeight',$value:t.headingWeight}}};
  const style=(role,size,line)=>({$type:'typography',$value:{fontFamily:`{font.family.${role}}`,fontSize:`{fontSize.${size}}`,fontWeight:`{font.weight.${role}}`,letterSpacing:{value:0,unit:'px'},lineHeight:`{lineHeight.${line}}`}});
  result.typography={$description:groupText.typography,body:{...style('body','base','body'),$description:'Running text.'},heading:{...style('heading','2xl','heading'),$description:'Section heading.'}};
  const shadow=shadowValue(shape.shadow);
  if(shadow)result.shadow={...result.shadow,$description:result.shadow?.$description??groupText.shadow,brand:{$type:'shadow',$value:shadow}};
  result.shape={$description:groupText.shape,radius:{$type:'dimension',$value:dim(shape.radius)},buttonMinHeight:{$type:'dimension',$value:dim(shape.buttonMinHeight)}};
  return result;
}
/** Colour roles of one mode. Unsupported modes fall back to light, as in CSS. */
export function dtcgColors(brand, mode='light') {
  const m=modeOf(brand,mode),values=semanticTokens(brand,m),group={$description:`${groupText.color} Mode: ${m}.`};
  for(const [key,value] of Object.entries(values)){
    const rule=derived[key];
    if(typeof rule==='string')group[key]={$type:'color',$value:`{color.${rule}}`};
    else if(rule?.mix)group[key]={$type:'color',$value:color(value),$extensions:{[NS]:{mix:{color:`{color.${rule.mix}}`,with:`{color.${rule.with}}`,weight:rule.weight,space:'srgb'}}}};
    else group[key]={$type:'color',$value:color(value)};
  }
  return {$description:`${brand.name}: colour roles (${m})`,color:group};
}
/** Legacy merged document: foundation + colours, plus deprecated root copies of every role. */
export function dtcgTokens(brand, mode='light') {
  const {$description:_f,...base}=dtcgFoundation(brand),{$description:_c,...colors}=dtcgColors(brand,mode),result={$description:`${brand.name}: resolved design tokens`};
  for(const [key,value] of Object.entries(semanticTokens(brand,mode))){
    if(key in base||key in colors)throw new Error(`Colour role collides with a token group: ${key}`);
    result[key]={$type:'color',$value:color(value),$deprecated:`Use {color.${key}}. Root colour roles are removed in 0.12.0.`};
  }
  return Object.assign(result,base,colors);
}
/** DTCG Resolver 2025.10: one foundation set and a `mode` modifier with the brand's own modes only. */
// Sources are file names relative to the resolver; scripts/build-token-exports.mjs writes them side by side.
export function dtcgResolver(brand) {
  return {name:brand.id,version:'2025.10',description:`${brand.name}: Atlas tokens. Pick a mode; foundation tokens are shared.`,
    sets:{foundation:{description:'Mode-independent tokens.',sources:[{$ref:'tokens.foundation.dtcg.json'}]}},
    modifiers:{mode:{description:'Colour mode.',contexts:Object.fromEntries(Object.keys(brand.modes).map(m=>[m,[{$ref:`tokens.color.${m}.dtcg.json`}]])),default:'light'}},
    resolutionOrder:[{$ref:'#/sets/foundation'},{$ref:'#/modifiers/mode'}]};
}
