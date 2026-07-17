import type { CSSProperties } from 'react'
import { TOKENS } from '../../../shared/constants'

export const cardStyle: CSSProperties = {
  background: TOKENS.panel,
  border: `1px solid ${TOKENS.borderSubtle}`,
  borderRadius: 12,
  padding: '20px 22px',
  display: 'flex',
  flexDirection: 'column',
  gap: 12
}

export const sectionCardStyle: CSSProperties = {
  background: TOKENS.panel,
  border: `1px solid ${TOKENS.borderSubtle}`,
  borderRadius: 12,
  padding: 22,
  display: 'flex',
  flexDirection: 'column',
  gap: 16
}

export const sectionHeadingStyle: CSSProperties = {
  font: "600 13px 'Space Grotesk',sans-serif",
  color: TOKENS.gold,
  textTransform: 'uppercase',
  letterSpacing: 1
}

export const labelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: 12,
  color: TOKENS.textMuted
}

export const fieldLabelStyle: CSSProperties = {
  fontSize: 12,
  color: TOKENS.textMuted
}

export const inputStyle: CSSProperties = {
  background: TOKENS.bg,
  border: `1px solid ${TOKENS.borderInput}`,
  borderRadius: 8,
  padding: '9px 12px',
  color: TOKENS.text,
  font: "14px 'IBM Plex Sans',sans-serif",
  outline: 'none'
}

export const monoInputStyle: CSSProperties = {
  ...inputStyle,
  font: "13px 'IBM Plex Mono',monospace"
}

export const textareaStyle: CSSProperties = {
  ...inputStyle,
  resize: 'vertical'
}

export const ghostButtonStyle: CSSProperties = {
  background: 'transparent',
  border: `1px solid ${TOKENS.borderGhost}`,
  color: TOKENS.textSecondary,
  borderRadius: 7,
  padding: '7px 14px',
  fontSize: 13,
  cursor: 'pointer'
}

export const goldButtonStyle: CSSProperties = {
  background: TOKENS.gold,
  color: TOKENS.onGold,
  border: 'none',
  borderRadius: 8,
  padding: '11px 20px',
  font: "600 14px 'IBM Plex Sans',sans-serif",
  cursor: 'pointer'
}
