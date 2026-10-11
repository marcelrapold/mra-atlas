import {fileURLToPath} from 'node:url';
import {brands} from '../../brands/src/index.mjs';
import {presentationTheme} from '../../brands/src/presentation.mjs';
import {validateProject} from './validate-project.mjs';
import {projectScene} from './project-scene.mjs';
import {renderScenes} from './render.mjs';
export {validateProject,projectScene,renderScenes};
export async function createProjectDeck(input,{brand=brands.find(b=>b.id===input.brand),assetRoot=fileURLToPath(new URL('../../../apps/docs/public/',import.meta.url)),imageRoot}={}){
 const validation=validateProject(input);if(!validation.valid){const error=new Error(validation.errors.map(e=>`${e.path}: ${e.message}`).join('\n'));error.validation=validation;throw error;}
 if(!brand||brand.id!==input.brand)throw new Error(`Unknown or mismatched brand: ${input.brand}`);
 const theme=presentationTheme(brand),scenes=input.slides.map((s,i)=>projectScene(s,theme,i));
 const manifest={schemaVersion:1,repository:input.repository,commit:input.commit,brand:brand.id,brandVersion:brand.version,brandStatus:brand.status,decisionQuestion:input.decisionQuestion,slides:input.slides.map((s,i)=>({slide:i+1,type:s.type,title:s.title,sources:s.sources??[],claims:s.claims??[],metrics:s.metrics??[],takeaway:s.takeaway,resolution:s.resolution,...(s.content?.image?{image:s.content.image}:{})})),designDeviations:input.designDeviations??[]};
 const notes=manifest.slides.map(s=>JSON.stringify({repository:input.repository,commit:input.commit,...s},null,2));
 return {pptx:await renderScenes(brand,scenes,{title:input.title,notes,assetRoot,imageRoot}),manifest,scenes};
}
