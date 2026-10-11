#!/usr/bin/env node
/** Build Rapold product assets from the canonical identity package; Node.js only. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,join,resolve,posix} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import JSZip from 'jszip';

const repositoryRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const canonicalRoot=join(repositoryRoot,'brands/rapold');
const publicRoot=join(repositoryRoot,'apps/docs/public/brands/rapold');
const variants=['dark','light','mono-white','mono-black','current-color'];
const bannerFormats=[
  {id:'og',width:1200,height:630,hero:286,cy:.5,light:true},
  {id:'landscape',width:1920,height:1080,hero:482,cy:.5,light:true},
  {id:'portrait',width:1080,height:1920,hero:488,cy:.45},
  {id:'social-square',width:1080,height:1080,hero:456,cy:.5},
  {id:'portrait-4x5',width:1080,height:1350,hero:468,cy:.48},
  {id:'wide',width:1584,height:396,hero:214,cy:.5},
];
const decimal=value=>Number(value.toFixed(4));
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const xml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));

function safePath(path) {
  if(typeof path!=='string'||!path||!/^[A-Za-z0-9._/-]+$/.test(path)||path.startsWith('/')||path.split('/').some(segment=>!segment||segment==='.'||segment==='..')||posix.normalize(path)!==path) {
    throw new Error(`Unsafe relative brand asset path: ${String(path)}`);
  }
  return path;
}

function inspectSvg(svg,label,{master=false}={}) {
  if(!/<svg\b/i.test(svg)||!/<path\b/i.test(svg))throw new Error(`${label}: SVG path geometry is required.`);
  if(/<(?:text|image|script|foreignObject|iframe|use|animate|set|feImage)\b|<!DOCTYPE|<!ENTITY|\bon[a-z]+\s*=|\b(?:href|xlink:href)\s*=|url\s*\(/i.test(svg))throw new Error(`${label}: text, active content and external resources are not allowed.`);
  if(master&&!/<svg\b[^>]*\bviewBox\s*=\s*["']0 0 256 256["']/i.test(svg))throw new Error(`${label}: canonical viewBox must be 0 0 256 256.`);
}

function geometrySignature(svg) {
  return JSON.stringify([...svg.matchAll(/<(path|polygon)\b[^>]*\b(d|points)="([^"]+)"[^>]*\/?>/g)].map(match=>[match[1],match[2],match[3]]));
}

function innerSvg(svg) {
  return svg.replace(/^[\s\S]*?<svg\b[^>]*>/i,'').replace(/<\/svg>\s*$/i,'')
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi,'').replace(/<desc\b[^>]*>[\s\S]*?<\/desc>/gi,'');
}

function documentSvg(width,height,body,title) {
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${xml(title)}">\n${body}\n</svg>\n`;
  inspectSvg(svg,title);
  return svg;
}

async function measureInk(svg) {
  const {data,info}=await sharp(Buffer.from(svg)).resize(1024,1024).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let minX=info.width,minY=info.height,maxX=-1,maxY=-1;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>1) {
    minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);
  }
  if(maxX<0)throw new Error('A canonical signet rendered entirely transparent.');
  if(minX===0||minY===0||maxX===info.width-1||maxY===info.height-1)throw new Error('Canonical signet ink touches the canvas edge.');
  const cx=(minX+maxX+1)/2,cy=(minY+maxY+1)/2;
  let farthest=0;
  for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++)if(data[(y*info.width+x)*4+3]>1)farthest=Math.max(farthest,Math.hypot(x+.5-cx,y+.5-cy));
  return {cx:cx/4,cy:cy/4,width:(maxX-minX+1)/4,height:(maxY-minY+1)/4,radius:(farthest+1)/4};
}

function placedLogo(svg,metrics,{x,y,maxWidth,maxHeight,radius}) {
  const scale=radius!==undefined?radius/metrics.radius:Math.min(maxWidth/metrics.width,maxHeight/metrics.height);
  return `<g transform="translate(${decimal(x-metrics.cx*scale)} ${decimal(y-metrics.cy*scale)}) scale(${decimal(scale)})">${innerSvg(svg)}</g>`;
}

/** ICO directory + PNG-compressed image payloads (ICO 1.0; no native dependency). */
function encodeIco(frames) {
  const directory=Buffer.alloc(6+16*frames.length);
  directory.writeUInt16LE(0,0);directory.writeUInt16LE(1,2);directory.writeUInt16LE(frames.length,4);
  let offset=directory.length;
  frames.forEach(({size,png},index)=>{
    if(size<1||size>256)throw new Error(`Invalid ICO size ${size}.`);
    const entry=6+index*16;
    directory[entry]=size===256?0:size;directory[entry+1]=size===256?0:size;
    directory.writeUInt16LE(1,entry+4);directory.writeUInt16LE(32,entry+6);
    directory.writeUInt32LE(png.length,entry+8);directory.writeUInt32LE(offset,entry+12);
    offset+=png.length;
  });
  return Buffer.concat([directory,...frames.map(frame=>frame.png)]);
}

function iconSvg(svgs,metrics,product,size,kind,identity) {
  const opaque=['apple-touch','android','maskable'].includes(kind);
  const placement=kind==='maskable'
    ?{x:size/2,y:size/2,radius:size*identity.geometry.maskableTargetInkRadius}
    :{x:size/2,y:size/2,maxWidth:size*(opaque?.69:.88),maxHeight:size*(opaque?.69:.88)};
  const background=opaque?`<path fill="${identity.palette.navy}" d="M0 0H${size}V${size}H0Z"/>\n`:'';
  return documentSvg(size,size,background+placedLogo(svgs[opaque?'dark':'light'],metrics,placement),`${product.name} ${kind} icon`);
}

function adaptiveFavicon(svgs,metrics,product,identity) {
  const p=identity.palette;
  const style=`<style>@media (prefers-color-scheme: dark) { [fill="${p['logo-light-primary']}"] { fill: ${p.azure}; } [fill="${p['logo-light-facet']}"] { fill: ${p.ice}; } }</style>`;
  return documentSvg(256,256,style+placedLogo(svgs.light,metrics,{x:128,y:128,maxWidth:225.28,maxHeight:225.28}),`${product.name} adaptive favicon`);
}

function bannerSvg(svgs,metrics,product,format,variant,identity) {
  const {width:w,height:h,hero,cy}=format;
  const {background,cutColors:[cut1,cut2]}=identity.exportTreatment[variant];
  const s=Math.min(w,h),corner=s*.66,band=s*.19,f=decimal;
  const body=`<path fill="${background}" d="M0 0H${w}V${h}H0Z"/>
  <path fill="${cut1}" d="M${f(w-corner)} 0H${w}V${f(corner)}Z"/>
  <path fill="${cut2}" d="M${f(w-corner)} 0H${f(w-corner+band)}L${w} ${f(corner-band)}V${f(corner)}Z"/>
  <path fill="${cut1}" d="M0 ${f(h-corner)}L${f(corner)} ${h}H0Z"/>
  <path fill="${cut2}" d="M0 ${f(h-corner)}L${f(corner)} ${h}H${f(corner-band)}L0 ${f(h-corner+band)}Z"/>
  ${placedLogo(svgs[variant],metrics,{x:w/2,y:h*cy,maxWidth:hero,maxHeight:hero})}`;
  return documentSvg(w,h,body,`${product.name} — ${format.id} — ${variant}`);
}

function productReadme(product,identity) {
  const p=identity.palette;
  return `${product.name} — Rapold Produkt-Assets\n\n`+
    `Alle Logos und Banner enthalten ausschliesslich das Produktzeichen, ohne Wortmarke.\n`+
    `Vektormaster: logos/${product.id}-dark.svg; viewBox 0 0 256 256.\n\n`+
    `FARBEN\nFür dunkle Flächen: Azure ${p.azure} und Ice ${p.ice} auf Navy ${p.navy}.\n`+
    `Für helle Flächen: ${p['logo-light-primary']} und ${p['logo-light-facet']} auf Ice Paper ${p.paper}.\n`+
    `Logo-PNGs sind transparent; dark/light bezeichnet die vorgesehene Hintergrundfläche.\n`+
    `Monochrome Varianten behalten dieselbe Geometrie. currentColor funktioniert als\n`+
    `Inline-SVG; ein img-Element erbt keine CSS-Farbe in die SVG-Datei.\n\n`+
    `WEB-INTEGRATION\nDateien am Anwendungsstamm ablegen oder die relativen Pfade anpassen.\n`+
    `<link rel="icon" href="./icons/favicon.svg" type="image/svg+xml">\n`+
    `<link rel="icon" href="./icons/favicon.ico" sizes="16x16 32x32 48x48">\n`+
    `<link rel="apple-touch-icon" href="./icons/apple-touch-icon.png">\n`+
    `<link rel="manifest" href="./manifest.webmanifest">\n\n`+
    `favicon.svg passt sich an die Hell-/Dunkelpräferenz an. PNG/ICO verwenden die\n`+
    `kontrastreiche Light-Palette auf Transparenz. App-Icons haben eine opake Navy-Fläche.\n`+
    `Maskable: sichtbares Zeichen innerhalb Radius 38 % der Canvasbreite; sicherer\n`+
    `Bereich Radius 40 %. Name, id, start_url und scope vor dem Einsatz prüfen.\n\n`+
    `FORMATE\nOG 1200x630; Querformat 1920x1080; Hochformat 1080x1920; Quadrat 1080x1080;\n`+
    `Hochformat 4:5 1080x1350; Breitformat 1584x396. Alle als dunkles SVG/PNG,\n`+
    `OG und Querformat zusätzlich hell. Keine Schrift, Rasterbilder oder externen\n`+
    `Ressourcen in den SVG-Bannern. assets-manifest.json im ZIP listet die enthaltenen Dateien.\n`;
}

function validateIdentity(identity) {
  if(identity.brandId!=='rapold'||identity.publicBase!=='/brands/rapold/'||!Array.isArray(identity.products))throw new Error('Invalid Rapold identity catalog.');
  const seen=new Set();
  for(const product of identity.products) {
    if(!/^[a-z][a-z0-9-]*$/.test(product.id)||seen.has(product.id))throw new Error(`Invalid or repeated product id ${product.id}.`);
    seen.add(product.id);
    if(typeof product.name!=='string'||!product.name||typeof product.purpose!=='string'||!product.purpose)throw new Error(`${product.id}: name and purpose required.`);
    if(product.domain!==null&&!/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/.test(product.domain))throw new Error(`${product.id}: domain must be a bare hostname or null.`);
    for(const variant of variants)if(!safePath(product.variants[variant]).startsWith('assets/logos/'))throw new Error(`${product.id}: canonical logo path must be inside assets/logos/.`);
  }
  for(const value of Object.values(identity.palette))if(!/^#[0-9A-F]{6}$/.test(value))throw new Error(`Invalid identity colour ${value}.`);
  for(const variant of ['dark','light'])for(const value of [identity.exportTreatment[variant].background,...identity.exportTreatment[variant].cutColors])if(!/^#[0-9A-F]{6}$/.test(value))throw new Error('Invalid export background colour.');
}

async function performBuild() {
  const identityBytes=await readFile(join(canonicalRoot,'identity.json'));
  const identity=JSON.parse(identityBytes.toString('utf8'));
  validateIdentity(identity);
  const generatedAt=new Date().toISOString();
  const assets=[],resources=[];
  const sourceHashes={};
  await mkdir(publicRoot,{recursive:true});

  async function emit(path,bytes,meta,{resource=false}={}) {
    safePath(path);
    const data=Buffer.isBuffer(bytes)?bytes:Buffer.from(bytes,'utf8');
    const absolutePath=join(publicRoot,path);
    await mkdir(dirname(absolutePath),{recursive:true});
    await writeFile(absolutePath,data);
    const asset={
      id:path.replace(/[^a-z0-9]+/gi,'-'),path,url:identity.publicBase+path,
      product:meta.product??null,category:meta.category,format:meta.format,
      width:meta.width??null,height:meta.height??null,variant:meta.variant,
      mime:meta.mime,bytes:data.length,sha256:sha256(data),...meta.extra,
    };
    (resource?resources:assets).push(asset);
    return asset;
  }

  async function png(path,svg,meta) {
    return emit(path,await sharp(Buffer.from(svg)).resize(meta.width,meta.height).png({compressionLevel:9}).toBuffer(),{...meta,format:'png',mime:'image/png'});
  }

  for(const product of identity.products) {
    const svgs={};
    for(const variant of variants) {
      const sourcePath=product.variants[variant];
      const source=await readFile(join(canonicalRoot,sourcePath));
      const svg=source.toString('utf8');
      inspectSvg(svg,sourcePath,{master:true});
      const fills=[...new Set([...svg.matchAll(/\bfill="([^"]+)"/g)].map(match=>match[1]))].sort();
      const expected=identity.variants[variant].colors.map(value=>identity.palette[value]??value).sort();
      if(JSON.stringify(fills)!==JSON.stringify([...new Set(expected)]))throw new Error(`${sourcePath}: colours differ from the approved identity palette.`);
      svgs[variant]=svg;
      await emit(sourcePath,source,{product:product.id,category:'logo-master',format:'svg',width:256,height:256,variant,mime:'image/svg+xml',extra:{background:'transparent'}},{resource:true});
    }
    const originalGeometry=geometrySignature(svgs.dark);
    if(variants.some(variant=>geometrySignature(svgs[variant])!==originalGeometry))throw new Error(`${product.id}: variant geometry differs from the canonical signet.`);
    sourceHashes[product.id]=sha256(svgs.dark);
    const metrics=await measureInk(svgs.dark);
    const prefix=`exports/${product.id}`;
    for(const variant of variants) {
      const meta={product:product.id,category:'logo',width:256,height:256,variant,extra:{background:'transparent'}};
      await emit(`${prefix}/logos/${product.id}-${variant}.svg`,svgs[variant],{...meta,format:'svg',mime:'image/svg+xml'});
      if(variant==='current-color')continue;
      for(const size of [256,512,1024,2048]) {
        const buffer=await sharp(Buffer.from(svgs[variant]),{density:576}).resize(size,size).png({compressionLevel:9}).toBuffer();
        await emit(`${prefix}/logos/${product.id}-${variant}-${size}.png`,buffer,{...meta,width:size,height:size,format:'png',mime:'image/png'});
      }
    }

    await emit(`${prefix}/icons/favicon.svg`,adaptiveFavicon(svgs,metrics,product,identity),{product:product.id,category:'favicon',format:'svg',width:256,height:256,variant:'adaptive',mime:'image/svg+xml',extra:{background:'transparent'}});
    const icoFrames=[];
    for(const size of [16,32,48,64,96]) {
      const buffer=await sharp(Buffer.from(iconSvg(svgs,metrics,product,size,'favicon',identity))).png({compressionLevel:9}).toBuffer();
      await emit(`${prefix}/icons/favicon-${size}x${size}.png`,buffer,{product:product.id,category:'favicon',format:'png',width:size,height:size,variant:'light',mime:'image/png',extra:{background:'transparent'}});
      if(size<=48)icoFrames.push({size,png:buffer});
    }
    await emit(`${prefix}/icons/favicon.ico`,encodeIco(icoFrames),{product:product.id,category:'favicon',format:'ico',width:48,height:48,variant:'light',mime:'image/vnd.microsoft.icon',extra:{sizes:[16,32,48],background:'transparent'}});

    for(const icon of [
      {file:'apple-touch-icon',kind:'apple-touch',size:180},
      {file:'android-chrome-192x192',kind:'android',size:192},
      {file:'android-chrome-512x512',kind:'android',size:512},
      {file:'maskable-icon-192x192',kind:'maskable',size:192},
      {file:'maskable-icon-512x512',kind:'maskable',size:512},
    ]) {
      await png(`${prefix}/icons/${icon.file}.png`,iconSvg(svgs,metrics,product,icon.size,icon.kind,identity),{
        product:product.id,category:'app-icon',width:icon.size,height:icon.size,variant:icon.kind,
        extra:{background:identity.palette.navy,...(icon.kind==='maskable'?{safeCircleRadius:.4,targetInkRadius:.375,inkRadiusMaximum:.38}:{})},
      });
    }
    const webmanifest={
      id:'./',name:product.name,short_name:product.shortName,start_url:'./',scope:'./',display:'standalone',background_color:identity.palette.navy,theme_color:identity.palette.navy,
      icons:[
        {src:'./icons/android-chrome-192x192.png',sizes:'192x192',type:'image/png',purpose:'any'},
        {src:'./icons/android-chrome-512x512.png',sizes:'512x512',type:'image/png',purpose:'any'},
        {src:'./icons/maskable-icon-192x192.png',sizes:'192x192',type:'image/png',purpose:'maskable'},
        {src:'./icons/maskable-icon-512x512.png',sizes:'512x512',type:'image/png',purpose:'maskable'},
      ],
    };
    await emit(`${prefix}/manifest.webmanifest`,JSON.stringify(webmanifest,null,2)+'\n',{product:product.id,category:'web-manifest',format:'webmanifest',variant:'web',mime:'application/manifest+json'});
    for(const format of bannerFormats)for(const variant of format.light?['dark','light']:['dark']) {
      const svg=bannerSvg(svgs,metrics,product,format,variant,identity);
      const stem=`${prefix}/banners/${product.id}-${format.id}-${variant}`;
      const meta={product:product.id,category:'banner',width:format.width,height:format.height,variant,extra:{layout:format.id,background:identity.exportTreatment[variant].background,text:false}};
      await emit(stem+'.svg',svg,{...meta,format:'svg',mime:'image/svg+xml'});
      await png(stem+'.png',svg,meta);
    }
    await emit(`${prefix}/README.txt`,productReadme(product,identity),{product:product.id,category:'documentation',format:'txt',variant:'usage',mime:'text/plain'});
  }

  const fontFiles=[identity.fonts.stylesheet,...identity.fonts.families.map(font=>font.path),...identity.fonts.licenseFiles,identity.fonts.validation];
  for(const path of fontFiles) {
    safePath(path);
    if(!path.startsWith('assets/fonts/'))throw new Error('Font resource is outside assets/fonts/.');
    const bytes=await readFile(join(canonicalRoot,path));
    const extension=path.split('.').at(-1);
    const mime={woff2:'font/woff2',css:'text/css',json:'application/json',txt:'text/plain'}[extension];
    await emit(path,bytes,{category:extension==='woff2'?'font':extension==='css'?'font-stylesheet':'font-license',format:extension,variant:'original',mime},{resource:true});
  }

  for(const product of identity.products) {
    const zip=new JSZip();
    const files=assets.filter(asset=>asset.product===product.id&&asset.category!=='bundle');
    const withinProduct=path=>path.replace(`exports/${product.id}/`,'');
    const packedPaths=new Set(files.map(asset=>withinProduct(asset.path)));
    for(const asset of files) {
      const path=withinProduct(asset.path);
      const bytes=await readFile(join(publicRoot,asset.path));
      if(asset.format==='webmanifest')for(const icon of JSON.parse(bytes).icons) {
        const target=posix.normalize(posix.join(posix.dirname(path),icon.src));
        if(!packedPaths.has(target))throw new Error(`${product.id}: missing packaged web manifest icon ${target}.`);
      }
      zip.file(path,bytes,{date:new Date(generatedAt)});
    }
    const packageManifest={
      schemaVersion:1,brandId:'rapold',product:{id:product.id,name:product.name,domain:product.domain,purpose:product.purpose},basePath:'./',
      assets:files.map(({url,...asset})=>({...asset,path:withinProduct(asset.path)})),
    };
    zip.file('assets-manifest.json',JSON.stringify(packageManifest,null,2)+'\n',{date:new Date(generatedAt)});
    const buffer=await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE',compressionOptions:{level:6}});
    await emit(`exports/bundles/${product.id}-brand-assets.zip`,buffer,{product:product.id,category:'bundle',format:'zip',variant:'complete',mime:'application/zip',extra:{fileCount:files.length+1}});
  }

  for(const list of [assets,resources])list.sort((a,b)=>a.path.localeCompare(b.path));
  if(new Set([...assets,...resources].map(asset=>asset.id)).size!==assets.length+resources.length)throw new Error('Asset identifiers must be unique.');
  const manifest={
    schemaVersion:1,version:identity.version,brandId:'rapold',generatedAt,basePath:identity.publicBase,
    identity:'identity.json',pathConvention:'path is relative to basePath; url is an absolute public path.',
    palette:identity.palette,
    products:identity.products.map(product=>({...product,sourceSha256:sourceHashes[product.id]})),
    assets,resources,
    summary:{files:assets.length,resources:resources.length,products:identity.products.length,bytes:[...assets,...resources].reduce((sum,asset)=>sum+asset.bytes,0)},
    source:{identity:'brands/rapold/identity.json',identitySha256:sha256(identityBytes)},
  };
  await writeFile(join(publicRoot,'identity.json'),identityBytes);
  await writeFile(join(publicRoot,'assets-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(`Generated Rapold product assets: ${assets.length} exports, ${resources.length} canonical resources, ${identity.products.length} products.`);
  const {buildProductWorlds}=await import('./build-product-worlds.mjs');
  await buildProductWorlds();
  return manifest;
}

let activeBuild;
export function buildBrandAssets() {
  if(!activeBuild)activeBuild=performBuild().finally(()=>{activeBuild=undefined;});
  return activeBuild;
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await buildBrandAssets();
