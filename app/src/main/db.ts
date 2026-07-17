import { app } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import initSqlJs, { type Database } from 'sql.js'
import type { AugType, AugRead, Game, GameDraft, PosIssue, Streak, TimelinePoint } from '../shared/types'

let db: Database

function dbPath(): string {
  return join(app.getPath('userData'), 'reroll-review.db')
}

function persist(): void {
  const dir = dirname(dbPath())
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(dbPath(), Buffer.from(db.export()))
}

export async function initDb(): Promise<void> {
  const SQL = await initSqlJs({
    locateFile: (file) => require.resolve(`sql.js/dist/${file}`)
  })
  const path = dbPath()
  db = existsSync(path) ? new SQL.Database(readFileSync(path)) : new SQL.Database()

  db.run(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      riot_match_id TEXT UNIQUE,
      date TEXT NOT NULL,
      placement INTEGER NOT NULL CHECK (placement BETWEEN 1 AND 8),
      comp TEXT NOT NULL,
      stage TEXT,
      final_hp TEXT,
      aug_name TEXT,
      aug_type TEXT CHECK (aug_type IN ('Econ','Item','Combat','Trait','Hero')),
      aug_read TEXT CHECK (aug_read IN ('matched','blind')),
      slam TEXT,
      slam_matched INTEGER,
      streak TEXT CHECK (streak IN ('win','loss','mixed')),
      level_matched INTEGER,
      scouted INTEGER,
      s4_loss INTEGER DEFAULT 0,
      s4_hp TEXT,
      s4_avoid INTEGER,
      pos_issue TEXT CHECK (pos_issue IN ('focus','aggro','stats','none')),
      pos_note TEXT,
      mistake TEXT CHECK (mistake IN ('Positioning','Itemization','Line/Augment','Econ','Scouting','Leveling','Tilt')),
      key_decision TEXT,
      differently TEXT,
      tilted INTEGER DEFAULT 0,
      sample INTEGER DEFAULT 0
    );
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS timeline_points (
      game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
      ord INTEGER,
      stage TEXT,
      note TEXT
    );
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `)
  persist()
}

function bool(v: unknown): boolean | null {
  if (v === null || v === undefined) return null
  return Number(v) === 1
}

function rowToGame(row: Record<string, unknown>, timeline: TimelinePoint[]): Game {
  return {
    id: row.id as number,
    sample: Number(row.sample) === 1,
    riotMatchId: (row.riot_match_id as string) || null,
    date: row.date as string,
    placement: row.placement as number,
    comp: row.comp as string,
    stage: (row.stage as string) || '',
    hp: (row.final_hp as string) || '',
    augName: (row.aug_name as string) || '',
    augType: (row.aug_type as AugType) || null,
    augRead: (row.aug_read as AugRead) || null,
    slam: (row.slam as string) || '',
    slamMatched: bool(row.slam_matched),
    streak: (row.streak as Streak) || null,
    levelMatched: bool(row.level_matched),
    scouted: bool(row.scouted),
    s4loss: Number(row.s4_loss) === 1,
    s4hp: (row.s4_hp as string) || '',
    s4avoid: bool(row.s4_avoid),
    posIssue: (row.pos_issue as PosIssue) || null,
    posNote: (row.pos_note as string) || '',
    mistake: (row.mistake as Game['mistake']) || null,
    keyDecision: (row.key_decision as string) || '',
    differently: (row.differently as string) || '',
    tilted: Number(row.tilted) === 1,
    timeline
  }
}

function timelineForGame(gameId: number): TimelinePoint[] {
  const rows = db.exec('SELECT stage, note FROM timeline_points WHERE game_id = ? ORDER BY ord', [gameId])
  if (!rows.length) return []
  return rows[0].values.map((v) => ({ stage: (v[0] as string) || '', note: (v[1] as string) || '' }))
}

export function listGames(): Game[] {
  const res = db.exec('SELECT * FROM games ORDER BY id')
  if (!res.length) return []
  const cols = res[0].columns
  return res[0].values.map((row) => {
    const obj: Record<string, unknown> = {}
    cols.forEach((c, i) => (obj[c] = row[i]))
    return rowToGame(obj, timelineForGame(obj.id as number))
  })
}

function b(v: boolean | null | undefined): number | null {
  if (v === null || v === undefined) return null
  return v ? 1 : 0
}

function replaceTimeline(gameId: number, timeline: TimelinePoint[]): void {
  db.run('DELETE FROM timeline_points WHERE game_id = ?', [gameId])
  timeline.forEach((t, i) => {
    db.run('INSERT INTO timeline_points (game_id, ord, stage, note) VALUES (?, ?, ?, ?)', [
      gameId,
      i,
      t.stage,
      t.note
    ])
  })
}

export function saveGame(draft: GameDraft, id: number | null): Game {
  if (id != null) {
    db.run(
      `UPDATE games SET riot_match_id=?, date=?, placement=?, comp=?, stage=?, final_hp=?, aug_name=?, aug_type=?, aug_read=?, slam=?, slam_matched=?, streak=?, level_matched=?, scouted=?, s4_loss=?, s4_hp=?, s4_avoid=?, pos_issue=?, pos_note=?, mistake=?, key_decision=?, differently=?, tilted=? WHERE id=?`,
      [
        draft.riotMatchId ?? null,
        draft.date,
        draft.placement,
        draft.comp,
        draft.stage,
        draft.hp,
        draft.augName,
        draft.augType,
        draft.augRead,
        draft.slam,
        b(draft.slamMatched),
        draft.streak,
        b(draft.levelMatched),
        b(draft.scouted),
        b(draft.s4loss),
        draft.s4hp,
        b(draft.s4avoid),
        draft.posIssue,
        draft.posNote,
        draft.mistake,
        draft.keyDecision,
        draft.differently,
        b(draft.tilted),
        id
      ]
    )
    replaceTimeline(id, draft.timeline)
    persist()
    return { ...draft, id }
  }

  db.run(
    `INSERT INTO games (riot_match_id, date, placement, comp, stage, final_hp, aug_name, aug_type, aug_read, slam, slam_matched, streak, level_matched, scouted, s4_loss, s4_hp, s4_avoid, pos_issue, pos_note, mistake, key_decision, differently, tilted, sample)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      draft.riotMatchId ?? null,
      draft.date,
      draft.placement,
      draft.comp,
      draft.stage,
      draft.hp,
      draft.augName,
      draft.augType,
      draft.augRead,
      draft.slam,
      b(draft.slamMatched),
      draft.streak,
      b(draft.levelMatched),
      b(draft.scouted),
      b(draft.s4loss),
      draft.s4hp,
      b(draft.s4avoid),
      draft.posIssue,
      draft.posNote,
      draft.mistake,
      draft.keyDecision,
      draft.differently,
      b(draft.tilted),
      draft.sample ? 1 : 0
    ]
  )
  const newId = (db.exec('SELECT last_insert_rowid()')[0].values[0][0] as number)
  replaceTimeline(newId, draft.timeline)
  persist()
  return { ...draft, id: newId }
}

export function deleteGame(id: number): void {
  db.run('DELETE FROM games WHERE id = ?', [id])
  db.run('DELETE FROM timeline_points WHERE game_id = ?', [id])
  persist()
}

export function insertSampleGames(drafts: GameDraft[]): void {
  drafts.forEach((d) => saveGame(d, null))
}

export function clearSampleGames(): void {
  db.run('DELETE FROM timeline_points WHERE game_id IN (SELECT id FROM games WHERE sample = 1)')
  db.run('DELETE FROM games WHERE sample = 1')
  persist()
}

export function getSetting(key: string): string | null {
  const res = db.exec('SELECT value FROM settings WHERE key = ?', [key])
  if (!res.length || !res[0].values.length) return null
  return res[0].values[0][0] as string
}

export function setSetting(key: string, value: string): void {
  db.run('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [
    key,
    value
  ])
  persist()
}
