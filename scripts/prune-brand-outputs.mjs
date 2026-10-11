import {lstat,readFile,readdir,rm,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {brands} from '../packages/brands/src/index.mjs';

const outputRoots=[new URL('../apps/docs/public/',import.meta.url),new URL('../apps/docs/out/',import.meta.url)];

/** Retire generated brand trees without treating generated files as sources. */
export async function pruneBrandOutputs({roots=outputRoots,activeIds=brands.map(brand=>brand.id)}={}) {
  if(!Array.isArray(activeIds)||!activeIds.length||new Set(activeIds).size!==activeIds.length||activeIds.some(id=>typeof id!=='string'||!/^[a-z][a-z0-9-]*$/.test(id)))throw new Error('A nonempty, valid active brand registry is required.');
  const active=new Set(activeIds),results=[];
  for(const root of roots) {
    const outputRoot=root instanceof URL?fileURLToPath(root):resolve(root);
    const brandRoot=join(outputRoot,'brands');
    const rootStat=await lstat(brandRoot).catch(error=>{if(error.code==='ENOENT')return null;throw error;});
    if(rootStat?.isSymbolicLink())throw new Error('The generated brand root must not be a symbolic link.');
    const entries=rootStat?await readdir(brandRoot,{withFileTypes:true}):[];
    const referencePath=join(outputRoot,'presentation-reference.json');
    const reference=await readFile(referencePath,'utf8').then(JSON.parse).catch(error=>{if(error.code==='ENOENT')return null;throw error;});
    if(reference&&!Array.isArray(reference.files))throw new Error('Invalid generated presentation reference manifest.');
    const retained=reference?.files.filter(entry=>{
      const match=/^brands\/([^/]+)\/reference\//.exec(entry.path);
      return !match||active.has(match[1]);
    });
    const removedBrands=[];
    for(const entry of entries) {
      if(active.has(entry.name)||(!entry.isDirectory()&&!entry.isSymbolicLink()))continue;
      await rm(join(brandRoot,entry.name),{recursive:true,force:true});
      removedBrands.push(entry.name);
    }
    const removedReferences=reference?reference.files.length-retained.length:0;
    if(removedReferences) {
      // Keep the original sourceHash: removing a brand does not certify that
      // retained previews were rendered from the new source configuration.
      await writeFile(referencePath,JSON.stringify({...reference,files:retained},null,2)+'\n');
    }
    results.push({root:outputRoot,removedBrands:removedBrands.sort(),removedReferences});
  }
  return results;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)console.log(JSON.stringify(await pruneBrandOutputs(),null,2));
