// Original inline artwork and fictional campaigns. No remote assets or real links.
const artShapes={
 city:`<circle cx="480" cy="60" r="62" fill="#ffd480"/><path d="M0 207Q130 135 255 205t345-35v130H0z" fill="#dc8e7e"/><path d="M72 122h85v139H72zm137-58h106v197H209zm151 78h116v119H360z" fill="#723f58"/><g fill="#f8dba5"><path d="M92 146h15v19H92zm30 0h15v19h-15zm-30 36h15v19H92zm30 0h15v19h-15zM231 89h20v25h-20zm41 0h20v25h-20zm-41 45h20v25h-20zm41 0h20v25h-20zm-41 46h20v25h-20zm41 0h20v25h-20zM380 167h24v26h-24zm44 0h24v26h-24z"/></g><path d="M0 260h600v40H0z" fill="#542d44"/><path d="M370 236q24-18 54 0l18 34h-91z" fill="#fad38c"/><circle cx="372" cy="271" r="10" fill="#40223c"/><circle cx="423" cy="271" r="10" fill="#40223c"/>`,
 garden:`<circle cx="460" cy="58" r="73" fill="#e5e9a9"/><path d="M0 258q80-52 161-10t180-15 259 9v58H0z" fill="#b0c9a0"/><g fill="#d78361"><path d="M75 170h127l-20 112H94z"/><path d="M335 183h147l-23 99H357z"/></g><g fill="none" stroke="#476950" stroke-width="10" stroke-linecap="round"><path d="M137 170V50m0 75-37-34m37 54 41-39m225 77V83m0 40 42-33m-42 52-41-19"/></g><g fill="#648b62"><ellipse cx="107" cy="84" rx="34" ry="18" transform="rotate(35 107 84)"/><ellipse cx="171" cy="99" rx="34" ry="18" transform="rotate(-37 171 99)"/><ellipse cx="139" cy="42" rx="19" ry="33"/><ellipse cx="445" cy="81" rx="34" ry="18" transform="rotate(-31 445 81)"/><ellipse cx="367" cy="117" rx="34" ry="18" transform="rotate(32 367 117)"/><ellipse cx="405" cy="68" rx="18" ry="31"/></g><path d="M244 191l36-21 25 23-22 75h-48z" fill="#f3cf74"/><path d="M300 196l36-25" stroke="#f3cf74" stroke-width="12" stroke-linecap="round"/>`,
 headphones:`<circle cx="304" cy="155" r="118" fill="#b69fcc" opacity=".28"/><circle cx="460" cy="51" r="35" fill="#e4c490"/><path d="M197 185v-48a104 104 0 01208 0v48" fill="none" stroke="#e9d9ce" stroke-width="30"/><path d="M197 137a104 104 0 01208 0" fill="none" stroke="#716583" stroke-width="14"/><g fill="#ddd0c4" stroke="#675772" stroke-width="6"><rect x="166" y="144" width="68" height="100" rx="28"/><rect x="368" y="144" width="68" height="100" rx="28"/></g><g stroke="#b4a3c4" stroke-width="6" stroke-linecap="round"><path d="M77 116v43m-19-29v15m416-4v69m20-50v31m20-20v10"/></g><path d="M290 245h28" stroke="#e4c490" stroke-width="5" stroke-linecap="round"/>`,
 lamp:`<circle cx="208" cy="153" r="115" fill="#f8d798" opacity=".5"/><path d="M343 42h79l63 114H278z" fill="#d5b77c"/><path d="M381 155v98m-51 7h103" stroke="#7d6552" stroke-width="13" stroke-linecap="round"/><path d="M60 266h461" stroke="#886d56" stroke-width="10"/><g transform="rotate(-6 180 215)"><rect x="91" y="226" width="163" height="29" rx="5" fill="#71967e"/><rect x="110" y="195" width="155" height="28" rx="5" fill="#bd7c67"/><path d="M135 147q40-10 65 9 30-13 57-5v58q-31-8-57 3-24-11-65-5z" fill="#fff4d3"/><path d="M200 156v53" stroke="#d5bda0" stroke-width="3"/></g><path d="M485 211h39v44h-39z" fill="#d99e82"/><path d="M524 216q30-5 21 22l-21 1" fill="none" stroke="#d99e82" stroke-width="8"/>`,
 kitchen:`<ellipse cx="300" cy="160" rx="180" ry="109" fill="#fff2d7"/><ellipse cx="300" cy="160" rx="147" ry="85" fill="#d37b55"/><g fill="none" stroke="#edc978" stroke-width="15" stroke-linecap="round"><path d="M192 141q37-43 71-7t59 0 70 14m-191 30q31-33 65-1t60-1 66 10m-162-73q55 12 103 1"/></g><g fill="#537b59"><path d="M278 164q-52-55-65-20 10 25 65 20zm0 0q-12-61 25-53 18 31-25 53z"/></g><circle cx="360" cy="193" r="21" fill="#ad4d3b"/><circle cx="210" cy="162" r="17" fill="#ad4d3b"/>`,
 paper:`<g transform="rotate(-7 290 156)"><rect x="159" y="29" width="261" height="260" rx="10" fill="#fffdf0"/><path d="M191 80h181" stroke="#88a3b7" stroke-width="10"/><g stroke="#c3d2dc" stroke-width="3"><path d="M192 117h179v126H192zm0 42h179m-179 42h179m-119-84v126m60-126v126"/></g><g fill="#b3c4a4"><rect x="201" y="127" width="41" height="23" rx="4"/><rect x="261" y="169" width="41" height="23" rx="4"/><rect x="321" y="210" width="41" height="23" rx="4"/></g></g>`
};

Object.assign(artShapes,{
 service:`<circle cx="467" cy="70" r="63" fill="#e7d496"/><rect x="170" y="35" width="205" height="229" rx="18" fill="#fff4d8" stroke="#5c7566" stroke-width="6"/><path d="M173 85h200" stroke="#b4bd9c" stroke-width="4"/><circle cx="275" cy="171" r="68" fill="#6d9e98" stroke="#5c7566" stroke-width="7"/><circle cx="275" cy="171" r="52" fill="#a9cbc0"/><path d="M224 184q25-23 51-1t51-2v23q-52 49-102 0z" fill="#709e9a"/><rect x="195" y="51" width="58" height="18" rx="5" fill="#a9b694"/><circle cx="344" cy="61" r="10" fill="#b87551"/><path d="M95 243V150m0 57-29-28m29 6 27-34" fill="none" stroke="#557d5e" stroke-width="7"/><g fill="#84a475"><ellipse cx="65" cy="171" rx="23" ry="12" transform="rotate(30 65 171)"/><ellipse cx="123" cy="144" rx="24" ry="13" transform="rotate(-35 123 144)"/></g><path d="M61 230h68l-10 49H70z" fill="#c98762"/><path d="m418 250 63-64a24 24 0 0128-30l-13 17 12 12 19-10a24 24 0 01-31 26l-62 66z" fill="#bf875d" stroke="#786650" stroke-width="3"/><ellipse cx="280" cy="284" rx="240" ry="7" fill="#52735c" opacity=".15"/>`,
 work:`<circle cx="462" cy="72" r="63" fill="#e5b96f"/><path d="M35 253h530" stroke="#9e7059" stroke-width="13" stroke-linecap="round"/><path d="M153 63h269l-18 174H172z" fill="#6a708b"/><path d="M168 78h240l-15 142H182z" fill="#e4e3d2"/><path d="M211 117h144m-144 31h101m-101 29h125" stroke="#a0bba6" stroke-width="13"/><path d="M133 237h309l-17 17H150z" fill="#515a74"/><rect x="73" y="164" width="61" height="73" rx="8" fill="#cb976c"/><path d="M88 170 76 98m32 72 8-81" stroke="#798e87" stroke-width="9"/><path d="M459 179h56v59h-56z" fill="#e7d3a7"/><path d="M515 188q33-8 27 21l-27 5" fill="none" stroke="#e7d3a7" stroke-width="9"/><path d="M474 160q-12-17 0-33m22 33q-12-17 0-33" fill="none" stroke="#d3b37f" stroke-width="4"/>`,
 journey:`<circle cx="467" cy="53" r="43" fill="#f4cf7d"/><path d="m0 188 116-114 92 113 103-138 123 134 80-90 86 104v103H0z" fill="#9db2a3"/><path d="m0 235 151-97 111 91 138-102 200 103v70H0z" fill="#759c91"/><path d="M0 266h600v34H0z" fill="#ddcaa6"/><g transform="rotate(-3 299 201)"><rect x="139" y="125" width="324" height="122" rx="25" fill="#487b94" stroke="#35566a" stroke-width="4"/><path d="M159 145h233v52H159z" fill="#d8e4d4"/><path d="M408 144h31q9 0 9 13v42h-40z" fill="#e5ddbd"/><path d="M215 145v52m61-52v52m60-52v52" stroke="#487b94" stroke-width="8"/><path d="M148 212h246" stroke="#dbc596" stroke-width="8"/><circle cx="206" cy="247" r="23" fill="#344854"/><circle cx="398" cy="247" r="23" fill="#344854"/><circle cx="206" cy="247" r="10" fill="#d9cdb9"/><circle cx="398" cy="247" r="10" fill="#d9cdb9"/></g><path d="M34 286h60m95 0h60m95 0h60m95 0h60" stroke="#fff2d0" stroke-width="5"/>`
});
export function chapterArtwork(stage){return adArtwork(['kitchen','paper','city','garden','lamp','headphones','service','work','journey'][stage]);}
function adArtwork(kind){return `<svg class="ad-artwork" viewBox="0 0 600 300" role="img" aria-label="${{city:'暮色城市与街角小车',garden:'阳台花盆与浇水壶',headphones:'奶油色头戴耳机',lamp:'暖灯下摊开的书',kitchen:'番茄焗意面插画',paper:'课程表纸张插画',service:'绿植旁的奶油色洗衣机与工具',work:'暖色办公桌、笔记本与文具',journey:'山间公路上的蓝色客车'}[kind]}">${artShapes[kind]}</svg>`;}
export const adCatalog=[
 {id:'ticket-banner',stage:2,slot:'banner',brand:'漫游通',host:'roaming-pass.example',theme:'sunset',eyebrow:'城市周末特选',title:'看完展，再住一晚。',copy:'把周末拉长一点。精选街区酒店，本周推荐。',cta:'查看周末礼遇',art:'city',animated:true},
 {id:'ticket-image',stage:2,slot:'image',brand:'角落咖啡',host:'corner-coffee.example',theme:'coffee',eyebrow:'散场之后，来点刚刚好',title:'你的下一站，一杯好咖啡。',copy:'附近门店 · 午后双杯套餐',cta:'领取双杯券',art:'lamp'},
 {id:'ticket-float',stage:2,slot:'float',brand:'出发礼遇',host:'trip-perks.example',theme:'sunset',eyebrow:'本周观展福利',title:'你的专属 ¥80 礼包',copy:'住宿、出行、下午茶。让这一天更完整。',cta:'立即领福利',art:'city',animated:true,fakeClose:true},
 {id:'ticket-followup',stage:2,slot:'followup',brand:'漫游通',host:'roaming-pass.example',theme:'coffee',eyebrow:'好礼还在',title:'再看一眼，别错过。',copy:'免费加入礼遇计划，发现更多周末灵感。',cta:'了解礼遇计划',art:'lamp'},
 {id:'lesson-banner',stage:3,slot:'banner',brand:'芽芽集',host:'sprout-store.example',theme:'garden',eyebrow:'阳台园艺季',title:'一盆薄荷，长出一点小森林。',copy:'新手种植组合 · 陶盆 / 营养土 / 修剪剪刀',cta:'发现种植组合',art:'garden',animated:true},
 {id:'lesson-image',stage:3,slot:'image',brand:'晴窗生活',host:'sunny-window.example',theme:'coffee',eyebrow:'给日常一点光',title:'把窗台，变成喜欢的样子。',copy:'阳台改造灵感册 · 轻松开始',cta:'打开灵感册',art:'lamp'},
 {id:'lesson-float',stage:3,slot:'float',brand:'一课通',host:'all-lessons.example',theme:'violet',eyebrow:'精选课程推荐',title:'升级你的学习方式',copy:'高清课堂 · 专属音频 · 更多进阶内容',cta:'即刻体验',art:'headphones',animated:true,fakeClose:true},
 {id:'lesson-followup',stage:3,slot:'followup',brand:'芽芽集',host:'sprout-store.example',theme:'garden',eyebrow:'新手好礼',title:'第一盆绿意，就从这里开始。',copy:'入门种植清单已经为你准备好。',cta:'领取种植清单',art:'garden'},
 {id:'inbox-banner',stage:4,slot:'banner',brand:'读光',host:'reading-light.example',theme:'coffee',eyebrow:'给故事，留一盏灯',title:'今晚，读到喜欢的那一页。',copy:'柔光阅读灯 · 三档色温 · 陪你多读一会儿',cta:'探索阅读灯',art:'lamp',animated:true},
 {id:'inbox-image',stage:4,slot:'image',brand:'静界',host:'quiet-world.example',theme:'violet',eyebrow:'为专注留一个位置',title:'让世界小声一点。',copy:'轻量头戴耳机 · 阅读与通勤的好搭档',cta:'看看静界耳机',art:'headphones'},
 {id:'inbox-float',stage:4,slot:'float',brand:'好书来信',host:'book-letter.example',theme:'garden',eyebrow:'有一份新书单等你',title:'读完这本，再读下一本。',copy:'每周精选好书与限定周边，邀你一起发现。',cta:'查看本周书单',art:'lamp',animated:true,fakeClose:true},
 {id:'inbox-followup',stage:4,slot:'followup',brand:'读光',host:'reading-light.example',theme:'coffee',eyebrow:'为阅读多想一点',title:'你的阅读角，还差这一盏。',copy:'桌面新搭配，温暖每一个安静的晚上。',cta:'查看搭配',art:'lamp'},
 {id:'radio-banner',stage:5,slot:'banner',brand:'声岛',host:'sound-island.example',theme:'violet',eyebrow:'听见更多细节',title:'好声音，值得一副好耳机。',copy:'声岛 AIR · 柔软耳罩 / 轻盈佩戴',cta:'探索声岛 AIR',art:'headphones',animated:true},
 {id:'radio-image',stage:5,slot:'image',brand:'慢频旅行',host:'slow-trip.example',theme:'sunset',eyebrow:'换个地方，继续听',title:'城市之外，有另一种节奏。',copy:'周末短途路线 · 收集路上的声音',cta:'打开周末地图',art:'city'},
 {id:'radio-float',stage:5,slot:'float',brand:'轻听精选',host:'radio-picks.example',theme:'coffee',eyebrow:'为你精选',title:'离开前，听听这一张。',copy:'新的歌单，熟悉的心情。今天的推荐已更新。',cta:'打开今日歌单',art:'headphones',animated:true,fakeClose:true},
 {id:'radio-followup',stage:5,slot:'followup',brand:'声岛',host:'sound-island.example',theme:'violet',eyebrow:'会员专享推荐',title:'把好声音，带回家。',copy:'发现适合自己的听音装备。',cta:'查看专属推荐',art:'headphones'}
];

const advancedCampaigns=[
 [6,'service',[
  ['banner','净日生活','clean-day.example','garden','洗衣机的下一位搭档','把洗衣这件事，交给清新的香气。','衣物护理系列 · 凝珠 / 留香珠 / 柔顺剂','发现护理套装','service',true],
  ['native','家务小队','home-team.example','coffee','一键焕新你的家','周末，不必都花在家务上。','上门清洁组合 · 本周精选','查看清洁服务','lamp',true],
  ['strip','松间优选','pine-picks.example','garden','旧机换新季','给日常，换一台更轻松。','指定机型以旧换新，价格按评估结果计算','看看焕新计划','service',true],
  ['rail','到家快修','quick-repair.example','sunset','附近服务推荐','有小问题，别等大麻烦。','非品牌官方服务 · 预约上门检测','了解附近师傅','service',false],
  ['image','软云家居','soft-cloud.example','coffee','把生活整理得轻一点','洗好的衣服，也值得一个好位置。','收纳柜与晾晒组合 · 小空间灵感','打开收纳灵感','garden',false],
  ['float','安心家计划','home-care.example','garden','检测前，多一份安心','你的家电关怀礼包已备好','延保、清洗、安装组合。按服务条件使用。','领取关怀礼包','service',true],
  ['followup','家务小队','home-team.example','sunset','再多看一眼','首单好礼，等你发现。','服务范围与价格以套餐详情为准。','查看首单套餐','lamp',false]
 ]],
 [7,'job',[
  ['banner','桌上有光','desk-light.example','coffee','新工作 · 新桌面','给下一段日常，一个好开场。','桌面收纳与护眼灯 · 开工搭配','发现开工好物','work',true],
  ['native','职途研习社','career-study.example','violet','让简历更出彩','面试之前，先加一点底气。','表达训练与简历课程 · 查看课程收费','看看提升课程','paper',true],
  ['strip','名片工场','card-studio.example','sunset','第一印象计划','让你的经历，被好好看见。','简历排版与形象照组合服务','查看服务套餐','work',true],
  ['rail','跃步人才','step-talent.example','violet','热招推荐','高薪机会，离你近一点。','综合收入含绩效；岗位详情需另行核对','探索高薪专区','work',false],
  ['image','午后补给','afternoon-fuel.example','coffee','工作日的小确幸','把咖啡带上，把状态找回来。','通勤杯与咖啡豆 · 工作日组合','打开补给清单','lamp',false],
  ['float','职途通','career-pass.example','violet','专属求职推荐','你的优先机会已就绪','简历置顶、优先曝光、岗位推荐。','了解优先权益','work',true],
  ['followup','职途研习社','career-study.example','sunset','面试季福利','下一次面试，准备好了吗？','职业课程与咨询服务，按所选项目收费。','查看课程组合','paper',false]
 ]],
 [8,'travel',[
  ['banner','白沙慢住','baisha-stay.example','sunset','到站之后，慢一点','海边的周末，值得多留一晚。','民宿与早餐组合 · 查看可订日期','探索周末房型','city',true],
  ['native','轻装出门','light-packing.example','coffee','周末轻装计划','只带必要的，也带喜欢的。','短途出行收纳与随身用品','打开轻装清单','journey',true],
  ['strip','沿途咖啡','route-coffee.example','sunset','下一站，有点香','等车的时间，也可以很好。','车站门店 · 双杯出行套餐','领取出发好礼','lamp',true],
  ['rail','旅享会','go-perks.example','garden','会员专属价','低至 ¥49，去看别的风景。','限指定班次及日期；部分票种不可退','查看低价条件','journey',false],
  ['image','山海留声','land-sound.example','violet','路上听点什么','一副耳机，一小段自己的时间。','轻量降噪系列 · 适合通勤和周末','探索旅途耳机','headphones',false],
  ['float','出发礼遇','departure-perks.example','sunset','周末礼遇已送达','你的出行礼包正在等你','车票券、接驳、酒店权益，按条件使用。','先领取，再出发','journey',true],
  ['followup','白沙慢住','baisha-stay.example','coffee','让好心情多住一天','顺便，把落日也订下。','周末住宿精选 · 房价及退改以详情为准','看看海边住宿','city',false]
 ]]
];
for(const [stage,prefix,rows] of advancedCampaigns)for(const [slot,brand,host,theme,eyebrow,title,copy,cta,art,animated] of rows)adCatalog.push({id:`${prefix}-${slot}`,stage,slot,brand,host,theme,eyebrow,title,copy,cta,art,animated,fakeClose:slot==='float'});
export function renderStageAds(s,slot,ib){
 if(s.screen!=='play'||s.route!=='goal'||s.tabClosed)return '';
 return adCatalog.filter(ad=>ad.stage===s.stage&&!s.adClosed.includes(ad.id)&&(slot==='overlay'?s.adOverlays.includes(ad.id):ad.slot===slot)).map(ad=>renderAd(ad,ib)).join('');
}
function renderAd(ad,ib){
 const overlay=ad.slot==='float'||ad.slot==='followup';
 const closeAction=`ad.${ad.fakeClose?'fakeclose':'close'}.${ad.id}`;
 return `<aside class="campaign-ad ad ad-${ad.slot} ad-theme-${ad.theme} ${ad.animated?'ad-animated':''}" data-ad-id="${ad.id}" aria-label="${ad.brand}推广"><div class="campaign-meta"><span>${ad.brand} <small>广告</small></span>${ib(closeAction,'×','campaign-close',`aria-label="关闭${ad.brand}推广"`)}</div><div class="campaign-visual">${adArtwork(ad.art)}<span class="ad-glint" aria-hidden="true"></span>${ad.animated?'<span class="ad-orbit" aria-hidden="true">✦</span>':''}</div><div class="campaign-copy"><span class="campaign-eyebrow">${ad.eyebrow}</span><h3>${ad.title}</h3><p>${ad.copy}</p>${ib(`ad.visit.${ad.id}`,`${ad.cta} <span aria-hidden="true">↗</span>`,'campaign-cta')}</div>${overlay?`<div class="campaign-foot"><span>${ad.host}</span>${ad.fakeClose?ib(`ad.close.${ad.id}`,'关闭广告','campaign-dismiss'):''}</div>`:''}</aside>`;
}
export function installAdInspections(registry){
 for(const ad of adCatalog){
  registry[`ad.visit.${ad.id}`]={title:`${ad.brand}的推广入口`,source:`${ad.host} · 第三方广告`,target:`${ad.brand}推广页面`,effect:'打开推广内容，离开当前任务页面。',clue:'先判断这份推荐与你原本要做的事有没有关系。可以用浏览器返回。',kind:'留意：推广跳转'};
  registry[`ad.close.${ad.id}`]={title:'关闭这一条广告',source:`${ad.brand} · 广告位控制`,target:'收起当前广告位',effect:'只移除这张广告，其他广告位保持原样。',clue:'这个关闭入口会真正收起对应卡片。',kind:'正常：关闭广告'};
  registry[`ad.fakeclose.${ad.id}`]={title:'这个叉号并不是离开',source:`${ad.host} · 推广卡片`,target:'另一张推广卡片',effect:'保留当前推广，并多显示一张推荐；最多同时显示两张浮层。',clue:'外观像关闭控件，实际继续推广。下方的“关闭广告”和浏览器返回仍然可用。',kind:'留意：伪装关闭'};
 }
}
export function sponsorScene(s,button){
 const ad=adCatalog.find(item=>item.id===s.sponsorId);
 if(!ad)return '';
 return `<section class="sponsor-page ad-theme-${ad.theme}"><div class="sponsor-masthead"><b>${ad.brand}</b><span>精选推荐</span></div><div class="sponsor-art">${adArtwork(ad.art)}</div><span class="eyebrow">${ad.eyebrow}</span><h2>${ad.title}</h2><p>${ad.copy}</p><div class="sponsor-message">你来到了一个推广页面。<br>原来的任务还在，可以回去继续。</div>${button('browser.return','返回原页面 →','solid','','sponsor:return')}</section>`;
}
