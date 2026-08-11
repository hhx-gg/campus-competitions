export type SourceAccessStatus = 'verified' | 'needs-retry'

export type SourceRecord = {
  id: string
  name: string
  url: string
  accessStatus: SourceAccessStatus
  lastChecked: string
}

export const sourceRegistry: SourceRecord[] = [
  { id: 'cumcm-notice-2026', name: '2026高教社杯全国大学生数学建模竞赛通知公开页', url: 'https://www.cmathc.org.cn/', accessStatus: 'verified', lastChecked: '2026-08-09' },
  { id: 'chemical-design', name: '全国大学生化工设计竞赛官网', url: 'https://iche.zju.edu.cn/', accessStatus: 'verified', lastChecked: '2026-08-08' },
  { id: 'aiadc', name: '全国大学生智能应用开发大赛文档中心', url: 'https://www.aiadc.org.cn/', accessStatus: 'verified', lastChecked: '2026-08-08' },
  { id: 'chemical-digital', name: '全国大学生化工过程数字创新竞赛官网', url: 'https://cedic.cteic.com/', accessStatus: 'verified', lastChecked: '2026-08-08' },
  { id: 'moe-innovation-notice', name: '教育部创新大赛通知', url: 'https://www.moe.gov.cn/srcsite/A08/s5672/202505/t20250509_1189810.html', accessStatus: 'verified', lastChecked: '2026-08-08' },
  { id: 'ncss-innovation', name: '全国大学生创业服务网', url: 'https://cy.ncss.cn/', accessStatus: 'verified', lastChecked: '2026-08-08' },
  { id: 'cumcm', name: '全国大学生数学建模竞赛', url: 'https://www.mcm.edu.cn/index.moma', accessStatus: 'verified', lastChecked: '2026-08-08' },
  { id: 'lanqiao', name: '蓝桥杯大赛', url: 'https://dasai.lanqiao.cn/', accessStatus: 'verified', lastChecked: '2026-08-08' },
  { id: 'nuedc', name: '全国大学生电子设计竞赛', url: 'https://www.nuedc-training.com.cn/', accessStatus: 'needs-retry', lastChecked: '2026-08-08' },
  { id: 'umic', name: '全国大学生机械创新设计大赛', url: 'https://umic.org.cn/', accessStatus: 'verified', lastChecked: '2026-08-08' },
  { id: '3ddl', name: '全国三维数字化创新设计大赛', url: 'https://www.3ddl.org/', accessStatus: 'verified', lastChecked: '2026-08-08' },
  { id: 'neccs', name: '全国大学生英语竞赛', url: 'https://www.chinaneccs.cn/', accessStatus: 'verified', lastChecked: '2026-08-08' },
  { id: 'neccs-notice-njust', name: '南京理工大学公开的2026全国大学生英语竞赛组委会通知', url: 'https://xspace.njust.edu.cn/', accessStatus: 'verified', lastChecked: '2026-08-08' },
  { id: 'shuwei-cup', name: '数维杯', url: 'https://nmmcm.org.cn/', accessStatus: 'verified', lastChecked: '2026-08-08' },
  { id: 'zhongqing-cup', name: '中青杯', url: 'https://www.cycmcm.com/', accessStatus: 'verified', lastChecked: '2026-08-08' },
  { id: 'kechuang-cup', name: '科创杯', url: 'https://www.simcm.org.cn/', accessStatus: 'verified', lastChecked: '2026-08-08' },
  { id: 'cpipc', name: '中国研究生创新实践系列大赛管理平台', url: 'https://cpipc.acge.org.cn/', accessStatus: 'verified', lastChecked: '2026-08-10' },
  { id: 'mechanical-series', name: '中国大学生机械工程创新创意大赛平台', url: 'https://www.gczbds.org/', accessStatus: 'needs-retry', lastChecked: '2026-08-10' },
  { id: 'business-elite', name: '全国高校商业精英挑战赛平台', url: 'https://ssyth.cubec.org.cn/', accessStatus: 'verified', lastChecked: '2026-08-10' },
  { id: 'c4', name: '中国高校计算机大赛', url: 'https://www.c4best.cn/', accessStatus: 'needs-retry', lastChecked: '2026-08-10' },
  { id: 'ccpc', name: '中国大学生程序设计竞赛', url: 'https://ccpc.io/', accessStatus: 'verified', lastChecked: '2026-08-10' },
  { id: 'mooctest', name: '全国大学生软件测试大赛平台', url: 'https://www.mooctest.net/', accessStatus: 'verified', lastChecked: '2026-08-10' },
  { id: 'mathorcup', name: 'MathorCup高校数学建模挑战赛', url: 'https://www.mathorcup.org/', accessStatus: 'verified', lastChecked: '2026-08-10' },
  { id: '51mcm', name: '五一数学建模竞赛', url: 'https://51mcm.cumt.edu.cn/', accessStatus: 'verified', lastChecked: '2026-08-10' },
  { id: 'tzmcm', name: '认证杯数学中国数学建模国际赛', url: 'https://www.tzmcm.cn/', accessStatus: 'needs-retry', lastChecked: '2026-08-10' },
  { id: 'apmcm', name: '亚太地区大学生数学建模竞赛', url: 'https://www.apmcm.org/', accessStatus: 'verified', lastChecked: '2026-08-10' },
  { id: 'cupt', name: '2026中国大学生物理学术竞赛公开通知', url: 'https://www.sues.edu.cn/79/ef/c271a293359/page.htm', accessStatus: 'verified', lastChecked: '2026-08-10' },
  { id: 'nactrans', name: '2026全国大学生交通科技大赛公开通知文件', url: 'https://civil.cqust.edu.cn/__local/C/DC/9B/1B008724F4DC2DA1D4774622C95_2C89AC01_307AC.pdf', accessStatus: 'verified', lastChecked: '2026-08-10' },
  { id: 'tac-hanyuyin', name: '中国翻译协会韩素音国际翻译大赛专题', url: 'https://www.tac-online.org.cn/node_1015773.html', accessStatus: 'verified', lastChecked: '2026-08-10' },
  { id: 'competition-directory-2024', name: '2024全国普通高校大学生竞赛分析报告目录公开文件', url: 'https://www.sdor.cn/', accessStatus: 'verified', lastChecked: '2026-08-10' },
  ...catalogSources.map((url, index) => ({ id: `catalog-source-${index + 1}`, name: '2026竞赛月历登记来源', url, accessStatus: 'verified' as const, lastChecked: '2026-08-10' })),
]
import { catalogSources } from './catalogCompetitions'
