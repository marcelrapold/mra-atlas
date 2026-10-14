import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {radiox,contrast,deckAssetPaths} from '../packages/brands/src/index.mjs';
import {presentationTheme} from '../packages/brands/src/presentation.mjs';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');
const dna=JSON.parse(await read('brands/radiox/dna.json'));
const css=await read('brands/radiox/theme.css');
// Opaque equivalent of a white veil over #050505 (DNA 2.3).
const veil=a=>'#'+Math.floor(5+a*250).toString(16).padStart(2,'0').toUpperCase().repeat(3);

test('RadioX tokens follow the DNA: neutral black stage, no teal-grey surfaces', () => {
  const d=radiox.modes.dark,c=dna.colors;
  assert.equal(d.background,c['surface-0']);
  assert.equal(d.card,veil(dna.opacity.whiteVeil['surface-1']));
  assert.equal(d.muted,veil(dna.opacity.whiteVeil['surface-1']));
  assert.equal(d.accent,veil(dna.opacity.whiteVeil['surface-2']));
  assert.equal(d.border,veil(dna.opacity.whiteLine.line));
  assert.equal(d.popover,c['window-base']);
  for(const key of ['card','muted','accent','secondary','border']){const [r,g,b]=d[key].slice(1).match(/../g);assert.ok(r===g&&g===b,`${key} must be neutral, got ${d[key]}`);}
  assert.equal(d.primary,c['primary-fill']);assert.equal(d['primary-hover'],c['primary-fill-hover']);assert.equal(d['primary-foreground'],c['on-primary']);
  assert.equal(d.ring,c.accent);assert.equal(d['accent-foreground'],c['accent-soft']);
  for(const key of ['onair','ai','community','news','dna','danger'])assert.equal(radiox.palette[key],c[key],key);
  assert.equal(d.destructive,c.danger);assert.notEqual(d.destructive,c.onair,'red is live only (E32)');
  assert.equal(radiox.typography.headingWeight,dna.typography.web.weights.heading);
  assert.equal(radiox.shape.radius,dna.radii.card);
  assert.ok(!dna.typography.web.forbiddenWeights.includes(radiox.typography.headingWeight));
  assert.equal(Object.hasOwn(radiox.presentation??{},'editorialDarkSurfaces'),false);
});

test('RadioX theme.css: no card blur, exact glass recipes, live red, outline focus', () => {
  const card=css.match(/\[data-slot='card'\][^{]*\{([^}]*)\}/)?.[1]??'';
  assert.match(card,/backdrop-filter:\s*none/);assert.match(card,/rgb\(0 0 0 \/ \.25\)|--rx-surface-card/);
  assert.doesNotMatch(css,/--radiox-glass-blur|rgb\(168 85 247|rgb\(59 130 246|font-weight:\s*800/);
  for(const recipe of ['.rx-glass-header','.rx-glass-bar','.rx-glass-chip','.rx-glass-play','.rx-window'])assert.ok(css.includes(recipe),recipe);
  assert.match(css,/blur\(14px\) saturate\(170%\)/);assert.match(css,/blur\(24px\)/);assert.match(css,/blur\(20px\)/);
  for(const glow of Object.values(dna.glow).filter(v=>v.startsWith('0 0')))assert.ok(css.replace(/rgb\((\d+) (\d+) (\d+) \/ (\.\d+)\)/g,'rgba($1,$2,$3,0$4)').includes(glow.replace(/\s+/g,' ')),glow);
  assert.match(css,/::selection \{ background: rgb\(34 211 238 \/ \.35\); color: #fff; \}/);
  assert.match(css,/data-tone='live'[^{]*\{ --destructive: #ef4444/);
  assert.match(css,/prefers-reduced-transparency/);assert.match(css,/prefers-reduced-motion/);
  assert.match(css,/:focus-visible \{ outline: 2px solid var\(--rx-accent\)/);
  assert.doesNotMatch(css,/:focus-visible[^{]*\{[^}]*box-shadow/,'focus never becomes a glow');
});

test('RadioX deck is dark, semantic and fully raster', async () => {
  const d=radiox.deck,t=presentationTheme(radiox).deck;
  assert.equal(d.mode,'dark');
  for(const s of Object.values(t.surfaces)){assert.equal(s.fill,'#050505');assert.equal(s.mode,'dark');}
  assert.deepEqual(t.accents.chart,['#22D3EE','#A78BFA','#34D399','#FBBF24','#F472B6']);
  assert.equal(t.accents.signal,dna.colors.danger,'alarm values use the error rose, not live red');
  assert.equal(t.glow.color,'#22D3EE');assert.equal(t.type.capsTrackingEm,.16);
  const m=d.materials;assert.equal(m.panel.fillOpacity,dna.deck.cardFill.opacity);assert.equal(m.panel.borderOpacity,dna.deck.cardBorder.opacity);assert.equal(m.panel.radiusCm,dna.deck.cardRadius.cm);
  assert.equal(m.window.fill,dna.deck.windowPanel.fill);assert.equal(m.window.fillOpacity,dna.deck.windowPanel.opacity);
  assert.equal(d.logo.plate,false);
  for(const path of deckAssetPaths(radiox)){
    const meta=await sharp(fileURLToPath(new URL(`../${path}`,import.meta.url))).metadata();
    assert.equal(meta.format,'png',path);
    if(/backdrop|aurora|matrix|wash/.test(path))assert.deepEqual([meta.width,meta.height],[2400,1350],path);
    else assert.ok(Math.abs(meta.width/meta.height-d.logo.aspectRatio)<.02,`${path} aspect`);
  }
});

test('RadioX deck text stays AA on its backdrops', async () => {
  const c=presentationTheme(radiox).deck.colors.dark;
  const sample=async (path,box)=>{const {data,info}=await sharp(fileURLToPath(new URL(`../${path}`,import.meta.url))).extract(box).raw().toBuffer({resolveWithObject:true});const out=[];for(let i=0;i<data.length;i+=info.channels*97)out.push('#'+[0,1,2].map(k=>data[i+k].toString(16).padStart(2,'0')).join(''));return out;};
  // Cover: eyebrow row (6.1 cm, cyan) and subtitle row (11.7 cm, text-secondary) across the text column.
  const eyebrow=await sample('brands/radiox/assets/deck/aurora-cover.png',{left:66,top:420,width:1850,height:60});
  for(const bg of eyebrow)assert.ok(contrast(c.primary,bg)>=4.5,`eyebrow on ${bg}`);
  const subtitle=await sample('brands/radiox/assets/deck/aurora-cover.png',{left:66,top:820,width:1850,height:100});
  for(const bg of subtitle)assert.ok(contrast(c['text-secondary'],bg)>=4.5,`subtitle on ${bg}`);
  const content=await sample('brands/radiox/assets/deck/wash-content.png',{left:0,top:0,width:2400,height:1350});
  for(const bg of content)assert.ok(contrast(c['text-muted'],bg)>=4.5,`muted text on ${bg}`);
  // Panel (black 25 %) over the wash keeps fg-3 readable too.
  assert.ok(contrast('#94A3B8','#0C0C0C')>=4.5);
});
