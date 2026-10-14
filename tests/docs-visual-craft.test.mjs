import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');
const app='apps/docs/app/';
const globals=await read(app+'globals.css');
const stripComments=css=>css.replace(/\/\*[\s\S]*?\*\//g,'');
const css=stripComments(globals);
// Brand layers (.rapold-*, .rx-*) keep their own geometry and are out of scope.
/** Bodies of every block whose prelude starts with `prefix`, brace-matched. */
const blocks=prefix=>{
  const out=[];let at=0;
  while((at=css.indexOf(prefix,at))>=0){
    let i=css.indexOf('{',at),depth=0;const start=i+1;
    for(;i<css.length;i++){if(css[i]==='{')depth++;else if(css[i]==='}'&&--depth===0)break;}
    out.push(css.slice(start,i));at=i;
  }
  return out;
};
const declarations=[...css.matchAll(/([^{};]+)\{([^{}]*)\}/g)].filter(([,selector])=>!/\.(?:rapold|rx)-/.test(selector)).flatMap(([,,body])=>body.split(';').map(d=>d.trim()).filter(Boolean));

test('globals.css keeps at most four hard-coded px font sizes',()=>{
  const sizes=new Set();
  for(const d of declarations){
    const [property,...rest]=d.split(':');const value=rest.join(':');
    if(property==='font-size'||property==='font'||/^--docs-(?:micro|code)$/.test(property)) for(const m of value.matchAll(/(\d+(?:\.\d+)?)px/g)) sizes.add(m[1]);
  }
  assert.ok(sizes.size<=4,`hard-coded font sizes: ${[...sizes].join(', ')}px`);
});

test('margins, paddings and gaps sit on the 4px grid (1-3px optical nudges allowed)',()=>{
  const off=[];
  for(const d of declarations){
    const [property,...rest]=d.split(':');
    if(!/^(?:margin|padding|gap|row-gap|column-gap)(?:-[a-z-]+)?$/.test(property))continue;
    for(const m of rest.join(':').matchAll(/(\d+(?:\.\d+)?)px/g)){const px=Number(m[1]);if(px>3&&px%4!==0)off.push(d);}
  }
  assert.deepEqual(off,[]);
});

test('the type ladder and rhythm come from the foundation tokens',()=>{
  assert.match(css,/--docs-display:clamp\(var\(--font-size-3xl\)/);
  assert.match(css,/\bh1\{font-size:var\(--docs-display\)/);
  assert.match(css,/--docs-h2:var\(--font-size-2xl\)/);
  assert.match(css,/--docs-h3:var\(--font-size-lg\)/);
  assert.match(css,/--docs-section-gap:var\(--spacing-12\)/);
  assert.match(css,/main\{padding:var\(--spacing-6\) var\(--spacing-4\)/,'mobile main keeps a 16px gutter');
  assert.match(css,/letter-spacing:var\(--docs-tracking-display\)/);
  assert.doesNotMatch(css,/letter-spacing:-?[\d.]+px/,'tracking is set in em');
});

test('content grids answer to <main> through container queries',()=>{
  assert.match(css,/main\{container:content\/inline-size/);
  const queried=blocks('@container content').join('');
  for(const grid of ['token-grid','deck-steps','login-example','org-editor-grid','brand-choices','brand-logo-grid','table-toolbar','active-brand-card'])
    assert.ok(queried.includes('.'+grid),`${grid} needs an @container rule`);
  const media=blocks('@media').join('');
  for(const grid of ['token-grid','deck-steps','login-example','org-editor-grid','brand-choices','brand-logo-grid','table-toolbar','active-brand-card'])
    assert.ok(!media.includes('.'+grid),`${grid} must not use a viewport media query`);
});

test('base layer, focus and motion are declared once',async()=>{
  assert.match(css,/@layer base\{[^@]*a:focus-visible,button:focus-visible,select:focus-visible,summary:focus-visible\{outline:3px solid var\(--ring\)/);
  // Core resets motion inside .framework-scope; html sits outside it and needs its own scroll-behavior reset.
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{html\{scroll-behavior:auto\}\}/);
  assert.match(css,/html\{scroll-padding-top:/);
  assert.match(css,/@supports \(animation-timeline:scroll\(\)\)/);
  assert.match(css,/@supports \(interpolate-size:allow-keywords\)/);
  const a11y=await read(app+'accessibility.css');
  // Tailwind v4 outline-2 without outline-solid leaves TabsContent without a visible ring (WCAG 2.4.7).
  assert.match(a11y,/\[data-slot='tabs-content'\]\):focus-visible \{outline: 3px solid/,'tabs-content focus patch stays until core sets outline-style');
  assert.match(a11y,/changelog-header \{padding: clamp\(.*\dcqi/);
});

test('typographic finishing',()=>{
  assert.match(css,/h1,h2,h3\{text-wrap:balance\}/);
  assert.match(css,/p,li[^{]*\{text-wrap:pretty\}/);
  assert.match(css,/\.eyebrow\{[^}]*font-feature-settings:'case'/);
  assert.match(css,/\.metrics strong\{[^}]*tabular-nums/);
  assert.match(css,/\.deck-facts strong\{[^}]*tabular-nums/);
  assert.match(css,/\.framework-scope\.dark\{-webkit-font-smoothing:antialiased/);
  assert.match(css,/\.page-heading--home/);
  assert.match(css,/\.page-heading--compact h1\{font-size:var\(--font-size-xl\)/);
});

test('product-world styles ship with the brand page, not the main stylesheet',async()=>{
  assert.doesNotMatch(css,/worlds\.css|wordmarks\.css/);
  assert.match(await read(app+'_components/rapold-showcase.tsx'),/import '\.\.\/\.\.\/\.\.\/\.\.\/brands\/rapold\/wordmarks\.css';/);
  assert.doesNotMatch(css,/\.rapold-world|\.rw-/);
  const worlds=await read(app+'_components/rapold-worlds.tsx');
  assert.match(worlds,/import '\.\.\/\.\.\/\.\.\/\.\.\/brands\/rapold\/worlds\.css';/);
  // worlds.css is a published download: selectors stay stable and the file matches the audited contrast record.
  assert.match(worlds,/<div className="rw-background-label"><span>\{world\.label\}<\/span><strong>/);
  assert.match(worlds,/<div className="rw-details"><div><p className="eyebrow">\{world\.sourceLabel\}<\/p><h3>/);
  const sheet=await readFile(new URL('../brands/rapold/worlds.css',import.meta.url));
  const audit=JSON.parse(await read('docs/review/product-worlds-contrast.json'));
  const recorded=audit.sources.find(source=>source.path==='brands/rapold/worlds.css').sha256;
  assert.equal(createHash('sha256').update(sheet).digest('hex'),recorded,'worlds.css changed: refresh docs/review/product-worlds-contrast.json');
});

test('demo stage layout rules leave visually hidden children alone',()=>{
  // A fill stage widening an absolutely positioned .sr-only span caused horizontal scroll on /notices.
  const rules=[...css.matchAll(/([^{}]*\.demo-stage[^{}]*)\{([^{}]*)\}/g)];
  const childRules=rules.filter(([,selector,body])=>/\.demo-stage(?:\[[^\]]+\])?>\*/.test(selector)&&/(?:^|;)(?:max-)?(?:width|margin(?:-[a-z]+)?):/.test(body));
  assert.deepEqual(childRules.map(([,selector])=>selector.trim()),[],'use >:not(.sr-only) for child sizing');
  assert.match(css,/\.demo-stage\{position:relative;/,'stage contains absolutely positioned children');
});

test('every demo panel uses DemoPanel with a unique slug and a code snippet',async()=>{
  const dir=app+'_components/demos/';
  const files=[...(await readdir(new URL(`../${dir}`,import.meta.url))).map(f=>dir+f),app+'_components/component-demo.tsx'];
  const ids=[];
  for(const file of files){
    const source=await read(file);
    assert.doesNotMatch(source,/<section className="demo-panel">/,`${file} still has a hand-built panel`);
    const panels=source.split('<DemoPanel').slice(1).map(part=>part.split('</DemoPanel>')[0]);
    assert.ok(panels.length>0,`${file} has no DemoPanel`);
    for(const props of panels){
      const id=props.match(/\bid="([a-z0-9-]+)"/)?.[1];
      assert.ok(id,`${file}: panel without slug id`);
      assert.match(props,/\bcode=\{/,`${file}#${id}: panel without code`);
      ids.push(file.endsWith('component-demo.tsx')?`components/${id}`:id);
    }
  }
  assert.equal(new Set(ids).size,ids.length,'panel ids are unique');
  const panel=await read(app+'_components/demo-panel.tsx');
  for(const text of ['Vorschau','Code kopieren','role="status"','Kopiert','execCommand','demo-stage']) assert.ok(panel.includes(text),text);
});

test('Mermaid renders near the viewport and keeps its frame',async()=>{
  const diagram=await read(app+'_components/mermaid-diagram.tsx');
  assert.match(diagram,/IntersectionObserver/);
  assert.match(diagram,/400px/);
  assert.match(diagram,/scheduler/);
  assert.match(diagram,/requestIdleCallback/);
  assert.match(diagram,/aspectRatio:locked/);
  assert.match(diagram,/data-stale/);
});
