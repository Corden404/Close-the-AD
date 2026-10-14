// DOM adapter checks the render contract, not browser layout or accessibility.
const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const test=require('node:test');
const assert=require('node:assert/strict');
const html=readFileSync(require('node:path').join(__dirname,'../关掉广告.html'),'utf8');
function harness(){
 let markup='',world,active=null,lastScrolled=null;
 const element=key=>({dataset:{focus:key},scrollTop:0,scrollLeft:0,focus(){active=this;},getClientRects:()=>[{}],scrollIntoView(){lastScrolled=key;}});
 const app={set innerHTML(value){markup=value;world=element('world');},get innerHTML(){return markup;},querySelector(selector){const key=selector.match(/data-focus="([^"]+)"/)?.[1];return key&&markup.includes(`data-focus="${key}"`)?element(key):null;}};
 const dialog={open:false,addEventListener(){},close(){this.open=false;},showModal(){this.open=true;}};
 const document={get activeElement(){return active;},documentElement:{dataset:{}},getElementById(id){return {app,dialog,world,announcer:{}}[id]||null;},querySelector:()=>element('container'),addEventListener(){}};
 const window={scrollX:0,scrollY:0,scrollTo(x,y){this.scrollX=x;this.scrollY=y;}};
 const c=vm.createContext({document,window});
 const js=html.match(/<script>([\s\S]*)<\/script>/)[1].replace('})();','globalThis.api={dispatch,handleAction};})();');
 vm.runInContext(js,c);
 return {act(type){c.api.handleAction(type,element(type));},dispatch:c.api.dispatch,get focus(){return active?.dataset.focus;},get scrolled(){return lastScrolled;},get world(){return world;},window};
}
test('new route starts at top; back restores world/document position and exact origin',()=>{
 const h=harness();h.dispatch('stage.select',1);
 h.world.scrollTop=333;h.window.scrollTo(0,444);
 h.act('trap.download');assert.equal(h.world.scrollTop,0);assert.equal(h.window.scrollY,0);
 h.world.scrollTop=12;h.window.scrollTo(0,55);
 h.act('browser.back');assert.equal(h.world.scrollTop,333);assert.equal(h.window.scrollY,444);assert.equal(h.focus,'trap.download');
});
test('expanded original content receives focus and is scrolled into view',()=>{
 for(const [stage,action,focus] of [[0,'recipe.expand','content:recipe'],[3,'lesson.play','content:lesson'],[4,'message.open','content:message']]){
  const h=harness();h.dispatch('stage.select',stage);h.act(action);
  assert.equal(h.focus,focus);assert.equal(h.scrolled,focus);
 }
});
test('new attempt clears old reading positions',()=>{
 const h=harness();h.dispatch('stage.select',1);h.world.scrollTop=100;h.window.scrollTo(0,200);
 h.act('trap.download');h.dispatch('retry');assert.equal(h.world.scrollTop,0);assert.equal(h.window.scrollY,0);
});
