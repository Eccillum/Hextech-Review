import { RIOT_REGIONS, TOKENS } from '../../../../shared/constants'
import { placementColors } from '../../../../shared/stats'
import { goldButtonStyle, inputStyle, labelStyle, monoInputStyle } from '../../lib/styles'
import type { Game, RiotImportMatch, RiotSettings } from '../../../../shared/types'

interface Props {
  riot: RiotSettings
  onRiotChange: (r: RiotSettings) => void
  importing: boolean
  importError: string
  importMatches: RiotImportMatch[]
  games: Game[]
  onFetch: () => void
  onReview: (m: RiotImportMatch) => void
}

const COLS = '100px 56px 1.6fr 70px 60px 130px'

export function Import({ riot, onRiotChange, importing, importError, importMatches, games, onFetch, onReview }: Props): JSX.Element {
  return (
    <main style={{ padding: '28px 32px 48px', maxWidth: 860, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ font: "600 22px 'Space Grotesk',sans-serif" }}>Import from Riot</div>
        <div style={{ fontSize: 13, color: TOKENS.textMuted }}>
          Pulls your recent TFT matches and prefills the objective fields. Augment details and final HP aren't in
          Riot's API — you fill those during VOD review.
        </div>
      </div>

      <section style={{ background: TOKENS.panel, border: `1px solid ${TOKENS.borderSubtle}`, borderRadius: 12, padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
          <label style={labelStyle}>
            Riot ID (GameName#TAG)
            <input
              value={riot.riotId}
              onChange={(e) => onRiotChange({ ...riot, riotId: e.target.value })}
              placeholder="Faker#KR1"
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            Region routing
            <select
              value={riot.region}
              onChange={(e) => onRiotChange({ ...riot, region: e.target.value as RiotSettings['region'] })}
              style={inputStyle}
            >
              {RIOT_REGIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label style={labelStyle}>
          Riot API key (dev keys expire every 24h — regenerate at developer.riotgames.com)
          <input
            value={riot.apiKey}
            onChange={(e) => onRiotChange({ ...riot, apiKey: e.target.value })}
            placeholder="RGAPI-…"
            style={monoInputStyle}
          />
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button type="button" onClick={onFetch} style={goldButtonStyle} onMouseEnter={(e) => (e.currentTarget.style.background = TOKENS.goldHover)} onMouseLeave={(e) => (e.currentTarget.style.background = TOKENS.gold)}>
            {importing ? 'Fetching…' : 'Fetch last 10 matches'}
          </button>
          <div style={{ color: TOKENS.red, fontSize: 13 }}>{importError}</div>
        </div>
      </section>

      {importMatches.length > 0 && (
        <section style={{ background: TOKENS.panel, border: `1px solid ${TOKENS.borderSubtle}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: COLS, gap: '0 14px', padding: '12px 18px', fontSize: 11, color: TOKENS.textFaint, textTransform: 'uppercase', letterSpacing: 0.7, borderBottom: `1px solid ${TOKENS.borderSubtle}` }}>
            <div>Date</div>
            <div>Place</div>
            <div>Comp (guessed)</div>
            <div>Ended</div>
            <div>Level</div>
            <div />
          </div>
          {importMatches.map((m) => {
            const c = placementColors(m.placement)
            const imported = games.some((g) => g.riotMatchId === m.matchId)
            return (
              <div key={m.matchId} style={{ display: 'grid', gridTemplateColumns: COLS, gap: '0 14px', padding: '12px 18px', fontSize: 13, alignItems: 'center', borderBottom: `1px solid ${TOKENS.borderSubtle}` }}>
                <div style={{ color: TOKENS.textMuted, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12 }}>{m.date}</div>
                <div>
                  <span style={{ display: 'inline-flex', width: 28, height: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center', background: c.bg, color: c.fg, font: "600 13px 'IBM Plex Mono',monospace" }}>
                    {m.placement}
                  </span>
                </div>
                <div style={{ fontWeight: 500 }}>{m.comp}</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: TOKENS.textMuted }}>{m.stage}</div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", color: TOKENS.textMuted }}>{m.level}</div>
                {imported ? (
                  <div style={{ fontSize: 12, color: TOKENS.green }}>✓ Imported</div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onReview(m)}
                    style={{ background: 'transparent', border: `1px solid ${TOKENS.borderGhost}`, color: TOKENS.gold, borderRadius: 7, padding: '7px 12px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = TOKENS.gold)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = TOKENS.borderGhost)}
                  >
                    Review &amp; save →
                  </button>
                )}
              </div>
            )
          })}
        </section>
      )}
    </main>
  )
}
