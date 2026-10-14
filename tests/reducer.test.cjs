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
