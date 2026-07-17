// Ported verbatim (formulas) from Component.loadSamples() in the design prototype.
import { AUG_TYPES } from './constants'
import type { AugType, GameDraft, Streak } from './types'

const COMPS = [
  'Rapidfire Kog reroll',
  'Fortune cashout',
  'Slayers Zed',
  'Bruiser Cho flex',
  'Sniper Aphelios',
  'Duelist Yasuo reroll',
  'Arcanist Vex',
  'Legendary flex'
]

const AUG_NAMES: Record<AugType, string[]> = {
  Econ: ['Rich Get Richer', 'Golden Egg', 'Level Up!'],
  Item: ["Pandora's Items", 'Component Grab Bag', 'Living Forge'],
  Combat: ['Cybernetic Uplink', 'Thrill of the Hunt', 'Featherweights'],
  Trait: ['Duelist Heart', 'Sniper Crest', 'Bruiser Soul'],
  Hero: ['Kog Carry', 'Zed Ascension', 'Vex Investment']
}

const SLAMS = [
  "Guinsoo's early",
  'BF + belt hold',
  'Blue Buff on carry',
  "Titan's on tank",
  'Greedy component hold'
]

const STREAKS: Streak[] = ['win', 'loss', 'mixed']

function rnd<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateSampleGames(): GameDraft[] {
  const games: GameDraft[] = []
  for (let i = 0; i < 40; i++) {
    const d = new Date(Date.now() - (85 - i * 2.1) * 864e5)
    const tilted = Math.random() < 0.2
    const scouted = Math.random() < 0.6
    const skill = (scouted ? -0.7 : 0) + (tilted ? 1.4 : 0) + (i / 40) * -0.9
    let placement = Math.round(4.5 + skill + (Math.random() * 5 - 2.5))
    placement = Math.max(1, Math.min(8, placement))
    const augType = rnd(AUG_TYPES)
    const streak = rnd(STREAKS)
    const s4loss = placement >= 5 && Math.random() < 0.55
    games.push({
      sample: true,
      riotMatchId: null,
      date: d.toISOString().slice(0, 10),
      placement,
      comp: rnd(COMPS),
      stage:
        placement === 1
          ? 'Won'
          : placement <= 4
            ? '6-' + (1 + Math.floor(Math.random() * 5))
            : 4 + Math.floor(Math.random() * 2) + '-' + (1 + Math.floor(Math.random() * 6)),
      hp: placement === 1 ? String(20 + Math.floor(Math.random() * 60)) : '',
      augName: rnd(AUG_NAMES[augType]),
      augType,
      augRead: Math.random() < 0.65 ? 'matched' : 'blind',
      slam: rnd(SLAMS),
      slamMatched: Math.random() < 0.7,
      streak,
      levelMatched: Math.random() < 0.6,
      scouted,
      s4loss,
      s4hp: s4loss ? String(20 + Math.floor(Math.random() * 50)) : '',
      s4avoid: s4loss ? Math.random() < 0.5 : null,
      posIssue: placement >= 4 ? rnd(['focus', 'aggro', 'stats', 'none'] as const) : 'none',
      posNote: '',
      mistake: rnd([
        'Positioning',
        'Itemization',
        'Line/Augment',
        'Econ',
        'Scouting',
        'Leveling',
        'Tilt'
      ] as const),
      keyDecision: 'Sample game — auto-generated.',
      differently: '',
      tilted,
      timeline: []
    })
  }
  return games
}
