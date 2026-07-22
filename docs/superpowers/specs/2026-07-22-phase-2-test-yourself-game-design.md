# Phase 2 — "Test Yourself" Game Mode (AlgoFlow)

**Date:** 2026-07-22
**Status:** Approved design, pending implementation plan
**Milestone context:** Phase 2 of the 4-phase roadmap (`2026-07-21-phase-1-polish-and-reach-design.md` is Phase 1). This phase is the "learning depth" slice, delivered as a standalone game. JavaScript-as-5th-language is split into its own later content phase. Accounts/leaderboard/daily-challenge remain Phase 3–4.

## Goal

A dedicated **Test Yourself** destination — its own nav item and page, like Interview Hub and Discussion — where the user actively practices by predicting how algorithms behave. It reuses existing infrastructure (step generators, visualizer components, metadata, explanations) rather than authoring new content.

## Locked decisions

1. **Standalone mode**, not inline per-algorithm challenges — one page at `/play`, nav item "Test Yourself".
2. **Mixed challenge bank** — four rotating question types (below).
3. **Two session modes**, both with **topic (category) selection**: Endless streak and Fixed rounds.
4. **Endless fail rule:** a wrong answer resets the streak to 0 but the run continues; score keeps accumulating; the player ends the run via an "End run" button. Best score + best streak persist.
5. **Fixed rounds:** length selectable 5 / 10 / 20 (default 10); end screen shows a per-type breakdown.
6. **No authored content** — every challenge is generated from existing `steps.js` / `metadata.json` / registry data.
7. **Local persistence only** (`localStorage`); no accounts or leaderboard this phase.
8. Build the page **theme-aware from the start** (uses the `--chrome-*` / `--page-*` / `--chip-*` vars from Phase 1) so it works in light + dark without a later retrofit.

## Non-goals

- JavaScript language addition (separate content phase).
- Accounts, cross-user leaderboard, daily challenge, streak-across-days (Phase 3–4).
- Hand-authored quiz questions or an editable question bank.
- Rewriting the visualizers; we render the existing ones with an explicit frozen step.

---

## Architecture

**Route & nav.** Add a lazy route `/play` in `App.jsx`; add a "Test Yourself" (🎮) button to `Header.jsx` next to Interview/Discussion (both header variants). `Seo` meta on the page.

**Page state machine.** `src/pages/TestYourself.jsx` owns one of three states:
- **Setup** — choose mode + topics (+ round length for Rounds), Start.
- **Playing** — renders the current challenge, score/streak (Endless) or progress N/total (Rounds), handles answer → reveal → next.
- **Summary** — Endless run summary (score, best streak, new-best flags) or Rounds breakdown by type; "Play again" / "Change settings".

**Challenge engine (pure, testable).**
- `src/game/pool.js` — builds the eligible-algorithm pool from `algorithmRegistry.json` + `categories.json`, discovering `metadata.json` and `steps.js` via `import.meta.glob` (same mechanism as `Algorithm.jsx`). Each pool entry: `{ categoryId, algorithmId, name, type, complexity, hasSteps }`. Filtered by the user's selected topics.
- `src/game/challenges/{nextOp,complexity,nameAlgorithm,finalOutput}.js` — one generator each. Signature `generate(entry, loaders) → Challenge | null` (null when not applicable). A `Challenge` is `{ type, entry, renderMode, frozenStep?|animationSteps?, prompt, options: [{label, isCorrect}], explanation }`.
- `src/game/describeStep.js` — `describeStep(step, prevArray)` → a short human label (e.g. "Compare 12 & 5", "Swap 8 & 3", "Mark index 4 sorted", "Visit node 3"), plus a small op vocabulary used to build plausible distractors.
- A session controller (inside the page or `src/game/session.js`) picks a random eligible entry + a random *applicable* challenge type (weighted so all four surface), calls the generator, and manages score/streak/round state.

**Reuse / targeted refactors (shared source of truth, no duplication):**
- Extract `VISUALIZER_MAP` out of `VisualizerCanvas.jsx` into `src/components/Visualizer/visualizerMap.js`; both the canvas and the game import it. The game renders `<Suspense><Comp step={frozenStep} themeId metadata /></Suspense>` directly (the visualizer components already accept an explicit `step` prop).
- Extract `getWhyText` and `deriveResult` out of `Algorithm.jsx` into `src/utils/stepExplain.js`; `Algorithm.jsx` imports them back. The game uses `getWhyText` for reveal explanations and `deriveResult` to compute the correct "final output".

## Challenge types (generation detail)

1. **Predict next operation** *(needs `steps.js`)* — generate steps from the algorithm's default input, pick a random index `i` in `[0, len-2]`, freeze the visualizer at `steps[i]`. Correct option = `describeStep(steps[i+1])`; 2–3 distractors = other plausible ops from the vocabulary/other steps (deduped, shuffled). Reveal explanation = `getWhyText(steps[i+1])`.
2. **Guess the complexity** *(needs metadata)* — prompt "Time complexity of {name}?"; correct = the algorithm's time complexity from metadata; distractors sampled from the standard set `{O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ), O(n³)}` minus the correct one. `renderMode: none`.
3. **Name the algorithm** *(needs `steps.js`)* — auto-play a short looped animation of the algorithm; correct = its name; distractors = other algorithm names from the same category/type. `renderMode: animated`.
4. **Predict the final output** *(needs `steps.js` + a derivable result)* — show the input; correct = `deriveResult(finalStep)`; distractors = plausible wrongs (original/unsorted input, reversed, off-by-one index, "not found"). Skips algorithms where `deriveResult` returns null.

**Applicability & pool coverage.** `nextOp`, `nameAlgorithm`, `finalOutput` require a steps generator and a supported visualizer type; `complexity` works for any entry with metadata complexity. The generator returns null when it can't build a fair question (too few steps, no derivable result, too few distractors), and the session controller re-rolls. `pool.js` reports the eligible count per type; the build logs total coverage so any silently-excluded algorithms are visible (no hidden truncation).

## Scoring & persistence

- **Endless:** correct → `+10 + 2×streak` bonus, `streak++`; wrong → `streak = 0` (score retained), run continues. "End run" → Summary. Persist `{ bestScore, bestStreak }` to `localStorage['algoflow-play']`; flag new records on the summary.
- **Rounds:** pre-generate N mixed challenges; score = correct count; track per-type correct/total for the breakdown. Optionally persist best-score per round length.
- Options are always shuffled; the reveal state shows ✓/✗, the correct answer, and the explanation, with a **Next** button.

## Components / file plan

New: `src/pages/TestYourself.jsx`; `src/game/pool.js`, `src/game/session.js`, `src/game/describeStep.js`, `src/game/challenges/*.js`; `src/utils/stepExplain.js`; `src/components/Visualizer/visualizerMap.js`; `src/components/game/{GameSetup,ChallengeCard,ScoreBar,GameSummary}.jsx`.
Modified: `src/App.jsx` (lazy route), `src/components/Layout/Header.jsx` (nav item), `src/components/Visualizer/VisualizerCanvas.jsx` (import shared map), `src/pages/Algorithm.jsx` (import shared `stepExplain`).

## Error handling & edge cases

- Selected topics yield too few eligible algorithms → warn on Setup and offer "All".
- Generator returns null → re-roll (bounded attempts; if a whole type can't be built for the pool, drop it from the rotation and log it).
- Short step arrays → ensure `i+1` exists before choosing `nextOp`.
- Distractors must be unique and never equal the correct label; guarantee ≥2 distinct distractors or skip the type.
- `localStorage` unavailable → game still plays; persistence is best-effort (try/catch), matching existing code.

## Testing & verification

- `npm run build` clean (new lazy `/play` chunk); `npm run lint` no new violations (respect the pre-existing 36-baseline).
- A small node harness (`scripts/`) that builds the pool and asks each generator to produce a challenge for every eligible algorithm, asserting: no crashes, exactly one correct option, ≥3 options, non-empty prompt. This catches bad generators without a browser.
- Manual: play Endless and Rounds; confirm all four challenge types render (frozen board, animation, complexity, final output); scoring/streak/persistence correct; light + dark themes readable.

## Sequencing

1. Shared extractions (`visualizerMap.js`, `stepExplain.js`) + confirm visualizers render standalone with an explicit step.
2. `pool.js` + `describeStep.js` + the node harness.
3. The four generators (start with `complexity` — simplest — then `nextOp`, `finalOutput`, `nameAlgorithm`).
4. Page state machine + UI components (Setup/Playing/Summary), scoring/persistence.
5. Route + nav + Seo + theme pass; build/lint/manual verification.
