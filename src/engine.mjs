import {advancedInitial,reduceAdvanced} from './advanced.mjs';
import {chapters} from './content.mjs';
export const STAGE_COUNT=chapters.length;
export function initialState(){
  return {
    ...advancedInitial(),stage:0,screen:'menu',hasStarted:false,returnScreen:'play',adClosed:[],adOverlays:[],sponsorId:null,attention:100,mistakes:0,recoveries:0,inspected:[],completed:[],
    layers:['prize'],route:'goal',history:[],tabClosed:false,paused:false,
    recipeExpanded:false,timetableOpen:false,saved:false,permissionSimulated:false,
    extras:{insurance:true,fast:true,trial:true},reviewed:false,cookie:true,
    lessonOpened:false,pushAllowed:true,pushQueue:[0,1,2],pushSettings:false,messageOpen:false,messageRead:false,
    cancelStep:'account',subscription:{status:'active',renewal:true,nextCharge:'2026-11-06',price:19},
    notice:'先记住你要做的事。这里没有倒计时，慢慢来。'
  };
}
export function total(s){return 48+(s.extras.insurance?12:0)+(s.extras.fast?18:0);}
export function stageAdIds(stage){const prefix={2:'ticket',3:'lesson',4:'inbox',5:'radio',6:'service',7:'job',8:'travel'}[stage];return prefix?(stage>=6?['banner','native','strip','rail','image','float','followup']:['banner','image','float','followup']).map(slot=>`${prefix}-${slot}`):[];}
function enterStage(s,stage){return {...initialState(),stage,screen:'play',hasStarted:true,attention:s.attention,mistakes:s.mistakes,recoveries:s.recoveries,inspected:[...s.inspected],completed:[...s.completed],layers:stage===0?['prize']:[],adOverlays:stageAdIds(stage).filter(id=>id.endsWith('-float')),notice:stageNotices[stage]};}
const mistake=(s,notice,patch={})=>({...s,...patch,mistakes:s.mistakes+1,attention:Math.max(15,s.attention-8),notice});
const finish=(s)=>({...s,screen:'debrief',layers:[],completed:[...new Set([...s.completed,s.stage])],notice:'原来的任务，完成了。'});
const enterDetour=(s,route,notice)=>mistake(s,notice,{route,history:[...s.history,s.route],layers:[]});
const stageNotices=[
  '先记住你要做的事。这里没有倒计时，慢慢来。',
  '这次，你只想要一份课表。',
  '买一张票，别买成一种生活方式。',
  '播放键长得都差不多，它们要带你去的地方可不同。',
  '这一次，通知权限已经开了。关掉一条消息，能让它们停下来吗？',
  '让一份不再需要的订阅，真正停下来。',
  '从服务来源到时段与价格，每一步都值得核对。',
  '标题里的高薪，和详情里的条件，是不是同一回事？',
  '便宜不等于合适。先记住日期、时段、退票和预算。'
];
export function reduce(s,a){
  if(a.type==='restart')return initialState();
  if(a.type==='stage.select')return Number.isInteger(a.value)&&a.value>=0&&a.value<STAGE_COUNT?enterStage(s,a.value):s;
  if(a.type==='menu.open')return s.screen==='menu'?s:{...s,screen:'menu',returnScreen:s.screen,paused:false};
  if(a.type==='menu.resume')return s.screen==='menu'&&s.hasStarted?{...s,screen:s.returnScreen,paused:false}:s;
  if(a.type==='retry')return s.hasStarted?enterStage(s,s.stage):s;
  if(a.type==='resume')return {...s,paused:false};
  if(s.paused)return s;
  if(a.type==='pause')return {...s,paused:true};
  if(a.type==='inspect')return {...s,inspected:[...new Set([...s.inspected,a.value])]};
  if(a.type==='next'&&s.screen==='debrief'){
    if(s.completed.length===STAGE_COUNT)return {...s,screen:'complete',notice:'九件小事都完成了。今天的决定权，回到你手里。'};
    if(s.stage===STAGE_COUNT-1)return {...s,screen:'menu',returnScreen:'debrief',notice:'这关完成了。还可以去看看其他的小事。'};
    return enterStage(s,s.stage+1);
  }
  if(s.screen!=='play')return s;
  if(a.type==='browser.return'||a.type==='browser.back')return {
    ...s,layers:[],adOverlays:[],route:a.type==='browser.back'?(s.history.at(-1)||'goal'):'goal',
    history:a.type==='browser.back'?s.history.slice(0,-1):[],tabClosed:false,timetableOpen:false,
    permissionSimulated:false,pushSettings:false,messageOpen:false,
    cancelStep:s.subscription.status==='cancelled'?'receipt':'account',recoveries:s.recoveries+1,
    notice:s.stage===4?'已回到消息中心。单独关掉页面不会撤回已经开启的通知权限。':'回到原来的任务。已经确认的选择仍然有效，误点也能重新决定。'
  };
  if(a.type==='browser.close')return {...s,tabClosed:true,layers:[],adOverlays:[],notice:'标签页已关闭。用「返回原页面」重新打开原页。'};
  if(s.tabClosed)return s;
  if(s.stage>=6&&s.route!=='goal'&&a.type==='advanced.lead')return mistake(s,'权益页又增加了一个条件。不要被已经点过的步骤困住，随时可以返回原页面。',{adLeadStep:Math.min(2,s.adLeadStep+1)});
  if(s.route!=='goal')return s;
  if(a.type.startsWith('ad.')){
    const valid=stageAdIds(s.stage);
    if(!valid.includes(a.value)||s.adClosed.includes(a.value))return s;
    const floating=a.value.endsWith('-float')||a.value.endsWith('-followup');
    if(floating&&!s.adOverlays.includes(a.value))return s;
    if(a.type==='ad.close')return {...s,adClosed:[...s.adClosed,a.value],adOverlays:s.adOverlays.filter(id=>id!==a.value),notice:'这一条广告已经关闭。'};
    if(a.type==='ad.fakeclose'&&a.value.endsWith('-float')){
      const extra=a.value.replace('-float','-followup');
      return mistake(s,'这个 × 又带来一张推广卡片。你仍可以关闭它，或返回原页面。',{adOverlays:[...new Set([...s.adOverlays,...(s.adClosed.includes(extra)?[]:[extra])])].slice(0,2)});
    }
    if(a.type==='ad.visit')return enterDetour({...s,sponsorId:a.value},'sponsor','打开了推广页面。原来的事情还在那里，可以随时返回。');
    return s;
  }
  if(s.stage>=6)return reduceAdvanced(s,a,{mistake,finish,enterDetour});
  if(s.stage===0){
    if(a.type==='notice.dismiss')return {...s,cookie:false,notice:'普通的页面提示可以关闭；判断来源和影响，比一概拒绝更有用。'};
    if(a.type==='trap.close')return mistake(s,'感谢关闭，我们已为您打开更贴心的一条。这个 × 是广告入口。',{layers:['prize','security']});
    if(a.type==='trap.prize')return enterDetour(s,'prize','奖品还没到，任务已经跑偏了。你可以使用上方的返回。');
    if(a.type==='trap.security')return enterDetour(s,'security','网页里的扫描动画不是系统检测。别被一条警告带走。');
    if(a.type==='recipe.expand')return {...s,recipeExpanded:true,notice:'找到了原始做法。记下第 3 步的烤箱温度。'};
    if(a.type==='recipe.answer'){
      if(!s.recipeExpanded)return {...s,notice:'先打开原始菜谱的做法，核对一下，别靠猜。'};
      return Number(a.value)===200?finish(s):mistake(s,'这个温度和原始菜谱不一致。再看第 3 步，可以重新填写。');
    }
  }
  if(s.stage===1){
    if(a.type==='trap.download')return enterDetour(s,'download','“高速下载”送来的不是课表，而是一个安装器。');
    if(a.type==='trap.permission')return mistake(s,'通知开启了；这不是拿到课表的必要条件。回到任务即可撤回。',{permissionSimulated:true,layers:['notification']});
    if(a.type==='pdf.open')return {...s,timetableOpen:true,notice:'核对文件名、发布者与学期，再保存到文件夹。'};
    if(a.type==='pdf.old')return {...s,notice:'这份是 2025 秋季旧版。任务需要 2026 秋季，继续找当前版本。'};
    if(a.type==='pdf.save'&&s.timetableOpen)return finish({...s,saved:true});
  }
  if(s.stage===2){
    if(a.type==='extra'&&Object.hasOwn(s.extras,a.value))return {...s,extras:{...s.extras,[a.value]:!s.extras[a.value]},reviewed:false,notice:'订单已更新。付款前再核对一次合计和后续费用。'};
    if(a.type==='trap.keep')return mistake(s,'“保留免费权益”保留的，也包括 7 天后的自动续费。',{extras:{...s.extras,trial:true},reviewed:false});
    if(a.type==='trial.cancel')return {...s,extras:{...s.extras,trial:false},reviewed:false,notice:'已移除试用会员与自动续费。普通门票仍然可以购买。'};
    if(a.type==='checkout.review')return {...s,reviewed:true,notice:'请核对本次金额、后续扣费，以及退改规则。确认后再提交订单。'};
    if(a.type==='checkout.pay'){
      if(!s.reviewed)return {...s,notice:'先展开订单核对，看看最后要付多少。'};
      if(total(s)>50)return mistake(s,'超出 ¥50 预算。移除不需要的附加项后，再次核对订单。');
      if(s.extras.trial)return mistake(s,'本次 ¥48，但 7 天后会自动续费 ¥39/月。先移除试用会员。');
      return finish(s);
    }
  }
  if(s.stage===3){
    if(a.type==='trap.play')return enterDetour(s,'video-ad','这个播放键属于推广卡片，打开的是广告，而不是薄荷修剪课。');
    if(a.type==='trap.update')return enterDetour(s,'update','播放课程无需更新插件。这是播放器更新诱导。');
    if(a.type==='trap.videoDownload')return enterDetour(s,'video-download','拿到的是“万能播放助手”。原课程可以直接在本页阅读。');
    if(a.type==='lesson.play')return {...s,lessonOpened:true,notice:'已打开原课程。三幅分镜和完整文字都在这里，不需要等播放结束。'};
    if(a.type==='lesson.answer'){
      if(!s.lessonOpened)return {...s,notice:'先打开原课程，核对老师的修剪要点。'};
      return a.value==='node'?finish(s):mistake(s,'再看看第 2 幅分镜：在一对叶子的叶节上方剪，保留下面的叶片。');
    }
  }
  if(s.stage===4){
    if(a.type==='notifications.settings')return {...s,pushSettings:!s.pushSettings,notice:'查看这个来源是否被允许发送通知，再决定是否保留。'};
    if(a.type==='notifications.block'&&s.pushSettings)return {...s,pushAllowed:false,pushQueue:[],notice:'已禁止「好运速报」发送通知。阅览室的有用消息仍然保留。'};
    if(a.type==='notifications.dismiss')return {...s,pushQueue:s.pushQueue.filter(id=>id!==Number(a.value)),notice:s.pushAllowed?'这一条关掉了，但来源仍有权限。可以检查权限设置。':'这一条已关闭。被禁止的来源不会再次补入通知。'};
    if(a.type==='notifications.refresh')return {...s,pushQueue:s.pushAllowed?[0,1,2]:[],notice:s.pushAllowed?'又来了三条。关消息只清理当前列表，没有撤销来源的权限。':'没有新增推广通知。现在可以安静地核对阅览室消息。'};
    if(a.type==='message.open')return {...s,messageOpen:true,notice:'找到阅览室的取书消息了。核对地点和时间，再记下它。'};
    if(a.type==='message.ack'){
      if(!s.messageOpen)return {...s,notice:'先打开阅览室的原始消息。'};
      if(s.pushAllowed)return {...s,messageRead:true,notice:'消息记下了，但「好运速报」仍可发送通知。先撤回这个无关来源的权限。'};
      return finish({...s,messageRead:true});
    }
  }
  if(s.stage===5){
    if(a.type==='subscription.manage')return {...s,cancelStep:s.subscription.status==='cancelled'?'receipt':'manage',notice:'订阅管理里列出了当前状态、下次扣费和取消入口。'};
    if(a.type==='cancellation.start'&&s.cancelStep==='manage'&&s.subscription.status!=='cancelled')return {...s,cancelStep:'offers',notice:'接下来会出现挽留方案。先看每个选项是否真的停止续费。'};
    if(s.cancelStep==='offers'){
      if(a.type==='trap.discount')return mistake(s,'优惠已经应用，但订阅还在，下次仍会扣费。可以重新进入管理并取消。',{cancelStep:'account',subscription:{status:'discounted',renewal:true,nextCharge:'2026-11-06',price:9}});
      if(a.type==='trap.pause')return mistake(s,'暂停只延后扣费：2026-12-06 会恢复 ¥19/月。它还没有被取消。',{cancelStep:'account',subscription:{status:'paused',renewal:true,nextCharge:'2026-12-06',price:19}});
      if(a.type==='cancellation.continue')return {...s,cancelStep:'review',notice:'你还没取消。请核对下面的最终确认说明。'};
    }
    if(a.type==='cancellation.confirm'&&s.cancelStep==='review')return {...s,cancelStep:'receipt',subscription:{...s.subscription,status:'cancelled',renewal:false,nextCharge:null},notice:'取消已生效。最后核对回执中的订阅状态和下次扣费。'};
    if(a.type==='cancellation.verify'){
      if(s.cancelStep==='receipt'&&s.subscription.status==='cancelled'&&!s.subscription.renewal&&s.subscription.nextCharge===null)return finish(s);
      return {...s,notice:'还没有有效的取消回执。优惠、暂停和“正在办理”都不代表取消完成。'};
    }
  }
  return s;
}
