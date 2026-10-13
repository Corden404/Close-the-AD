const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const test=require('node:test');
const assert=require('node:assert/strict');
const html=readFileSync(require('node:path').join(__dirname,'../关掉广告.html'),'utf8');
const source=html.split("<script>(()=>{'use strict';")[1].split('const chapters=')[0];
const context=vm.createContext({});
vm.runInContext(source+';globalThis.api={initialState,reduce};',context);
const {initialState,reduce}=context.api;
const act=(s,type,value)=>reduce(s,{type,value});
const stage=n=>act(initialState(),'stage.select',n);
test('notification permission survives return, back and closed tabs until explicit revoke',()=>{
 for(const navigation of ['browser.back','browser.return','browser.close']){
  let s=act(stage(1),'trap.permission');
  s=act(s,navigation);assert.equal(s.permissionSimulated,true,navigation);
  s=act(s,'browser.return');assert.equal(s.permissionSimulated,true);
  s=act(s,'permission.block');assert.equal(s.permissionSimulated,true,'block requires settings');
  s=act(s,'permission.settings');s=act(s,'permission.block');assert.equal(s.permissionSimulated,false);
 }
});
test('only genuine returns to the original task count as recoveries',()=>{
 let s=stage(1);
 for(const type of ['browser.back','browser.return','browser.return'])s=act(s,type);
 assert.equal(s.recoveries,0,'no-op returns');
 s=act(s,'pdf.open');s=act(s,'browser.back');assert.equal(s.recoveries,0,'PDF alone');
 s=act(s,'trap.download');s=act(s,'browser.return');assert.equal(s.recoveries,1);
 s=act(s,'browser.return');assert.equal(s.recoveries,1,'repeat return');
 s=act(s,'browser.close');s=act(s,'browser.return');assert.equal(s.recoveries,2,'reopen target');
 s=act(s,'trap.permission');s=act(s,'browser.back');assert.equal(s.recoveries,3,'obscuring notification');
 s=act(s,'browser.back');assert.equal(s.recoveries,3);
 let ads=act(stage(2),'browser.return');assert.equal(ads.recoveries,1);
 ads=act(ads,'browser.return');assert.equal(ads.recoveries,1);
});
test('history retains route and sponsor identity without business state snapshots',()=>{
 let s=stage(5);
 s={...s,cancelStep:'receipt',subscription:{...s.subscription,status:'cancelled',renewal:false,nextCharge:null}};
 s=act(s,'ad.visit','radio-banner');
 assert.deepEqual(JSON.parse(JSON.stringify(s.history)),[{route:'goal',sponsorId:null}]);
 assert.equal(s.sponsorId,'radio-banner');
 s=act(s,'browser.back');assert.equal(s.route,'goal');assert.equal(s.cancelStep,'receipt');
 assert.equal(s.subscription.status,'cancelled');assert.equal(s.subscription.renewal,false);
 let pdf=act(stage(1),'pdf.open');pdf=act(pdf,'trap.download');pdf=act(pdf,'browser.back');
 assert.equal(pdf.timetableOpen,true,'PDF survives detour');
 let inbox=act(stage(4),'notifications.settings');inbox=act(inbox,'notifications.block');inbox=act(inbox,'message.open');
 inbox=act(inbox,'ad.visit','inbox-banner');inbox=act(inbox,'browser.return');
 assert.equal(inbox.pushSettings,true);assert.equal(inbox.messageOpen,true);assert.equal(inbox.pushAllowed,false);
 const nested={...s,route:'sponsor',sponsorId:'radio-image',history:[{route:'goal',sponsorId:null},{route:'sponsor',sponsorId:'radio-banner'}]};
 const previous=act(nested,'browser.back');assert.equal(previous.sponsorId,'radio-banner');assert.equal(previous.route,'sponsor');
 assert.equal(previous.recoveries,nested.recoveries,'intermediate advertisement is not a recovery');
 const original=act(previous,'browser.return');assert.equal(original.sponsorId,null);assert.equal(original.history.length,0);
});
