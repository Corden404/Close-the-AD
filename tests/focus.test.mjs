import test from 'node:test';
import assert from 'node:assert/strict';
import {captureFocus,restoreFocus} from '../src/focus.mjs';
const node=(id,visible=true)=>({dataset:{focus:id},disabled:false,hidden:false,getClientRects:()=>visible?[{}]:[],focus(){this.focused=true;}});
const root=nodes=>({querySelector:sel=>nodes.find(n=>sel===`[data-focus="${n.dataset.focus}"]`)||null});
test('duplicate mobile and sidebar inspect actions restore the initiating instance',()=>{const sidebar=node('sidebar:inspect'),mobile=node('mobile:inspect');sidebar.dataset.action=mobile.dataset.action='inspect.toggle';const key=captureFocus(mobile);assert.equal(key,'mobile:inspect');restoreFocus(root([sidebar,mobile]),key,[]);assert.equal(mobile.focused,true);assert.notEqual(sidebar.focused,true);});
test('hidden original focus falls back only to visible logical candidates',()=>{const mobile=node('mobile:inspect',false),sidebar=node('sidebar:inspect'),world=node('world');restoreFocus(root([mobile,sidebar,world]),'mobile:inspect',['sidebar:inspect','world']);assert.equal(sidebar.focused,true);assert.notEqual(mobile.focused,true);});
test('missing originating ad falls back to trusted return control, not another ad with same action',()=>{const other=node('recipe:prize'),back=node('toolbar:return');restoreFocus(root([other,back]),'popup:prize',['toolbar:return']);assert.equal(back.focused,true);assert.notEqual(other.focused,true);});
test('missing and hidden controls never steal focus from a visible world fallback',()=>{const hidden=node('sidebar:inspect',false),world=node('world');restoreFocus(root([hidden,world]),'gone',['sidebar:inspect','world']);assert.equal(world.focused,true);});
