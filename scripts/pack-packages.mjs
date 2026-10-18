#!/usr/bin/env node
/**
 * Baut @rapold/brand-rapold und packt es zusammen mit @rapold/framework-core als Tarball nach dist/packages/.
 * Veröffentlicht nichts: beide Pakete bleiben "private"; npm pack schreibt nur lokale Dateien
 * (<scope>-<name>-<version>.tgz). Bezug in Produkten: docs/produkte-einbinden.md, Entscheid: docs/adr/0001-npm-bezug.md.
 */
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir,readFile} from 'node:fs/promises';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildBrandPackage} from './build-brand-package.mjs';

const repositoryRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const PACKED_PACKAGES=['packages/brand-rapold','packages/core'];
const destination=join(repositoryRoot,'dist/packages');

/** npm pack für ein Paketverzeichnis; dryRun liefert nur die Dateiliste. Skripte laufen nicht (dist ist schon gebaut). */
export function npmPack(packageDir,{dryRun=false,dest=destination}={}){
  const args=['pack','--json','--ignore-scripts',...dryRun?['--dry-run']:['--pack-destination',dest]];
  const out=execFileSync('npm',args,{cwd:join(repositoryRoot,packageDir),encoding:'utf8',stdio:['ignore','pipe','pipe'],env:{...process.env,npm_config_update_notifier:'false',npm_config_fund:'false',npm_config_audit:'false'}});
  const [result]=JSON.parse(out);
  return result;
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const built=await buildBrandPackage();
  console.log(`@rapold/brand-rapold: dist mit ${built.length} Dateien gebaut.`);
  await mkdir(destination,{recursive:true});
  for(const dir of PACKED_PACKAGES){
    const result=npmPack(dir);
    const file=join(destination,result.filename);
    const sha256=createHash('sha256').update(await readFile(file)).digest('hex');
    console.log(`${result.name}@${result.version}: dist/packages/${result.filename} (${result.entryCount} Dateien, ${(result.size/1024).toFixed(0)} KiB, sha256 ${sha256})`);
  }
}
