import {
  emptyLocalUserState, LOCAL_STATE_KEY, type CompetitionPlan, type LocalUserState,
} from '../data/schema'

const strings = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []

function plans(value: unknown): CompetitionPlan[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const candidate = item as Partial<CompetitionPlan>
    if (typeof candidate.competitionId !== 'string') return []
    const rating = Number(candidate.personalRating)
    return [{
      competitionId: candidate.competitionId,
      note: typeof candidate.note === 'string' ? candidate.note.slice(0, 4000) : '',
      personalRating: rating >= 1 && rating <= 5 ? rating as 1 | 2 | 3 | 4 | 5 : undefined,
      tasks: Array.isArray(candidate.tasks) ? candidate.tasks.flatMap((task) => task && typeof task === 'object' && typeof (task as { title?: unknown }).title === 'string' ? [{ id: typeof (task as { id?: unknown }).id === 'string' ? (task as { id: string }).id : crypto.randomUUID(), title: (task as { title: string }).title.slice(0, 200), completed: Boolean((task as { completed?: unknown }).completed) }] : []) : [],
      updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : new Date().toISOString(),
    }]
  })
}

export function normalizeLocalUserState(raw: string | null): LocalUserState {
  try {
    if (!raw) return emptyLocalUserState()
    const parsed = JSON.parse(raw) as Record<string, unknown>
    return {
      schemaVersion: 3,
      favorites: strings(parsed.favorites),
      hidden: strings(parsed.hidden),
      plans: plans(parsed.plans),
      language: parsed.language === 'en' ? 'en' : 'zh',
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    }
  } catch {
    return emptyLocalUserState()
  }
}

export function readLocalUserState(): LocalUserState {
  if (typeof window === 'undefined') return emptyLocalUserState()
  const raw = window.localStorage.getItem(LOCAL_STATE_KEY)
  if (raw) {
    try { JSON.parse(raw) }
    catch { window.localStorage.setItem(`${LOCAL_STATE_KEY}/corrupt-backup`, raw) }
  }
  return normalizeLocalUserState(raw)
}

export function writeLocalUserState(state: Omit<LocalUserState, 'schemaVersion' | 'updatedAt'>): void {
  if (typeof window === 'undefined') return
  const payload: LocalUserState = { schemaVersion: 3, ...state, updatedAt: new Date().toISOString() }
  window.localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(payload))
}
