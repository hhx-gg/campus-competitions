import { competitions as baseCompetitions, type Competition } from './competitions'
import { additionalCompetitions } from './additionalCompetitions'
import { catalogCompetitions } from './catalogCompetitions'

type SupplementalBrand = {
  name: string
  category: string
  organizer: string
  source: string
  audience?: string
  format?: string
  dates2026?: [start: string, deadline: string]
  history?: string
}

const graduateOrganizer = '中国学位与研究生教育学会、中国科协青少年科技中心'
const graduateSource = 'https://cpipc.acge.org.cn/pw/preview/2c908017963932320196667af7071c51'
const mechanicalSource = 'https://www.gczbds.org/'
const businessSource = 'https://ssyth.cubec.org.cn/'
const c4Source = 'https://www.c4best.cn/'
const directorySource = 'https://www.sdor.cn/_upload/article/files/b0/f7/3df622f74438b1e3a2b83b4b8c65/eb98ea2a-b5b1-42cc-94d2-b494b350e3e4.pdf'

const graduateHistory = '中国研究生创新实践系列大赛是在教育主管部门指导下持续建设的全国性研究生创新实践平台，已形成覆盖理工、经管与人文领域的主题赛事体系。'
const mechanicalHistory = '中国大学生机械工程创新创意大赛由机械工程领域相关单位持续组织，通过多个专业赛项积累工程实践与创新设计成果。'
const businessHistory = '全国高校商业精英挑战赛以系列专业竞赛形式持续开展，覆盖品牌、会展、贸易、会计与创新创业等商科实践方向。'
const c4History = '中国高校计算机大赛以系列赛方式持续开展，围绕程序设计、网络技术、移动应用、人工智能与数据应用设置实践赛项。'

const supplementalBrands: SupplementalBrand[] = [
  { name: '中国研究生智慧城市技术与创意设计大赛', category: '智慧城市', organizer: graduateOrganizer, source: graduateSource, audience: '研究生／已获研究生入学资格的本科毕业生', dates2026: ['2026-06-27', '2026-10-23'], history: graduateHistory },
  { name: '中国研究生未来飞行器创新大赛', category: '航空航天', organizer: graduateOrganizer, source: graduateSource, audience: '研究生／已获研究生入学资格的本科毕业生', dates2026: ['2026-06-10', '2026-08-30'], history: graduateHistory },
  { name: '中国研究生数学建模竞赛', category: '数学建模', organizer: graduateOrganizer, source: graduateSource, audience: '研究生', dates2026: ['2026-06-01', '2026-09-19'], history: graduateHistory },
  { name: '中国研究生电子设计竞赛', category: '电子设计', organizer: graduateOrganizer, source: graduateSource, audience: '研究生', dates2026: ['2026-04-03', '2026-06-20'], history: graduateHistory },
  { name: '中国研究生创“芯”大赛', category: '集成电路', organizer: graduateOrganizer, source: graduateSource, audience: '研究生／已获研究生入学资格的本科毕业生', dates2026: ['2026-03-20', '2026-06-30'], history: graduateHistory },
  { name: '中国研究生创“芯”大赛—EDA精英挑战赛', category: '集成电路', organizer: graduateOrganizer, source: graduateSource, audience: '研究生／已获研究生入学资格的本科毕业生', history: graduateHistory },
  { name: '中国研究生人工智能创新大赛', category: '人工智能', organizer: graduateOrganizer, source: graduateSource, audience: '研究生', dates2026: ['2026-05-22', '2026-08-25'], history: graduateHistory },
  { name: '中国研究生机器人创新设计大赛', category: '机器人', organizer: graduateOrganizer, source: graduateSource, audience: '研究生', dates2026: ['2026-06-23', '2026-08-24'], history: graduateHistory },
  { name: '中国研究生能源装备创新设计大赛', category: '能源工程', organizer: graduateOrganizer, source: graduateSource, audience: '研究生', dates2026: ['2026-06-25', '2026-08-15'], history: graduateHistory },
  { name: '中国研究生公共管理案例大赛', category: '公共管理', organizer: graduateOrganizer, source: graduateSource, audience: '研究生', dates2026: ['2026-01-13', '2026-03-13'], history: graduateHistory },
  { name: '中国研究生乡村振兴科技强农+创新大赛—科技作品竞赛', category: '农学', organizer: graduateOrganizer, source: graduateSource, audience: '研究生／已获研究生入学资格的本科毕业生', dates2026: ['2026-05-19', '2026-08-24'], history: graduateHistory },
  { name: '中国研究生乡村振兴科技强农+创新大赛—卓越兽医挑战赛', category: '兽医学', organizer: graduateOrganizer, source: graduateSource, audience: '研究生', history: graduateHistory },
  { name: '中国研究生网络安全创新大赛', category: '网络安全', organizer: graduateOrganizer, source: graduateSource, audience: '研究生', history: graduateHistory },
  { name: '中国研究生“双碳”创新与创意大赛', category: '能源环境', organizer: graduateOrganizer, source: graduateSource, audience: '研究生', history: graduateHistory },
  { name: '中国研究生金融科技创新大赛', category: '金融科技', organizer: graduateOrganizer, source: graduateSource, audience: '研究生', dates2026: ['2026-05-22', '2026-08-17'], history: graduateHistory },
  { name: '中国研究生“美丽中国”创新设计大赛', category: '艺术设计', organizer: graduateOrganizer, source: graduateSource, audience: '研究生', dates2026: ['2026-06-20', '2026-08-20'], history: graduateHistory },
  { name: '中国研究生企业管理创新大赛', category: '工商管理', organizer: graduateOrganizer, source: graduateSource, audience: '研究生', history: graduateHistory },
  { name: '中国研究生操作系统开源创新大赛', category: '计算机', organizer: graduateOrganizer, source: graduateSource, audience: '研究生', dates2026: ['2026-05-15', '2026-07-28'], history: graduateHistory },
  { name: '中国研究生“文化中国”两创大赛', category: '人文社科', organizer: graduateOrganizer, source: graduateSource, audience: '研究生', dates2026: ['2026-05-25', '2026-09-14'], history: graduateHistory },
  { name: '中国研究生国际中文教育案例大赛', category: '语言文化', organizer: graduateOrganizer, source: graduateSource, audience: '研究生', dates2026: ['2026-06-01', '2026-06-30'], history: graduateHistory },
  { name: '中国研究生智能建造创新大赛', category: '智能建造', organizer: graduateOrganizer, source: graduateSource, audience: '研究生', dates2026: ['2026-05-18', '2026-08-20'], history: graduateHistory },

  ...[
    ['中国大学生机械工程创新创意大赛—过程装备实践与创新赛', '机械工程'],
    ['中国大学生机械工程创新创意大赛—材料热处理创新创业赛', '材料工程'],
    ['中国大学生机械工程创新创意大赛—铸造工艺设计赛', '材料工程'],
    ['中国大学生机械工程创新创意大赛—起重机创意赛', '机械工程'],
    ['中国大学生机械工程创新创意大赛—智能制造赛', '智能制造'],
    ['中国大学生机械工程创新创意大赛—工业工程与精益管理创新赛', '工业工程'],
    ['中国大学生机械工程创新创意大赛—物流技术创意赛', '物流工程'],
    ['中国大学生机械工程创新创意大赛—无损检测技能赛', '材料工程'],
    ['中国大学生机械工程创新创意大赛—失效分析赛', '材料工程'],
    ['中国大学生机械工程创新创意大赛—产品数字化创新设计赛', '数字化设计'],
    ['中国大学生机械工程创新创意大赛—机械产品数字化设计赛', '机械工程'],
  ].map(([name, category]) => ({ name, category, organizer: '中国机械工程学会及相关专业分会', source: mechanicalSource, history: mechanicalHistory })),

  ...[
    ['全国高校商业精英挑战赛—品牌策划竞赛', '市场营销'],
    ['全国高校商业精英挑战赛—会展专业创新创业实践竞赛', '会展经济'],
    ['全国高校商业精英挑战赛—国际贸易竞赛', '国际贸易'],
    ['全国高校商业精英挑战赛—创新创业竞赛', '创新创业'],
    ['全国高校商业精英挑战赛—会计与商业管理案例竞赛', '会计与管理'],
  ].map(([name, category]) => ({ name, category, organizer: '中国贸促会商业行业委员会', source: businessSource, history: businessHistory })),

  ...[
    ['中国高校计算机大赛—团体程序设计天梯赛', '程序设计'],
    ['中国高校计算机大赛—移动应用创新赛', '软件工程'],
    ['中国高校计算机大赛—网络技术挑战赛', '网络工程'],
    ['中国高校计算机大赛—人工智能创意赛', '人工智能'],
    ['中国高校计算机大赛—大数据挑战赛', '数据科学'],
    ['中国高校计算机大赛—微信小程序应用开发赛', '软件工程'],
    ['中国高校计算机大赛—AIGC创新赛', '人工智能'],
    ['中国高校计算机大赛—智能交互创新赛', '人机交互'],
  ].map(([name, category]) => ({ name, category, organizer: '全国高等学校计算机教育研究会及赛项组委会', source: c4Source, history: c4History })),

  { name: '中国大学生程序设计竞赛（CCPC）', category: '程序设计', organizer: '中国大学生程序设计竞赛组委会', source: 'https://ccpc.io/', history: '中国大学生程序设计竞赛持续面向高校学生开展算法与程序设计竞技，形成分站赛与总决赛体系。' },
  { name: '全国大学生软件测试大赛', category: '软件工程', organizer: '全国大学生软件测试大赛组委会', source: 'https://www.mooctest.net/', history: '全国大学生软件测试大赛持续围绕软件质量、测试开发与工程实践组织竞赛。' },
  { name: 'MathorCup高校数学建模挑战赛', category: '数学建模', organizer: 'MathorCup高校数学建模挑战赛组委会', source: 'https://www.mathorcup.org/', history: 'MathorCup以年度数学建模赛题为载体，持续组织高校学生运用数学与计算方法解决实际问题。' },
  { name: '五一数学建模竞赛', category: '数学建模', organizer: '五一数学建模竞赛组委会', source: 'https://51mcm.cumt.edu.cn/', history: '五一数学建模竞赛持续面向高校学生开展建模实践，强调团队协作、模型构建与论文表达。' },
  { name: '华中杯大学生数学建模挑战赛', category: '数学建模', organizer: '华中杯大学生数学建模挑战赛组委会', source: 'https://www.cmathc.org.cn/', history: '华中杯大学生数学建模挑战赛以真实问题建模和团队论文提交为核心持续举办。' },
  { name: '华东杯大学生数学建模邀请赛', category: '数学建模', organizer: '华东杯大学生数学建模邀请赛组委会', source: 'https://www.cmathc.org.cn/', history: '华东杯大学生数学建模邀请赛持续面向高校团队开展数学建模与计算分析实践。' },
  { name: '认证杯数学中国数学建模国际赛', category: '数学建模', organizer: '数学中国数学建模国际赛组委会', source: 'https://www.tzmcm.cn/', history: '认证杯数学中国数学建模国际赛持续通过开放赛题检验建模、计算与学术写作能力。' },
  { name: '亚太地区大学生数学建模竞赛（APMCM）', category: '数学建模', organizer: '亚太地区大学生数学建模竞赛组委会', source: 'https://www.apmcm.org/', history: 'APMCM持续面向亚太地区高校学生开展跨学科数学建模竞赛。' },
  { name: '深圳杯数学建模挑战赛', category: '数学建模', organizer: '深圳杯数学建模挑战赛组委会', source: 'https://www.mcm.edu.cn/', history: '深圳杯数学建模挑战赛围绕城市、产业和社会实际问题持续征集解决方案。' },
  { name: '中国电机工程学会杯全国大学生电工数学建模竞赛', category: '电工数学建模', organizer: '中国电机工程学会', source: 'https://www.cmathc.org.cn/', history: '电工数学建模竞赛持续围绕电气工程与能源系统问题开展建模实践。' },
  { name: '全国大学生物理学术竞赛（CUPT）', category: '物理', organizer: '全国大学生物理学术竞赛委员会', source: 'https://www.sues.edu.cn/79/ef/c271a293359/page.htm', history: 'CUPT借鉴国际青年物理学家锦标赛模式，持续开展开放物理问题研究、报告与对抗讨论。' },
  { name: '全国大学生数学竞赛', category: '数学', organizer: '中国数学会', source: 'https://www.cmathc.org.cn/', history: '全国大学生数学竞赛持续检验高校学生的数学基础与综合运用能力。' },
  { name: '全国大学生交通科技大赛', category: '交通运输', organizer: '教育部高等学校交通运输类专业教学指导委员会', source: 'https://civil.cqust.edu.cn/__local/C/DC/9B/1B008724F4DC2DA1D4774622C95_2C89AC01_307AC.pdf', history: '全国大学生交通科技大赛持续以交通运输领域科技创新作品促进专业实践与协同创新。' },
  { name: '全国大学生高分子材料实验实践大赛', category: '材料工程', organizer: '教育部高等学校材料类专业教学指导委员会相关单位', source: directorySource, history: '该赛事持续围绕高分子材料实验、表征与工程实践检验学生专业能力。' },
  { name: '全国大学生冶金科技竞赛', category: '冶金工程', organizer: '中国金属学会及相关高校', source: directorySource, history: '全国大学生冶金科技竞赛持续服务冶金工程人才培养与科技创新成果交流。' },
  { name: '全国大学生制药工程设计竞赛', category: '制药工程', organizer: '教育部高等学校药学类专业教学指导委员会相关单位', source: directorySource, history: '该赛事持续通过制药工程项目设计训练工艺、设备、安全与工程表达能力。' },
  { name: '全国大学生食品工程虚拟仿真大赛', category: '食品科学', organizer: '食品科学与工程类专业相关教学指导组织', source: directorySource, history: '该赛事持续利用虚拟仿真场景检验食品工程工艺分析与实践决策能力。' },
  { name: '全国大学生动物科学专业技能大赛', category: '动物科学', organizer: '动物生产类专业相关教学指导组织', source: directorySource, history: '该赛事持续围绕动物科学基础实验、生产实践与综合技能开展竞赛。' },
  { name: '全国大学生植物保护专业能力大赛', category: '植物保护', organizer: '植物生产类专业相关教学指导组织', source: directorySource, history: '该赛事持续围绕病虫害识别、监测与绿色防控检验植物保护专业能力。' },
  { name: '全国大学生土地整治与生态修复工程创新设计大赛', category: '土地资源', organizer: '土地整治与生态修复相关专业组织', source: directorySource, history: '该赛事持续以土地整治和生态修复方案设计促进多学科工程实践。' },
  { name: '全国大学生GIS应用技能大赛', category: '地理信息', organizer: '地理信息科学相关专业组织', source: directorySource, history: '全国大学生GIS应用技能大赛持续检验空间数据处理、分析与应用表达能力。' },
  { name: '全国大学生红色旅游创意策划大赛', category: '旅游管理', organizer: '文化和旅游相关单位及赛事组委会', source: directorySource, history: '该赛事持续围绕红色文化资源转化、旅游产品设计与传播策划开展实践。' },
  { name: '韩素音国际翻译大赛', category: '翻译', organizer: '中国翻译协会', source: 'https://www.tac-online.org.cn/node_1015773.html', history: '赛事源于1986年开始的青年翻译比赛，1989年设立“韩素音青年翻译奖”，2018年更名为韩素音国际翻译大赛；核心是多语种双向文本翻译，目标是培养和选拔高层次翻译人才并促进国际文化交流。' },
  { name: '全国大学生语言文字能力大赛', category: '语言文化', organizer: '赛事组委会及语言文字教育相关单位', source: directorySource, history: '该赛事持续围绕国家通用语言文字规范、表达与应用能力开展竞赛。' },
]

const rawCompetitions = [...baseCompetitions, ...additionalCompetitions, ...catalogCompetitions]
const years = [2024, 2025, 2026] as const

export function canonicalBrandName(name: string) {
  return name
    .replace(/20(?:24|25|26)年?/gu, '')
    .replace(/第[一二三四五六七八九十百0-9]+届/gu, '')
    .replace(/（(?:20(?:24|25|26)[^）]*|年度目录记录[^）]*)）/gu, '')
    .replace(/（(?:月历|目录|—)）/gu, '')
    .replace(/\s+/gu, '')
    .replace(/^年/gu, '')
    .trim()
}

const categoryCore: Record<string, string> = {
  数学建模: '核心是把真实问题抽象为数学模型，完成计算、验证与论文表达。',
  程序设计: '核心是算法设计、代码实现、复杂度控制与现场问题求解。',
  人工智能: '核心是围绕真实场景完成数据处理、模型设计、系统实现与效果验证。',
  艺术设计: '核心是通过调研、创意、视觉表达与作品呈现解决设计命题。',
  创新创业: '核心是发现真实需求，形成可验证的产品、服务或商业解决方案。',
}

function coreFor(category: string) {
  return categoryCore[category] ?? `核心是把${category}专业知识用于真实任务，完成方案设计、实践验证与成果表达。`
}

function objectiveFor(category: string) {
  return `目标是促进${category}领域的实践教学、跨学科协作与创新人才培养，并推动优秀成果交流。`
}

type Seed = SupplementalBrand & { legacy: Competition[] }
const seeds = new Map<string, Seed>()

for (const item of rawCompetitions) {
  const key = canonicalBrandName(item.name)
  const existing = seeds.get(key)
  if (existing) existing.legacy.push(item)
  else seeds.set(key, { name: key, category: item.category, organizer: item.organizer, source: item.source, audience: item.audience, format: item.format, legacy: [item] })
}

for (const item of supplementalBrands) {
  const key = canonicalBrandName(item.name)
  if (!seeds.has(key)) seeds.set(key, { ...item, legacy: [] })
}

const selectedSeeds = [...seeds.values()].slice(0, 150)
if (selectedSeeds.length !== 150) throw new Error(`Expected 150 competition brands, received ${selectedSeeds.length}`)

const verifiedDates2026 = new Map<string, [start: string, deadline: string]>([
  ['全国大学生统计建模大赛', ['2026-03-13', '2026-04-01']],
  ['全国大学生光电设计竞赛', ['2026-03-09', '2026-05-15']],
])

function buildAnnualRecord(seed: Seed, year: typeof years[number]): Competition {
  const legacy = seed.legacy.find((item) => Number(item.start.slice(0, 4)) === year)
  const suppliedDates = year === 2026 ? verifiedDates2026.get(canonicalBrandName(seed.name)) ?? seed.dates2026 : undefined
  const datePrecision: Competition['datePrecision'] = suppliedDates ? 'exact' : legacy?.id.startsWith('catalog-2026-') ? 'month' : legacy?.id.startsWith('directory-2024-') ? 'year' : legacy ? 'exact' : 'year'
  const start = suppliedDates?.[0] ?? legacy?.start ?? `${year}-01-01`
  const deadline = suppliedDates?.[1] ?? legacy?.deadline ?? `${year}-12-31`
  const history = seed.history ?? `该赛事由${seed.organizer}持续面向高校学生组织。当前保留2024—2026逐届档案；具体创办年份和历届沿革以官网档案为准。`
  const core = coreFor(seed.category)
  const objective = objectiveFor(seed.category)
  const dateNote = datePrecision === 'exact' ? '报名日期已按当前登记的官方通知保存。' : datePrecision === 'month' ? '官方月历仅公开报名月份，页面不把月初、月末边界当作精确日期。' : `${year}年度赛事已归档，未找到可核验的具体报名日期。`

  return {
    ...(legacy ?? {}),
    id: `annual-${year}-${Array.from(canonicalBrandName(seed.name)).reduce((hash, char) => ((hash * 31 + char.charCodeAt(0)) >>> 0), 7).toString(36)}`,
    name: `${year} ${canonicalBrandName(seed.name)}`,
    category: seed.category,
    organizer: legacy?.organizer ?? seed.organizer,
    level: legacy?.level ?? '全国性赛事',
    audience: legacy?.audience ?? seed.audience ?? '本科生／研究生／高职高专学生（以官网为准）',
    start,
    deadline,
    format: legacy?.format ?? seed.format ?? '以官网通知为准',
    fee: legacy?.fee ?? '以官网通知为准',
    difficulty: legacy?.difficulty ?? 3,
    value: legacy?.value ?? '暂无评级',
    status: legacy?.status ?? '未开始',
    updatedAt: legacy?.updatedAt ?? '2026-08-10 14:30',
    source: legacy?.source ?? seed.source,
    description: `${history}${core}${objective}`,
    daysLeft: legacy?.daysLeft ?? 0,
    color: legacy?.color ?? '#367dcc',
    editionYear: year,
    datePrecision,
    dateNote,
    history,
    core,
    objective,
  }
}

export const expandedCompetitions: Competition[] = selectedSeeds.flatMap((seed) => years.map((year) => buildAnnualRecord(seed, year)))
