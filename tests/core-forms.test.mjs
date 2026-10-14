import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { uniqueFieldErrors } from '../packages/core/src/lib/field-errors.ts';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const ui = (name) => read(`packages/core/src/ui/${name}.tsx`);
const index = read('packages/core/src/index.ts');
const forms = ['field', 'textarea', 'input', 'label'];
// Code without comments: the docs comment in input.tsx explains why outline-none is gone.
const code = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

test('field and textarea are exported from the core index', () => {
  for (const name of ['field', 'textarea', 'input', 'label']) assert.match(index, new RegExp(`export \\* from '\\./ui/${name}';`), name);
});

test('form parts carry data-slot and no outline-none', () => {
  for (const name of forms) {
    const source = ui(name);
    assert.match(source, /data-slot="/, `${name} has data-slot`);
    assert.doesNotMatch(code(source), /(^|[\s'"`])outline-none/m, `${name} must not use outline-none`);
  }
  const field = ui('field');
  for (const slot of ['field-set', 'field-legend', 'field-group', 'field', 'field-content', 'field-label', 'field-title', 'field-description', 'field-error', 'field-separator']) {
    assert.ok(field.includes(`data-slot="${slot}"`), `field.tsx renders data-slot="${slot}"`);
  }
  assert.ok(ui('textarea').includes('data-slot="textarea"'));
});

test("modules using hooks start with 'use client'", () => {
  for (const name of forms) {
    const source = ui(name);
    if (/\buse[A-Z]\w*\(|React\.use\w*\(/.test(source)) assert.ok(source.startsWith("'use client'"), `${name} uses hooks and starts with 'use client'`);
  }
});

test('input and textarea use focusRing, field wiring and a visible invalid state', () => {
  for (const name of ['input', 'textarea']) {
    const source = ui(name);
    assert.match(source, /import \{ focusRing \} from '\.\.\/lib\/focus'/, `${name} imports focusRing`);
    assert.match(source, /useFieldControl\(props\)/, `${name} consumes useFieldControl`);
    assert.match(source, /aria-invalid:border-destructive/, `${name} shows aria-invalid`);
    assert.doesNotMatch(source, /aria-invalid:ring-/, `${name} has no dead aria-invalid ring`);
    assert.match(source, /export type \{ \w+Props \}/, `${name} exports its props type`);
  }
  const textarea = ui('textarea');
  for (const token of ['[field-sizing:content]', 'min-h-[calc(3lh+1rem)]', 'max-h-[calc(20lh+1rem)]', 'resize-y']) assert.ok(textarea.includes(token), token);
});

test('field wires ids, description and error and lets explicit props win', () => {
  const field = ui('field');
  assert.match(field, /React\.useId\(\)/);
  assert.match(field, /role="group"/);
  assert.match(field, /role="alert"/);
  assert.match(field, /if \(!visible\) return null/, 'FieldError renders nothing when empty');
  assert.match(field, /props\['aria-describedby'\] \?\? field\.describedBy/);
  assert.match(field, /props\['aria-invalid'\] \?\? /);
  assert.match(field, /htmlFor=\{htmlFor \?\? field\?\.controlId\}/);
  for (const orientation of ['vertical', 'horizontal', 'responsive']) assert.match(field, new RegExp(`\\b${orientation}:`));
});

test('FieldError messages are trimmed, deduplicated and keep their order', () => {
  assert.deepEqual(uniqueFieldErrors(), []);
  assert.deepEqual(uniqueFieldErrors([undefined, { message: '' }, { message: '  ' }, {}]), []);
  assert.deepEqual(uniqueFieldErrors([{ message: 'Pflichtfeld.' }, { message: 'Zu kurz.' }, { message: ' Pflichtfeld. ' }]), ['Pflichtfeld.', 'Zu kurz.']);
});

test('docs editors use the core Textarea instead of raw textareas', () => {
  for (const file of ['pattern-showcase', 'mermaid-showcase', 'orgchart-editor']) {
    const source = read(`apps/docs/app/_components/${file}.tsx`);
    assert.doesNotMatch(source, /<textarea\b/, `${file} has no raw <textarea>`);
    assert.match(source, /<Textarea\b[^>]*className="font-mono"/, `${file} uses <Textarea className="font-mono">`);
  }
  const pattern = read('apps/docs/app/_components/pattern-showcase.tsx');
  assert.doesNotMatch(pattern, /aria-describedby="form-error"/, 'no hand-wired aria-describedby');
  assert.match(pattern, /<FieldError errors=/);
});

test('field spec follows the component doc pattern in Swiss spelling', () => {
  const doc = read('docs/components/field.md');
  for (const part of ['Field', 'FieldLabel', 'FieldDescription', 'FieldError', 'Textarea']) assert.match(doc, new RegExp(`^## ${part}\\b`, 'm'));
  for (const label of ['**Zweck:**', '**Props:**', '**A11y:**', '**Do:**', "**Don't:**"]) assert.ok(doc.includes(label), label);
  assert.doesNotMatch(doc, /ß/);
});
