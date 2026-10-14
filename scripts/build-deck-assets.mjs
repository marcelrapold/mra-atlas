#!/usr/bin/env node
/** Rasterise brand-declared deck SVG sources (brands/<id>/assets/deck-src/*.svg) to the
 * canonical PNGs in brands/<id>/assets/deck/. PowerPoint cannot render SVG reliably from
 * Node, so the deck contract references PNG only. A 16:9 source becomes a 2400 × 1350
 * backdrop; any other source a 1200 px wide logo or graphic. `name@2400w.svg` sets the
 * width explicitly. deck-assets.json records source and output hashes: unchanged sources
 * are never re-encoded, so the committed bytes (and the reference digest) stay stable
 * across platforms. `--force` re-encodes everything. */
import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import sharp from 'sharp';

const repositoryRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
export const backdropSize=Object.freeze({width:2400,height:1350});
export const logoWidth=1200;
// Fixed encoder settings: identical input yields identical bytes on every run.
const pngOptions=Object.freeze({compressionLevel:9,adaptiveFiltering:false,palette:false,progressive:false});

export function inspectDeckSvg(svg,label){
 if(!/<svg\b/i.test(svg))throw new Error(`${label}: not an SVG document.`);
 if(/<(?:script|foreignObject|iframe|animate|set)\b|<!DOCTYPE|<!ENTITY|\bon[a-z]+\s*=/i.test(svg))throw new Error(`${label}: active content is not allowed.`);
 for(const [,value] of svg.matchAll(/\b(?:href|xlink:href)\s*=\s*["']([^"']*)["']/gi))if(!value.startsWith('#')&&!/^data:image\/(png|jpeg);base64,/i.test(value))throw new Error(`${label}: external reference ${value.slice(0,40)} is not allowed.`);
 for(const [,value] of svg.matchAll(/url\(\s*["']?([^"')]*)/gi))if(!value.startsWith('#'))throw new Error(`${label}: external url() is not allowed.`);
}

export function targetSize(svg,name){
 const box=svg.match(/<svg\b[^>]*\bviewBox\s*=\s*["']\s*([-\d.]+)[\s,]+([-\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
 const w=box?Number(box[3]):Number(svg.match(/<svg\b[^>]*\bwidth\s*=\s*["']([\d.]+)/i)?.[1]),h=box?Number(box[4]):Number(svg.match(/<svg\b[^>]*\bheight\s*=\s*["']([\d.]+)/i)?.[1]);
 if(!(w>0&&h>0))throw new Error(`${name}: viewBox or width/height required.`);
 const explicit=name.match(/@(\d{3,4})w\.svg$/i);
 if(!explicit&&Math.abs(w/h-16/9)<.01)return {...backdropSize,source:{w,h}};
 const width=explicit?Number(explicit[1]):logoWidth;
 if(width<600||width>4000)throw new Error(`${name}: width ${width} outside 600–4000.`);
 return {width,height:Math.round(width*h/w),source:{w,h}};
}

export async function rasteriseDeckSvg(svg,{width,height,source}){
 // Density renders the vector at (at least) the target resolution before the exact resize.
 const density=Math.min(2400,Math.max(72,Math.ceil(72*Math.max(width/source.w,height/source.h))));
 return sharp(Buffer.from(svg),{density}).resize(width,height,{fit:'fill',kernel:'lanczos3'}).png(pngOptions).toBuffer();
}

export async function buildDeckAssets({root=repositoryRoot,force=process.argv.includes('--force')}={}){
 const results=[];
 const brandDirs=(await readdir(join(root,'brands'),{withFileTypes:true})).filter(e=>e.isDirectory()).map(e=>e.name).sort();
 for(const id of brandDirs){
  const src=join(root,'brands',id,'assets','deck-src'),out=join(root,'brands',id,'assets','deck');
  const sources=(await readdir(src).catch(error=>{if(error.code==='ENOENT')return [];throw error;})).filter(n=>/\.svg$/i.test(n)).sort();
  if(!sources.length)continue;
  await mkdir(out,{recursive:true});
  const manifestFile=join(out,'deck-assets.json');
  const previous=await readFile(manifestFile,'utf8').then(JSON.parse,()=>({files:[]}));
  const files=[];
  for(const name of sources){
   const svg=await readFile(join(src,name),'utf8'),label=`brands/${id}/assets/deck-src/${name}`;
   inspectDeckSvg(svg,label);
   const size=targetSize(svg,name),output=name.replace(/(@\d+w)?\.svg$/i,'.png'),target=join(out,output),sourceSha256=sha256(svg);
   const existing=await readFile(target).catch(()=>null),entry=previous.files.find(f=>f.source===`deck-src/${name}`);
   let png=existing,written=false;
   if(force||!existing||entry?.sourceSha256!==sourceSha256||entry?.sha256!==sha256(existing)||entry?.width!==size.width||entry?.height!==size.height){png=await rasteriseDeckSvg(svg,size);await writeFile(target,png);written=true;}
   files.push({source:`deck-src/${name}`,sourceSha256,output:`deck/${output}`,width:size.width,height:size.height,sha256:sha256(png)});
   results.push({brand:id,output:`brands/${id}/assets/deck/${output}`,written});
  }
  const manifest=JSON.stringify({schemaVersion:1,generator:'scripts/build-deck-assets.mjs',files},null,2)+'\n';
  if(manifest!==await readFile(manifestFile,'utf8').catch(()=>''))await writeFile(manifestFile,manifest);
 }
 return results;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const results=await buildDeckAssets();
 console.log(results.length?results.map(r=>`${r.written?'wrote ':'kept  '}${r.output}`).join('\n'):'No deck SVG sources found (brands/<id>/assets/deck-src/*.svg).');
}
