import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {chapters} from '../../src/content.mjs';
import {STAGE_COUNT} from '../../src/engine.mjs';
import {buildBenchmark} from '../build.mjs';
import {parseArgs} from '../cli.mjs';
import {validateConfig} from '../session.mjs';
import {startGeneratedPage} from './helpers/generated-page.mjs';

test('host task metadata contains all nine complete chapters without browser installation',()=>{
  assert.equal(chapters.length,9);
  assert.equal(STAGE_COUNT,chapters.length);
  for(const chapter of chapters)for(const key of ['detail','goal','host','outcome','icon'])assert.ok(chapter[key],key);
});
for(let stage=0;stage<9;stage++)test(`generated benchmark script starts stage ${stage+1} with a private read-only judge`,async()=>{
  const {context,nodes,click}=startGeneratedPage(await buildBenchmark({stage}));
  const descriptor=Object.getOwnPropertyDescriptor(context,'__closeAdsJudge');
  assert.equal(typeof descriptor.value,'function');
  assert.equal(descriptor.writable,false);assert.equal(descriptor.configurable,false);assert.equal(descriptor.enumerable,false);
  const state=context.__closeAdsJudge();assert.equal(state.stage,stage);assert.equal(state.screen,'play');
  assert.equal(state.completed.length,0);state.completed.push(stage);assert.equal(context.__closeAdsJudge().completed.length,0);
  assert.equal(context.state,undefined);assert.equal(context.reduce,undefined);assert.equal(context.evaluateState,undefined);
  click('goal.show');assert.ok(nodes.get('dialog').innerHTML.includes(chapters[stage].detail));
  click('dialog.close');click('inspect.toggle');assert.equal(nodes.get('dialog').open,false);
  assert.doesNotMatch(nodes.get('app').innerHTML,/检查中/);
  click('stage.select.9');assert.equal(context.__closeAdsJudge().stage,stage);
  click('menu.open');assert.equal((nodes.get('app').innerHTML.match(/data-action="stage.select.\d"/g)||[]).length,9);
  assert.doesNotMatch(nodes.get('app').innerHTML,/__closeAdsJudge|BENCHMARK_INSPECTION/);
});
test('CLI all and explicit final stage use the same nine-stage range',()=>{
  assert.deepEqual(parseArgs(['--stage','all']).stages,Array.from({length:9},(_,i)=>i));
  assert.deepEqual(parseArgs(['--stage','9']).stages,[8]);
  for(let stage=0;stage<9;stage++)assert.equal(validateConfig({stage}).stage,stage);
  for(const stage of [-1,9,NaN,0.5])assert.throws(()=>validateConfig({stage}),/Invalid stage/);
  assert.throws(()=>parseArgs(['--stage','10']),/Invalid stage/);
});
test('benchmark builder rejects stage nine while accepting the ninth task at index eight',async()=>{
  await assert.rejects(()=>buildBenchmark({stage:9}),/Invalid benchmark/);
  assert.match(await buildBenchmark({stage:8}),/value:8/);
});
test('ordinary generated script starts with nine chapters and has no benchmark hooks',async()=>{
  execFileSync(process.execPath,['build.mjs'],{cwd:new URL('../../',import.meta.url)});
  const html=await readFile(new URL('../../dist/index.html',import.meta.url),'utf8');
  const {context,nodes,click}=startGeneratedPage(html);
  assert.equal(context.__closeAdsJudge,undefined);assert.doesNotMatch(html,/__closeAdsJudge|BENCHMARK_INSPECTION/);
  assert.equal((nodes.get('app').innerHTML.match(/data-action="stage.select.\d"/g)||[]).length,9);
  for(let stage=0;stage<9;stage++){click(`stage.select.${stage}`);click('goal.show');assert.ok(nodes.get('dialog').innerHTML.includes(chapters[stage]?.detail),`stage ${stage}`);click('dialog.close');}
});
