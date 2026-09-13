import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium, expect } from '@playwright/test';
import { neon } from '../../../packages/console-fx/dist/presets/index.js';
const directory=new URL('./',import.meta.url);
const json=async name=>JSON.parse(await readFile(new URL(name,directory),'utf8'));
const deployment=await json('deployment-readback.json');
const publicMode=process.env.CONSOLE_FX_PUBLIC_CHECK==='1';
const base=publicMode?'https://console-fx-servroxs-projects.vercel.app':'https://'+deployment.url;
const first=await fetch(base,{redirect:'manual',signal:AbortSignal.timeout(30000)});
assert.equal(first.status,publicMode?200:302);
if(!publicMode)assert.equal(new URL(first.headers.get('location')).hostname,'vercel.com');
const browser=await chromium.connectOverCDP('http://127.0.0.1:9344');
let context;
const errors=[];const entries=[];const violations=[];const failed=[];
try {
 context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
 await context.addInitScript(()=>{window.ownedCspViolations=[];document.addEventListener('securitypolicyviolation',e=>window.ownedCspViolations.push(e.violatedDirective));});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',e=>{if(e.type()==='log')entries.push(e.text());});
 page.on('requestfailed',r=>{if(r.failure()?.errorText!=='net::ERR_ABORTED')failed.push({url:new URL(r.url()).pathname,error:r.failure()?.errorText});});
 if(!publicMode){
  const bypass=(await json('access-private.json')).protectionBypass;
  const key=Object.keys(bypass)[0];
  assert.equal(Object.keys(bypass).length,1);
  const access=new URL(base);access.searchParams.set('_vercel_share',key);
  await page.goto(access.href);
 }
 await page.goto(base);
 await expect(page.getByRole('heading',{level:1})).toContainText('Make your console');
 await expect(page.locator('.fine-print').filter({hasText:'Core 0.1.0 is available on npm'})).toBeVisible();
 const audit=await json('artifact.json');
 const headers=(await json('candidate/.vercel/output/config.json')).routes[0].headers;
 const verified=[];const protectedSources=[];
 for(const [path,sha] of Object.entries(audit.files)){
  if(!path.startsWith('.vercel/output/static/'))continue;
  const route='/'+path.slice('.vercel/output/static/'.length);
  const response=await context.request.get(base+route);
  if(response.status()===403&&route.endsWith('.js.map')){
   const bytes=Buffer.from((await json('source-map-content.json')).data,'base64');
   assert.equal(createHash('sha256').update(bytes).digest('hex'),sha);
   protectedSources.push({route,status:403,sha256:sha,verification:'authenticated Vercel file API'});continue;
  }
  assert.equal(response.status(),200,route);
  assert.equal(createHash('sha256').update(await response.body()).digest('hex'),sha,route);
  for(const [key,value] of Object.entries(headers))assert.equal(response.headers()[key.toLowerCase()],value,`${route}: ${key}`);
  if(route.startsWith('/_next/static/'))assert.match(response.headers()['cache-control'],/immutable/);
  verified.push({route,sha256:sha});
 }
 for(const route of ['/studio','/docs']){
  const response=await context.request.get(base+route,{maxRedirects:0});assert.equal(response.status(),308);assert.equal(response.headers().location,route+'/');
 }
 assert.equal((await context.request.get(base+'/missing-console-fx-release-check')).status(),404);
 const video=page.getByLabel('ConsoleFX usage walkthrough',{exact:true});
 await expect(video).toHaveJSProperty('paused',true);await expect(video).toHaveAttribute('preload','none');
 await video.scrollIntoViewIfNeeded();await video.focus();await page.keyboard.press('Space');
 await expect.poll(()=>video.evaluate(e=>e.currentTime)).toBeGreaterThan(0);
 const media=await video.evaluate(e=>({duration:e.duration,width:e.videoWidth,height:e.videoHeight,cues:e.textTracks[0]?.cues?.length,mode:e.textTracks[0]?.mode}));
 assert.equal(media.width,1440);assert.equal(media.height,960);assert.equal(media.cues,9);assert.equal(media.mode,'showing');assert(media.duration>44&&media.duration<46);
 await page.keyboard.press('Space');await expect(video).toHaveJSProperty('paused',true);
 await page.getByText('Read the walkthrough',{exact:true}).click();await expect(page.locator('.usage-transcript ol')).toContainText('Your previous scene remains available in Undo');
 const demo=page.locator('.quick-demo');
 await demo.getByRole('textbox',{name:'Your message'}).fill('Hosted 100% %c %s');assert.equal(entries.length,0);
 await demo.getByRole('button',{name:'Copy console.log',exact:true}).click();await expect(demo.getByRole('status')).toContainText('Copied');
 await demo.getByRole('button',{name:'Test in console',exact:true}).click();assert.equal(entries.length,1);
 violations.push(...await page.evaluate(()=>window.ownedCspViolations));
 await page.goto(base+'/studio/');
 const text=page.getByRole('textbox',{name:'Message text',exact:true});await text.fill('Keep this draft');
 const input=page.locator('input[type=file]');
 await input.setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{')});await expect(page.locator('.editor-status')).toContainText('unchanged');await expect(text).toHaveValue('Keep this draft');
 await input.setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(neon({text:'Imported preview'})))});await expect(text).toHaveValue('Imported preview');
 await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(text).toHaveValue('Keep this draft');
 const reset=page.getByRole('button',{name:'Reset',exact:true});await reset.click();await page.keyboard.press('Escape');await expect(reset).toBeFocused();await expect(text).toHaveValue('Keep this draft');
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem('console-fx:scene:v1'))).toContain('Keep this draft');await page.reload();await expect(text).toHaveValue('Keep this draft');
 await page.getByRole('button',{name:'Copy console.log',exact:true}).click();await expect.poll(()=>page.evaluate(()=>navigator.clipboard.readText())).toBe(await page.getByLabel('Generated code',{exact:true}).inputValue());
 await page.getByRole('combobox',{name:'Output renderer',exact:true}).selectOption('svg');await page.locator('.fit-section > summary').click();await page.getByRole('button',{name:'360px',exact:true}).click();await page.getByRole('button',{name:'Use this width for export',exact:true}).click();await page.getByRole('button',{name:'Measure local fonts for export',exact:true}).click();await expect(page.locator('.fit-inspector [role=status]')).toContainText('Local font data is ready',{timeout:15000});
 violations.push(...await page.evaluate(()=>window.ownedCspViolations));
 await page.goto(base+'/docs/');await expect(page.locator('#integration pre code').first()).toHaveText('pnpm add @servrox/console-fx@next');await expect(page.locator('#integration')).toContainText('React adapter publication is still pending');await expect(page.getByRole('heading',{level:1})).toContainText('Use ConsoleFX');violations.push(...await page.evaluate(()=>window.ownedCspViolations));
 await page.setViewportSize({width:390,height:844});await page.goto(base);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await expect(video).toBeVisible();
 violations.push(...await page.evaluate(()=>window.ownedCspViolations));
 assert.deepEqual(violations,[]);assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.equal(entries.length,1);
 const result={at:new Date().toISOString(),stage:'deployed/production',status:'verified',owner:'ConsoleFX release verification',artifactFingerprint:audit.studioFingerprint,sourceCommit:audit.sourceCommit,harnessSha256:createHash('sha256').update(await readFile(new URL('verify-hosted.mjs',directory))).digest('hex'),deployment:deployment.id,url:base,target:publicMode?'public production':'authenticated staging',browser:browser.version(),files:verified,protectedSources,securityHeadersMatch:true,routes:true,video:media,journeys:['landing edit/copy/test once','video playback/captions/transcript','invalid import preserves draft','valid import/undo','reset cancellation/focus return','draft reload','complete clipboard export','font worker measurements','docs core install and React pending status','390px reflow'],cspViolations:violations,pageErrors:errors,failedRequests:failed};
 await writeFile(new URL(publicMode?'public-verification.json':'hosted-verification.json',directory),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({status:'passed',target:result.target,staticFiles:verified.length,protectedSources:protectedSources.length,videoDuration:media.duration,journeys:result.journeys.length,cspViolations:0,pageErrors:0}));
}finally{try{await context?.close();}finally{await browser.close();}}
