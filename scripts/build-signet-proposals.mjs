#!/usr/bin/env node
/**
 * Construction source for the five proposed Rapold signets (status "proposal").
 * Writes brands/rapold/assets/logos/{,light/,mono-white/,mono-black/,current-color/}<id>.svg.
 * Not part of the build: the written SVGs are the canonical masters. Re-run only when
 * the proposal geometry changes; approved signets are never generated from here.
 */
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const r=v=>Number(v.toFixed(3));
// Rounded points without consecutive duplicates (clipping can emit coincident vertices).
const clean=p=>p.map(([x,y])=>[r(x),r(y)]).filter((q,i,a)=>{const n=a[(i+1)%a.length];return !(q[0]===n[0]&&q[1]===n[1]);});
const pts=p=>clean(p).map(([x,y])=>`${r(x)},${r(y)}`).join(' ');
const d=polys=>polys.map(p=>'M '+clean(p).map(([x,y])=>`${r(x)} ${r(y)}`).join(' L ')+' Z').join(' ');
// Sutherland–Hodgman clip of polygon by half-plane a*x+b*y<=c
function clip(poly,a,b,c){const out=[];for(let i=0;i<poly.length;i++){const P=poly[i],Q=poly[(i+1)%poly.length];const pi=a*P[0]+b*P[1]<=c+1e-9,qi=a*Q[0]+b*Q[1]<=c+1e-9;if(pi)out.push(P);if(pi!==qi){const t=(c-a*P[0]-b*P[1])/(a*(Q[0]-P[0])+b*(Q[1]-P[1]));out.push([P[0]+t*(Q[0]-P[0]),P[1]+t*(Q[1]-P[1])]);}}return out;}

// Isometric projection matching the family slope (1 : 0.5).
const isoP=(ox,oy)=>(x,y,z)=>[ox+x+z,oy+0.5*x-0.5*z-y];
const face=(P,list)=>list.map(([x,y,z])=>P(x,y,z));
const polar=(cx,cy,R,deg)=>[cx+R*Math.cos(deg*Math.PI/180),cy-R*Math.sin(deg*Math.PI/180)];

export const signets={
 lotse:{name:'Lotse',desc:'Isometrisches Wegband, das um eine Ecke nach oben abbiegt und in einer Pfeilspitze endet; helle Seitenfläche am Aufstieg.',
  body:[[[28,186],[132,134],[132,174],[28,226]],
        [[132,134],[132,98],[110,98],[160,30],[210,98],[188,98],[188,146],[160,160],[160,148]]],
  facets:[[[132,174],[132,134],[160,148],[160,188]]]},
 cockpit:(()=>{const cx=128,cy=164,Ro=108,Ri=78,g=3;const seg=(a1,a2)=>[polar(cx,cy,Ro,a1-g),polar(cx,cy,Ro,a2+g),polar(cx,cy,Ri,a2+g),polar(cx,cy,Ri,a1-g)];
  const a=36,hub=[polar(cx,cy,24,90),polar(cx,cy,24,0),polar(cx,cy,24,270),polar(cx,cy,24,180)];
  const tip=polar(cx,cy,70,a),s1=polar(cx,cy,28,a+20),s2=polar(cx,cy,28,a-20);
  return {name:'Cockpit',desc:'Gefaltete Skala aus drei kräftigen Segmenten, eine rautenförmige Achse und eine helle Nadel, die nach rechts oben ausschlägt. Messinstrument ohne Ziffern.',
   body:[seg(180,120),seg(120,60),seg(60,0),hub],facets:[[polar(cx,cy,14,a+90),s1,tip,s2,polar(cx,cy,14,a-90)]]};})(),
 auditor:(()=>{
  // Shield-shaped magnifier: the shield is the lens frame (folded: blue left, light right),
  // a check sits in the glass and a lengthwise-folded handle leaves the lower-right edge.
  const outerL=[[112,26],[42,52],[42,114],[112,198]],outerR=[[112,26],[182,52],[182,114],[112,198]];
  const innerL=[[112,58],[72,73],[72,104],[112,154]],innerR=[[112,58],[152,73],[152,104],[112,154]];
  const ringL=[...outerL,...[...innerL].reverse()],ringR=[...outerR,...[...innerR].reverse()];
  const check=[[84,107],[96,95],[107,106],[128,85],[140,97],[107,130]];
  const M=[147,156],u=[.77,.638],n=[-u[1],u[0]],at=(t,o)=>[M[0]+u[0]*t+n[0]*o,M[1]+u[1]*t+n[1]*o];
  const t0=-4,t1=78,w=20;
  return {name:'Auditor',desc:'Schild als Lupenrahmen: senkrecht gefaltet mit blauer linker und heller rechter Hälfte, ein Prüfhaken im Glas und ein längs gefalteter Griff unten rechts.',
   bodyPath:d([ringL,check,[at(t0,-w),at(t1,-w),at(t1,0),at(t0,0)]]),
   facets:[ringR,[at(t0,0),at(t1,0),at(t1,w),at(t0,w)]]};})(),
 auth:(()=>{const W=112,H=92,D=44,P=isoP(36,196);
  const front=face(P,[[0,0,0],[W,0,0],[W,H,0],[0,H,0]]);
  const kx=W/2,ky=H*0.56;const key=face(P,[[kx,ky+15,0],[kx+14,ky+1,0],[kx+6,ky-7,0],[kx+6,ky-32,0],[kx-6,ky-32,0],[kx-6,ky-7,0],[kx-14,ky+1,0]]);
  const z=0,o=18,lx=16,rx=W-16,top=H+70;
  const shackle=face(P,[[lx,H,z],[lx,top-22,z],[lx+22,top,z],[rx-22,top,z],[rx,top-22,z],[rx,H,z],[rx-o,H,z],[rx-o,top-30,z],[rx-o-12,top-o,z],[lx+o+12,top-o,z],[lx+o,top-30,z],[lx+o,H,z]]);
  return {name:'Auth',desc:'Isometrisches Schloss: gefalteter Bügel und blaue Front mit freigestelltem Schlüsselloch, helle Seitenfläche.',
   bodyPath:d([front,key])+' '+d([shackle]),
   facets:[face(P,[[W,0,0],[W,0,D],[W,H,D],[W,H,0]])]};})(),
 pocketforge:(()=>{
  // Landscape handheld in the family's isometric projection: screen with one lit pixel,
  // a D-pad cut out on the left and two diamond buttons on the right.
  const W=164,H=92,D=22,P=isoP(14,170);
  const front=face(P,[[0,0,0],[W,0,0],[W,H,0],[0,H,0]]);
  const sx0=46,sx1=118,sy0=18,sy1=74,screen=face(P,[[sx0,sy0,0],[sx1,sy0,0],[sx1,sy1,0],[sx0,sy1,0]]);
  const cx=(sx0+sx1)/2,cy=(sy0+sy1)/2,px=16,pixel=face(P,[[cx-px/2,cy-px/2,0],[cx+px/2,cy-px/2,0],[cx+px/2,cy+px/2,0],[cx-px/2,cy+px/2,0]]);
  const dx=24,dy=46,a=6,b=17;
  const dpad=face(P,[[dx-a,dy+b,0],[dx+a,dy+b,0],[dx+a,dy+a,0],[dx+b,dy+a,0],[dx+b,dy-a,0],[dx+a,dy-a,0],[dx+a,dy-b,0],[dx-a,dy-b,0],[dx-a,dy-a,0],[dx-b,dy-a,0],[dx-b,dy+a,0],[dx-a,dy+a,0]]);
  const btn=(x,y,r)=>face(P,[[x,y+r,0],[x+r,y,0],[x,y-r,0],[x-r,y,0]]);
  return {name:'PocketForge',desc:'Isometrischer Handheld: blaue Front mit Bildschirm und leuchtendem Pixel, freigestelltes Steuerkreuz links, zwei rautenförmige Tasten rechts und helle Ober- und Seitenfläche.',
   bodyPath:d([front,screen,dpad,btn(136,54,10),btn(152,36,10)]),
   facets:[face(P,[[0,H,0],[W,H,0],[W,H,D],[0,H,D]]),face(P,[[W,0,0],[W,0,D],[W,H,D],[W,H,0]]),pixel]};})(),
 atlas:(()=>{
  // Folded map (leporello): four panels, rising panels blue, falling panels light.
  const xs=[34,81,128,175,222],hi=58,lo=84,h=118,top=xs.map((x,k)=>[x,k%2?hi:lo]);
  const panel=k=>[top[k],top[k+1],[top[k+1][0],top[k+1][1]+h],[top[k][0],top[k][1]+h]];
  return {name:'Atlas',desc:'Gefaltete Karte als Leporello aus vier Feldern: steigende Felder blau, fallende Felder hell, mit einer freigestellten rautenförmigen Ortsmarke. Das Designsystem, das die Faltungen der Familie festlegt.',
   body:[panel(0),panel(2),[[151.5,108],[165,128],[151.5,148],[138,128]]],facets:[panel(1),panel(3)]};})(),
};
function svg(id,{body='#009DFF',facet='#A8EDFF',variant='default'}={}){const s=signets[id];const bp=s.bodyPath??d(s.body);
 return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" role="img">\n  <title>${s.name} – Signet</title>\n  <desc>${s.desc} Transparente Vektorgrafik ohne sichtbare Schrift. Variante: ${variant}.</desc>\n  <path data-part="body" fill="${body}" fill-rule="evenodd" d="${bp}"/>\n${s.facets.map((f,i)=>`  <polygon data-part="facet-${i+1}" fill="${facet}" points="${pts(f)}"/>`).join('\n')}\n</svg>\n`;}

const variants={
  'dark':{dir:'',body:'#009DFF',facet:'#A8EDFF',variant:'default'},
  'light':{dir:'light/',body:'#0066B3',facet:'#2B89B5',variant:'light'},
  'mono-white':{dir:'mono-white/',body:'#FFFFFF',facet:'#FFFFFF',variant:'mono-white'},
  'mono-black':{dir:'mono-black/',body:'#000000',facet:'#000000',variant:'mono-black'},
  'current-color':{dir:'current-color/',body:'currentColor',facet:'currentColor',variant:'current-color'},
};
if(process.argv[1]===fileURLToPath(import.meta.url)) {
  const logos=new URL('../brands/rapold/assets/logos/',import.meta.url);
  for(const id of Object.keys(signets))for(const v of Object.values(variants))await writeFile(new URL(`${v.dir}${id}.svg`,logos),svg(id,v));
  console.log(`Wrote ${Object.keys(signets).length*Object.keys(variants).length} proposal signet masters.`);
}
export {svg};
