import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {brands} from '../packages/brands/src/index.mjs';

const guide=(await readFile(new URL('../llms.txt',import.meta.url),'utf8')).replace(/\r\n/g,'\n');
const lines=guide.split('\n');
const sections=guide.split(/^## /m).slice(1).map(part=>{const [title,...body]=part.split('\n');return {title:title.trim(),body:body.join('\n')};});

test('llms.txt follows the llmstxt.org structure',()=>{
 assert.match(lines[0],/^# \S/,'Starts with exactly one H1');
 assert.equal(lines.filter(l=>/^# /.test(l)).length,1,'Only one H1');
 assert.equal(lines[1],'');
 assert.match(lines[2],/^> \S.{40,}/,'Blockquote summary directly after the H1');
 assert.ok(!/^#{3,} /m.test(guide),'Only H1 and H2 headings');
 assert.deepEqual(sections.map(s=>s.title),['Einstieg für ausführende Agenten','Verträge','Aktive Brand','Komponenten','Präsentation','Optional']);
 for(const {title,body} of sections){
  const items=body.split('\n').filter(Boolean);
  assert.ok(items.length,`${title}: has entries`);
  for(const item of items)assert.match(item,/^- \[[^\]]+\]\(https:\/\/[^\s)]+\)(: \S.*)?$/,`${title}: «${item}» is a link list entry`);
 }
});

test('llms.txt has no bare root-relative list items',()=>{
 for(const line of lines)assert.doesNotMatch(line,/^\s*[-*] \/|^\s*[-*] [^[]*\s\/(brands|contracts|praesentation|icons)\//,`Bare path: ${line}`);
 assert.doesNotMatch(guide,/^\/\S+$/m,'No bare path lines');
});

test('llms.txt keeps the theme placeholder and its rules',()=>{
 assert.ok(guide.includes('https://atlas.rapold.io/brands/{brand}/management.md'));
 assert.ok(guide.includes('bestimmt `{brand}`;\nohne Theme-Wahl `neutral` verwenden.'));
 assert.ok(guide.includes('Ohne ausdrückliche Theme-Wahl gilt das Default-Preset (brand: neutral).'));
 assert.ok(guide.includes('Nur Quellen und Assets der aktiven Brand verwenden; keine Firmenvorgaben aus anderen Themes übernehmen.'));
 assert.ok(!guide.includes('*.json'),'Brand files are named explicitly, not as a glob');
 assert.doesNotMatch(guide,/goldbach|sygnum|zvv/i);
 assert.doesNotMatch(guide,/ß/,'Swiss spelling');
});

test('the advertised entries cover tokens, components and the full context',()=>{
 const body=title=>sections.find(s=>s.title===title).body;
 for(const mode of ['light','dark'])for(const ext of ['json','css','dtcg.json'])assert.ok(body('Aktive Brand').includes(`/brands/{brand}/tokens.${mode}.${ext})`),`tokens.${mode}.${ext}`);
 assert.ok(body('Verträge').includes('/contracts/engineering.md)'));
 assert.ok(body('Komponenten').includes('/contracts/components.md)')&&body('Komponenten').includes('/contracts/components.json)'));
 assert.ok(body('Einstieg für ausführende Agenten').includes('/brands/{brand}/llms-full.txt)'));
 for(const target of ['/icons/index.json)','/build-info.json)','https://github.com/marcelrapold/mra-atlas)'])assert.ok(body('Optional').includes(target),target);
});

test('repository paths named in llms.txt exist for every brand',async()=>{
 const paths=[...guide.matchAll(/\b((?:docs|packages|scripts)\/[\w{}./-]+\.(?:md|json|mjs))/g)].map(m=>m[1]);
 assert.ok(paths.some(p=>p.includes('{brand}')),'The brand file is named per theme');
 for(const path of paths)for(const brand of path.includes('{brand}')?brands:[{id:null}])
  await access(new URL('../'+path.replaceAll('{brand}',brand.id),import.meta.url));
});
