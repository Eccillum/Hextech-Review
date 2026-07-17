import { TOKENS } from '../../../../shared/constants'
import { computeDashboard } from '../../../../shared/stats'
import { cardStyle, goldButtonStyle } from '../../lib/styles'
import type { Game } from '../../../../shared/types'

interface Props {
  games: Game[]
  hasSamples: boolean
  rollingWindow: number
  onRollingWindowChange: (n: number) => void
  onStartEntry: () => void
  onLoadSamples: () => void
  onClearSamples: () => void
  onOpenGame: (id: number) => void
}

export function Dashboard({
  games,
  hasSamples,
  rollingWindow,
  onRollingWindowChange,
  onStartEntry,
  onLoadSamples,
  onClearSamples,
  onOpenGame
}: Props): JSX.Element {
  const data = computeDashboard(games, rollingWindow)

  return (
    <main
      style={{
        padding: '28px 32px 48px',
        maxWidth: 1240,
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 20
      }}
    >
      {!data && (
        <div
          style={{
            border: `1px dashed ${TOKENS.borderGhost}`,
            borderRadius: 14,
            padding: '64px 32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            textAlign: 'center'
          }}
        >
          <div style={{ font: "600 22px 'Space Grotesk',sans-serif" }}>No games logged yet</div>
          <div style={{ color: TOKENS.textMuted, fontSize: 14, maxWidth: 420 }}>
            Log your first VOD review to start tracking placement trends and mistake patterns.
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" onClick={onStartEntry} style={{ ...goldButtonStyle, padding: '11px 20px' }}>
              Log your first game
            </button>
            <button
              type="button"
              onClick={onLoadSamples}
              style={{
                background: 'transparent',
                color: TOKENS.textMuted,
                border: `1px solid ${TOKENS.borderGhost}`,
                borderRadius: 8,
                padding: '11px 20px',
                font: "500 14px 'IBM Plex Sans',sans-serif",
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = TOKENS.text
                e.currentTarget.style.borderColor = TOKENS.gold
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = TOKENS.textMuted
                e.currentTarget.style.borderColor = TOKENS.borderGhost
              }}
            >
              Load 40 sample games
            </button>
          </div>
        </div>
      )}

      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {data.kpis.map((k) => (
              <div
                key={k.label}
                style={{
                  background: TOKENS.panel,
                  border: `1px solid ${TOKENS.borderSubtle}`,
                  borderRadius: 12,
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}
              >
                <div style={{ fontSize: 12, color: TOKENS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  {k.label}
                </div>
                <div style={{ font: "600 28px 'IBM Plex Mono',monospace", color: k.color }}>{k.value}</div>
                <div style={{ fontSize: 12, color: TOKENS.textFaint }}>{k.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, alignItems: 'start' }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div style={{ font: "600 15px 'Space Grotesk',sans-serif" }}>Placement over time</div>
                <div style={{ fontSize: 12, color: TOKENS.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
                  gold = rolling avg (
                  <input
                    type="number"
                    min={3}
                    max={20}
                    value={rollingWindow}
                    onChange={(e) => onRollingWindowChange(Math.max(3, Math.min(20, Number(e.target.value) || 10)))}
                    style={{
                      width: 40,
                      background: TOKENS.bg,
                      border: `1px solid ${TOKENS.borderInput}`,
                      borderRadius: 4,
                      color: TOKENS.text,
                      font: "12px 'IBM Plex Mono',monospace",
                      padding: '1px 4px'
                    }}
                  />
                  games)
                </div>
              </div>
              <svg viewBox="0 0 640 220" style={{ width: '100%', height: 'auto', display: 'block' }}>
                {data.gridLines.map((g) => (
                  <g key={g.label}>
                    <line x1={28} x2={640} y1={g.y} y2={g.y} stroke={TOKENS.borderSubtle} strokeWidth={1} />
                    <text x={0} y={g.ty} fill={TOKENS.textFaint} fontSize={11} fontFamily="IBM Plex Mono">
                      {g.label}
                    </text>
                  </g>
                ))}
                {data.trendDots.map((d, i) => (
                  <circle key={i} cx={d.x} cy={d.y} r={3} fill={d.color} opacity={0.55} />
                ))}
                <path
                  d={data.rollingPath}
                  fill="none"
                  stroke={TOKENS.gold}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div style={cardStyle}>
              <div style={{ font: "600 15px 'Space Grotesk',sans-serif" }}>Mistakes by month</div>
              {data.mistakeMonths.map((m) => (
                <div key={m.label} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: TOKENS.textMuted }}>
                    <span>{m.label}</span>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace" }}>{m.total}</span>
                  </div>
                  <div style={{ display: 'flex', height: 14, borderRadius: 4, overflow: 'hidden', background: TOKENS.bg }}>
                    {m.segments.map((s) => (
                      <div key={s.name} title={`${s.name}: ${s.count}`} style={{ width: `${s.width}%`, background: s.color }} />
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', marginTop: 2 }}>
                {data.mistakeLegend.map((l) => (
                  <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: TOKENS.textMuted }}>
                    <span style={{ width: 9, height: 9, borderRadius: 2, background: l.color, display: 'inline-block' }} />
                    {l.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, alignItems: 'start' }}>
            <div style={cardStyle}>
              <div style={{ font: "600 15px 'Space Grotesk',sans-serif" }}>Placement by streak type</div>
              {data.streakStats.map((s) => (
                <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span>{s.label}</span>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", color: s.color }}>{s.avg}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: TOKENS.bg, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.width}%`, background: s.color, borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 11, color: TOKENS.textFaint }}>{s.count} games</div>
                </div>
              ))}
            </div>

            <div style={cardStyle}>
              <div style={{ font: "600 15px 'Space Grotesk',sans-serif" }}>Augment type at 2-1</div>
              {data.augStats.map((s) => (
                <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span>{s.label}</span>
                    <span style={{ fontFamily: "'IBM Plex Mono',monospace", color: s.color }}>{s.avg}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: TOKENS.bg, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.width}%`, background: s.color, borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 11, color: TOKENS.textFaint }}>{s.count} games</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={cardStyle}>
                <div style={{ font: "600 15px 'Space Grotesk',sans-serif" }}>Tilt impact</div>
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ flex: 1, background: TOKENS.bg, borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontSize: 11, color: TOKENS.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 }}>Tilted</div>
                    <div style={{ font: "600 24px 'IBM Plex Mono',monospace", color: TOKENS.red }}>{data.tiltAvg}</div>
                    <div style={{ fontSize: 11, color: TOKENS.textFaint }}>{data.tiltCount} games</div>
                  </div>
                  <div style={{ flex: 1, background: TOKENS.bg, borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontSize: 11, color: TOKENS.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 }}>Calm</div>
                    <div style={{ font: "600 24px 'IBM Plex Mono',monospace", color: TOKENS.green }}>{data.calmAvg}</div>
                    <div style={{ fontSize: 11, color: TOKENS.textFaint }}>{data.calmCount} games</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: TOKENS.textMuted }}>{data.tiltDelta}</div>
              </div>
              <div style={cardStyle}>
                <div style={{ font: "600 15px 'Space Grotesk',sans-serif" }}>Recent games</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {data.recentChips.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      title={r.title}
                      onClick={() => onOpenGame(r.id)}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        border: 'none',
                        cursor: 'pointer',
                        background: r.bg,
                        color: r.fg,
                        font: "600 14px 'IBM Plex Mono',monospace"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.outline = `2px solid ${TOKENS.gold}`)}
                      onMouseLeave={(e) => (e.currentTarget.style.outline = 'none')}
                    >
                      {r.placement}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ ...cardStyle, gap: 8 }}>
            <div style={{ font: "600 15px 'Space Grotesk',sans-serif", marginBottom: 6 }}>Performance by comp</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2.2fr 0.8fr 0.8fr 0.8fr 0.8fr',
                gap: '0 16px',
                fontSize: 11,
                color: TOKENS.textFaint,
                textTransform: 'uppercase',
                letterSpacing: 0.7,
                padding: '0 8px 8px',
                borderBottom: `1px solid ${TOKENS.borderSubtle}`
              }}
            >
              <div>Comp</div>
              <div style={{ textAlign: 'right' }}>Games</div>
              <div style={{ textAlign: 'right' }}>Avg place</div>
              <div style={{ textAlign: 'right' }}>Top 4</div>
              <div style={{ textAlign: 'right' }}>Wins</div>
            </div>
            {data.compStats.map((c) => (
              <div
                key={c.comp}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2.2fr 0.8fr 0.8fr 0.8fr 0.8fr',
                  gap: '0 16px',
                  padding: '9px 8px',
                  fontSize: 13,
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = TOKENS.panelHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ fontWeight: 500 }}>{c.comp}</div>
                <div style={{ textAlign: 'right', fontFamily: "'IBM Plex Mono',monospace", color: TOKENS.textMuted }}>{c.games}</div>
                <div style={{ textAlign: 'right', fontFamily: "'IBM Plex Mono',monospace", color: c.avgColor }}>{c.avg}</div>
                <div style={{ textAlign: 'right', fontFamily: "'IBM Plex Mono',monospace", color: TOKENS.textMuted }}>{c.top4}</div>
                <div style={{ textAlign: 'right', fontFamily: "'IBM Plex Mono',monospace", color: TOKENS.textMuted }}>{c.wins}</div>
              </div>
            ))}
          </div>

          {hasSamples && (
            <div style={{ fontSize: 12, color: TOKENS.textFaint }}>
              Showing sample data —{' '}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onClearSamples()
                }}
              >
                remove sample games
              </a>
            </div>
          )}
        </>
      )}
    </main>
  )
}
