// npm-Durchstich: @rapold/brand-rapold und @rapold/framework-core als Tarball konsumierbar.
// Ohne Netz: baut dist und prüft `npm pack --dry-run` gegen die Exporte; packt nichts nach dist/packages.
import test, {before} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {brands,toCssText} from '../packages/brands/src/index.mjs';
import {modeCssText} from '../scripts/build-token-exports.mjs';
import {buildBrandPackage,packageRoot} from '../scripts/build-brand-package.mjs';
import {npmPack,PACKED_PACKAGES} from '../scripts/pack-packages.mjs';

const root=fileURLToPath(new URL('..',import.meta.url));
const exists=path=>stat(path).then(()=>true,()=>false);
const readJson=async path=>JSON.parse(await readFile(join(root,path),'utf8'));
const identity=await readJson('brands/rapold/identity.json');
const rapold=brands.find(brand=>brand.id==='rapold');
const hasBootSource=await exists(join(root,'brands/rapold/edgeportal/boot'));
const packs={};

/** Alle Ziele eines exports-Feldes als [subpath, condition, target]. */
function exportTargets(exportsField){
  const out=[];
  for(const [subpath,value] of Object.entries(exportsField)){
    if(typeof value==='string')out.push([subpath,'default',value]);
    else for(const [condition,target] of Object.entries(value))out.push([subpath,condition,target]);
  }
  return out;
}
const optional=subpath=>subpath==='./edgeportal/boot/*'&&!hasBootSource;

before(async()=>{
  await buildBrandPackage();
  for(const dir of PACKED_PACKAGES){
    const manifest=await readJson(`${dir}/package.json`);
    packs[manifest.name]={dir,manifest,files:new Set(npmPack(dir,{dryRun:true}).files.map(file=>file.path))};
  }
});

test('beide Pakete bleiben privat, tragen eine eigene Version und packen ihre Exportziele',()=>{
  assert.deepEqual(Object.keys(packs).sort(),['@rapold/brand-rapold','@rapold/framework-core']);
  for(const {manifest,files} of Object.values(packs)){
    assert.equal(manifest.private,true,`${manifest.name} darf nicht versehentlich veröffentlicht werden`);
    assert.match(manifest.version,/^\d+\.\d+\.\d+$/);
    for(const [subpath,condition,target] of exportTargets(manifest.exports)){
      const path=target.replace(/^\.\//,'');
      if(path.includes('*')){
        const prefix=path.slice(0,path.indexOf('*'));
        if(optional(subpath))continue;
        assert.ok([...files].some(file=>file.startsWith(prefix)),`${manifest.name} ${subpath} (${condition}): nichts unter ${prefix} im Tarball`);
      }else assert.ok(files.has(path),`${manifest.name} ${subpath} (${condition}): ${path} fehlt im Tarball`);
    }
  }
});

test('jedes Exportziel existiert nach dem Build auf der Platte',async()=>{
  for(const {dir,manifest} of Object.values(packs))for(const [subpath,,target] of exportTargets(manifest.exports)){
    const path=join(root,dir,target.slice(0,target.includes('*')?target.indexOf('*'):undefined));
    if(optional(subpath)){if(target.includes('*'))assert.equal(await exists(path),false,'Boot-Kit ohne Quelle darf nicht entstehen');continue;}
    assert.ok(await exists(path),`${manifest.name} ${subpath}: ${path} fehlt`);
  }
});

test('Lizenzen: Atlas-Lizenz in beiden Paketen, Geist mit OFL und Hinweisen',async()=>{
  const license=await readFile(join(root,'LICENSE'),'utf8');
  for(const {dir,manifest,files} of Object.values(packs)){
    assert.ok(files.has('LICENSE'),`${manifest.name}: LICENSE fehlt im Tarball`);
    assert.equal(await readFile(join(root,dir,'LICENSE'),'utf8'),license,`${dir}/LICENSE weicht von LICENSE ab`);
  }
  const brandFiles=packs['@rapold/brand-rapold'].files;
  for(const file of identity.fonts.licenseFiles)assert.ok(brandFiles.has(`dist/fonts/${file.split('/').at(-1)}`),`${file} fehlt im Tarball`);
});

test('brand-rapold enthält die kanonischen Tokens, Fonts und Signets unverändert',async()=>{
  const dist=join(packageRoot,'dist');
  assert.equal(await readFile(join(dist,'tokens.css'),'utf8'),toCssText(rapold));
  for(const mode of Object.keys(rapold.modes))assert.equal(await readFile(join(dist,`tokens.${mode}.css`),'utf8'),modeCssText(rapold,mode));
  for(const path of [identity.fonts.stylesheet,...identity.fonts.families.map(font=>font.path)])
    assert.deepEqual(await readFile(join(dist,'fonts',path.split('/').at(-1))),await readFile(join(root,'brands/rapold',path)),path);
  for(const product of identity.products)for(const [variant,source] of Object.entries(product.variants))
    assert.deepEqual(await readFile(join(dist,'signets',`${product.id}-${variant}.svg`)),await readFile(join(root,'brands/rapold',source)),`${product.id}-${variant}`);
  for(const product of identity.products){
    const icons=await readdir(join(dist,'icons',product.id));
    for(const file of ['favicon.svg','favicon.ico','apple-touch-icon.png','manifest.webmanifest'])assert.ok(icons.includes(file),`${product.id}: ${file}`);
  }
});

test('der typisierte Index deckt alle Produkte aus identity.json ab',async()=>{
  const catalog=await import(new URL('../packages/brand-rapold/dist/index.mjs',import.meta.url).href+`?t=${Date.now()}`);
  const ids=identity.products.map(product=>product.id);
  assert.deepEqual([...catalog.productIds],ids);
  assert.equal(catalog.getProduct('edgeportal').domain,'edgeportal.rapold.io');
  assert.equal(catalog.signetPath('edgeportal','light'),'@rapold/brand-rapold/signets/edgeportal-light.svg');
  assert.ok(catalog.colorRoles.includes('primary')&&catalog.colorRoles.includes('background'));
  const types=await readFile(join(packageRoot,'dist/index.d.ts'),'utf8');
  for(const id of ids)assert.match(types,new RegExp(`"${id}"`),`ProductId ohne ${id}`);
  assert.match(types,/export declare function signetPath\(id: ProductId/);
});

test('der Core-Tarball bleibt markenfrei: keine Brand-Hexwerte, Firmen- oder Produktnamen',async()=>{
  const brandIds=['rapold','radiox','dominicano-express'];
  const hexes=new Set(Object.values(identity.palette).map(value=>value.toUpperCase()));
  for(const id of brandIds){
    const json=await readFile(join(root,'packages/brands/src',`${id}.json`),'utf8');
    for(const [hex] of json.matchAll(/#[0-9A-Fa-f]{6}\b/g))hexes.add(hex.toUpperCase());
  }
  // «Atlas» ist der Name des Designsystems selbst (z. B. --atlas-duration-cap), keine Markenbindung.
  const names=['Rapold','RadioX','Dominicano','Geist',...identity.products.map(product=>product.name).filter(name=>name!=='Atlas')];
  const {dir,files}=packs['@rapold/framework-core'];
  for(const file of files){
    // LICENSE nennt den Rechteinhaber; das ist Lizenz, keine Markenbindung.
    if(file==='LICENSE'||file==='package.json')continue;
    const text=await readFile(join(root,dir,file),'utf8');
    for(const [hex] of text.matchAll(/#[0-9A-Fa-f]{6}\b/g))assert.ok(!hexes.has(hex.toUpperCase()),`${file}: Brand-Hexwert ${hex}`);
    for(const name of names)assert.ok(!new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`,'i').test(text),`${file}: Name ${name}`);
  }
});
