import type { Competition } from '../data/allCompetitions'
import { canonicalBrandName } from '../data/expandedCompetitionCatalog'

const aliases: Record<string, string[]> = {
  高教社杯全国大学生数学建模竞赛: ['CUMCM', 'MCM', 'shuxuejianmo', 'sxjm', 'mathematical modeling'],
  蓝桥杯全国软件和信息技术专业人才大赛: ['lanqiaobei', 'lqb', 'lanqiao cup', 'programming'],
  全国大学生机械创新设计大赛: ['jixiechuangxin', 'jx', 'mechanical innovation'],
  全国大学生电子设计竞赛: ['TI cup', 'NUEDC', 'dianzisheji', 'electronic design'],
  全国三维数字化创新设计大赛: ['3D', '3DDL', 'sanweishuzi', 'digital design'],
  '全国大学生英语竞赛（NECCS）': ['NECCS', 'yingyujingsai', 'english competition'],
  中国国际大学生创新大赛: ['互联网+', 'hulianwang+', 'innovation china', 'chuangxinchuangye'],
}

export const normalizeSearchText = (value: string) => value.normalize('NFKC').toLocaleLowerCase().replace(/[\s·•—_\-/／（）()]+/g, '')

export function competitionSearchText(item: Competition): string {
  return normalizeSearchText([
    item.name, item.category, item.organizer, item.audience, item.format, item.fee,
    item.description, item.history, item.core, item.objective, item.level, item.status, ...(aliases[canonicalBrandName(item.name)] ?? []),
  ].join(' '))
}

export function searchCompetitions(items: Competition[], query: string): Competition[] {
  const needle = normalizeSearchText(query.trim())
  if (!needle) return items
  return items.filter((item) => competitionSearchText(item).includes(needle))
}
