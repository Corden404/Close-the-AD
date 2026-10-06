#!/usr/bin/env node
import {chapters} from '../src/content.mjs';
import {createInterface} from 'node:readline';
import {mkdir,open} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {openSession,runEpisode,validateConfig} from './session.mjs';
import {createMockAgent} from './mock-agent.mjs';

export function parseArgs(args) {
  const options={stages:[0],ads:['on'],seed:'1',inspection:false,maxSteps:100,mock:null,viewport:{width:1440,height:1000},traceDir:resolve(fileURLToPath(new URL('../benchmark-runs/',import.meta.url)))};
  for(let i=0;i<args.length;i++) {
    const flag=args[i];
    if(flag==='--help'){options.help=true;continue;}
    if(flag==='--paired'){options.ads=['on','off'];continue;}
    if(!['--stage','--ads','--seed','--inspection','--max-steps','--mock','--viewport','--chromium','--trace-dir'].includes(flag))throw new Error(`Unknown option: ${flag}`);
    const value=args[++i];if(value===undefined||value.startsWith('--'))throw new Error(`Missing value for ${flag}`);
    if(flag==='--stage')options.stages=value==='all'?chapters.map((_,stage)=>stage):[Number(value)-1];
    if(flag==='--ads'){if(!['on','off'].includes(value))throw new Error('Invalid ads mode');options.ads=[value];}
    if(flag==='--seed')options.seed=value;
    if(flag==='--inspection'){if(!['on','off'].includes(value))throw new Error('Invalid inspection mode');options.inspection=value==='on';}
    if(flag==='--max-steps')options.maxSteps=Number(value);
    if(flag==='--mock'){if(!['random','heuristic'].includes(value))throw new Error('Invalid mock policy');options.mock=value;}
    if(flag==='--viewport'){const match=value.match(/^(\d+)x(\d+)$/);if(!match)throw new Error('Invalid viewport');options.viewport={width:Number(match[1]),height:Number(match[2])};}
    if(flag==='--chromium')options.executablePath=value;
    if(flag==='--trace-dir')options.traceDir=resolve(value);
  }
  for(const stage of options.stages)validateConfig({stage,ads:options.ads[0],seed:options.seed,inspection:options.inspection,maxSteps:options.maxSteps,viewport:options.viewport});
  return options;
}
const emit=value=>process.stdout.write(JSON.stringify(value)+'\n');
export async function main(args=process.argv.slice(2)) {
  const options=parseArgs(args);
  if(options.help){process.stdout.write(`Usage: node benchmark/cli.mjs [--stage 1..${chapters.length}|all] [--ads on|off|--paired] [--seed 1] [--inspection on|off] [--max-steps 100] [--mock random|heuristic] [--viewport 1440x1000] [--chromium /path/to/chromium] [--trace-dir directory]\nWithout --mock: JSONL observations on stdout; one action JSON per stdin line. No model service is contacted.\n`);return;}
  const rl=options.mock?null:createInterface({input:process.stdin,crlfDelay:Infinity});
  const lines=rl?.[Symbol.asyncIterator]();
  const results=[];
  try {
    await mkdir(options.traceDir,{recursive:true});
    for(const stage of options.stages)for(const ads of options.ads) {
      const config={stage,ads,seed:options.seed,inspection:options.inspection,maxSteps:options.maxSteps,viewport:options.viewport,...(options.executablePath?{executablePath:options.executablePath}:{})};
      const session=await openSession(config);
      const tag=createHash('sha256').update(options.seed).digest('hex').slice(0,8);
      const path=resolve(options.traceDir,`${new Date().toISOString().replaceAll(':','-')}-${stage+1}-${ads}-${tag}.benchmark.jsonl`);
      let file;
      try {
        file=await open(path,'wx',0o600);
        const agent=options.mock?createMockAgent(options.mock,`${options.seed}:${stage}`):async packet=>{
          emit(packet);const next=await lines.next();return next.done?null:next.value;
        };
        const result=await runEpisode(session,agent,{agentMetadata:{kind:options.mock?'mock':'external-jsonl',policy:options.mock},trace:event=>file.write(JSON.stringify(event)+'\n')});
        results.push({...result,ads,inspection:options.inspection,seed:options.seed,stage:stage+1});
        emit({...results.at(-1),trace_file:path});
        if(result.reason==='agent_closed')return;
      } finally { await file?.close();await session.close(); }
    }
    emit({type:'summary',episodes:results.length,success_rate:results.filter(r=>r.success).length/results.length,zero_mistake_success_rate:results.filter(r=>r.zero_mistake_success).length/results.length,paired:options.ads.length===2,results});
  } finally { rl?.close(); }
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  main().catch(error=>{process.stderr.write(JSON.stringify({type:'error',error:/browserType\.launch|Executable doesn't exist|Target page, context or browser/.test(error.message)?'browser_unavailable':'benchmark_error',message:error.message})+'\n');process.exitCode=1;});
}
