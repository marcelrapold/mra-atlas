import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const source=await readFile(new URL('../apps/docs/app/_components/mermaid-examples.ts',import.meta.url),'utf8');
// Each example carries its definition as the template literal after `code:`.
const examples=[...source.matchAll(/\{id:'([^']+)'[\s\S]*?code:`([\s\S]*?)`\}/g)].map(([,id,code])=>({id,code}));

test('the reference shows five Mermaid examples',()=>{
  assert.deepEqual(examples.map(e=>e.id),['fluss','sequenz','zeitstrahl','torte','umbruch']);
});

test('every Mermaid example starts with accTitle and accDescr',()=>{
  for(const {id,code} of examples){
    const lines=code.split('\n').map(line=>line.trim()).filter(Boolean);
    assert.match(code,/^\s*accTitle:\s*\S/m,`${id}: accTitle: missing`);
    assert.match(code,/^\s*accDescr:\s*\S/m,`${id}: accDescr: missing`);
    // Directly after the diagram type line, before any node, participant or section.
    assert.ok(lines[1].startsWith('accTitle:'),`${id}: accTitle must follow the type line`);
    assert.ok(lines.slice(1,4).some(line=>line.startsWith('accDescr:')),`${id}: accDescr must follow accTitle`);
    assert.doesNotMatch(code.match(/accDescr:(.*)/)[1],/[;:]/,`${id}: accDescr stays one plain sentence line`);
  }
});

test('the Mermaid contract states the accessibility rule',async()=>{
  const doc=await readFile(new URL('../docs/mermaid.md',import.meta.url),'utf8');
  assert.match(doc,/Jede Definition beginnt mit accTitle und accDescr/);
});
