#!/usr/bin/env node
/** Verify the served Rapold product-world files and the actual standalone ZIP. */
import {readFile, readdir} from 'node:fs/promises';
import {dirname, join, resolve, posix} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {Script} from 'node:vm';
import assert from 'node:assert/strict';
import JSZip from 'jszip';

const repositoryRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const products=['fabric','learn','argus','edgeportal'];

function safePath(path) {
  assert.equal(typeof path,'string','Manifest paths must be strings');
  assert.match(path,/^[A-Za-z0-9._/-]+$/,'Only portable relative file names are allowed');
  assert.ok(!path.startsWith('/')&&!path.split('/').some(segment=>!segment||segment==='.'||segment==='..'),'A manifest path must stay inside its package');
  assert.equal(posix.normalize(path),path,'Manifest paths must be normalized');
  return path;
}

function mimeFor(path) {
  if (/\/(LICENSE|NOTICE)$/.test(path)) return 'text/plain';
  const types={html:'text/html',css:'text/css',js:'text/javascript',json:'application/json',md:'text/markdown',txt:'text/plain',woff2:'font/woff2',svg:'image/svg+xml',webp:'image/webp',png:'image/png',zip:'application/zip'};
  const type=types[path.split('.').at(-1).toLowerCase()];
  assert.ok(type,`Unknown MIME for ${path}`);
  return type;
}

async function actualFiles(directory,prefix='') {
  const files=[];
  for(const entry of await readdir(directory,{withFileTypes:true})) {
    const path=prefix+entry.name;
    if(entry.isDirectory())files.push(...await actualFiles(join(directory,entry.name),path+'/'));
    else {assert.ok(entry.isFile(),`Non-file in generated kit: ${path}`);files.push(path);}
  }
  return files.sort();
}

function localDependency(from, reference) {
  assert.ok(reference&&!/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(reference),`Offline resource must be relative: ${from} → ${reference}`);
  const clean=reference.split(/[?#]/)[0];
  return safePath(posix.normalize(posix.join(posix.dirname(from),clean)));
}

/** A contract check against published bytes; it makes no browser/AT acceptance claim. */
export async function checkProductWorlds({directory=join(repositoryRoot,'apps/docs/out/brands/rapold')}={}) {
  const base=directory instanceof URL?fileURLToPath(directory):resolve(directory);
  const manifest=JSON.parse(await readFile(join(base,'worlds-manifest.json'),'utf8'));
  assert.equal(manifest.schemaVersion,1);
  assert.equal(manifest.brandId,'rapold');
  assert.equal(manifest.basePath,'/brands/rapold/');
  assert.equal(manifest.entrypoint,'/brands/rapold/product-worlds/index.html');
  assert.deepEqual(manifest.products.map(product=>product.id),products);
  assert.equal(new Set(manifest.files.map(file=>file.path)).size,manifest.files.length,'World-manifest paths must be unique');
  const files=new Map();
  for(const entry of manifest.files) {
    safePath(entry.path);
    assert.equal(entry.url,manifest.basePath+entry.path,`Public URL: ${entry.path}`);
    assert.equal(entry.mime,mimeFor(entry.path),`MIME: ${entry.path}`);
    assert.ok(Number.isSafeInteger(entry.bytes)&&entry.bytes>0,`Non-empty byte length: ${entry.path}`);
    assert.match(entry.sha256,/^[a-f0-9]{64}$/);
    const bytes=await readFile(join(base,entry.path));
    assert.equal(bytes.length,entry.bytes,`Published byte length: ${entry.path}`);
    assert.equal(digest(bytes),entry.sha256,`Published SHA-256: ${entry.path}`);
    if(entry.sourcePath) {
      safePath(entry.sourcePath);
      assert.ok(entry.sourcePath.startsWith('brands/rapold/'),'Copied sources must be scoped to the Rapold package');
      const original=await readFile(join(repositoryRoot,entry.sourcePath));
      assert.ok(original.equals(bytes),`Canonical source must remain byte-identical: ${entry.path}`);
    }
    files.set(entry.path,bytes);
  }
  assert.equal(manifest.summary.products,4);
  assert.equal(manifest.summary.publicFiles,files.size);
  assert.equal(manifest.summary.bytes,[...files.values()].reduce((sum,bytes)=>sum+bytes.length,0));
  for(const [key,category] of [['worldSourceFiles','world-source'],['sharedSourceFiles','shared-source'],['kitFiles','kit-file'],['bundles','bundle']]) assert.equal(manifest.summary[key],manifest.files.filter(file=>file.category===category).length,`World summary ${key}`);
  assert.equal(manifest.summary.bundles,1);
  assert.equal(manifest.summary.originalArtworkFiles,4);

  const worlds=JSON.parse(files.get('worlds.json'));
  const identity=JSON.parse(files.get('identity.json'));
  const provenance=JSON.parse(files.get('sources/world-provenance.json'));
  assert.equal(manifest.version,worlds.version);
  assert.equal(manifest.source.worldsSha256,digest(files.get('worlds.json')));
  assert.equal(manifest.source.provenanceSha256,digest(files.get('sources/world-provenance.json')));
  assert.ok(files.get('world-provenance.json').equals(files.get('sources/world-provenance.json')),'Flat provenance link must retain the exact source bytes');
  assert.deepEqual(manifest.products,worlds.products.map(({id,label,sourceKind,sourceNote})=>({id,label,sourceKind,sourceNote})),'Source scopes must survive export');
  assert.equal(worlds.products.find(world=>world.id==='argus').sourceKind,'approved-ci-application');
  assert.equal(worlds.products.find(world=>world.id==='edgeportal').sourceKind,'approved-ci-application');
  assert.equal(provenance.assets.length,4);
  for(const asset of provenance.assets) {
    const path=safePath(asset.path.replace(/^brands\/rapold\//,''));
    const bytes=files.get(path);
    assert.ok(bytes,`Missing original world asset: ${path}`);
    assert.equal(asset.modified,false,`Unexpected modified original: ${path}`);
    assert.equal(bytes.length,asset.bytes);
    assert.equal(digest(bytes),asset.sha256,`Original source provenance: ${path}`);
    assert.equal(createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`),bytes])).digest('hex'),asset.gitBlobSha1,`Pinned original Git blob: ${path}`);
  }
  for(const source of provenance.sources) if(source.licence?.copiedTo) {
    const path=safePath(source.licence.copiedTo.replace(/^brands\/rapold\//,''));
    assert.equal(digest(files.get(path)),source.licence.sha256,`Original artwork licence: ${path}`);
  }
  for(const font of identity.fonts.families) {
    const bytes=files.get(font.path);
    assert.ok(bytes,`Missing local font: ${font.family}`);
    assert.equal(bytes.subarray(0,4).toString('ascii'),'wOF2',`WOFF2 font signature: ${font.family}`);
  }
  for(const path of [...identity.fonts.licenseFiles,'assets/worlds/learn/LICENSE','assets/worlds/learn/NOTICE'])assert.ok(files.get(path)?.length,`Missing distribution licence/notice: ${path}`);
  assert.equal(identity.fonts.families.map(font=>font.family).join('|'),'Geist|Geist Mono');

  assert.equal(manifest.bundle.path,'rapold-product-worlds.zip');
  const bundleEntry=manifest.files.find(file=>file.path===manifest.bundle.path);
  for(const field of ['url','mime','bytes','sha256'])assert.equal(manifest.bundle[field],bundleEntry[field],`ZIP descriptor: ${field}`);
  const zip=await JSZip.loadAsync(files.get(manifest.bundle.path),{checkCRC32:true});
  const zipFiles=Object.entries(zip.files).filter(([,entry])=>!entry.dir);
  for(const [path,entry] of zipFiles) {safePath(path);if(entry.unsafeOriginalName)safePath(entry.unsafeOriginalName);}
  assert.equal(zipFiles.length,manifest.bundle.fileCount,'Actual ZIP file count');
  assert.equal(manifest.bundle.entrypoint,'index.html');
  assert.equal(zipFiles.length,manifest.summary.kitFiles);
  const kit=JSON.parse(await zip.file('kit-manifest.json').async('string'));
  assert.equal(kit.basePath,'./');
  assert.equal(kit.entrypoint,'index.html');
  assert.equal(kit.brandId,'rapold');
  assert.equal(kit.version,worlds.version);
  assert.equal(kit.summary.products,4);
  assert.equal(kit.summary.payloadFiles,kit.files.length);
  assert.equal(kit.summary.archiveFiles,zipFiles.length);
  assert.equal(kit.summary.payloadBytes,kit.files.reduce((sum,file)=>sum+file.bytes,0));
  assert.deepEqual(kit.products,manifest.products,'Portable source scopes');
  assert.equal(kit.implementation.terminal,'complete-static-example');
  assert.equal(new Set(kit.files.map(file=>file.path)).size,kit.files.length,'Portable paths must be unique');
  assert.deepEqual(zipFiles.map(([path])=>path).sort(),[...kit.files.map(file=>file.path),'kit-manifest.json'].sort(),'ZIP may contain only manifested payload and its manifest');
  assert.deepEqual(await actualFiles(join(base,'product-worlds')),zipFiles.map(([path])=>path).sort(),'Served standalone folder must match the ZIP exactly');
  const kitBytes=new Map();
  const publicBaseTag='<base href="/brands/rapold/product-worlds/">';
  assert.equal(manifest.transport.publicHtml,'product-worlds/index.html');
  assert.equal(manifest.transport.archiveHtml,'index.html');
  assert.equal(manifest.transport.publicBaseHref,'/brands/rapold/product-worlds/');
  assert.deepEqual(manifest.transport.differingFiles,['index.html']);
  for(const [path,entry] of zipFiles) {
    const bytes=await entry.async('nodebuffer');
    const served=files.get('product-worlds/'+path);
    if(path==='index.html') {
      const html=served.toString('utf8');
      assert.equal(html.split(publicBaseTag).length,2,'The served HTML needs exactly one explicit base element');
      assert.ok(html.includes('<head>'+publicBaseTag),'The base element must precede every resource link');
      assert.ok(Buffer.from(html.replace(publicBaseTag,'')).equals(bytes),'Only the declared static base tag may differ from offline HTML');
      assert.doesNotMatch(bytes.toString('utf8'),/<base\b/i,'Offline HTML must retain relative file paths');
    } else assert.ok(served?.equals(bytes),`ZIP and standalone HTML folder differ: ${path}`);
    kitBytes.set(path,bytes);
  }
  for(const entry of kit.files) {
    safePath(entry.path);
    const bytes=kitBytes.get(entry.path);
    assert.equal(entry.mime,mimeFor(entry.path));
    assert.equal(bytes.length,entry.bytes,`ZIP byte length: ${entry.path}`);
    assert.equal(digest(bytes),entry.sha256,`ZIP SHA-256: ${entry.path}`);
  }
  for(const product of identity.products)for(const path of Object.values(product.variants))assert.ok(kitBytes.get(path)?.equals(files.get(path)),`New signet absent or changed in ZIP: ${path}`);
  for(const path of [identity.fonts.stylesheet,...identity.fonts.families.map(font=>font.path),...identity.fonts.licenseFiles])assert.ok(kitBytes.has(path),`Portable font dependency: ${path}`);
  for(const layer of worlds.products.find(world=>world.id==='learn').layers)assert.ok(kitBytes.has(layer.path),`Portable original layer: ${layer.path}`);

  // Follow the actual offline HTML/CSS dependency graph, including both mode logos.
  const html=kitBytes.get('index.html').toString('utf8');
  const script=kitBytes.get('kit.js').toString('utf8');
  new Script(script,{filename:'rapold-product-worlds/kit.js'});
  assert.doesNotMatch(script,/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\(/,'Standalone controller must not request remote services');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(ids.length,new Set(ids).size,'HTML IDs must be unique');
  assert.match(html,/<html\s+lang="de-CH"/);
  assert.equal([...html.matchAll(/class="rapold-world-viewport"/g)].length,4,'Each world needs its own responsive CSS container');
  assert.deepEqual([...html.matchAll(/\bdata-rw-world="([^"]+)"/g)].map(match=>match[1]),products,'All four worlds must exist before JavaScript runs');
  assert.equal([...html.matchAll(/\bdata-running="false"/g)].length,4,'Base HTML must start with decorative motion paused');
  const embedded=html.match(/<script\s+type="application\/json"\s+id="rw-kit-data">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(embedded,'Offline runtime data must be embedded');
  assert.deepEqual(JSON.parse(embedded).worlds,worlds,'Embedded runtime contract must be current');
  for(const match of html.matchAll(/<(?:link|script|img)\b[^>]*>/g))for(const ref of match[0].matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    const dependency=localDependency('index.html',ref[1]);
    assert.ok(kitBytes.has(dependency),`Missing offline HTML dependency: ${dependency}`);
    const servedUrl=new URL(ref[1],'https://atlas.rapold.io'+manifest.transport.publicBaseHref);
    assert.ok(files.has(servedUrl.pathname.slice(manifest.basePath.length)),`Missing hosted HTML dependency after clean-URL redirect: ${servedUrl.pathname}`);
  }
  for(const match of html.matchAll(/\bdata-(?:light|dark)-src="([^"]+)"/g))assert.ok(kitBytes.has(localDependency('index.html',match[1])),`Missing mode logo: ${match[1]}`);
  for(const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"[^>]*>/g)) {
    const ref=match[1];
    if(ref.startsWith('#'))assert.ok(ids.includes(ref.slice(1)),`Broken in-page target: ${ref}`);
    else if(!ref.startsWith('https://'))assert.ok(kitBytes.has(localDependency('index.html',ref)),`Broken local download: ${ref}`);
  }
  for(const [path,bytes] of kitBytes) if(path.endsWith('.css')) {
    const css=bytes.toString('utf8');
    for(const match of css.matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g)) {
      const ref=match[1];
      if(ref.startsWith('data:')||ref.startsWith('#'))continue;
      assert.ok(kitBytes.has(localDependency(path,ref)),`Missing offline CSS dependency: ${path} → ${ref}`);
    }
    assert.doesNotMatch(css,/@import\s+['"](?:https?:|\/\/)/,'Stylesheets must not import remote dependencies');
  }
  const network=html.match(/<svg\s+class="rw-network"[\s\S]*?<\/svg>/)?.[0];
  assert.ok(network,'AI network SVG must be present in initial HTML');
  assert.equal([...network.matchAll(/<line\b/g)].length,worlds.fabricNetwork.edges.length);
  assert.equal([...network.matchAll(/class="rw-node"/g)].length,worlds.fabricNetwork.nodes.length);
  assert.equal([...network.matchAll(/class="rw-pulse"/g)].length,worlds.fabricNetwork.edges.filter(edge=>edge.pulse).length);
  for(const layer of worlds.products.find(world=>world.id==='learn').layers)assert.ok(html.includes(`--rw-layer-opacity:${layer.opacity};--rw-layer-depth:${layer.depth}px;mix-blend-mode:${layer.blend}`),`Original layer composition: ${layer.id}`);
  assert.match(script,/prefers-reduced-motion/);
  assert.match(script,/forced-colors/);
  assert.match(script,/visibilitychange/);
  assert.match(script,/IntersectionObserver/);
  assert.match(script,/pauseAnimations/);
  assert.match(script,/unpauseAnimations/);
  console.log(`Rapold worlds verified: ${manifest.files.length} public files, ${zipFiles.length-1} byte-identical ZIP payloads plus one base-normalized HTML, 4 original Learn layers, offline/hosted dependencies and controller syntax.`);
  return {publicFiles:manifest.files.length,kitFiles:zipFiles.length,originalArtworkFiles:4,bundleSha256:manifest.bundle.sha256};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await checkProductWorlds(process.argv.includes('--public')?{directory:join(repositoryRoot,'apps/docs/public/brands/rapold')}:{});
