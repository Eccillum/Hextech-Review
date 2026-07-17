import type { AugType, Mistake } from './types'

export const MISTAKES: Mistake[] = [
  'Positioning',
  'Itemization',
  'Line/Augment',
  'Econ',
  'Scouting',
  'Leveling',
  'Tilt'
]

export const MISTAKE_COLORS: Record<Mistake, string> = {
  Positioning: '#6AA5E8',
  Itemization: '#FFC808',
  'Line/Augment': '#B287E0',
  Econ: '#58B98D',
  Scouting: '#53C0C0',
  Leveling: '#E08D5B',
  Tilt: '#D66470'
}

export const AUG_TYPES: AugType[] = ['Econ', 'Item', 'Combat', 'Trait', 'Hero']

export const AUG_TYPE_COLORS: Record<AugType, string> = {
  Econ: '#FFC808',
  Item: '#6AA5E8',
  Combat: '#D66470',
  Trait: '#B287E0',
  Hero: '#53C0A9'
}

// Design tokens — matched to tftacademy.com's live color scheme (near-black + gold).
export const TOKENS = {
  bg: '#000000',
  panel: '#101114',
  panelHover: '#1A1D21',
  headerDark: '#000000',
  borderSubtle: '#1F2226',
  borderInput: '#2B2F33',
  borderGhost: '#34383C',
  text: '#FFFFFF',
  textSecondary: '#D9D9D9',
  textMuted: '#9297A0',
  textFaint: '#5B5F66',
  gold: '#FFC808',
  goldHover: '#FFD84D',
  goldGradientStart: '#DDA359',
  goldGradientEnd: '#FAF4CA',
  onGold: '#111111',
  green: '#53C0A9',
  red: '#D66470',
  blue: '#6AA5E8',
  purple: '#B287E0',
  orange: '#E08D5B',
  teal: '#53C0C0',
  seafoam: '#58B98D'
} as const

export const RIOT_REGIONS = [
  { value: 'americas', label: 'Americas' },
  { value: 'europe', label: 'Europe' },
  { value: 'asia', label: 'Asia' },
  { value: 'sea', label: 'SEA' }
] as const
