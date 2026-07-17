export type AugType = 'Econ' | 'Item' | 'Combat' | 'Trait' | 'Hero'
export type AugRead = 'matched' | 'blind'
export type Streak = 'win' | 'loss' | 'mixed'
export type PosIssue = 'focus' | 'aggro' | 'stats' | 'none'
export type Mistake =
  | 'Positioning'
  | 'Itemization'
  | 'Line/Augment'
  | 'Econ'
  | 'Scouting'
  | 'Leveling'
  | 'Tilt'

export interface TimelinePoint {
  stage: string
  note: string
}

export interface Game {
  id: number
  sample?: boolean
  riotMatchId?: string | null
  date: string // ISO yyyy-mm-dd
  placement: number // 1-8
  comp: string
  stage: string
  hp: string // final HP, only if survived
  augName: string
  augType: AugType | null
  augRead: AugRead | null
  slam: string
  slamMatched: boolean | null
  streak: Streak | null
  levelMatched: boolean | null
  scouted: boolean | null
  s4loss: boolean
  s4hp: string
  s4avoid: boolean | null
  posIssue: PosIssue | null
  posNote: string
  mistake: Mistake | null
  keyDecision: string
  differently: string
  tilted: boolean
  timeline: TimelinePoint[]
}

export type GameDraft = Omit<Game, 'id'>

export interface RiotSettings {
  riotId: string
  region: 'americas' | 'europe' | 'asia' | 'sea'
  apiKey: string
}

export interface RiotImportMatch {
  matchId: string
  date: string
  placement: number
  level: number
  comp: string
  stage: string
}

export type RiotFetchResult =
  | { ok: true; matches: RiotImportMatch[] }
  | { ok: false; error: string }
