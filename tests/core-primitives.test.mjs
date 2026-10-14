import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire, registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Disclosure, table and empty primitives in packages/core/src/ui: a few source scans for
// repo rules, and server-rendered markup for behaviour (element types, ARIA, data-state).
const UI = fileURLToPath(new URL('../packages/core/src/ui/', import.meta.url));
const OWNED = ['accordion', 'collapsible', 'toggle-group', 'progress', 'table', 'kbd', 'empty-state', 'motion-keyframes'];
const read = (name) => readFileSync(`${UI}${name}.tsx`, 'utf8');
const sources = Object.fromEntries(OWNED.map((name) => [name, read(name)]));

/* ---------------------------------------------------------------------------------------- */
/* Render harness: transpile .ts/.tsx from packages/core on import, resolve extensionless.   */
/* ---------------------------------------------------------------------------------------- */

const require = createRequire(import.meta.url);
const ts = require('typescript');
const CORE = pathToFileURL(fileURLToPath(new URL('../packages/core/src/', import.meta.url))).href;

registerHooks({
  resolve(specifier, context, next) {
    if (context.parentURL?.startsWith(CORE) && /^\.\.?\//.test(specifier) && !/\.[cm]?[jt]sx?$/.test(specifier)) {
      for (const ext of ['.ts', '.tsx', '/index.ts']) {
        const url = new URL(specifier + ext, context.parentURL);
        if (existsSync(url)) return { url: url.href, shortCircuit: true };
      }
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (!url.startsWith(CORE) || !/\.tsx?$/.test(url)) return next(url, context);
    const { outputText } = ts.transpileModule(readFileSync(new URL(url), 'utf8'), {
      fileName: fileURLToPath(url),
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    });
    return { format: 'module', source: outputText, shortCircuit: true };
  },
});

const React = await import('react');
const { renderToStaticMarkup } = await import('react-dom/server');
const h = React.createElement;
const load = (name) => import(`${CORE}ui/${name}.tsx`);
const render = (el) => renderToStaticMarkup(el);
/** Opening tag of the element carrying `data-slot="<slot>"`. */
function tagOf(html, slot) {
  const m = html.match(new RegExp(`<([a-z0-9]+)\\b[^>]*data-slot="${slot}"[^>]*>`));
  assert.ok(m, `data-slot="${slot}" not rendered`);
  return { name: m[1], tag: m[0] };
}
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];

/* ---------------------------------------------------------------------------------------- */
/* Source scans (repo rules)                                                                 */
/* ---------------------------------------------------------------------------------------- */

test('every owned file is LF-only', () => {
  for (const [name, src] of Object.entries(sources)) assert.ok(!src.includes('\r'), `${name}.tsx contains CR`);
});

test("'use client' exactly where hooks or stateful Radix primitives are used", () => {
  for (const [name, src] of Object.entries(sources)) {
    const usesHooks = /\bReact\.(?:use[A-Z]\w*|createContext)\b|\buse(?:State|Effect|Context|Memo|Ref|Id|Callback)\(/.test(src);
    // Slot is stateless and fine in server components; any other Radix primitive is not.
    const radixImports = (src.match(/import \{([^}]*)\} from 'radix-ui'/)?.[1] ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    const usesStatefulRadix = radixImports.some((s) => s !== 'Slot');
    const isClient = src.startsWith("'use client'");
    assert.equal(isClient, usesHooks || usesStatefulRadix, `${name}.tsx: 'use client' is ${isClient ? 'present but not needed' : 'missing'}`);
  }
});

test('focus is never outline-none combined with a focus-visible outline', () => {
  for (const [name, src] of Object.entries(sources)) {
    assert.ok(!(/\boutline-none\b/.test(src) && /focus-visible:outline-\d/.test(src)), `${name}.tsx mixes outline-none with focus-visible:outline-N`);
    assert.doesNotMatch(src, /\bfocus:ring|\bfocus-visible:ring-\[/, `${name}.tsx uses a box-shadow focus ring`);
  }
});

/** Names of the exported React components (PascalCase values in `export { … }`). */
function exportedComponents(src) {
  const names = [];
  for (const [, list] of src.matchAll(/^export \{([^}]*)\}/gm)) {
    for (const raw of list.split(',')) {
      const name = raw.trim().split(/\s+as\s+/).pop();
      if (name && /^[A-Z]/.test(name)) names.push(name);
    }
  }
  return names;
}

test('every exported component part sets its own data-slot', () => {
  for (const [name, src] of Object.entries(sources)) {
    for (const component of exportedComponents(src)) {
      // EmptyState is a preset of parts that carry data-slot; CoreKeyframes renders only a <style>.
      if (component === 'EmptyState' || component === 'CoreKeyframes') continue;
      const start = src.search(new RegExp(`^function ${component}\\b`, 'm'));
      assert.ok(start >= 0, `${name}.tsx: function ${component} not found`);
      const rest = src.slice(start + 1);
      const end = rest.search(/^(?:function |export |const |type )/m);
      assert.match(end < 0 ? rest : rest.slice(0, end), /data-slot="[a-z-]+"/, `${name}.tsx: ${component} lacks data-slot`);
    }
  }
});

test('no English default labels', () => {
  const english = /\b(?:Loading|Close|Open|Toggle|Expand|Collapse|Next|Previous|No (?:results|data|items)|Empty|Progress|Scroll(?:able)?)\b/;
  for (const [name, src] of Object.entries(sources)) {
    const defaults = [...src.matchAll(/\b\w+ = '([^']*)'/g)].map((m) => m[1]);
    const jsxText = [...src.matchAll(/>([^<>{}\n]*[A-Za-z][^<>{}\n]*)</g)].map((m) => m[1].trim()).filter(Boolean);
    for (const text of [...defaults, ...jsxText]) assert.doesNotMatch(text, english, `${name}.tsx: English default «${text}»`);
  }
});

test('no invisible no-break space in the sources', () => {
  for (const [name, src] of Object.entries(sources)) assert.ok(!src.includes(String.fromCharCode(0xa0)), `${name}.tsx contains U+00A0`);
});

test('animations run only under motion-safe', () => {
  for (const [name, src] of Object.entries(sources)) {
    for (const m of src.matchAll(/([\w:=[\]-]*)animate-\[/g)) assert.match(m[1], /^motion-safe:/, `${name}.tsx: animate-[…] without motion-safe`);
  }
});

/* ---------------------------------------------------------------------------------------- */
/* Rendered behaviour                                                                        */
/* ---------------------------------------------------------------------------------------- */

test('data-slot names are unique across the rendered parts', async () => {
  const { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption } = await load('table');
  const { Kbd, KbdGroup } = await load('kbd');
  const { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } = await load('empty-state');
  const html = render(
    h('div', null,
      h(Table, null, h(TableCaption, null, 'c'), h(TableHeader, null, h(TableRow, null, h(TableHead, null, 'a'))),
        h(TableBody, null, h(TableRow, null, h(TableCell, null, '1'))), h(TableFooter, null, h(TableRow, null, h(TableCell, null, '2')))),
      h(KbdGroup, null, h(Kbd, null, 'K')),
      h(Empty, null, h(EmptyMedia), h(EmptyHeader, null, h(EmptyTitle, null, 't'), h(EmptyDescription, null, 'd')), h(EmptyContent))),
  );
  const slots = [...html.matchAll(/data-slot="([a-z-]+)"/g)].map((m) => m[1]);
  const perPart = new Set(slots);
  for (const slot of ['table-container', 'table', 'table-caption', 'table-header', 'table-body', 'table-footer', 'table-row', 'table-head', 'table-cell',
    'kbd', 'kbd-group', 'empty', 'empty-media', 'empty-header', 'empty-title', 'empty-description', 'empty-content']) {
    assert.ok(perPart.has(slot), `${slot} missing`);
  }
});

test('EmptyState renders the same elements as before: h3 title, p description', async () => {
  const { EmptyState, EmptyDescription, EmptyTitle } = await load('empty-state');
  const html = render(h(EmptyState, { title: 'Keine Einträge', description: 'Noch nichts erfasst.', actions: h('button', null, 'Neu') }));
  assert.equal(tagOf(html, 'empty-title').name, 'h3');
  assert.equal(tagOf(html, 'empty-description').name, 'p');
  assert.match(html, /<h3[^>]*>Keine Einträge<\/h3>/);
  assert.match(html, /<p[^>]*>Noch nichts erfasst\.<\/p>/);
  assert.match(html, /<button>Neu<\/button>/);
  assert.equal(tagOf(render(h(EmptyState, { title: 'x', headingLevel: 2 })), 'empty-title').name, 'h2');
  assert.doesNotMatch(render(h(EmptyState, { title: 'x' })), /empty-description|empty-content|empty-media/);
  assert.equal(tagOf(render(h(EmptyDescription, null, 'd')), 'empty-description').name, 'p');
  assert.equal(tagOf(render(h(EmptyTitle, null, 't')), 'empty-title').name, 'div');
  // Root props pass through to the frame.
  assert.equal(attr(tagOf(render(h(EmptyState, { title: 'x', id: 'leer' })), 'empty').tag, 'id'), 'leer');
});

test('progress keeps ARIA and data-state consistent with the bar', async () => {
  const { Progress, formatProgressValue } = await load('progress');
  assert.equal(formatProgressValue(42, 100), `42${String.fromCharCode(0xa0)}%`);
  assert.equal(formatProgressValue(1, 3), `33${String.fromCharCode(0xa0)}%`);

  const root = (props) => tagOf(render(h(Progress, { 'aria-label': 'Upload', ...props })), 'progress').tag;
  const bar = (props) => tagOf(render(h(Progress, { 'aria-label': 'Upload', ...props })), 'progress-indicator').tag;

  const mid = root({ value: 42 });
  assert.equal(attr(mid, 'role'), 'progressbar');
  assert.equal(attr(mid, 'aria-valuenow'), '42');
  assert.equal(attr(mid, 'aria-valuetext'), `42${String.fromCharCode(0xa0)}%`);
  assert.equal(attr(mid, 'data-state'), 'loading');

  const errors = [];
  const original = console.error;
  console.error = (...args) => errors.push(args.join(' '));
  try {
    // Out of range: clamped, still determinate, no Radix warning.
    const over = root({ value: 150 });
    assert.equal(attr(over, 'aria-valuenow'), '100');
    assert.equal(attr(over, 'data-state'), 'complete');
    assert.match(bar({ value: 150 }), /translateX\(-0%\)/);
    const under = root({ value: -5 });
    assert.equal(attr(under, 'aria-valuenow'), '0');
    assert.equal(attr(under, 'data-state'), 'loading');
    assert.match(bar({ value: -5 }), /translateX\(-100%\)/);
    assert.equal(attr(root({ value: 3, max: 6 }), 'aria-valuetext'), `50${String.fromCharCode(0xa0)}%`);
    // Invalid max falls back to 100.
    assert.equal(attr(root({ value: 50, max: 0 }), 'aria-valuemax'), '100');
  } finally {
    console.error = original;
  }
  assert.deepEqual(errors, []);

  for (const value of [null, undefined, Number.NaN]) {
    const tag = root({ value });
    assert.equal(attr(tag, 'data-state'), 'indeterminate');
    assert.equal(attr(tag, 'aria-valuenow'), undefined);
  }
});

test('table scroll container is a named, focusable region only with scrollLabel', async () => {
  const { Table, TableRow, TableHead, TableCell } = await load('table');
  const plain = tagOf(render(h(Table)), 'table-container').tag;
  assert.equal(attr(plain, 'role'), undefined);
  assert.equal(attr(plain, 'tabindex'), undefined);
  const named = tagOf(render(h(Table, { scrollLabel: 'Projekte, horizontal scrollbar' })), 'table-container').tag;
  assert.equal(attr(named, 'role'), 'region');
  assert.equal(attr(named, 'tabindex'), '0');
  assert.equal(attr(named, 'aria-label'), 'Projekte, horizontal scrollbar');

  const row = (props) => tagOf(render(h('table', null, h('tbody', null, h(TableRow, props)))), 'table-row').tag;
  assert.equal(attr(row({ selected: true }), 'data-state'), 'selected');
  assert.equal(attr(row({}), 'data-state'), undefined);

  const cells = render(h('table', null, h('tbody', null, h('tr', null, h(TableHead, { numeric: true }, 'Betrag'), h(TableCell, { numeric: true }, '1’200')))));
  const head = tagOf(cells, 'table-head');
  assert.equal(head.name, 'th');
  assert.equal(attr(head.tag, 'scope'), 'col');
  for (const slot of ['table-head', 'table-cell']) {
    const { tag } = tagOf(cells, slot);
    assert.ok(attr(tag, 'data-numeric') !== undefined, `${slot} lacks data-numeric`);
    assert.match(attr(tag, 'class'), /\btabular-nums\b/);
    assert.match(attr(tag, 'class'), /\btext-end\b/);
  }
});

test('toggle group: roles from Radix, all arrow keys unless orientation is set', async () => {
  const { ToggleGroup, ToggleGroupItem } = await load('toggle-group');
  const group = (props) =>
    render(h(ToggleGroup, { 'aria-label': 'Ansicht', ...props }, h(ToggleGroupItem, { value: 'a' }, 'A'), h(ToggleGroupItem, { value: 'b' }, 'B')));

  const single = group({ type: 'single', defaultValue: 'a' });
  const root = tagOf(single, 'toggle-group').tag;
  assert.equal(attr(root, 'role'), 'radiogroup');
  assert.equal(attr(root, 'data-orientation'), 'horizontal', 'horizontal layout by default');
  // Radix roving focus marks its items with the orientation it got; none means both arrow axes.
  assert.equal(attr(tagOf(single, 'toggle-group-item').tag, 'data-orientation'), undefined, 'no orientation passed to Radix by default');
  assert.match(single, /role="radio"[^>]*aria-checked="true"/);
  assert.equal(attr(tagOf(group({ type: 'multiple' }), 'toggle-group').tag, 'role'), 'toolbar');

  const vertical = tagOf(group({ type: 'single', orientation: 'vertical' }), 'toggle-group').tag;
  assert.equal(attr(vertical, 'data-orientation'), 'vertical');
  assert.equal(attr(tagOf(group({ type: 'single', orientation: 'vertical' }), 'toggle-group-item').tag, 'data-orientation'), 'vertical');

  // Small sizes keep a 44px hit area; joined bars only across the bar.
  const item = (props) => attr(tagOf(group(props), 'toggle-group-item').tag, 'class');
  assert.match(item({ type: 'single' }), /after:h-11/);
  assert.match(item({ type: 'single', spacing: 2 }), /after:size-11/);
  assert.doesNotMatch(item({ type: 'single', size: 'lg' }), /after:(?:h|w|size)-11/);
});

test('accordion trigger sits in a heading of the requested level', async () => {
  const { Accordion, AccordionItem, AccordionTrigger, AccordionContent } = await load('accordion');
  const html = (headingLevel) =>
    render(h(Accordion, { type: 'single', collapsible: true }, h(AccordionItem, { value: 'a' }, h(AccordionTrigger, { headingLevel }, 'Frage'), h(AccordionContent, null, 'Antwort'))));
  assert.match(html(undefined), /<h3\b[^>]*>\s*<button\b[^>]*aria-expanded="false"/);
  assert.match(html(2), /<h2\b[^>]*>\s*<button\b/);
});

test('kbd renders native kbd elements, nested for a combination', async () => {
  const { Kbd, KbdGroup } = await load('kbd');
  const html = render(h(KbdGroup, null, h(Kbd, null, 'Strg'), h(Kbd, null, 'K')));
  assert.equal(tagOf(html, 'kbd-group').name, 'kbd');
  assert.equal(tagOf(html, 'kbd').name, 'kbd');
});
