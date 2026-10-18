#!/usr/bin/env node
/**
 * Baut packages/brand-rapold/dist/ aus den kanonischen Quellen. npm packt nur Dateien im Paketordner,
 * deshalb kopiert dieser Schritt vor `npm pack` alles hinein; dist ist generiert und nicht eingecheckt.
 *
 *   tokens.css, tokens.light.css, tokens.dark.css  packages/brands/src/rapold.json über dieselben Generatoren wie die Website
 *   fonts/                                         brands/rapold/assets/fonts (Geist, Geist Mono, OFL und Lizenzhinweise)
 *   signets/<produkt>-<variante>.svg               brands/rapold/assets/logos laut identity.json
 *   icons/<produkt>/                               Favicon-Satz und Web-Manifest aus build-brand-assets.mjs (in einen Temp-Ordner)
 *   edgeportal/boot/                               brands/rapold/edgeportal/boot, nur wenn der Ordner beim Packen existiert
 *   index.mjs, index.d.ts                          typisierter Katalog aus identity.json und den Token-Rollen
 *
 * Deterministisch: gleiche Quellen ergeben dieselben Dateien (keine Zeitstempel, sortierte Listen).
 * Standalone: node scripts/build-brand-package.mjs
 */
import {cp,mkdir,mkdtemp,readFile,readdir,rm,stat,writeFile,copyFile} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {brands,toCssText} from '../packages/brands/src/index.mjs';
import {modeCssText} from './build-token-exports.mjs';
import {buildBrandAssets} from './build-brand-assets.mjs';

const repositoryRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const packageRoot=join(repositoryRoot,'packages/brand-rapold');
const canonicalRoot=join(repositoryRoot,'brands/rapold');
const SIGNET_VARIANTS=['dark','light','mono-white','mono-black','current-color'];
const ICON_FILES=['favicon.svg','favicon.ico','favicon-16x16.png','favicon-32x32.png','favicon-48x48.png','favicon-64x64.png','favicon-96x96.png','apple-touch-icon.png','android-chrome-192x192.png','android-chrome-512x512.png','maskable-icon-192x192.png','maskable-icon-512x512.png'];
const exists=path=>stat(path).then(()=>true,()=>false);

async function listFiles(directory,prefix=''){
  const out=[];
  for(const entry of (await readdir(directory,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){
    const rel=prefix?`${prefix}/${entry.name}`:entry.name;
    if(entry.isDirectory())out.push(...await listFiles(join(directory,entry.name),rel));
    else if(entry.isFile())out.push(rel);
  }
  return out;
}

const json=value=>JSON.stringify(value,null,2);

/** Builds the package into `outDir` (default packages/brand-rapold/dist) and returns the written relative paths. */
export async function buildBrandPackage({outDir=join(packageRoot,'dist')}={}){
  const brand=brands.find(b=>b.id==='rapold');
  if(!brand)throw new Error('Brand rapold is not registered.');
  const identity=JSON.parse(await readFile(join(canonicalRoot,'identity.json'),'utf8'));
  const {name,version}=JSON.parse(await readFile(join(packageRoot,'package.json'),'utf8'));
  await rm(outDir,{recursive:true,force:true});
  await mkdir(outDir,{recursive:true});

  // Tokens: dieselben Generatoren wie /brands/rapold/tokens*.css auf der Website.
  const tokensCss=toCssText(brand);
  await writeFile(join(outDir,'tokens.css'),tokensCss);
  for(const mode of Object.keys(brand.modes))await writeFile(join(outDir,`tokens.${mode}.css`),modeCssText(brand,mode));

  // Fonts mit Lizenzdateien, unverändert.
  const fontFiles=[identity.fonts.stylesheet,...identity.fonts.families.map(font=>font.path),...identity.fonts.licenseFiles];
  await mkdir(join(outDir,'fonts'),{recursive:true});
  for(const path of fontFiles){
    if(!path.startsWith('assets/fonts/'))throw new Error(`Font resource outside assets/fonts/: ${path}`);
    await copyFile(join(canonicalRoot,path),join(outDir,'fonts',path.slice('assets/fonts/'.length)));
  }

  // Signets je Produkt und Variante, aus den kanonischen SVGs.
  await mkdir(join(outDir,'signets'),{recursive:true});
  for(const product of identity.products)for(const variant of SIGNET_VARIANTS){
    const source=product.variants?.[variant];
    if(!source)throw new Error(`${product.id}: variant ${variant} missing in identity.json.`);
    await copyFile(join(canonicalRoot,source),join(outDir,'signets',`${product.id}-${variant}.svg`));
  }

  // Favicon-Satz und Manifest: derselbe Generator wie die Website, aber in einen eigenen Temp-Ordner.
  const scratch=await mkdtemp(join(tmpdir(),'atlas-brand-rapold-'));
  try{
    await buildBrandAssets({outputRoot:scratch});
    for(const product of identity.products){
      const target=join(outDir,'icons',product.id);
      await mkdir(target,{recursive:true});
      for(const file of ICON_FILES)await copyFile(join(scratch,'exports',product.id,'icons',file),join(target,file));
      await copyFile(join(scratch,'exports',product.id,'manifest.webmanifest'),join(target,'manifest.webmanifest'));
    }
  }finally{
    await rm(scratch,{recursive:true,force:true});
  }

  // Reserviert: Boot-Kit von EdgePortal, nur wenn die Quelle existiert (wird auf einem anderen Zweig gebaut).
  const bootSource=join(canonicalRoot,'edgeportal/boot');
  const hasBoot=await exists(bootSource);
  if(hasBoot)await cp(bootSource,join(outDir,'edgeportal/boot'),{recursive:true});

  // Typisierter Katalog.
  const colorRoles=[...tokensCss.matchAll(/^\s*--([a-z0-9-]+):\s*light-dark\(/gm)].map(m=>m[1]);
  const cssVariables=[...new Set([...tokensCss.matchAll(/^\s*(--[a-z0-9-]+):/gm)].map(m=>m[1]))];
  const spec=file=>`${name}/${file}`;
  const products=identity.products.map(product=>({
    id:product.id,name:product.name,shortName:product.shortName??product.name,domain:product.domain??null,status:product.status,
    signets:Object.fromEntries(SIGNET_VARIANTS.map(variant=>[variant,spec(`signets/${product.id}-${variant}.svg`)])),
    icons:{favicon:spec(`icons/${product.id}/favicon.svg`),ico:spec(`icons/${product.id}/favicon.ico`),appleTouch:spec(`icons/${product.id}/apple-touch-icon.png`),manifest:spec(`icons/${product.id}/manifest.webmanifest`)},
  }));
  const catalog={packageName:name,version,brandId:'rapold',identityVersion:identity.version,stylesheets:{tokens:spec('tokens.css'),fonts:spec('fonts.css')},products,colorRoles,cssVariables,edgeportalBoot:hasBoot};
  const ids=products.map(p=>JSON.stringify(p.id)).join(' | ');
  await writeFile(join(outDir,'index.mjs'),`// Generiert von scripts/build-brand-package.mjs aus brands/rapold/identity.json. Nicht von Hand ändern.
export const catalog = Object.freeze(${json(catalog)});
export const packageName = catalog.packageName;
export const version = catalog.version;
export const brandId = catalog.brandId;
export const products = catalog.products;
export const productIds = Object.freeze(products.map(product => product.id));
export const colorRoles = catalog.colorRoles;
export const cssVariables = catalog.cssVariables;
export const stylesheets = catalog.stylesheets;
export const signetVariants = Object.freeze(${JSON.stringify(SIGNET_VARIANTS)});
/** Produkt nach ID, sonst undefined. */
export function getProduct(id) { return products.find(product => product.id === id); }
/** Paketpfad eines Signets, z. B. signetPath('edgeportal', 'dark'). */
export function signetPath(id, variant = 'dark') {
  const product = getProduct(id);
  if (!product) throw new Error(\`Unknown Rapold product: \${id}\`);
  return product.signets[variant];
}
`);
  await writeFile(join(outDir,'index.d.ts'),`// Generiert von scripts/build-brand-package.mjs. Nicht von Hand ändern.
export type ProductId = ${ids};
export type SignetVariant = ${SIGNET_VARIANTS.map(v=>JSON.stringify(v)).join(' | ')};
export type ColorRole = ${colorRoles.map(r=>JSON.stringify(r)).join(' | ')};
export interface RapoldProduct {
  readonly id: ProductId;
  readonly name: string;
  readonly shortName: string;
  /** Hostname ohne Schema, null wenn das Produkt keine eigene Domain hat. */
  readonly domain: string | null;
  readonly status: string;
  /** Paketpfade (Import-Spezifizierer) der Signets je Variante. */
  readonly signets: Readonly<Record<SignetVariant, string>>;
  readonly icons: Readonly<{ favicon: string; ico: string; appleTouch: string; manifest: string }>;
}
export interface RapoldCatalog {
  readonly packageName: '${name}';
  readonly version: string;
  readonly brandId: 'rapold';
  readonly identityVersion: string;
  readonly stylesheets: Readonly<{ tokens: string; fonts: string }>;
  readonly products: readonly RapoldProduct[];
  readonly colorRoles: readonly ColorRole[];
  readonly cssVariables: readonly string[];
  readonly edgeportalBoot: boolean;
}
export declare const catalog: RapoldCatalog;
export declare const packageName: '${name}';
export declare const version: string;
export declare const brandId: 'rapold';
export declare const products: readonly RapoldProduct[];
export declare const productIds: readonly ProductId[];
export declare const colorRoles: readonly ColorRole[];
export declare const cssVariables: readonly string[];
export declare const stylesheets: RapoldCatalog['stylesheets'];
export declare const signetVariants: readonly SignetVariant[];
export declare function getProduct(id: ProductId): RapoldProduct;
export declare function getProduct(id: string): RapoldProduct | undefined;
export declare function signetPath(id: ProductId, variant?: SignetVariant): string;
`);
  // Typen für Datei-Exporte (CSS, SVG, PNG): Seiteneffekt-Import oder URL über den Bundler.
  await writeFile(join(outDir,'asset.d.ts'),`// Generiert von scripts/build-brand-package.mjs. Typ der Datei-Exporte (Stylesheets, Signets, Icons).
declare const asset: string;
export default asset;
`);
  // Lizenzen: Atlas-Lizenz liegt im Paketordner (LICENSE), Drittlizenzen der Fonts unter fonts/.
  return listFiles(outDir);
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const files=await buildBrandPackage();
  console.log(`Built @rapold/brand-rapold dist: ${files.length} files.`);
}
