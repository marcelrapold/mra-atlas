import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useControllableState } from '../packages/core/src/lib/hooks.ts';

// API-Konvention (docs/components/api.md), geprüft an den Dateien des Pakets
// «core-controls-a11y». Feste Liste statt Glob, siehe tests/a11y-contract.test.mjs.
const ui = ['button','checkbox','switch','toggle','radio-group','tabs','breadcrumb','alert','badge','card','eyebrow','inset','lightbox','carousel','bottom-nav','play-button','media-bar','icon-button'];
const read = (path) => readFileSync(new URL(`../packages/core/src/${path}`, import.meta.url), 'utf8');
const sources = Object.fromEntries(ui.map((name) => [name, read(`ui/${name}.tsx`)]));

/** Exportierte Werte (Komponenten, Varianten, Hooks), ohne `export type`. */
function exportedNames(src) {
  const names = new Set();
  for (const [, block] of src.matchAll(/^export \{([^}]*)\}/gm)) {
    for (const part of block.split(',')) {
      const name = part.trim();
      if (name && !name.startsWith('type ')) names.add(name.split(/\s+as\s+/).pop().trim());
    }
  }
  for (const [, name] of src.matchAll(/^export function (\w+)/gm)) names.add(name);
  return [...names];
}
/** Rumpf einer Top-Level-Funktion bis zur nächsten Top-Level-Deklaration. */
function body(src, name) {
  const start = src.search(new RegExp(`^(export )?function ${name}\\b`, 'm'));
  if (start < 0) return null;
  const rest = src.slice(start + 1);
  const end = rest.search(/^(?:export |function |const |type |interface |\/\*\*? )/m);
  return end < 0 ? rest : rest.slice(0, end);
}

test('every exported component renders a data-slot', () => {
  for (const [file, src] of Object.entries(sources)) {
    for (const name of exportedNames(src).filter((n) => /^[A-Z][a-z]/.test(n))) {
      const fn = body(src, name);
      if (fn === null) continue; // Konstante, z. B. LIGHTBOX_FLAECHEN
      assert.match(fn, /data-slot=/, `${file}: ${name}`);
    }
  }
});

test('React 19 function components: no forwardRef, React.FC or defaultProps', () => {
  for (const [file, src] of Object.entries(sources)) {
    assert.doesNotMatch(src, /forwardRef|React\.FC\b|: FC</, file);
    assert.doesNotMatch(src, /\.defaultProps\s*=/, file);
  }
});

test("stateful files start with 'use client'; Slot-only files stay server-safe", () => {
  for (const [file, src] of Object.entries(sources)) {
    const code = src.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
    const hooks = /\b(?:React\.)?use[A-Z]\w*\s*[<(]/.test(code);
    const radix = [...code.matchAll(/import \{([^}]*)\} from 'radix-ui'/g)].some(([, names]) => names.split(',').some((n) => n.trim() && n.trim() !== 'Slot'));
    const client = src.startsWith("'use client'\n");
    if (hooks || radix) assert.ok(client, `${file} needs 'use client'`);
  }
  // Button, Badge, Breadcrumb, Eyebrow und Inset rendern ohne Zustand: `buttonVariants`
  // und `eyebrowClassName` bleiben in Server Components aufrufbar.
  for (const file of ['button', 'badge', 'breadcrumb', 'eyebrow', 'inset']) assert.ok(!sources[file].startsWith("'use client'"), file);
});

test('German defaults: no English label literals', () => {
  for (const [file, src] of Object.entries(sources)) {
    const code = src.replace(/data-slot="[^"]*"/g, '').replace(/data-slot=\{[^}]*\}/g, '');
    assert.doesNotMatch(code, /(['"])(carousel|slide|close)\1/i, file);
  }
  assert.match(sources.carousel, /roledescription: 'Karussell'/);
  assert.match(sources.carousel, /slideRoledescription: 'Folie'/);
  assert.match(sources.carousel, /aria-roledescription=\{labels\.roledescription\}/);
  assert.match(sources.carousel, /aria-roledescription=\{labels\.slideRoledescription\}/);
});

test('size scale: md is an alias of default without removing keys', () => {
  for (const file of ['button', 'toggle', 'switch']) {
    const src = sources[file];
    assert.match(src, /^\s+default: /m, file);
    assert.match(src, /^\s+md: /m, file);
    assert.match(src, /size === 'md' \? 'default' : size/, file);
  }
  for (const key of ['xs', 'sm', 'lg', 'icon', "'icon-xs'", "'icon-sm'", "'icon-lg'"]) assert.match(sources.button, new RegExp(`^\\s+${key}: `, 'm'), key);
  // Badge kennt `md` bereits als eigene 24-px-Stufe; sie bleibt unverändert.
  assert.match(sources.badge, /md: 'h-6 gap-1\.5 px-2\.5 leading-none'/);
});

test('polymorphism: asChild via Slot.Root, `as` deprecated', () => {
  for (const file of ['eyebrow', 'inset']) {
    const src = sources[file];
    assert.match(src, /import \{ Slot \} from 'radix-ui'/, file);
    assert.match(src, /asChild\?: boolean/, file);
    assert.match(src, /asChild \? Slot\.Root : as/, file);
    assert.match(src, /@deprecated `asChild`/, file);
  }
});

test('props types are exported for Card, Checkbox, Switch, Toggle and the Tabs parts', () => {
  const expected = {
    card: ['CardProps', 'CardHeaderProps', 'CardTitleProps', 'CardDescriptionProps', 'CardActionProps', 'CardContentProps', 'CardFooterProps'],
    checkbox: ['CheckboxProps'],
    switch: ['SwitchProps'],
    toggle: ['ToggleProps', 'LikeToggleProps'],
    tabs: ['TabsProps', 'TabsListProps', 'TabsTriggerProps', 'TabsContentProps'],
  };
  for (const [file, types] of Object.entries(expected)) {
    const block = /^export type \{([^}]*)\}/m.exec(sources[file])?.[1] ?? '';
    for (const type of types) assert.match(block, new RegExp(`\\b${type}\\b`), `${file}: ${type}`);
  }
});

test('Alert: controlled and uncontrolled, onDismiss kept as deprecated alias, data-tone', () => {
  const src = sources.alert;
  assert.match(src, /defaultOpen\?: boolean/);
  assert.match(src, /onOpenChange\?: \(open: boolean\) => void/);
  assert.match(src, /@deprecated `onOpenChange` verwenden/);
  assert.match(src, /useControllableState\(\{\s*prop: openProp,\s*defaultProp: defaultOpen,/);
  // Ein Ablauf: onOpenChange(false) und onDismiss feuern gemeinsam.
  assert.match(src, /onOpenChange\?\.\(next\)\s*if \(!next\) onDismiss\?\.\(\)/);
  assert.match(src, /data-tone=\{resolvedTone\}/);
  assert.match(src, /data-variant=\{resolvedTone\}/);
  for (const tone of ['info', 'success', 'warning', 'danger']) assert.match(src, new RegExp(`bg-\\(--surface-${tone}\\)`), tone);
  assert.doesNotMatch(src, /bg-(info|success|warning|destructive)\/10/);
  assert.match(src, /'font-semibold leading-snug text-balance'/);
  assert.match(src, /text-pretty/);
  assert.match(sources.card, /'leading-none font-semibold text-balance'/);
  assert.match(sources.card, /'text-sm text-pretty text-muted-foreground'/);
});

test('useControllableState: the controlled prop wins, otherwise the default', () => {
  const render = (options) => {
    let seen;
    const Probe = () => {
      [seen] = useControllableState(options);
      return null;
    };
    renderToStaticMarkup(createElement(Probe));
    return seen;
  };
  assert.equal(render({ defaultProp: true }), true);
  assert.equal(render({ prop: undefined, defaultProp: false }), false);
  assert.equal(render({ prop: false, defaultProp: true }), false);
  assert.equal(render({ prop: 'b', defaultProp: 'a' }), 'b');
  assert.match(read('lib/hooks.ts'), /export function useControllableState<T>/);
});
