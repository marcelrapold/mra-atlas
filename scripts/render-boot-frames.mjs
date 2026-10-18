#!/usr/bin/env node
/**
 * Render PNG frames of the EdgePortal boot sequence (brands/rapold/edgeportal/boot/boot.html) with Playwright.
 * Every frame is its own page load with ?t=<ms>, so frames are deterministic and independent of wall-clock time.
 * Output goes outside the repository by default; rendered frames are never committed.
 *
 *   node scripts/render-boot-frames.mjs --scenario netz-fehlt --resolution 1080p --times 0,2400,6740,12000
 *   node scripts/render-boot-frames.mjs --resolution 4k --fps 30 --from 0 --to 6740      # Plymouth sprites
 *   node scripts/render-boot-frames.mjs --still end --scenario erststart-claim            # static end state
 *   node scripts/render-boot-frames.mjs --sync-timeline                                  # re-embed timeline.json
 */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,join,resolve,relative,isAbsolute} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {tmpdir} from 'node:os';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const bootDir=join(root,'brands/rapold/edgeportal/boot');
const htmlPath=join(bootDir,'boot.html');
const timelinePath=join(bootDir,'timeline.json');
const EMBED=/(<script type="application\/json" id="edgeportal-boot-timeline">\n)([\s\S]*?)(\n<\/script>)/;

function args(argv){
  const out={};
  for(let i=0;i<argv.length;i++){
    const a=argv[i];
    if(!a.startsWith('--'))throw new Error(`Unexpected argument: ${a}`);
    const key=a.slice(2),next=argv[i+1];
    if(next===undefined||next.startsWith('--'))out[key]=true;else{out[key]=next;i++;}
  }
  return out;
}

async function syncTimeline(){
  const [html,timeline]=await Promise.all([readFile(htmlPath,'utf8'),readFile(timelinePath,'utf8')]);
  JSON.parse(timeline);
  if(timeline.includes('</'))throw new Error('timeline.json must not contain "</" (inline script).');
  if(!EMBED.test(html))throw new Error('Embedded timeline block not found in boot.html.');
  const next=html.replace(EMBED,(_,a,_b,c)=>a+timeline.trimEnd()+c);
  await writeFile(htmlPath,next);
  console.log(next===html?'boot.html: embedded timeline already in sync.':'boot.html: embedded timeline updated from timeline.json.');
}

async function main(){
  const o=args(process.argv.slice(2));
  if(o.help){console.log(await readFile(fileURLToPath(import.meta.url),'utf8').then(s=>s.split('*/')[0]));return;}
  if(o['sync-timeline']){await syncTimeline();return;}
  const timeline=JSON.parse(await readFile(timelinePath,'utf8'));
  const scenario=o.scenario||timeline.defaultScenario;
  const level=o.level?Number(o.level):timeline.defaultLevel;
  const resKey=String(o.resolution||'1080p').toLowerCase();
  const res=timeline.plymouth.resolutions[resKey]||(/^\d+x\d+$/.test(resKey)?resKey.split('x').map(Number):null);
  if(!res)throw new Error(`Unknown resolution ${resKey}. Use ${Object.keys(timeline.plymouth.resolutions).join(', ')} or WIDTHxHEIGHT.`);
  const [width,height]=res;
  // Layout always at 1920 CSS px width; the device scale factor gives the pixel size. All resolutions share one look.
  const scale=width/1920;
  let times;
  if(o.still==='end')times=['end'];
  else if(o.times)times=String(o.times).split(',').map(s=>Number(s.trim())).filter(n=>Number.isFinite(n)&&n>=0);
  else{
    const fps=Number(o.fps||timeline.plymouth.fps),from=Number(o.from??timeline.plymouth.renderFromMs),to=Number(o.to??timeline.plymouth.renderToMs);
    times=[];for(let f=0;;f++){const t=Math.round(from+f*1000/fps);if(t>to)break;times.push(t);}
  }
  if(!times.length)throw new Error('No frames to render.');
  const outDir=resolve(String(o.out||join(tmpdir(),'edgeportal-boot-frames',`${scenario}-${resKey}-l${level}`)));
  const rel=relative(root,outDir);
  if(!o['allow-repo']&&!rel.startsWith('..')&&!isAbsolute(rel))throw new Error(`Refusing to write frames inside the repository (${rel}). Pass --allow-repo to override.`);
  await mkdir(outDir,{recursive:true});

  const {chromium}=await import('playwright');
  const browser=await chromium.launch();
  try{
    const context=await browser.newContext({viewport:{width:1920,height:Math.round(height/scale)},deviceScaleFactor:scale,reducedMotion:o.rm?'reduce':'no-preference'});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{if(!r.url().startsWith('file:')&&!r.url().startsWith('data:'))errors.push(`Network request blocked: ${r.url()}`);});
    await page.route(/^(?!file:|data:)/,route=>route.abort());
    const base=pathToFileURL(htmlPath);
    const written=[];
    for(const t of times){
      const q=new URLSearchParams({scenario,level:String(level)});
      if(t==='end')q.set('still','end');else q.set('t',String(t));
      if(o.rm)q.set('rm','1');
      if(o.light)q.set('light',String(o.light));
      if(o.recover!==undefined)q.set('recover',String(o.recover));
      base.search=q.toString();
      await page.goto(base.href,{waitUntil:'load'});
      await page.waitForFunction(()=>document.documentElement.dataset.ready==='1');
      const name=t==='end'?`${scenario}-${resKey}-end.png`:`${scenario}-${resKey}-${String(t).padStart(5,'0')}.png`;
      const file=join(outDir,name);
      await page.screenshot({path:file,type:'png'});
      written.push(file);
    }
    if(errors.length)throw new Error(`Page errors:\n${errors.join('\n')}`);
    console.log(`${written.length} frame(s) at ${width}x${height}, scenario ${scenario}, level ${level} → ${outDir}`);
    if(written.length<=6)written.forEach(f=>console.log(f));
  }finally{await browser.close();}
}

main().catch(e=>{console.error(e.message||e);process.exit(1);});
