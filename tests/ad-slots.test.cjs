const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const test=require('node:test');
const assert=require('node:assert/strict');
const html=readFileSync(require('node:path').join(__dirname,'../关掉广告.html'),'utf8');
function pages(){
 const document={getElementById:()=>({addEventListener(){}}),addEventListener(){}};
 const c=vm.createContext({document});
 vm.runInContext(html.match(/<script>([\s\S]*)<\/script>/)[1].replace(/render\(\);\s*\}\)\(\);$/,`globalThis.api={page(n){state=enterStage(initialState(),n);return [checkout,()=>lessonScene(state,ib),()=>notificationScene(state,ib),()=>subscriptionScene(state,ib)][n-2]();},decoratePage};})();`),c);
 return c.api;
}
test('all four later templates declare banner and image slots exactly once',()=>{
 const api=pages();
 for(let stage=2;stage<6;stage++){
  const page=api.page(stage);
  for(const slot of ['banner','image'])assert.equal(page.split(`<!-- ad-slot:${slot} -->`).length,2,`${stage}: ${slot}`);
  const decorated=api.decoratePage(page);
  assert.equal(decorated.includes('<!-- ad-slot:'),false);
  const prefix=['ticket','lesson','inbox','radio'][stage-2];
  assert.equal(decorated.split(`data-ad-id="${prefix}-banner"`).length,2);
  assert.equal(decorated.split(`data-ad-id="${prefix}-image"`).length,2);
 }
});
test('ad placement is tied to markers, not unrelated nested div positions',()=>{
 const api=pages();api.page(2);
 const output=api.decoratePage('<div><div>Nested masthead</div></div><section><!-- ad-slot:banner --></section><article><!-- ad-slot:image --></article><div>Footer</div>');
 assert.match(output,/<section><aside[^>]+data-ad-id="ticket-banner"/);
 assert.match(output,/<article><aside[^>]+data-ad-id="ticket-image"/);
});
test('root tokens and reduced-motion rule groups are consolidated',()=>{
 const css=html.match(/<style>([\s\S]*?)<\/style>/)[1];
 assert.equal((css.match(/:root\{/g)||[]).length,1);
 assert.equal((css.match(/@media\(prefers-reduced-motion:reduce\)/g)||[]).length,1);
 assert.match(css, /--ink:#242a35/);assert.match(css,/--muted:#53604f/);
 assert.match(css,/html\[data-reduced=true\] \.real-play:active\{transform:translateX\(-50%\)\}/);
});
