import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen, CalendarDays, ChevronRight, CircleHelp, Download, Eye,
  FileText, Heart, Home, Languages, ListFilter, Moon, RefreshCw,
  Search, ShieldCheck, Sun, UserRound, X, Zap,
} from 'lucide-react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { openUrl } from '@tauri-apps/plugin-opener'
import { competitions, type Competition } from './data/allCompetitions'
import { sourceRegistry } from './data/sourceRegistry'
import { readLocalUserState, writeLocalUserState } from './lib/localStore'
import type { CompetitionPlan } from './data/schema'
import { searchCompetitions } from './lib/competitionSearch'
import { auditCompetitionData, type DataQualityReport } from './lib/dataQuality'
import { competitionName, fieldValue, iconCode } from './data/competitionI18n'
import { officialMaterialsFor } from './data/competitionMaterials'
import { officialLogoFor } from './data/officialLogos'
import {
  checkForDataUpdates, isToday, loadCachedChanges, loadCachedCompetitionData, type DataChange,
} from './lib/dataUpdates'
import { installAvailableAppUpdate } from './lib/appUpdates'

type View = 'home' | 'search' | 'updates' | 'detail' | 'favorites' | 'calendar' | 'profile'
type Language = 'zh' | 'en'
type FavoriteTab = 'saved' | 'plans' | 'hidden'
const APP_VERSION = '0.6.0'

const copy = {
  zh: {
    appName: '杜绝信息差', appSub: '大学生友好竞赛消息工具', archive: '竞赛资料室 / INDEX', sourceOnly: '仅展示公开可访问的官方来源',
    home: '首页', search: '分类查找', detail: '竞赛详情', favorites: '我的收藏', calendar: '赛程日历', profile: '个人设置',
    searchPlaceholder: '搜索竞赛名称、主办方、专业关键词', light: '浅色模式', dark: '深色模式', current: '本地数据已加载',
    welcome: '把重要的竞赛，放在眼前。', welcomeSub: '公开来源、时间节点和准备计划，都在同一个清晰的工作台里。', browse: '浏览全部竞赛',
    upcoming: '即将结束', latest: '最新竞赛记录', allRecords: '查看全部', saved: '已收藏', hidden: '已隐藏',
    find: '按分类查找竞赛。', found: '项竞赛', reset: '重置筛选', allStatus: '全部报名状态', allCategory: '全部专业类别',
    byDeadline: '按截止时间', byUpdated: '按更新时间', byDifficulty: '按难度', deadline: '报名截止', days: '天', difficulty: '难度', value: '含金量',
    viewDetails: '查看详情', save: '收藏', unsave: '取消收藏', openOfficial: '打开官网', hide: '隐藏此竞赛', back: '返回分类查找',
    basic: '基本信息', traceable: '来源可追溯', category: '竞赛类别', organizer: '主办方／企业', level: '竞赛级别', audience: '参赛对象', start: '报名开始时间', format: '比赛形式', fee: '报名费用', official: '官网与报名链接',
    background: '竞赛背景', requirements: '参赛要求', materials: '官方文件与通知',
    localLedger: '收藏、参赛计划与隐藏状态只保存在这台设备上。', savedList: '收藏列表', plans: '参赛计划', hiddenList: '已隐藏竞赛', restore: '恢复显示', emptySaved: '还没有收藏竞赛', emptyPlans: '还没有创建参赛计划', emptyHidden: '没有已隐藏竞赛',
    print: '打印日历', recent: '最近节点', settings: '个人设置', settingsSub: '不需要账号，偏好只保存在你的设备上。', appearance: '界面与使用偏好', theme: '主题模式', language: '界面语言', dataAccess: '数据访问', publicOnly: '公开来源模式', permissions: '只读取公开可访问的官方页面', appInfo: '应用信息', localMode: '收藏、计划和隐藏状态不会上传', sources: '官方来源登记', version: '当前版本', update: '检查数据完整性',
    localData: '本地数据模式', localPlans: '本地参赛计划', noResults: '没有找到符合条件的竞赛，请调整筛选条件。', help: '先搜索竞赛，再进入详情查看官网、收藏或建立参赛计划。',
    todayUpdates: '今日新更竞赛消息', noTodayUpdates: '无', updateList: '今日更新', checking: '正在检查更新', retryUpdate: '重新检查',
  },
  en: {
    appName: 'No More Info Gaps', appSub: 'College Competition Desk', archive: 'COMPETITION ARCHIVE', sourceOnly: 'Official, publicly accessible sources only',
    home: 'Home', search: 'Browse by Category', detail: 'Details', favorites: 'Favorites', calendar: 'Calendar', profile: 'Settings',
    searchPlaceholder: 'Search competitions, organizers, or subjects', light: 'Light theme', dark: 'Dark theme', current: 'Local data loaded',
    welcome: 'Keep important competitions in sight.', welcomeSub: 'Official sources, key dates, and your plans in one clear workspace.', browse: 'Browse competitions',
    upcoming: 'Closing soon', latest: 'Latest records', allRecords: 'View all', saved: 'Saved', hidden: 'Hidden',
    find: 'Find your next competition.', found: 'competitions', reset: 'Reset filters', allStatus: 'All registration states', allCategory: 'All subject areas',
    byDeadline: 'Deadline', byUpdated: 'Last updated', byDifficulty: 'Difficulty', deadline: 'Registration deadline', days: 'days', difficulty: 'Difficulty', value: 'Recognition',
    viewDetails: 'View details', save: 'Save', unsave: 'Remove saved', openOfficial: 'Open official site', hide: 'Hide competition', back: 'Back to results',
    basic: 'Basic information', traceable: 'Traceable source', category: 'Category', organizer: 'Organizer', level: 'Level', audience: 'Eligible students', start: 'Registration opens', format: 'Format', fee: 'Fee', official: 'Official website',
    background: 'Competition background', requirements: 'Entry requirements', materials: 'Official files and notices',
    localLedger: 'Saved items, plans, and hidden records stay on this device.', savedList: 'Saved list', plans: 'Competition plans', hiddenList: 'Hidden competitions', restore: 'Restore', emptySaved: 'No saved competitions yet', emptyPlans: 'No competition plans yet', emptyHidden: 'No hidden competitions',
    print: 'Print calendar', recent: 'Upcoming dates', settings: 'Settings', settingsSub: 'No account required. Preferences remain on this device.', appearance: 'Appearance and language', theme: 'Theme', language: 'Interface language', dataAccess: 'Data access', publicOnly: 'Public sources only', permissions: 'Reads public official pages only', appInfo: 'Application information', localMode: 'Saved, plan, and hidden state is never uploaded', sources: 'Registered official sources', version: 'Version', update: 'Check data integrity',
    localData: 'Local data mode', localPlans: 'Local competition plans', noResults: 'No competitions match these filters.', help: 'Search for a competition, then open its details to visit the official site, save it, or build a plan.',
    todayUpdates: 'Competition updates today', noTodayUpdates: 'None', updateList: "Today's updates", checking: 'Checking for updates', retryUpdate: 'Check again',
  },
} as const

type CopyKey = keyof typeof copy.zh
const tx = (language: Language, key: CopyKey) => copy[language][key]

function localValue(language: Language, value: string) {
  return fieldValue(language, value)
}

function displayDate(language: Language, item: Competition, field: 'start' | 'deadline') {
  if (!item.datePrecision || item.datePrecision === 'exact') return item[field]
  const year = item.editionYear ?? Number(item[field].slice(0, 4))
  if (item.datePrecision === 'month') {
    const month = Number(item[field].slice(5, 7))
    return language === 'zh' ? `${year}年${month}月（仅月份）` : `${year}-${String(month).padStart(2, '0')} (month only)`
  }
  return language === 'zh' ? `${year}年（具体日期未公开）` : `${year} (exact dates not published)`
}

function localizedCompetition(language: Language, item: Competition): Competition {
  if (language === 'zh') return item
  const category = fieldValue(language, item.category)
  return {
    ...item,
    sourceName: item.sourceName ?? item.name,
    name: competitionName(language, item),
    organizer: fieldValue(language, item.organizer),
    description: 'Competition details are based on the linked official source.',
    history: 'This annual record preserves the competition’s 2024–2026 editions. Founding dates and detailed historical milestones follow the official archive.',
    core: `The core task applies ${category} knowledge to a real brief through design, implementation, validation, and presentation.`,
    objective: `The competition aims to strengthen practical education, interdisciplinary collaboration, and student innovation in ${category}.`,
    dateNote: item.datePrecision === 'exact' ? 'Registration dates are stored from the currently registered official notice.' : item.datePrecision === 'month' ? 'The official calendar publishes months only; month boundaries are not shown as exact dates.' : 'The annual edition is archived, but exact registration dates have not been verified.',
  }
}

async function openOfficialUrl(url: string, language: Language, notify: (message: string) => void) {
  let parsed: URL
  try { parsed = new URL(url) } catch { notify(language === 'zh' ? '官网地址无效，已阻止打开。' : 'Invalid official URL.'); return }
  const allowedHosts = new Set(sourceRegistry.map((source) => new URL(source.url).hostname.toLowerCase()))
  if (parsed.protocol !== 'https:' || !allowedHosts.has(parsed.hostname.toLowerCase())) {
    notify(language === 'zh' ? '已阻止：该链接不是已登记的 HTTPS 官方域名。' : 'Blocked: this link is not an approved HTTPS official domain.')
    return
  }
  try { await openUrl(parsed.toString()) }
  catch { notify(language === 'zh' ? '无法打开官网，请检查默认浏览器后重试。' : 'Unable to open the official site. Check your default browser and try again.') }
}

const navItems: Array<{ id: 'home' | 'search' | 'favorites' | 'calendar' | 'profile'; icon: typeof Home }> = [
  { id: 'home', icon: Home }, { id: 'search', icon: Search }, { id: 'favorites', icon: Heart },
  { id: 'calendar', icon: CalendarDays }, { id: 'profile', icon: UserRound },
]

export default function App() {
  const initial = useMemo(() => readLocalUserState(), [])
  const initialData = useMemo(() => loadCachedCompetitionData(competitions), [])
  const [view, setView] = useState<View>('home')
  const [query, setQuery] = useState('')
  const [favorites, setFavorites] = useState(() => new Set(initial.favorites))
  const [hidden, setHidden] = useState(() => new Set(initial.hidden))
  const [plans, setPlans] = useState<CompetitionPlan[]>(initial.plans)
  const [competitionData, setCompetitionData] = useState<Competition[]>(initialData)
  const [changes, setChanges] = useState<DataChange[]>(() => loadCachedChanges())
  const [selected, setSelected] = useState<Competition>(initialData[0])
  const [theme, setTheme] = useState<'light' | 'dark'>(initial.theme)
  const [language, setLanguage] = useState<Language>(initial.language)
  const [notice, setNotice] = useState('')
  const [syncState, setSyncState] = useState<'idle' | 'checking' | 'offline'>('idle')

  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 2800) }
  const visible = useMemo(() => competitionData.filter((item) => !hidden.has(item.id)), [competitionData, hidden])
  const localizedVisible = useMemo(() => visible.map((item) => localizedCompetition(language, item)), [visible, language])
  const filtered = useMemo(() => searchCompetitions(localizedVisible, query), [localizedVisible, query])
  const selectedDisplay = useMemo(() => localizedCompetition(language, selected), [language, selected])
  const dataQuality = useMemo(() => auditCompetitionData(competitionData, sourceRegistry), [competitionData])
  const todayChanges = useMemo(() => [...new Map(changes.filter((item) => isToday(item.changedAt)).map((item) => [item.id, item])).values()], [changes])
  const todayUpdateIds = useMemo(() => new Set(todayChanges.map((item) => item.id)), [todayChanges])

  const planIds = useMemo(() => new Set(plans.map((item) => item.competitionId)), [plans])
  useEffect(() => { writeLocalUserState({ favorites: [...favorites], hidden: [...hidden], plans, language, theme }) }, [favorites, hidden, plans, language, theme])
  useEffect(() => { document.title = language === 'zh' ? '杜绝信息差——大学生友好竞赛消息工具' : 'No More Info Gaps — College Competition Desk' }, [language])

  const runDataUpdate = async (force = false) => {
    if (syncState === 'checking') return
    setSyncState('checking')
    const result = await checkForDataUpdates(competitions, force)
    setCompetitionData(result.records)
    setChanges(result.changes)
    setSelected((current) => result.records.find((item) => item.id === current.id) ?? result.records[0] ?? current)
    setSyncState(result.status === 'offline' ? 'offline' : 'idle')
    if (force) notify(result.status === 'offline'
      ? (language === 'zh' ? `更新失败，已保留上一版数据：${result.error}` : `Update failed; previous data kept: ${result.error}`)
      : (language === 'zh' ? '数据已检查并更新。' : 'Competition data checked and updated.'))
  }

  useEffect(() => {
    void runDataUpdate(false)
    const now = new Date()
    const next = new Date(now); next.setHours(24, 0, 0, 0)
    let dailyTimer = 0
    const midnightTimer = window.setTimeout(() => {
      void runDataUpdate(true)
      dailyTimer = window.setInterval(() => void runDataUpdate(true), 86_400_000)
    }, next.getTime() - now.getTime())
    return () => { window.clearTimeout(midnightTimer); if (dailyTimer) window.clearInterval(dailyTimer) }
    // The updater intentionally starts once and owns its timer lifecycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let checking = false
    const run = async () => {
      if (checking) return
      checking = true
      try { await installAvailableAppUpdate((version) => notify(language === 'zh' ? `正在安装应用更新 v${version}…` : `Installing application update v${version}…`)) }
      catch (error) { notify(language === 'zh' ? `应用升级检查失败，稍后将自动重试：${String(error)}` : `App update check failed and will retry later: ${String(error)}`) }
      finally { checking = false }
    }
    void run()
    const timer = window.setInterval(() => void run(), 6 * 60 * 60 * 1000)
    return () => window.clearInterval(timer)
    // The binary updater checks at launch and every six hours; data updates use the separate daily timer above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleSet = (setter: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) => setter((current) => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next })
  const openDetail = (item: Competition) => { setSelected(competitionData.find((candidate) => candidate.id === item.id) ?? item); setView('detail') }
  const savePlan = (plan: CompetitionPlan) => setPlans((current) => [...current.filter((item) => item.competitionId !== plan.competitionId), plan])
  const hideCompetition = (id: string) => {
    setHidden((current) => new Set(current).add(id))
    notify(language === 'zh' ? '已隐藏。可在“我的收藏 → 已隐藏竞赛”中恢复。' : 'Hidden. Restore it from Favorites → Hidden competitions.')
  }

  return <div className={`app-shell ${theme === 'dark' ? 'theme-dark' : ''}`} lang={language === 'zh' ? 'zh-CN' : 'en'}>
    <header className="window-bar">
      <div className="brand-lockup"><div className="brand-mark"><img src="/logo.png" alt="" /></div><div><strong>{tx(language, 'appName')}</strong><span>{tx(language, 'appSub')}</span></div></div>
      <div className="window-actions"><button aria-label={language === 'zh' ? '帮助' : 'Help'} onClick={() => notify(tx(language, 'help'))}><CircleHelp size={18} /></button><button aria-label={language === 'zh' ? '最小化窗口' : 'Minimize window'} onClick={() => void getCurrentWindow().minimize()}>—</button><button aria-label={language === 'zh' ? '关闭窗口' : 'Close window'} onClick={() => void getCurrentWindow().close()}>×</button></div>
    </header>
    <div className="app-body">
      <aside className="sidebar"><div className="sidebar-label">{tx(language, 'archive')}</div><nav>
        {navItems.map(({ id, icon: Icon }) => <button key={id} className={`nav-item ${view === id ? 'active' : ''}`} onClick={() => setView(id)}><Icon size={20} /><span>{tx(language, id)}</span>{id === 'favorites' && <em>{favorites.size}</em>}</button>)}
      </nav><div className="sidebar-note"><p>{language === 'zh' ? '信息可追溯，隐藏可恢复。' : 'Traceable sources. Reversible choices.'}</p><span>2024—2026</span></div><div className="sidebar-bottom"><ShieldCheck size={16} /> {tx(language, 'sourceOnly')}</div></aside>
      <main className="main-content">
        <div className="top-toolbar">
          <div className="global-search"><Search size={20} /><input value={query} onChange={(event) => { setQuery(event.target.value); setView('search') }} placeholder={tx(language, 'searchPlaceholder')} />{query && <button aria-label="Clear" onClick={() => setQuery('')}><X size={17} /></button>}</div>
          <div className="toolbar-actions"><button className="plain-button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? <Sun size={18} /> : <Moon size={18} />} {tx(language, theme === 'light' ? 'light' : 'dark')}</button><button className="plain-button" onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}><Languages size={18} /> {language === 'zh' ? '中文 / EN' : 'English / Chinese'}</button><button className={`sync-status sync-${syncState}`} disabled={syncState === 'checking'} onClick={() => void runDataUpdate(true)}><RefreshCw size={18} /> {syncState === 'checking' ? tx(language, 'checking') : tx(language, 'retryUpdate')}<span /></button></div>
        </div>
        {view === 'home' && <HomeView language={language} items={localizedVisible} favorites={favorites} todayUpdateCount={todayChanges.length} onOpen={openDetail} onFavorite={(id) => toggleSet(setFavorites, id)} onHide={hideCompetition} onView={setView} />}
        {view === 'search' && <SearchView language={language} items={filtered} onOpen={openDetail} onFavorite={(id) => toggleSet(setFavorites, id)} favorites={favorites} onReset={() => setQuery('')} />}
        {view === 'updates' && <TodayUpdatesView language={language} items={localizedVisible.filter((item) => todayUpdateIds.has(item.id))} changes={todayChanges} onOpen={openDetail} onBack={() => setView('home')} />}
        {view === 'detail' && <DetailView language={language} item={selectedDisplay} favorite={favorites.has(selected.id)} plan={plans.find((entry) => entry.competitionId === selected.id)} onBack={() => setView('search')} onFavorite={() => toggleSet(setFavorites, selected.id)} onSavePlan={savePlan} onOfficial={() => void openOfficialUrl(selected.source, language, notify)} onHide={() => { hideCompetition(selected.id); setView('home') }} notify={notify} />}
        {view === 'favorites' && <FavoritesView language={language} favorites={localizedVisible.filter((item) => favorites.has(item.id))} plans={localizedVisible.filter((item) => planIds.has(item.id))} hidden={competitionData.filter((item) => hidden.has(item.id)).map((item) => localizedCompetition(language, item))} onOpen={openDetail} onRestore={(id) => setHidden((s) => { const next = new Set(s); next.delete(id); return next })} onRemovePlan={(id) => setPlans((current) => current.filter((item) => item.competitionId !== id))} />}
        {view === 'calendar' && <CalendarView language={language} items={localizedVisible} onOpen={openDetail} />}
        {view === 'profile' && <ProfileView language={language} theme={theme} dataQuality={dataQuality} onLanguage={setLanguage} onTheme={setTheme} notify={notify} />}
      </main>
    </div>
    <footer className="status-bar"><span><FileText size={15} /> {tx(language, 'localPlans')}</span><span><ShieldCheck size={15} /> {syncState === 'offline' ? (language === 'zh' ? '离线：使用上一版数据' : 'Offline: previous data in use') : tx(language, 'localData')}</span><span className="version">v{APP_VERSION} · {competitionData.length} {tx(language, 'found')}</span></footer>
    {notice && <div className="toast" role="status"><Zap size={17} /> {notice}</div>}
  </div>
}

function HomeView({ language, items, favorites, todayUpdateCount, onOpen, onFavorite, onHide, onView }: { language: Language; items: Competition[]; favorites: Set<string>; todayUpdateCount: number; onOpen: (item: Competition) => void; onFavorite: (id: string) => void; onHide: (id: string) => void; onView: (view: View) => void }) {
  const upcoming = useMemo(() => items.filter((item) => item.datePrecision === 'exact' && item.status !== '已截止').sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 8), [items])
  const savedItems = useMemo(() => items.filter((item) => favorites.has(item.id)).slice(0, 8), [items, favorites])
  return <div className="page home-page"><div className="page-heading"><div><h1>{tx(language, 'welcome')}</h1><p className="lede">{tx(language, 'welcomeSub')}</p></div><button className="primary-button" onClick={() => onView('search')}><Search size={18} /> {tx(language, 'browse')}</button></div>
    <button className={`today-update-strip ${todayUpdateCount ? 'has-updates' : ''}`} disabled={!todayUpdateCount} onClick={() => onView('updates')} aria-label={`${tx(language, 'todayUpdates')}: ${todayUpdateCount || tx(language, 'noTodayUpdates')}`}><RefreshCw size={19} /><span>{tx(language, 'todayUpdates')}：</span><strong>{todayUpdateCount || tx(language, 'noTodayUpdates')}</strong>{todayUpdateCount > 0 && <><em>{language === 'zh' ? '点击查看新增与变更' : 'View additions and changes'}</em><ChevronRight size={18} /></>}</button>
    <section className="panel deadline-panel"><PanelHeading title={tx(language, 'upcoming')} meta={tx(language, 'allRecords')} action={() => onView('search')} /><div className="deadline-grid">{upcoming.map((item) => <CompetitionCard key={item.id} language={language} item={item} favorite={favorites.has(item.id)} onOpen={onOpen} onFavorite={onFavorite} onHide={onHide} />)}</div></section>
    <section className="panel saved-home-panel"><PanelHeading title={tx(language, 'saved')} meta={tx(language, 'favorites')} action={() => onView('favorites')} />{savedItems.length ? <div className="deadline-grid">{savedItems.map((item) => <CompetitionCard key={item.id} language={language} item={item} favorite onOpen={onOpen} onFavorite={onFavorite} onHide={onHide} />)}</div> : <EmptyState text={language === 'zh' ? '还没有收藏竞赛，可前往分类查找添加。' : 'No saved competitions yet. Browse by category to add some.'} />}</section>
  </div>
}

function TodayUpdatesView({ language, items, changes, onOpen, onBack }: { language: Language; items: Competition[]; changes: DataChange[]; onOpen: (item: Competition) => void; onBack: () => void }) {
  const changeById = useMemo(() => new Map(changes.map((change) => [change.id, change])), [changes])
  return <div className="page"><div className="page-heading compact"><div><h1>{tx(language, 'updateList')}</h1><p className="lede">{items.length ? (language === 'zh' ? `今天共有 ${items.length} 项新增或变更，点击任一赛事查看完整信息。` : `${items.length} competitions were added or changed today. Open one for full details.`) : (language === 'zh' ? '今天暂时没有新的赛事变化。' : 'There are no competition changes today.')}</p></div><button className="secondary-button" onClick={onBack}>{tx(language, 'back')}</button></div>
    <section className="panel update-results-panel">{items.length === 0 ? <EmptyState text={language === 'zh' ? '今日新更竞赛消息：无' : 'Competition updates today: None'} /> : <div className="today-update-list">{items.map((item) => { const change = changeById.get(item.id); return <button key={item.id} className="today-update-row" onClick={() => onOpen(item)}><div className="result-icon"><CompetitionIcon item={item} /></div><span><strong>{item.name}</strong><small>{localValue(language, item.category)} · {item.organizer}</small></span><em>{change?.kind === 'added' ? (language === 'zh' ? '新增' : 'Added') : (language === 'zh' ? '已更新' : 'Updated')}</em><ChevronRight size={18} /></button> })}</div>}</section>
  </div>
}

function SearchView({ language, items, onOpen, onFavorite, favorites, onReset }: { language: Language; items: Competition[]; onOpen: (item: Competition) => void; onFavorite: (id: string) => void; favorites: Set<string>; onReset: () => void }) {
  const [status, setStatus] = useState('all'); const [category, setCategory] = useState('all'); const [year, setYear] = useState<'all' | '2024' | '2025' | '2026'>('2026'); const [sort, setSort] = useState<'deadline' | 'updated' | 'difficulty'>('deadline')
  const shown = useMemo(() => items.filter((i) => year === 'all' || String(i.editionYear ?? i.start.slice(0, 4)) === year).filter((i) => status === 'all' || i.status === status).filter((i) => category === 'all' || i.category === category).sort((a, b) => sort === 'difficulty' ? b.difficulty - a.difficulty : sort === 'updated' ? b.updatedAt.localeCompare(a.updatedAt) : a.deadline.localeCompare(b.deadline)), [items, year, status, category, sort])
  const reset = () => { setYear('2026'); setStatus('all'); setCategory('all'); onReset() }
  return <div className="page"><div className="page-heading compact"><div><h1>{tx(language, 'find')}</h1><p className="lede">{shown.length} {tx(language, 'found')}</p></div><button className="secondary-button" onClick={reset}><RefreshCw size={17} /> {tx(language, 'reset')}</button></div><div className="year-tabs" role="tablist" aria-label={language === 'zh' ? '赛事年份' : 'Competition year'}>{(['2024','2025','2026','all'] as const).map((value) => <button role="tab" aria-selected={year === value} className={year === value ? 'active' : ''} key={value} onClick={() => setYear(value)}>{value === 'all' ? (language === 'zh' ? '全部年份' : 'All years') : value}</button>)}</div><div className="filter-bar"><div><ListFilter size={17} /></div><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">{tx(language, 'allStatus')}</option><option value="报名中">{localValue(language, '报名中')}</option><option value="未开始">{localValue(language, '未开始')}</option><option value="已截止">{localValue(language, '已截止')}</option><option value="日期待公布">{localValue(language, '日期待公布')}</option></select><select value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">{tx(language, 'allCategory')}</option>{[...new Set(items.map((i) => i.category))].map((c) => <option key={c} value={c}>{localValue(language, c)}</option>)}</select></div><section className="panel results-panel"><div className="results-header"><span>{shown.length} {tx(language, 'found')}</span><div><button className={sort === 'deadline' ? 'sort-active' : ''} onClick={() => setSort('deadline')}>{tx(language, 'byDeadline')}</button><button className={sort === 'updated' ? 'sort-active' : ''} onClick={() => setSort('updated')}>{tx(language, 'byUpdated')}</button><button className={sort === 'difficulty' ? 'sort-active' : ''} onClick={() => setSort('difficulty')}>{tx(language, 'byDifficulty')}</button></div></div><div className="result-list">{shown.length === 0 ? <EmptyState text={tx(language, 'noResults')} /> : shown.map((item) => <div className="result-item" role="button" tabIndex={0} key={item.id} onClick={() => onOpen(item)} onKeyDown={(e) => e.key === 'Enter' && onOpen(item)}><div className="result-icon"><CompetitionIcon item={item} /></div><div className="result-main"><div className="result-title"><strong>{item.name}</strong><span className="status-pill">{localValue(language, item.status)}</span></div><div className="result-meta"><span>{localValue(language, item.category)}</span><span>{item.organizer}</span><span>{localValue(language, item.level)}</span></div></div><div className="result-date-range"><div><small>{tx(language, 'start')}</small><b>{displayDate(language, item, 'start')}</b></div><div className="date-deadline"><small>{tx(language, 'deadline')}</small><b>{displayDate(language, item, 'deadline')}</b></div></div><div className="result-difficulty"><span className="stars">{'★'.repeat(item.difficulty)}<i>{'★'.repeat(5 - item.difficulty)}</i></span><small>{tx(language, 'difficulty')}</small></div><div className="result-actions"><button onClick={(e) => { e.stopPropagation(); onFavorite(item.id) }} aria-label={tx(language, favorites.has(item.id) ? 'unsave' : 'save')}><Heart size={18} fill={favorites.has(item.id) ? 'currentColor' : 'none'} /></button><ChevronRight size={18} /></div></div>)}</div></section></div>
}

function DetailView({ language, item, favorite, plan, onBack, onFavorite, onSavePlan, onOfficial, onHide, notify }: { language: Language; item: Competition; favorite: boolean; plan?: CompetitionPlan; onBack: () => void; onFavorite: () => void; onSavePlan: (plan: CompetitionPlan) => void; onOfficial: () => void; onHide: () => void; notify: (message: string) => void }) {
  const [note, setNote] = useState(plan?.note ?? '')
  const [taskText, setTaskText] = useState('')
  const [tasks, setTasks] = useState(plan?.tasks ?? [])
  const [rating, setRating] = useState<number | ''>(plan?.personalRating ?? '')
  const materials = useMemo(() => officialMaterialsFor(item), [item])
  const downloadableFiles = materials.filter((material) => material.kind === 'file')
  const officialNotices = materials.filter((material) => material.kind === 'download-page')
  useEffect(() => { setNote(plan?.note ?? ''); setTasks(plan?.tasks ?? []); setRating(plan?.personalRating ?? '') }, [item.id, plan])
  const persistPlan = () => {
    onSavePlan({ competitionId: item.id, note: note.trim(), personalRating: rating === '' ? undefined : rating as 1 | 2 | 3 | 4 | 5, tasks, updatedAt: new Date().toISOString() })
    notify(language === 'zh' ? '参赛计划已保存到本机' : 'Plan saved on this device')
  }
  const addTask = () => { const title = taskText.trim(); if (!title) return; setTasks((current) => [...current, { id: crypto.randomUUID(), title, completed: false }]); setTaskText('') }
  return <div className="page detail-page">
    <button className="back-link" onClick={onBack}>← {tx(language, 'back')}</button>
    <div className="detail-hero"><div className="detail-logo"><CompetitionIcon item={item} /></div><div><div className="tag-line"><span>{localValue(language, item.category)}</span><span>{localValue(language, item.level)}</span></div><h1>{item.name}</h1><p>{item.organizer} · {item.updatedAt}</p><p className="evaluation-note"><ShieldCheck size={15} /> {language === 'zh' ? '客观评价仅供参考，不是绝对结论；请结合学校认定政策与官网规则判断。' : 'Objective evaluation for reference only, not an absolute conclusion. Check your institution policy and official rules.'}</p></div><div className="detail-actions"><button className={favorite ? 'primary-button' : 'secondary-button'} onClick={onFavorite}><Heart size={18} fill={favorite ? 'currentColor' : 'none'} /> {tx(language, favorite ? 'unsave' : 'save')}</button><button className="secondary-button" onClick={onOfficial}><Eye size={18} /> {tx(language, 'openOfficial')}</button><button className="text-button" onClick={onHide}>{tx(language, 'hide')}</button></div></div>
    <section className="panel detail-info detail-basic"><PanelHeading title={tx(language, 'basic')} meta={tx(language, 'traceable')} action={() => notify(item.source)} /><div className="info-grid"><Info label={tx(language, 'category')} value={localValue(language, item.category)} /><Info label={tx(language, 'organizer')} value={item.organizer} /><Info label={tx(language, 'level')} value={localValue(language, item.level)} /><Info label={tx(language, 'audience')} value={localValue(language, item.audience)} /><Info label={tx(language, 'start')} value={displayDate(language, item, 'start')} /><Info label={tx(language, 'deadline')} value={displayDate(language, item, 'deadline')} accent /><Info label={language === 'zh' ? '日期核验说明' : 'Date verification'} value={item.dateNote ?? ''} /><Info label={tx(language, 'format')} value={localValue(language, item.format)} /><Info label={tx(language, 'fee')} value={localValue(language, item.fee)} /><Info label={tx(language, 'difficulty')} value={`${item.difficulty}/5`} /><Info label={tx(language, 'value')} value={localValue(language, item.value)} /><Info label={tx(language, 'official')} value={item.source} onLink={onOfficial} /><label className="rating-inline"><small>{language === 'zh' ? '我的星级' : 'My rating'}</small><select value={rating} onChange={(event) => setRating(event.target.value ? Number(event.target.value) : '')}><option value="">{language === 'zh' ? '未评分' : 'Not rated'}</option>{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value}/5</option>)}</select></label></div></section>
    <div className="detail-content-grid"><section className="panel narrative-panel"><PanelHeading title={tx(language, 'background')} meta={language === 'zh' ? '历史、核心与目标' : 'History, core, and objective'} /><div className="narrative-body"><h3>{language === 'zh' ? '历史沿革' : 'History'}</h3><p>{item.history}</p><h3>{language === 'zh' ? '赛事核心' : 'Core focus'}</h3><p>{item.core}</p><h3>{language === 'zh' ? '赛事目标' : 'Objective'}</h3><p>{item.objective}</p><div className="requirements-block"><h3>{tx(language, 'requirements')}</h3><ul><li>{tx(language, 'audience')}：{localValue(language, item.audience)}</li><li>{tx(language, 'format')}：{localValue(language, item.format)}</li><li>{tx(language, 'fee')}：{localValue(language, item.fee)}</li><li>{tx(language, 'deadline')}：{displayDate(language, item, 'deadline')}</li></ul></div></div></section><section className="panel materials-panel"><PanelHeading title={tx(language, 'materials')} meta={`${downloadableFiles.length} ${language === 'zh' ? '个直链文件' : 'direct files'}`} /><div className="material-group"><h3>{language === 'zh' ? '可直接下载文件' : 'Direct downloads'}</h3>{downloadableFiles.length ? <div className="material-list">{downloadableFiles.map((material) => <button key={material.url} className="material-row" onClick={() => void openOfficialUrl(material.url, language, notify)}><span className="material-icon"><Download size={19} /></span><span><b>{language === 'zh' ? material.nameZh : material.nameEn}</b><small>{language === 'zh' ? material.noteZh : material.noteEn}</small><em>{language === 'zh' ? '官网文件直链' : 'Direct official file'}</em></span><ChevronRight size={18} /></button>)}</div> : <p className="material-empty">{language === 'zh' ? '暂未发现可验证的官方附件直链，不以官网首页冒充下载文件。' : 'No verified direct official attachment yet. A homepage is never presented as a file download.'}</p>}</div><div className="material-group notice-group"><h3>{language === 'zh' ? '官方通知' : 'Official notices'}</h3><div className="material-list">{officialNotices.map((material) => <button key={material.url} className="material-row" onClick={() => void openOfficialUrl(material.url, language, notify)}><span className="material-icon"><FileText size={19} /></span><span><b>{language === 'zh' ? material.nameZh : material.nameEn}</b><small>{language === 'zh' ? material.noteZh : material.noteEn}</small><em>{language === 'zh' ? '通知页面，不是文件' : 'Notice page, not a file'}</em></span><ChevronRight size={18} /></button>)}</div></div></section></div>
    <section className="panel plan-panel"><h2>{language === 'zh' ? '参赛计划' : 'Competition plan'}</h2><label className="field-label">{language === 'zh' ? '个人备注' : 'Private note'}<textarea maxLength={4000} value={note} onChange={(event) => setNote(event.target.value)} placeholder={language === 'zh' ? '记录报名材料、队友或准备思路' : 'Record materials, teammates, or preparation notes'} /></label><div className="task-editor"><input maxLength={200} value={taskText} onChange={(event) => setTaskText(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addTask()} placeholder={language === 'zh' ? '添加任务，例如：联系队友' : 'Add a task, e.g. contact teammates'} /><button className="secondary-button" onClick={addTask}>{language === 'zh' ? '添加任务' : 'Add task'}</button></div><div className="task-list">{tasks.map((task) => <div className="task-row" key={task.id}><label><input type="checkbox" checked={task.completed} onChange={() => setTasks((current) => current.map((entry) => entry.id === task.id ? { ...entry, completed: !entry.completed } : entry))} /><span>{task.title}</span></label><button aria-label={language === 'zh' ? '删除任务' : 'Delete task'} onClick={() => setTasks((current) => current.filter((entry) => entry.id !== task.id))}><X size={16} /></button></div>)}</div><button className="primary-button" onClick={persistPlan}>{language === 'zh' ? '保存参赛计划' : 'Save plan'}</button></section>
  </div>
}

function FavoritesView({ language, favorites, plans, hidden, onOpen, onRestore, onRemovePlan }: { language: Language; favorites: Competition[]; plans: Competition[]; hidden: Competition[]; onOpen: (item: Competition) => void; onRestore: (id: string) => void; onRemovePlan: (id: string) => void }) {
  const [tab, setTab] = useState<FavoriteTab>('saved'); const activeItems = tab === 'saved' ? favorites : tab === 'plans' ? plans : hidden
  const emptyText = tab === 'saved' ? tx(language, 'emptySaved') : tab === 'plans' ? tx(language, 'emptyPlans') : tx(language, 'emptyHidden')
  return <div className="page"><div className="page-heading compact"><div><h1>{tx(language, 'favorites')}</h1><p className="lede">{tx(language, 'localLedger')}</p></div></div><div className="local-summary"><div><Heart size={19} /><b>{favorites.length}</b><span>{tx(language, 'saved')}</span></div><div><FileText size={19} /><b>{plans.length}</b><span>{tx(language, 'plans')}</span></div><div><Eye size={19} /><b>{hidden.length}</b><span>{tx(language, 'hidden')}</span></div></div><section className="panel favorites-panel"><div className="tabs" role="tablist"><button role="tab" aria-selected={tab === 'saved'} className={tab === 'saved' ? 'active' : ''} onClick={() => setTab('saved')}>{tx(language, 'savedList')}</button><button role="tab" aria-selected={tab === 'plans'} className={tab === 'plans' ? 'active' : ''} onClick={() => setTab('plans')}>{tx(language, 'plans')}</button><button role="tab" aria-selected={tab === 'hidden'} className={tab === 'hidden' ? 'active' : ''} onClick={() => setTab('hidden')}>{tx(language, 'hiddenList')}</button></div>{activeItems.length === 0 ? <EmptyState text={emptyText} /> : activeItems.map((item) => <div className="favorite-row" key={item.id}>{tab === 'hidden' ? <div className="favorite-main"><div className="result-icon"><BookOpen size={21} /></div><div><strong>{item.name}</strong><small>{localValue(language, item.category)} · {item.deadline}</small></div><span className="deadline-text">{item.deadline}</span></div> : <button className="favorite-main" onClick={() => onOpen(item)}><div className="result-icon"><BookOpen size={21} /></div><div><strong>{item.name}</strong><small>{localValue(language, item.category)} · {item.deadline}</small></div><span className="deadline-text">{item.deadline}</span><ChevronRight size={17} /></button>}{tab === 'plans' && <button className="row-action" onClick={() => onRemovePlan(item.id)}>{language === 'zh' ? '删除计划' : 'Delete plan'}</button>}{tab === 'hidden' && <button className="row-action" onClick={() => onRestore(item.id)}>{tx(language, 'restore')}</button>}</div>)}</section></div>
}

function CalendarView({ language, items, onOpen }: { language: Language; items: Competition[]; onOpen: (item: Competition) => void }) {
  const [month, setMonth] = useState(new Date()); const [nodeType, setNodeType] = useState<'all' | 'start' | 'deadline'>('all'); const year = month.getFullYear(); const monthIndex = month.getMonth(); const days = new Date(year, monthIndex + 1, 0).getDate(); const offset = (new Date(year, monthIndex, 1).getDay() + 6) % 7
  const move = (delta: number) => setMonth(new Date(year, monthIndex + delta, 1))
  const yearOptions = [2024, 2025, 2026]
  const monthEvents = items.filter((item) => item.datePrecision === 'exact').flatMap((item) => [{ item, type: 'start' as const, date: item.start }, { item, type: 'deadline' as const, date: item.deadline }]).filter((event) => (nodeType === 'all' || event.type === nodeType) && event.date.startsWith(`${year}-${String(monthIndex + 1).padStart(2, '0')}`))
  return <div className="page"><div className="page-heading compact"><div><h1>{tx(language, 'calendar')}</h1><p className="lede">{language === 'zh' ? '日历同时展示报名开始与报名截止日期，点击赛事名称可查看详情。' : 'The calendar shows registration opening and closing dates. Select a competition name to view details.'}</p></div><button className="secondary-button" onClick={() => window.print()}><Download size={17} /> {tx(language, 'print')}</button></div><div className="calendar-filters"><select aria-label={language === 'zh' ? '选择年份' : 'Select year'} value={year} onChange={(event) => setMonth(new Date(Number(event.target.value), monthIndex, 1))}>{yearOptions.map((value) => <option key={value}>{value}</option>)}</select><select aria-label={language === 'zh' ? '节点类型' : 'Milestone type'} value={nodeType} onChange={(event) => setNodeType(event.target.value as 'all' | 'start' | 'deadline')}><option value="all">{language === 'zh' ? '报名开始与截止' : 'Registration opens and closes'}</option><option value="start">{tx(language, 'start')}</option><option value="deadline">{tx(language, 'deadline')}</option></select><button className="secondary-button" onClick={() => setMonth(new Date())}>{language === 'zh' ? '回到今天' : 'Today'}</button></div><section className="calendar-board"><div className="calendar-header"><button onClick={() => move(-1)} aria-label={language === 'zh' ? '上个月' : 'Previous month'}>‹</button><strong>{new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long' }).format(month)}</strong><button onClick={() => move(1)} aria-label={language === 'zh' ? '下个月' : 'Next month'}>›</button></div><div className="calendar-key" aria-label={language === 'zh' ? '日历图例' : 'Calendar legend'}><span className="start-key">{language === 'zh' ? '报名开始' : 'Registration opens'}</span><span className="deadline-key">{language === 'zh' ? '报名截止' : 'Registration closes'}</span></div><div className="week-row">{(language === 'zh' ? ['周一','周二','周三','周四','周五','周六','周日'] : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']).map((day) => <span key={day}>{day}</span>)}</div><div className="month-grid">{Array.from({ length: 42 }, (_, index) => { const day = index - offset + 1; const date = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; const events = day > 0 && day <= days ? monthEvents.filter((event) => event.date === date) : []; return <div key={index} className={`day-cell ${day < 1 || day > days ? 'muted-day' : ''}`}><b>{day > 0 && day <= days ? day : ''}</b>{events.map((event) => <button className={`calendar-event ${event.type}`} key={`${event.item.id}-${event.type}`} onClick={() => onOpen(event.item)} title={`${event.type === 'start' ? tx(language, 'start') : tx(language, 'deadline')}: ${event.item.name}`}><span>{event.type === 'start' ? (language === 'zh' ? '报名开始' : 'Opens') : (language === 'zh' ? '报名截止' : 'Closes')}</span><strong>{event.item.name}</strong></button>)}</div> })}</div></section></div>
}

function ProfileView({ language, theme, dataQuality, onLanguage, onTheme, notify }: { language: Language; theme: 'light' | 'dark'; dataQuality: DataQualityReport; onLanguage: (value: Language) => void; onTheme: (value: 'light' | 'dark') => void; notify: (message: string) => void }) {
  const auditMessage = language === 'zh' ? `当前 ${dataQuality.total} 条、${dataQuality.uniqueBrands} 个品牌，发现 ${dataQuality.issues.length} 项发布阻断问题。` : `${dataQuality.total} records, ${dataQuality.uniqueBrands} brands, ${dataQuality.issues.length} release-blocking issues.`
  return <div className="page">
    <div className="page-heading compact"><div><h1>{tx(language, 'settings')}</h1><p className="lede">{tx(language, 'settingsSub')}</p></div></div>
    <div className="settings-grid">
      <section className="panel setting-panel"><h2>{tx(language, 'appearance')}</h2><SettingRow label={tx(language, 'theme')}><div className="segmented"><button className={theme === 'light' ? 'active' : ''} onClick={() => onTheme('light')}><Sun size={16} /> {tx(language, 'light')}</button><button className={theme === 'dark' ? 'active' : ''} onClick={() => onTheme('dark')}><Moon size={16} /> {tx(language, 'dark')}</button></div></SettingRow><SettingRow label={tx(language, 'language')}><select value={language} onChange={(e) => onLanguage(e.target.value as Language)}><option value="zh">{language === 'zh' ? '简体中文' : 'Simplified Chinese'}</option><option value="en">English</option></select></SettingRow></section>
      <section className="panel setting-panel"><h2>{tx(language, 'dataAccess')}</h2><SettingRow label={tx(language, 'publicOnly')}><span className="setting-value"><FileText size={16} /> {tx(language, 'permissions')}</span></SettingRow><SettingRow label={tx(language, 'sourceOnly')}><span className="setting-value"><ShieldCheck size={16} /> HTTPS</span></SettingRow></section>
      <section className="panel setting-panel wide"><h2>{tx(language, 'appInfo')}</h2><SettingRow label={tx(language, 'localData')}><span>{tx(language, 'localMode')}</span></SettingRow><SettingRow label={tx(language, 'sources')}><span>{sourceRegistry.length}</span></SettingRow><SettingRow label={language === 'zh' ? '数据发布状态' : 'Data release status'}><span className={dataQuality.publishable ? 'quality-pass' : 'quality-blocked'}>{dataQuality.publishable ? (language === 'zh' ? '审核完成，可发布' : 'Audited and ready') : (language === 'zh' ? '数据审计未通过' : 'Data audit failed')}</span></SettingRow><SettingRow label={tx(language, 'version')}><span>v{APP_VERSION}</span></SettingRow><button className="secondary-button" onClick={() => notify(auditMessage)}><ShieldCheck size={16} /> {tx(language, 'update')}</button></section>
    </div>
  </div>
}

function PanelHeading({ title, meta, action }: { title: string; meta: string; action?: () => void }) { return <div className="panel-heading"><h2>{title}</h2>{action ? <button onClick={action}>{meta} <ChevronRight size={16} /></button> : <span>{meta}</span>}</div> }
function CompetitionCard({ language, item, favorite, onOpen, onFavorite, onHide }: { language: Language; item: Competition; favorite: boolean; onOpen: (item: Competition) => void; onFavorite: (id: string) => void; onHide: (id: string) => void }) { return <article className="competition-card"><div className="competition-logo"><CompetitionIcon item={item} /></div><h3>{item.name}</h3><div className="tag-line"><span>{localValue(language, item.category)}</span><span>{localValue(language, item.level)}</span></div><div className="card-date-range"><div><span>{tx(language, 'start')}</span><b>{displayDate(language, item, 'start')}</b></div><div className="date-deadline"><span>{tx(language, 'deadline')}</span><b>{displayDate(language, item, 'deadline')}</b></div></div><p className="audience">{localValue(language, item.audience)}</p><div className="card-actions"><button onClick={() => onOpen(item)}>{tx(language, 'viewDetails')}</button><button className={favorite ? 'favorite active' : 'favorite'} onClick={() => onFavorite(item.id)}><Heart size={16} fill={favorite ? 'currentColor' : 'none'} /> {tx(language, favorite ? 'unsave' : 'save')}</button></div><button className="hide-link" onClick={() => onHide(item.id)}>{tx(language, 'hide')}</button></article> }
function CompetitionIcon({ item }: { item: Competition }) {
  const [failed, setFailed] = useState(false)
  const logo = officialLogoFor(item.source) ?? item.logoUrl
  return failed || !logo
    ? <span className="icon-fallback" role="img" aria-label={`${item.name} ${item.logoUrl ? 'logo' : 'text mark'}`}>{iconCode(item)}</span>
    : <img src={logo} alt={`${item.name} official site mark`} loading="lazy" onError={() => setFailed(true)} />
}
function Info({ label, value, accent, onLink }: { label: string; value: string; accent?: boolean; onLink?: () => void }) { return <div className="info-item"><small>{label}</small>{onLink ? <button className="inline-link" onClick={onLink}>{value}</button> : <b className={accent ? 'accent' : ''}>{value}</b>}</div> }
function SettingRow({ label, children }: { label: string; children: React.ReactNode }) { return <div className="setting-row"><span>{label}</span><div>{children}</div></div> }
function EmptyState({ text }: { text: string }) { return <div className="empty-state"><BookOpen size={28} /><p>{text}</p></div> }
