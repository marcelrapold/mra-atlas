import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { brands, contrast } from '../packages/brands/src/index.mjs';
import { focusRing, focusRingInset, focusRingOnMedia } from '../packages/core/src/lib/focus.ts';

// Quellscan der Bedienelemente aus dem Paket «core-controls-a11y». Bewusst eine feste
// Liste statt eines Globs: andere Pakete ziehen ihre Dateien nach, wenn sie die Regeln erfüllen.
const ui = ['button','checkbox','switch','toggle','radio-group','tabs','breadcrumb','alert','badge','card','eyebrow','inset','lightbox','carousel','bottom-nav','play-button','media-bar','icon-button'];
const read = (name) => readFileSync(new URL(`../packages/core/src/ui/${name}.tsx`, import.meta.url), 'utf8');
const sources = Object.fromEntries(ui.map((name) => [name, read(name)]));
/** Alle String- und Template-Literale: die Klassenlisten eines Elements stehen in einem davon. */
const literals = (src) => [...src.matchAll(/'[^'\n]*'|"[^"\n]*"|`[^`]*`/g)].map((m) => m[0]);
const tokens = (literal) => literal.slice(1, -1).split(/\s+/).filter(Boolean);
const outlineWidths = (literal) => new Set(tokens(literal).map((t) => /^focus-visible:-?outline-(\d+)$/.exec(t)?.[1]).filter(Boolean));

test('focus constants draw the documented 2 px outline', () => {
  for (const ring of [focusRing, focusRingInset, focusRingOnMedia]) {
    assert.deepEqual([...outlineWidths(`'${ring}'`)], ['2'], ring);
    assert.match(ring, /focus-visible:-?outline-offset-2/);
  }
  assert.match(focusRingOnMedia, /focus-visible:outline-background/);
});

test('controls take their focus ring from lib/focus instead of inline strings', () => {
  for (const [name, src] of Object.entries(sources)) {
    for (const literal of literals(src)) {
      assert.equal(outlineWidths(literal).size, 0, `${name}: inline focus outline in ${literal.slice(0, 90)}`);
    }
  }
  for (const name of ['button','checkbox','switch','toggle','radio-group','tabs','breadcrumb','alert','carousel','lightbox','bottom-nav','play-button']) {
    assert.match(sources[name], /import \{[^}]*\bfocusRing(Inset|OnMedia)?\b[^}]*\} from '\.\.\/lib\/focus'/, name);
  }
});

test('no element hides its outline while also drawing a focus outline', () => {
  for (const [name, src] of Object.entries(sources)) {
    for (const literal of literals(src)) {
      const t = tokens(literal);
      const hides = t.some((x) => /(^|:)outline-(none|hidden)$/.test(x));
      const draws = t.some((x) => /^focus-visible:-?outline-\d+$/.test(x)) || /\$\{focusRing/.test(literal);
      assert.ok(!(hides && draws), `${name}: ${literal.slice(0, 90)}`);
    }
    assert.doesNotMatch(src, /focus-visible:outline-none/, name);
  }
  assert.doesNotMatch(sources.tabs, /outline-none|outline-1\b/);
});

test('no two different focus outline widths within one control', () => {
  for (const [name, src] of Object.entries(sources)) {
    for (const literal of literals(src)) assert.ok(outlineWidths(literal).size <= 1, `${name}: ${literal.slice(0, 90)}`);
  }
});

test('aria-invalid never sets a ring colour without a ring width', () => {
  for (const [name, src] of Object.entries(sources)) {
    for (const literal of literals(src)) {
      const t = tokens(literal);
      const colour = t.some((x) => /(^|:)aria-invalid:ring-(?!\d|\[)/.test(x));
      const width = t.some((x) => /(^|:)aria-invalid:ring(-\d+)?$/.test(x));
      assert.ok(!colour || width, `${name}: ${literal.slice(0, 90)}`);
    }
  }
});

test('non-text contrast: radio and active tab borders use the 3:1-tested input role', () => {
  for (const brand of brands) for (const [mode, c] of Object.entries(brand.modes)) {
    assert.ok(contrast(c.input, c.background) >= 3, `${brand.id}/${mode}: input/background`);
  }
  assert.match(sources['radio-group'], /rounded-full border border-input /);
  assert.doesNotMatch(sources['radio-group'], /border-muted-foreground/);
  // Aktiver Reiter in beiden Modi, nicht nur dunkel; die Linien-Variante bleibt randlos.
  assert.match(sources.tabs, /'data-\[state=active\]:border-input /);
  assert.doesNotMatch(sources.tabs, /dark:data-\[state=active\]:border-input/);
  assert.match(sources.tabs, /group-data-\[variant=line\]\/tabs-list:data-\[state=active\]:border-transparent/);
});

test('target size: the 16 px checkbox has a 24 px hit area, 44 px with a coarse pointer', () => {
  const src = sources.checkbox;
  assert.match(src, /'peer relative size-4 /);
  // size-4 (16 px) + 2 × inset-1 (4 px) = 24 px; + 2 × inset-3.5 (14 px) = 44 px.
  assert.match(src, /after:absolute after:-inset-1 after:content-\[''\] pointer-coarse:after:-inset-3\.5/);
});

test('press feedback is tactile, scoped and motion-safe', () => {
  assert.doesNotMatch(sources.button, /transition-all/);
  assert.doesNotMatch(sources.toggle, /transition-all/);
  assert.match(sources.button, /transition-\[color,background-color,border-color,box-shadow,opacity,scale\]/);
  assert.match(sources.button, /motion-safe:not-disabled:not-aria-busy:not-aria-disabled:active:scale-\[0\.97\]/);
  // Text-Links drücken sich nicht ein.
  const compound = /compoundVariants: \[\{ variant: \[([^\]]+)\], class: pressScale \}\]/.exec(sources.button);
  assert.ok(compound, 'press scale lives in compoundVariants');
  assert.doesNotMatch(compound[1], /'link'/);
  assert.match(sources.toggle, /motion-safe:enabled:active:scale-\[0\.97\]/);
  assert.match(sources.carousel, /motion-safe:enabled:active:scale-95/);
  assert.match(sources['bottom-nav'], /motion-safe:group-active\/bottom-nav-link:scale-90/);
});

test('layering and motion come from foundation tokens', () => {
  for (const name of ['bottom-nav', 'media-bar']) {
    assert.doesNotMatch(sources[name], /\bz-40\b/, name);
    assert.match(sources[name], /z-\(--z-index-sticky\)/, name);
  }
  for (const name of ['play-button', 'carousel']) {
    assert.doesNotMatch(sources[name], /duration-(200|300|500)\b/, name);
  }
  assert.match(sources['play-button'], /duration-\(--duration-normal\)/);
  assert.match(sources.carousel, /duration-\(--duration-slow\)/);
});

test('lightbox and glass controls expose the hooks the layering rules match', () => {
  assert.match(sources.lightbox, /data-slot="lightbox-backdrop"/);
  assert.match(sources.lightbox, /data-slot="lightbox-trigger"[\s\S]*?focusRingOnMedia/);
  assert.match(sources['icon-button'], /data-material=\{isGlass \? 'glass' : undefined\}/);
  assert.match(sources['icon-button'], /data-variant=\{variant\}/);
  assert.match(sources['play-button'], /data-material=\{material\}/);
});
