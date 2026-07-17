// Riot TFT match import, ported from Component.fetchMatches() in the design prototype.
// Runs in the main process only — never expose the API key to the renderer/webview.
import { guessComp, stageFromRound, type RiotTrait } from '../shared/riotMapping'
import type { RiotFetchResult, RiotSettings } from '../shared/types'

interface RiotParticipant {
  puuid: string
  placement: number
  level: number
  last_round: number
  traits?: RiotTrait[]
}

interface RiotMatch {
  metadata: { match_id: string }
  info: { game_datetime: number; participants: RiotParticipant[] }
}

async function call(url: string, apiKey: string): Promise<any> {
  const u = url + (url.includes('?') ? '&' : '?') + 'api_key=' + encodeURIComponent(apiKey.trim())
  const r = await fetch(u)
  if (r.status === 401 || r.status === 403) {
    throw new Error(`Key rejected (${r.status}) — dev keys expire after 24h, regenerate it.`)
  }
  if (r.status === 404) throw new Error('Riot ID not found in that region.')
  if (!r.ok) throw new Error('Riot API error ' + r.status)
  return r.json()
}

export async function fetchRiotMatches(riot: RiotSettings): Promise<RiotFetchResult> {
  const { riotId, region, apiKey } = riot
  if (!riotId.includes('#')) return { ok: false, error: 'Riot ID must be GameName#TAG.' }
  if (!apiKey.trim()) return { ok: false, error: 'Enter your API key.' }

  try {
    const [name, tag] = riotId.split('#')
    const base = 'https://' + region + '.api.riotgames.com'
    const acct = await call(
      base + '/riot/account/v1/accounts/by-riot-id/' + encodeURIComponent(name.trim()) + '/' + encodeURIComponent(tag.trim()),
      apiKey
    )
    const ids: string[] = await call(base + '/tft/match/v1/matches/by-puuid/' + acct.puuid + '/ids?count=10', apiKey)
    const raw: RiotMatch[] = []
    for (const id of ids) {
      raw.push(await call(base + '/tft/match/v1/matches/' + id, apiKey))
    }
    const matches = raw
      .map((m) => {
        const p = m.info.participants.find((x) => x.puuid === acct.puuid)
        if (!p) return null
        return {
          matchId: m.metadata.match_id,
          date: new Date(m.info.game_datetime).toISOString().slice(0, 10),
          placement: p.placement,
          level: p.level,
          comp: guessComp(p.traits) || 'Unknown',
          stage: p.placement === 1 ? 'Won' : stageFromRound(p.last_round)
        }
      })
      .filter((m): m is NonNullable<typeof m> => m !== null)
    return { ok: true, matches }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}
