import { TOKENS } from '../../../shared/constants'
import type { View } from '../App'

interface Props {
  view: View
  onNav: (v: View) => void
  onLogGame: () => void
}

const TABS: { view: View; label: string }[] = [
  { view: 'dashboard', label: 'Dashboard' },
  { view: 'log', label: 'Game Log' },
  { view: 'import', label: 'Import' }
]

export function Header({ view, onNav, onLogGame }: Props): JSX.Element {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 32,
        padding: '0 32px',
        height: 64,
        borderBottom: `1px solid ${TOKENS.borderSubtle}`,
        background: TOKENS.headerDark,
        position: 'sticky',
        top: 0,
        zIndex: 20
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `linear-gradient(135deg,${TOKENS.goldGradientStart},${TOKENS.goldGradientEnd})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            font: "700 15px 'Space Grotesk',sans-serif",
            color: TOKENS.bg
          }}
        >
          R
        </div>
        <div style={{ font: "600 17px 'Space Grotesk',sans-serif", letterSpacing: 0.2 }}>Reroll Review</div>
      </div>
      <nav style={{ display: 'flex', gap: 4, flex: 1 }}>
        {TABS.map((t) => {
          const on = view === t.view
          return (
            <button
              key={t.view}
              type="button"
              onClick={() => onNav(t.view)}
              style={{
                background: on ? TOKENS.panelHover : 'transparent',
                border: 'none',
                cursor: 'pointer',
                font: "500 14px 'IBM Plex Sans',sans-serif",
                padding: '8px 14px',
                borderRadius: 8,
                color: on ? TOKENS.text : TOKENS.textMuted
              }}
              onMouseEnter={(e) => {
                if (!on) e.currentTarget.style.color = TOKENS.text
              }}
              onMouseLeave={(e) => {
                if (!on) e.currentTarget.style.color = TOKENS.textMuted
              }}
            >
              {t.label}
            </button>
          )
        })}
      </nav>
      <button
        type="button"
        onClick={onLogGame}
        style={{
          background: TOKENS.gold,
          color: TOKENS.onGold,
          border: 'none',
          borderRadius: 8,
          padding: '10px 18px',
          font: "600 14px 'IBM Plex Sans',sans-serif",
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = TOKENS.goldHover)}
        onMouseLeave={(e) => (e.currentTarget.style.background = TOKENS.gold)}
      >
        + Log Game
      </button>
    </header>
  )
}
