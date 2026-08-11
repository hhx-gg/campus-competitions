export type CompetitionStatus = 'upcoming' | 'ongoing' | 'ended' | 'unknown'

export type CompetitionRecord = {
  id: string
  name: string
  edition?: string
  category: string
  organizer: string
  organizerType: 'government' | 'association-official' | 'contest-committee' | 'enterprise-official' | 'government-platform'
  level: 'national' | 'provincial' | 'school' | 'unknown'
  audience: string[]
  startAt?: string
  registrationDeadline?: string
  stages?: string[]
  format?: 'online' | 'offline' | 'hybrid' | 'unknown'
  fee?: string
  officialUrl: string
  registrationUrl?: string
  sourceId: string
  sourceUpdatedAt?: string
  verifiedAt: string
  difficulty?: 1 | 2 | 3 | 4 | 5
  value?: 1 | 2 | 3 | 4 | 5
  difficultyEvidence?: string[]
  status: CompetitionStatus
  needsReview: boolean
  isSynthetic?: boolean
}

export type PlanTask = { id: string; title: string; completed: boolean }

export type CompetitionPlan = {
  competitionId: string
  note: string
  personalRating?: 1 | 2 | 3 | 4 | 5
  tasks: PlanTask[]
  updatedAt: string
}

export type LocalUserState = {
  schemaVersion: 3
  favorites: string[]
  hidden: string[]
  plans: CompetitionPlan[]
  language: 'zh' | 'en'
  theme: 'light' | 'dark'
  updatedAt: string
}

export const LOCAL_STATE_KEY = 'campus-competition/local-state'

export const emptyLocalUserState = (): LocalUserState => ({
  schemaVersion: 3,
  favorites: [],
  hidden: [],
  plans: [],
  language: 'zh',
  theme: 'light',
  updatedAt: new Date().toISOString(),
})
