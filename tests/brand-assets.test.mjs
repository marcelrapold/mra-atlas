import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {dirname,join,resolve,posix} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import JSZip from 'jszip';
import {buildBrandAssets} from '../scripts/build-brand-assets.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const canonical=join(root,'brands/rapold');
const published=join(root,'apps/docs/public/brands/rapold');
const approvedIds=['fabric','argus','learn','edgeportal'];
const proposalIds=['lotse','cockpit','auditor','auth','pocketforge','atlas'];
const productIds=[...approvedIds,...proposalIds];
const variantIds=['dark','light','mono-white','mono-black','current-color'];
const pngSignature=Buffer.from([137,80,78,71,13,10,26,10]);
const digest=buffer=>createHash('sha256').update(buffer).digest('hex');
let identity,manifest;
const buffers=new Map();
const get=async path=>{
  if(!buffers.has(path))buffers.set(path,await readFile(join(published,path)));
  return buffers.get(path);
};

before(async()=>{
  await buildBrandAssets();
  identity=JSON.parse(await readFile(join(canonical,'identity.json'),'utf8'));
  manifest=JSON.parse(await readFile(join(published,'assets-manifest.json'),'utf8'));
});

function assertRelative(path,label=path) {
  assert.equal(typeof path,'string',label);
  assert.ok(path.length>0,label);
  assert.doesNotMatch(path,/^(?:\/|[a-z]+:)|\\|[?#%]/i,label);
  assert.ok(!path.split('/').some(segment=>segment==='..'||segment==='.'||segment===''),label);
  assert.equal(posix.normalize(path),path,label);
}

function dimensions(buffer,label) {
  assert.deepEqual(buffer.subarray(0,8),pngSignature,label);
  assert.equal(buffer.readUInt32BE(8),13,`${label}: IHDR size`);
  assert.equal(buffer.toString('ascii',12,16),'IHDR',label);
  return [buffer.readUInt32BE(16),buffer.readUInt32BE(20)];
}

test('Rapold is one product family with four approved signs, six marked proposals and only established domains',async()=>{
  assert.equal(identity.brandId,'rapold');
  assert.equal(identity.publicBase,'/brands/rapold/');
  assert.equal(identity.symbolOnly,true);
  assert.deepEqual(identity.viewBox,[0,0,256,256]);
  assert.deepEqual(identity.products.map(product=>product.id),productIds);
  assert.deepEqual(identity.products.map(product=>product.name),['AI Fabric','Argus','ÆON Learn','EdgePortal','Lotse','Cockpit','Auditor','Rapold Auth','PocketForge','Atlas']);
  assert.deepEqual(identity.products.map(product=>product.domain),['ai.rapold.io','argus.rapold.io','learn.rapold.io',null,'lotse.rapold.io','cockpit.rapold.io','auditor.rapold.io','auth.rapold.io','game.rapold.io','atlas.rapold.io']);
  assert.deepEqual(identity.products.filter(product=>product.status==='approved').map(product=>product.id),approvedIds,'Proposals must not widen the approved signet scope');
  assert.deepEqual(identity.products.filter(product=>product.status==='proposal').map(product=>product.id),proposalIds);
  for(const product of identity.products.filter(product=>product.status==='proposal'))assert.match(product.origin.repository,/^marcelrapold\/[a-z0-9-]+$/,product.id);
  assert.ok(!Object.hasOwn(identity,'logo'),'No invented umbrella logo');
  assert.match(identity.products[0].namingNote,/Arbeitsbezeichnung/);
  assert.equal(identity.palette.azure,'#009DFF');
  assert.equal(identity.palette.ice,'#A8EDFF');
  assert.equal(identity.palette.paper,'#F4FAFF');
  assert.equal(identity.palette['logo-light-primary'],'#0066B3');
  assert.equal(identity.palette['logo-light-facet'],'#2B89B5');
  for(const product of identity.products) {
    assert.ok(product.purpose.length>10);
    assert.deepEqual(Object.keys(product.variants),variantIds);
    for(const path of Object.values(product.variants)) {
      assertRelative(path);
      assert.deepEqual(await get(path),await readFile(join(canonical,path)),path);
    }
  }
  assert.deepEqual(await get('identity.json'),await readFile(join(canonical,'identity.json')));
});

test('the real export manifest resolves every public download, MIME, byte length and checksum',async()=>{
  assert.equal(manifest.brandId,'rapold');
  assert.equal(manifest.basePath,'/brands/rapold/');
  assert.equal(manifest.assets.length,52*productIds.length,'Complete product export palette for every catalogued signet');
  assert.equal(manifest.resources.length,5*productIds.length+7,'Five SVG masters per signet and 7 original font resources');
  const all=[...manifest.assets,...manifest.resources];
  assert.equal(new Set(all.map(asset=>asset.id)).size,all.length);
  assert.equal(new Set(all.map(asset=>asset.path)).size,all.length);
  let totalBytes=0;
  for(const asset of all) {
    assertRelative(asset.path);
    assert.equal(asset.url,'/brands/rapold/'+asset.path,asset.path);
    assert.match(asset.mime,/^[a-z]+\/[a-z0-9.+-]+$/i,asset.path);
    assert.ok(asset.product===null||productIds.includes(asset.product),asset.path);
    const bytes=await get(asset.path);
    assert.equal(bytes.length,asset.bytes,asset.path);
    assert.equal(digest(bytes),asset.sha256,asset.path);
    assert.ok(asset.bytes>0);
    totalBytes+=asset.bytes;
  }
  assert.equal(manifest.summary.bytes,totalBytes);
  assert.equal(manifest.source.identitySha256,digest(await readFile(join(canonical,'identity.json'))));
});

test('all source and exported SVGs contain safe vector geometry without visible text or raster resources',async()=>{
  const svgs=[...manifest.assets,...manifest.resources].filter(asset=>asset.format==='svg');
  assert.equal(svgs.length,19*productIds.length);
  for(const asset of svgs) {
    const svg=(await get(asset.path)).toString('utf8');
    assert.match(svg,/<svg\b/);
    assert.match(svg,/<path\b/);
    assert.doesNotMatch(svg,/<(?:text|image|script|foreignObject|iframe|use|animate|set|feImage)\b/i,asset.path);
    assert.doesNotMatch(svg,/<!DOCTYPE|<!ENTITY|\bon[a-z]+\s*=|\b(?:href|xlink:href)\s*=|url\s*\(/i,asset.path);
    assert.doesNotMatch(svg,/\bfont-family\s*=/i,asset.path);
    const viewBox=svg.match(/\bviewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
    assert.deepEqual(viewBox,[0,0,asset.width,asset.height],asset.path);
  }
  for(const product of identity.products)for(const variant of variantIds) {
    assert.deepEqual(await get(`exports/${product.id}/logos/${product.id}-${variant}.svg`),await get(product.variants[variant]),`${product.id}/${variant}: unchanged approved master`);
  }
});

test('all real PNGs have their specified pixel dimensions and correct transparent or opaque surfaces',async()=>{
  const pngs=manifest.assets.filter(asset=>asset.format==='png');
  assert.equal(pngs.length,34*productIds.length);
  for(const asset of pngs) {
    const buffer=await get(asset.path);
    assert.deepEqual(dimensions(buffer,asset.path),[asset.width,asset.height],asset.path);
    const stats=await sharp(buffer).ensureAlpha().stats();
    const alpha=stats.channels[3];
    if(asset.background==='transparent') {
      assert.equal(alpha.min,0,`${asset.path}: real transparency`);
      assert.equal(alpha.max,255,`${asset.path}: visible ink`);
    } else {
      assert.equal(alpha.min,255,`${asset.path}: opaque canvas`);
      assert.equal(alpha.max,255,asset.path);
    }
  }
  for(const product of productIds)for(const variant of variantIds.filter(variant=>variant!=='current-color'))for(const size of [256,512,1024,2048]) {
    assert.deepEqual(dimensions(await get(`exports/${product}/logos/${product}-${variant}-${size}.png`),`${product}/${variant}/${size}`),[size,size]);
  }
});

test('every product has the complete banner palette and mobile/browser icon sizes',async()=>{
  const expectedBanners=[
    ['og',1200,630,['dark','light']],['landscape',1920,1080,['dark','light']],
    ['portrait',1080,1920,['dark']],['social-square',1080,1080,['dark']],
    ['portrait-4x5',1080,1350,['dark']],['wide',1584,396,['dark']],
  ];
  for(const product of productIds) {
    for(const [layout,width,height,variants] of expectedBanners)for(const variant of variants)for(const extension of ['svg','png']) {
      const path=`exports/${product}/banners/${product}-${layout}-${variant}.${extension}`;
      const asset=manifest.assets.find(asset=>asset.path===path);
      assert.ok(asset,path);assert.equal(asset.width,width,path);assert.equal(asset.height,height,path);assert.equal(asset.text,false,path);
    }
    for(const size of [16,32,48,64,96])assert.deepEqual(dimensions(await get(`exports/${product}/icons/favicon-${size}x${size}.png`),'favicon'),[size,size]);
    for(const [name,size] of [['apple-touch-icon',180],['android-chrome-192x192',192],['android-chrome-512x512',512],['maskable-icon-192x192',192],['maskable-icon-512x512',512]]) {
      assert.deepEqual(dimensions(await get(`exports/${product}/icons/${name}.png`),name),[size,size]);
    }
  }
});

test('ICO containers have valid offsets and lossless 16/32/48 PNG frames usable without Python',async()=>{
  for(const product of productIds) {
    const ico=await get(`exports/${product}/icons/favicon.ico`);
    assert.equal(ico.readUInt16LE(0),0);assert.equal(ico.readUInt16LE(2),1);assert.equal(ico.readUInt16LE(4),3);
    const occupied=[];
    for(let index=0;index<3;index++) {
      const entry=6+16*index;
      const width=ico[entry]||256,height=ico[entry+1]||256;
      assert.equal(width,[16,32,48][index]);assert.equal(height,width);
      assert.equal(ico[entry+2],0);assert.equal(ico[entry+3],0);
      assert.equal(ico.readUInt16LE(entry+4),1);assert.equal(ico.readUInt16LE(entry+6),32);
      const length=ico.readUInt32LE(entry+8),offset=ico.readUInt32LE(entry+12);
      assert.ok(offset>=54&&length>0&&offset+length<=ico.length);
      assert.ok(occupied.every(([start,end])=>offset>=end||offset+length<=start),'ICO frame overlap');
      occupied.push([offset,offset+length]);
      const frame=ico.subarray(offset,offset+length);
      assert.deepEqual(dimensions(frame,`${product}/ICO ${width}`),[width,height]);
      assert.deepEqual(frame,await get(`exports/${product}/icons/favicon-${width}x${width}.png`));
    }
  }
});

test('maskable artwork stays inside the central safe circle under a real pixel inspection',async()=>{
  const navy=[5,11,25];
  for(const asset of manifest.assets.filter(asset=>asset.variant==='maskable')) {
    const {data,info}=await sharp(await get(asset.path)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    let inkPixels=0,maximum=0;
    for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++) {
      const index=(y*info.width+x)*4;
      if(navy.some((channel,c)=>Math.abs(data[index+c]-channel)>3)) {
        inkPixels++;
        maximum=Math.max(maximum,Math.hypot(x+.5-info.width/2,y+.5-info.height/2)/info.width);
      }
    }
    assert.ok(inkPixels>0,`${asset.path}: missing artwork`);
    assert.ok(maximum<=.38,`${asset.path}: visible radius ${maximum} exceeds documented 38%`);
    assert.ok(maximum<.4,`${asset.path}: signet would be clipped by the safe-circle mask`);
  }
});

test('published web manifests and product ZIP manifests only reference included, correctly sized files',async()=>{
  for(const product of productIds) {
    const folder=`exports/${product}`;
    const web=JSON.parse(await get(folder+'/manifest.webmanifest'));
    assert.equal(web.id,'./');assert.equal(web.start_url,'./');assert.equal(web.scope,'./');
    assert.equal(web.icons.length,4);
    for(const icon of web.icons) {
      const path=posix.normalize(posix.join(folder,icon.src));
      assert.ok(path.startsWith(folder+'/'));
      const [width,height]=dimensions(await get(path),path);
      assert.equal(icon.sizes,`${width}x${height}`);
      assert.ok(['any','maskable'].includes(icon.purpose));
    }
    const zip=await JSZip.loadAsync(await get(`exports/bundles/${product}-brand-assets.zip`));
    const files=Object.keys(zip.files).filter(name=>!zip.files[name].dir);
    assert.equal(files.length,52);
    for(const name of files)assertRelative(name);
    const packaged=JSON.parse(await zip.file('assets-manifest.json').async('string'));
    assert.equal(packaged.basePath,'./');assert.equal(packaged.product.id,product);
    assert.equal(packaged.assets.length,51);
    for(const asset of packaged.assets) {
      assertRelative(asset.path);
      const file=zip.file(asset.path);
      assert.ok(file,`${product}: missing ZIP member ${asset.path}`);
      const bytes=await file.async('nodebuffer');
      assert.equal(bytes.length,asset.bytes,asset.path);assert.equal(digest(bytes),asset.sha256,asset.path);
      assert.deepEqual(bytes,await get(folder+'/'+asset.path),`${product}: packaged payload drift`);
    }
    const embeddedWeb=JSON.parse(await zip.file('manifest.webmanifest').async('string'));
    for(const icon of embeddedWeb.icons)assert.ok(zip.file(posix.normalize(icon.src)),`${product}: packaged icon ${icon.src}`);
  }
});

test('the original Geist fonts and their licences are copied unchanged to public paths',async()=>{
  const approvedFonts={
    'Geist-Variable.woff2':'2ffebe993e969069a9789d15164b7715d42491b5835516c5e3b935d5f81b05f1',
    'GeistMono-Variable.woff2':'afaacc4c5fbba89d2ebf7a02dc4070208540874592a5504d57175782fe893101',
  };
  for(const [name,expected] of Object.entries(approvedFonts)) {
    const path='assets/fonts/'+name;
    const source=await readFile(join(canonical,path));
    assert.equal(source.toString('ascii',0,4),'wOF2');
    assert.equal(source.readUInt32BE(8),source.length,'WOFF2 file length');
    assert.equal(digest(source),expected,name);
    assert.deepEqual(await get(path),source,name);
  }
  const stylesheet=(await get(identity.fonts.stylesheet)).toString('utf8');
  assert.doesNotMatch(stylesheet,/https?:\/\//);
  for(const match of stylesheet.matchAll(/url\("\.\/([^"]+)"\)/g))assert.ok(await stat(join(published,'assets/fonts',match[1])));
  assert.match((await get('assets/fonts/OFL.txt')).toString('utf8'),/SIL OPEN FONT LICENSE Version 1\.1/);
  for(const path of identity.fonts.licenseFiles)assert.deepEqual(await get(path),await readFile(join(canonical,path)),path);
});
