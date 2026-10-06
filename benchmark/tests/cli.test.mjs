import test from 'node:test';
import assert from 'node:assert/strict';
let cli={};try{cli=await import('../cli.mjs');}catch(error){if(error.code!=='ERR_MODULE_NOT_FOUND')throw error;}
test('CLI supports model-free paired runs with explicit modes',()=>{const opts=cli.parseArgs(['--stage','all','--paired','--mock','random','--seed','42','--max-steps','60']);assert.deepEqual(opts.stages,[0,1,2,3,4,5]);assert.deepEqual(opts.ads,['on','off']);assert.equal(opts.seed,'42');assert.equal(opts.maxSteps,60);assert.equal(opts.mock,'random');});
test('CLI rejects unknown flags, remote model options and malformed stages',()=>{for(const args of [['--api-key','x'],['--stage','0'],['--stage','7'],['--max-steps','0'],['--inspection','maybe'],['--mock','secret'],['--seed']])assert.throws(()=>cli.parseArgs(args));});
test('single JSONL episode defaults to stage one without inspecting hints',()=>{const opts=cli.parseArgs([]);assert.deepEqual(opts.stages,[0]);assert.deepEqual(opts.ads,['on']);assert.equal(opts.inspection,false);assert.equal(opts.mock,null);});
