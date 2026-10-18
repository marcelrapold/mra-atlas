import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const timelineText=await read('brands/rapold/edgeportal/boot/timeline.json');
const timeline=JSON.parse(timelineText);
const html=await read('brands/rapold/edgeportal/boot/boot.html');
const dna=JSON.parse(await read('brands/rapold-io/dna.json'));
const corona=dna.glow.corona;
const scenarioIds=['normaler-start','erststart-claim','netz-fehlt'];

test('boot.html embeds an exact copy of timeline.json',()=>{
  const match=html.match(/<script type="application\/json" id="edgeportal-boot-timeline">\n([\s\S]*?)\n<\/script>/);
  assert.ok(match,'embedded timeline block missing');
  assert.deepEqual(JSON.parse(match[1]),timeline,'embedded timeline differs: run node scripts/render-boot-frames.mjs --sync-timeline');
  assert.equal(match[1],timelineText.trimEnd(),'embedded timeline is not byte-identical: run node scripts/render-boot-frames.mjs --sync-timeline');
});

test('boot.html is offline: no network resources, fonts relative',()=>{
  assert.doesNotMatch(html,/(?:src|href)\s*=\s*["']https?:/i);
  assert.doesNotMatch(html,/url\(\s*["']?https?:/i);
  assert.doesNotMatch(html,/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(/);
  assert.match(html,/url\("\.\.\/\.\.\/assets\/fonts\/Geist-Variable\.woff2"\)/);
  assert.match(html,/window\.edgeportalBoot\s*=/);
  for(const param of ['scenario','level','still','rm','light','gate','mode','recover','safe'])assert.ok(html.includes(`Q.get('${param}')`),`URL parameter ${param} not read`);
  assert.ok(html.includes("var tq = Q.get('t')"),'URL parameter t not read');
});

test('boot.html uses the approved EdgePortal signet geometry',async()=>{
  const signet=await read('brands/rapold/assets/logos/edgeportal.svg');
  assert.ok(signet.includes('M 122.72 29 L 216 65.08 L 150 97.64 L 40.88 160.12 L 40 103.8 L 122.72 67.72 Z'));
  assert.ok(html.includes('points="122.72,29 216,65.08 150,97.64 40.88,160.12 40,103.8 122.72,67.72"'));
  assert.ok(html.includes('points="216,85.32 216,126.68 166.72,154.84 166.72,227 92.8,190.04 92.8,152.2"'));
  assert.ok(signet.includes('points="216,85.32 216,126.68 166.72,154.84 166.72,227 92.8,190.04 92.8,152.2"'));
});

test('phases are well formed, monotonic and non-overlapping per track',()=>{
  const ids=new Set();
  let previousStart=-Infinity;
  for(const phase of timeline.phases){
    assert.ok(!ids.has(phase.id),`duplicate phase ${phase.id}`);ids.add(phase.id);
    assert.ok(Number.isFinite(phase.startMs)&&Number.isFinite(phase.endMs),phase.id);
    assert.ok(phase.endMs>phase.startMs,`${phase.id} ends before it starts`);
    assert.ok(phase.startMs>=previousStart,`${phase.id} out of order`);previousStart=phase.startMs;
    assert.ok(phase.easing in timeline.easings,`${phase.id}: unknown easing ${phase.easing}`);
    assert.ok(phase.draws&&phase.draws.length>10,`${phase.id}: describe what is drawn`);
  }
  const tracks={};
  for(const phase of timeline.phases)if(phase.track)(tracks[phase.track]??=[]).push(phase);
  for(const [track,list] of Object.entries(tracks))for(let i=1;i<list.length;i++)
    assert.ok(list[i].startMs>=list[i-1].endMs,`track ${track}: ${list[i-1].id} overlaps ${list[i].id}`);
  for(const [name,points] of Object.entries(timeline.easings))if(Array.isArray(points)){
    assert.equal(points.length,4,name);
    assert.ok(points[0]>=0&&points[0]<=1&&points[2]>=0&&points[2]<=1,`${name}: x control points out of range`);
  }
});

test('clock matches the phases and the DNA system start',()=>{
  const c=timeline.clock,phase=id=>timeline.phases.find(p=>p.id===id);
  assert.equal(phase('fade-in').endMs,c.inDur);
  assert.deepEqual([phase('fold').startMs,phase('fold').endMs],[c.fold,c.fold+c.foldDur]);
  assert.deepEqual([phase('ignite').startMs,phase('ignite').endMs],[c.ignite,c.ignite+c.igniteDur]);
  assert.deepEqual([phase('lap').startMs,phase('lap').endMs],[c.lap,c.lap+c.lapDur]);
  assert.equal(c.dock,c.lap+c.lapDur);
  assert.deepEqual([phase('homecoming').startMs,phase('homecoming').endMs],[c.dock,c.dock+c.flareUp+c.flareDown]);
  assert.deepEqual([phase('lights-out').startMs,phase('lights-out').endMs],[c.handoff,c.handoff+c.lightsOutDur]);
  assert.deepEqual([phase('gap-close').startMs,phase('gap-close').endMs],[c.gapClose,c.gapClose+c.gapCloseDur]);
  assert.deepEqual([phase('ridgeline').startMs,phase('ridgeline').endMs],[c.take,c.take+c.tipDur]);
  assert.deepEqual([phase('cool').startMs,phase('cool').endMs],[c.cool,c.cool+c.coolDur]);
  assert.equal(c.take+c.tipDur,c.kiosk,'the ridgeline lands on the Fuge exactly at the kiosk point');
  assert.equal(c.cool+c.coolDur,c.kiosk,'the ridgeline is Ice before it reaches the product');
  assert.ok(c.end>c.ridgeFade+c.ridgeFadeDur);
  // DNA 7.1 / motion.systemStart
  assert.match(dna.motion.systemStart.fadeIn,new RegExp(`0–${c.inDur}ms`));
  assert.match(dna.motion.systemStart.fold,new RegExp(`${c.fold}–${c.fold+c.foldDur}ms`));
  assert.match(dna.motion.systemStart.ignite,new RegExp(`${c.ignite}ms.*${c.igniteDur}ms`));
  assert.match(dna.motion.systemStart.lightsOut,new RegExp(`${c.handoff}ms, ${c.lightsOutDur}ms`));
  assert.match(dna.motion.systemStart.ridgeline,new RegExp(`${c.take}–${c.kiosk}ms`));
  assert.equal(timeline.beatMs,dna.motion.systemStart.productBeatMs);
  assert.match(dna.motion.systemStart.gate,/CEC «on».*6s/);
  assert.equal(timeline.gate.startSignal,'cec-on');
  assert.equal(timeline.gate.startFallbackMs,6000);
});

test('corona runs once and stays within the dna.json limits',()=>{
  const c=timeline.clock,mirror=timeline.corona;
  assert.equal(mirror.deviation,'A1');
  assert.equal(mirror.laps,1);assert.equal(corona.comet.laps,1);
  assert.equal(mirror.lapsFirstBoot,corona.comet.lapsFirstBoot);
  assert.equal(mirror.lapMs,corona.comet.lapMs);
  assert.equal(c.lapDur,corona.comet.lapMs,'one lap, exactly the DNA duration');
  assert.equal(mirror.startMs,corona.comet.startMs);assert.equal(c.lap,corona.comet.startMs);
  assert.equal(mirror.easing,corona.comet.easing);
  assert.deepEqual(timeline.easings.lap,corona.comet.easing.match(/[\d.]+/g).map(Number));
  assert.equal(mirror.tailHistoryMs,corona.comet.tailHistoryMs);assert.equal(c.hist,corona.comet.tailHistoryMs);
  assert.equal(mirror.headMaxPerFrame,corona.comet.head.maxPerFrame);
  assert.deepEqual(mirror.ridgeline,{tipDeg:corona.ridgeline.tipDeg,axisDeg:corona.ridgeline.axisDeg,tipMs:corona.ridgeline.tipMs,easing:corona.ridgeline.easing,coolMs:corona.ridgeline.coolMs,coolTo:corona.ridgeline.coolTo});
  assert.equal(c.tipDur,corona.ridgeline.tipMs);assert.equal(c.coolDur,corona.ridgeline.coolMs);
  assert.deepEqual(timeline.easings.tip,corona.ridgeline.easing.match(/[\d.]+/g).map(Number));
  assert.equal(timeline.scene.fugeAxisDeg,corona.ridgeline.axisDeg);
  assert.equal(mirror.minRenderedMarkHeightPx,corona.minRenderedMarkHeightPx);
  assert.deepEqual(mirror.maxAreaShare,corona.maxAreaShare);
  assert.deepEqual(mirror.tvFirstLight,corona.tvFirstLight);
  assert.equal(mirror.scope,corona.scope);
  assert.match(corona.comet.dock,/180ms hoch, 740ms ab/);assert.equal(c.flareUp,180);assert.equal(c.flareDown,740);
  assert.ok(dna.deviations.some(d=>d.id==='A1'));
  const lapPhases=timeline.phases.filter(p=>p.id==='lap');
  assert.equal(lapPhases.length,1,'exactly one lap phase, never a loop');
  assert.ok(lapPhases[0].endMs<=c.handoff,'the spark is home before the lights go out');
  // boot.html reads every value from the embedded timeline instead of repeating constants
  assert.match(html,/var FT = TL\.clock;/);
  assert.match(html,/E_LAP = bez\.apply\(null, TL\.easings\.lap\)/);
  assert.match(html,/TL\.corona\.minRenderedMarkHeightPx/);
});

test('signals, stages and gates reference known signals in a strict order',()=>{
  const signals=new Set(timeline.signals.map(s=>s.id));
  assert.deepEqual([...signals],['cec-on','kiosk','bootstrap','network','portal','pairing','handoff']);
  timeline.stages.forEach((stage,i)=>{
    assert.equal(stage.index,i);
    assert.ok(signals.has(stage.signal),`stage ${stage.id}: unknown signal ${stage.signal}`);
    for(const key of [stage.logKey,stage.failLogKey].flat().filter(Boolean)){
      const keys=typeof key==='object'?Object.values(key):[key];
      for(const k of keys)assert.ok(k in timeline.texts.log,`stage ${stage.id}: unknown text ${k}`);
    }
    if(stage.requires)for(const s of Object.keys(stage.requires))assert.ok(signals.has(s));
  });
  assert.equal(timeline.stages.find(s=>s.id==='kiosk').notBeforeMs,timeline.clock.kiosk);
  assert.equal(timeline.gating.order,'strict');
  assert.equal(timeline.gating.minHoldMs,400);
  for(const s of timeline.signals)if(s.values)for(const v of s.values)assert.ok(typeof v==='string');
});

test('all three scenarios are present with valid signal schedules and texts',()=>{
  assert.deepEqual(Object.keys(timeline.scenarios),scenarioIds);
  assert.equal(timeline.defaultScenario,'normaler-start');
  const signals=new Map(timeline.signals.map(s=>[s.id,s]));
  const labels={'normaler-start':'Normaler Start','erststart-claim':'Erststart mit Claim','netz-fehlt':'Netz fehlt'};
  for(const id of scenarioIds){
    const sc=timeline.scenarios[id];
    assert.equal(sc.label,labels[id]);
    let last=-Infinity;
    for(const ev of sc.signals){
      const def=signals.get(ev.signal);
      assert.ok(def,`${id}: unknown signal ${ev.signal}`);
      if(ev.value!==undefined)assert.ok(def.values?.includes(ev.value),`${id}: ${ev.signal} has no value ${ev.value}`);
      assert.ok(ev.atMs>=timeline.clock.kiosk,`${id}: ${ev.signal} before the kiosk point`);
      assert.ok(ev.atMs-last>=timeline.gating.minHoldMs,`${id}: ${ev.signal} shorter than the minimum hold`);
      last=ev.atMs;
    }
    assert.ok(timeline.stages.some(s=>s.id===sc.staticEndStage),`${id}: unknown end stage`);
  }
  const normal=timeline.scenarios['normaler-start'].signals;
  assert.deepEqual(normal.map(s=>s.signal),['kiosk','bootstrap','network','portal','pairing','handoff']);
  assert.equal(normal.find(s=>s.signal==='pairing').value,'paired');
  normal.slice(0,5).forEach((s,i)=>assert.equal(s.atMs,timeline.clock.kiosk+i*timeline.beatMs));
  const claim=timeline.scenarios['erststart-claim'];
  assert.equal(claim.signals.at(-1).value,'claim');
  assert.ok(!claim.signals.some(s=>s.signal==='handoff'),'no handoff without a valid device key');
  assert.match(claim.claim.codes[0],/^[0-9A-F]{6}$/);assert.equal(claim.claim.ttlS,300);
  const offline=timeline.scenarios['netz-fehlt'];
  assert.equal(offline.signals.at(-1).signal,'network');assert.equal(offline.signals.at(-1).value,'fail');
  assert.ok(!offline.signals.some(s=>['portal','pairing','handoff'].includes(s.signal)),'no later stage without network');
  assert.ok(offline.diagnostic.afterFailMs>0);assert.ok(offline.diagnostic.logKey in timeline.texts.log);
  assert.deepEqual(offline.recover.signals.map(s=>s.signal),['network','portal','pairing','handoff']);
  // texts: five levels everywhere, approved nomenclature
  assert.deepEqual(timeline.levels.map(l=>l.name),['Calm','Shell','Syslog','Uplink','Ghost']);
  for(const [key,list] of Object.entries(timeline.texts.log)){assert.equal(list.length,5,key);list.slice(1).forEach(t=>assert.equal(typeof t,'string',key));}
  for(const list of Object.values(timeline.texts.sub))assert.equal(list.length,5);
  assert.equal(timeline.texts.claimPrompt.length,5);assert.equal(timeline.texts.handoff.length,5);
  assert.match(timeline.texts.log.diag[0],/edgeportal-setup\.log/);
  assert.match(timeline.texts.log.handoff[0],/Agents Home/);
  const all=JSON.stringify(timeline.texts);
  assert.doesNotMatch(all,/\bFabric\b|\bBühne\b|\bConsole\b/,'retired or wrong product names in boot texts');
});

test('static end state, sound and Plymouth decisions are recorded',()=>{
  assert.equal(timeline.sound.default,'off');
  assert.equal(timeline.staticEndState.restImageMs,timeline.clock.kiosk);
  assert.ok(timeline.staticEndState.plymouthMinHoldMs>=2000);
  assert.equal(timeline.plymouth.fps,30);
  assert.deepEqual(timeline.plymouth.resolutions,{'720p':[1280,720],'1080p':[1920,1080],'4k':[3840,2160]});
  assert.equal(timeline.plymouth.renderToMs,timeline.clock.kiosk);
  assert.equal(timeline.plymouth.outsideInitramfs,true);
  assert.deepEqual(timeline.plymouth.killSwitches.map(k=>k.id),['plymouth.enable=0','edgeportal/first']);
  assert.deepEqual(timeline.plymouth.killSwitches[1].values,['0','static','1']);
  assert.equal(timeline.plymouth.pi3,'static');
});

test('public repo hygiene: no private hosts, addresses or secrets in the kit',async()=>{
  const readme=await read('brands/rapold/edgeportal/boot/README.md');
  for(const text of [timelineText,html,readme]){
    const ips=[...text.matchAll(/\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g)].map(m=>m[0]);
    assert.deepEqual(ips.filter(ip=>ip!=='127.0.0.1'),[],'only loopback addresses are allowed');
    assert.doesNotMatch(text,/\b(?:password|passwort|token|secret|api[_-]?key)\s*[:=]/i);
    assert.doesNotMatch(text,/\.(?:local|lan|internal)\b/);
  }
});
