import type { CSSProperties } from 'react'
import { TOKENS } from '../../../../shared/constants'
import type { SegOption } from '../../lib/segmentedOptions'

interface Props<T> {
  options: SegOption<T>[]
  value: T | null | undefined
  onChange: (v: T) => void
  wide?: boolean
}

export function Segmented<T>({ options, value, onChange, wide }: Props<T>): JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map((o) => {
        const on = value === o.value
        const style: CSSProperties = {
          background: on ? TOKENS.gold : TOKENS.bg,
          color: on ? TOKENS.onGold : TOKENS.textSecondary,
          border: `1px solid ${on ? TOKENS.gold : TOKENS.borderInput}`,
          borderRadius: 8,
          padding: `8px ${wide ? 16 : 13}px`,
          font: `${on ? 600 : 400} 13px 'IBM Plex Sans',sans-serif`,
          cursor: 'pointer',
          whiteSpace: 'nowrap'
        }
        return (
          <button
            key={String(o.value)}
            type="button"
            style={style}
            onClick={() => onChange(o.value)}
            onMouseEnter={(e) => {
              if (!on) e.currentTarget.style.borderColor = TOKENS.gold
            }}
            onMouseLeave={(e) => {
              if (!on) e.currentTarget.style.borderColor = TOKENS.borderInput
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
