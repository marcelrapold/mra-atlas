import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Source scan of the disclosure, table and empty primitives in packages/core/src/ui.
const UI = fileURLToPath(new URL('../packages/core/src/ui/', import.meta.url));
const OWNED = ['accordion', 'collapsible', 'toggle-group', 'progress', 'table', 'kbd', 'empty-state'];
const read = (name) => readFileSync(`${UI}${name}.tsx`, 'utf8');
const sources = Object.fromEntries(OWNED.map((name) => [name, read(name)]));

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

/** Body of `function Name(…) { … }` up to the next top-level function or export. */
function componentBody(src, name) {
  const start = src.search(new RegExp(`^function ${name}\\b`, 'm'));
  assert.ok(start >= 0, `function ${name} not found`);
  const rest = src.slice(start + 1);
  const end = rest.search(/^(?:function |export |const |type )/m);
  return end < 0 ? rest : rest.slice(0, end);
}

test('every owned file is LF-only', () => {
  for (const [name, src] of Object.entries(sources)) assert.ok(!src.includes('\r'), `${name}.tsx contains CR`);
});

test('every exported component part sets its own data-slot', () => {
  for (const [name, src] of Object.entries(sources)) {
    const components = exportedComponents(src);
    assert.ok(components.length > 0, `${name}.tsx exports no components`);
    for (const component of components) {
      // EmptyState is a preset composed of parts that already carry data-slot.
      if (component === 'EmptyState') continue;
      assert.match(componentBody(src, component), /data-slot="[a-z-]+"/, `${name}.tsx: ${component} lacks data-slot`);
    }
  }
});

test('data-slot names are unique across the owned files', () => {
  const slots = Object.values(sources).flatMap((src) => [...src.matchAll(/data-slot="([a-z-]+)"/g)].map((m) => m[1]));
  assert.deepEqual(slots.filter((slot, i) => slots.indexOf(slot) !== i), []);
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

test('no English default labels', () => {
  const english = /\b(?:Loading|Close|Open|Toggle|Expand|Collapse|Next|Previous|No (?:results|data|items)|Empty|Progress|Scroll(?:able)?)\b/;
  for (const [name, src] of Object.entries(sources)) {
    // String defaults: `label = '…'`, `= "…"` in destructuring, and visible JSX text.
    const defaults = [...src.matchAll(/\b\w+ = '([^']*)'/g)].map((m) => m[1]);
    const jsxText = [...src.matchAll(/>([^<>{}\n]*[A-Za-z][^<>{}\n]*)</g)].map((m) => m[1].trim()).filter(Boolean);
    for (const text of [...defaults, ...jsxText]) assert.doesNotMatch(text, english, `${name}.tsx: English default «${text}»`);
  }
});

test('progress formats the German default value label', () => {
  const src = sources.progress;
  assert.match(src, /\$\{Math\.round\(\(value \/ max\) \* 100\)\}\$\{NBSP\}%/);
  assert.match(src, /const NBSP = String\.fromCharCode\(0xa0\)/);
  assert.ok(!src.includes(String.fromCharCode(0xa0)), 'no invisible no-break space in the source');
  assert.match(src, /getValueLabel = formatProgressValue/);
  assert.match(src, /value=\{determinate \? value : null\}/, 'non-numeric values fall back to indeterminate');
  assert.match(src, /motion-safe:transition-transform/);
});

test('table scroll container becomes a named, focusable region only with scrollLabel', () => {
  const src = sources.table;
  assert.match(src, /data-slot="table-container"/);
  assert.match(src, /overflow-x-auto/);
  assert.match(src, /role: 'region', tabIndex: 0, 'aria-label': scrollLabel/);
  assert.match(src, /focusRingInset/);
  assert.match(src, /scope = 'col'/);
  assert.match(src, /numeric && 'text-end[^']*tabular-nums'/);
  assert.match(src, /data-state=\{selected \? 'selected' : undefined\}/);
});

test('toggle group reuses toggleVariants and keeps the 44px touch target', () => {
  const src = sources['toggle-group'];
  assert.match(src, /import \{ toggleVariants \} from '\.\/toggle'/);
  assert.match(src, /data-spacing=/);
  assert.match(src, /after:size-11/);
  assert.match(src, /after:h-11/);
});

test('disclosure motion is motion-safe and driven by the Radix height variable', () => {
  const keyframes = read('motion-keyframes');
  assert.match(keyframes, /var\(--radix-collapsible-content-height\)/);
  assert.match(keyframes, /precedence=/);
  for (const name of ['accordion', 'collapsible']) {
    assert.match(sources[name], /disclosureMotion/);
    assert.match(sources[name], /<CoreKeyframes \/>/);
  }
  for (const cls of keyframes.match(/animate-\[[^\]]+\]/g) ?? []) {
    assert.match(keyframes, new RegExp(`motion-safe:(?:data-\\[state=\\w+\\]:)?${cls.replace(/[[\]().]/g, '\\$&')}`), `${cls} is not motion-safe`);
  }
  assert.match(sources.accordion, /motion-safe:transition-transform/);
});

test('EmptyState stays a compatible preset over the Empty anatomy', () => {
  const src = sources['empty-state'];
  for (const part of ['Empty', 'EmptyHeader', 'EmptyMedia', 'EmptyTitle', 'EmptyDescription', 'EmptyContent', 'EmptyState']) {
    assert.ok(exportedComponents(src).includes(part), `${part} not exported`);
  }
  assert.match(src, /export type \{ EmptyStateProps \}/);
  assert.match(src, /headingLevel = 3/);
  assert.match(src, /headingLevel\?: 2 \| 3 \| 4/);
  assert.match(src, /title: React\.ReactNode/);
  assert.match(src, /description\?: React\.ReactNode/);
  assert.match(src, /icon\?: LucideIcon/);
  assert.match(src, /\.\.\.props \}: EmptyStateProps/);
});
