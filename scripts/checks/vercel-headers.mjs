import {readFile} from 'node:fs/promises';
// Resolves the response headers vercel.json assigns to a path: every matching
// rule applies in order and a later rule overrides an earlier value. Only the
// «(.*)» wildcard is supported, so any other path-to-regexp syntax fails loudly.
export async function loadVercelConfig(){return JSON.parse(await readFile(new URL('../../vercel.json',import.meta.url),'utf8'));}
export function sourcePattern(source){
 if(/[:?*+{}]/.test(source.replace(/\(\.\*\)/g,'')))throw new Error(`Unsupported vercel.json source pattern: ${source}`);
 return new RegExp(`^${source.split('(.*)').map(part=>part.replace(/[.^$|[\]\\()]/g,'\\$&')).join('(.*)')}$`);
}
export function headersFor(config,path){
 const headers=new Headers();
 for(const rule of config.headers??[])if(sourcePattern(rule.source).test(path))for(const {key,value} of rule.headers)headers.set(key,value);
 return headers;
}
