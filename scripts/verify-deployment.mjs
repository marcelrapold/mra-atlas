import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {readHead} from './checks/html-head.mjs';

// The OWASP-aligned header baseline. vercel.json is tested against this list and
// the live run asserts it on every checked route, so config and edge cannot drift.
export const directives=value=>new Map(value.split(';').map(d=>d.trim().split(/\s+/)).filter(([name])=>name).map(([name,...sources])=>[name.toLowerCase(),sources]));
const exactly=(map,name,source)=>map.get(name)?.length===1&&map.get(name)[0]===source;
export const requiredSecurityHeaders=Object.freeze([
  {name:'Content-Security-Policy',check:value=>{
    const csp=directives(value);
    const missing=[['default-src',"'self'"],['object-src',"'none'"],['base-uri',"'self'"],['frame-ancestors',"'self'"],['form-action',"'self'"]].filter(([name,source])=>!exactly(csp,name,source)).map(([name,source])=>`${name} ${source}`);
    if([...csp.values()].flat().includes("'unsafe-eval'"))missing.push("no 'unsafe-eval'");
    return missing.length?`expected ${missing.join(', ')}`:null;
  }},
  {name:'Strict-Transport-Security',check:value=>{const parts=value.split(';').map(p=>p.trim().toLowerCase()),max=Number(parts.find(p=>p.startsWith('max-age='))?.slice(8));return max>=31536000&&parts.includes('includesubdomains')?null:'expected max-age of at least one year and includeSubDomains';}},
  {name:'X-Content-Type-Options',check:value=>value.toLowerCase()==='nosniff'?null:'expected nosniff'},
  {name:'X-Frame-Options',check:value=>/^(sameorigin|deny)$/i.test(value)?null:'expected SAMEORIGIN'},
  {name:'Referrer-Policy',check:value=>/^(strict-origin-when-cross-origin|strict-origin|same-origin|no-referrer)$/.test(value)?null:'expected strict-origin-when-cross-origin'},
  {name:'Permissions-Policy',check:value=>{const policy=new Map(value.split(',').map(p=>p.trim().split('=')));const open=['camera','microphone','geolocation','payment','usb','browsing-topics'].filter(feature=>policy.get(feature)!=='()');return open.length?`expected an empty allowlist for ${open.join(', ')}`:null;}},
  {name:'Cross-Origin-Opener-Policy',check:value=>value==='same-origin'?null:'expected same-origin'},
]);
export function securityHeaderProblems(headers){
  return requiredSecurityHeaders.flatMap(({name,check})=>{const value=headers.get(name);if(value==null)return [`${name} missing`];const problem=check(value.trim());return problem?[`${name}: ${problem}`]:[];});
}

// The fingerprinted vendor bundle must be cached for a year; HTML must never be.
export const immutableAsset='/vendor/echarts-6.0.0.min.js';
const isImmutable=headers=>/\bimmutable\b/i.test(headers.get('Cache-Control')??'');

export async function verifyDeployment({baseUrl,commit,version,fetcher=fetch}) {
  if(!/^[a-f0-9]{40}$/.test(commit??''))throw new Error('A full Git commit SHA is required.');
  const base=new URL(baseUrl);
  if(base.protocol!=='https:')throw new Error('Production verification requires HTTPS.');
  const get=async path=>{
    const response=await fetcher(new URL(path,base),{redirect:'error',signal:AbortSignal.timeout(15000),headers:{'Cache-Control':'no-cache'}});
    if(!response.ok)throw new Error(`${path}: HTTP ${response.status}`);
    return response;
  };
  const info=await(await get(`/build-info.json?commit=${commit}`)).json();
  if(info.commit!==commit||info.version!==version)throw new Error(`Production build mismatch: expected ${version}/${commit}, received ${info.version}/${info.commit}.`);
  const routes=['/','/praesentation','/organigramm','/charts','/prompt-compiler'];
  for(const path of routes){
    const response=await get(path);
    if(!response.headers.get('content-type')?.includes('text/html'))throw new Error(`${path}: expected HTML.`);
    const html=await response.text();
    if(!html.includes('id="main"'))throw new Error(`${path}: framework page content missing.`);
    const problems=securityHeaderProblems(response.headers);
    if(problems.length)throw new Error(`${path}: security headers: ${problems.join('; ')}.`);
    if(isImmutable(response.headers))throw new Error(`${path}: HTML must not be cached as immutable.`);
    if(path==='/charts'){
      const head=readHead(html),image=head.meta('og:image')[0],canonical=head.links('canonical');
      if(!image||new URL(image,base).protocol!=='https:')throw new Error('/charts: og:image missing.');
      if(canonical.length!==1||new URL(canonical[0],base).pathname!=='/charts')throw new Error(`/charts: canonical must point to /charts, found ${canonical.join(', ')||'none'}.`);
    }
  }
  const asset=await get(immutableAsset),cache=asset.headers.get('Cache-Control')??'';
  if(!isImmutable(asset.headers)||!/max-age=31536000\b/.test(cache))throw new Error(`${immutableAsset}: expected an immutable one-year Cache-Control, received «${cache||'none'}».`);
  const contract=await(await get('/contracts/engineering.md')).text();
  if(!contract.includes('Engineering'))throw new Error('Engineering contract missing.');
  return {commit,version,routes:routes.length};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const [baseUrl,commit]=process.argv.slice(2);
  const {version}=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
  const attempts=Number(process.env.VERIFY_ATTEMPTS??6),delay=Number(process.env.VERIFY_DELAY_MS??5000);
  if(!Number.isInteger(attempts)||attempts<1||!Number.isFinite(delay)||delay<0)throw new Error('Invalid verification schedule.');
  let failure;
  for(let attempt=1;attempt<=attempts;attempt++){
    try{
      const result=await verifyDeployment({baseUrl,commit,version});
      console.log(`Production verified: ${result.version}, commit ${result.commit}, ${result.routes} routes, security headers on every route, cache policy, sharing metadata and engineering contract.`);
      failure=undefined;break;
    }catch(error){
      failure=error;
      console.error(`Verification ${attempt}/${attempts}: ${error.message}`);
      if(attempt<attempts)await new Promise(resolve=>setTimeout(resolve,delay));
    }
  }
  if(failure)process.exitCode=1;
}
