export type CompetitionStatus = '报名中' | '未开始' | '已截止' | '日期待公布'
export type Competition = {
  id: string
  name: string
  category: string
  organizer: string
  level: string
  audience: string
  start: string
  deadline: string
  format: string
  fee: string
  difficulty: number
  value: '高' | '中' | '低' | '暂无评级'
  status: CompetitionStatus
  updatedAt: string
  source: string
  description: string
  daysLeft: number
  color: string
  editionYear?: 2024 | 2025 | 2026
  datePrecision?: 'exact' | 'month' | 'year'
  dateNote?: string
  history?: string
  core?: string
  objective?: string
  sourceName?: string
  logoUrl?: string
}

export const competitions: Competition[] = [
  {
    id: 'gaokao-cup', name: '2025 高教社杯全国大学生数学建模竞赛', category: '数学建模', organizer: '中国工业与应用数学学会', level: '国家级', audience: '本科生', start: '2025-05-20', deadline: '2025-09-05', format: '团队赛（3人）', fee: '免费', difficulty: 4, value: '高', status: '报名中', updatedAt: '2025-05-22 10:30', source: 'https://www.mcm.edu.cn', daysLeft: 5, color: '#2f7cf6', description: '面向全国普通高等学校在校本科生，围绕实际问题完成建模、论文与代码提交。',
  },
  {
    id: 'blue-bridge', name: '蓝桥杯全国软件和信息技术专业人才大赛', category: '程序设计', organizer: '工业和信息化部人才交流中心', level: '国家级', audience: '本科生', start: '2025-04-01', deadline: '2025-06-02', format: '个人赛', fee: '报名费', difficulty: 3, value: '中', status: '报名中', updatedAt: '2025-05-21 09:45', source: 'https://dasai.lanqiao.cn', daysLeft: 7, color: '#62b8db', description: '覆盖软件、嵌入式、算法等方向，适合希望用竞赛检验编程能力的学生。',
  },
  {
    id: 'mechanical', name: '全国大学生机械创新设计大赛', category: '机械创新', organizer: '中国机械工程学会', level: '国家级', audience: '本科生', start: '2025-06-01', deadline: '2025-06-04', format: '团队赛', fee: '免费', difficulty: 3, value: '中', status: '未开始', updatedAt: '2025-05-20 16:20', source: 'https://umic.org.cn', daysLeft: 9, color: '#3f94c8', description: '以机械产品创新设计为核心，强调真实场景、结构设计和作品表达。',
  },
  {
    id: 'ti-cup', name: 'TI杯2025全国大学生电子设计竞赛', category: '电子设计', organizer: '中国电子学会', level: '国家级', audience: '本科生', start: '2025-03-15', deadline: '2025-06-07', format: '团队赛', fee: '免费', difficulty: 4, value: '高', status: '报名中', updatedAt: '2025-05-20 07:50', source: 'https://www.nuedc-training.com.cn', daysLeft: 12, color: '#e36b51', description: '围绕电子系统设计、嵌入式开发和现场调试展开，需准备完整的作品链路。',
  },
  {
    id: 'three-d', name: '全国三维数字化创新设计大赛', category: '数字化设计', organizer: '中国图学学会', level: '国家级', audience: '本科生/研究生', start: '2025-05-01', deadline: '2025-06-13', format: '作品赛', fee: '免费', difficulty: 3, value: '中', status: '报名中', updatedAt: '2025-05-19 13:10', source: 'https://www.3ddl.org', daysLeft: 18, color: '#e19b36', description: '面向数字建模、工业设计与智能制造等方向，支持多专业协作。',
  },
  {
    id: 'neccs', name: '全国大学生英语竞赛（NECCS）', category: '语言文化', organizer: '高等学校大学外语教学研究会', level: '国家级', audience: '本科生/研究生', start: '2025-03-20', deadline: '2025-06-18', format: '个人赛', fee: '报名费', difficulty: 2, value: '中', status: '报名中', updatedAt: '2025-05-18 11:05', source: 'https://www.chinaneccs.cn', daysLeft: 23, color: '#5b83bd', description: '全国性英语综合能力竞赛，适合用阶段性目标建立语言学习节奏。',
  },
]
