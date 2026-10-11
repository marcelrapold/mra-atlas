import test from 'node:test';
import assert from 'node:assert/strict';
import {brands,contrast} from '../packages/brands/src/index.mjs';
import {mermaidTheme,mermaidPalette,mermaidClassDefs} from '../packages/brands/src/mermaid-theme.mjs';

test('Mermaid labels meet AA on nodes, sequence notes and every category in all brand modes',()=>{
  for(const brand of brands)for(const mode of Object.keys(brand.modes)){
    const t=mermaidTheme(brand,mode);
    for(const [text,fill] of [['primaryTextColor','primaryColor'],['actorTextColor','actorBkg'],['noteTextColor','noteBkgColor'],['labelTextColor','labelBoxBkgColor']])
      assert.ok(contrast(t[text],t[fill])>=4.5,`${brand.id}/${mode}/${text}`);
    for(let i=0;i<12;i++){
      assert.ok(contrast(t[`cScaleLabel${i}`],t[`cScale${i}`])>=4.5);
      assert.ok(contrast(t.pieSectionTextColor,t[`pie${i+1}`])>=4.5);
      if(i<8)assert.ok(contrast(t[`gitBranchLabel${i}`],t[`git${i}`])>=4.5);
    }
    assert.equal(t.pieOpacity,'1');
  }
});

test('Mermaid accepts a newly registered brand and the measured runtime font',()=>{
  const brand={...brands[0],id:'new-brand',modes:{light:{...brands[0].modes.light,primary:'#ffee99'}}};
  assert.equal(mermaidTheme(brand,'light','Runtime Font').fontFamily,'Runtime Font');
  assert.ok(mermaidPalette(brand).every(c=>contrast('#ffffff',c)>=4.5));
  assert.match(mermaidClassDefs(brand),/classDef delivery fill:#ffee99,color:#000000/);
});
