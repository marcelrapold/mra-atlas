import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {brands} from '../packages/brands/src/index.mjs';
import {presentationTheme} from '../packages/brands/src/presentation.mjs';
import {slideScene} from '../packages/brands/src/slide-scene.mjs';
import {renderScenes} from '../packages/presentation/src/render.mjs';
import {pruneBrandOutputs} from './prune-brand-outputs.mjs';
await pruneBrandOutputs();
for(const brand of brands){
 const theme=presentationTheme(brand),directory=new URL(`../apps/docs/public/brands/${brand.id}/decks/`,import.meta.url);
 await mkdir(directory,{recursive:true});
 for(const set of [{id:'muster-deck',types:theme.slides.map(s=>s.id)},...theme.presets.map(p=>({id:p.id,types:p.folgen.map(f=>f.typ)}))]){
  const scenes=set.types.map((id,i)=>{const scene=slideScene(id,theme);scene.nodes.forEach(n=>{if(n.kind==='text'&&n.text==='01'&&n.y>17)n.text=String(i+1).padStart(2,'0');});return scene;});
  const notes=set.types.map(id=>`Illustrative Beispieldaten, keine Projektfakten. Brand: ${brand.id}. Typ: ${id}. Layout: Atlas. Originalfotos vor Verwendung ergänzen.`);
  await writeFile(new URL(`${set.id}.pptx`,directory),await renderScenes(brand,scenes,{title:`${brand.name} · ${set.id}`,notes,assetRoot:fileURLToPath(new URL('../apps/docs/public/',import.meta.url))}));
 }
}
console.log('Generated editable decks for every brand and preset.');
