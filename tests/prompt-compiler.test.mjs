import test from 'node:test';
import assert from 'node:assert/strict';
import {compilePrompt} from '../packages/brands/src/prompt-compiler.mjs';
import {brands,dominicanoExpress} from '../packages/brands/src/index.mjs';

test('interface and written brief requests cannot inherit the presentation delivery contract',()=>{
  const input={idea:'Projekt prüfen',brand:dominicanoExpress};
  const ui=compilePrompt({...input,format:'Interface'});
  const brief=compilePrompt({...input,format:'Management-Briefing'});
  const slides=compilePrompt({...input,format:'Präsentation'});
  assert.match(ui,/Anwendungscode/);
  assert.match(ui,/engineering\.md/);
  assert.doesNotMatch(ui,/PPTX|validateProject|jede Folie/i);
  assert.match(brief,/Schriftliches Management-Briefing/);
  assert.doesNotMatch(brief,/PPTX|validateProject/);
  assert.match(slides,/https:\/\/design\.rapold\.io\/brands\/dominicano-express\/management\.md/);
  assert.ok(slides.length < 300,'The presentation entry should remain a short task, not an inline contract');
  for(const output of [ui,brief])assert.match(output,/brands\/dominicano-express\/brand\.json/);
  assert.throws(()=>compilePrompt({...input,format:'Unbekannt'}),/Unbekanntes/);
});

test('short presentation tasks preserve explicit preferences and the selected theme',()=>{
  const idea='Analysiere example/project. Genau 4 Folien auf Englisch, nur PPTX.';
  for(const brand of brands){
    const output=compilePrompt({idea,format:'Präsentation',brand,preset:'gremien-review'});
    assert.ok(output.startsWith(idea));
    assert.ok(output.includes(`/brands/${brand.id}/management.md`));
    assert.match(output,/gremien-review/);
    assert.doesNotMatch(output,/8 Folien|acht Folien|Deutsch|npm run|schema\.json/);
    assert.equal((output.match(/https:\/\//g)??[]).length,1);
  }
});
