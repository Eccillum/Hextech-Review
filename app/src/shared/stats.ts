// Stat computations ported verbatim (formulas) from the design prototype's
// Component.renderVals() in design_handoff_tft_review_app/TFT Review.dc.html.
import { MISTAKES, MISTAKE_COLORS, TOKENS } from './constants'
import type { Game, Mistake } from './types'

export function placementColors(p: number): { bg: string; fg: string } {
  if (p === 1) return { bg: TOKENS.gold, fg: TOKENS.onGold }
  if (p <= 4) return { bg: '#0F211D', fg: TOKENS.green }
  return { bg: '#271014', fg: TOKENS.red }
}

export function fmtAvg(games: Game[]): string {
  return games.length
    ? (games.reduce((a, g) => a + g.placement, 0) / games.length).toFixed(2)
    : '—'
}

function sortedGames(games: Game[]): Game[] {
  return [...games].sort((a, b) => (a.date === b.date ? a.id - b.id : a.date < b.date ? -1 : 1))
}

export interface Kpi {
  label: string
  value: string
  sub: string
  color: string
}

export interface TrendPoint {
  x: number
  y: number
  color: string
}

export interface GridLine {
  y: number
  ty: number
  label: string
}

export interface MistakeMonth {
  label: string
  total: number
  segments: { name: string; count: number; color: string; width: string }[]
}

export interface StatRow {
  label: string
  count: number
  avg: string
  width: number
  color: string
}

export interface CompStat {
  comp: string
  games: number
  avg: string
  avgColor: string
  top4: string
  wins: string
}

export interface LogFact {
  label: string
  value: string
  color: string
}

export interface LogRow {
  id: number
  idLabel: string
  date: string
  placement: number
  comp: string
  stage: string
  pBg: string
  pFg: string
  mistake: string
  mBg: string
  mFg: string
  augShort: string
  facts: LogFact[]
  hasTimeline: boolean
  timeline: { stage: string; note: string }[]
  keyDecision: string
  differently: string
}

export interface DashboardData {
  n: number
  kpis: Kpi[]
  gridLines: GridLine[]
  trendDots: TrendPoint[]
  rollingPath: string
  mistakeMonths: MistakeMonth[]
  mistakeLegend: { name: string; color: string }[]
  streakStats: StatRow[]
  augStats: StatRow[]
  tiltAvg: string
  calmAvg: string
  tiltCount: number
  calmCount: number
  tiltDelta: string
  recentChips: { id: number; placement: number; bg: string; fg: string; title: string }[]
  compStats: CompStat[]
}

export function computeDashboard(rawGames: Game[], rollingWindow: number): DashboardData | null {
  const games = sortedGames(rawGames)
  const n = games.length
  if (n === 0) return null

  const avg = games.reduce((a, g) => a + g.placement, 0) / n
  const top4 = games.filter((g) => g.placement <= 4).length
  const wins = games.filter((g) => g.placement === 1).length
  const recent = games.slice(-rollingWindow)
  const recentAvg = recent.reduce((a, g) => a + g.placement, 0) / recent.length
  const trendDir =
    recentAvg < avg - 0.15 ? '↓ improving' : recentAvg > avg + 0.15 ? '↑ worsening' : '→ steady'

  const kpis: Kpi[] = [
    { label: 'Games logged', value: String(n), sub: 'all time', color: TOKENS.text },
    {
      label: 'Avg placement',
      value: avg.toFixed(2),
      sub: `last ${recent.length}: ${recentAvg.toFixed(2)} ${trendDir}`,
      color: TOKENS.gold
    },
    { label: 'Top 4 rate', value: Math.round((top4 / n) * 100) + '%', sub: `${top4} of ${n}`, color: TOKENS.green },
    { label: 'Win rate', value: Math.round((wins / n) * 100) + '%', sub: `${wins} firsts`, color: TOKENS.blue }
  ]

  // trend chart
  const W = 640
  const y = (p: number) => 14 + ((p - 1) / 7) * 186
  const xi = (i: number) => (n === 1 ? W : 32 + (W - 32) * (i / Math.max(1, n - 1)))
  const gridLines: GridLine[] = [1, 3, 5, 8].map((p) => ({ y: y(p), ty: y(p) + 4, label: String(p) }))
  const trendDots: TrendPoint[] = games.map((g, i) => {
    const c = placementColors(g.placement)
    return { x: xi(i), y: y(g.placement), color: c.fg === TOKENS.onGold ? TOKENS.gold : c.fg }
  })
  const roll = games.map((_, i) => {
    const win = games.slice(Math.max(0, i - rollingWindow + 1), i + 1)
    return win.reduce((a, x) => a + x.placement, 0) / win.length
  })
  const rollingPath = roll
    .map((v, i) => (i === 0 ? 'M' : 'L') + xi(i).toFixed(1) + ' ' + y(v).toFixed(1))
    .join(' ')

  // mistakes by month
  const byMonth: Record<string, Partial<Record<Mistake, number>>> = {}
  games.forEach((g) => {
    if (!g.mistake) return
    const m = g.date.slice(0, 7)
    byMonth[m] = byMonth[m] || {}
    byMonth[m][g.mistake] = (byMonth[m][g.mistake] || 0) + 1
  })
  const monthKeys = Object.keys(byMonth).sort().slice(-6)
  const maxTotal = Math.max(1, ...monthKeys.map((k) => Object.values(byMonth[k]).reduce((a, b) => a + (b || 0), 0)))
  const mistakeMonths: MistakeMonth[] = monthKeys.map((k) => {
    const total = Object.values(byMonth[k]).reduce((a, b) => a + (b || 0), 0)
    return {
      label: new Date(k + '-15').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      total,
      segments: MISTAKES.filter((m) => byMonth[k][m]).map((m) => ({
        name: m,
        count: byMonth[k][m] as number,
        color: MISTAKE_COLORS[m],
        width: (((byMonth[k][m] as number) / maxTotal) * 100).toFixed(1)
      }))
    }
  })
  const mistakeLegend = MISTAKES.map((m) => ({ name: m, color: MISTAKE_COLORS[m] }))

  // streak + augment stats
  function statRows<T extends string>(
    defs: { label: string; value: T; color: string }[],
    getKey: (g: Game) => T | null
  ): StatRow[] {
    return defs.map((d) => {
      const sub = games.filter((g) => getKey(g) === d.value)
      const a = sub.length ? sub.reduce((x, g) => x + g.placement, 0) / sub.length : null
      return {
        label: d.label,
        count: sub.length,
        avg: a ? a.toFixed(2) : '—',
        width: a ? Math.round(((9 - a) / 8) * 100) : 0,
        color: d.color
      }
    })
  }
  const streakStats = statRows(
    [
      { label: 'Win streak', value: 'win', color: TOKENS.green },
      { label: 'Loss streak', value: 'loss', color: TOKENS.red },
      { label: 'Mixed', value: 'mixed', color: TOKENS.blue }
    ],
    (g) => g.streak
  )
  const augStats = statRows(
    [
      { label: 'Econ', value: 'Econ', color: TOKENS.gold },
      { label: 'Item', value: 'Item', color: TOKENS.blue },
      { label: 'Combat', value: 'Combat', color: TOKENS.red },
      { label: 'Trait', value: 'Trait', color: TOKENS.purple },
      { label: 'Hero', value: 'Hero', color: TOKENS.green }
    ],
    (g) => g.augType
  )

  // tilt
  const tilted = games.filter((g) => g.tilted)
  const calm = games.filter((g) => !g.tilted)
  const tiltAvg = fmtAvg(tilted)
  const calmAvg = fmtAvg(calm)
  const tiltDelta =
    tilted.length && calm.length
      ? `Tilted games cost you ${(
          tilted.reduce((a, g) => a + g.placement, 0) / tilted.length -
          calm.reduce((a, g) => a + g.placement, 0) / calm.length
        ).toFixed(1)} places on average.`
      : 'Not enough data to compare yet.'

  // recent chips
  const recentChips = games
    .slice(-12)
    .reverse()
    .map((g) => {
      const c = placementColors(g.placement)
      return { id: g.id, placement: g.placement, bg: c.bg, fg: c.fg, title: `#${g.id} · ${g.comp}` }
    })

  // comp table
  const byComp: Record<string, Game[]> = {}
  games.forEach((g) => (byComp[g.comp] = byComp[g.comp] || []).push(g))
  const compStats: CompStat[] = Object.entries(byComp)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 10)
    .map(([comp, arr]) => {
      const a = arr.reduce((x, g) => x + g.placement, 0) / arr.length
      return {
        comp,
        games: arr.length,
        avg: a.toFixed(2),
        avgColor: a <= 4 ? TOKENS.green : TOKENS.red,
        top4: Math.round((arr.filter((g) => g.placement <= 4).length / arr.length) * 100) + '%',
        wins: String(arr.filter((g) => g.placement === 1).length)
      }
    })

  return {
    n,
    kpis,
    gridLines,
    trendDots,
    rollingPath,
    mistakeMonths,
    mistakeLegend,
    streakStats,
    augStats,
    tiltAvg,
    calmAvg,
    tiltCount: tilted.length,
    calmCount: calm.length,
    tiltDelta,
    recentChips,
    compStats
  }
}

const POS_LABEL: Record<string, string> = { focus: 'Focus fire', aggro: 'Aggro pull', stats: 'Stat gap', none: 'None' }
function yesNo(v: boolean | null | undefined): string {
  return v === true ? 'Yes' : v === false ? 'No' : '—'
}

export function buildLogRows(rawGames: Game[]): LogRow[] {
  const games = sortedGames(rawGames)
  return [...games].reverse().map((g) => {
    const c = placementColors(g.placement)
    const mc = (g.mistake && MISTAKE_COLORS[g.mistake]) || TOKENS.textFaint
    return {
      id: g.id,
      idLabel: '#' + g.id,
      date: g.date,
      placement: g.placement,
      comp: g.comp,
      stage: g.stage || '—',
      pBg: c.bg,
      pFg: c.fg,
      mistake: g.mistake || '—',
      mBg: mc + '22',
      mFg: mc,
      augShort: g.augName ? `${g.augName} (${g.augType || '?'})` : '—',
      hasTimeline: (g.timeline || []).length > 0,
      timeline: (g.timeline || []).map((t) => ({ stage: t.stage || '—', note: t.note })),
      keyDecision: g.keyDecision || '—',
      differently: g.differently || '—',
      facts: [
        { label: 'Final HP', value: g.hp || '—', color: TOKENS.textSecondary },
        {
          label: 'Augment read',
          value: g.augRead === 'matched' ? 'Matched opener' : g.augRead === 'blind' ? 'Taken blind' : '—',
          color: g.augRead === 'blind' ? TOKENS.orange : TOKENS.textSecondary
        },
        {
          label: 'First slam',
          value: g.slam
            ? `${g.slam} · ${g.slamMatched === true ? 'on-line' : g.slamMatched === false ? 'off-line' : ''}`
            : '—',
          color: TOKENS.textSecondary
        },
        {
          label: 'Streak / leveling',
          value: `${g.streak ? g.streak + ' streak' : '—'} · curve ${yesNo(g.levelMatched).toLowerCase()}`,
          color: TOKENS.textSecondary
        },
        {
          label: 'Scouted 3-2→3-5',
          value: yesNo(g.scouted),
          color: g.scouted === false ? TOKENS.red : TOKENS.textSecondary
        },
        {
          label: 'Stage 4 loss',
          value: g.s4loss ? `Yes · ${g.s4hp || '?'} HP in · avoidable: ${yesNo(g.s4avoid).toLowerCase()}` : 'No',
          color: g.s4loss ? TOKENS.red : TOKENS.textSecondary
        },
        {
          label: 'Positioning',
          value: (POS_LABEL[g.posIssue || ''] || '—') + (g.posNote ? ' · ' + g.posNote : ''),
          color: TOKENS.textSecondary
        },
        { label: 'Tilted', value: g.tilted ? 'Yes' : 'No', color: g.tilted ? TOKENS.red : TOKENS.textSecondary }
      ]
    }
  })
}

export function compOptions(games: Game[]): string[] {
  return [...new Set(games.map((g) => g.comp).filter(Boolean))].sort()
}
