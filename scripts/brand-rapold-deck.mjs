#!/usr/bin/env node
/** Rapold umbrella «Der First» (proposal): copies the approved-for-review masters from
 * brands/rapold-io/assets/logos to brands/rapold/assets/umbrella, derives the compact
 * lockups and writes the deck SVG sources (backdrops with glass mark and Firstlicht,
 * logo lockups) to brands/rapold/assets/deck-src. Recipes: brands/rapold-io/dna.json.
 * Afterwards: node scripts/build-deck-assets.mjs. Text never goes into a backdrop. The grain layer of the web stage is left out of the
 * plates: invisible at projection size and ~6× the PNG weight in every PPTX. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const masters=join(root,'brands/rapold-io/assets/logos'),umbrella=join(root,'brands/rapold/assets/umbrella'),src=join(root,'brands/rapold/assets/deck-src');
const files=['mark-dark','mark-light','mark-mono-white','mark-mono-black','wordmark-dark','wordmark-light','lockup-horizontal-dark','lockup-horizontal-light'];
const n=v=>Number(v.toFixed(3));
const inner=svg=>svg.replace(/^[\s\S]*?<svg\b[^>]*>/i,'').replace(/<\/svg>\s*$/i,'').replace(/<title\b[\s\S]*?<\/title>|<desc\b[\s\S]*?<\/desc>/gi,'').trim();
const paths=svg=>[...svg.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)].map(m=>m[1]);
// Bounding box of absolute M/L/H/V/Q/C/Z path data (control points included: a safe outer box).
function bbox(ds){
 let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity,x=0,y=0;
 const add=(px,py)=>{x0=Math.min(x0,px);y0=Math.min(y0,py);x1=Math.max(x1,px);y1=Math.max(y1,py);};
 for(const d of ds)for(const [,cmd,args] of d.matchAll(/([MLHVQCZ])([^MLHVQCZ]*)/gi)){
  const v=(args.match(/-?\d*\.?\d+(?:e-?\d+)?/gi)??[]).map(Number);
  if(cmd==='H')v.forEach(px=>add(x=px,y));else if(cmd==='V')v.forEach(py=>add(x,y=py));
  else for(let i=0;i+1<v.length;i+=2)add(x=v[i],y=v[i+1]);
 }
 return {x0,y0,x1,y1};
}

const read=name=>readFile(join(masters,name+'.svg'),'utf8');
const svgs=Object.fromEntries(await Promise.all(files.map(async f=>[f,await read(f)])));
for(const [name,svg] of Object.entries(svgs))if(/#FFA36C|#FFE2CC|#B4511A/i.test(svg))throw new Error(`${name}: Firstglut must not appear in logo files.`);

// Mark geometry (256 grid, ink box 43.259–212.741 × 24–232, ridge at x 120.296).
const [body,facet]=paths(svgs['mark-dark']);
const INK={x0:43.259,y0:24,x1:212.741,y1:232},RX=120.296,ridge=[[24,56.741],[85.63,116.444]];

// Compact lockup: mark height 1.32 × ascender, centred on the ascender band, gap 0.34 em.
function compactLockup(variant){
 const word=svgs[`wordmark-${variant}`],mark=svgs[`mark-${variant}`];
 const [wx,wy]=word.match(/translate\(([-\d.]+)[ ,]+([-\d.]+)\)/).slice(1).map(Number);
 const box=bbox(paths(word)),asc=-box.y0,markH=1.32*asc,s=markH/(INK.y1-INK.y0),gap=34,pad=6;
 const top=Math.min(-asc/2-markH/2,box.y0),bottom=Math.max(-asc/2+markH/2,box.y1);
 const markX=pad-INK.x0*s,markY=-asc/2-markH/2-INK.y0*s-top+pad;
 const wordX=pad+(INK.x1-INK.x0)*s+gap-box.x0,wordY=-top+pad;
 const width=n(wordX+box.x1+pad),height=n(bottom-top+2*pad);
 const wordBody=inner(word).replace(/<g transform="translate\([^)]*\)">/,`<g transform="translate(${n(wordX)} ${n(wordY)})">`);
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">\n  <title>rapold.io – kompakter Lockup</title>\n  <desc>Vorschlag Dachmarke «Der First» mit Wortmarke rapold.io, ohne Deskriptor. Zeichenhöhe 1,32 × Oberlänge, zentriert auf die Oberlänge, Abstand 0,34 em. Variante: ${variant}. Transparent.</desc>\n  <g transform="translate(${n(markX)} ${n(markY)}) scale(${n(s)})">${inner(mark)}</g>${wordBody}\n</svg>\n`;
 return {svg,width,height};
}

// Shared light recipes (dna.json → gradients, glow, backdrops). Canvas 1600 × 900.
const W=1600,H=900;
function isoGrid(id,opacity,mask){
 const lines=[];for(let c=-H*2;c<=W+H*2;c+=56){lines.push(`M ${-20} ${n(c)} L ${W+20} ${n(c+.5*(W+40))}`,`M ${-20} ${n(c)} L ${W+20} ${n(c-.5*(W+40))}`);}
 return `<radialGradient id="${id}m" cx="${mask[0]}" cy="${mask[1]}" r="0.62"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient><mask id="${id}"><rect width="${W}" height="${H}" fill="url(#${id}m)"/></mask>|<path mask="url(#${id})" d="${lines.join(' ')}" stroke="#A8EDFF" stroke-opacity="${opacity}" stroke-width="1" fill="none"/>`;
}
const bloom=(id,cx,cy,o=.30)=>`<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="0.62"><stop offset="0" stop-color="#009DFF" stop-opacity="${o}"/><stop offset="0.45" stop-color="#009DFF" stop-opacity="${n(o*.233)}"/><stop offset="1" stop-color="#009DFF" stop-opacity="0"/></radialGradient>`;
const floor=`<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050B19"/><stop offset="1" stop-color="#02060F"/></linearGradient>`;
// Glass First at translate(tx, ty) scale(s): plane gradients, 1.5 px Ice rim, Firstlicht on the ridge.
function glassMark(id,tx,ty,s,{light=1,fade}={}){
 const P=(x,y)=>[n(tx+x*s),n(ty+y*s)];
 const defs=`<linearGradient id="${id}L" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2FB1FF"/><stop offset="0.55" stop-color="#009DFF"/><stop offset="1" stop-color="#003E86"/></linearGradient><linearGradient id="${id}R" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="#E6FAFF"/><stop offset="0.5" stop-color="#A8EDFF"/><stop offset="1" stop-color="#3D7FA6"/></linearGradient>`
  +`<filter id="${id}h" filterUnits="userSpaceOnUse" x="0" y="${-H}" width="${W}" height="${3*H}"><feGaussianBlur stdDeviation="${n(16*s/4)}"/></filter><filter id="${id}g" filterUnits="userSpaceOnUse" x="0" y="${-H}" width="${W}" height="${3*H}"><feGaussianBlur stdDeviation="${n(3*s/4)}"/></filter>`
  +(fade?`<linearGradient id="${id}fm" x1="0" y1="0" x2="0" y2="1"><stop offset="${fade[0]}" stop-color="#fff"/><stop offset="${fade[1]}" stop-color="#000"/></linearGradient><mask id="${id}f" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="url(#${id}fm)"/></mask>`:'');
 const seg=ridge.map(([a,b])=>`M ${P(RX,a).join(' ')} L ${P(RX,b).join(' ')}`).join(' ');
 const apex=P(RX,24);
 const warm=`<radialGradient id="${id}w" cx="${apex[0]}" cy="${apex[1]}" r="${n(56*s)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFA36C" stop-opacity="${n(.24*light)}"/><stop offset="1" stop-color="#FFA36C" stop-opacity="0"/></radialGradient>`;
 const g=`<g transform="translate(${n(tx)} ${n(ty)}) scale(${n(s)})"><path fill="url(#${id}L)" fill-rule="evenodd" d="${body}"/><path fill="url(#${id}R)" fill-rule="evenodd" d="${facet}"/><path fill="none" stroke="#A8EDFF" stroke-opacity="0.45" stroke-width="${n(1.5/s)}" stroke-linejoin="round" d="${body} ${facet}"/></g>`
  +`<path d="${seg}" stroke="#FFA36C" stroke-opacity="${n(.55*light)}" stroke-width="${n(24*s/4)}" stroke-linecap="round" filter="url(#${id}h)"/><path d="${seg}" stroke="#FFA36C" stroke-opacity="${light}" stroke-width="${n(8*s/4)}" stroke-linecap="round" filter="url(#${id}g)"/><path d="${seg}" stroke="#FFE2CC" stroke-opacity="${light}" stroke-width="${n(Math.max(2,2*s/4))}" stroke-linecap="round"/>`;
 return {defs:defs+warm,body:`<rect width="${W}" height="${H}" fill="url(#${id}w)"/><g${fade?` mask="url(#${id}f)"`:''}>${g}</g>`};
}
// The ten approved product signets as the family row (no text; names stay live elsewhere).
const identity=JSON.parse(await readFile(join(root,'brands/rapold/identity.json'),'utf8'));
const signets=await Promise.all(identity.products.map(p=>readFile(join(root,'brands/rapold',p.variants.dark),'utf8')));
const family=(x,y,size,pitch,opacity)=>`<g opacity="${opacity}">${signets.map((svg,i)=>`<svg x="${n(x+i*pitch)}" y="${n(y)}" width="${size}" height="${size}" viewBox="0 0 256 256">${inner(svg)}</svg>`).join('')}</g>`;
const doc=(title,defs,layers)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n<title>${title}</title>\n<defs>${defs}</defs>\n${layers}\n</svg>\n`;
const veil=(id,stops,dir='0')=>`<linearGradient id="${id}" x1="${dir==='rtl'?1:0}" y1="0" x2="${dir==='rtl'?0:1}" y2="0">${stops.map(([o,a])=>`<stop offset="${o}" stop-color="#050B19" stop-opacity="${a}"/>`).join('')}</linearGradient>`;

function darkBackdrop(title,{bloomAt,grid,mark,veilStops,row}){
 const [gDefs,gPath]=isoGrid('grid',.055,grid).split('|'),m=glassMark('m',...mark);
 return doc(title,floor+bloom('bloom',...bloomAt)+gDefs+m.defs+veil('veil',veilStops),
  `<rect width="${W}" height="${H}" fill="url(#floor)"/><rect width="${W}" height="${H}" fill="url(#bloom)"/>${gPath}${m.body}<rect width="${W}" height="${H}" fill="url(#veil)"/>${row??''}`);
}
// Family row: hairline + ten signets (40 px at 1600 wide), left on the margin used by the deck.
const rowLeft=44,rowY=792;
const hairline=(x,y,w)=>`<rect x="${x}" y="${y}" width="${w}" height="1" fill="#A8EDFF" fill-opacity="0.12"/>`;
const out={
 'cover.svg':darkBackdrop('rapold.io Deck-Cover (Vorschlag Dachmarke)',{bloomAt:[.74,.34],grid:[.7,.4],mark:[905,-40,4,{fade:[.62,.95]}],veilStops:[[0,.92],[.52,.55],[.7,0]],row:hairline(rowLeft,rowY-16,W-2*rowLeft)+family(rowLeft,rowY,40,52,.92)}),
 'section.svg':darkBackdrop('rapold.io Kapitel (Vorschlag Dachmarke)',{bloomAt:[.72,.46],grid:[.75,.5],mark:[860,40,5.2,{fade:[.7,1]}],veilStops:[[0,.94],[.4,.6],[.62,0]]}),
 'closing.svg':darkBackdrop('rapold.io Schluss (Vorschlag Dachmarke)',{bloomAt:[.76,.36],grid:[.76,.4],mark:[990,46,2.9],veilStops:[[0,.9],[.5,.4],[.62,0]],row:hairline(rowLeft,rowY-16,W-2*rowLeft)+family((W-(9*60+40))/2,rowY,40,60,.85)}),
 'content.svg':doc('rapold.io Inhalt hell (Vorschlag Dachmarke)',`<radialGradient id="b" cx="1" cy="0" r="0.55"><stop offset="0" stop-color="#009DFF" stop-opacity="0.10"/><stop offset="1" stop-color="#009DFF" stop-opacity="0"/></radialGradient>`,
  `<rect width="${W}" height="${H}" fill="#F4FAFF"/><rect width="${W}" height="${H}" fill="url(#b)"/><path d="M 1340 0 L 1600 0 L 1600 130 Z" fill="#0066B3" fill-opacity="0.06"/>`),
};
await mkdir(umbrella,{recursive:true});await mkdir(src,{recursive:true});
for(const f of files)await writeFile(join(umbrella,f+'.svg'),svgs[f]);
const lockups={};
for(const v of ['dark','light']){const l=compactLockup(v);lockups[v]=l;await writeFile(join(umbrella,`lockup-compact-${v}.svg`),l.svg);out[`lockup-on-${v}@1600w.svg`]=l.svg;}
for(const [name,svg] of Object.entries(out))await writeFile(join(src,name),svg);
// Page module: inline SVG strings for the brand page (the rapold export pipeline publishes product signets only).
const page={schemaVersion:1,status:'proposal',label:'Vorschlag Dachmarke',source:'brands/rapold-io',generator:'scripts/brand-rapold-deck.mjs',compactAspectRatio:n(lockups.dark.width/lockups.dark.height),files:Object.fromEntries([...files,'lockup-compact-dark','lockup-compact-light'].map(f=>[f,f.startsWith('lockup-compact')?lockups[f.slice(15)].svg:svgs[f]]))};
await writeFile(join(umbrella,'umbrella.json'),JSON.stringify(page,null,1)+'\n');
console.log(`Umbrella masters → brands/rapold/assets/umbrella (${files.length+2} SVG), deck sources → brands/rapold/assets/deck-src (${Object.keys(out).length}). Compact lockup aspect ${page.compactAspectRatio}.`);
