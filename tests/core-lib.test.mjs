import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

// Load core sources as they ship: .ts/.tsx transpiled by the repo's TypeScript,
// extensionless relative imports resolved like the bundler does. cva imported
// from core is wrapped so each variant function exposes its config; the test
// then iterates the real keys instead of a hard-coded list.
const coreSrc = new URL('../packages/core/src/', import.meta.url).href;
const CVA_PROBE = 'atlas-test:cva-probe';
registerHooks({
  resolve(specifier, context, nextResolve) {
    const fromCore = context.parentURL?.startsWith(coreSrc);
    if (fromCore && specifier === 'class-variance-authority') return { url: CVA_PROBE, shortCircuit: true };
    if (fromCore && specifier.startsWith('.') && !/\.[cm]?[jt]sx?$/.test(specifier)) {
      for (const ext of ['.ts', '.tsx', '/index.ts']) {
        const url = new URL(specifier + ext, context.parentURL);
        try { readFileSync(url); return { url: url.href, shortCircuit: true }; } catch {}
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url === CVA_PROBE) return { format: 'module', shortCircuit: true, source: `import { cva as real } from ${JSON.stringify(import.meta.resolve('class-variance-authority'))};
export * from ${JSON.stringify(import.meta.resolve('class-variance-authority'))};
export const cva = (base, config) => Object.assign(real(base, config), { base, config });` };
    if (url.startsWith(coreSrc) && /\.tsx?$/.test(url)) {
      const source = ts.transpileModule(readFileSync(new URL(url), 'utf8'), {
        fileName: fileURLToPath(url),
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
      }).outputText;
      return { format: 'module', shortCircuit: true, source };
    }
    return nextLoad(url, context);
  },
});

const core = (path) => import(new URL(path, coreSrc).href);
const tone = await core('lib/tone.ts');
const { cn } = await core('lib/utils.ts');
const { buttonVariants } = await core('ui/button.tsx');
const { badgeVariants } = await core('ui/badge.tsx');

/** Colour roles that Atlas maps into Tailwind (`--color-*` in core styles.css). */
const colorTokens = new Set(
  [...readFileSync(new URL('styles.css', coreSrc), 'utf8').matchAll(/--color-([a-z][a-z0-9-]*[a-z0-9])\s*:/g)].map((m) => m[1]),
);
const RAW_COLOUR = /#[0-9a-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|color)\(|\[[^\]]*\]/i;
const COLOUR_UTILITY = /^(?:bg|text|border|ring|outline|fill|stroke)-(.+?)(?:\/\d{1,3})?$/;
const NON_COLOUR = /^(?:xs|sm|base|lg|[2-9]?xl|left|center|right|justify|start|end|wrap|nowrap|balance|pretty|clip|ellipsis|[0-9]+|x(?:-\d+)?|y(?:-\d+)?|[trblsexy]-\d+|none|solid|dashed|dotted|double|hidden|offset-\d+|inset)$/;

/** Every colour utility in `classes` must name a theme token, never a literal colour. */
function assertTokenClasses(classes, where) {
  assert.equal(typeof classes, 'string', where);
  assert.ok(classes.trim(), `${where}: empty class string`);
  assert.doesNotMatch(classes, RAW_COLOUR, `${where}: raw colour or arbitrary value in "${classes}"`);
  for (const cls of classes.split(/\s+/)) {
    const m = COLOUR_UTILITY.exec(cls);
    if (!m || NON_COLOUR.test(m[1]) || m[1] === 'transparent' || m[1] === 'current') continue;
    assert.ok(colorTokens.has(m[1]), `${where}: "${cls}" does not resolve to a --color-* token`);
  }
}

test('core styles declare the colour tokens this test resolves against', () => {
  for (const role of ['primary', 'foreground', 'muted-foreground', 'destructive', 'success', 'warning', 'info', 'accent', 'border']) {
    assert.ok(colorTokens.has(role), `--color-${role} missing`);
  }
});

test('every tone resolves to token classes, never to a raw colour', () => {
  assert.ok(tone.TONES.length > 0);
  const maps = { toneText: tone.toneText, toneFill: tone.toneFill, toneBorder: tone.toneBorder, toneTint: tone.toneTint, toneSolid: tone.toneSolid };
  for (const [name, map] of Object.entries(maps)) {
    assert.deepEqual(Object.keys(map).sort(), [...tone.TONES].sort(), `${name} covers exactly the tones`);
    for (const t of tone.TONES) assertTokenClasses(map[t], `${name}.${t}`);
  }
  for (const t of tone.TONES) {
    for (const appearance of ['soft', 'solid', 'outline']) assertTokenClasses(tone.toneClasses(t, appearance), `toneClasses(${t}, ${appearance})`);
    assert.equal(tone.toneClasses(t), tone.toneClasses(t, 'soft'), `${t}: soft is the default appearance`);
  }
});

test('every status maps to one tone with token classes', () => {
  for (const status of ['success', 'info', 'progress', 'warning', 'error', 'neutral', 'active']) {
    const set = tone.statusToneClasses(status);
    assert.ok(tone.TONES.includes(set.tone), `${status} → ${set.tone}`);
    assert.equal(set.tone, tone.statusTone(status));
    for (const key of ['chip', 'solid', 'dot']) assertTokenClasses(set[key], `statusToneClasses(${status}).${key}`);
  }
});

test('cn merges conditionally and resolves Tailwind conflicts, last wins', () => {
  assert.equal(cn('px-2 py-1', 'px-4'), 'py-1 px-4');
  assert.equal(cn('bg-primary', false, null, undefined, 'bg-destructive'), 'bg-destructive');
  assert.equal(cn('text-sm', { 'text-primary': true, hidden: false }), 'text-sm text-primary');
  // Custom token colours must not be mistaken for font sizes and vice versa.
  assert.equal(cn('text-xs text-muted-foreground', 'text-primary-foreground'), 'text-xs text-primary-foreground');
  assert.equal(cn('border-border', 'border-primary/30'), 'border-primary/30');
  assert.equal(cn('h-9', ['h-10', ['w-full']]), 'h-10 w-full');
  assert.equal(cn('duration-300', 'duration-(--duration-slow)'), 'duration-(--duration-slow)');
  assert.equal(cn('outline-2 outline-ring', 'outline-destructive'), 'outline-2 outline-destructive');
  assert.equal(cn(), '');
});

/**
 * Generic over the real cva config: every key of every listed dimension yields
 * a non-empty class string that keeps the base classes. Keys only share output
 * when they are aliases (identical class definition), so added aliases pass and
 * accidental copy-paste collisions between different definitions do not.
 */
function assertVariantKeys(fn, name, dimensions) {
  const { base, config } = fn;
  assert.ok(config?.variants, `${name}: cva config not captured`);
  const baseClasses = String(base).split(/\s+/).filter(Boolean);
  for (const dim of dimensions) {
    const entries = Object.entries(config.variants[dim] ?? {});
    assert.ok(entries.length > 1, `${name}.${dim}: expected several keys`);
    const seen = new Map();
    for (const [key, definition] of entries) {
      const out = fn({ [dim]: key });
      assert.ok(String(definition).trim(), `${name}.${dim}.${key}: empty definition`);
      assert.ok(out.trim().length > 0, `${name}.${dim}.${key}: empty output`);
      for (const cls of baseClasses) assert.ok(out.split(/\s+/).includes(cls), `${name}.${dim}.${key}: lost base class ${cls}`);
      for (const cls of String(definition).split(/\s+/).filter(Boolean)) assert.ok(out.split(/\s+/).includes(cls), `${name}.${dim}.${key}: missing ${cls}`);
      const other = seen.get(out);
      if (other) assert.equal(String(definition), String(config.variants[dim][other]), `${name}.${dim}: "${key}" and "${other}" render identically without being aliases`);
      else seen.set(out, key);
    }
  }
  assert.equal(fn(), fn(config.defaultVariants ?? {}), `${name}: defaults are applied`);
}

test('buttonVariants: every variant and size key renders distinct classes', () => {
  assertVariantKeys(buttonVariants, 'buttonVariants', ['variant', 'size']);
});

test('badgeVariants: every variant and size key renders distinct classes', () => {
  assertVariantKeys(badgeVariants, 'badgeVariants', ['variant', 'size']);
});
