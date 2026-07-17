import { useEffect, useMemo, useState } from 'react'
import { Header } from './components/Header'
import { Dashboard } from './components/views/Dashboard'
import { GameLog } from './components/views/GameLog'
import { Entry } from './components/views/Entry'
import { Import } from './components/views/Import'
import { blankForm } from './lib/formModel'
import { TOKENS } from '../../shared/constants'
import type { Game, GameDraft, RiotImportMatch, RiotSettings } from '../../shared/types'

export type View = 'dashboard' | 'log' | 'entry' | 'import'

export function App(): JSX.Element {
  const [view, setView] = useState<View>('dashboard')
  const [games, setGames] = useState<Game[]>([])
  const [loaded, setLoaded] = useState(false)
  const [form, setForm] = useState<GameDraft>(blankForm())
  const [editingId, setEditingId] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [formError, setFormError] = useState('')
  const [rollingWindow, setRollingWindow] = useState(10)

  const [riot, setRiot] = useState<RiotSettings>({ riotId: '', region: 'americas', apiKey: '' })
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [importMatches, setImportMatches] = useState<RiotImportMatch[]>([])

  useEffect(() => {
    Promise.all([window.api.listGames(), window.api.getRiotSettings()]).then(([g, r]) => {
      setGames(g)
      setRiot(r)
      setLoaded(true)
    })
  }, [])

  const hasSamples = useMemo(() => games.some((g) => g.sample), [games])

  function startEntry(): void {
    setForm(blankForm())
    setEditingId(null)
    setFormError('')
    setView('entry')
  }

  function editGame(g: Game): void {
    setForm({ ...blankForm(), ...g })
    setEditingId(g.id)
    setFormError('')
    setView('entry')
  }

  function cancelEntry(): void {
    setView(editingId != null ? 'log' : 'dashboard')
    setEditingId(null)
    setFormError('')
  }

  async function saveGame(): Promise<void> {
    if (!form.placement) {
      setFormError('Pick a placement.')
      return
    }
    if (!form.comp.trim()) {
      setFormError('Enter the comp you played.')
      return
    }
    const saved = await window.api.saveGame(form, editingId)
    const next = await window.api.listGames()
    setGames(next)
    setView('log')
    setForm(blankForm())
    setEditingId(null)
    setExpandedId(saved.id)
  }

  async function deleteGame(id: number): Promise<void> {
    if (!confirm(`Delete game #${id}?`)) return
    await window.api.deleteGame(id)
    setGames(await window.api.listGames())
  }

  async function loadSamples(): Promise<void> {
    setGames(await window.api.loadSamples())
  }

  async function clearSamples(): Promise<void> {
    setGames(await window.api.clearSamples())
  }

  async function saveRiot(next: RiotSettings): Promise<void> {
    setRiot(next)
    await window.api.setRiotSettings(next)
  }

  async function fetchMatches(): Promise<void> {
    setImporting(true)
    setImportError('')
    await window.api.setRiotSettings(riot)
    const res = await window.api.fetchRiotMatches(riot)
    setImporting(false)
    if (res.ok) {
      setImportMatches(res.matches)
    } else {
      setImportError(res.error)
    }
  }

  function reviewMatch(m: RiotImportMatch): void {
    setForm({ ...blankForm(), date: m.date, placement: m.placement, comp: m.comp, stage: m.stage, riotMatchId: m.matchId })
    setEditingId(null)
    setFormError('')
    setView('entry')
  }

  if (!loaded) {
    return <div style={{ minHeight: '100vh', background: TOKENS.bg }} />
  }

  return (
    <div style={{ minHeight: '100vh', background: TOKENS.bg, display: 'flex', flexDirection: 'column' }}>
      <Header view={view} onNav={setView} onLogGame={startEntry} />
      {view === 'dashboard' && (
        <Dashboard
          games={games}
          hasSamples={hasSamples}
          rollingWindow={rollingWindow}
          onRollingWindowChange={setRollingWindow}
          onStartEntry={startEntry}
          onLoadSamples={loadSamples}
          onClearSamples={clearSamples}
          onOpenGame={(id) => {
            setExpandedId(id)
            setView('log')
          }}
        />
      )}
      {view === 'log' && (
        <GameLog
          games={games}
          expandedId={expandedId}
          onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
          onEdit={editGame}
          onDelete={deleteGame}
        />
      )}
      {view === 'entry' && (
        <Entry
          form={form}
          setForm={setForm}
          editingId={editingId}
          formError={formError}
          compOptions={[...new Set(games.map((g) => g.comp).filter(Boolean))].sort()}
          onSave={saveGame}
          onCancel={cancelEntry}
        />
      )}
      {view === 'import' && (
        <Import
          riot={riot}
          onRiotChange={saveRiot}
          importing={importing}
          importError={importError}
          importMatches={importMatches}
          games={games}
          onFetch={fetchMatches}
          onReview={reviewMatch}
        />
      )}
    </div>
  )
}
