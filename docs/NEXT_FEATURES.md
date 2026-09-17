# Next Features — build plan

Three features, in dependency order, plus the defects found while scoping them.
Everything below was checked against the code on 2026-09-09; file:line references
are from that reading.

---

## Findings that shaped this plan

These are corrections to earlier assumptions. They are listed first because two
of the three features depend on them.

### F1 — Steps are NOT typed. Only 6 of 124 generators emit `type:`

An earlier assumption held that step objects were "typed and labeled", and that a
weakness map could therefore be built straight on top of them. That is wrong.

- `find src/algorithms -name steps.js | wc -l` → **124**
- `grep -rl "type:" src/algorithms --include=steps.js | wc -l` → **6**

The six are all backtracking (`combinations`, `nQueens`, `permutations`,
`ratInMaze`, `sudokuSolver`, +1). The other **118 emit no `type` field at all** —
they carry a free-text `description` string and a `codeLine`, nothing
machine-readable about *what kind of operation* the step was.

`src/game/describeStep.js:12` already concedes this in its own comment — the
typed path is "used by a few visualizers" — and `typedLabel()` returns `null` for
almost every algorithm, so `describeStep()` falls through to the raw
`description` string on 118/124.

**Consequence:** the weakness map has no typed data to stand on. Step
classification becomes Item 0, a hard prerequisite.

### F2 — `buildNextOpOptions` produces weak, biased distractors (real bug)

`src/game/describeStep.js` — `buildNextOpOptions(steps, i)` builds the wrong
answers like this:

```js
for (const s of steps) {
  const label = describeStep(s)
  if (label && !seen.has(label)) { seen.add(label); distractors.push(label) }
  if (distractors.length >= 3) break
}
```

It walks the run **from index 0** and takes the first three distinct labels. So:

- Distractors skew hard toward **setup/initialization steps** (e.g. Dutch Flag's
  opening `"Dutch Flag: [0s | 1s | 2s] with lo=0, mid=0, hi=8"`), which are
  trivially distinguishable from a mid-run answer.
- The distractors are **independent of where the question was frozen** — the same
  three wrong answers appear regardless of `i`.
- A learner can often score without understanding the algorithm, by pattern-
  matching "which option looks like a beginning".

This makes the buggy-variant distractor idea (Item 2) a **fix for an existing
quality defect**, not just an enhancement.

### F3 — Minor: dead `action` parameter

`src/algorithms/arrays/dutchFlag/steps.js:7`:

```js
const addStep=(action,desc,line)=>{ ... steps.push({array, pointers, highlight, sorted, description, codeLine}) }
```

`action` is accepted and **never stored** — every call site passes `'swap'`,
`'skip'`, `'done'` or `null` and it is silently dropped. This is precisely the
type information F1 says is missing, thrown away at the point of creation. Worth
a sweep for the same pattern in other generators while building Item 0.

---

## Item 0 — Step classifier (foundation)

**Blocks Items 2 and 3. Do this first.**

New pure module `src/game/classifyStep.js` that infers an op kind by **diffing
consecutive step states**, rather than retrofitting `type:` into 124 generators.

Derive, don't edit: those 124 generators currently pass six audits
(`npm run audit`). Editing all of them to add a field risks regressions across
audited code for no functional gain. A classifier reads the same information out
of state transitions and works retroactively on all 124 at once.

Signals available in every step: `array`, `pointers`, `highlight`, `sorted`,
`codeLine`, plus type-specific fields (`visited`, `queue`, `distances`, `grid`).

Op kinds to detect from `(steps[i], steps[i+1])`:

| Op kind | Signal |
|---|---|
| `swap` | `array` differs at exactly 2 indices, values exchanged |
| `overwrite` | `array` differs at 1 index |
| `compare` | `highlight`/`comparing` moved, `array` unchanged |
| `advance-pointer` | a `pointers[]` entry's index changed, `array` unchanged |
| `mark-sorted` | `sorted[]` grew |
| `visit` | `visited` grew / `current` changed (graph, tree) |
| `enqueue` / `dequeue` | queue length grew / shrank |
| `relax` | a `distances` entry decreased |
| `backtrack` | recursion depth decreased, or existing `type: 'backtrack'` |
| `memo-write` | a DP table cell changed from empty to set |

Honor the existing `step.type` when present (those 6 are ground truth), fall back
to the diff classifier otherwise, and return `unknown` rather than guessing.

**Deliverables**
- `src/game/classifyStep.js` — pure, no Vite-only imports, node-loadable
  (follow the `.js`-extension convention documented in `src/game/runSteps.js`)
- `scripts/test-classify-step.mjs` — matches existing `scripts/test-*.mjs` style
- Coverage check: what percentage of steps across all 124 classify to something
  other than `unknown`. **Report the number; do not silently accept low coverage.**

---

## Item 1 — Algorithm-vs-algorithm diffing

Run two canonical algorithms on the same input, side by side, and mark where they
diverge. Replaces the far more expensive "diff the user's own code" idea, which
is blocked (see Appendix A).

**What already supports this**
- `getDefaultInput(type, …)` in `src/game/defaultInput.js` keys off algorithm
  **type**, so any two `sorting` algorithms already receive byte-identical input.
  Same for two `graph` algorithms. Pair eligibility is nearly free.
- `VisualizerCanvas` (`src/components/Visualizer/VisualizerCanvas.jsx`) is
  already a dispatcher — two instances render two algorithms with no new
  rendering work.

**What needs building**
1. Extend `runSteps(entry)` → `runSteps(entry, inputOverride)`. It currently runs
   the default input only. Keep the single-dispatcher property that
   `src/game/runSteps.js`'s header comment warns about — do not fork the dispatch.
2. Pair picker: same `type`, both `hasSteps`.
3. Side-by-side route + shared transport controls.
4. Divergence marking.

**Design risk — step alignment is not solved**

"Step-locked" is not a real thing here. Mergesort and quicksort emit different
step counts at different granularity, so step *i* on the left is **not the same
moment** as step *i* on the right. Pick an alignment axis before building the UI:

- **Comparison count** — align on the *n*-th comparison. Needs Item 0's classifier.
- **Array-state change** — align on the *n*-th mutation of the array.
- **Two independent clocks** — play both at their own pace, mark only the first
  index where the array states differ. Cheapest, least illuminating.

Decide this first; it determines the data model, not just the visuals.

---

## Item 2 — Buggy-variant distractors

Upgrade `buildNextOpOptions` so wrong answers are "what you would see if you made
*this specific mistake*", each mapped to a named misconception. Fixes F2.

**Approach**
- New `src/game/mutants/` — mutation rules per algorithm family:
  - off-by-one on a loop bound
  - flipped comparator (`<` → `>`)
  - missing pointer advance (e.g. Dutch Flag's deliberate no-`mid++` branch)
  - wrong partition boundary
  - premature `mark-sorted`
- For question frozen at step `i`: run the mutant generator, take the step it
  would have produced at `i+1`, label it with `describeStep`, use as distractor.
- Attach `misconception` text so a wrong pick explains *which* mistake it matches.
- **Fallback:** where no mutant exists for a family, keep current behavior — but
  fix the bias by sampling distractors from a window *around* `i` instead of from
  index 0.

**Note:** a mutant that produces an identical step to the correct answer must be
discarded, not shown. Detect and skip.

---

## Item 3 — Weakness map at step granularity

Track *which kind of step* a learner mispredicts, not how many problems they
solved. Depends on Item 0.

**Data:** per answer, record `{ opKind, algorithmType, wasCorrect }`.

**Constraint — target Test Yourself, NOT the daily challenge.**
`src/game/dailyChallenge.js` is deliberately seeded (`dailySeed` + `mulberry32`)
so every visitor gets the same question on a given day; its header comment states
this. Personalizing the daily would break that shared-question property and make
leaderboard comparison unfair. Weakness-targeted question selection belongs in
`TestYourself.jsx` (practice mode) only.

**Open decision — where does weakness data live?**
`firestore.rules` locks every XP-bearing field (`solved`, `solvedCount`,
`dailyCount`, streaks, `quizXp*`, `xp`) to the Cloud Functions Admin SDK, so XP
cannot be spoofed client-side. Weakness stats are **not** XP and don't affect the
leaderboard, so either is defensible:
- **Client-writable profile data** — cheap, no function deploy, no Blaze cost.
  Risk: a user can forge their own weakness profile, which only hurts themselves.
- **Function-written** — consistent with existing XP handling, costs a deploy.

Recommendation: client-writable, under a key the rules allow but leaderboard
queries never read. Revisit if weakness ever earns XP.

**UI:** weakness panel ("you miss heap sift-down 60% of the time"), then bias
question selection in Test Yourself toward weak op kinds.

---

## Suggested order

**0 → 2 → 1 → 3**

- **0** unblocks everything and is self-contained.
- **2** delivers visible learner value immediately after, and fixes F2.
- **1** is the biggest single "aha", but needs the alignment decision made first.
- **3** is the strongest long-term differentiator, and wants real usage data
  before its selection weighting is tuned.

---

## Appendix A — Why user-code diffing was dropped

The original idea was to trace the learner's own submission and diff it against
the reference execution. It is blocked by the current architecture.

`src/components/practice/OneCompilerIDE.jsx:44` embeds an `<iframe>` pointing at
`https://onecompiler.com/embed/${lang}`. The learner's code is typed into a
cross-origin page and executed on OneCompiler's servers. Nothing crosses back:
no source, no output, no execution trace.

Delivering it would require replacing the execution model entirely:
- **Python** → Pyodide in-browser (~6MB wasm), full trace control. Heavy but real.
- **JS** → Web Worker + instrumentation. Easiest, but off-platform (Java/Python focus).
- **Java** → not viable client-side.
- **Server sandbox** → Piston is dead; running untrusted code in your Cloud
  Functions is a security problem worth avoiding.

Item 1 delivers most of the pedagogical payoff for a fraction of the cost.
