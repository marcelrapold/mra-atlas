import {createHash} from 'node:crypto';
import {readFile,readdir} from 'node:fs/promises';
import {brands} from '../packages/brands/src/index.mjs';
// Only the fields the deck renderer actually consumes. Version, status, sources
// and the presentation/genAI guidance blocks are metadata: they never reach a
// rendered slide, so they must not invalidate committed PDFs and PNGs.
export const renderedBrandKeys=Object.freeze(['id','name','modes','typography','shape','assets','palette','tokens']);
export async function referenceDigest(){
 const h=createHash('sha256');
 for(const file of ['packages/brands/src/slide-scene.mjs','packages/brands/src/atlas-slide-content.mjs','packages/brands/src/presentation.mjs','packages/brands/src/deck-foundation.json','packages/brands/src/deck-presets.json','packages/presentation/src/render.mjs','packages/presentation/src/chart-labels.mjs','scripts/build-decks.mjs'])h.update(await readFile(new URL('../'+file,import.meta.url)));
 h.update(JSON.stringify(brands.map(brand=>Object.fromEntries(renderedBrandKeys.map(key=>[key,brand[key]??null])))));
 for(const b of brands)if(b.assets?.logo)h.update(await readFile(new URL('../apps/docs/public/'+b.assets.logo.path,import.meta.url)));
 // Shipped brand fonts affect the rendered reference even when token values do
 // not change. Hash source bytes, never a machine-specific font-cache path.
 h.update(await readFile(new URL('./prepare-render-fonts.py',import.meta.url)));
 for(const brand of brands){
  const dir=new URL(`../brands/${brand.id}/assets/fonts/`,import.meta.url);
  const entries=await readdir(dir).catch(error=>{if(error.code==='ENOENT')return [];throw error;});
  for(const file of entries.filter(name=>/\.(woff2?|ttf|otf)$/i.test(name)).sort())h.update(await readFile(new URL(file,dir)));
 }
 for(const pkg of ['pptxgenjs','jszip','@fontsource/inter'])h.update(JSON.parse(await readFile(new URL('../node_modules/'+pkg+'/package.json',import.meta.url),'utf8')).version);
 return h.digest('hex');
}
export async function verifyReferenceCache(){
 const manifest=JSON.parse(await readFile(new URL('../apps/docs/public/presentation-reference.json',import.meta.url),'utf8'));
 if(manifest.sourceHash!==await referenceDigest())throw new Error('PPTX previews are stale. Run npm run deck:reference and commit the rendered assets.');
 for(const entry of manifest.files){const data=await readFile(new URL('../apps/docs/public/'+entry.path,import.meta.url));if(createHash('sha256').update(data).digest('hex')!==entry.sha256)throw new Error(`Reference asset mismatch: ${entry.path}`);}
 return manifest;
}
