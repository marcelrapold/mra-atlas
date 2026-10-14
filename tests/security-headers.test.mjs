import test from 'node:test';
import assert from 'node:assert/strict';
import {requiredSecurityHeaders,securityHeaderProblems} from '../scripts/verify-deployment.mjs';
import {headersFor,loadVercelConfig,sourcePattern} from '../scripts/checks/vercel-headers.mjs';

const config=await loadVercelConfig();
const csp=path=>new Map(headersFor(config,path).get('Content-Security-Policy').split(';').map(d=>d.trim().split(/\s+/)).map(([name,...sources])=>[name,sources]));
const routes=['/','/charts','/mermaid','/praesentation','/404','/llms.txt','/contracts/engineering.md','/brands/rapold/decks/muster-deck.pptx','/vendor/echarts-6.0.0.min.js','/.well-known/security.txt'];

test('every response carries the shared security header baseline',()=>{
 for(const path of routes)assert.deepEqual(securityHeaderProblems(headersFor(config,path)),[],path);
});
test('the content security policy locks plugins, base, framing and forms and never allows eval',()=>{
 const policy=csp('/');
 assert.deepEqual(policy.get('object-src'),["'none'"]);
 assert.deepEqual(policy.get('base-uri'),["'self'"]);
 assert.deepEqual(policy.get('frame-ancestors'),["'self'"]);
 assert.deepEqual(policy.get('form-action'),["'self'"]);
 assert.deepEqual(policy.get('default-src'),["'self'"]);
 assert.ok(policy.has('upgrade-insecure-requests'));
 for(const [name,sources] of policy){
  assert.ok(!sources.includes("'unsafe-eval'"),`${name} must not allow eval`);
  assert.ok(!sources.some(s=>s==='*'||/^https?:$/.test(s)||/^https?:\/\//.test(s)),`${name} must stay same-origin`);
 }
 // A nonce would need a server; the static export keeps inline bootstrap scripts.
 assert.deepEqual(policy.get('script-src'),["'self'","'unsafe-inline'"]);
});
test('the baseline list rejects weakened headers instead of only checking presence',()=>{
 const strong=headersFor(config,'/');
 const weaken=(name,value)=>{const h=new Headers(strong);h.set(name,value);return securityHeaderProblems(h);};
 assert.match(weaken('Content-Security-Policy',strong.get('Content-Security-Policy').replace("script-src 'self'","script-src 'self' 'unsafe-eval'")).join(),/unsafe-eval/);
 assert.match(weaken('Content-Security-Policy',strong.get('Content-Security-Policy').replace("object-src 'none'","object-src 'self'")).join(),/object-src/);
 assert.match(weaken('Strict-Transport-Security','max-age=63072000').join(),/includeSubDomains/);
 assert.match(weaken('Permissions-Policy','camera=(), microphone=*').join(),/microphone/);
 const missing=new Headers(strong);missing.delete('Content-Security-Policy');
 assert.deepEqual(securityHeaderProblems(missing),['Content-Security-Policy missing']);
 assert.deepEqual(requiredSecurityHeaders.map(h=>h.name).sort(),['Content-Security-Policy','Cross-Origin-Opener-Policy','Permissions-Policy','Referrer-Policy','Strict-Transport-Security','X-Content-Type-Options','X-Frame-Options']);
});
test('agents find the machine-readable entry point from any response',()=>{
 assert.equal(headersFor(config,'/charts').get('Link'),'</llms.txt>; rel="describedby"; type="text/plain"');
});
test('only fingerprinted or versioned files are cached as immutable',()=>{
 const cache=path=>headersFor(config,path).get('Cache-Control');
 assert.equal(cache('/vendor/echarts-6.0.0.min.js'),'public, max-age=31536000, immutable');
 assert.equal(cache('/_next/static/chunks/main.js'),'public, max-age=31536000, immutable');
 for(const path of ['/brands/rapold/assets/fonts/geist.woff2','/icons/arrow-up-right.svg'])assert.equal(cache(path),'public, max-age=86400, stale-while-revalidate=604800',path);
 // HTML, contracts and decks change with every release: no rule may extend the
 // platform default «public, max-age=0, must-revalidate».
 for(const path of ['/','/charts','/llms.txt','/contracts/engineering.md','/brands/rapold/brand.json','/brands/rapold/decks/muster-deck.pptx','/praesentation/deck-input.schema.json','/build-info.json'])assert.equal(cache(path),null,path);
});
test('contracts stay readable cross-origin for agents and tools',()=>{
 assert.equal(headersFor(config,'/contracts/brand.schema.json').get('Access-Control-Allow-Origin'),'*');
});
test('the header resolver refuses route syntax it cannot evaluate',()=>{
 assert.ok(sourcePattern('/vendor/(.*)').test('/vendor/a.js'));
 assert.ok(!sourcePattern('/vendor/(.*)').test('/vendorx/a.js'));
 assert.throws(()=>sourcePattern('/:path*'),/Unsupported/);
 for(const rule of config.headers)assert.doesNotThrow(()=>sourcePattern(rule.source),rule.source);
});
