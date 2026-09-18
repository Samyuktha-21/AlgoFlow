# AlgoFlow — Status, Open Work & Roadmap

Last updated: **2026-09-18** · Branch: `dev` · HEAD: `c598967`

This file is the single place to look for *what state the project is in*, *what is
still outstanding*, and *what is planned next*. Feature-level design detail for the
next build lives in [`docs/NEXT_FEATURES.md`](docs/NEXT_FEATURES.md); stack detail
lives in [`FULLSTACK_DETAILS.md`](FULLSTACK_DETAILS.md).

---

## 1. Where the project stands

**Shipped and working** (all committed on this branch):

| Area | State |
|---|---|
| 124 algorithms | Real step generators, all 124. No placeholders left. |
| Languages | 5 per algorithm — Java, Python, C, C++, JavaScript (124/124 `code.json`) |
| Line highlighting | Java + Python mapped, 635 mappings, 49 deliberate omissions |
| Visualizers | D3-based, single dispatcher (`VisualizerCanvas`) |
| Test Yourself (`/play`) | Endless + fixed-round modes, topic filter |
| Practice (`/practice`) | ~67 curated problems + OneCompiler embedded IDE |
| Accounts & progress | Google auth, `learned`/`bookmarks`, `/profile` dashboard |
| Engagement loop | XP, streaks, daily challenge, badges, `/leaderboard` |
| XP integrity | Server-authoritative via Cloud Functions; rules deny client XP writes |
| SEO / share | `Seo.jsx` per page, `?input=&target=&step=&lang=` deep links, OG PNG + SVG |
| SPA routing | `vercel.json` rewrite (this was the real cause of the old deep-link 404s) |
| Light theme | CSS variable pairs; homepage + viz stage stay dark by design |
| Step classifier | `src/game/classifyStep.js` — 124/124, 0 `unknown`, 70.2% informative |
| Distractors | Buggy-variant, each naming a misconception; F2 bias fixed |
| Compare (`/compare`) | Two algorithms, one input, aligned by operation; 366 pairs |
| Weakness map | Step-granularity, Test Yourself only; panel on setup/summary/profile |

**Verification gates — all green as of this commit:**

```
npm run audit   # 124 clean · 124 read their input · 0 silent fallbacks
                # 124 input-contract · 124 visualizer-contract
                # category invariants: 10 sorting, 5 searching, 2 traversal, 2 heap
                # 0 dead helper params · 18 unreachable mapped lines (0 non-code)
                # classifier: 3355 steps, 0 unknown, 70.2% informative
                # distractors: 124/124 vary with the freeze point, 0% opening-step
                # compare: 366 offerable pairs, 0 without an axis
                # weakness: 97.6% of questions about a real operation
npm run lint    # 0 errors
npm run build   # ✓ built (code-split, no >500 kB chunk warning)
```

---

## 2. What is left to do

### 2.1 Blocking — infrastructure not yet live

These are the reason parts of the product look empty or inert in production.

- [ ] **Deploy Cloud Functions + Firestore rules.** Nothing server-side is live yet.
      Until this runs, `recordDailyCompletion` / `recordQuizXp` / `recordSolved` all
      fail (client degrades gracefully) and `/leaderboard` stays permanently empty.
      ```
      cd functions && npm install
      firebase deploy --only functions,firestore:rules
      ```
      Callable functions require the **Blaze** plan — this was a deliberate choice
      over rearchitecting to client-writes.
- [ ] **Re-check deployed rules vs `firestore.rules` in the repo.** A mismatch was
      observed on 2026-08-08 and never reconciled. The deploy above fixes it, but
      confirm with `firebase firestore:rules get` (or the console) afterwards.
      **Now also required by Item 3:** `firestore.rules` gained `'weakness'` in
      `clientKeys()`. Until that deploys, the weakness write is rejected and the
      map silently falls back to localStorage — the panel still works per-browser,
      but nothing syncs across devices. Nothing else breaks.
- [ ] **Decide what to do about `origin/main`.** Remote `main` sits at `b4dcd33`
      ("Python as 4th language"), **79 commits behind** this branch. The gap is
      intentional — the remote was force-reverted on 2026-09-15. Vercel auto-deploys
      production from `main`, so **production is currently running July code.**
      Promoting this branch to `main` is what makes everything in §1 go live.

### 2.2 Unverified — built but never eyeballed in a real browser

No automated gate covers these; each needs a manual pass with a real Google sign-in.

- [ ] Phase 3b accounts/progress — toggles, `/profile`, inline category badges
- [ ] Phase 4a/4b/4c — XP awards, streak rollover across a UTC day boundary,
      badge unlocks, leaderboard row appearing after a daily
- [ ] Practice IDE — runs in all languages, theme toggle reloads the iframe,
      `?topic=&algo=` deep links prefill correctly

### 2.3 Known gaps carried forward

- [x] ~~`buildNextOpOptions` produces biased distractors.~~ **Done** (`0ed672b`).
      The function is deleted, not deprecated; `src/game/mutants/` replaced it.
      Gate: 124/124 algorithms now vary their slate with the freeze point, and 0%
      of late questions offer the opening step.
- [x] ~~Only 6 of 124 generators emit a `type:` field.~~ **Done** (`c58f78f`) — and
      the premise was wrong. Those six emit `type: 'nqueens' | 'sudoku'`, a
      *visualizer* discriminator, not an op kind, so `typedLabel()` returned null
      for **all 124**, not 118. `src/game/classifyStep.js` derives op kinds by
      diffing instead: 0 `unknown` across 3355 steps.
- [x] ~~Dead `action` parameter in dutchFlag.~~ **Done** (`c58f78f`). Swept all 124
      rather than spot-fixed: found one more file (`circularQueue`'s `op`/`val`)
      and confirmed the rest clean. `scripts/audit-dead-params.mjs` keeps it so —
      eslint cannot, since `no-unused-vars` only flags *trailing* parameters.
- [x] ~~66 mapped lines the default input never reaches.~~ **Done** (this commit).
      `scripts/audit-unreachable-lines.mjs` re-runs every generator over a spread
      of inputs per type. 48 of the 66 are input-dependent branches reached by
      *some* input. 18 point at real code the visualization never walks (avlTree's
      rotation cases, validParentheses' failure branches) — legitimate.
      **2 were genuine defects**, both fixed: `priorityQueue` mapped java 7 (a
      `// Output:` comment) and java 8 (a blank line) to real target lines.
      They had survived because `apply-code-data.cjs` sets `MAP_LANGS = ['python']`
      — the c/cpp/javascript maps were authored but never audited by anything.
      The new script covers all four languages.

**Still open:**

- [ ] **Daily answers and quiz XP are not re-verified server-side.** They are
      rate-capped self-reports (1 daily/UTC-day, 100 quiz XP/day, 30 solves/day).
      Closing this means porting the `src/game` engine into `functions/`.
- [ ] **3 generators have no comparable state at all** — `fundamentals/gcd`,
      `hashing/lruCacheHash`, `linked-lists/flattenLinkedList`. Every step leaves
      every renderable field untouched, so a learner watching them sees one static
      picture for the whole run. `/compare` excludes them; they are still worth
      rewriting. Found while building Item 1.
- [ ] **19 generators are ≥35% narration** — steps that advance the prose without
      moving anything the visualizer can show, led by `bellmanFord` (86%) and
      `ahoCorasick` (77%). 18.5% of the corpus overall. `nextOp` already avoids
      them when picking questions; the generators themselves could carry more
      state. `npm run audit` lists them.

---

## 3. What was built (Items 0–3, all shipped)

All four items in [`docs/NEXT_FEATURES.md`](docs/NEXT_FEATURES.md) are done, in
the planned order 0 → 2 → 1 → 3. Design detail stays in that file; what follows
is the outcome and the places the plan turned out to be wrong.

### Item 0 — Step classifier · `c58f78f`

`src/game/classifyStep.js`, plus `scripts/test-classify-step.mjs`.

| | |
|---|---|
| classified (not `unknown`) | 3355 / 3355 — **100%** |
| informative (not init/no-op/inspect) | 2355 — **70.2%** |
| narration-only (no state change) | 619 — 18.5% |

**The plan's premise was wrong.** It held that the six generators emitting
`type:` were ground-truth op types. They are not: those values are `'nqueens'`
and `'sudoku'`, a visualizer discriminator. `typedLabel()` in `describeStep.js`
returns null for **all 124** algorithms, not 118. The only genuine op signal
those six carry is the boolean `backtracking` flag.

**Two signals the plan's table missed**, both found by checking output against
the corpus rather than reasoning from the doc: the secondary array `array2`,
and the caption strings. KMP has nowhere in the state shape for its LPS table
and renders it into `array2Label`; without diffing that, 18 of its 48 steps
looked inert.

### Item 2 — Buggy-variant distractors · `0ed672b`

`src/game/mutants/`, plus `scripts/test-mutants.mjs`.

**The plan's approach could not work as written.** It called for mutated
generators producing a synthesised step at `i+1`. But 118 of 124 generators
narrate in free-form prose, and no mutation rule can match that voice — the
synthetic option would read as machine-written beside three generator
sentences, trading F2's positional tell for a typographic one. That is *worse*,
because style is identifiable without understanding the algorithm at all.

So a mutant is a **real step from the same run**, chosen because it is the step
a named misconception would have predicted: `no-advance` is the frozen step,
`off-by-one` is the step after the right one, `premature-lock` is the next
`mark-sorted`. Every option is the generator's own prose; each wrong one names
its mistake on the card.

| | |
|---|---|
| full slate of 3 distractors | 3231 / 3231 — **100%** |
| algorithms whose slate varies with `i` | **124 / 124** |
| late questions offering the opening step | **0** — F2's signature, gone |

### Item 1 — Algorithm-vs-algorithm diffing · `de3deed`

`src/game/compareRuns.js`, `src/pages/Compare.jsx` (route `/compare`), plus
`scripts/test-compare-runs.mjs`.

**The alignment decision, which the plan said to settle first.** Frames, not
steps: frame *k* pairs the *k*-th qualifying operation on each side. Three axes,
availability computed per pair:

| axis | pairs | |
|---|---|---|
| Each operation *(default)* | 366 / 366 | any step that changes something |
| Each write | 137 / 366 | swap / overwrite / memo-write / relax / … |
| Each comparison | 39 / 366 | the classic sorting axis |

The plan named comparison count first. It **cannot** be the default — the whole
corpus classifies only 158 steps as `compare`, so it serves 11% of pairs. Two
independent clocks was rejected as the plan anticipated.

Result: **366 offerable pairs** across 10 types, every one with a usable axis,
**302 (82.5%) visibly diverging**.

Two things the plan did not anticipate, both surfaced by running the model
against real steps: the 3 all-narration generators (now §2.3), and that "they
never diverge" is misleading when the compared field never moves — binary and
linear search both leave `array` untouched end to end, so `buildAlignment`
reports `fieldStatic` and the page says 7 operations vs 12 instead.

### Item 3 — Weakness map · `c598967`

`src/game/weakness.js`, `src/components/game/WeaknessPanel.jsx`, plus
`scripts/test-weakness.mjs`.

**The constraint held:** Test Yourself only, never `/daily`. Asserted against
the *source* of `Daily.jsx` and `dailyChallenge.js`, because no unit test can
catch someone wiring `recordWeakness` into the daily page later.

**The open decision resolved as recommended:** client-writable. `weakness` is in
`clientKeys()` in `firestore.rules` with a comment saying why that is safe here
and would not be for XP. Writes use `increment()`; signed-out learners use
localStorage and the two merge on sign-in, so the panel works with no account
and no deploy.

Selection bias is weighted (weak 6×, unseen 3×, mastered 1×), not absolute —
always serving the worst kind would narrow practice to one operation and stop
the map learning anything else. The test pins both directions.

| | |
|---|---|
| questions about a real operation | 968 / 992 — **97.6%** (was 88.2%) |
| distinct op kinds asked about | **22** |
| largest single kind's share | 28.6% — spread enough for a panel |

This forced one upstream fix: `nextOp` was letting through `inspect` answers,
which make poor questions *and* record nothing. It now filters on
`isInformativeKind`, the same predicate the weakness map uses, so questions
asked and answers recorded agree by construction.

### Explicitly dropped — user-code diffing

Unchanged and still correct. The IDE is a cross-origin OneCompiler `<iframe>`
and nothing crosses back. Item 1 delivers most of the pedagogical payoff.

### Where to go next

- The two §2.3 data-quality items (3 inert generators, 19 narration-heavy ones)
  are now the highest-value work: they cap what every feature above can show.
- `/compare` currently runs both sides on the shared per-type default.
  `runSteps` takes an `inputOverride`, so a user-supplied input box is a small
  addition once the pairs have been used in anger.
- Weakness selection weights (6 / 3 / 1) were chosen, not tuned. They want real
  usage data, exactly as the plan said.

---

## 4. Conventions worth not relearning

- **Never re-add client-side XP writes** — Firestore rules deny them. To change XP
  math, edit `functions/logic.js` and keep `src/utils/xp.computeXp` in sync.
- **Server stamps "today" in UTC**; client must use `utcDateStr()` for the daily
  challenge and its done-check.
- **`src/game` modules are node-loadable** — keep explicit `.js` extensions, no
  Vite-only imports, so the audit scripts can require them.
- **One dispatcher** for running steps and one for rendering. Do not fork either.
- `npm run audit` is the real gate. A clean first run on new work is suspicious —
  widen the input shapes before trusting it. This paid off twice while building
  Items 0–3: widening the inputs turned 66 flagged line-maps into 48
  input-dependent branches plus 2 real defects, and the classifier's `array2Label`
  signal only showed up because the output was checked against the corpus rather
  than against the design doc.
- **Derive, don't retrofit.** Two dead helper parameters were removed rather than
  stored, because storing them would have put a `type:` field on 2 of 124
  generators — a field present on 2% of a corpus is worse than no field at all.
  The classifier reads the same information out of state transitions instead.
- **`apply-code-data.cjs` only audits the PYTHON line maps** (`MAP_LANGS`). The
  c/cpp/javascript maps are authored but were unchecked by it; both defects found
  in §2.3 were hiding there. `scripts/audit-unreachable-lines.mjs` covers all four.
- **Weakness data is client-writable, XP is not.** If weakness ever earns XP or
  feeds a public ranking, move it out of `clientKeys()` in `firestore.rules` and
  behind a Cloud Function. The rules file carries that reminder.
- **Never personalise `/daily`.** It is seeded so every visitor gets the same
  question; biasing it would make leaderboard scores incomparable.
  `scripts/test-weakness.mjs` asserts this against the source.
