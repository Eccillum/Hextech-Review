import { TOKENS } from '../../../../shared/constants'
import { Segmented } from '../ui/Segmented'
import {
  AUG_READ_OPTIONS,
  AUG_TYPE_OPTIONS,
  MISTAKE_OPTIONS,
  PLACEMENT_OPTIONS,
  POS_ISSUE_OPTIONS,
  STREAK_OPTIONS,
  YES_NO
} from '../../lib/segmentedOptions'
import { goldButtonStyle, inputStyle, labelStyle, sectionCardStyle, sectionHeadingStyle, textareaStyle } from '../../lib/styles'
import type { AugType, AugRead, GameDraft, Mistake, PosIssue, Streak, TimelinePoint } from '../../../../shared/types'

interface Props {
  form: GameDraft
  setForm: (f: GameDraft) => void
  editingId: number | null
  formError: string
  compOptions: string[]
  onSave: () => void
  onCancel: () => void
}

export function Entry({ form, setForm, editingId, formError, compOptions, onSave, onCancel }: Props): JSX.Element {
  function setF<K extends keyof GameDraft>(key: K, value: GameDraft[K]): void {
    setForm({ ...form, [key]: value })
  }

  function setTimeline(next: TimelinePoint[]): void {
    setF('timeline', next)
  }

  return (
    <main style={{ padding: '28px 32px 120px', maxWidth: 860, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ font: "600 22px 'Space Grotesk',sans-serif" }}>{editingId != null ? `Edit game #${editingId}` : 'Log a game'}</div>
        <div style={{ fontSize: 13, color: TOKENS.textMuted }}>Follows your VOD review order — skim top to bottom</div>
      </div>

      <section style={sectionCardStyle}>
        <div style={sectionHeadingStyle}>1 · Result</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <label style={labelStyle}>
            Date
            <input type="date" value={form.date} onChange={(e) => setF('date', e.target.value)} style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Stage ended (e.g. 5-3, or "Won")
            <input value={form.stage} onChange={(e) => setF('stage', e.target.value)} placeholder="5-3" style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Final HP (if you survived)
            <input type="number" value={form.hp} onChange={(e) => setF('hp', e.target.value)} placeholder="—" style={inputStyle} />
          </label>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 12, color: TOKENS.textMuted }}>Placement</div>
          <Segmented options={PLACEMENT_OPTIONS} value={form.placement || null} onChange={(v) => setF('placement', v)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, alignItems: 'end' }}>
          <label style={labelStyle}>
            Comp played
            <input
              list="comp-options"
              value={form.comp}
              onChange={(e) => setF('comp', e.target.value)}
              placeholder="e.g. Rapidfire Kog, Fortune reroll…"
              style={inputStyle}
            />
            <datalist id="comp-options">
              {compOptions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 12, color: TOKENS.textMuted }}>Tilted this game?</div>
            <Segmented options={YES_NO} value={form.tilted} onChange={(v) => setF('tilted', v)} />
          </div>
        </div>
      </section>

      <section style={sectionCardStyle}>
        <div style={sectionHeadingStyle}>2 · Augment at 2-1</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <label style={labelStyle}>
            Augment picked
            <input value={form.augName} onChange={(e) => setF('augName', e.target.value)} placeholder="e.g. Pandora's Items" style={inputStyle} />
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 12, color: TOKENS.textMuted }}>Type</div>
            <Segmented options={AUG_TYPE_OPTIONS} value={form.augType} onChange={(v) => setF('augType', v as AugType)} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 12, color: TOKENS.textMuted }}>Did it match your opener / give real direction?</div>
          <Segmented options={AUG_READ_OPTIONS} value={form.augRead} onChange={(v) => setF('augRead', v as AugRead)} />
        </div>
      </section>

      <section style={sectionCardStyle}>
        <div style={sectionHeadingStyle}>3 · First item slam</div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, alignItems: 'end' }}>
          <label style={labelStyle}>
            What did you slam first?
            <input value={form.slam} onChange={(e) => setF('slam', e.target.value)} placeholder="e.g. Guinsoo's on Kog at 2-5" style={inputStyle} />
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 12, color: TOKENS.textMuted }}>Matched augment / opener direction?</div>
            <Segmented options={YES_NO} value={form.slamMatched} onChange={(v) => setF('slamMatched', v)} />
          </div>
        </div>
      </section>

      <section style={sectionCardStyle}>
        <div style={sectionHeadingStyle}>4 · Tempo, econ &amp; scouting</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 12, color: TOKENS.textMuted }}>Streak state</div>
            <Segmented options={STREAK_OPTIONS} value={form.streak} onChange={(v) => setF('streak', v as Streak)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 12, color: TOKENS.textMuted }}>Leveling matched the curve for that streak?</div>
            <Segmented options={YES_NO} value={form.levelMatched} onChange={(v) => setF('levelMatched', v)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 12, color: TOKENS.textMuted }}>Scouted for contested lines (3-2 → 3-5)?</div>
            <Segmented options={YES_NO} value={form.scouted} onChange={(v) => setF('scouted', v)} />
          </div>
        </div>
      </section>

      <section style={sectionCardStyle}>
        <div style={sectionHeadingStyle}>5 · Stage 4 &amp; positioning</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 12, color: TOKENS.textMuted }}>Lost a big fight in stage 4?</div>
          <Segmented options={YES_NO} value={form.s4loss} onChange={(v) => setF('s4loss', v)} />
        </div>
        {form.s4loss === true && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14, alignItems: 'end', background: TOKENS.bg, borderRadius: 10, padding: 14 }}>
            <label style={labelStyle}>
              HP going into stage 4
              <input
                type="number"
                value={form.s4hp}
                onChange={(e) => setF('s4hp', e.target.value)}
                placeholder="e.g. 42"
                style={{ ...inputStyle, background: TOKENS.panel }}
              />
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 12, color: TOKENS.textMuted }}>Avoidable by rolling a turn earlier?</div>
              <Segmented options={YES_NO} value={form.s4avoid} onChange={(v) => setF('s4avoid', v)} />
            </div>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14, alignItems: 'end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 12, color: TOKENS.textMuted }}>Positioning issue on lost fights</div>
            <Segmented options={POS_ISSUE_OPTIONS} value={form.posIssue} onChange={(v) => setF('posIssue', v as PosIssue)} />
          </div>
          <label style={labelStyle}>
            Positioning note
            <input
              value={form.posNote}
              onChange={(e) => setF('posNote', e.target.value)}
              placeholder="e.g. carry got dove by assassins twice"
              style={inputStyle}
            />
          </label>
        </div>
      </section>

      <section style={{ ...sectionCardStyle, gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={sectionHeadingStyle}>
            6 · Decision timeline <span style={{ color: TOKENS.textFaint, textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>(optional)</span>
          </div>
          <button
            type="button"
            onClick={() => setTimeline([...form.timeline, { stage: '', note: '' }])}
            style={{ background: 'transparent', border: `1px solid ${TOKENS.borderGhost}`, color: TOKENS.textSecondary, borderRadius: 7, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = TOKENS.gold
              e.currentTarget.style.color = TOKENS.gold
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = TOKENS.borderGhost
              e.currentTarget.style.color = TOKENS.textSecondary
            }}
          >
            + Add point
          </button>
        </div>
        {form.timeline.map((t, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 36px', gap: 10, alignItems: 'center' }}>
            <input
              value={t.stage}
              onChange={(e) => setTimeline(form.timeline.map((x, j) => (j === i ? { ...x, stage: e.target.value } : x)))}
              placeholder="3-2"
              style={{ ...inputStyle, font: "14px 'IBM Plex Mono',monospace", textAlign: 'center' }}
            />
            <input
              value={t.note}
              onChange={(e) => setTimeline(form.timeline.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)))}
              placeholder="What happened / what you decided"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setTimeline(form.timeline.filter((_, j) => j !== i))}
              style={{ background: 'transparent', border: 'none', color: TOKENS.textFaint, fontSize: 16, cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = TOKENS.red)}
              onMouseLeave={(e) => (e.currentTarget.style.color = TOKENS.textFaint)}
            >
              ✕
            </button>
          </div>
        ))}
      </section>

      <section style={sectionCardStyle}>
        <div style={sectionHeadingStyle}>7 · Verdict</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 12, color: TOKENS.textMuted }}>Biggest mistake category this game</div>
          <Segmented options={MISTAKE_OPTIONS} value={form.mistake} onChange={(v) => setF('mistake', v as Mistake)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <label style={labelStyle}>
            Key decision point
            <textarea
              value={form.keyDecision}
              onChange={(e) => setF('keyDecision', e.target.value)}
              rows={3}
              placeholder="The moment the game hinged on…"
              style={textareaStyle}
            />
          </label>
          <label style={labelStyle}>
            What I'd do differently
            <textarea
              value={form.differently}
              onChange={(e) => setF('differently', e.target.value)}
              rows={3}
              placeholder="Next time I will…"
              style={textareaStyle}
            />
          </label>
        </div>
      </section>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: TOKENS.headerDark, borderTop: `1px solid ${TOKENS.borderSubtle}`, padding: '14px 32px', display: 'flex', justifyContent: 'center', zIndex: 30 }}>
        <div style={{ maxWidth: 860, width: '100%', display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="button"
            onClick={onSave}
            style={{ ...goldButtonStyle, padding: '12px 26px', font: "600 15px 'IBM Plex Sans',sans-serif" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = TOKENS.goldHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = TOKENS.gold)}
          >
            {editingId != null ? 'Save changes' : 'Save game'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{ background: 'transparent', border: `1px solid ${TOKENS.borderGhost}`, color: TOKENS.textMuted, borderRadius: 8, padding: '12px 20px', font: "500 14px 'IBM Plex Sans',sans-serif", cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = TOKENS.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = TOKENS.textMuted)}
          >
            Cancel
          </button>
          <div style={{ color: TOKENS.red, fontSize: 13 }}>{formError}</div>
        </div>
      </div>
    </main>
  )
}
