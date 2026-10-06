import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {buildBenchmark} from './build.mjs';
import {createEpisodeEvaluator} from './judge.mjs';
import {validateAction,makeActionSchema,AGENT_INSTRUCTIONS} from './protocol.mjs';
import {chapters} from '../src/content.mjs';

/** Only this executor can translate an already-validated opaque reference to input. */
export async function performAction(page,input,observation) {
  let action;
  try { action=validateAction(input,observation); } catch(error) { return {ok:false,error:error.code||'invalid_action'}; }
  let ready;
  try { ready=await page.evaluate(a=>window.__closeAdsDomBridge.preflight(a),action); }
  catch { return {ok:false,error:'execution_error'}; }
  if(!ready.ok)return {ok:false,error:ready.error};
  if(!Number.isFinite(ready.point?.x)||!Number.isFinite(ready.point?.y))return {ok:false,error:'not_actionable'};
  const {x,y}=ready.point;
  let result={ok:true};
  try {
    if(action.action==='scroll') { await page.mouse.move(x,y); await page.mouse.wheel(0,action.delta_y); }
    else {
      await page.mouse.click(x,y);
      if(action.action==='fill') { await page.keyboard.press('ControlOrMeta+A'); await page.keyboard.insertText(action.value); }
    }
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  } catch { result={ok:false,error:'execution_error'}; }
  // Invalidation is part of execution; its failure must not escape or turn a failed input into success.
  try { await page.evaluate(()=>window.__closeAdsDomBridge.invalidate()); }
  catch { result={ok:false,error:'execution_error'}; }
  return result;
}

/** The host owns this object; models receive observe() results, never this object/page. */
export async function openSession(input={},dependencies={}) {
  const config=validateConfig(input);
  const {chromium}=dependencies.chromium?dependencies:createRequire(import.meta.url)('playwright');
  const {installDomBridge}=await import('./dom.mjs');
  const html=await buildBenchmark(config);
  const browser=await chromium.launch(browserLaunchOptions(config.executablePath));
  let context;
  try {
    context=await browser.newContext({viewport:config.viewport,reducedMotion:'reduce',permissions:[],serviceWorkers:'block',acceptDownloads:false});
    let blockedRequests=0,unexpectedPages=0,downloads=0;
    await context.route('**/*',route=>{blockedRequests++;return route.abort('blockedbyclient');});
    await context.addInitScript(()=>{
      const deny=()=>{throw new Error('Offline benchmark: operation disabled');};
      window.open=deny;window.fetch=deny;
      if(window.Notification)window.Notification.requestPermission=deny;
      if(window.navigator.sendBeacon)window.navigator.sendBeacon=deny;
    });
    const page=await context.newPage();
    page.setDefaultTimeout(3000);
    const pageErrors=[];
    page.on('pageerror',error=>pageErrors.push(error.message));
    page.on('popup',popup=>{unexpectedPages++;void popup.close();});
    page.on('download',download=>{downloads++;void download.cancel();});
    page.on('dialog',dialog=>void dialog.dismiss());
    await page.setContent(html,{waitUntil:'load'});
    await page.evaluate(installDomBridge,{seed:config.seed,inspection:config.inspection});
    let sequence=0,latest,busy=false;
    const judge=createEpisodeEvaluator(config.stage);
    const readVerdict=async()=>judge(await page.evaluate(()=>window.__closeAdsJudge()));
    await readVerdict();
    const episodeHash=createHash('sha256').update(JSON.stringify({seed:config.seed,stage:config.stage,ads:config.ads,inspection:config.inspection})).digest('hex').slice(0,12);
    return {
      metadata:{protocol_version:1,...await runtimeMetadata(),config,game_sha256:createHash('sha256').update(html).digest('hex'),browser:browser.version(),observation_mode:'rendered-dom-visible-text'},
      async observe() {
        if(busy)throw new Error('Action in progress');
        latest=await page.evaluate(id=>window.__closeAdsDomBridge.observe(id),`s_${episodeHash}_${++sequence}`);
        return {...latest,task:chapters[config.stage].detail};
      },
      async act(input) {
        if(busy)return {ok:false,error:'action_in_progress'};
        if(!latest)return {ok:false,error:'stale_snapshot'};
        busy=true;
        try { const result=await performAction(page,input,latest);await readVerdict();return result; } finally { busy=false; }
      },
      async evaluate() {
        return {...await readVerdict(),blocked_requests:blockedRequests,unexpected_pages:unexpectedPages,downloads,page_errors:[...pageErrors]};
      },
      async close() { await browser.close(); }
    };
  } catch(error) { await browser.close(); throw error; }
}

export function validateConfig(input={}) {
  const config={stage:0,seed:'1',ads:'on',inspection:false,viewport:{width:1440,height:1000},maxSteps:100,...input};
  const allowed=['stage','seed','ads','inspection','viewport','maxSteps','executablePath'];
  if(Object.keys(config).some(key=>!allowed.includes(key)))throw new Error('Unknown configuration key');
  if(!Number.isInteger(config.stage)||config.stage<0||config.stage>=chapters.length)throw new Error('Invalid stage');
  if(!['on','off'].includes(config.ads)||typeof config.inspection!=='boolean')throw new Error('Invalid benchmark mode');
  if(typeof config.seed!=='string'||config.seed.length>100)throw new Error('Invalid seed');
  if(!Number.isInteger(config.maxSteps)||config.maxSteps<1||config.maxSteps>10000)throw new Error('Invalid step budget');
  if(!config.viewport||!['width','height'].every(key=>Number.isInteger(config.viewport[key])&&config.viewport[key]>=320&&config.viewport[key]<=4096))throw new Error('Invalid viewport');
  if(config.executablePath!==undefined&&typeof config.executablePath!=='string')throw new Error('Invalid browser executable');
  return config;
}

/** Model integrations only receive this packet, never page, state or evaluator. */
export async function runEpisode(session,agent,{maxSteps=session.metadata.config.maxSteps,trace=()=>{},agentMetadata={kind:'external'}}={}) {
  if(!Number.isInteger(maxSteps)||maxSteps<1||maxSteps>10000)throw new Error('Invalid step budget');
  const metrics={attempts:0,executed_actions:0,invalid_actions:0,stale_actions:0,input_tokens:null,output_tokens:null,agent_latency_ms:0};
  const usageTotals={input_tokens:0,output_tokens:0};
  const usageComplete={input_tokens:true,output_tokens:true};
  const started=performance.now();
  await trace({type:'episode',...session.metadata,agent_metadata:agentMetadata,started_at:new Date().toISOString()});
  let lastResult=null,verdict=null,reason='step_budget',error;
  // Only browser reads are contained here. Trace persistence errors must still reject the run.
  const readVerdict=async()=>{
    try { verdict=await session.evaluate();return true; }
    catch {
      verdict=null;
      if(!error){reason='browser_error';error='evaluate_failed';}
      return false;
    }
  };
  for(let i=0;i<maxSteps;i++) {
    if(!await readVerdict())break;
    if(verdict.page_errors.length){reason='page_error';break;}
    if(verdict.success){reason='success';break;}
    let observation;
    try { observation=await session.observe(); }
    catch { reason='browser_error';error='observe_failed';break; }
    const packet={type:'observation',instructions:AGENT_INSTRUCTIONS,observation,action_schema:makeActionSchema(observation),last_action:lastResult,steps_remaining:maxSteps-i};
    await trace(packet);
    const before=performance.now();
    let response;
    try { response=await agent(packet); }
    catch {
      reason='agent_error';error='agent_callback_failed';
      usageComplete.input_tokens=false;usageComplete.output_tokens=false;
      break;
    } finally { metrics.agent_latency_ms+=performance.now()-before; }
    if(response===null){reason='agent_closed';break;}
    const envelope=response&&typeof response==='object'&&response.action&&typeof response.action==='object'?response:null;
    const action=envelope?envelope.action:response;
    for(const key of ['input_tokens','output_tokens']) {
      const value=envelope?.usage?.[key];
      if(Number.isSafeInteger(value)&&value>=0&&Number.isSafeInteger(usageTotals[key]+value))usageTotals[key]+=value;
      else usageComplete[key]=false;
    }
    metrics.attempts++;
    try { lastResult=await session.act(action); }
    catch { reason='browser_error';error='act_failed';lastResult={ok:false,error:'browser_error'}; }
    if(lastResult.ok)metrics.executed_actions++;
    else if(lastResult.error==='stale_snapshot')metrics.stale_actions++;
    else if(reason!=='browser_error')metrics.invalid_actions++;
    await trace({type:'action',action,result:lastResult});
    if(reason==='browser_error')break;
  }
  await readVerdict();
  if(!error&&reason!=='agent_closed') {
    if(reason==='page_error'||verdict.page_errors.length)reason='page_error';
    else reason=verdict.success?'success':'step_budget';
  }
  for(const key of ['input_tokens','output_tokens'])metrics[key]=metrics.attempts>0&&usageComplete[key]?usageTotals[key]:null;
  const unknownVerdict={stage:Number.isInteger(session.metadata.config.stage)?session.metadata.config.stage+1:null,mistakes:null,recoveries:null,inspected_controls:null,blocked_requests:null,unexpected_pages:null,downloads:null,page_errors:null};
  const success=reason==='success'&&verdict?.success===true;
  const result={type:'result',...(verdict??unknownVerdict),reason,...(error?{error}:{}),evaluation_available:verdict!==null,success,zero_mistake_success:success&&verdict?.zero_mistake_success===true,...metrics,elapsed_ms:performance.now()-started};
  await trace(result);
  return result;
}

export async function runtimeMetadata() {
  const files=['dom.mjs','protocol.mjs','session.mjs','judge.mjs','build.mjs','mock-agent.mjs','cli.mjs'];
  const hash=createHash('sha256');
  for(const file of files)hash.update(file).update(await readFile(new URL(file,import.meta.url)));
  return {adapter_sha256:hash.digest('hex'),node:process.version,playwright:createRequire(import.meta.url)('playwright/package.json').version};
}

export function browserLaunchOptions(executablePath) {
  return {headless:true,args:['--no-sandbox'],...(executablePath?{executablePath}:{})};
}
