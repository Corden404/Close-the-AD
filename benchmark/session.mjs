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
  const ready=await page.evaluate(a=>window.__closeAdsDomBridge.preflight(a),action);
  if(!ready.ok)return {ok:false,error:ready.error};
  if(!Number.isFinite(ready.point?.x)||!Number.isFinite(ready.point?.y))return {ok:false,error:'not_actionable'};
  const {x,y}=ready.point;
  try {
    if(action.action==='scroll') { await page.mouse.move(x,y); await page.mouse.wheel(0,action.delta_y); }
    else {
      await page.mouse.click(x,y);
      if(action.action==='fill') { await page.keyboard.press('ControlOrMeta+A'); await page.keyboard.insertText(action.value); }
    }
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    return {ok:true};
  } catch { return {ok:false,error:'execution_error'}; }
  finally { await page.evaluate(()=>window.__closeAdsDomBridge.invalidate()); }
}

/** The host owns this object; models receive observe() results, never this object/page. */
export async function openSession(input={},dependencies={}) {
  const config=validateConfig(input);
  const {chromium}=dependencies.chromium?dependencies:createRequire(import.meta.url)('playwright');
  const {installDomBridge}=await import('./dom.mjs');
  const html=await buildBenchmark(config);
  const browser=await chromium.launch({headless:true,...(config.executablePath?{executablePath:config.executablePath}:{}),args:['--no-sandbox']});
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
  if(!Number.isInteger(config.stage)||config.stage<0||config.stage>5)throw new Error('Invalid stage');
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
  const started=performance.now();
  await trace({type:'episode',...session.metadata,agent_metadata:agentMetadata,started_at:new Date().toISOString()});
  let lastResult=null,reason='step_budget';
  for(let i=0;i<maxSteps;i++) {
    const verdict=await session.evaluate();
    if(verdict.success){reason='success';break;}
    if(verdict.page_errors.length){reason='page_error';break;}
    const observation=await session.observe();
    const packet={type:'observation',instructions:AGENT_INSTRUCTIONS,observation,action_schema:makeActionSchema(observation),last_action:lastResult,steps_remaining:maxSteps-i};
    await trace(packet);
    const before=performance.now();
    const response=await agent(packet);
    metrics.agent_latency_ms+=performance.now()-before;
    if(response===null){reason='agent_closed';break;}
    const envelope=response&&typeof response==='object'&&response.action&&typeof response.action==='object'?response:null;
    const action=envelope?envelope.action:response;
    if(envelope?.usage)for(const key of ['input_tokens','output_tokens'])if(Number.isInteger(envelope.usage[key])&&envelope.usage[key]>=0)metrics[key]=(metrics[key]??0)+envelope.usage[key];
    metrics.attempts++;
    lastResult=await session.act(action);
    if(lastResult.ok)metrics.executed_actions++;
    else if(lastResult.error==='stale_snapshot')metrics.stale_actions++;
    else metrics.invalid_actions++;
    await trace({type:'action',action,result:lastResult});
  }
  const verdict=await session.evaluate();
  if(verdict.success)reason='success';
  const result={type:'result',reason,...verdict,...metrics,elapsed_ms:performance.now()-started};
  await trace(result);
  return result;
}

export async function runtimeMetadata() {
  const files=['dom.mjs','protocol.mjs','session.mjs','judge.mjs','build.mjs','mock-agent.mjs','cli.mjs'];
  const hash=createHash('sha256');
  for(const file of files)hash.update(file).update(await readFile(new URL(file,import.meta.url)));
  return {adapter_sha256:hash.digest('hex'),node:process.version,playwright:createRequire(import.meta.url)('playwright/package.json').version};
}
