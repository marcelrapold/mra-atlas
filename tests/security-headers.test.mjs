import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {directives,requiredSecurityHeaders,securityHeaderProblems} from '../scripts/verify-deployment.mjs';
import {securityTxtProblems} from '../scripts/checks/web-metadata.mjs';
import {headersFor,loadVercelConfig,sourcePattern} from '../scripts/checks/vercel-headers.mjs';

const config=await loadVercelConfig();
const csp=path=>directives(headersFor(config,path).get('Content-Security-Policy'));
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
 // Unversioned files next to the vendor bundle (README, licence notices) change in
 // place, so they must not inherit the bundle's year-long immutable caching either.
 for(const path of ['/','/charts','/llms.txt','/contracts/engineering.md','/brands/rapold/brand.json','/brands/rapold/decks/muster-deck.pptx','/praesentation/deck-input.schema.json','/build-info.json','/vendor/README.md','/vendor/echarts-LICENSE.txt','/vendor/echarts-NOTICE.txt'])assert.equal(cache(path),null,path);
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
test('security.txt names a contact and expires within the coming year',async()=>{
 const source=await readFile(new URL('../apps/docs/public/.well-known/security.txt',import.meta.url),'utf8');
 // Fails `npm run check` once the file is stale, so the expiry cannot go unnoticed.
 assert.deepEqual(securityTxtProblems(source),[]);
 const now=Date.parse('2026-10-14T00:00:00Z'),file=(...lines)=>[...lines,'Canonical: https://atlas.rapold.io/.well-known/security.txt'].join('\n');
 assert.deepEqual(securityTxtProblems(file('Contact: mailto:security@example.org','Contact: https://example.org/report','Expires: 2027-01-01T00:00:00Z'),now),[]);
 assert.match(securityTxtProblems(file('Contact: https://example.org/report','Expires: 2026-10-13T00:00:00Z'),now).join(),/not in the future/);
 assert.match(securityTxtProblems(file('Contact: https://example.org/report','Expires: 2028-01-01T00:00:00Z'),now).join(),/at most one year/);
 assert.match(securityTxtProblems(file('Contact: http://example.org/report','Expires: 2027-01-01T00:00:00Z'),now).join(),/https or mailto/);
 assert.match(securityTxtProblems(file('Expires: 2027-01-01T00:00:00Z'),now).join(),/Contact missing/);
});
