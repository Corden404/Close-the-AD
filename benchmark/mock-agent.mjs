/** Deliberately simple, model-free comparison policies. They only read public packets. */
export function createMockAgent(mode='random',seed='1') {
  if(!['random','heuristic'].includes(mode))throw new Error('Unknown mock agent');
  let state=2166136261;
  for(const char of String(seed)){state^=char.codePointAt(0);state=Math.imul(state,16777619);}
  const random=()=>{state+=0x6D2B79F5;let t=Math.imul(state^(state>>>15),1|state);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};
  const seen=new Map();let rememberedTemperature=null,scrollSteps=0;
  return ({observation})=>{
    const candidates=observation.candidates;
    if(!candidates.length)return null;
    const act=(candidate,action=candidate.operations[0],extra={})=>({snapshot_id:observation.snapshot_id,action,target_id:candidate.id,...extra});
    if(mode==='heuristic') {
      const text=observation.regions.map(r=>r.text).join(' ');
      const match=text.match(/预热至\s*(\d+)\s*°?C/i);if(match)rememberedTemperature=match[1];
      const input=candidates.find(c=>c.operations.includes('fill'));
      if(input&&rememberedTemperature&&input.value!==rememberedTemperature)return act(input,'fill',{value:rememberedTemperature});
      const checkbox=candidates.find(c=>c.kind==='checkbox'&&c.checked);
      if(checkbox)return act(checkbox,'click');
      // A domain-specific keyword baseline, not a hidden optimal-path oracle.
      const priority=[/^关闭广告$/, /继续放弃/,/展开做法/,/打开附件/,/保存到/,/管理试用会员/,/展开订单核对/,/确认.*(?:购买|付款|支付)|提交订单/,/播放原课程/,/叶节上方/,/改为禁止/,/打开站点权限/,/查看.*(?:消息|取书)|打开.*消息/,/记下.*(?:消息|时间|地点)|记好了/,/管理我的订阅/,/取消订阅/,/继续取消/,/确认取消/,/已核对/];
      for(const pattern of priority){const target=candidates.find(c=>c.operations.includes('click')&&pattern.test(c.label)&&(seen.get(`${c.label}|${c.context}`)||0)<2);if(target){const key=`${target.label}|${target.context}`;seen.set(key,(seen.get(key)||0)+1);return act(target,'click');}}
      const back=candidates.find(c=>/返回原页面/.test(c.label));
      if(back&&/幸运访客|你来到了一个推广页面|严重问题/.test(text))return act(back,'click');
      const scroll=candidates.find(c=>c.operations.includes('scroll'));
      if(scroll){scrollSteps++;return act(scroll,'scroll',{delta_y:scrollSteps%8===0?-900:500});}
    }
    const candidate=candidates[Math.floor(random()*candidates.length)];
    const action=candidate.operations[Math.floor(random()*candidate.operations.length)];
    return act(candidate,action,action==='fill'?{value:String(50+Math.floor(random()*251))}:action==='scroll'?{delta_y:random()<.75?500:-500}:{});
  };
}
