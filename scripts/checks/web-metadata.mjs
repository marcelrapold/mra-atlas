// Checks the sharing, search and trust surface of the static export after
// `npm run build`: every published page, the 404 page, manifest, icons,
// structured data and security.txt. Usage: node scripts/checks/web-metadata.mjs
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {readHead} from './html-head.mjs';

const origin='https://atlas.rapold.io';
const fileFor=path=>path==='/'?'index.html':`${path.slice(1)}.html`;
const publicFile=href=>new URL(href,origin).pathname.slice(1);

export async function checkWebMetadata(out=new URL('../../apps/docs/out/',import.meta.url)){
 const problems=[],read=path=>readFile(new URL(path,out)),text=async path=>(await read(path)).toString('utf8');
 const fail=(where,message)=>problems.push(`${where}: ${message}`);
 const exists=async path=>{try{return (await read(path)).length>0;}catch{return false;}};
 const sitemap=await text('sitemap.xml');
 const paths=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
 if(paths.length<10)fail('sitemap.xml',`only ${paths.length} URLs`);
 const rootDescription=readHead(await text('index.html')).meta('description')[0];
 const descriptions=new Map();
 const structured=(where,blocks)=>blocks.map((raw,i)=>{
  try{const data=JSON.parse(raw);if(/"logo"/.test(raw))fail(where,'structured data must not carry a brand logo');if(/Der First/i.test(raw))fail(where,'structured data references the unapproved umbrella mark');return data;}
  catch(error){fail(where,`ld+json block ${i+1} does not parse: ${error.message}`);return null;}
 }).filter(Boolean);
 const types=data=>data.flatMap(d=>d['@graph']??[d]).map(d=>d['@type']);
 for(const path of paths){
  const where=fileFor(path);let html;
  try{html=await text(where);}catch{fail(where,'missing for a sitemap URL');continue;}
  const head=readHead(html),[title]=head.titles,one=key=>head.meta(key);
  if(head.titles.length!==1)fail(where,`expected one <title>, found ${head.titles.length}`);
  for(const key of ['og:title','twitter:title'])if(one(key).length!==1||one(key)[0]!==title)fail(where,`${key} «${one(key).join(' | ')}» must equal <title> «${title}»`);
  for(const key of ['og:image','og:site_name','og:locale','twitter:card','twitter:image'])if(!one(key).length)fail(where,`${key} missing`);
  const description=one('description')[0];
  if(!description)fail(where,'description missing');
  else{
   if(description.length>160)fail(where,`description has ${description.length} characters (max. 160)`);
   if(one('og:description')[0]!==description)fail(where,'og:description must equal the page description');
   if(path!=='/'&&description===rootDescription)fail(where,'description repeats the site description');
   if(descriptions.has(description))fail(where,`description duplicates ${descriptions.get(description)}`);
   descriptions.set(description,where);
  }
  const canonical=head.links('canonical');
  if(canonical.length!==1||new URL(canonical[0]).href!==new URL(path,origin).href)fail(where,`canonical must be ${new URL(path,origin)}, found ${canonical.join(', ')||'none'}`);
  if(new URL(one('og:url')[0]??'about:blank').href!==new URL(path,origin).href)fail(where,`og:url must be ${new URL(path,origin)}`);
  if(!head.links('manifest').length)fail(where,'manifest link missing');
  if(!head.links('apple-touch-icon').length)fail(where,'apple-touch-icon link missing');
  if(!one('theme-color').length)fail(where,'theme-color missing');
  if(one('robots').some(r=>/noindex/.test(r)))fail(where,'a sitemap page must stay indexable');
  const data=structured(where,head.jsonLd),found=types(data);
  if(path==='/'){
   const site=data.find(d=>d['@type']==='WebSite');
   if(!site)fail(where,'WebSite structured data missing');
   else if(site.inLanguage!=='de-CH'||site.publisher?.['@type']!=='Person'||site.publisher?.name!=='Marcel Rapold'||site.copyrightNotice!=='Alle Rechte vorbehalten')fail(where,'WebSite must name language de-CH, the publisher Marcel Rapold and «Alle Rechte vorbehalten»');
  }else for(const type of ['BreadcrumbList','TechArticle'])if(!found.includes(type))fail(where,`${type} structured data missing`);
 }
 // 404: German, one title, never indexed and never canonicalised onto another URL.
 const notFound=await text('404.html'),missing=readHead(notFound);
 if(missing.titles.length!==1||missing.titles[0]!=='Seite nicht gefunden · Atlas')fail('404.html',`expected the single title «Seite nicht gefunden · Atlas», found ${missing.titles.map(t=>`«${t}»`).join(', ')||'none'}`);
 const robots=missing.meta('robots');
 if(robots.length!==1||!/\bnoindex\b/.test(robots[0]))fail('404.html',`expected one robots noindex tag, found ${robots.map(r=>`«${r}»`).join(', ')||'none'}`);
 if(missing.links('canonical').length)fail('404.html','an error page must not declare a canonical URL');
 if(/could not be found/i.test(notFound))fail('404.html','framework default English copy is still rendered');
 if(!/<html[^>]*lang="de-CH"/.test(notFound)||!notFound.includes('Seite nicht gefunden'))fail('404.html','German error page missing');
 structured('404.html',missing.jsonLd);
 // Linked install surfaces must resolve to exported files.
 const home=readHead(await text('index.html'));
 for(const href of [...home.links('manifest'),...home.links('apple-touch-icon'),...home.links('icon')])if(!await exists(publicFile(href)))fail('index.html',`linked file ${href} is not exported`);
 try{
  const manifest=JSON.parse(await text(publicFile(home.links('manifest')[0]??'/manifest.webmanifest')));
  if(manifest.lang!=='de-CH')fail('manifest','lang must be de-CH');
  if(manifest.theme_color!==home.meta('theme-color')[0])fail('manifest','theme_color must match the theme-color meta');
  for(const icon of manifest.icons??[])if(!await exists(publicFile(icon.src)))fail('manifest',`icon ${icon.src} is not exported`);
  if(!manifest.icons?.some(icon=>icon.sizes==='any'&&icon.type==='image/svg+xml'))fail('manifest','scalable icon missing');
 }catch(error){fail('manifest',error.message);}
 // RFC 9116: Contact and Expires are required; an expired file is worse than none.
 try{
  const security=await text('.well-known/security.txt'),field=name=>security.match(new RegExp(`^${name}:\\s*(.+)$`,'mi'))?.[1].trim();
  const expires=Date.parse(field('Expires')??'');
  if(!field('Contact')?.startsWith('https://'))fail('security.txt','Contact must be an https URL');
  if(!(expires>Date.now()))fail('security.txt',`Expires ${field('Expires')??'missing'} is not in the future`);
  else if(expires-Date.now()>366*864e5)fail('security.txt','Expires must be at most one year ahead');
  if(field('Canonical')!==`${origin}/.well-known/security.txt`)fail('security.txt','Canonical must name the published URL');
 }catch{fail('security.txt','missing from the export');}
 return {pages:paths.length,problems};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const {pages,problems}=await checkWebMetadata();
 if(problems.length){console.error(`Web metadata: ${problems.length} problem(s)\n- ${problems.join('\n- ')}`);process.exitCode=1;}
 else console.log(`Web metadata verified: ${pages} pages with sharing metadata and structured data, German 404, manifest, icons and security.txt.`);
}
