#!/usr/bin/env node
/** RadioX deck sources: writes the SVG stills for brands/radiox/assets/deck-src/ from the
 * DNA (brands/radiox/dna.json → deck.backdrops, motion.backdrops). Deterministic: a fixed
 * seed drives the Matrix rain, so the same script always yields the same bytes. Then run
 * `node scripts/build-deck-assets.mjs` to rasterise them to brands/radiox/assets/deck/.
 * Blur is baked as Gaussian falloff in radial gradients (no filters): the raster step
 * stays cheap and identical across librsvg versions. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const out=join(root,'brands/radiox/assets/deck-src');
const W=2400,H=1350,K=W/1280; // stills are 2400 × 1350; the product measures in CSS px at 1280
const f=v=>+v.toFixed(2);
const rgb=hex=>hex.slice(1).match(/../g).map(v=>parseInt(v,16));
// Blurred disc: radius r, Gaussian blur sigma s (CSS blur(Npx) = sigma N), as radial gradient stops.
const erf=x=>{const t=1/(1+.3275911*Math.abs(x)),y=1-((((1.061405429*t-1.453152027)*t+1.421413741)*t-.284496736)*t+.254829592)*t*Math.exp(-x*x);return x<0?-y:y;};
let gid=0;
function blob({cx,cy,r,s,color,opacity}){
 const id=`b${gid++}`,R=r+3*s,stops=[];
 for(let i=0;i<=24;i++){const d=R*i/24,a=opacity*.5*(1+erf((r-d)/(s*Math.SQRT2)));stops.push(`<stop offset="${f(i/24)}" stop-color="${color}" stop-opacity="${a.toFixed(4)}"/>`);}
 return {def:`<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${f(cx)}" cy="${f(cy)}" r="${f(R)}">${stops.join('')}</radialGradient>`,use:`<rect width="${W}" height="${H}" fill="url(#${id})"/>`};
}
// DNA 5.3 B, canonical E7: cyan top-left, violet bottom-right, faint cyan centre, fade to black below.
function aurora({strength=1,fadeEnd=1}={}){
 // strength scales the DNA opacities (.45/.45/.12); the cover runs at .8 so the cyan
 // eyebrow (#22D3EE, 11 pt) keeps >= 4.5:1 on the cyan field and the
 // #94A3B8 subtitle on the violet field.
 const layers=[
  blob({cx:.08*W,cy:.04*H,r:.3*W,s:150,color:'#22D3EE',opacity:.45*strength}),
  blob({cx:.92*W,cy:.96*H,r:.3*W,s:150,color:'#A78BFA',opacity:.45*strength}),
  blob({cx:.5*W,cy:.5*H,r:.25*W,s:175,color:'#22D3EE',opacity:.12*strength}),
 ];
 const fade=`<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity=".2"/><stop offset="1" stop-color="#000" stop-opacity="${fadeEnd}"/></linearGradient>`;
 return {defs:layers.map(l=>l.def).join('')+fade,body:layers.map(l=>l.use).join('')+`<rect width="${W}" height="${H}" fill="url(#fade)"/>`};
}
// DNA 5.3 A: Matrix X rain, still frame, only in the outer slide edges (never behind text).
// Right edge: the DNA's 8 %. Left edge: only the strip outside the Atlas text margin
// (0.93 cm = 66 px), because titles, chapter number and logo start there.
function matrix({seed=20261014,edge=.08,left=.02}={}){
 let s=seed;const rnd=()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
 const pitch=25*K,solid=edge*W,reach=solid+24*K,lsolid=left*W,lreach=lsolid+12*K,glyphs=[];
 for(const side of [0,1])for(let x=pitch/2;x<(side?reach:lreach-12);x+=pitch*(side?1:.7)){
  // Each column holds a few particles (10 + z·14 px glyphs); 24 still steps leave a short smear.
  for(let y=-40;y<H+40;){
   const z=rnd(),size=(10+z*14)*K,speed=(.5+z*1.2)*(rnd()*.5+.8)*K,g=((Math.sin(rnd()*Math.PI*2)+1)/2)**3;
   const a=.02+z*.13+(.78+z*.07)*g,col=`rgb(${(60+120*g)|0},${(80+175*g)|0},${(90+165*g)|0})`;
   const gx=side?W-x-size*.3:x-size*.3+rnd()*6;
   for(let k=3;k>=0;k--)glyphs.push(`<use href="#x" transform="translate(${f(gx)} ${f(y-k*speed*6)}) scale(${f(size/100)})" fill="${col}" fill-opacity="${(a*.88**(k*6)).toFixed(3)}"/>`);
   y+=size*(2.2+rnd()*5);
  }
 }
 const mask=`<linearGradient id="edges" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="${f(lsolid/W)}" stop-color="#fff"/><stop offset="${f(lreach/W)}" stop-color="#fff" stop-opacity="0"/><stop offset="${f(1-reach/W)}" stop-color="#fff" stop-opacity="0"/><stop offset="${f(1-(solid-24*K)/W)}" stop-color="#fff"/><stop offset="1" stop-color="#fff"/></linearGradient><mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="url(#edges)"/></mask>`;
 // Bold monospace «X» as two strokes in a 60 × 72 box (glyph size 100).
 const x=`<path id="x" d="M4 0H20L30 22L40 0H56L39 35L57 72H41L30 48L19 72H3L21 35Z"/>`;
 return {defs:x+mask,body:`<g mask="url(#m)" opacity=".55">${glyphs.join('')}</g>`};
}
// DNA 5.3 C: desktop wash, static (PageLayout.tsx:142–143), plus the deck footer band (E34).
function wash(){
 return {defs:`<linearGradient id="w1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="rgb(22,78,99)" stop-opacity=".2"/><stop offset=".5" stop-color="rgb(88,28,135)" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient><radialGradient id="w2" gradientUnits="userSpaceOnUse" cx="${W/2}" cy="0" r="${W*.62}" gradientTransform="translate(${W/2} 0) scale(1 .62) translate(${-W/2} 0)"><stop offset="0" stop-color="rgb(6,182,212)" stop-opacity=".1"/><stop offset=".7" stop-color="rgb(6,182,212)" stop-opacity="0"/></radialGradient>`,
  body:`<rect width="${W}" height="${H}" fill="url(#w1)"/><rect width="${W}" height="${H}" fill="url(#w2)"/>`};
}
// Footer band: black 85 % below the Atlas footer rule (17.524 of 19.05 cm), DNA 4.4.
const footer=`<rect y="${f(H*17.524/19.05)}" width="${W}" height="${f(H-H*17.524/19.05)}" fill="#000" fill-opacity=".85"/>`;
const svg=(...parts)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs>${parts.map(p=>p.defs??'').join('')}</defs><rect width="${W}" height="${H}" fill="#050505"/>${parts.map(p=>p.body??p).join('')}</svg>\n`;

// Wordmark for decks: the canonical logo paths, rasterised (decks never use live text, DNA 3.3).
async function wordmark(file,{glow}){
 const src=await readFile(join(root,'brands/radiox/assets/logos',file),'utf8');
 return glow?src:src.replace(/\sfilter="url\(#rx-glow\)"/,'');
}

await mkdir(out,{recursive:true});
const files={
 'aurora-cover.svg':svg(aurora({strength:.8})),
 'matrix-edges-aurora.svg':(()=>{gid=0;const a=aurora({strength:1.1,fadeEnd:.85});return svg(a,matrix());})(),
 'wash-content.svg':(()=>{gid=0;return svg(wash(),footer);})(),
 'wordmark-on-dark@1600w.svg':await wordmark('wordmark-dark.svg',{glow:true}),
 'wordmark-on-light@1600w.svg':await wordmark('wordmark-light.svg',{glow:false}),
};
for(const [name,content] of Object.entries(files))await writeFile(join(out,name),content);
console.log(Object.keys(files).map(n=>`wrote brands/radiox/assets/deck-src/${n}`).join('\n'));
