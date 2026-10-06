import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const {scripts}=JSON.parse(await readFile(new URL('../../package.json',import.meta.url),'utf8'));
test('verify includes all Node checks plus both real browser suites',()=>{
  assert.equal(scripts.verify,'npm run verify:node && npm run test:browser && npm run test:benchmark:browser');
  assert.equal(scripts['verify:node'],'npm run test && npm run test:benchmark && npm run build && npm run verify:dist');
});
test('verify:dist checks both distributions against the root without launching a browser',async t=>{
  assert.equal(typeof scripts['verify:dist'],'string');
  const directory=await mkdtemp(join(tmpdir(),'close-ads-dist-'));t.after(()=>rm(directory,{recursive:true,force:true}));
  await mkdir(join(directory,'dist'));
  await writeFile(join(directory,'package.json'),JSON.stringify({scripts:{'verify:dist':scripts['verify:dist']}}));
  const files=['关掉广告.html','dist/index.html','dist/关掉广告.html'];
  for(const name of files)await writeFile(join(directory,name),'same HTML');
  execFileSync('npm',['run','verify:dist'],{cwd:directory,stdio:'pipe'});
  for(const name of files){
    await writeFile(join(directory,name),'outdated HTML');
    assert.throws(()=>execFileSync('npm',['run','verify:dist'],{cwd:directory,stdio:'pipe'}),undefined,name);
    await writeFile(join(directory,name),'same HTML');
  }
});
