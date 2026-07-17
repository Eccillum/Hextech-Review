// Pure mapping helpers ported from the design prototype's Component class.
// Kept dependency-free so both the main process (real fetch) and tests can use them.

export function stageFromRound(r: number | null | undefined): string {
  if (!r) return ''
  if (r <= 4) return '1-' + r
  return Math.floor((r - 5) / 7) + 2 + '-' + (((r - 5) % 7) + 1)
}

export function prettyTrait(t: string | null | undefined): string {
  return (t || '').replace(/^[^_]*_/, '').replace(/([a-z])([A-Z])/g, '$1 $2')
}

export interface RiotTrait {
  name: string
  style: number
  num_units: number
}

export function guessComp(traits: RiotTrait[] | undefined): string {
  return (traits || [])
    .filter((t) => t.style >= 2)
    .sort((a, b) => b.style - a.style || b.num_units - a.num_units)
    .slice(0, 2)
    .map((t) => prettyTrait(t.name))
    .join(' + ')
}
