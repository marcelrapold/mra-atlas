import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

// Every declaration file must describe exactly the values its runtime module exports:
// a missing declaration hides an API from TypeScript, a stale one promises an API that throws.
const pkg = new URL('../packages/brands/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('package.json', pkg), 'utf8'));
const entries = Object.entries(manifest.exports).map(([name, target]) => ({name, types: target.types, runtime: target.default ?? target}));
const src = new URL('src/', pkg);
// Declaration files that are not package entries but sit beside their runtime module.
for (const file of (await readdir(src)).filter(f => /\.d\.mts$/.test(f))) {
  const types = `./src/${file}`, runtime = types.replace(/\.d\.mts$/, '.mjs');
  if (!entries.some(e => e.types === types)) entries.push({name: types, types, runtime});
}
const declaredValues = file => {
  const path = fileURLToPath(new URL(file, pkg));
  const program = ts.createProgram([path], {module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, target: ts.ScriptTarget.ES2022, noEmit: true, skipLibCheck: true, allowJs: false, resolveJsonModule: true});
  const checker = program.getTypeChecker(), source = program.getSourceFile(path);
  const symbol = checker.getSymbolAtLocation(source);
  return checker.getExportsOfModule(symbol).filter(s => (s.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(s).flags : s.flags) & ts.SymbolFlags.Value).map(s => s.name).sort();
};

test('every package export entry is typed', () => {
  for (const [name, target] of Object.entries(manifest.exports)) assert.equal(typeof target.types, 'string', `${name} needs {types, default}`);
});
for (const {name, types, runtime} of entries) test(`declared value exports match the runtime: ${name}`, async () => {
  assert.ok(types, `${name}: no declaration file`);
  const actual = Object.keys(await import(new URL(runtime, pkg).href)).sort(), declared = declaredValues(types);
  assert.deepEqual(actual.filter(n => !declared.includes(n)), [], `${name}: exported at runtime but not declared in ${types}`);
  assert.deepEqual(declared.filter(n => !actual.includes(n)), [], `${name}: declared in ${types} but missing at runtime`);
});
