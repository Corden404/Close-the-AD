import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,reduce} from '../../src/engine.mjs';
let judge={};try{judge=await import('../judge.mjs');}catch(error){if(error.code!=='ERR_MODULE_NOT_FOUND')throw error;}
const paths=[[
 ['recipe.expand'],['recipe.answer',200]],
 [['pdf.open'],['pdf.save']],
 [['extra','insurance'],['extra','fast'],['trial.cancel'],['checkout.review'],['checkout.pay']],
 [['lesson.play'],['lesson.answer','node']],
 [['notifications.settings'],['notifications.block'],['message.open'],['message.ack']],
 [['subscription.manage'],['cancellation.start'],['cancellation.continue'],['cancellation.confirm'],['cancellation.verify']]
];
test('exports independent evaluator',()=>assert.equal(typeof judge.evaluateState,'function'));
test('all six ground-truth solutions pass and initial states fail',()=>{for(let stage=0;stage<6;stage++){let state=reduce(initialState(),{type:'stage.select',value:stage});assert.equal(judge.evaluateState(state,stage).success,false);for(const [type,value]of paths[stage])state=reduce(state,{type,value});assert.equal(judge.evaluateState(state,stage).success,true,`stage ${stage}`);}});
test('wrong stage, premature completion, extras and retained renewals cannot pass',()=>{for(let stage=0;stage<6;stage++){const state=reduce(initialState(),{type:'stage.select',value:stage});assert.equal(judge.evaluateState({...state,screen:'debrief',completed:[stage]},stage).success,false);}assert.equal(judge.evaluateState({...initialState(),stage:5,screen:'complete',completed:[5]},0).success,false);});
test('zero-mistake result and inspection counts come from evaluator only',()=>{let state=reduce(initialState(),{type:'stage.select',value:1});state=reduce(state,{type:'inspect',value:'pdf.open'});state=reduce(state,{type:'trap.download'});state=reduce(state,{type:'browser.return'});state=reduce(state,{type:'pdf.open'});state=reduce(state,{type:'pdf.save'});const result=judge.evaluateState(state,1);assert.equal(result.success,true);assert.equal(result.mistakes,1);assert.equal(result.zero_mistake_success,false);assert.equal(result.inspected_controls,1);});
test('episode evaluator retains mistakes and recovery history across reset',()=>{const evaluate=judge.createEpisodeEvaluator(0);let state=initialState();for(const [type,value]of [['stage.select',0],['trap.prize'],['browser.return'],['inspect','recipe.expand'],['restart'],['stage.select',0],['recipe.expand'],['recipe.answer',200]]){state=reduce(state,{type,value});evaluate(state);}const result=evaluate(state);assert.equal(result.success,true);assert.equal(result.mistakes,1);assert.equal(result.recoveries,1);assert.equal(result.inspected_controls,1);assert.equal(result.zero_mistake_success,false);assert.deepEqual(evaluate(state),result);});
test('episode evaluator adds post-reset mistakes without counting repeated reads',()=>{const evaluate=judge.createEpisodeEvaluator(1);let state=reduce(initialState(),{type:'stage.select',value:1});state=reduce(state,{type:'trap.download'});assert.equal(evaluate(state).mistakes,1);assert.equal(evaluate(state).mistakes,1);state=reduce(state,{type:'restart'});evaluate(state);state=reduce(state,{type:'stage.select',value:1});state=reduce(state,{type:'trap.download'});assert.equal(evaluate(state).mistakes,2);});
