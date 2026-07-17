// Browser-preview fallback so the UI can be visually checked outside Electron
// (window.api, provided by the preload script, doesn't exist in a plain browser tab).
// Not used when running inside the real Electron shell.
import { generateSampleGames } from '../../../shared/sampleData'
import type { Game, GameDraft, RiotFetchResult, RiotSettings } from '../../../shared/types'
import type { Api } from '../../../preload/index'

let games: Game[] = []
let nextId = 1
let riotSettings: RiotSettings = { riotId: 'Newton#1604', region: 'americas', apiKey: '' }

function withId(draft: GameDraft, id: number): Game {
  return { ...draft, id }
}

export const mockApi: Api = {
  listGames: async () => games,
  saveGame: async (draft, id) => {
    if (id != null) {
      games = games.map((g) => (g.id === id ? withId(draft, id) : g))
      return withId(draft, id)
    }
    const g = withId(draft, nextId++)
    games = [...games, g]
    return g
  },
  deleteGame: async (id) => {
    games = games.filter((g) => g.id !== id)
  },
  loadSamples: async () => {
    const samples = generateSampleGames().map((d) => withId(d, nextId++))
    games = [...games, ...samples]
    return games
  },
  clearSamples: async () => {
    games = games.filter((g) => !g.sample)
    return games
  },
  getRiotSettings: async () => riotSettings,
  setRiotSettings: async (riot) => {
    riotSettings = riot
  },
  fetchRiotMatches: async (): Promise<RiotFetchResult> => ({
    ok: false,
    error: 'Riot import is unavailable in browser preview — run the Electron app.'
  })
}
