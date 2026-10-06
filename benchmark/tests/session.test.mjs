import test from 'node:test';
import assert from 'node:assert/strict';
let session={};try{session=await import('../session.mjs');}catch(error){if(error.code!=='ERR_MODULE_NOT_FOUND')throw error;}
function fakePage(preflight={ok:true,point:{x:10,y:20}}){const calls=[];return {calls,evaluate:async(fn,arg)=>{const source=String(fn);calls.push(['evaluate',arg]);if(source.includes('preflight'))return preflight;},mouse:{click:async(...a)=>calls.push(['click',...a]),move:async(...a)=>calls.push(['move',...a]),wheel:async(...a)=>calls.push(['wheel',...a])},keyboard:{press:async(...a)=>calls.push(['press',...a]),insertText:async(...a)=>calls.push(['insertText',...a])}};}
const observation={snapshot_id:'s1',candidates:[{id:'a',operations:['click']},{id:'b',operations:['fill']},{id:'c',operations:['scroll']}]};
test('exports browser-native action executor',()=>assert.equal(typeof session.performAction,'function'));
test('click uses only preflight coordinates and native mouse',async()=>{const page=fakePage();const result=await session.performAction(page,{snapshot_id:'s1',action:'click',target_id:'a'},observation);assert.equal(result.ok,true);assert.deepEqual(page.calls.find(c=>c[0]==='click'),['click',10,20]);assert.equal(page.calls.filter(c=>c[0]==='click').length,1);});
test('fill selects the visible input and types text rather than changing DOM',async()=>{const page=fakePage();await session.performAction(page,{snapshot_id:'s1',action:'fill',target_id:'b',value:'200'},observation);assert.deepEqual(page.calls.filter(c=>['click','press','insertText'].includes(c[0])),[['click',10,20],['press','ControlOrMeta+A'],['insertText','200']]);});
test('scroll wheels over the chosen scroll region',async()=>{const page=fakePage();await session.performAction(page,{snapshot_id:'s1',action:'scroll',target_id:'c',delta_y:-500},observation);assert.deepEqual(page.calls.filter(c=>['move','wheel'].includes(c[0])),[['move',10,20],['wheel',0,-500]]);});
test('stale and forged actions cannot send input events',async()=>{for(const mode of ['protocol','dom']){const page=fakePage({ok:false,error:'stale_snapshot'});const result=await session.performAction(page,{snapshot_id:mode==='protocol'?'old':'s1',action:'click',target_id:'a'},observation);assert.equal(result.error,'stale_snapshot');assert.ok(!page.calls.some(c=>['click','press','wheel'].includes(c[0])));}});
test('preflight points must be finite coordinates',async()=>{const page=fakePage({ok:true,point:{x:NaN,y:2}});const result=await session.performAction(page,{snapshot_id:'s1',action:'click',target_id:'a'},observation);assert.equal(result.error,'not_actionable');assert.ok(!page.calls.some(c=>c[0]==='click'));});
test('configuration rejects unbounded runs and invalid modes',()=>{assert.equal(session.validateConfig({seed:'42'}).maxSteps,100);for(const input of [{stage:9},{ads:'remote'},{inspection:'yes'},{maxSteps:0},{maxSteps:Infinity},{seed:42},{viewport:{width:1,height:900}}])assert.throws(()=>session.validateConfig(input));});
function fakeSession(){let count=0;return {metadata:{config:{maxSteps:3}},observe:async()=>({...observation,task:'完成任务'}),act:async()=>{count++;return {ok:true};},evaluate:async()=>({success:count>=2,page_errors:[],mistakes:0}),close:async()=>{}};}
test('episode sends only public data to agent and terminates on evaluator success',async()=>{const trace=[],seen=[];const result=await session.runEpisode(fakeSession(),async packet=>{seen.push(packet);assert.ok(!JSON.stringify(packet).includes('mistakes'));return {snapshot_id:'s1',action:'click',target_id:'a'};},{trace:event=>trace.push(event)});assert.equal(result.success,true);assert.equal(result.attempts,2);assert.equal(result.input_tokens,null);assert.equal(seen.length,2);assert.equal(trace.at(-1).type,'result');});
test('step budget, EOF, format failures and optional usage remain distinct',async()=>{const fs=fakeSession();fs.act=async()=>({ok:false,error:'invalid_action'});const budget=await session.runEpisode(fs,async()=>({action:{snapshot_id:'s1',action:'click',target_id:'a'},usage:{input_tokens:10,output_tokens:4}}));assert.equal(budget.reason,'step_budget');assert.equal(budget.invalid_actions,3);assert.equal(budget.input_tokens,30);const eof=await session.runEpisode(fakeSession(),async()=>null);assert.equal(eof.reason,'agent_closed');assert.equal(eof.attempts,0);});
test('trace records explicit agent metadata without forwarding it as webpage content',async()=>{const records=[];await session.runEpisode(fakeSession(),async packet=>{assert.ok(!Object.hasOwn(packet,'agent_metadata'));return null;},{agentMetadata:{kind:'mock',policy:'random'},trace:record=>records.push(record)});assert.deepEqual(records[0].agent_metadata,{kind:'mock',policy:'random'});});
test('runtime provenance pins adapter sources and installed versions',async()=>{const meta=await session.runtimeMetadata();assert.match(meta.adapter_sha256,/^[a-f0-9]{64}$/);assert.equal(meta.node,process.version);assert.match(meta.playwright,/^\d+\.\d+\.\d+$/);});
test('browser launch uses bundled Chromium unless an explicit executable is selected',()=>{assert.equal(Object.hasOwn(session.browserLaunchOptions(),'executablePath'),false);assert.equal(session.browserLaunchOptions('/custom/chromium').executablePath,'/custom/chromium');});
test('token totals remain unknown when any agent call omits a usage field',async()=>{let count=0;const action={snapshot_id:'s1',action:'click',target_id:'a'};const partial=await session.runEpisode(fakeSession(),async()=>++count===1?{action,usage:{input_tokens:10,output_tokens:2}}:{action,usage:{input_tokens:20}});assert.equal(partial.input_tokens,30);assert.equal(partial.output_tokens,null);count=0;const absent=await session.runEpisode(fakeSession(),async()=>++count===1?action:{action,usage:{input_tokens:10,output_tokens:2}});assert.equal(absent.input_tokens,null);assert.equal(absent.output_tokens,null);});

const clickAction={snapshot_id:'s1',action:'click',target_id:'a'};
const secretFailure=()=>Object.assign(new Error('secret-token-do-not-publish'),{code:'secret-code-do-not-publish'});
for(const failure of ['preflight','click','frame','invalidate','click-and-invalidate'])test(`executor contains ${failure} rejection as a sanitized execution_error`,async()=>{
  const page=fakePage(),evaluate=page.evaluate,click=page.mouse.click;let invalidations=0;
  page.evaluate=async(fn,arg)=>{
    const source=String(fn);if(source.includes('invalidate'))invalidations++;
    if((failure==='preflight'&&source.includes('preflight'))||(failure==='frame'&&source.includes('requestAnimationFrame'))||(failure.includes('invalidate')&&source.includes('invalidate')))throw secretFailure();
    return evaluate(fn,arg);
  };
  page.mouse.click=async(...args)=>{await click(...args);if(failure.startsWith('click'))throw secretFailure();};
  const result=await session.performAction(page,clickAction,observation);
  assert.deepEqual(result,{ok:false,error:'execution_error'});
  assert.doesNotMatch(JSON.stringify(result),/secret|stack/);
  assert.equal(invalidations,failure==='preflight'?0:1);
  if(failure==='preflight')assert.ok(!page.calls.some(([kind])=>['click','press','insertText','move','wheel'].includes(kind)));
});
test('agent rejection returns a terminal sanitized result and accounts for failed-call latency',async()=>{
  const trace=[],fs=fakeSession();let calls=0;
  const result=await session.runEpisode(fs,async()=>{calls++;await new Promise(resolve=>setTimeout(resolve,5));throw secretFailure();},{trace:event=>trace.push(event)});
  assert.equal(calls,1);assert.equal(result.reason,'agent_error');assert.equal(result.error,'agent_callback_failed');
  assert.equal(result.success,false);assert.equal(result.zero_mistake_success,false);assert.equal(result.attempts,0);
  assert.equal(result.input_tokens,null);assert.equal(result.output_tokens,null);assert.ok(result.agent_latency_ms>0);assert.ok(result.elapsed_ms>=result.agent_latency_ms);
  assert.deepEqual(trace.at(-1),result);assert.doesNotMatch(JSON.stringify(trace),/secret-token|secret-code|Error:|stack/);
});
test('agent rejection invalidates previously partial token totals',async()=>{
  let calls=0;const result=await session.runEpisode(fakeSession(),async()=>{
    if(++calls===1)return {action:clickAction,usage:{input_tokens:10,output_tokens:2}};
    throw secretFailure();
  });
  assert.equal(result.reason,'agent_error');assert.equal(result.attempts,1);assert.equal(result.executed_actions,1);
  assert.equal(result.input_tokens,null);assert.equal(result.output_tokens,null);
});
for(const operation of ['observe','evaluate','act'])test(`thrown ${operation} produces browser_error instead of escaping or using successful state`,async()=>{
  const fs=fakeSession(),trace=[];let failed=false;
  fs.evaluate=async()=>({success:failed,zero_mistake_success:failed,page_errors:[],mistakes:0,recoveries:0,inspected_controls:0});
  fs[operation]=async()=>{failed=true;throw secretFailure();};
  const result=await session.runEpisode(fs,async()=>clickAction,{trace:event=>trace.push(event)});
  assert.equal(result.reason,'browser_error');assert.equal(result.error,`${operation}_failed`);
  assert.equal(result.success,false);assert.equal(result.zero_mistake_success,false);assert.deepEqual(trace.at(-1),result);
  assert.doesNotMatch(JSON.stringify(trace),/secret-token|secret-code|Error:|stack/);
  if(operation==='evaluate'){
    assert.equal(result.evaluation_available,false);
    for(const key of ['mistakes','recoveries','inspected_controls','page_errors','blocked_requests','unexpected_pages','downloads'])assert.equal(result[key],null,key);
  }else assert.equal(result.evaluation_available,true);
});
test('final evaluation failure does not reuse the earlier verdict or invent counters',async()=>{
  const fs=fakeSession();let evaluations=0;
  fs.evaluate=async()=>{if(++evaluations>1)throw secretFailure();return {success:false,page_errors:[],mistakes:3};};
  const result=await session.runEpisode(fs,async()=>clickAction,{maxSteps:1});
  assert.equal(result.reason,'browser_error');assert.equal(result.evaluation_available,false);
  assert.equal(result.success,false);assert.equal(result.zero_mistake_success,false);assert.equal(result.mistakes,null);
  assert.equal(result.attempts,1);assert.equal(result.executed_actions,1);
});
for(const moment of ['before first action','after final action'])test(`page_error overrides successful game state ${moment}`,async()=>{
  const fs=fakeSession();let actions=0,agentCalls=0;
  fs.act=async()=>{actions++;return {ok:true};};
  fs.evaluate=async()=>{const completed=moment==='before first action'||actions===1;return {success:completed,zero_mistake_success:completed,page_errors:completed?['page failed']:[],mistakes:0};};
  const result=await session.runEpisode(fs,async()=>{agentCalls++;return clickAction;},{maxSteps:1});
  assert.equal(result.reason,'page_error');assert.equal(result.success,false);assert.equal(result.zero_mistake_success,false);
  assert.equal(agentCalls,moment==='before first action'?0:1);
});
test('trace-write failures reject rather than becoming successful episode results',async()=>{
  const failure=new Error('trace disk failure');
  await assert.rejects(()=>session.runEpisode(fakeSession(),async()=>clickAction,{trace:event=>{if(event.type==='action')throw failure;}}),error=>error===failure);
});
