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
