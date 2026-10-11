import {execFileSync} from 'node:child_process';
import {mkdtemp,rm,mkdir,readFile,writeFile,readdir,copyFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {brands} from '../packages/brands/src/index.mjs';
import {slides,presets} from '../packages/brands/src/presentation.mjs';
import {referenceDigest} from './reference-cache.mjs';
await import('./build-decks.mjs');
const root=new URL('../apps/docs/public/',import.meta.url),temporary=await mkdtemp(path.join(os.tmpdir(),'framework-reference-')),files=[];
try{
 for(const brand of brands){
  const dir=new URL(`brands/${brand.id}/reference/`,root);await mkdir(dir,{recursive:true});
  for(const set of ['muster-deck',...presets.map(p=>p.id)]){
   const input=fileURLToPath(new URL(`brands/${brand.id}/decks/${set}.pptx`,root)),work=path.join(temporary,brand.id,set);await mkdir(work,{recursive:true});
   execFileSync('soffice',[`-env:UserInstallation=file://${path.join(temporary,'profile')}`,'--headless','--convert-to','pdf','--outdir',work,input],{stdio:'pipe',timeout:60000});
   const pdf=path.join(work,`${set}.pdf`);await copyFile(pdf,new URL(`${set}.pdf`,dir));
   if(set==='muster-deck'){
    execFileSync('pdftoppm',['-scale-to','1280','-png',pdf,path.join(work,'slide')],{stdio:'pipe',timeout:60000});
    const images=(await readdir(work)).filter(x=>/^slide-\d+\.png$/.test(x)).sort((a,b)=>Number(a.match(/\d+/)[0])-Number(b.match(/\d+/)[0]));
    if(images.length!==slides.length)throw new Error('Rendered slide count mismatch');
    for(const [i,file] of images.entries())await copyFile(path.join(work,file),new URL(slides[i].id+'.png',dir));
   }
   console.log(`Rendered ${brand.id}/${set}`);
  }
  for(const name of await readdir(dir)){const data=await readFile(new URL(name,dir));files.push({path:`brands/${brand.id}/reference/${name}`,sha256:createHash('sha256').update(data).digest('hex'),bytes:data.length});}
 }
 const manifest={schemaVersion:1,sourceHash:await referenceDigest(),renderer:execFileSync('soffice',['--version'],{encoding:'utf8'}).trim(),renderedAt:new Date().toISOString(),files};
 await writeFile(new URL('presentation-reference.json',root),JSON.stringify(manifest,null,2)+'\n');
 console.log(`${files.length} PDF and PNG files, derived from the exported PowerPoints.`);
}finally{await rm(temporary,{recursive:true,force:true});}
