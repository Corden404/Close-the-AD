import test from 'node:test';
import assert from 'node:assert/strict';
import {validateAction} from '../protocol.mjs';
let mock={};try{mock=await import('../mock-agent.mjs');}catch(error){if(error.code!=='ERR_MODULE_NOT_FOUND')throw error;}
const observation={snapshot_id:'s',task:'test',regions:[{text:'正文'}],candidates:[{id:'a',label:'按钮',operations:['click']},{id:'b',label:'填温度',operations:['fill']},{id:'c',label:'滚动页面',operations:['scroll']}]};
test('seeded random baseline returns reproducible valid actions',()=>{const first=mock.createMockAgent('random','42'),second=mock.createMockAgent('random','42');const actions=[];for(let i=0;i<20;i++){const a=first({observation});assert.deepEqual(a,second({observation}));validateAction(a,observation);actions.push(a.action);}assert.ok(new Set(actions).size>1);});
test('heuristic reads temperature from visible text instead of fixed answer',()=>{const agent=mock.createMockAgent('heuristic','1');const obs={...observation,regions:[{text:'烤箱上下火预热至 185°C，烘烤 15 分钟'}]};assert.equal(agent({observation:obs}).value,'185');});
test('heuristic unchecks selected checkbox using visible state',()=>{const action=mock.createMockAgent('heuristic','1')({observation:{...observation,candidates:[{id:'d',label:'安心保障包',kind:'checkbox',checked:true,operations:['click']}]}});assert.equal(action.target_id,'d');});
test('empty candidates stop rather than inventing target IDs',()=>assert.equal(mock.createMockAgent('random')({observation:{...observation,candidates:[]}}),null));
test('heuristic recognizes the game actual confirm-purchase label',()=>{for(let seed=0;seed<10;seed++){const obs={...observation,candidates:[{id:'decoy',label:'探索声岛 AIR',operations:['click']},{id:'pay',label:'确认购买 →',operations:['click']}]};assert.equal(mock.createMockAgent('heuristic',String(seed))({observation:obs}).target_id,'pay');}});
