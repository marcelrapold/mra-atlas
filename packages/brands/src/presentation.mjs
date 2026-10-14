import foundation from './deck-foundation.json' with { type:'json' };
import presets from './deck-presets.json' with { type:'json' };
import slides from './slide-catalog.json' with { type:'json' };
import {contrast,surfaceMode} from './index.mjs';
export { presets, slides };
export function presentationTheme(brand) {
 const d=brand.deck,mode=d?.mode??'light',ref=v=>v===undefined||v.startsWith('#')?v:brand.palette[v];
 const mix=(a,b,t)=>'#'+[0,2,4].map(i=>Math.round(parseInt(a.slice(1+i,3+i),16)*t+parseInt(b.slice(1+i,3+i),16)*(1-t)).toString(16).padStart(2,'0')).join('');
 const palette=(c,a)=>{
  const primary=ref(a?.primary)??c.primary,on=!a?.primary||contrast(c['primary-foreground'],primary)>=4.5?c['primary-foreground']:contrast('#FFFFFF',primary)>=contrast('#000000',primary)?'#FFFFFF':'#000000';
  const colors={background:c.card,text:c.foreground,muted:c['muted-foreground'],accent:primary,onAccent:on,primary,'on-color':on,surface:c.card,'text-secondary':c['muted-foreground'],'text-muted':c['muted-foreground'],'surface-info':mix(primary,c.card,.08),'surface-neutral':c.muted,'surface-danger':mix(c.destructive,c.card,.08),border:c.border,success:c.success,warning:c.warning,danger:c.destructive,signal:ref(a?.signal)??c.destructive,'chart-2':ref(a?.chart?.[1])??c['primary-hover'],'chart-previous':ref(a?.chartPrevious)??c['muted-foreground']};
  return colors;
 };
 const colors=palette(brand.modes[mode],d?.accents);
 const theme={schemaVersion:2,contentContract:'https://atlas.rapold.io/contracts/presentation-logic.md',validationCommand:'node scripts/validate-deck.mjs deck.json',brand:{id:brand.id,version:brand.version,status:brand.status},canvas:{ratio:'16:9',widthInches:13.333333,heightInches:7.5,...foundation.canvas},typography:{family:brand.typography.family.split(',')[0].trim(),titlePt:30,headingPt:13,bodyPt:10.5,notePt:8,bodyWeight:brand.typography.bodyWeight,headingWeight:brand.typography.headingWeight,scale:foundation.typeScale},colors,layout:{...foundation.zones,columns:foundation.columns,shapes:foundation.shapes,provenance:foundation.source},shape:{cornerRadiusPx:Number.parseFloat(brand.shape.radius)},numberFormat:foundation.numberFormat,slides,presets,evidence:{required:true,location:'speaker-notes',fields:['repository','commit','path','claimType'],allowedClaimTypes:['fact','inference','open-question']},assets:{logo:'original supplied brand asset, preserve proportions and clear space',imagery:'brand imagery rules; supplied images only for photographic layouts'},outputs:['editable-pptx','pdf','sources.json']};
 // Render contract (brand.deck): resolved surfaces, per-mode colours, materials,
 // glow, type and logo. Absent for brands without a deck block.
 if(d){
  const a=d.accents,p=d.punctuation;
  theme.deck={mode,
   surfaces:Object.fromEntries(Object.entries(d.surfaces).map(([k,s])=>[k,{...s,logo:s.logo??false,mode:surfaceMode(s)}])),
   colors:Object.fromEntries(Object.entries(brand.modes).map(([m,c])=>[m,m===mode?colors:palette(c)])),
   materials:d.materials,glow:{...d.glow,color:ref(d.glow.color)},
   accents:{primary:colors.primary,signal:colors.signal,chart:a.chart.map(ref),chartPrevious:colors['chart-previous']},
   type:{headingWeight:brand.typography.headingWeight,displayScale:1.5,...d.type},
   logo:{marginCm:foundation.zones.randLR,...d.logo},
   ...(d.supergraphic?{supergraphic:d.supergraphic}:{}),
   ...(p?{punctuation:{scale:.32,append:false,...p,onDark:ref(p.onDark),onLight:ref(p.onLight)}}:{})};
 }
 return theme;
}
