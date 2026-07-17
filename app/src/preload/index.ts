import { contextBridge, ipcRenderer } from 'electron'
import type { Game, GameDraft, RiotFetchResult, RiotSettings } from '../shared/types'

const api = {
  listGames: (): Promise<Game[]> => ipcRenderer.invoke('games:list'),
  saveGame: (draft: GameDraft, id: number | null): Promise<Game> => ipcRenderer.invoke('games:save', draft, id),
  deleteGame: (id: number): Promise<void> => ipcRenderer.invoke('games:delete', id),
  loadSamples: (): Promise<Game[]> => ipcRenderer.invoke('games:loadSamples'),
  clearSamples: (): Promise<Game[]> => ipcRenderer.invoke('games:clearSamples'),
  getRiotSettings: (): Promise<RiotSettings> => ipcRenderer.invoke('settings:getRiot'),
  setRiotSettings: (riot: RiotSettings): Promise<void> => ipcRenderer.invoke('settings:setRiot', riot),
  fetchRiotMatches: (riot: RiotSettings): Promise<RiotFetchResult> => ipcRenderer.invoke('riot:fetchMatches', riot)
}

contextBridge.exposeInMainWorld('api', api)

export type Api = typeof api
