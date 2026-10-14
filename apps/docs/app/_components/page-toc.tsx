'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import './page-toc.css';

// h2 with a visible '#' permalink. The heading is named by its title alone; the link carries the title so the links list stays distinguishable.
export function AnchoredHeading({id,label,children}:{id:string;label?:string;children?:ReactNode}){
 const name=label??(typeof children==='string'?children:id);
 return <h2 aria-labelledby={`${id}-titel`}><span id={`${id}-titel`}>{children??name}</span><a className="heading-anchor" href={`#${id}`} aria-label={`Direktlink: ${name}`} title="Direktlink zu diesem Abschnitt">#</a></h2>;
}

export type TocEntry={id:string;label:string};
const SECTION='.doc-section[id],.demo-panel[id]';
const SELECTOR='main .doc-section[id]>h2, main .demo-panel[id]>h2';
// Sticky toolbar plus anchor bar; matches scroll-margin-top in page-toc.css.
const OFFSET=120;
const label=(h:Element)=>{const c=h.cloneNode(true) as Element;c.querySelectorAll('.heading-anchor').forEach(a=>a.remove());return (c.textContent??'').replace(/\s+/g,' ').trim();};
const collect=():TocEntry[]=>Array.from(document.querySelectorAll(SELECTOR)).map(h=>({id:h.parentElement!.id,label:label(h)})).filter(e=>e.id&&e.label);
const same=(a:TocEntry[],b:TocEntry[])=>a.length===b.length&&a.every((e,i)=>e.id===b[i].id&&e.label===b[i].label);
const touches=(n:Node)=>n instanceof Element&&(n.matches(SECTION)||!!n.querySelector(SECTION));

// «Auf dieser Seite». The entries arrive from the server render (catalogue sections), so the bar is part of the first paint.
// The DOM is consulted only when a lazily loaded block adds or removes a linkable section.
export function PageToc({initial}:{initial:TocEntry[]}){
 const nav=useRef<HTMLElement>(null),pinned=useRef<string|null>(null);
 const [entries,setEntries]=useState(initial),[current,setCurrent]=useState<string|null>(null);
 useEffect(()=>{
  const main=document.querySelector('main');if(!main||typeof MutationObserver==='undefined')return;
  let timer:ReturnType<typeof setTimeout>|undefined;
  const sync=()=>setEntries(prev=>{const next=collect();return same(prev,next)?prev:next;});
  sync();
  const observer=new MutationObserver(records=>{if(records.some(r=>Array.from(r.addedNodes).some(touches)||Array.from(r.removedNodes).some(touches))){clearTimeout(timer);timer=setTimeout(sync,80);}});
  observer.observe(main,{childList:true,subtree:true});
  return()=>{clearTimeout(timer);observer.disconnect();};
 },[]);
 // The active entry is the last section whose top has passed the sticky bars. A clicked or linked target wins until the user scrolls.
 useEffect(()=>{
  if(entries.length<3||typeof IntersectionObserver==='undefined')return;
  const targets=entries.map(e=>document.getElementById(e.id)).filter((x):x is HTMLElement=>!!x);
  if(!targets.length)return;
  const atEnd=()=>window.scrollY>0&&window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-4;
  const measure=()=>{if(pinned.current)return;const passed=targets.filter(t=>t.getBoundingClientRect().top<=OFFSET);setCurrent((atEnd()?targets[targets.length-1]:passed[passed.length-1]??targets[0]).id);};
  const fromHash=()=>{let id='';try{id=decodeURIComponent(location.hash.slice(1));}catch{}if(targets.some(t=>t.id===id)){pinned.current=id;setCurrent(id);}};
  const release=()=>{pinned.current=null;};
  // Short final sections never reach the line below the sticky bars, so a frame-throttled scroll check covers the page end.
  const observer=new IntersectionObserver(measure,{rootMargin:`-${OFFSET}px 0px 0px 0px`,threshold:[0,.25,.5,.75,1]});
  let frame=0;const onScroll=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);};
  const input=['wheel','touchstart','keydown','pointerdown'] as const;
  fromHash();measure();
  targets.forEach(t=>observer.observe(t));
  window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('hashchange',fromHash);
  input.forEach(type=>window.addEventListener(type,release,{passive:true}));
  return()=>{observer.disconnect();window.removeEventListener('scroll',onScroll);window.removeEventListener('hashchange',fromHash);input.forEach(type=>window.removeEventListener(type,release));cancelAnimationFrame(frame);};
 },[entries]);
 // Keep the active link visible inside the horizontally scrolling bar without moving the page.
 useEffect(()=>{const bar=nav.current,link=bar?.querySelector<HTMLElement>('[aria-current]');if(!bar||!link)return;const left=link.getBoundingClientRect().left-bar.getBoundingClientRect().left+bar.scrollLeft,right=left+link.offsetWidth;if(left<bar.scrollLeft||right>bar.scrollLeft+bar.clientWidth)bar.scrollTo({left:Math.max(0,left-24)});},[current]);
 if(entries.length<3)return null;
 return <nav ref={nav} className="page-anchors page-toc" aria-label="Auf dieser Seite">{entries.map(e=><a key={e.id} href={`#${e.id}`} aria-current={current===e.id?'location':undefined} onClick={()=>{pinned.current=e.id;setCurrent(e.id);}}>{e.label}</a>)}</nav>;
}
