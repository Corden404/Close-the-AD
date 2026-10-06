export const chapters=[
 {label:'一顿晚饭',title:'你只是想，\n做顿晚饭。',goal:'找出烤箱温度',detail:'在「慢半拍厨房」找到番茄焗意面的原始做法，记下烤箱温度。',host:'slowkitchen.example',tab:'番茄焗意面 · 慢半拍厨房',task:'一份菜谱',tag:'READ THE RECIPE',lesson:'不是所有 ×，都在说再见。',takeaway:'网页里的关闭图标也可能是广告。可疑弹窗越关越多时，用浏览器级的返回或关闭标签页脱离，再回到原任务。',facts:['不要凭一条网页警告判断设备感染。','真正的菜谱，在原始正文里。','正常提示也有用，关键是看来源与点击后果。']},
 {label:'一份课表',title:'你只是想，\n下份课表。',goal:'拿到正确的课表 PDF',detail:'从「未读学园」公告中，保存 2026 秋季的课表 PDF。别把下载器带回家。',host:'weidu-school.example',tab:'教务公告 · 未读学园',task:'一份课表',tag:'GET THE RIGHT FILE',lesson:'按钮很大，文件未必对。',takeaway:'把下载按钮和文件的发布者、名称、格式对应起来。“允许通知才能继续”可能在把无关权限包装成必经步骤。',facts:['核对学期和文件类型，而不只看“下载”二字。','通知权限本身不是病毒，也不必然是不安全的。','正常下载文件通常不需要先订阅推广通知。']},
 {label:'一张门票',title:'你只是想，\n买一张票。',goal:'¥50 以内，只买门票',detail:'买一张「明日闲逛馆」普通票。预算 ¥50，不要附加服务，也不要后续自动续费。',host:'tomorrow-museum.example',tab:'确认订单 · 明日闲逛馆',task:'一张门票',tag:'KEEP YOUR OWN BUDGET',lesson:'免费试用，有时只是收费的前奏。',takeaway:'付款前核对默认勾选、本次合计、续费条件和取消入口。会改变决定的条件，不应该被藏在小字里。',facts:['预选附加项可能悄悄增加合计。','本次 ¥0 不代表以后不收费。','读取消按钮的完整意思，别被醒目的按钮带着走。']}
];
export const inspections={
 'trap.close':{title:'这个 × 会去哪里？',source:'lucky-push.example · 第三方广告',target:'打开新的广告层',effect:'不会关闭广告。会额外出现一条“安全警告”。',clue:'外观像关闭按钮，实际绑定的是广告入口。看不准时可以使用浏览器上方的安全退出控件。',kind:'留意：伪装控件'},
 'trap.prize':{title:'你的“专属大奖”',source:'lucky-push.example · 第三方广告',target:'领奖推广页',effect:'离开菜谱，进入与你原任务无关的页面。',clue:'“被选中”不是你参加过活动的证据。先问自己：我原本来做什么？',kind:'留意：诱导跳转'},
 'trap.security':{title:'谁在替设备“体检”？',source:'browser-helper.example · 网页广告',target:'所谓的修复服务页',effect:'展示一场假的设备扫描，无法检测你的真实设备。',clue:'普通网页无法仅凭弹窗就证明设备已感染。可疑警告里的电话和修复按钮不可信。',kind:'留意：恐吓式广告'},
 'recipe.expand':{title:'回到菜谱本身',source:'slowkitchen.example · 当前食谱正文',target:'本页展开 3 个烹饪步骤',effect:'显示食材处理、拌匀和烘烤说明，不会跳转。',clue:'这是与原任务直接相关的页面功能。',kind:'正常：正文操作'},
 'recipe.submit':{title:'记下你的答案',source:'任务便签',target:'核对烤箱温度',effect:'检查答案是否与原始菜谱一致。',clue:'不计速度，随时能回去核对。',kind:'正常：完成任务'},
 'notice.dismiss':{title:'一个普通的阅读提示',source:'slowkitchen.example · 当前网站',target:'关闭本页提示',effect:'收起“步骤可展开”的说明，没有额外页面。',clue:'界面提示也可能在帮助你。检查来源和后果，比见到弹窗就点掉更重要。',kind:'正常：帮助提示'},
 'trap.download':{title:'下载的是课表，还是下载器？',source:'speed-file.example · 推广内容',target:'ClassSchedule_Helper.exe',effect:'打开安装器页面，拿不到 PDF 课表。',clue:'醒目的下载按钮属于第三方广告，文件类型也与 PDF 不一致。',kind:'留意：假下载按钮'},
 'trap.permission':{title:'课表为什么需要通知权限？',source:'speed-file.example · 推广内容',target:'开启推广通知',effect:'页面内多出推广消息；',clue:'权限本身不等于感染。问题在于用无关权限作为获取文件的条件。',kind:'留意：权限诱导'},
 'pdf.open':{title:'核对这份附件',source:'weidu-school.example · 教务处',target:'2026-秋季-课程表.pdf · 248 KB',effect:'在浏览器内预览 PDF，无需下载器或通知权限。',clue:'发布者、学期、文件名与原任务一致。',kind:'正常：官方附件'},
 'pdf.old':{title:'文件没坏，但学期不对',source:'weidu-school.example · 公告归档',target:'2025-秋季-课程表.pdf',effect:'这是历史版本，不能完成本次任务。',clue:'可信来源也有旧文件。正确文件还需要匹配日期与用途。',kind:'正常：历史附件'},
 'pdf.save':{title:'保存课表',source:'weidu-school.example · 当前 PDF',target:'「我的文件」',effect:'标记课表已保存，',clue:'文件名称、格式与发布来源都与你的任务一致。',kind:'正常：保存文件'},
 'extra.insurance':{title:'安心保障包',source:'tomorrow-museum.example · 订单附加项',target:'本次金额 + ¥12',effect:'可选附加服务，已经默认勾选；普通门票不需要它。',clue:'默认勾选不等于你的选择。金额变化应该清楚、可撤回。',kind:'留意：默认附加项'},
 'extra.fast':{title:'优先入馆服务',source:'tomorrow-museum.example · 订单附加项',target:'本次金额 + ¥18',effect:'可选服务；不购买也能按预约时段入馆。',clue:'核对是否真的需要，以及总价是否符合原预算。',kind:'留意：默认附加项'},
 'trial.remove':{title:'“¥0 试用”的下一行',source:'tomorrow-museum.example · 会员附加项',target:'本次 ¥0；7 天后 ¥39/月，自动续费',effect:'保留该项会造成后续扣费承诺。页面内可移除。',clue:'看清试用结束时间、续费金额及取消条件，别只读最醒目的 ¥0。',kind:'留意：试用转续费'},
 'trial.add':{title:'重新加入，也会重新续费',source:'tomorrow-museum.example · 会员附加项',target:'恢复 7 天试用；之后 ¥39/月自动续费',effect:'重新勾选试用会员，并清除上次订单核对。',clue:'移除后再次加入仍是新的选择。检查模式只查看后果，不会启用这项服务。',kind:'留意：恢复自动续费'},
 'checkout.review':{title:'最后一次核对',source:'tomorrow-museum.example · 订单确认',target:'完整费用与退改说明',effect:'展开本次合计、后续费用和门票规则。',clue:'这一步有助于你按自己的意愿确认订单。',kind:'正常：订单核对'},
 'checkout.pay':{title:'提交订单',source:'tomorrow-museum.example · 订单确认',target:'购买结果',effect:'检查预算和附加项。',clue:'先核对总价和后续费用；正确完成不需要抢时间。',kind:'正常：提交'}
};
export const sources=[['FTC · Bringing Dark Patterns to Light','https://www.ftc.gov/reports/bringing-dark-patterns-light'],['Apple · Block pop-up ads and windows','https://support.apple.com/en-us/102524'],['Google · Deceptive download buttons','https://developers.google.com/search/blog/2016/04/no-more-deceptive-download-buttons'],['Chromium · Abusive notifications','https://blog.chromium.org/2020/05/protecting-chrome-users-from-abusive.html'],['FTC · Tech support scams','https://consumer.ftc.gov/articles/how-spot-avoid-and-report-tech-support-scams']];

chapters.push(
 {label:'一节小课',title:'你只是想，\n学一点东西。',goal:'找到真正的薄荷修剪课',detail:'在「一小课」打开薄荷修剪的原课程，记住下剪的位置。无需安装、下载或更新播放器。',host:'littlelesson.example',tab:'薄荷修剪 · 一小课',task:'一节小课',tag:'PLAY THE RIGHT LESSON',lesson:'播放键相似，目的地不同。',takeaway:'先把播放按钮和课程标题、发布者对应起来。广告里的播放、下载或更新按钮，可能把你带离原内容。',facts:['播放前看按钮属于哪个内容区。','“必须更新”可能是网页里的诱导文案。','回到原课程核对内容，比追着最大的按钮点更有效。']},
 {label:'一条好消息',title:'你只是想，\n安静收个消息。',goal:'撤回推广权限，找回取书消息',detail:'「好运速报」已被允许发送通知。禁止这个无关来源，再记下阅览室的取书地点与时间。',host:'quiet-inbox.example',tab:'消息中心 · 留白收件箱',task:'一条好消息',tag:'QUIET THE RIGHT SOURCE',lesson:'关掉一条消息，不等于关掉它的来源。',takeaway:'检查已有的站点通知权限，撤回不再需要的来源。不同浏览器的入口可能不同，先确认你正在操作的站点和权限。',facts:['逐条关闭只能清掉眼前的通知。','回到网页或关闭标签页，不一定撤回已授予的权限。','保留有用消息，处理无关来源，不需要把所有通知一刀切。']},
 {label:'一次告别',title:'你只是想，\n好好说再见。',goal:'真正取消订阅，确认不再续费',detail:'取消「轻听电台」月度订阅。优惠和暂停都不是终点，最后核对已取消和下次扣费为「无」。',host:'light-radio.example',tab:'订阅管理 · 轻听电台',task:'一次告别',tag:'MAKE THE END REALLY END',lesson:'取消的证据，是最后的状态。',takeaway:'完成取消后，再检查确认回执、订阅状态和下次扣费。优惠、暂停或“申请已收到”，可能仍然保留续费。',facts:['挽留按钮的文案未必与原目标一致。','读清最终确认会停止什么、保留什么。','在真实服务中保留取消确认，便于之后核对。']}
);
const outcomes=[
 ['晚饭有着落了。','烤箱温度','200°C','找到原始菜谱'],
 ['课表拿到了。','保存文件','2026 秋季课表 · PDF','核对正确文件'],
 ['只买了你想买的。','本次支出','¥48 · 无后续扣费','没有自动续费'],
 ['这一课，真的学到了。','课程要点','在叶节上方剪','打开原课程'],
 ['有用的消息，回来了。','取书安排','二楼服务台 · 18:30 前','推广来源已禁止'],
 ['这次，真的取消了。','订阅状态','已取消 · 下次扣费：无','核对最终回执']
];
chapters.forEach((chapter,index)=>{chapter.outcome=outcomes[index];chapter.icon=['✳','▤','⌁','▷','✉','◉'][index];});
Object.assign(inspections,{
 'trap.play':{title:'这个播放键属于谁？',source:'instant-wins.example · 推广卡片',target:'推广短片页',effect:'离开薄荷课程，进入与学习目标无关的广告页。',clue:'看看按钮所在卡片的发布者。大三角不一定是原课程的播放键。',kind:'留意：假播放入口'},
 'trap.update':{title:'谁说必须更新播放器？',source:'video-helper.example · 插件广告',target:'所谓播放器更新页',effect:'进入播放器安装提示页，离开原课程。',clue:'一小课的原课程不需要安装插件。网页广告的报错不代表设备真的缺少组件。',kind:'留意：伪装更新'},
 'trap.videoDownload':{title:'课程和下载助手不是同一件事',source:'video-helper.example · 推广内容',target:'AllVideo_Helper.exe',effect:'离开原课程，进入下载器页面。',clue:'任务是学习修剪，并不需要一个万能下载器。',kind:'留意：捆绑下载'},
 'lesson.play':{title:'原课程就在这张卡片里',source:'littlelesson.example · 一小课园艺编辑部',target:'薄荷修剪 · 3 幅课程分镜',effect:'立即展开完整内容和文字要点，无需等待。',clue:'标题、发布者和内容都与你要学的事情对应。',kind:'正常：原课程'},
 'lesson.answer.root':{title:'核对你记住的要点',source:'任务便签',target:'核对修剪位置',effect:'检查选择是否与原课程一致。',clue:'课程里的第 2 幅分镜写着下剪的位置。',kind:'正常：核对课程'},
 'lesson.answer.node':{title:'核对你记住的要点',source:'任务便签',target:'核对修剪位置',effect:'检查选择是否与原课程一致。',clue:'可以随时回看分镜，不计速度。',kind:'正常：核对课程'},
 'lesson.answer.leaves':{title:'核对你记住的要点',source:'任务便签',target:'核对修剪位置',effect:'检查选择是否与原课程一致；错误也可以再选。',clue:'留意课程是否要求保留下面的叶片。',kind:'正常：核对课程'},
 'notifications.settings':{title:'查看已经给出去的权限',source:'留白收件箱 · 站点权限面板',target:'查看「好运速报」的通知权限',effect:'展开或收起来源设置，',clue:'与逐条关消息不同，这里可以处理消息的来源。',kind:'正常：权限管理'},
 'notifications.block':{title:'只撤回这个不需要的来源',source:'站点权限 · 好运速报',target:'daily-luck.example · 通知设为禁止',effect:'撤回该来源的许可，并清除它的当前推广消息。阅览室消息保留。',clue:'这是你之前允许的来源。真实浏览器里应在设置中核对站点。',kind:'正常：撤回权限'},
 'notifications.refresh':{title:'消息为什么又回来了？',source:'留白收件箱 · 当前列表',target:'检查通知队列',effect:'如果「好运速报」仍被允许，列表补回最多 3 条；禁止后不会增加。',clue:'列表只在点击检查时更新。已有权限允许来源继续发送通知。',kind:'正常：检查消息'},
 'message.open':{title:'一条与你有关的消息',source:'reading-room.example · 邻里阅览室',target:'取书通知正文',effect:'展开取书时间和地点，不需要领取奖品或支付费用。',clue:'来源、正文和任务一致。通知本身也可以很有用。',kind:'正常：有用通知'},
 'message.ack':{title:'把真正需要的信息记下来',source:'任务便签',target:'检查推广权限已撤回、原消息已读',effect:'只在页面内确认任务完成。',clue:'要同时完成两件事：撤回无关权限，保留有用消息。',kind:'正常：完成任务'},
 'subscription.manage':{title:'从账户管理找取消入口',source:'light-radio.example · 轻听电台账户',target:'当前订阅、续费日期与管理选项',effect:'查看当前订阅、续费状态与管理选项。',clue:'已经取消时，这里仍能查看取消回执。',kind:'正常：订阅管理'},
 'cancellation.start':{title:'进入取消流程',source:'light-radio.example · 订阅管理',target:'取消流程的挽留选项页',effect:'开始取消流程，还没有取消成功。',clue:'点了第一个“取消”以后，仍需要核对最终结果。',kind:'正常：开始取消'},
 'trap.discount':{title:'半价，不是取消',source:'light-radio.example · 挽留方案',target:'订阅优惠：下次 ¥9，仍会续费',effect:'应用优惠并保留续费，无法完成取消任务。',clue:'价格变了，订阅关系并没有结束。',kind:'留意：替换原目标'},
 'trap.pause':{title:'暂停，不是结束',source:'light-radio.example · 挽留方案',target:'暂停至 2026-12-06，随后恢复 ¥19/月',effect:'延迟扣费，但继续保留续费。',clue:'看清恢复日期和恢复后的金额。',kind:'留意：延后续费'},
 'cancellation.continue':{title:'继续完成原来的决定',source:'light-radio.example · 取消流程',target:'取消前的最终确认页',effect:'跳过优惠和暂停，核对最终取消影响。还未正式取消。',clue:'不需要接受挽留方案，才能继续。',kind:'正常：继续取消'},
 'cancellation.confirm':{title:'最终确认会发生什么？',source:'light-radio.example · 最终取消确认',target:'取消订阅并停止下一次自动续费',effect:'订阅状态变为已取消，下一次扣费变为无；本期内容保留至 2026-11-05。',clue:'确认后再看回执，核对是否真的停止续费。',kind:'正常：最终取消'},
 'cancellation.verify':{title:'最后看结果，而不是看口号',source:'light-radio.example · 取消回执',target:'已取消；自动续费关闭；下次扣费无',effect:'只有最终状态全部正确，才完成这关。',clue:'真实服务中也可以保留取消确认，用于之后核对。',kind:'正常：核对回执'}
});
for(const id of [0,1,2])inspections[`notifications.dismiss.${id}`]={title:'关闭的是消息，还是权限？',source:'daily-luck.example · 当前推广通知',target:'移除当前这一条消息',effect:'只收起一条通知，不撤回已允许的来源权限。',clue:'来源仍被允许时，点“检查新消息”会补回通知；这里没有自动计时。',kind:'正常：逐条关闭'};
