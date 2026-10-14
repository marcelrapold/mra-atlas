'use client';
import Link from 'next/link';
import {ArrowLeft,ArrowRight} from 'lucide-react';
import {pages,href,componentPages} from './catalog';
import {version} from '../../../../package.json';
import './pager.css';

// Sections that document core components and therefore cite the component contract.
const componentSections=new Set(['components','feedback','toasts','empty-states','skeletons','lightbox',...Object.values(componentPages)]);
const CHANGELOG='https://github.com/marcelrapold/mra-atlas/blob/main/CHANGELOG.md';

export function Pager({section,brandId}:{section:string;brandId:string}){
 const index=pages.findIndex(p=>p.id===section);
 if(index<0)return null;
 const prev=pages[index-1],next=pages[index+1];
 const themed=(id:string)=>`${href(id)}?brand=${encodeURIComponent(brandId)}`;
 return <nav className="pager" aria-label="Seitenwechsel">
  <div className="pager-links">
   {prev&&<Link className="pager-card pager-prev" href={themed(prev.id)} prefetch={false} rel="prev"><span className="pager-label"><ArrowLeft size={14} aria-hidden="true"/>Zurück</span><strong>{prev.title}</strong><small>{prev.group}</small></Link>}
   {next&&<Link className="pager-card pager-next" href={themed(next.id)} prefetch={false} rel="next"><span className="pager-label">Weiter<ArrowRight size={14} aria-hidden="true"/></span><strong>{next.title}</strong><small>{next.group}</small></Link>}
  </div>
  <p className="pager-source">{componentSections.has(section)&&<><a href="/contracts/components.md">Komponentenvertrag</a><span aria-hidden="true"> · </span></>}<a href={CHANGELOG}>Changelog</a><span aria-hidden="true"> · </span><span>Atlas {version}</span></p>
 </nav>;
}
