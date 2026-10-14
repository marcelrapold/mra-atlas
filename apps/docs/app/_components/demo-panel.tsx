'use client';
import {useEffect,useRef,useState,type MouseEvent,type ReactNode} from 'react';
import {Check,Copy} from 'lucide-react';
import {Button,Tabs,TabsList,TabsTrigger,TabsContent} from '@rapold/framework-core';

type DemoPanelProps={
  /** Visible panel heading (h2). */
  title:string;
  /** Slug for deep links, e.g. `button-badge`. Unique per page. */
  id:string;
  /** Minimal hand-written usage snippet shown in the Code tab and copied as-is. */
  code:string;
  /** Short intro below the heading. A string becomes a paragraph. */
  description?:ReactNode;
  /** `center` for compact controls, `fill` for full-width compositions. */
  layout?:'center'|'fill';
  children:ReactNode;
};

/** Async Clipboard API first; `execCommand` for insecure origins and denied permissions. */
async function writeClipboard(text:string) {
  try {if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);return true;}} catch {/* fall through */}
  const area=document.createElement('textarea');
  area.value=text;area.setAttribute('readonly','');area.setAttribute('aria-hidden','true');
  Object.assign(area.style,{position:'fixed',top:'0',left:'0',opacity:'0',pointerEvents:'none'});
  document.body.append(area);area.select();
  let ok=false;
  try {ok=document.execCommand('copy');} catch {ok=false;}
  area.remove();
  return ok;
}

export function DemoPanel({title,id,code,description,layout='center',children}:DemoPanelProps) {
  const [tab,setTab]=useState('preview'),[status,setStatus]=useState('');
  const codeRef=useRef<HTMLElement>(null);
  const timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
  const selectPending=useRef(false);
  useEffect(()=>()=>clearTimeout(timer.current),[]);
  const snippet=code.trim();
  /** Selects the snippet for a manual copy; reports only what actually happened. */
  const selectCode=()=>{
    const node=codeRef.current,selection=window.getSelection();
    if(!node||!selection){setStatus('Kopieren nicht möglich. Code im Tab «Code» markieren.');return;}
    const range=document.createRange();range.selectNodeContents(node);selection.removeAllRanges();selection.addRange(range);
    setStatus('Code markiert. Mit Strg+C oder ⌘C kopieren.');
  };
  // Runs after the Code tab is shown; the snippet is force-mounted, so the <code> node exists.
  useEffect(()=>{if(tab==='code'&&selectPending.current){selectPending.current=false;selectCode();}},[tab]);
  const copy=async(event:MouseEvent<HTMLButtonElement>)=>{
    const trigger=event.currentTarget;
    const ok=await writeClipboard(snippet);
    trigger.focus({preventScroll:true});
    clearTimeout(timer.current);
    if(ok){setStatus('Kopiert');timer.current=setTimeout(()=>setStatus(''),2400);return;}
    // No clipboard at all: show the code and select it for a manual copy.
    if(tab==='code'){selectCode();return;}
    selectPending.current=true;setTab('code');
  };
  return <section className="demo-panel demo-panel--stage" id={id} aria-labelledby={`${id}-title`}>
    <header className="demo-panel-header"><h2 id={`${id}-title`}>{title}</h2>{typeof description==='string'?<p>{description}</p>:description}</header>
    <Tabs value={tab} onValueChange={setTab} className="demo-tabs">
      <div className="demo-panel-bar">
        <TabsList aria-label={`${title}: Darstellung`}><TabsTrigger value="preview">Vorschau</TabsTrigger><TabsTrigger value="code">Code</TabsTrigger></TabsList>
        <div className="demo-panel-actions"><span role="status" className="demo-copy-status">{status}</span><Button type="button" variant="ghost" size="sm" onClick={copy}>{status==='Kopiert'?<Check aria-hidden="true"/>:<Copy aria-hidden="true"/>}Code kopieren</Button></div>
      </div>
      {/* Both stay mounted while hidden: demo state (players, streams, forms) survives a look at the code, and the snippet can be selected right after the tab switch. */}
      <TabsContent value="preview" forceMount><div className="demo-stage" data-layout={layout}>{children}</div></TabsContent>
      <TabsContent value="code" forceMount className="demo-code"><pre><code ref={codeRef}>{snippet}</code></pre></TabsContent>
    </Tabs>
  </section>;
}
