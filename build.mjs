import {readFile,writeFile,mkdir} from 'node:fs/promises';
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const [template,css,advanced,engine,content,focus,scenes,advancedScenes,ads,app]=await Promise.all(['src/template.html','src/styles.css','src/advanced.mjs','src/engine.mjs','src/content.mjs','src/focus.mjs','src/scenes.mjs','src/advanced-scenes.mjs','src/ads.mjs','src/app.js'].map(read));
const js=[advanced,engine,content,focus,scenes,advancedScenes,ads,app].join('\n').replace(/^export /gm,'').replace(/^import .*;\s*$/gm,'');
if(/<\/script/i.test(js))throw new Error('Unsafe inline script terminator');
const html=template.replace('/* STYLES */',css).replace('/* SCRIPT */',`(()=>{'use strict';\n${js}\n})();`);
await mkdir(new URL('dist/',import.meta.url),{recursive:true});await writeFile(new URL('dist/index.html',import.meta.url),html);
await writeFile(new URL('dist/关掉广告.html',import.meta.url),html);
console.log(`Built dist/index.html (${Buffer.byteLength(html)} bytes), all assets inline.`);
