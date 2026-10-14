import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const css = read('packages/core/src/styles.css');
const foundation = JSON.parse(read('packages/brands/src/foundation.json'));
const overlays = ['dialog', 'sheet', 'popover', 'select', 'dropdown-menu', 'tooltip', 'command', 'confirm-dialog'];
const owned = [...overlays, 'sonner', 'audio-visual'];
const source = name => read(`packages/core/src/ui/${name}.tsx`);
const stripComments = text => text.replace(/\/\*[\s\S]*?\*\//g, '');

/** Top-level blocks of a stylesheet: [{ prelude, body }]. */
function blocks(text) {
  const out = [];
  let depth = 0, start = 0, open = -1;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '{') { if (depth === 0) open = i; depth++; }
    else if (c === '}') { depth--; if (depth === 0) { out.push({ prelude: text.slice(start, open).trim(), body: text.slice(open + 1, i) }); start = i + 1; } }
    else if (c === ';' && depth === 0) { const statement = text.slice(start, i).trim(); if (statement) out.push({ prelude: statement, body: null }); start = i + 1; }
  }
  assert.equal(depth, 0, 'unbalanced braces in styles.css');
  return out;
}
const top = blocks(stripComments(css));
const theme = top.filter(b => b.prelude === '@theme').map(b => b.body).join('\n');
const themeInline = top.filter(b => b.prelude === '@theme inline').map(b => b.body).join('\n');

test('every foundation zIndex, duration and easing key has a matching @theme entry', () => {
  for (const [key, value] of Object.entries(foundation.zIndex)) {
    const match = theme.match(new RegExp(`--z-index-${key}:\\s*([^;]+);`));
    assert.ok(match, `--z-index-${key} missing in plain @theme`);
    assert.equal(Number(match[1].trim()), value, `--z-index-${key} default differs from foundation.json`);
  }
  for (const key of Object.keys(foundation.duration)) assert.match(themeInline, new RegExp(`--transition-duration-${key}:[^;]*var\\(--duration-${key}\\)`), `duration.${key}`);
  for (const key of Object.keys(foundation.easing)) assert.match(themeInline, new RegExp(`--ease-${key}:\\s*var\\(--easing-${key}\\);`), `easing.${key}`);
  assert.match(themeInline, /--default-transition-duration:\s*var\(--duration-fast\);/);
  assert.match(themeInline, /--default-transition-timing-function:\s*var\(--easing-standard\);/);
  for (const role of ['overlay', 'sidebar-border', 'surface-info', 'surface-success', 'surface-warning', 'surface-danger']) assert.match(themeInline, new RegExp(`--color-${role}:\\s*var\\(--${role}\\);`), role);
});

test('foundation motion tokens pass the token validator patterns', () => {
  const css = /^(?:[\d.]+(?:px|rem|ms)|cubic-bezier\([\d., -]+\))$/;
  for (const group of ['duration', 'easing']) for (const [key, value] of Object.entries(foundation[group])) assert.match(value, css, `${group}.${key}`);
  assert.equal(foundation.easing.drawer, 'cubic-bezier(0.32, 0.72, 0, 1)');
  assert.equal(foundation.duration.exit, '150ms');
  assert.equal(foundation.duration.reduced, '160ms');
  assert.ok(parseFloat(foundation.duration.exit) < parseFloat(foundation.duration.normal), 'exit is shorter than enter');
});

test('every animation class used by the overlays is an @utility in styles.css', () => {
  const utilities = top.filter(b => b.prelude.startsWith('@utility ')).map(b => b.prelude.slice(9).trim());
  const defined = name => utilities.some(u => u === name || (u.endsWith('-*') && name.startsWith(u.slice(0, -1)) && /^\d+$/.test(name.slice(u.length - 1))));
  const used = new Set();
  for (const name of overlays) for (const [, cls] of source(name).matchAll(/(?:^|[\s'"`:])((?:animate|fade|zoom|slide)-[a-z0-9-]+)(?=[\s'"`])/g)) used.add(cls);
  assert.ok(used.size >= 8, `expected overlay animation classes, found ${[...used]}`);
  for (const cls of used) if (cls !== 'animate-none' && cls !== 'animate-spin') assert.ok(defined(cls), `${cls} is not defined as @utility`);
  assert.match(css, /@keyframes atlas-enter/);
  assert.match(css, /@keyframes atlas-exit/);
  const enter = top.find(b => b.prelude === '@utility animate-in').body, exit = top.find(b => b.prelude === '@utility animate-out').body;
  assert.match(enter, /var\(--duration-normal/); assert.match(enter, /var\(--easing-enter/);
  assert.match(exit, /var\(--duration-exit/); assert.match(exit, /var\(--easing-exit/);
});

test('styles.css keeps every rule inside a cascade layer', () => {
  const allowed = /^@(?:theme(?: inline)?|utility [\w*-]+|custom-variant \w+ \(.+\)|keyframes [\w-]+|layer [\w-]+)$/;
  for (const { prelude, body } of top) {
    if (prelude.startsWith('@media')) { assert.ok(blocks(body).every(b => b.prelude.startsWith('@layer')), `@media without layered content: ${prelude}`); continue; }
    assert.match(prelude, allowed, `unlayered rule: ${prelude.slice(0, 80)}`);
  }
  assert.doesNotMatch(css, /animation-duration:\s*\.01ms/, 'blanket reduced-motion rule is gone');
  assert.match(css, /prefers-reduced-motion: reduce\)\s*\{[^}]*--atlas-motion: 0;[^}]*--atlas-duration-cap: var\(--duration-reduced/);
});

test('forced-colors, reduced-transparency and contrast modes cover the owned states', () => {
  const forced = css.slice(css.indexOf('@media (forced-colors: active)'));
  for (const selector of ['[data-slot="dropdown-menu-item"]', '[data-slot="select-item"]', '[data-slot="command-item"][data-selected="true"]', '[data-highlighted]', '[data-slot="radio-group-indicator"]', '[data-slot="switch"][data-state="checked"]', '[data-slot="switch-thumb"]', '[data-slot="checkbox"]', '[data-slot="tabs-trigger"][data-state="active"]', '[data-slot="toggle"][data-state="on"]', ':disabled']) assert.ok(forced.includes(selector), selector);
  for (const keyword of ['Highlight', 'HighlightText', 'CanvasText', 'GrayText']) assert.ok(forced.includes(keyword), keyword);
  // Every data-slot the stylesheet targets exists in a core source file (lightbox-backdrop arrives with core-controls-a11y).
  const slots = new Set([...css.matchAll(/data-slot(?:\$)?="([a-z-]+)"/g)].map(m => m[1]).filter(s => !s.startsWith('-')));
  const sources = ['radio-group', 'switch', 'checkbox', 'tabs', 'toggle', 'icon-button', 'play-button', 'media-bar', 'bottom-nav', 'button', 'badge', 'label', 'card', 'input', 'skeleton', ...owned].map(source).join('\n');
  for (const slot of slots) if (slot !== 'lightbox-backdrop') assert.ok(sources.includes(`data-slot="${slot}"`), `data-slot ${slot} not found in core`);
  const transparency = css.slice(css.indexOf('@media (prefers-reduced-transparency: reduce)'));
  for (const selector of ['[data-variant="glass"]', '[data-material="glass"]', '[data-slot="media-bar"]', '[data-slot="bottom-nav"]', '[data-slot="lightbox-backdrop"]', 'backdrop-filter: none']) assert.ok(transparency.includes(selector), selector);
  assert.match(css, /prefers-contrast: more\)\s*\{[^}]*--border: var\(--input\)[^}]*--muted-foreground: var\(--foreground\)/);
});

test('overlays use the z-index scale, brand timing and German defaults', () => {
  for (const name of owned) {
    const text = source(name);
    if (overlays.includes(name)) assert.doesNotMatch(text, /\bz-50\b|\bduration-(?:200|300|500)\b|\bease-in-out\b|bg-black\/50/, `${name}: hard-coded layer, motion or colour`);
    assert.doesNotMatch(text, /'Close'|"Close"|'Command Palette'|focus-visible:outline-hidden/, `${name}: English default or hidden focus`);
  }
  assert.match(source('dialog'), /z-\(--z-index-overlay\) bg-overlay\/50/); assert.match(source('dialog'), /z-\(--z-index-modal\)/);
  assert.match(source('sheet'), /z-\(--z-index-overlay\) bg-overlay\/50/); assert.match(source('sheet'), /z-\(--z-index-modal\)[^']*ease-\(--easing-drawer\)[^']*data-\[state=closed\]:duration-\(--duration-slow\)[^']*data-\[state=open\]:duration-\(--duration-deliberate\)/);
  for (const name of ['popover', 'select', 'dropdown-menu']) assert.match(source(name), /z-\(--z-index-dropdown\)/, name);
  assert.match(source('tooltip'), /z-\(--z-index-tooltip\)/);
  for (const name of overlays) assert.doesNotMatch(source(name), /\bz-(?:overlay|modal|dropdown|tooltip)\b/, `${name}: named z utility is unknown to tailwind-merge`); assert.match(source('tooltip'), /data-\[state=instant-open\]:animate-none/);
  for (const name of ['dialog', 'popover', 'select', 'dropdown-menu', 'tooltip']) assert.match(source(name), /data-\[state=closed\]:duration-\(--duration-exit\)/, name);
  assert.equal((source('dialog').match(/closeLabel = 'Schliessen'/g) ?? []).length, 2);
  assert.match(source('sheet'), /closeLabel = 'Schliessen'/);
  assert.match(source('command'), /title = 'Befehlspalette'/); assert.match(source('command'), /description = 'Befehl suchen …'/); assert.match(source('command'), /closeLabel = 'Schliessen'/);
  assert.match(source('sonner'), /containerAriaLabel="Benachrichtigungen"/); assert.match(source('sonner'), /closeButtonAriaLabel: 'Meldung schliessen'/); assert.match(source('sonner'), /motion-safe:animate-spin/);
  assert.match(source('dialog'), /dialog-title"[\s\S]*?text-balance/); assert.match(source('dialog'), /dialog-description"[\s\S]*?text-pretty/);
  assert.match(source('sheet'), /sheet-title"[\s\S]*?text-balance/); assert.match(source('sheet'), /sheet-description"[\s\S]*?text-pretty/);
  assert.match(source('select'), /focusRing/); assert.doesNotMatch(source('select'), /aria-invalid:ring-/); assert.match(source('select'), /export type \{[^}]*SelectTriggerProps/);
  assert.match(source('audio-visual'), /data-mode=\{mode\}/, 'ActivityRing keeps its public data-mode attribute'); assert.doesNotMatch(source('audio-visual'), /data-activity=/);
});

test('className z utilities replace the overlay defaults (tailwind-merge)', async () => {
  const { twMerge } = await import('tailwind-merge');
  for (const layer of ['dropdown', 'modal', 'overlay', 'tooltip']) {
    assert.equal(twMerge(`fixed z-(--z-index-${layer}) w-72`, 'z-50'), 'fixed w-72 z-50', layer);
    assert.equal(twMerge(`fixed z-(--z-index-${layer})`, 'z-[100]'), 'fixed z-[100]', layer);
  }
});

test('overlays opened from a dialog or sheet are lifted to the modal layer, item-aligned Select included', () => {
  // Radix Select (item-aligned, the default) wraps the content in a plain fixed div that copies its z-index, without the popper attribute.
  const radix = readFileSync(new URL('../node_modules/@radix-ui/react-select/dist/index.mjs', import.meta.url), 'utf8');
  assert.match(radix, /ref: setContentWrapper,\s*style: \{[^}]*position: "fixed",\s*zIndex: contentZIndex/);
  const lift = stripComments(css).split('\n').find(line => line.includes('z-index: var(--z-index-modal) !important'));
  assert.ok(lift, 'lift rule missing');
  for (const slot of ['dialog-content', 'confirm-dialog', 'sheet-content']) assert.ok(lift.includes(`[data-slot="${slot}"]`), slot);
  assert.match(lift, /~ :is\(\[data-radix-popper-content-wrapper\]:not\(:has\(> \[data-slot="tooltip-content"\]\)\), div:has\(> \[data-slot="select-content"\]\)\)/);
  assert.match(source('select'), /position = 'item-aligned'/);
});

test('rendered defaults survive the cascade layers: heading weight, skeleton, dark variant, icon-button shadow', () => {
  const plain = stripComments(css);
  assert.match(plain, /@layer utilities \{[\s\S]*:is\(h1, h2, h3\):is\(\.font-medium, \.font-semibold\) \{ font-weight: var\(--brand-heading-weight\); \}/);
  for (const name of ['dialog', 'sheet']) assert.match(source(name), /-title"[\s\S]*?font-semibold/, `${name} title relies on the heading guard`);
  assert.match(plain, /@media \(prefers-reduced-motion: reduce\) \{\s*\[data-slot="skeleton"\]\.animate-pulse \{ animation: none; \}/);
  assert.match(read('packages/core/src/ui/skeleton.tsx'), /data-slot="skeleton"[\s\S]*animate-pulse/);
  assert.match(css, /^@custom-variant dark \(&:where\(\[data-mode="dark"\], \[data-mode="dark"\] \*\)\);$/m);
  assert.match(read('packages/core/src/ui/icon-button.tsx'), /after:size-11/);
  for (const line of plain.split('\n').filter(l => l.includes('box-shadow: var(--brand-shadow)'))) assert.ok(line.includes('[class~="after:size-11"]'), `IconButton trigger excluded: ${line.trim().slice(0, 60)}`);
});
