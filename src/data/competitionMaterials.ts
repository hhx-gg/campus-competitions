import type { Competition } from './competitions'
import { canonicalBrandName } from './expandedCompetitionCatalog'
import { discoveredMaterialsBySource } from './discoveredMaterials'

export type OfficialMaterial = {
  nameZh: string
  nameEn: string
  url: string
  kind: 'file' | 'download-page'
  noteZh: string
  noteEn: string
}

const verifiedMaterials: Record<string, OfficialMaterial[]> = {
  '高教社杯全国大学生数学建模竞赛': [
    {
      nameZh: '2026年高教社杯全国大学生数学建模竞赛第一次通知（PDF）',
      nameEn: '2026 CUMCM First Official Notice (PDF)',
      url: 'https://www.cmathc.org.cn/static/upload/file/20260324/1774327148920625.pdf',
      kind: 'file',
      noteZh: '从官网通知页解析出的PDF直链，点击后由默认浏览器直接打开或下载。',
      noteEn: 'Direct PDF extracted from the official notice page; opens or downloads in the default browser.',
    },
    {
      nameZh: '2026年高教社杯全国大学生数学建模竞赛第一次通知',
      nameEn: '2026 CUMCM First Official Notice',
      url: 'https://www.cmathc.org.cn/tzxz/420.html',
      kind: 'download-page',
      noteZh: '官网通知下载页；进入页面后使用官方提供的下载入口。',
      noteEn: 'Official notice page with the organizer-provided download entry.',
    },
    {
      nameZh: '全国大学生数学建模竞赛参赛规则（2026年修订稿）',
      nameEn: 'CUMCM Rules (2026 Revision)',
      url: 'https://www.cmathc.org.cn/mcm/tz_2/',
      kind: 'download-page',
      noteZh: '官网规则与通知栏目，可查看参赛规则及论文格式规范。',
      noteEn: 'Official rules and notices section, including rules and paper formatting guidance.',
    },
  ],
  '全国大学生化工设计竞赛': [
    {
      nameZh: '2026年第二十届全国大学生化工设计竞赛正式通知（PDF）',
      nameEn: '2026 National Chemical Engineering Design Competition Notice (PDF)',
      url: 'https://iche.zju.edu.cn/uploads/20260228/ad683cd23bc2417ffa3e1dd020f000a7.pdf',
      kind: 'file',
      noteZh: '官网通知附件PDF直链。',
      noteEn: 'Direct PDF attachment from the official notice.',
    },
    {
      nameZh: '2026年第二十届全国大学生化工设计竞赛通知',
      nameEn: '2026 National College Chemical Engineering Design Competition Notice',
      url: 'https://iche.zju.edu.cn/index.php/a/sstz/1656.html',
      kind: 'download-page',
      noteZh: '包含组织机构、参赛对象、队伍要求、日程及附件入口。',
      noteEn: 'Includes organizers, eligibility, team requirements, schedule, and attachment entry.',
    },
    {
      nameZh: '2026年全国大学生化工设计竞赛设计任务书（PDF）',
      nameEn: '2026 Chemical Engineering Design Brief (PDF)',
      url: 'https://iche.zju.edu.cn/uploads/20260226/ec4637873e07197e1ce4b72c781d8617.pdf',
      kind: 'file',
      noteZh: '官网直接下载文件，包含设计背景与任务要求。',
      noteEn: 'Direct official PDF containing the design background and assignment.',
    },
    {
      nameZh: '设计文档质量评分实施细则（2026，PDF）',
      nameEn: 'Design Document Scoring Rules (2026, PDF)',
      url: 'https://iche.zju.edu.cn/zedc/attachments/2026-04/01-1776142614-33390.pdf',
      kind: 'file',
      noteZh: '官网直接下载的设计文档评审细则。',
      noteEn: 'Direct official PDF describing design-document assessment.',
    },
    {
      nameZh: '工程图纸质量评分实施细则（2026，PDF）',
      nameEn: 'Engineering Drawing Scoring Rules (2026, PDF)',
      url: 'https://iche.zju.edu.cn/zedc/attachments/2026-04/01-1776142631-33391.pdf',
      kind: 'file',
      noteZh: '官网直接下载的工程图纸评审细则。',
      noteEn: 'Direct official PDF describing engineering-drawing assessment.',
    },
  ],
  '全国大学生智能应用开发大赛（AIADC）': [
    {
      nameZh: 'AIADC 2026赛事文档中心',
      nameEn: 'AIADC 2026 Competition Documentation',
      url: 'https://www.aiadc.org.cn/docs/',
      kind: 'download-page',
      noteZh: '集中提供参赛资格、组别赛道、材料要求、评审规则与通知下载入口。',
      noteEn: 'Eligibility, tracks, submission materials, judging rules, and notice downloads.',
    },
  ],
}

function isDirectFile(url: string) {
  return /\.(pdf|docx?|xlsx?|zip)(?:$|[?#])/i.test(url)
}

export function officialMaterialsFor(item: Competition): OfficialMaterial[] {
  const verified = item.editionYear === 2026 ? verifiedMaterials[canonicalBrandName(item.sourceName ?? item.name)] : undefined
  if (verified) return verified

  const discovered = item.editionYear === 2026 ? discoveredMaterialsBySource[item.source] : undefined
  if (discovered?.length) return discovered.map((material) => ({
    ...material,
    kind: 'file',
    noteZh: '从该赛事唯一登记的官方来源页解析出的文件直链，点击后由默认浏览器打开或下载。',
    noteEn: 'Direct file link parsed from the single registered official source for this competition; opens or downloads in the default browser.',
  }))

  if (isDirectFile(item.source) && item.datePrecision === 'exact') {
    return [{
      nameZh: `${item.name}官方通知或目录材料`,
      nameEn: 'Official notice or catalog document',
      url: item.source,
      kind: 'file',
      noteZh: '官网或官方发布渠道提供的直接下载文件。',
      noteEn: 'Direct file supplied by an official website or official publishing channel.',
    }]
  }

  return [{
    nameZh: '官方赛事通知或信息页面',
    nameEn: 'Official competition notice or information page',
    url: item.source,
    kind: 'download-page',
    noteZh: '这是通知入口，不是下载文件；仅用于核对本届公告及官网是否另行提供附件。',
    noteEn: 'This is a notice entry, not a downloadable file. Use it to verify the edition and any separately published attachments.',
  }]
}
