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
  const sources = ['radio-group', 'switch', 'checkbox', 'tabs', 'toggle', 'icon-button', 'play-button', 'media-bar', 'bottom-nav', 'button', 'badge', 'label', 'card', 'input', ...owned].map(source).join('\n');
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
  assert.match(source('dialog'), /z-overlay bg-overlay\/50/); assert.match(source('dialog'), /z-modal/);
  assert.match(source('sheet'), /z-overlay bg-overlay\/50/); assert.match(source('sheet'), /z-modal[^']*ease-\(--easing-drawer\)[^']*data-\[state=closed\]:duration-\(--duration-slow\)[^']*data-\[state=open\]:duration-\(--duration-deliberate\)/);
  for (const name of ['popover', 'select', 'dropdown-menu']) assert.match(source(name), /z-dropdown/, name);
  assert.match(source('tooltip'), /z-tooltip/); assert.match(source('tooltip'), /data-\[state=instant-open\]:animate-none/);
  for (const name of ['dialog', 'popover', 'select', 'dropdown-menu', 'tooltip']) assert.match(source(name), /data-\[state=closed\]:duration-\(--duration-exit\)/, name);
  assert.equal((source('dialog').match(/closeLabel = 'Schliessen'/g) ?? []).length, 2);
  assert.match(source('sheet'), /closeLabel = 'Schliessen'/);
  assert.match(source('command'), /title = 'Befehlspalette'/); assert.match(source('command'), /description = 'Befehl suchen …'/); assert.match(source('command'), /closeLabel = 'Schliessen'/);
  assert.match(source('sonner'), /containerAriaLabel="Benachrichtigungen"/); assert.match(source('sonner'), /closeButtonAriaLabel: 'Meldung schliessen'/); assert.match(source('sonner'), /motion-safe:animate-spin/);
  assert.match(source('dialog'), /dialog-title"[\s\S]*?text-balance/); assert.match(source('dialog'), /dialog-description"[\s\S]*?text-pretty/);
  assert.match(source('sheet'), /sheet-title"[\s\S]*?text-balance/); assert.match(source('sheet'), /sheet-description"[\s\S]*?text-pretty/);
  assert.match(source('select'), /focusRing/); assert.doesNotMatch(source('select'), /aria-invalid:ring-/); assert.match(source('select'), /export type \{[^}]*SelectTriggerProps/);
  assert.match(source('audio-visual'), /data-activity=\{mode\}/); assert.doesNotMatch(source('audio-visual'), /data-mode=/);
});
