# Handoff: TFT Game Review & VOD Analysis Tool (Desktop App)

## Overview
A personal desktop application for logging and analyzing Teamfight Tactics games. The owner reviews VODs after each session and records structured decision-point data (augment reads, item slams, leveling vs. streak, scouting, stage-4 losses, positioning) plus subjective verdicts. The app auto-imports objective match data from Riot's TFT Match API and surfaces trend analytics (rolling placement, mistake-category frequency by month, performance by comp / streak type / augment type, tilt impact).

Single user. No multi-user, no auth beyond keeping the Riot API key server-side/local.

## About the Design Files
`TFT Review.dc.html` in this bundle is a **design reference created in HTML** — a fully working prototype showing intended look and behavior, not production code to copy directly. The task is to **recreate this design as a real desktop application**. Recommended target: **Tauri v2 + React + TypeScript + SQLite** (Electron acceptable; owner has React+TS experience). The prototype's logic class (`class Component`) contains the exact stat computations, form model, and Riot API mapping — port them, don't reinvent.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and interactions are final. Recreate pixel-perfectly.

## Architecture (target app)
- **Shell**: Tauri v2 desktop app, single window, min width ~1100px.
- **Storage**: SQLite (via tauri-plugin-sql or rusqlite). One `games` table (schema below). Migrate the prototype's localStorage JSON (`tft-review-games-v1`) via a one-time JSON import.
- **Riot API**: call from the Rust/Node backend process, never the webview (CORS + key exposure). Key stored in OS keychain or local config, entered in-app on the Import screen. Dev keys expire in 24h — surface 401/403 as "regenerate your key".
- **Post-game auto-import (nice-to-have, phase 2)**: poll `by-puuid/ids?count=1` every ~2 min while the app runs, or watch the League Client (LCU) local API for game-end; when a new match id appears, create a **draft entry** with objective fields prefilled and badge it "needs review".

## Data Model

```sql
CREATE TABLE games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,      -- user-facing log number "#12"
  riot_match_id TEXT UNIQUE,                 -- nullable; dedupe key for imports
  date TEXT NOT NULL,                        -- ISO yyyy-mm-dd
  placement INTEGER NOT NULL CHECK (placement BETWEEN 1 AND 8),
  comp TEXT NOT NULL,                        -- free text, autocomplete from distinct prior values
  stage TEXT,                                -- e.g. "5-3" or "Won"
  final_hp INTEGER,                          -- nullable, only if survived
  aug_name TEXT,                             -- 2-1 augment; NOT in Riot API, manual
  aug_type TEXT CHECK (aug_type IN ('Econ','Item','Combat','Trait','Hero')),
  aug_read TEXT CHECK (aug_read IN ('matched','blind')),
  slam TEXT,                                 -- first item slam description
  slam_matched INTEGER,                      -- bool: matched augment/opener direction
  streak TEXT CHECK (streak IN ('win','loss','mixed')),
  level_matched INTEGER,                     -- bool: leveling matched curve for streak
  scouted INTEGER,                           -- bool: scouted 3-2 → 3-5
  s4_loss INTEGER DEFAULT 0,                 -- bool: lost a big stage-4 fight
  s4_hp INTEGER,                             -- HP going into stage 4 (if s4_loss)
  s4_avoid INTEGER,                          -- bool: avoidable by rolling a turn earlier
  pos_issue TEXT CHECK (pos_issue IN ('focus','aggro','stats','none')),
  pos_note TEXT,
  mistake TEXT CHECK (mistake IN ('Positioning','Itemization','Line/Augment','Econ','Scouting','Leveling','Tilt')),
  key_decision TEXT,
  differently TEXT,
  tilted INTEGER DEFAULT 0
);
CREATE TABLE timeline_points (               -- optional per-game decision timeline
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  ord INTEGER, stage TEXT, note TEXT
);
```

## Riot API Integration
Owner: Riot ID **Newton#1604**, routing region **americas**.
1. `GET https://{region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{name}/{tag}` → `puuid`
2. `GET .../tft/match/v1/matches/by-puuid/{puuid}/ids?count=10`
3. `GET .../tft/match/v1/matches/{id}` per id; find participant by puuid.

Mapping (from prototype logic, port verbatim):
- `date` = `info.game_datetime` → ISO date
- `placement` = `participant.placement`
- `stage`: if placement === 1 → `"Won"`, else from `last_round`: `r <= 4 ? "1-"+r : (floor((r-5)/7)+2) + "-" + ((r-5)%7+1)`
- `comp` guess = top 2 traits with `style >= 2`, sorted by style desc then num_units desc, prefix stripped (`TFT11_Duelist` → `Duelist`), joined with `" + "`. Always user-editable.
- **NOT available in API** (stay manual): augment name/type/read (Riot removed augment data), final HP, streak, all subjective fields.
- Dedupe on `riot_match_id`; already-imported matches show "✓ Imported" instead of the action button.
- Error copy: 401/403 → "Key rejected — dev keys expire after 24h, regenerate it."; 404 → "Riot ID not found in that region."

## Screens / Views
Four views behind a persistent top nav. All views max-width 1240px (entry/import 860px), centered, page padding 28px 32px.

### App chrome (all views)
- Header: 64px tall, background `#111827`, bottom border 1px `#1E2941`, sticky.
- Logo: 32px square, radius 8px, `linear-gradient(135deg,#DCA84F,#8A5F1E)`, letter "R" in Space Grotesk 700 15px `#0E1420`. Wordmark "Reroll Review" Space Grotesk 600 17px.
- Nav tabs (Dashboard / Game Log / Import): 14px IBM Plex Sans 500, padding 8px 14px, radius 8px; inactive `#8B97AD`, active `#E9EEF7` on `#1B2436`; hover text brightens.
- Primary CTA "+ Log Game" right-aligned: `#DCA84F` bg, `#181205` text, 600 14px, padding 10px 18px, radius 8px, hover `#EBC276`.

### 1 · Dashboard (default view)
- **Empty state** (0 games): dashed border card (`1px dashed #2C3A55`, radius 14px, padding 64px 32px, centered) with title "No games logged yet", explainer, and two buttons: "Log your first game" (gold) + "Load 40 sample games" (ghost). Sample games carry a `sample` flag; when any exist, a footer link "remove sample games" deletes only them.
- **KPI row**: 4-col grid, gap 14px. Cards: `#151D2C` bg, 1px `#1E2941` border, radius 12px, padding 18px 20px. Label 12px uppercase `#8B97AD` ls 0.8px; value IBM Plex Mono 600 28px (Games `#E9EEF7`, Avg placement `#DCA84F`, Top-4 `#53C0A9`, Win rate `#6AA5E8`); sub-line 12px `#5C6980`. Avg-placement sub shows `last N: X.XX ↓ improving / ↑ worsening / → steady` (threshold ±0.15 vs all-time).
- **Placement over time** (3fr of a 3fr/2fr grid): SVG line chart, viewBox 640×220. Y axis inverted placements 1→8 (y = 14 + (p−1)/7·186), gridlines at 1/3/5/8 in `#1E2941` with mono 11px labels `#5C6980`. Per-game dots r=3 opacity .55 colored by placement (1st `#DCA84F`, 2–4 `#53C0A9`, 5–8 `#D66470`); rolling-average path stroke `#DCA84F` 2.5px round caps. Window default 10, user-configurable 3–20.
- **Mistakes by month** (2fr): last 6 months, one row per month: label + total (mono), then a 14px-tall stacked horizontal bar (radius 4, track `#0E1420`), segment widths scaled to the max month total. Legend chips 9px squares + 11px labels. Category colors: Positioning `#6AA5E8`, Itemization `#DCA84F`, Line/Augment `#B287E0`, Econ `#58B98D`, Scouting `#53C0C0`, Leveling `#E08D5B`, Tilt `#D66470`.
- **Second row, 3 equal columns**:
  - *Placement by streak type* — 3 stat bars (Win `#53C0A9` / Loss `#D66470` / Mixed `#6AA5E8`): label + avg (mono, colored), 8px progress bar width = (9−avg)/8·100%, "N games" sub.
  - *Augment type at 2-1* — same bar pattern for Econ `#DCA84F` / Item `#6AA5E8` / Combat `#D66470` / Trait `#B287E0` / Hero `#53C0A9`.
  - *Tilt impact* — two inset panels (`#0E1420`, radius 10): TILTED avg (mono 24px `#D66470`) vs CALM avg (`#53C0A9`) with game counts; sentence below: "Tilted games cost you X.X places on average." / "Not enough data to compare yet."
  - *Recent games* — last 12 placements as 34px square chips (colored by placement, mono 600 14px), hover gold outline, click → Game Log with that game expanded; tooltip "#id · comp".
- **Performance by comp**: card with table — columns Comp / Games / Avg place / Top 4 / Wins; sorted by games desc, top 10; avg colored green ≤4 else red; numeric cells right-aligned mono; row hover `#1B2436`.

### 2 · Game Log
- Header row: "Game Log" + "N games" count.
- Table card: grid columns `56px 100px 56px 1.6fr 80px 1.2fr 1fr 60px` → # / Date / Place / Comp / Ended / Mistake / Augment / chevron. Placement is a 28px rounded badge (colors as above). Mistake is a pill: category color at 13% alpha bg (`{color}22`), full-color text, radius 20px. Rows newest-first, hover `#1B2436`, whole row clickable to expand.
- **Expanded detail** (inset `#111827`): 4-col facts grid — Final HP, Augment read ("Matched opener" / "Taken blind", blind in `#E08D5B`), First slam (+ "on-line"/"off-line"), Streak/leveling, Scouted (No in red), Stage 4 loss ("Yes · 42 HP in · avoidable: yes" in red), Positioning (+ note), Tilted (Yes in red). Then optional **Decision timeline**: 2px gold-less left rule `#263248`, rows of mono gold stage label (`#DCA84F`) + note. Then Key decision point / What I'd do differently side by side. Footer: Edit (ghost, gold hover) and Delete (ghost, red hover, confirm dialog) buttons.

### 3 · Log a game (entry form)
Single scrollable screen ordered to match the VOD review pass — 7 numbered section cards (`#151D2C`, radius 12, padding 22px; section headings Space Grotesk 600 13px uppercase gold ls 1px):
1. **Result** — date picker · stage-ended text ("5-3" / "Won") · final HP number; placement as 8 segmented buttons; comp free-text with autocomplete (datalist of distinct prior comps); "Tilted this game?" Yes/No.
2. **Augment at 2-1** — augment name text; type segmented (Econ/Item/Combat/Trait/Hero); read segmented ("Matched opener / clear direction" vs "Taken blind").
3. **First item slam** — description text; "Matched augment / opener direction?" Yes/No.
4. **Tempo, econ & scouting** — streak segmented (Win/Loss/Mixed); "Leveling matched the curve for that streak?" Yes/No; "Scouted for contested lines (3-2 → 3-5)?" Yes/No.
5. **Stage 4 & positioning** — "Lost a big fight in stage 4?" Yes/No; if Yes, inset panel reveals HP-going-in number + "Avoidable by rolling a turn earlier?" Yes/No. Positioning issue segmented (Focus fire / Aggro pull / Stat gap / None) + note text.
6. **Decision timeline (optional)** — repeatable rows: stage (mono, centered, 90px) + note + ✕ remove; "+ Add point" ghost button.
7. **Verdict** — mistake category as 7 chips; two textareas: "Key decision point", "What I'd do differently".

- Segmented buttons: unselected `#0E1420` bg / `#C6CFDE` text / 1px `#263248` border; selected `#DCA84F` bg / `#181205` text / 600 weight; radius 8px, padding 8px 13px, 13px text; hover gold border.
- Inputs/textareas: `#0E1420` bg, 1px `#263248` border, radius 8px, padding 9px 12px, 14px text; focus border `#DCA84F`.
- **Sticky footer bar** (fixed bottom, `#111827`, top border): "Save game" (gold) / Cancel (ghost) / inline validation error in `#D66470`. Validation: placement and comp required. Save → Game Log with the new/edited game expanded. Editing reuses this form with title "Edit game #N".

### 4 · Import
- Intro copy notes augments/final HP aren't in the API.
- Card: Riot ID text (default `Newton#1604`) · region select (Americas/Europe/Asia/SEA, default Americas) · API key (mono) · "Fetch last 10 matches" gold button ("Fetching…" while loading) · inline error text.
- Results table: Date / Place badge / Comp (guessed) / Ended / Level / action. Action = "Review & save →" ghost-gold button (→ entry form prefilled with date, placement, comp, stage, riot_match_id) or "✓ Imported" in green.

## Interactions & Behavior
- Nav is instant view switching; no routing needed (a router is fine too).
- Log row click toggles expansion (one at a time; `expandedId`).
- Delete confirms, then removes and re-renders stats.
- All charts/stats recompute from the games list on every change; games sorted by date then id.
- Sample-data generator (empty state) creates 40 plausible games over ~90 days with realistic correlations (scouting → better, tilt → worse, mild improvement over time); flagged `sample: true` so they can be bulk-removed.
- Hover states throughout: cards/rows `#1B2436`; ghost buttons gain gold (or red for destructive) border+text.

## State Management
Prototype keeps everything in one component: `games[]`, `view`, `form` (draft entry), `editingId`, `expandedId`, `formError`, `riot {riotId, region, apiKey}`, `importing`, `importError`, `importMatches[]`. In the real app: games in SQLite, queried per view; form state local to the entry screen; Riot settings persisted. `rollingWindow` (3–20, default 10) is a user setting.

## Design Tokens
- Background `#0E1420` · panel `#151D2C` · panel-hover/inset `#1B2436` · header/inset-dark `#111827` · borders `#1E2941` (subtle) / `#263248` (inputs) / `#2C3A55` (ghost buttons)
- Text `#E9EEF7` · body-secondary `#C6CFDE` · muted `#8B97AD` · faint `#5C6980`
- Accent gold `#DCA84F` (hover `#EBC276`, on-gold text `#181205`) · green `#53C0A9` · red `#D66470` · blue `#6AA5E8` · purple `#B287E0` · orange `#E08D5B` · teal `#53C0C0` · seafoam `#58B98D`
- Placement badge fills: 1st `#DCA84F`/`#181205`; 2–4 `#1E3A35`/`#53C0A9`; 5–8 `#3A2028`/`#D66470`
- Fonts (Google): **Space Grotesk** (headings, section labels), **IBM Plex Sans** (body, controls), **IBM Plex Mono** (numbers, dates, stages, ids)
- Radii: cards 12px, inputs/buttons 8px, badges 7px, pills 20px, empty-state 14px · Gaps: 14px within grids, 20px between cards, 22px card padding

## Assets
None — no images or icon fonts. The logo is pure CSS. Charts are inline SVG.

## Files
- `TFT Review.dc.html` — the complete working prototype (markup between `<x-dc>` tags; logic in the `Component` class within the `data-dc-script` script tag). All stat formulas, the Riot mapping, form model, and sample-data generator live here.

## Security note
The bundled prototype contains a Riot **development** API key that expires within 24h of issue — treat it as dead. In the real app, never commit the key; load from keychain/env.
