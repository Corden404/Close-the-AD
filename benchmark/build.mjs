import {GAME_SOURCE_PATHS} from '../build-sources.mjs';
import {chapters} from '../src/content.mjs';
import {readFile} from 'node:fs/promises';
const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');
/** Builds a separate instrumented document; never rewrites the delivered game. */
export async function buildBenchmark({stage=0,ads='on',inspection=false}={}) {
  if(!Number.isInteger(stage)||stage<0||stage>=chapters.length||!['on','off'].includes(ads)||typeof inspection!=='boolean')throw new Error('Invalid benchmark configuration');
  const paths=['src/template.html','src/styles.css',...GAME_SOURCE_PATHS];
  const [template,styles,...sources]=await Promise.all(paths.map(read));
  const app=sources.pop();
  const anchor="if(action==='inspect.toggle'){";
  if(app.split(anchor).length!==2)throw new Error('Game inspection integration changed; review benchmark instrumentation');
  const guardedApp=app.replace(anchor,`${anchor}if(!BENCHMARK_INSPECTION)return;`);
  const hook=`\nObject.defineProperty(window,'__closeAdsJudge',{value:()=>JSON.parse(JSON.stringify(state)),writable:false,configurable:false});\nstate=reduce(initialState(),{type:'stage.select',value:${stage}});render();`;
  const js=[`const BENCHMARK_INSPECTION=${inspection};`,...sources,guardedApp,hook].join('\n').replace(/^export /gm,'').replace(/^import .*;\s*$/gm,'');
  if(/<\/script/i.test(js))throw new Error('Unsafe inline script terminator');
  const css=styles+(!inspection?'\n.browser-inspector{display:none!important}':'')+(ads==='off'?'\n.ad{display:none!important}':'');
  return template.replace('/* STYLES */',css).replace('/* SCRIPT */',`(()=>{'use strict';\n${js}\n})();`);
}
