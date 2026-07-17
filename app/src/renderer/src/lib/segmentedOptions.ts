import { AUG_TYPES, MISTAKES } from '../../../shared/constants'

export interface SegOption<T> {
  label: string
  value: T
}

export const PLACEMENT_OPTIONS: SegOption<number>[] = [1, 2, 3, 4, 5, 6, 7, 8].map((p) => ({
  label: String(p),
  value: p
}))

export const YES_NO: SegOption<boolean>[] = [
  { label: 'Yes', value: true },
  { label: 'No', value: false }
]

export const AUG_TYPE_OPTIONS: SegOption<string>[] = AUG_TYPES.map((t) => ({ label: t, value: t }))

export const AUG_READ_OPTIONS: SegOption<string>[] = [
  { label: 'Matched opener / clear direction', value: 'matched' },
  { label: 'Taken blind', value: 'blind' }
]

export const STREAK_OPTIONS: SegOption<string>[] = [
  { label: 'Win streak', value: 'win' },
  { label: 'Loss streak', value: 'loss' },
  { label: 'Mixed', value: 'mixed' }
]

export const POS_ISSUE_OPTIONS: SegOption<string>[] = [
  { label: 'Focus fire', value: 'focus' },
  { label: 'Aggro pull', value: 'aggro' },
  { label: 'Stat gap', value: 'stats' },
  { label: 'None', value: 'none' }
]

export const MISTAKE_OPTIONS: SegOption<string>[] = MISTAKES.map((m) => ({ label: m, value: m }))
