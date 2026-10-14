const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const test=require('node:test');
const assert=require('node:assert/strict');
const html=readFileSync(require('node:path').join(__dirname,'../关掉广告.html'),'utf8');
function harness(){
 const dialog={open:false,close(){this.open=false;},showModal(){this.open=true;},addEventListener(){}};
 const document={activeElement:null,documentElement:{dataset:{}},getElementById:id=>id==='dialog'?dialog:{focus(){}},querySelector:()=>({scrollIntoView(){}}),addEventListener(){}};
 const c=vm.createContext({document});
 const js=html.match(/<script>([\s\S]*)<\/script>/)[1].replace(/render\(\);\s*\}\)\(\);$/,`render=(key)=>{globalThis.returnedFocus=key; actionFocus=null;};globalThis.api={handleAction,closeDialog,dispatch,getState:()=>state};})();`);
 vm.runInContext(js,c);return c;
}
for(const action of ['retry','pause','motion'])test(`menu → ${action} → dismiss retains original toolbar identity`,()=>{
 const c=harness();c.api.dispatch('stage.select',1);
 c.api.handleAction('browser.menu',{dataset:{focus:'toolbar:menu'}});
 c.api.handleAction(action,{dataset:{focus:action}});
 c.api.closeDialog();assert.equal(c.returnedFocus,'toolbar:menu');
 assert.equal(c.api.getState().paused,false);
});
test('result retry keeps its own return identity',()=>{
 const c=harness();c.api.handleAction('retry',{dataset:{focus:'result:retry'}});
 c.api.closeDialog();assert.equal(c.returnedFocus,'result:retry');
});
