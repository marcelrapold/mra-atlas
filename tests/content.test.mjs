// Content lint: keeps spelling, legacy names, links, version claims and machine paths from drifting.
// Dependency-free. Uses `git ls-files` and falls back to a filesystem walk where no Git metadata exists (e.g. Vercel builds).
import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync,readFileSync,readdirSync,statSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {brands} from '../packages/brands/src/index.mjs';

const root=fileURLToPath(new URL('..',import.meta.url));
const SKIP_DIRS=new Set(['.git','node_modules','.next','out','.vercel','.sites-runtime','.claude','brands-private','deck-output']);
const walk=(dir,rel='')=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const r=rel?`${rel}/${e.name}`:e.name;if(e.isDirectory())return SKIP_DIRS.has(e.name)||r==='apps/docs/public'?[]:walk(path.join(dir,e.name),r);return e.isFile()?[r]:[];});
let fromGit=true;
const tracked=(()=>{try{return execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).split('\0').filter(Boolean);}catch{fromGit=false;return walk(root);}})().filter(f=>existsSync(path.join(root,f)));
const trackedSet=new Set(tracked),trackedDirs=new Set(tracked.flatMap(f=>f.split('/').slice(0,-1).map((_,i,a)=>a.slice(0,i+1).join('/'))));
const BINARY=/\.(png|jpe?g|webp|gif|ico|pdf|pptx|zip|woff2?|ttf|otf|bundle|tgz)$/i;
const cache=new Map(),read=f=>{if(!cache.has(f))cache.set(f,readFileSync(path.join(root,f),'utf8'));return cache.get(f);};
const textFiles=tracked.filter(f=>!BINARY.test(f)&&!readFileSync(path.join(root,f)).subarray(0,8000).includes(0));
const markdown=tracked.filter(f=>f.endsWith('.md'));
const hits=(files,re)=>files.flatMap(f=>read(f).split('\n').flatMap((line,i)=>re.test(line)?[`${f}:${i+1}: ${line.trim().slice(0,160)}`]:[]));
// Dated evidence keeps the names that were true at the time; everything else uses the current ones.
const EVIDENCE=[/^docs\/apple-design-audit\.md$/,/^docs\/deployment\.md$/,/^docs\/review\//,/^CHANGELOG\.md$/,/^brands\/rapold\/sources\/provenance\.json$/];
const isEvidence=f=>EVIDENCE.some(re=>re.test(f));

test('Swiss spelling: no sharp s inside a word in docs, llms.txt or docs app sources',()=>{
  const files=tracked.filter(f=>f.endsWith('.md')||f==='llms.txt'||/^apps\/docs\/app\/.*\.tsx?$/.test(f));
  // A standalone character (e.g. "no ß" in an audit rule) names the letter; inside a word it is spelling.
  assert.deepEqual(hits(files,/\p{L}ß|ß\p{L}/u),[]);
});

test('no references to the excluded transport association',()=>{
  // Built from parts so this guard does not match itself; lockfile hashes and the guard tests are excluded.
  const re=new RegExp(['z','v','v'].join(''),'i');
  assert.deepEqual(hits(textFiles.filter(f=>f!=='package-lock.json'&&!f.startsWith('tests/')),re),[]);
});

test('legacy domain and repository names appear only in dated evidence',()=>{
  assert.deepEqual(hits(textFiles.filter(f=>!isEvidence(f)&&f!=='tests/content.test.mjs'),/design\.rapold\.io|mra-design\b/),[]);
});

test('no absolute local machine paths in tracked text files',()=>{
  assert.deepEqual(hits(textFiles,/\b[A-Za-z]:\\Users\\|\/Users\/[^/\s]|\/home\/[^/\s]/),[]);
});

// GitHub heading anchors: rendered text, lower case, punctuation removed, spaces to hyphens, duplicates numbered.
export const slug=text=>text.replace(/!?\[([^\]]*)\]\([^)]*\)/g,'$1').replace(/<[^>]+>/g,'').replace(/[*_`~]/g,'').trim().toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu,'').replace(/ /g,'-');
const stripFences=text=>text.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm,''),stripCode=text=>stripFences(text).replace(/`[^`\n]*`/g,'');
const anchorsCache=new Map();
const anchors=file=>{
  if(anchorsCache.has(file))return anchorsCache.get(file);
  const seen=new Map(),set=new Set();
  for(const [,heading] of stripFences(read(file)).matchAll(/^#{1,6}[ \t]+(.+?)[ \t#]*$/gm)){const base=slug(heading),n=seen.get(base)??0;seen.set(base,n+1);set.add(n?`${base}-${n}`:base);}
  for(const [,id] of read(file).matchAll(/<a\s+(?:id|name)="([^"]+)"/g))set.add(id);
  anchorsCache.set(file,set);return set;
};
const links=file=>{
  const text=stripCode(read(file)),out=[];
  for(const m of text.matchAll(/!?\[(?:[^\]\\]|\\.)*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g))out.push(m[1]);
  for(const m of text.matchAll(/^\s{0,3}\[[^\]]+\]:\s*<?(\S+?)>?(?:\s+"[^"]*")?\s*$/gm))out.push(m[1]);
  return out;
};

test('every relative markdown link and anchor resolves',()=>{
  const broken=[];
  for(const file of markdown)for(const target of links(file)){
    if(/^[a-z][a-z0-9+.-]*:/i.test(target)||target.startsWith('/'))continue;
    const [rawPath,rawHash]=target.split('#'),relPath=decodeURIComponent(rawPath);
    const resolved=relPath?path.posix.normalize(path.posix.join(path.posix.dirname(file),relPath)).replace(/\/$/,''):file;
    // Without Git metadata the walk skips generated output, so links into it fall back to the file system.
    if(!trackedSet.has(resolved)&&!trackedDirs.has(resolved)&&(fromGit||!existsSync(path.join(root,resolved)))){broken.push(`${file}: ${target} (missing ${resolved})`);continue;}
    if(rawHash!==undefined&&resolved.endsWith('.md')&&!anchors(resolved).has(decodeURIComponent(rawHash)))broken.push(`${file}: ${target} (no heading #${decodeURIComponent(rawHash)})`);
  }
  assert.deepEqual(broken,[]);
});

test('slugs follow the GitHub rules used by the link check',()=>{
  assert.equal(slug('6. Produktions- und Browsernachprüfung · 11.10.2026'),'6-produktions--und-browsernachprüfung--11102026');
  assert.equal(slug('Prüfstand und dokumentierte Grenzen'),'prüfstand-und-dokumentierte-grenzen');
  assert.equal(slug('`deck` und **Logo**'),'deck-und-logo');
});

const {version}=JSON.parse(read('package.json'));
test('current-state version claims in README and HANDOFF match package.json',()=>{
  for(const file of ['README.md','HANDOFF.md']){
    const claims=read(file).split('\n').filter(l=>/^#{1,6} .*Stand\b|^\*\*Stand:?\*\*/.test(l)).flatMap(l=>l.match(/(?<![\d.])\d{1,2}\.\d{1,3}\.\d{1,3}(?![\d.])/g)??[]);
    assert.ok(claims.length,`${file} states no current version`);
    assert.deepEqual([...new Set(claims)],[version],`${file} current-state version differs from package.json ${version}`);
  }
});

test('README names every registered brand id',()=>{
  const readme=read('README.md');
  assert.deepEqual(brands.map(b=>b.id).filter(id=>!readme.includes(`\`${id}\``)),[]);
});

test('the umbrella mark proposal is never presented without its proposal label',()=>{
  // «Der First» awaits approval. Entry documents label it in the same paragraph; every other doc or app source labels it at least once.
  const mark='«Der First»',entry=new Set(['README.md','HANDOFF.md','llms.txt']);
  const files=tracked.filter(f=>f.endsWith('.md')||f==='llms.txt'||/^apps\/docs\/app\/.*\.tsx?$/.test(f)).filter(f=>read(f).includes(mark));
  const bare=files.flatMap(f=>entry.has(f)?read(f).split(/\n\s*\n/).filter(p=>p.includes(mark)&&!/Vorschlag/.test(p)).map(p=>`${f}: ${p.trim().slice(0,160)}`):/Vorschlag/.test(read(f))?[]:[f]);
  assert.deepEqual(bare,[]);
});
