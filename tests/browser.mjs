import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {mkdir} from 'node:fs/promises';
import {existsSync} from 'node:fs';
const executablePath=process.env.CHROMIUM_EXECUTABLE||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
const browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
await context.addInitScript(()=>{window.__unsafe=[];for(const key of ['open','fetch'])window[key]=()=>{window.__unsafe.push(key);throw Error('Forbidden '+key);};if(window.Notification)Notification.requestPermission=()=>{window.__unsafe.push('permission');throw Error('Forbidden permission');};});
const page=await context.newPage(),errors=[],network=[];let downloads=0,popups=0;
page.on('pageerror',e=>errors.push(e.message));page.on('download',()=>downloads++);page.on('popup',()=>popups++);
page.on('request',r=>{if(!r.url().startsWith('file:')&&!r.url().startsWith('data:')&&!(process.env.GAME_URL&&r.url().startsWith(new URL(process.env.GAME_URL).origin)))network.push(r.url());});
const control=action=>page.locator(`[data-action="${action}"]:visible`).first();
const click=async(action)=>control(action).click();
const checkLayout=async(width,label)=>{
 await page.setViewportSize({width,height:1000});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${label}: outer overflow at ${width}`);
 const world=page.locator('#world');if(await world.count())assert.equal(await world.evaluate(e=>e.scrollWidth>e.clientWidth+1),false,`${label}: scene overflow`);
 assert.deepEqual(await page.locator('button:visible').evaluateAll(nodes=>nodes.filter(e=>e.getBoundingClientRect().height<43.5||e.getBoundingClientRect().width<43.5).map(e=>e.dataset.focus)),[],`${label}: touch targets`);
 await page.screenshot({path:`artifacts/v4-${width}-${label}.png`,fullPage:true});
};
const reset=async()=>{await click('menu.open');await click('restart');await click('restart.confirm');};
async function play(width){
 await page.setViewportSize({width,height:1000});await checkLayout(width,'00-selection');
 assert.equal(await page.locator('.chapter-card').count(),9);
 for(let stage=0;stage<9;stage++){
  await click(`stage.select.${stage}`);
  assert.equal(await page.locator('.sidebar,.game-header,.chapter-menu').count(),0);
  await checkLayout(width,`stage-${stage+1}-entry`);
  await click('goal.show');await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.focus),'toolbar:goal');
  if(stage>=2){
   const prefix=['','','ticket','lesson','inbox','radio','service','job','travel'][stage];
   assert.equal(await page.locator('.campaign-ad').count(),stage>=6?6:3);
   await click(`ad.fakeclose.${prefix}-float`);assert.equal(await page.locator('.campaign-overlays .campaign-ad').count(),2);
   await checkLayout(width,`stage-${stage+1}-stack`);
   await click(`ad.close.${prefix}-followup`);await click(`ad.close.${prefix}-float`);
   assert.equal(await page.locator('.campaign-overlays .campaign-ad').count(),0);
   await click(`ad.visit.${prefix}-banner`);assert.equal(await page.locator('.sponsor-page').count(),1);await click('browser.return');
  }else await click('browser.return');
  if(stage===0){
   await click('recipe.expand');await page.locator('#temperature').fill('200');
   await click('menu.open');await click('menu.resume');assert.equal(await page.locator('#temperature').inputValue(),'200');
   await click('browser.menu');await click('pause');await page.keyboard.press('Escape');
   await click('recipe.submit');
  }
  if(stage===1){await click('trap.download');await click('browser.return');await click('pdf.open');await checkLayout(width,'pdf');await click('pdf.save');}
  if(stage===2){
   await click('inspect.toggle');await page.locator('.extra-row').first().click();await page.keyboard.press('Escape');
   assert.equal(await page.evaluate(()=>document.activeElement.dataset.focus),'extra:insurance');await click('inspect.toggle');
   await page.locator('[data-extra="insurance"]').uncheck();await page.locator('[data-extra="fast"]').uncheck();await click('trial.remove');await click('trial.cancel');await click('checkout.review');await click('checkout.pay');
  }
  if(stage===3){await click('trap.update');await click('browser.return');await click('lesson.play');await click('lesson.answer.node');}
  if(stage===4){for(const id of [0,1,2])await click(`notifications.dismiss.${id}`);await click('notifications.refresh');assert.equal(await page.locator('.push-card').count(),3);await click('notifications.settings');await click('notifications.block');await click('message.open');await click('message.ack');}
  if(stage===5){for(const a of ['subscription.manage','cancellation.start','trap.pause','subscription.manage','cancellation.start','cancellation.continue','cancellation.confirm'])await click(a);await click('browser.close');await click('browser.return');assert.match(await page.locator('#world').innerText(),/下次扣费\s*无/);await click('cancellation.verify');}
  if(stage===6){
   await click('service.partner');await click('advanced.lead');await click('advanced.lead');await checkLayout(width,'service-detour');await click('browser.return');
   for(const a of ['service.official','service.slot.sun-am','service.review','service.submit'])await click(a);
   assert.equal(await page.locator('.advanced-receipt').count(),0);
   for(const a of ['service.slot.sat-am','service.speed','service.review','service.submit'])await click(a);
   await checkLayout(width,'service-receipt');await click('service.verify');
  }
  if(stage===7){
   for(const a of ['job.open.training','job.contact','job.referral','job.review','job.submit'])await click(a);
   assert.equal(await page.locator('.advanced-receipt').count(),0);
   for(const a of ['job.search','job.open.qinghe','job.review','job.submit'])await click(a);
   await checkLayout(width,'job-receipt');await click('job.verify');
  }
  if(stage===8){
   for(const a of ['travel.open.cheap','travel.extra.insurance','travel.extra.shuttle','travel.extra.club','travel.review','travel.submit'])await click(a);
   assert.equal(await page.locator('.advanced-receipt').count(),0);
   for(const a of ['travel.search','travel.open.river','travel.review','travel.submit'])await click(a);
   await checkLayout(width,'travel-receipt');await click('travel.verify');
  }
  assert.equal(await page.locator('.debrief').count(),1);
  if(stage<8)await click('menu.open');
 }
 await click('next');assert.equal(await page.locator('.complete .final-receipts>div').count(),9);await checkLayout(width,'all-complete');
 await reset();
}
await mkdir('artifacts',{recursive:true});
try{
 await page.goto(process.env.GAME_URL||pathToFileURL(resolve('dist/index.html')).href);
 for(const width of [1440,320,360,390,768])await play(width);
 await click('stage.select.8');await click('browser.return');for(const a of ['travel.open.river','travel.extra.insurance','travel.extra.shuttle','travel.extra.club','travel.review','travel.submit','travel.verify','next'])await click(a);
 assert.equal(await page.locator('.chapter-menu').count(),1);assert.equal(await page.locator('.chapter-card.is-complete').count(),1);
 await click('stage.select.3');await click('browser.menu');await click('retry');await click('retry.confirm');assert.equal(await page.locator('.lesson-site').count(),1);
 assert.deepEqual(errors,[]);assert.deepEqual(network,[]);assert.equal(downloads,0);assert.equal(popups,0);assert.deepEqual(await page.evaluate(()=>window.__unsafe),[]);
 console.log('PASS: selection/resume/retry; all nine independent chapters at 1440/320/360/390/768; bounded ad layers/close order; exact focus; truthful completion; no network/downloads/popups/permissions.');
}finally{await browser.close();}
