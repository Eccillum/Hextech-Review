import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'node:path'
import { is } from '@electron-toolkit/utils'
import * as db from './db'
import { fetchRiotMatches } from './riot'
import { generateSampleGames } from '../shared/sampleData'
import type { GameDraft, RiotSettings } from '../shared/types'

const DEFAULT_RIOT: RiotSettings = { riotId: '', region: 'americas', apiKey: '' }

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  win.on('ready-to-show', () => win.show())
  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function registerIpc(): void {
  ipcMain.handle('games:list', () => db.listGames())

  ipcMain.handle('games:save', (_e, draft: GameDraft, id: number | null) => db.saveGame(draft, id))

  ipcMain.handle('games:delete', (_e, id: number) => db.deleteGame(id))

  ipcMain.handle('games:loadSamples', () => {
    db.insertSampleGames(generateSampleGames())
    return db.listGames()
  })

  ipcMain.handle('games:clearSamples', () => {
    db.clearSampleGames()
    return db.listGames()
  })

  ipcMain.handle('settings:getRiot', () => {
    const raw = db.getSetting('riot')
    return raw ? { ...DEFAULT_RIOT, ...JSON.parse(raw) } : DEFAULT_RIOT
  })

  ipcMain.handle('settings:setRiot', (_e, riot: RiotSettings) => {
    db.setSetting('riot', JSON.stringify(riot))
  })

  ipcMain.handle('riot:fetchMatches', async (_e, riot: RiotSettings) => fetchRiotMatches(riot))
}

app.whenReady().then(async () => {
  await db.initDb()
  registerIpc()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
