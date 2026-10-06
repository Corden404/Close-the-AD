import test from 'node:test';
import assert from 'node:assert/strict';
let cli={};try{cli=await import('../cli.mjs');}catch(error){if(error.code!=='ERR_MODULE_NOT_FOUND')throw error;}
test('CLI supports model-free paired runs with explicit modes',()=>{const opts=cli.parseArgs(['--stage','all','--paired','--mock','random','--seed','42','--max-steps','60']);assert.deepEqual(opts.stages,[0,1,2,3,4,5,6,7,8]);assert.deepEqual(opts.ads,['on','off']);assert.equal(opts.seed,'42');assert.equal(opts.maxSteps,60);assert.equal(opts.mock,'random');});
test('CLI rejects unknown flags, remote model options and malformed stages',()=>{for(const args of [['--api-key','x'],['--stage','0'],['--stage','10'],['--max-steps','0'],['--inspection','maybe'],['--mock','secret'],['--seed']])assert.throws(()=>cli.parseArgs(args));});
test('single JSONL episode defaults to stage one without inspecting hints',()=>{const opts=cli.parseArgs([]);assert.deepEqual(opts.stages,[0]);assert.deepEqual(opts.ads,['on']);assert.equal(opts.inspection,false);assert.equal(opts.mock,null);});

const {mkdtemp,readFile,readdir,rm}=await import('node:fs/promises');
const {tmpdir}=await import('node:os');
const {join}=await import('node:path');
const {Readable,Writable}=await import('node:stream');
async function cliHarness(t){
  const directory=await mkdtemp(join(tmpdir(),'close-ads-cli-'));
  t.after(()=>rm(directory,{recursive:true,force:true}));
  const records=[];const output=new Writable({write(chunk,encoding,done){for(const line of String(chunk).trim().split('\n'))records.push(JSON.parse(line));done();}});
  return {directory,records,output};
}
function cliSession(config){return {metadata:{config},observe:async()=>({snapshot_id:'s1',candidates:[{id:'a',operations:['click']}]}),act:async()=>({ok:true}),evaluate:async()=>({success:false,zero_mistake_success:false,page_errors:[],mistakes:0}),close:async()=>{}};}
test('CLI continues all stages after episode browser errors and preserves failures in traces and summary',async t=>{
  const {directory,records,output}=await cliHarness(t),closed=[],opened=[];
  await cli.main(['--stage','all','--mock','random','--max-steps','1','--trace-dir',directory],{output,sessionFactory:async config=>{
    opened.push(config.stage);const fs=cliSession(config);fs.close=async()=>closed.push(config.stage);
    if(config.stage===0)fs.observe=async()=>{throw new Error('private browser details');};
    else fs.evaluate=async()=>({success:true,zero_mistake_success:true,page_errors:config.stage===1?['page failure']:[],mistakes:0});
    return fs;
  }});
  assert.equal(opened.length,9);assert.deepEqual(closed,opened);
  const summary=records.at(-1);assert.equal(summary.type,'summary');assert.equal(summary.episodes,9);assert.equal(summary.success_rate,7/9);assert.equal(summary.zero_mistake_success_rate,7/9);
  assert.equal(summary.results[0].reason,'browser_error');assert.equal(summary.results[1].reason,'page_error');assert.ok(summary.results.slice(2).every(result=>result.success));
  const files=await readdir(directory);assert.equal(files.length,9);
  const trace=(await readFile(join(directory,files.find(name=>name.includes('-1-on-'))),'utf8')).trim().split('\n').map(JSON.parse);
  assert.equal(trace.at(-1).reason,'browser_error');assert.equal(trace.at(-1).success,false);
});
test('CLI agent stream rejection produces results and continues instead of aborting the batch',async t=>{
  const {directory,records,output}=await cliHarness(t),opened=[],closed=[];
  let calls=0;
  const lines={next:async()=>{if(++calls===1)throw new Error('private agent credential');return {done:false,value:JSON.stringify({snapshot_id:'s1',action:'click',target_id:'a'})};}};
  await cli.main(['--stage','all','--max-steps','1','--trace-dir',directory],{output,lines,sessionFactory:async config=>{
    opened.push(config.stage);const fs=cliSession(config);fs.close=async()=>closed.push(config.stage);return fs;
  }});
  const results=records.filter(record=>record.type==='result');
  assert.equal(results[0].reason,'agent_error');assert.equal(results[0].success,false);
  assert.equal(results.length,9);assert.equal(opened.length,9);assert.deepEqual(closed,opened);
  assert.ok(results.slice(1).every(result=>result.reason==='step_budget'));
  const summary=records.at(-1);assert.equal(summary.type,'summary');assert.equal(summary.episodes,9);assert.equal(summary.success_rate,0);
  const trace=(await readFile(results[0].trace_file,'utf8')).trim().split('\n').map(JSON.parse);
  assert.equal(trace.at(-1).reason,'agent_error');assert.equal(trace.at(-1).error,'agent_callback_failed');
  assert.doesNotMatch(JSON.stringify(records),/private agent credential/);
});
test('CLI explicit EOF closes the session and intentionally ends the interactive batch',async t=>{
  const {directory,records,output}=await cliHarness(t),closed=[];
  await cli.main(['--stage','all','--trace-dir',directory],{input:Readable.from([]),output,sessionFactory:async config=>{
    const fs=cliSession(config);fs.close=async()=>closed.push(config.stage);return fs;
  }});
  assert.deepEqual(closed,[0]);assert.equal(records.at(-1).reason,'agent_closed');assert.ok(!records.some(record=>record.type==='summary'));
});
test('CLI browser startup failure rejects without a success result or summary',async t=>{
  const {directory,records,output}=await cliHarness(t),failure=new Error('browser startup failure');
  await assert.rejects(()=>cli.main(['--mock','random','--trace-dir',directory],{output,sessionFactory:async()=>{throw failure;}}),error=>error===failure);
  assert.deepEqual(records,[]);
});
test('CLI trace-write failure closes the trace and session without publishing success',async t=>{
  const {directory,records,output}=await cliHarness(t),closed=[],failure=new Error('trace disk failure');
  await assert.rejects(()=>cli.main(['--mock','random','--trace-dir',directory],{output,sessionFactory:async config=>{
    const fs=cliSession(config);fs.close=async()=>closed.push('session');return fs;
  },openTrace:async()=>({write:async()=>{throw failure;},close:async()=>closed.push('trace')})}),error=>error===failure);
  assert.deepEqual(closed,['trace','session']);assert.deepEqual(records,[]);
});
test('CLI attempts browser cleanup even if closing its trace fails',async t=>{
  const {directory,records,output}=await cliHarness(t),closed=[],failure=new Error('trace close failure');
  await assert.rejects(()=>cli.main(['--mock','random','--trace-dir',directory],{output,sessionFactory:async config=>{
    const fs=cliSession(config);fs.evaluate=async()=>({success:true,zero_mistake_success:true,page_errors:[]});fs.close=async()=>closed.push('session');return fs;
  },openTrace:async()=>({write:async()=>{},close:async()=>{closed.push('trace');throw failure;}})}),error=>error===failure);
  assert.deepEqual(closed,['trace','session']);assert.deepEqual(records,[]);
});
