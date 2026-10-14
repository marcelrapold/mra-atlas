import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const component=name=>readFile(new URL(`../apps/docs/app/_components/${name}`,import.meta.url),'utf8');

test('shared reference page stays free of the slide catalogue and prompt compiler', async()=>{
 const source=await component('reference-page.tsx');
 assert.doesNotMatch(source,/presentation\.mjs|prompt-compiler\.mjs|slide-preview/,'Präsentations- und Prompt-Module gehören in seitenspezifische Chunks');
 assert.doesNotMatch(source.match(/^import \{[^}]*\} from '@rapold\/framework-core';$/m)?.[0]??'',/Dialog/,'Dialog-Teile werden hier nicht verwendet');
 assert.doesNotMatch(source,/Alle 19|<strong>18<\/strong>|<strong>5<\/strong>/,'Zählwerte kommen aus den Daten');
 for(const file of ['overview-section','typography-deck','agenten-section'])assert.match(source,new RegExp(`dynamic\\(\\(\\)=>import\\('\\./sections/${file}'\\)`),`${file} wird per next/dynamic geladen`);
});

test('overview counts derive from the catalogues', async()=>{
 const source=await component('sections/overview-section.tsx');
 for(const expr of ['componentNames.length','slides.length','presets.length'])assert.ok(source.includes(expr),`${expr} fehlt`);
});

test('icon gallery renders masks instead of bundling the Lucide namespace', async()=>{
 const source=await component('icon-gallery.tsx');
 assert.doesNotMatch(source,/^import .*'lucide-react'/m,'kein Lucide-Import im Galerie-Chunk');
 assert.match(source,/icon-glyph/);
 assert.match(source,/\/icons\/names\.json/);
 assert.match(source,/LICENSE\.txt/);
 const css=await component('icon-gallery.css');
 assert.match(css,/mask:var\(--icon-url\)/);
 assert.match(css,/content-visibility:auto/);
 const script=await readFile(new URL('../scripts/build-icons.mjs',import.meta.url),'utf8');
 assert.match(script,/names\.json/);
});

test('in-page navigation and pager use the agreed landmarks', async()=>{
 const toc=await component('page-toc.tsx'),pager=await component('pager.tsx');
 assert.match(toc,/aria-label="Auf dieser Seite"/);
 assert.match(toc,/entries\.length<3/);
 assert.match(toc,/'praesentation','mermaid'/);
 assert.match(toc,/IntersectionObserver/);
 assert.match(pager,/aria-label="Seitenwechsel"/);
 assert.match(pager,/Zurück/);assert.match(pager,/Weiter/);
 assert.match(pager,/\?brand=\$\{encodeURIComponent\(brandId\)\}/,'Seitenwechsel behält die Brand');
});
