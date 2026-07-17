import { TOKENS } from '../../../../shared/constants'
import { buildLogRows } from '../../../../shared/stats'
import { ghostButtonStyle } from '../../lib/styles'
import type { Game } from '../../../../shared/types'

interface Props {
  games: Game[]
  expandedId: number | null
  onToggle: (id: number) => void
  onEdit: (g: Game) => void
  onDelete: (id: number) => void
}

const COLS = '56px 100px 56px 1.6fr 80px 1.2fr 1fr 60px'

export function GameLog({ games, expandedId, onToggle, onEdit, onDelete }: Props): JSX.Element {
  const rows = buildLogRows(games)
  const byId = new Map(games.map((g) => [g.id, g]))

  return (
    <main style={{ padding: '28px 32px 48px', maxWidth: 1240, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ font: "600 22px 'Space Grotesk',sans-serif" }}>Game Log</div>
        <div style={{ fontSize: 13, color: TOKENS.textMuted }}>{games.length} games</div>
      </div>

      {games.length === 0 && (
        <div style={{ border: `1px dashed ${TOKENS.borderGhost}`, borderRadius: 14, padding: 48, textAlign: 'center', color: TOKENS.textMuted }}>
          Nothing here yet — log a game to get started.
        </div>
      )}

      <div style={{ background: TOKENS.panel, border: `1px solid ${TOKENS.borderSubtle}`, borderRadius: 12, overflow: 'hidden' }}>
        {games.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: COLS,
              gap: '0 14px',
              padding: '12px 18px',
              fontSize: 11,
              color: TOKENS.textFaint,
              textTransform: 'uppercase',
              letterSpacing: 0.7,
              borderBottom: `1px solid ${TOKENS.borderSubtle}`
            }}
          >
            <div>#</div>
            <div>Date</div>
            <div>Place</div>
            <div>Comp</div>
            <div>Ended</div>
            <div>Mistake</div>
            <div>Augment</div>
            <div />
          </div>
        )}
        {rows.map((g) => {
          const expanded = expandedId === g.id
          const game = byId.get(g.id)
          return (
            <div key={g.id} style={{ borderBottom: `1px solid ${TOKENS.borderSubtle}` }}>
              <div
                onClick={() => onToggle(g.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: COLS,
                  gap: '0 14px',
                  padding: '12px 18px',
                  fontSize: 13,
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = TOKENS.panelHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: TOKENS.textFaint }}>{g.idLabel}</div>
                <div style={{ color: TOKENS.textMuted, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{g.date}</div>
                <div>
                  <span
                    style={{
                      display: 'inline-flex',
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: g.pBg,
                      color: g.pFg,
                      font: "600 13px 'IBM Plex Mono',monospace"
                    }}
                  >
                    {g.placement}
                  </span>
                </div>
                <div style={{ fontWeight: 500 }}>{g.comp}</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: TOKENS.textMuted }}>{g.stage}</div>
                <div>
                  <span style={{ fontSize: 12, padding: '3px 9px', borderRadius: 20, background: g.mBg, color: g.mFg }}>{g.mistake}</span>
                </div>
                <div style={{ color: TOKENS.textMuted, fontSize: 12 }}>{g.augShort}</div>
                <div style={{ color: TOKENS.textFaint, fontSize: 11, textAlign: 'right' }}>{expanded ? '▲' : '▼'}</div>
              </div>
              {expanded && (
                <div style={{ padding: '6px 18px 20px', background: TOKENS.headerDark, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                    {g.facts.map((f) => (
                      <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <div style={{ fontSize: 11, color: TOKENS.textFaint, textTransform: 'uppercase', letterSpacing: 0.6 }}>{f.label}</div>
                        <div style={{ fontSize: 13, color: f.color }}>{f.value}</div>
                      </div>
                    ))}
                  </div>
                  {g.hasTimeline && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ fontSize: 11, color: TOKENS.textFaint, textTransform: 'uppercase', letterSpacing: 0.6 }}>Decision timeline</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderLeft: `2px solid ${TOKENS.borderInput}`, paddingLeft: 14 }}>
                        {g.timeline.map((t, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                            <span style={{ fontFamily: "'IBM Plex Mono',monospace", color: TOKENS.gold, minWidth: 36 }}>{t.stage}</span>
                            <span style={{ color: TOKENS.textSecondary }}>{t.note}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <div style={{ fontSize: 11, color: TOKENS.textFaint, textTransform: 'uppercase', letterSpacing: 0.6 }}>Key decision point</div>
                      <div style={{ fontSize: 13, color: TOKENS.textSecondary }}>{g.keyDecision}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <div style={{ fontSize: 11, color: TOKENS.textFaint, textTransform: 'uppercase', letterSpacing: 0.6 }}>What I'd do differently</div>
                      <div style={{ fontSize: 13, color: TOKENS.textSecondary }}>{g.differently}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => game && onEdit(game)}
                      style={ghostButtonStyle}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = TOKENS.gold
                        e.currentTarget.style.color = TOKENS.gold
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = TOKENS.borderGhost
                        e.currentTarget.style.color = TOKENS.textSecondary
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(g.id)}
                      style={{ ...ghostButtonStyle, color: TOKENS.textMuted }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = TOKENS.red
                        e.currentTarget.style.color = TOKENS.red
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = TOKENS.borderGhost
                        e.currentTarget.style.color = TOKENS.textMuted
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}
