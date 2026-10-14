import type {Metadata, ResolvingMetadata, Viewport} from 'next';
import {guidance, href, pages} from '../_components/catalog';
// One place for sharing, search and structured-data metadata. Pages spread the
// inherited Open Graph and Twitter blocks (Next merges metadata shallowly), so
// og:image, site name and locale survive while title, description and url change.
// description mirrors the root layout; web-metadata.mjs fails the build if they drift.
export const site={name:'Atlas',description:'Atlas, das Designsystem von Rapold: ein Designstandard mit austauschbaren Brands für Interfaces und Management-Präsentationen.',url:'https://atlas.rapold.io',language:'de-CH',author:'Marcel Rapold',copyright:'Alle Rechte vorbehalten',themeColor:'#263b70'} as const;
export const siteViewport:Viewport={themeColor:site.themeColor};
export const descriptionLimit=160;
export function clampDescription(text:string){const flat=text.replace(/\s+/g,' ').trim();if(flat.length<=descriptionLimit)return flat;const cut=flat.slice(0,descriptionLimit-1);return cut.slice(0,cut.lastIndexOf(' ')).replace(/[\s,;:–-]+$/,'')+'…';}
export const pageTitle=(title:string)=>`${title} · ${site.name}`;
export function pageDescription(id:string,intro?:string){const title=pages.find(p=>p.id===id)?.title??'Referenz';return clampDescription(intro??guidance[id]?.intro??`${title}: Referenz im Designsystem Atlas – Regeln, Beispiele und Verträge.`);}
export async function pageMetadata(parent:ResolvingMetadata,{title,description,path}:{title:string;description:string;path:string}):Promise<Metadata>{
 const inherited=await parent,full=pageTitle(title);
 return {title:full,description,alternates:{canonical:path},openGraph:{...inherited.openGraph,title:full,description,url:path},twitter:{...inherited.twitter,title:full,description}};
}
const person={'@type':'Person','@id':`${site.url}/#marcel-rapold`,name:site.author};
const absolute=(path:string)=>new URL(path,site.url).toString();
export function websiteData(description:string=site.description){
 return {'@context':'https://schema.org','@type':'WebSite','@id':`${site.url}/#website`,name:site.name,url:absolute('/'),description,inLanguage:site.language,publisher:person,copyrightHolder:person,copyrightNotice:site.copyright};
}
export function articleData(id:string,{title,description}:{title:string;description:string}){
 const url=absolute(href(id)),page=pages.find(p=>p.id===id);
 return {'@context':'https://schema.org','@graph':[
  {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:site.name,item:absolute('/')},{'@type':'ListItem',position:2,name:title,item:url}]},
  {'@type':'TechArticle','@id':`${url}#article`,headline:title,description,url,mainEntityOfPage:url,inLanguage:site.language,...(page?{articleSection:page.group}:{}),isPartOf:{'@type':'WebSite','@id':`${site.url}/#website`,name:site.name,url:absolute('/')},author:person,publisher:person,copyrightHolder:person,copyrightNotice:site.copyright},
 ]};
}
// Structured data is inert JSON, but it is still parsed inside <script>: escaping
// «<» keeps a «</script>» in any catalogue text from ending the element early.
export const serializeJsonLd=(data:object)=>JSON.stringify(data).replace(/</g,'\\u003c');
export function jsonLd(data:object){return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(data)}}/>;}
