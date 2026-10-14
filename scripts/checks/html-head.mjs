// Minimal reader for the head of a server-rendered page. React escapes «<», «>»
// and quotes in attribute values, so a tag ends at the first «>».
const entities={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};
export const decode=s=>s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,(m,e)=>e[0]==='#'?String.fromCodePoint(e[1].toLowerCase()==='x'?parseInt(e.slice(2),16):Number(e.slice(1))):entities[e.toLowerCase()]??m);
const attributes=s=>Object.fromEntries([...s.matchAll(/([^\s"'=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)].map(m=>[m[1].toLowerCase(),decode(m[2]??m[3]??m[4]??'')]));
export function readHead(html){
 const head=html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1]??'';
 const tags=name=>[...head.matchAll(new RegExp(`<${name}\\b([^>]*)>`,'gi'))].map(m=>attributes(m[1]));
 return {
  tags,
  titles:[...head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map(m=>decode(m[1])),
  meta:key=>tags('meta').filter(a=>a.property===key||a.name===key).map(a=>a.content),
  links:rel=>tags('link').filter(a=>a.rel?.toLowerCase().split(/\s+/).includes(rel)).map(a=>a.href),
  // Structured data is rendered by the page body, so it is read from the whole document.
  jsonLd:[...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]),
 };
}
