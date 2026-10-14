// Deck staging for brands with a `deck` render contract. Returns null without
// one, so deck-less brands keep their scenes byte for byte. Units: cm / pt.
export const layoutOf=type=>type==='cover-foto'?'cover':type==='foto-schluss'?'closing':type==='kapitel-trenner'?'section':'content';
const W=33.867,H=19.05;
export function deckStage(theme,type){
 const d=theme.deck;
 if(!d)return null;
 const layout=layoutOf(type),surface=d.surfaces[layout]??d.surfaces.cover,c=d.colors[surface.mode];
 const graphic=d.supergraphic?.[layout]??(layout==='closing'&&!d.surfaces.closing?d.supergraphic?.cover:undefined);
 const background={color:surface.fill,...(surface.backdrop?{path:surface.backdrop}:{}),...(graphic?{graphics:[graphic]}:{})};
 const glow={color:d.glow.color,opacity:d.glow.opacity,blurPt:d.glow.blurPt};
 // Surface roles become materials: neutral evidence → panel, highlighted → panelRaised.
 const material=(node,name)=>{const m=d.materials[name]??d.materials.panel;return {...node,fill:m.fill,shape:m.radiusCm>0?'roundRect':'rect',opacity:m.fillOpacity,stroke:m.border,strokeOpacity:m.borderOpacity,strokePt:m.borderPt,radius:m.radiusCm};};
 const rect=(node,{glow:lit=false,name}={})=>{
  const role=name??(node.shape!=='rect'?null:node.fill===c['surface-info']?'panelRaised':node.fill===c['surface-neutral']?'panel':null);
  const out=role?material(node,role):node.shape==='rect'&&node.fill===c.primary&&node.h>1?{...node,shape:'roundRect',radius:d.materials.panelRaised.radiusCm}:node;
  const m=role&&d.materials[role];
  // Office derives a shadow from the rendered alpha: a translucent panel would barely glow,
  // so the glow sits on an opaque plate in the surface colour underneath.
  const plate=lit&&(out.opacity??1)<.5?[{kind:'rect',x:out.x,y:out.y,w:out.w,h:out.h,fill:surface.fill,shape:out.shape,...(out.radius?{radius:out.radius}:{}),glow}]:[];
  if(lit&&!plate.length)out.glow=glow;
  return [...plate,out,...(m?.highlight&&out.w>2*m.radiusCm?[{kind:'rect',x:out.x+m.radiusCm,y:out.y,w:out.w-2*m.radiusCm,h:.03,fill:m.highlight.color,shape:'rect',opacity:m.highlight.opacity}]:[])];
 };
 // Uppercase labels (eyebrows, column heads, pill badges) get caps tracking.
 // textWidthCm keeps cover/section/closing text off a supergraphic baked into the backdrop.
 const fit=node=>layout!=='content'&&surface.textWidthCm?{...node,w:Math.min(node.w,d.logo.marginCm+surface.textWidthCm-node.x)}:node;
 const text=node=>(node=fit(node),/\p{Lu}/u.test(node.text)&&node.text===node.text.toLocaleUpperCase('de-CH')&&node.pt<=12?{...node,caps:true,trackingEm:tracking(node),...(node.h<node.pt/72*2.54*2?{nowrap:true}:{}),...(d.type.labelFace?{face:d.type.labelFace}:{})}:node);
 // Tracking shrinks (never below 0.04 em) where a conservative caps estimate (0.72 em) would overflow, e.g. pill badges.
 function tracking(node){const em=[...node.text].length*node.pt/72*2.54,room=(node.w-.72*em)/em;return Math.max(Math.min(d.type.capsTrackingEm,Math.floor(room*1000)/1000),Math.min(d.type.capsTrackingEm,.04));}
 const p=d.punctuation;
 const title=(node,display=false)=>{
  const out={...fit(node),...(display&&d.type.displayFace?{face:d.type.displayFace}:{})};
  if(p&&display!=='plain'&&(p.append||/\.$/.test(out.text))){out.text=out.text.replace(/\.$/,'');out.punctuation={glyph:p.glyph,color:surface.mode==='dark'?p.onDark:p.onLight,scale:p.scale};}
  return out;
 };
 const displayPt=Math.round(30*d.type.displayScale);
 const chart=node=>({...node,axisColor:c['text-secondary'],valueColor:c.text,lineColor:c.border,font:d.type.bodyFace});
 let logo=null;
 if(surface.logo){
  const o=typeof surface.logo==='object'?surface.logo:{},h=o.heightCm??d.logo.heightCm,w=h*d.logo.aspectRatio,m=d.logo.marginCm,anchor=o.anchor??d.logo.anchor;
  const x=anchor.endsWith('left')?m:anchor.endsWith('right')?W-m-w:(W-w)/2,y=anchor.startsWith('top')?m:H-m-h;
  logo={kind:'brand',x,y,w,h,path:surface.mode==='dark'?d.logo.onDark:d.logo.onLight,plate:false};
 }
 // The sequence counter on content slides sits on a hairline instead of a heavy primary rule.
 const rule=y=>({kind:'rect',x:0,y,w:W,h:.03,fill:d.materials.panel.border,shape:'rect',opacity:Math.max(d.materials.panel.borderOpacity,.12)});
 return {d,layout,surface,c,background,rect,text,title,chart,logo,rule,displayPt,glow};
}
