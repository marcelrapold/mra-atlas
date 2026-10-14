import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyDeployment} from '../scripts/verify-deployment.mjs';
import {headersFor,loadVercelConfig} from '../scripts/checks/vercel-headers.mjs';

const commit='0123456789abcdef0123456789abcdef01234567';
const config={baseUrl:'https://design.example',commit,version:'0.4.0'};
const vercel=await loadVercelConfig();
const share='<meta property="og:image" content="https://design.example/og.png"/><link rel="canonical" href="https://design.example/charts"/>';
// The fake edge answers with the headers vercel.json assigns, so the test also
// proves that the committed configuration satisfies the live assertions.
function site({buildCommit=commit,routeStatus=200,html='<main id="main">Framework</main>',head=share,drop=[]}={}){
  return async url=>{
    if(url.pathname==='/build-info.json')return Response.json({commit:buildCommit,version:'0.4.0'});
    if(url.pathname==='/contracts/engineering.md')return new Response('# Engineering');
    const headers=headersFor(vercel,url.pathname);
    for(const name of drop)headers.delete(name);
    headers.set('Content-Type','text/html');
    return new Response(`<html><head>${url.pathname==='/charts'?head:''}</head><body>${html}</body></html>`,{status:routeStatus,headers});
  };
}
test('deployment verification accepts the requested release and all public routes',async()=>{
  assert.deepEqual(await verifyDeployment({...config,fetcher:site()}),{commit,version:'0.4.0',routes:5});
});
test('a stale deployment cannot pass even when every route returns HTTP 200',async()=>{
  await assert.rejects(verifyDeployment({...config,fetcher:site({buildCommit:'f'.repeat(40)})}),/build mismatch/);
});
test('broken routes and login or fallback pages cannot report a successful rollout',async()=>{
  await assert.rejects(verifyDeployment({...config,fetcher:site({routeStatus:404})}),/HTTP 404/);
  await assert.rejects(verifyDeployment({...config,fetcher:site({html:'<h1>Sign in</h1>'})}),/content missing/);
});
test('a deployment without the security header baseline is rejected',async()=>{
  await assert.rejects(verifyDeployment({...config,fetcher:site({drop:['Content-Security-Policy']})}),/Content-Security-Policy missing/);
  await assert.rejects(verifyDeployment({...config,fetcher:site({drop:['Strict-Transport-Security','X-Frame-Options']})}),/Strict-Transport-Security missing; X-Frame-Options missing/);
});
test('sharing metadata on a reference page is part of the rollout check',async()=>{
  await assert.rejects(verifyDeployment({...config,fetcher:site({head:'<link rel="canonical" href="https://design.example/charts"/>'})}),/og:image missing/);
  await assert.rejects(verifyDeployment({...config,fetcher:site({head:'<meta property="og:image" content="https://design.example/og.png"/><link rel="canonical" href="https://design.example/"/>'})}),/canonical must point to \/charts/);
});
