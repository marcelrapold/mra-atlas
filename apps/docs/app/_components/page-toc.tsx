'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import './page-toc.css';

// h2 with a visible '#' permalink. The link name stays short so the heading reads «Titel Direktlink».
export function AnchoredHeading({id,children}:{id:string;children:ReactNode}){
 return <h2>{children}<a className="heading-anchor" href={`#${id}`} aria-label="Direktlink" title="Direktlink zu diesem Abschnitt">#</a></h2>;
}

type Entry={id:string;label:string};
const SELECTOR='main .doc-section[id]>h2, main .demo-panel[id]>h2';
// Pages that bring their own anchor bar.
const SKIP=new Set(['praesentation','mermaid']);
// Sticky toolbar plus anchor bar; matches scroll-margin-top in page-toc.css.
const OFFSET=120;
const label=(h:Element)=>{const c=h.cloneNode(true) as Element;c.querySelectorAll('.heading-anchor').forEach(a=>a.remove());return (c.textContent??'').replace(/\s+/g,' ').trim();};
const collect=():Entry[]=>Array.from(document.querySelectorAll(SELECTOR)).map(h=>({id:h.parentElement!.id,label:label(h)})).filter(e=>e.id&&e.label);
const same=(a:Entry[],b:Entry[])=>a.length===b.length&&a.every((e,i)=>e.id===b[i].id&&e.label===b[i].label);

export function PageToc({section}:{section:string}){
 const path=usePathname();
 const nav=useRef<HTMLElement>(null);
 const [entries,setEntries]=useState<Entry[]>([]),[current,setCurrent]=useState<string|null>(null);
 const skip=SKIP.has(section);
 // Collect after mount and on route change; lazily loaded demos add sections later, so watch main as well.
 useEffect(()=>{
  if(skip){setEntries([]);return;}
  const main=document.querySelector('main');let timer:ReturnType<typeof setTimeout>|undefined;
  const sync=()=>setEntries(prev=>{const next=collect();return same(prev,next)?prev:next;});
  const update=()=>{clearTimeout(timer);timer=setTimeout(sync,80);};
  sync();
  const observer=main?new MutationObserver(update):null;observer?.observe(main!,{childList:true,subtree:true});
  return()=>{clearTimeout(timer);observer?.disconnect();};
 },[path,skip]);
 // The active entry is the last section whose top has passed the sticky bars.
 useEffect(()=>{
  if(entries.length<3||typeof IntersectionObserver==='undefined')return;
  const targets=entries.map(e=>document.getElementById(e.id)).filter((x):x is HTMLElement=>!!x);
  if(!targets.length)return;
  const atEnd=()=>window.scrollY>0&&window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-4;
  const measure=()=>{const passed=targets.filter(t=>t.getBoundingClientRect().top<=OFFSET);setCurrent((atEnd()?targets[targets.length-1]:passed[passed.length-1]??targets[0]).id);};
  // The observer fires whenever a section crosses the line below the sticky bars, also after layout shifts.
  // Short final sections never reach that line, so a frame-throttled scroll check covers the page end.
  const observer=new IntersectionObserver(measure,{rootMargin:`-${OFFSET}px 0px 0px 0px`,threshold:[0,.25,.5,.75,1]});
  targets.forEach(t=>observer.observe(t));
  let frame=0;const onScroll=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);};
  window.addEventListener('scroll',onScroll,{passive:true});
  return()=>{observer.disconnect();window.removeEventListener('scroll',onScroll);cancelAnimationFrame(frame);};
 },[entries]);
 // Keep the active link visible inside the horizontally scrolling bar without moving the page.
 useEffect(()=>{const bar=nav.current,link=bar?.querySelector<HTMLElement>('[aria-current]');if(!bar||!link)return;const left=link.getBoundingClientRect().left-bar.getBoundingClientRect().left+bar.scrollLeft,right=left+link.offsetWidth;if(left<bar.scrollLeft||right>bar.scrollLeft+bar.clientWidth)bar.scrollTo({left:Math.max(0,left-24)});},[current]);
 if(skip||entries.length<3)return null;
 return <nav ref={nav} className="page-anchors page-toc" aria-label="Auf dieser Seite">{entries.map(e=><a key={e.id} href={`#${e.id}`} aria-current={current===e.id?'location':undefined} onClick={()=>setCurrent(e.id)}>{e.label}</a>)}</nav>;
}
