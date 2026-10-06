// Fixed, fictional catalogs keep every constraint readable and every route repeatable.
export const serviceSlots={
 'sat-am':{label:'周六 10 月 10 日 · 09:00–11:00',day:'sat',period:'am'},
 'sat-pm':{label:'周六 10 月 10 日 · 14:00–16:00',day:'sat',period:'pm'},
 'sun-am':{label:'周日 10 月 11 日 · 09:00–11:00',day:'sun',period:'am'}
};
export const jobCatalog=[
 {id:'training',company:'跃步研习社',title:'产品体验助理',headline:'综合收入 ¥8,000–12,000',base:3000,weekends:false,direct:true,fee:2980,detail:'先参加就业提升课程；培训费 ¥2,980。固定底薪 ¥3,000，其余为绩效；每周单休。',tag:'热门推荐'},
 {id:'agency',company:'速聘人才服务',title:'优选文职岗位',headline:'最高可达 ¥10,000',base:4500,weekends:true,direct:false,fee:399,detail:'由人才中介收集意向，入职服务费 ¥399；固定底薪 ¥4,500，最高收入含绩效。',tag:'合作职位'},
 {id:'qinghe',company:'青禾文具',title:'订单客服',headline:'固定底薪 ¥6,500 / 月',base:6500,weekends:true,direct:true,fee:0,detail:'青禾文具人事部直接招聘；周一至周五 09:00–18:00，周末双休；不收培训费或入职费。',tag:'企业直招'}
];
export const tripCatalog=[
 {id:'cheap',code:'W201',price:68,day:'sat',depart:'08:10',arrive:'09:40',direct:true,refundable:false,label:'特惠早班',terms:'特惠票出票后不退；可改签一次，收取 ¥30。'},
 {id:'late',code:'W305',price:88,day:'sat',depart:'13:10',arrive:'14:30',direct:true,refundable:true,label:'午后优选',terms:'出发前 24 小时可免费退票；之后不可退。'},
 {id:'connection',code:'W112 + W206',price:79,day:'sat',depart:'09:00',arrive:'11:50',direct:false,refundable:true,label:'联程优惠',terms:'在南湾换乘一次，间隔 45 分钟；出发前 24 小时可免费退票。'},
 {id:'wrong-day',code:'W208',price:92,day:'sun',depart:'09:20',arrive:'10:40',direct:true,refundable:true,label:'次日低价',terms:'本班为周日；出发前 24 小时可免费退票。'},
 {id:'river',code:'W218',price:108,day:'sat',depart:'09:20',arrive:'10:40',direct:true,refundable:true,label:'标准可退',terms:'出发前 24 小时可免费退票；之后不可退。无强制附加服务。'}
];
export function advancedInitial(){return {
 service:{step:'search',official:false,slot:null,speed:true,reviewed:false,receipt:null,validation:null},
 job:{step:'search',selected:null,contact:true,referral:true,reviewed:false,receipt:null,validation:null},
 travel:{step:'search',selected:null,extras:{insurance:true,shuttle:true,club:true},reviewed:false,receipt:null,validation:null},
 adLeadStep:0
};}
export function tripTotal(t){return (tripCatalog.find(x=>x.id===t.selected)?.price||0)+(t.extras.insurance?20:0)+(t.extras.shuttle?18:0);}
export function reduceAdvanced(s,a,{mistake,finish,enterDetour}){
 const key={6:'service',7:'job',8:'travel'}[s.stage];
 if(!key)return s;
 const v=s[key];
 const update=(patch,notice)=>({...s,[key]:{...v,validation:null,...patch},notice});
 const invalid=(notice,penalty=false)=>({...penalty?mistake(s,notice):{...s,notice},[key]:{...v,validation:notice}});
 const edit=(patch,notice)=>update({...patch,reviewed:false,receipt:null,step:key==='service'?'form':'detail'},notice);
 const receipt=(data)=>update({step:'receipt',receipt:data},'提交已经完成。请核对回执是否与原来的目标一致。');
 if(a.type===`${key}.verify`){if(v.step==='receipt'&&v.receipt)return finish(s);return {...s,notice:'还没有有效回执。请先完成选择、核对和提交。'};}
 if(v.step==='receipt')return s;
 if(s.stage===6){
  if(a.type==='service.partner'||a.type==='service.remote')return enterDetour({...s,adLeadStep:0},a.type==='service.partner'?'service-helper':'service-remote','进入了第三方服务页面。请先核对服务提供方，再决定是否继续。');
  if(a.type==='service.official')return update({official:true,step:'form',reviewed:false},'已打开松果家电官方预约。免费到店检测无需购买优先服务。');
  if(!v.official)return s;
  if(a.type==='service.slot'&&Object.hasOwn(serviceSlots,a.value))return edit({slot:a.value},'预约时段已更新。请与自己的周六上午安排核对。');
  if(a.type==='service.speed')return edit({speed:!v.speed},'优先服务已更新。不购买也能预约相同的免费检测时段。');
  if(a.type==='service.review'){if(!v.slot)return invalid('先选择检测时段，再核对预约。');return update({step:'review',reviewed:true},'核对服务提供方、时段和本次费用，再提交预约。');}
  if(a.type==='service.submit'){
   if(!v.reviewed)return invalid('选择发生变化或尚未核对，请重新展开预约核对。');
   if(v.slot!=='sat-am')return invalid('这个时段不是周六上午。可以直接修改预约时段。',true);
   if(v.speed)return invalid('优先服务会收取 ¥39。原任务只需要免费的官方到店检测。',true);
   return receipt({provider:'松果家电官方售后',slot:serviceSlots[v.slot].label,total:0,code:'SG-1010-042'});
  }
 }
 if(s.stage===7){
  if(a.type==='job.vip')return enterDetour({...s,adLeadStep:0},'job-vip','打开了付费内推服务。它不能代替向企业直接投递。');
  if(a.type==='job.search')return update({step:'search',reviewed:false,receipt:null,validation:null},'回到职位列表。已撤掉的附加项保持原样。');
  if(a.type==='job.open'&&jobCatalog.some(x=>x.id===a.value))return edit({selected:a.value},'已展开完整职位详情。醒目的综合收入不等于固定底薪。');
  if(!v.selected)return s;
  if(a.type==='job.contact')return edit({contact:!v.contact},'通讯录推荐已更新。投递这个职位不需要开放通讯录。');
  if(a.type==='job.referral')return edit({referral:!v.referral},'内推服务已更新。可直接免费投递企业岗位。');
  if(a.type==='job.review')return update({step:'review',reviewed:true},'核对招聘方、固定底薪、休息日、费用和资料范围。');
  if(a.type==='job.submit'){
   if(!v.reviewed)return invalid('请先核对当前投递内容，修改选项后需要重新核对。');
   const job=jobCatalog.find(x=>x.id===v.selected);
   if(!job?.direct||job.base<6000||!job.weekends||job.fee)return invalid('这个岗位不满足企业直招、固定底薪至少 ¥6,000、双休且不交费的全部条件。回到列表重新选择。',true);
   if(v.contact||v.referral)return invalid('通讯录授权或付费内推仍被选中。两项都不是投递的必要条件。',true);
   return receipt({company:job.company,title:job.title,base:job.base,total:0,scope:'仅现有简历',code:'QH-2026-071'});
  }
 }
 if(s.stage===8){
  if(a.type==='travel.coupon')return enterDetour({...s,adLeadStep:0},'travel-coupon','进入了低价权益领取页面。优惠条件可能改变你的行程和后续费用。');
  if(a.type==='travel.search')return update({step:'search',reviewed:false,receipt:null,validation:null},'回到全部班次。已经取消的附加服务仍然保持取消。');
  if(a.type==='travel.open'&&tripCatalog.some(x=>x.id===a.value))return edit({selected:a.value},'已展开行程与退改规则。低价之外，还要核对日期、时段和是否换乘。');
  if(!v.selected)return s;
  if(a.type==='travel.extra'&&Object.hasOwn(v.extras,a.value))return edit({extras:{...v.extras,[a.value]:!v.extras[a.value]}},'服务选择已更新。请重新核对本次总价与后续费用。');
  if(a.type==='travel.review')return update({step:'review',reviewed:true},'行程、本次费用、后续费用和退票规则已经展开。');
  if(a.type==='travel.submit'){
   if(!v.reviewed)return invalid('请先核对当前行程。改过班次或服务后，需要重新核对。');
   const trip=tripCatalog.find(x=>x.id===v.selected);
   if(!trip||trip.day!=='sat'||trip.depart>='12:00'||!trip.direct||!trip.refundable)return invalid('这班车不满足周六上午、直达和可退的全部要求。可以返回班次列表重选。',true);
   if(tripTotal(v)>120)return invalid('合计超过 ¥120。先核对并移除不需要的附加服务。',true);
   if(Object.values(v.extras).some(Boolean))return invalid('仍有附加服务或自动续费会员。只保留车票，再确认完整费用。',true);
   return receipt({code:trip.code,date:'周六 10 月 10 日',depart:trip.depart,arrive:trip.arrive,total:tripTotal(v),recurring:'无',refund:trip.terms});
  }
 }
 return s;
}
