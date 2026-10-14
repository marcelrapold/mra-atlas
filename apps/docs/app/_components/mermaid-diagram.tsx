'use client';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {Button,Lightbox} from '@rapold/framework-core';
import {Copy,Download} from 'lucide-react';
import {mermaidTheme,mermaidThemeCSS,MERMAID_WRAPPING_WIDTH,MERMAID_NODE_PADDING} from '../../../../packages/brands/src/mermaid-theme.mjs';
import {useActiveBrand} from './framework-shell';

// Mermaid owns global configuration. Serialize initialize + render as one task,
// including across mounted charts and rapid brand changes.
let renderQueue: Promise<void> = Promise.resolve();
let nextId = 0;
// Render only what the reader is about to see: 400px ahead of the viewport.
const NEAR_MARGIN = '400px 0px';

/** Give input and paint a turn between two diagram renders. */
function yieldToMain(): Promise<void> {
  const scheduler=(globalThis as {scheduler?: {yield?: () => Promise<void>}}).scheduler;
  return typeof scheduler?.yield === 'function' ? scheduler.yield() : new Promise(resolve=>setTimeout(resolve,0));
}

let prefetched = false;
/** Warm the Mermaid chunk while the main thread is idle, before the first diagram scrolls near. */
function prefetchMermaid() {
  if(prefetched)return;
  prefetched=true;
  const load=()=>{void import('mermaid').catch(()=>{prefetched=false;});};
  if('requestIdleCallback' in window)window.requestIdleCallback(load,{timeout:4000});
  else setTimeout(load,1500);
}

function download(content: string, name: string, type: string) {
  const url=URL.createObjectURL(new Blob([content],{type}));
  const link=document.createElement('a');link.href=url;link.download=name;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

type Result = {svg: string; key: string; code: string};

export default function MermaidDiagram({code,label,filename,onEdit}:{code:string;label:string;filename:string;onEdit?:()=>void}) {
  const {brand,mode}=useActiveBrand();
  const root=useRef<HTMLDivElement>(null),host=useRef<HTMLDivElement>(null),figure=useRef<HTMLDivElement>(null);
  const [near,setNear]=useState(false);
  const [result,setResult]=useState<Result>(),[error,setError]=useState(''),[busy,setBusy]=useState(false),[copied,setCopied]=useState('');
  // Frame geometry measured from the first render of a definition. Brand and mode
  // changes re-render into the same frame, so the page below does not move.
  const [frame,setFrame]=useState<{code: string; ratio: number}>();
  const key=`${brand.id}\u0000${mode}\u0000${code}`;
  const renderedKey=useRef('');

  useEffect(()=>{prefetchMermaid();},[]);
  useEffect(()=>{
    const element=root.current;
    if(!element)return;
    if(!('IntersectionObserver' in window)){setNear(true);return;}
    const observer=new IntersectionObserver(([entry])=>setNear(entry.isIntersecting),{rootMargin:NEAR_MARGIN});
    observer.observe(element);
    return()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    const element=root.current;
    if(!element||!('ResizeObserver' in window))return;
    let width=element.clientWidth;
    const observer=new ResizeObserver(()=>{const next=element.clientWidth;if(Math.abs(next-width)>1){width=next;setFrame(undefined);}});
    observer.observe(element);
    return()=>observer.disconnect();
  },[]);

  useEffect(()=>{
    // Off-screen diagrams keep their last SVG and are only marked stale; they render once they come near.
    if(!near||key===renderedKey.current){setBusy(false);return;}
    let cancelled=false;
    setBusy(true);setError('');setCopied('');
    const task=async()=>{
      await yieldToMain();
      if(cancelled||!host.current)return;
      const container=host.current;
      try {
        if(code.length>30000)throw new Error('Die Definition darf höchstens 30 000 Zeichen enthalten.');
        const {default:mermaid}=await import('mermaid');
        await document.fonts.ready;
        if(cancelled)return;
        const fontFamily=getComputedStyle(container).fontFamily;
        mermaid.initialize({startOnLoad:false,securityLevel:'strict',suppressErrorRendering:true,maxTextSize:30000,maxEdges:500,theme:'base',look:'classic',fontFamily,
          themeVariables:mermaidTheme(brand,mode,fontFamily),themeCSS:mermaidThemeCSS(brand,mode),flowchart:{wrappingWidth:MERMAID_WRAPPING_WIDTH,padding:MERMAID_NODE_PADDING},
        });
        const rendered=await mermaid.render(`framework-mermaid-${++nextId}`,code,container);
        if(!cancelled){renderedKey.current=key;setResult({svg:rendered.svg,key,code});}
      } catch(e) {
        if(!cancelled){renderedKey.current=key;setResult(undefined);setError(e instanceof Error?e.message:'Diagramm konnte nicht gerendert werden.');}
      } finally {
        container.replaceChildren();
        if(!cancelled)setBusy(false);
      }
    };
    renderQueue=renderQueue.then(task,task);
    return()=>{cancelled=true;};
  },[near,key,code,brand,mode]);

  const svg=result?.svg??'';
  const locked=frame&&result&&frame.code===result.code?frame.ratio:undefined;
  useLayoutEffect(()=>{
    if(!result||locked!==undefined||!figure.current)return;
    const {width,height}=figure.current.getBoundingClientRect();
    if(width>0&&height>0)setFrame({code:result.code,ratio:width/height});
  },[result,locked]);

  const viewBox=svg.match(/viewBox="[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)"/);
  const ratio=viewBox&&Number(viewBox[2])>0?Number(viewBox[1])/Number(viewBox[2]):undefined;
  const stale=Boolean(result)&&result?.key!==key;
  const copy=async()=>{try{await navigator.clipboard.writeText(code);setCopied('Code kopiert.');}catch{setCopied('Bitte den Code unter «Quelltext» markieren und kopieren.');}};
  return <div className="mermaid-example" ref={root}>
    <div ref={host} aria-hidden="true" className="mermaid-measure"/>
    <div className="mermaid-surface" aria-busy={busy} data-stale={stale||undefined}>
      {svg&&<Lightbox label={label} aspectRatio={ratio} surface="readable" fullscreen={<div className="mermaid-svg" dangerouslySetInnerHTML={{__html:svg}}/>}><div ref={figure} className="mermaid-svg" data-locked={locked!==undefined||undefined} style={locked?{aspectRatio:locked}:undefined} dangerouslySetInnerHTML={{__html:svg}}/></Lightbox>}
      {busy?<p className="mermaid-loading" role="status">Diagramm wird gerendert …</p>:!svg&&!error&&<p className="mermaid-loading">Das Diagramm wird gerendert, sobald es in den sichtbaren Bereich kommt.</p>}
      {error&&<div className="mermaid-error" role="alert"><strong>Die Definition konnte nicht gerendert werden.</strong><p>Korrigiere die Syntax und rendere erneut.</p><pre>{error}</pre></div>}
    </div>
    <div className="mermaid-actions">
      {onEdit&&<Button variant="outline" size="sm" onClick={onEdit}>Im Editor öffnen</Button>}
      <Button variant="outline" size="sm" disabled={!svg||busy||stale} onClick={()=>download(svg,`${filename}-${brand.id}.svg`,'image/svg+xml;charset=utf-8')}><Download size={14}/>SVG</Button>
      <Button variant="outline" size="sm" onClick={()=>download(code,`${filename}.mmd`,'text/plain;charset=utf-8')}>Mermaid-Datei</Button>
      <Button variant="ghost" size="sm" onClick={copy}><Copy size={14}/>Code kopieren</Button>
      <span role="status">{copied}</span>
    </div>
    <details className="mermaid-source"><summary>Quelltext · {label}</summary><pre><code>{code}</code></pre></details>
  </div>;
}
