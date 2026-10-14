import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {brands} from '../packages/brands/src/index.mjs';
import {presentationTheme,slides} from '../packages/brands/src/presentation.mjs';
import {slideScene} from '../packages/brands/src/slide-scene.mjs';
import {projectScene} from '../packages/presentation/src/project-scene.mjs';
// Brands without a `deck` block must keep the exact scenes and presentation.json
// they had before the deck render contract existed. The baseline was captured
// from the pre-contract renderer; regenerate it only for an intended change of
// the neutral recipes (BASELINE_UPDATE=1 node --test tests/deck-baseline.test.mjs).
const baselineFile=new URL('./fixtures/deck-baseline.json',import.meta.url);
const input=JSON.parse(await readFile(new URL('../examples/framework-review.json',import.meta.url),'utf8'));
const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
function fingerprints(brand){
 const theme=presentationTheme(brand),out={'presentation.json':sha(theme)};
 for(const s of slides)out[`slide/${s.id}`]=sha(slideScene(s.id,theme));
 input.slides.forEach((s,i)=>{out[`project/${i}`]=sha(projectScene(s,theme,i));});
 const evidence=input.slides[1].sources,claims=Array.from({length:4},(_,i)=>({title:`Befund ${i+1}`,text:'Eine konkrete belegte Aussage.',kind:'fact',sourceId:evidence[0].id}));
 const metrics=Array.from({length:3},(_,i)=>({label:`Messpunkt ${i+1}`,value:9+i,comparison:7+i,unit:'Fälle',period:'2026',comparisonPeriod:'2025',sourceId:evidence[0].id}));
 for(const recipe of slides){
  const s={...input.slides[2],type:recipe.id,title:'Prüfbare Projektinhalte',claims:claims.slice(0,recipe.id==='phasen-karten-gate'?4:recipe.id==='zwei-grosskarten'?2:3),metrics,sources:evidence,items:['Projektstand'],resolution:{kind:'open-question',text:'Welcher Nachweis fehlt?'},content:{chart:true,image:{path:'local-photo.png',alt:'Lokales Prüfmotiv',credit:'Test'},gates:['Abnahmekriterium'],timeline:[{label:'Beginn',date:'Jan',kind:'past'},{label:'Review',date:'Jun',kind:'current'}],columns:['Q1','Q2','Q3','Q4'],rows:[{label:'Pilot',start:0,span:2}]}};
  out[`recipe/${recipe.id}`]=sha(projectScene(s,theme,3));
 }
 return out;
}
const tracked=['neutral','dominicano-express'];
test('brands without a deck block render byte-identical scenes and themes',async()=>{
 const current=Object.fromEntries(tracked.map(id=>{const brand=brands.find(b=>b.id===id);assert.ok(brand,id);assert.equal(brand.deck,undefined,`${id} must stay a deck-less baseline brand`);return [id,fingerprints(brand)];}));
 if(process.env.BASELINE_UPDATE==='1')await writeFile(baselineFile,JSON.stringify(current,null,1)+'\n');
 const baseline=JSON.parse(await readFile(baselineFile,'utf8'));
 for(const id of tracked)for(const [key,value] of Object.entries(baseline[id]))assert.equal(current[id][key],value,`${id}: ${key} changed`);
 for(const id of tracked)assert.deepEqual(Object.keys(current[id]).sort(),Object.keys(baseline[id]).sort(),`${id}: scene set`);
});
