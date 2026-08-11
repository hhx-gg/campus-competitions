import type { Competition } from './competitions'

type CatalogEntry = [name: string, category: string, startMonth: number, endMonth: number, source: string]

const calendarSource = 'https://www.csust.edu.cn/__local/3/D5/4D/7EFDB863AD1A99BEACDF95F98AF_9721C9B8_17B3EC.pdf'
const reportSource = 'https://statics.scnu.edu.cn/pics/xsb/2025/0103/1735893141731811.pdf'

const entries2026: CatalogEntry[] = [
  ['“挑战杯”中国大学生创业计划竞赛', '创新创业', 1, 6, 'https://www.tiaozhanbei.net/'],
  ['全国大学生结构设计竞赛', '土木建筑', 1, 3, 'https://www.structurecontest.com/'],
  ['全国大学生广告艺术大赛', '艺术设计', 1, 6, 'https://www.sun-ada.net/'],
  ['全国大学生智能汽车竞赛', '电子信息', 1, 6, 'https://smartcarrace.com/'],
  ['全国大学生集成电路创新创业大赛', '电子信息', 1, 3, 'https://univ.ciciec.com/'],
  ['全国周培源大学生力学竞赛', '力学', 1, 3, 'https://zpy.cstam.org.cn/'],
  ['全国大学生物理实验竞赛', '物理', 1, 5, 'https://wlsycx.moocollege.com/'],
  ['“学创杯”全国大学生创业综合模拟大赛', '经济管理', 1, 3, 'https://www.bster.cn/cyds/index'],
  ['“21世纪杯”全国英语演讲比赛', '语言文化', 1, 4, 'https://contest.i21st.cn/'],
  ['中国大学生机械工程创新创意大赛', '机械工程', 2, 4, 'https://www.gczbds.org/'],
  ['睿抗机器人开发者大赛（RAICOM）', '机器人', 2, 12, 'https://www.robocom.com.cn/'],
  ['全国大学生统计建模大赛', '统计学', 2, 5, 'https://www.ai-learning.net/dstz/37119.jhtml'],
  ['全国大学生电子设计竞赛（2026月历）', '电子信息', 3, 4, 'https://nuedc.xjtu.edu.cn/'],
  ['全国大学生机械创新设计大赛（2026月历）', '机械工程', 3, 5, 'https://12umic.hit.edu.cn/'],
  ['全国三维数字化创新设计大赛（2026月历）', '数字化设计', 3, 6, 'https://3dds.3ddl.net/'],
  ['“西门子杯”中国智能制造挑战赛', '智能制造', 3, 5, 'https://www.siemenscup-cimc.org.cn/'],
  ['中国机器人大赛暨RoboCup机器人世界杯中国赛', '机器人', 3, 4, 'https://rcccaa.drct-caa.org.cn/'],
  ['全国大学生嵌入式芯片与系统设计竞赛', '电子信息', 3, 4, 'https://www.socchina.net/'],
  ['中国高校智能机器人创意大赛', '机器人', 3, 6, 'https://www.robotcontest.cn/'],
  ['中国机器人及人工智能大赛', '人工智能', 3, 3, 'https://developer.apollo.auto/'],
  ['“外教社杯”全国高校学生跨文化能力大赛', '语言文化', 3, 3, 'https://ict.sflep.com/'],
  ['全国大学生测绘学科创新创业智能大赛', '测绘工程', 3, 5, 'https://www.csgpc.org/detail/27739.html'],
  ['全国企业竞争模拟大赛', '经济管理', 3, 4, 'https://www.ibizsim.cn/'],
  ['ACM-ICPC国际大学生程序设计竞赛', '程序设计', 4, 5, 'https://icpc.global/'],
  ['“外研社·国才杯”“理解当代中国”全国大学生外语能力大赛', '语言文化', 4, 10, 'https://uchallenge.unipus.cn/'],
  ['两岸新锐设计竞赛·华灿奖', '艺术设计', 4, 4, 'https://www.huacanjiang.com/'],
  ['全国大学生先进成图技术与产品信息建模创新大赛', '工程图学', 4, 4, 'https://www.chengtudasai.com/'],
  ['中国大学生计算机设计大赛', '计算机', 4, 5, 'https://jsjds.blcu.edu.cn/'],
  ['全国大学生光电设计竞赛', '光电工程', 4, 8, 'https://eie.scu.edu.cn/info/1024/14858.htm'],
  ['全国大学生信息安全竞赛', '网络安全', 4, 6, 'https://www.ciscn.cn/'],
  ['“中国软件杯”大学生软件设计大赛', '软件工程', 4, 7, 'https://www.cnsoftbei.com/'],
  ['全国大学生节能减排社会实践与科技竞赛', '能源环境', 4, 4, 'https://www.jienengjianpai.org/'],
  ['iCAN大学生创新创业大赛', '创新创业', 4, 7, 'https://www.g-ican.com/'],
  ['中华经典诵写讲大赛', '语言文化', 4, 10, 'https://jdsxj.eduyun.cn/'],
  ['百度之星·程序设计大赛', '程序设计', 4, 6, 'https://star.baidu.com/'],
  ['全国大学生计算机系统能力大赛', '计算机', 4, 6, 'https://compiler.educg.net/'],
  ['全国大学生物联网设计竞赛', '物联网', 4, 6, 'https://developer.huaweicloud.com/'],
  ['全国大学生信息安全与对抗技术竞赛', '网络安全', 4, 7, 'https://www.isclab.org.cn/'],
  ['中国国际大学生创新大赛（2026月历）', '创新创业', 5, 8, 'https://cy.ncss.cn/'],
  ['全国高等院校数智化企业经营沙盘大赛', '经济管理', 5, 9, 'https://www.seentao.com/'],
  ['全国数字建筑创新应用大赛', '土木建筑', 5, 8, 'https://bisai.ccen.com.cn/'],
  ['全球校园人工智能算法精英大赛', '人工智能', 5, 10, 'https://www.aicomp.cn/'],
  ['一带一路暨金砖国家技能发展与技术创新大赛', '职业技能', 5, 12, 'https://inwsa.org/'],
  ['中国高校计算机大赛', '计算机', 6, 7, 'https://www.c4best.cn/'],
  ['全国大学生工业设计大赛', '艺术设计', 6, 7, 'https://www.cuidc.net/'],
  ['全国本科院校税收风险管控案例大赛', '经济管理', 6, 10, 'https://ssfkds.moocollege.com/'],
  ['世界技能大赛', '职业技能', 6, 6, 'https://worldskillschina.mohrss.gov.cn/'],
  ['全国大学生生命科学竞赛（CULSC）', '生命科学', 7, 12, 'https://www.culsc.cn/'],
  ['国际大学生智能农业装备创新大赛', '农业工程', 7, 10, 'https://uiaec.ujs.edu.cn/'],
  ['全国大学生数字媒体科技作品及创意竞赛', '数字媒体', 8, 10, 'https://mit.caai.cn/'],
  ['全国大学生电子商务“创新、创意及创业”挑战赛', '电子商务', 9, 12, 'https://www.3chuang.net/'],
  ['全国大学生市场调查与分析大赛', '经济管理', 9, 10, 'https://www.china-cssc.org/'],
  ['华为ICT大赛', '电子信息', 9, 11, 'https://e.huawei.com/'],
  ['国际高校BIM毕业设计创新大赛', '土木建筑', 9, 11, 'https://gxbsxs.glodonedu.com/'],
  ['全国高校商业精英挑战赛', '经济管理', 9, 12, 'https://ssyth.cubec.org.cn/'],
  ['“科云杯”全国大学生财会职业能力大赛', '经济管理', 9, 10, 'https://match.xmkeyun.com.cn/'],
  ['全国大学生创新创业训练计划年会展示', '创新创业', 10, 10, 'https://gjcxcy.bjtu.edu.cn/'],
  ['全国大学生机器人大赛', '机器人', 10, 12, 'https://www.cnrobocon.net/'],
  ['米兰设计周—中国高校设计学科师生优秀作品展', '艺术设计', 10, 12, 'https://www.dandad.cn/'],
  ['中国好创意暨全国数字艺术设计大赛', '艺术设计', 10, 12, 'https://www.cdec.org.cn/'],
]

const directoryOnly2024 = [
  '中国大学生医学技术技能大赛', '全国大学生物流设计大赛', '全国大学生化工设计竞赛', '全国大学生地质技能竞赛',
  '全国大学生金相技能大赛', '全国大学生水利创新设计大赛', '全国大学生化工实验大赛', '全国大学生化学实验创新设计大赛',
  '全国大学生基础医学创新研究暨实验设计论坛（大赛）', '全国职业院校技能大赛', '码蹄杯全国职业院校程序设计大赛',
  '“挑战杯”全国大学生课外学术科技作品竞赛', '中国大学生工程实践与创新能力大赛', '中国大学生服务外包创新创业大赛',
  '未来设计师·全国高校数字艺术设计大赛', '“工行杯”全国大学生金融科技创新大赛', '全国大学生能源经济学术创意大赛',
  '全国高等院校数智化企业经营沙盘大赛（2024目录）', '全球校园人工智能算法精英大赛（2024目录）',
  '全国大学生机器人大赛—RoboTac', '世界技能大赛中国选拔赛',
]

const pad = (month: number) => String(month).padStart(2, '0')
const lastDay = (year: number, month: number) => new Date(year, month, 0).getDate()
const idPart = (name: string) => Array.from(name).reduce((hash, char) => ((hash * 31 + char.charCodeAt(0)) >>> 0), 7).toString(36)

export const catalogCompetitions: Competition[] = [
  ...entries2026.map(([name, category, startMonth, endMonth, source]) => ({
    id: `catalog-2026-${idPart(name)}`, name: `2026 ${name}`, category, organizer: '赛事组委会（以官网为准）', level: '全国性赛事',
    audience: '本科生／研究生／高职高专学生（以官网为准）', start: `2026-${pad(startMonth)}-01`, deadline: `2026-${pad(endMonth)}-${lastDay(2026, endMonth)}`,
    format: '以官网通知为准', fee: '以官网通知为准', difficulty: 3, value: '暂无评级' as const, status: '报名中' as const,
    updatedAt: '2026-08-10 12:00', source, daysLeft: 0, color: '#367dcc',
    description: `已由高校公开的《2026年全国大学生学科竞赛月历目录》确认赛事、报名月份及官网；当前日期按月历月份边界展示，具体日时须以官网最新通知为准。目录来源：${calendarSource}`,
  })),
  ...directoryOnly2024.map((name, index) => ({
    id: `directory-2024-${idPart(name)}`, name: `2024 ${name}`, category: index < 3 ? '医学与健康' : index < 8 ? '工程技术' : '综合类',
    organizer: '赛事组委会（以目录为准）', level: '入选2024竞赛目录', audience: '高校学生（以官网为准）', start: '2024-01-01', deadline: '2024-12-31',
    format: '年度目录记录（具体日期未公开）', fee: '未知', difficulty: 3, value: '暂无评级' as const, status: '已截止' as const,
    updatedAt: '2026-08-10 12:00', source: reportSource, daysLeft: 0, color: '#77849a',
    description: '本条已确认被《2024全国普通高校大学生竞赛分析报告》目录收录；当前以年度边界归档，不代表实际报名起止日，未找到独立官网的项目仅展示目录来源。',
  })),
]

export const catalogSources = [...new Set([...entries2026.map((entry) => entry[4]), calendarSource, reportSource])]
