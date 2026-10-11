import {readFile,writeFile,mkdir,rename,rm,mkdtemp} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createProjectDeck,validateProject} from '../packages/presentation/src/index.mjs';
const args=process.argv.slice(2),file=args[0];
if(!file||file==='--help'){console.log('node scripts/export-project.mjs deck.json --out ./deck-output [--repo-dir ./checkout] [--pdf]');process.exit(file?0:1);}
const value=flag=>{const i=args.indexOf(flag);return i<0?undefined:args[i+1];};
const input=JSON.parse(await readFile(file,'utf8')),output=path.resolve(value('--out')??'deck-output');
const check=validateProject(input);if(!check.valid){console.error(JSON.stringify(check,null,2));process.exit(1);}
const repoDir=value('--repo-dir');
if(repoDir){
 for(const source of input.slides.flatMap(s=>s.sources??[])){
  if(source.repository&&source.repository!==input.repository)throw new Error('A single --repo-dir cannot verify evidence from another repository.');
  const body=execFileSync('git',['-C',path.resolve(repoDir),'show',`${source.commit}:${source.path}`],{encoding:'utf8',maxBuffer:8*1024*1024});
  if(source.excerpt&&!body.includes(source.excerpt))throw new Error(`Source excerpt mismatch: ${source.id}`);
 }
}
const result=await createProjectDeck(input,{assetRoot:fileURLToPath(new URL('../apps/docs/public/',import.meta.url)),imageRoot:path.dirname(path.resolve(file))});
const temp=await mkdtemp(path.join(os.tmpdir(),'framework-deck-'));
try{
 await writeFile(path.join(temp,'presentation.pptx'),result.pptx);
 result.manifest.evidenceVerification=repoDir?'Commit paths and supplied excerpts verified against local git objects.':'Source metadata supplied by the author; repository objects not checked.';
 await writeFile(path.join(temp,'sources.json'),JSON.stringify(result.manifest,null,2)+'\n');
 await writeFile(path.join(temp,'deck.json'),JSON.stringify(input,null,2)+'\n');
 if(args.includes('--pdf'))execFileSync('soffice',[`-env:UserInstallation=file://${path.join(temp,'office-profile')}`,'--headless','--convert-to','pdf','--outdir',temp,path.join(temp,'presentation.pptx')],{stdio:'pipe',timeout:60000});
 const files=['presentation.pptx','sources.json','deck.json',...(args.includes('--pdf')?['presentation.pdf']:[])];
 // Verify every requested artifact before publishing any output.
 const buffers=await Promise.all(files.map(f=>readFile(path.join(temp,f))));
 await mkdir(output,{recursive:true});
 for(const [i,name] of files.entries())await writeFile(path.join(output,name),buffers[i]);
 console.log(JSON.stringify({output,files,slides:input.slides.length,brand:input.brand,evidenceVerified:!!repoDir},null,2));
}finally{await rm(temp,{recursive:true,force:true});}
