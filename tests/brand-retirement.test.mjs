import test from 'node:test';
import assert from 'node:assert/strict';
import {access,mkdtemp,mkdir,readFile,rm,symlink,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import * as registry from '../packages/brands/src/index.mjs';
import {canSymlink} from './symlink-support.mjs';
import {pruneBrandOutputs} from '../scripts/prune-brand-outputs.mjs';

const activeIds=['neutral','dominicano-express','rapold','radiox'];
const retiredIds=['goldbach','sygnum'];

test('the actual registry and canonical packages expose only the retained brands',async()=>{
  assert.deepEqual(registry.brands.map(brand=>brand.id),activeIds);
  for(const id of retiredIds){
    assert.equal(id in registry,false,`Retired named export: ${id}`);
    for(const path of [`packages/brands/src/${id}.json`,`brands/${id}`])await assert.rejects(access(new URL('../'+path,import.meta.url)),{code:'ENOENT'});
  }
  for(const brand of registry.brands){
    const source=JSON.parse(await readFile(new URL(`../packages/brands/src/${brand.id}.json`,import.meta.url),'utf8'));
    assert.deepEqual(brand,source,`${brand.id}: canonical registry source`);
  }
});

test('generator cleanup removes retired exports and references while preserving active files and render provenance',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'framework-retired-brands-'));
  try{
    const roots=['public','out'].map(name=>join(directory,name));
    for(const root of roots){
      for(const id of [...activeIds,...retiredIds]){
        const target=join(root,'brands',id,'reference');await mkdir(target,{recursive:true});
        await writeFile(join(target,'cover.png'),`${id}: committed reference bytes`);
      }
      await writeFile(join(root,'brands','index.json'),'registry is regenerated separately');
      await writeFile(join(root,'presentation-reference.json'),JSON.stringify({schemaVersion:1,sourceHash:'original-render-source-hash',files:[...activeIds,...retiredIds].map(id=>({path:`brands/${id}/reference/cover.png`,sha256:'a'.repeat(64),bytes:1}))}));
    }
    const result=await pruneBrandOutputs({roots});
    assert.equal(result.length,2);
    for(const item of result){
      assert.deepEqual(item.removedBrands,retiredIds);
      assert.equal(item.removedReferences,2);
      for(const id of retiredIds)await assert.rejects(access(join(item.root,'brands',id)),{code:'ENOENT'});
      for(const id of activeIds)assert.equal(await readFile(join(item.root,'brands',id,'reference','cover.png'),'utf8'),`${id}: committed reference bytes`);
      assert.equal(await readFile(join(item.root,'brands','index.json'),'utf8'),'registry is regenerated separately');
      const reference=JSON.parse(await readFile(join(item.root,'presentation-reference.json'),'utf8'));
      assert.equal(reference.sourceHash,'original-render-source-hash','Cleanup must not certify an unrendered source configuration');
      assert.deepEqual(reference.files.map(file=>file.path),activeIds.map(id=>`brands/${id}/reference/cover.png`));
    }
    const repeated=await pruneBrandOutputs({roots});
    assert.ok(repeated.every(item=>!item.removedBrands.length&&!item.removedReferences));
  }finally{await rm(directory,{recursive:true,force:true});}
});

test('cleanup cannot follow retired symlinks or operate with an invalid empty registry',{skip:!canSymlink&&'symlinks unavailable on this system'},async()=>{
  const directory=await mkdtemp(join(tmpdir(),'framework-brand-prune-boundary-'));
  try{
    const output=join(directory,'public'),outside=join(directory,'canonical-source');
    await mkdir(join(output,'brands'),{recursive:true});await mkdir(outside);
    await writeFile(join(outside,'original.svg'),'original source bytes');
    await symlink(outside,join(output,'brands','sygnum'));
    await assert.rejects(()=>pruneBrandOutputs({roots:[output],activeIds:[]}),/registry/);
    await assert.rejects(()=>pruneBrandOutputs({roots:[output],activeIds:['../canonical-source']}),/registry/);
    await pruneBrandOutputs({roots:[output]});
    await assert.rejects(access(join(output,'brands','sygnum')),{code:'ENOENT'});
    assert.equal(await readFile(join(outside,'original.svg'),'utf8'),'original source bytes');
  }finally{await rm(directory,{recursive:true,force:true});}
});
