import vm from 'node:vm';

/** Minimal DOM shell for executing generated scripts. This does not render a browser. */
export function startGeneratedPage(html) {
  const nodes=new Map(),listeners={};
  const element=id=>({id,innerHTML:'',textContent:'',scrollTop:0,dataset:{},open:false,
    showModal(){this.open=true;},close(){this.open=false;},addEventListener(){},
    querySelector(){return null;},focus(){},scrollIntoView(){}});
  for(const id of ['app','dialog','announcer','world'])nodes.set(id,element(id));
  nodes.get('app').querySelector=()=>({getClientRects:()=>[{}],focus(){},scrollIntoView(){}});
  const document={getElementById:id=>nodes.get(id),activeElement:element('active'),
    addEventListener(type,handler){listeners[type]=handler;},querySelector:()=>element('query'),documentElement:{dataset:{}}};
  const context=vm.createContext({document,innerWidth:1440,console});
  context.window=context;
  const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(match=>match[1]);
  if(scripts.length!==1)throw new Error('Expected one inline game script');
  vm.runInContext(scripts[0],context,{timeout:1000});
  const click=action=>listeners.click({target:{closest:selector=>selector==='[data-action]'?{dataset:{action}}:null},preventDefault(){}});
  return {context,nodes,click};
}
