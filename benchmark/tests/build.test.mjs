import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
let build={};try{build=await import('../build.mjs');}catch(error){if(error.code!=='ERR_MODULE_NOT_FOUND')throw error;}
test('benchmark builder exists without changing normal build',()=>assert.equal(typeof build.buildBenchmark,'function'));
test('instrumentation is confined to benchmark HTML with read-only evaluator',async()=>{const html=await build.buildBenchmark({stage:1,ads:'on',inspection:false});assert.match(html,/__closeAdsJudge/);assert.match(html,/JSON\.parse\(JSON\.stringify\(state\)\)/);assert.match(html,/value:1/);assert.match(html,/BENCHMARK_INSPECTION=false/);const ordinary=await readFile(new URL('../../关掉广告.html',import.meta.url),'utf8');assert.doesNotMatch(ordinary,/__closeAdsJudge|BENCHMARK_INSPECTION/);});
test('ads-off and inspection setting are explicit while dark-pattern tasks stay intact',async()=>{const html=await build.buildBenchmark({stage:2,ads:'off',inspection:true});assert.match(html,/\.ad\{display:none!important\}/);assert.match(html,/BENCHMARK_INSPECTION=true/);assert.match(html,/extras:\{insurance:true,fast:true,trial:true\}/);assert.match(html,/connect-src 'none'/);});
test('builder rejects unsupported stage and setting values',async()=>{for(const config of [{stage:9},{stage:-1},{stage:0.5},{stage:0,ads:'https://ad.example'},{stage:0,inspection:'yes'}])await assert.rejects(()=>build.buildBenchmark(config),/Invalid benchmark/);});
