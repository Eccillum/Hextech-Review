import type { GameDraft } from '../../../shared/types'

export function blankForm(): GameDraft {
  return {
    sample: false,
    riotMatchId: null,
    date: new Date().toISOString().slice(0, 10),
    placement: 0,
    comp: '',
    stage: '',
    hp: '',
    augName: '',
    augType: null,
    augRead: null,
    slam: '',
    slamMatched: null,
    streak: null,
    levelMatched: null,
    scouted: null,
    s4loss: false,
    s4hp: '',
    s4avoid: null,
    posIssue: null,
    posNote: '',
    mistake: null,
    keyDecision: '',
    differently: '',
    tilted: false,
    timeline: []
  }
}
