# AlgoFlow — Status, Open Work & Roadmap

Last updated: **2026-09-17** · Branch: `dev` · HEAD: `9207dbd`

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

**Verification gates — all green as of this commit:**

```
npm run audit   # 124 clean · 124 read their input · 0 silent fallbacks
                # 124 input-contract · 124 visualizer-contract
                # category invariants: 10 sorting, 5 searching, 2 traversal, 2 heap
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

- [ ] **Daily answers and quiz XP are not re-verified server-side.** They are
      rate-capped self-reports (1 daily/UTC-day, 100 quiz XP/day, 30 solves/day).
      Closing this means porting the `src/game` engine into `functions/`.
- [ ] **`buildNextOpOptions` produces biased distractors** (`src/game/describeStep.js`).
      It walks from index 0, so wrong answers skew toward setup steps and are
      identical regardless of where the question was frozen. A learner can score by
      pattern-matching "which one looks like a beginning". Fixed by Item 2 below.
- [ ] **Only 6 of 124 generators emit a `type:` field.** The other 118 carry free-text
      `description` + `codeLine` and nothing machine-readable. Blocks weakness
      tracking. Fixed by Item 0 below.
- [ ] **Dead `action` parameter** in `src/algorithms/arrays/dutchFlag/steps.js:7` —
      accepted, never stored. Sweep for the same pattern in other generators.
- [ ] **66 mapped lines the default input never reaches.** Expected for
      input-dependent branches, but worth a pass for typos (`npm run audit` prints them).

---

## 3. Upcoming plans

Full design detail, file references and trade-offs: [`docs/NEXT_FEATURES.md`](docs/NEXT_FEATURES.md).

Build order: **0 → 2 → 1 → 3**

### Item 0 — Step classifier *(foundation, blocks 2 and 3)*

New pure module `src/game/classifyStep.js` that infers op kind by **diffing
consecutive step states** rather than retrofitting `type:` into 124 audited
generators. Detects `swap`, `overwrite`, `compare`, `advance-pointer`,
`mark-sorted`, `visit`, `enqueue`/`dequeue`, `relax`, `backtrack`, `memo-write`;
honors existing `step.type` where present; returns `unknown` rather than guessing.

Ships with `scripts/test-classify-step.mjs` and a **reported coverage number** —
what % of steps across all 124 classify to something other than `unknown`.

### Item 2 — Buggy-variant distractors

Wrong answers become "what you would see if you made *this specific mistake*",
each mapped to a named misconception: off-by-one loop bound, flipped comparator,
missing pointer advance, wrong partition boundary, premature `mark-sorted`.
New `src/game/mutants/`. Mutants that produce a step identical to the correct
answer are discarded, not shown. Fixes the §2.3 distractor bias.

### Item 1 — Algorithm-vs-algorithm diffing

Run two canonical algorithms on the same input side by side and mark divergence.
`getDefaultInput` already keys off algorithm *type*, so any two sorting algorithms
receive byte-identical input for free; `VisualizerCanvas` already dispatches.

Needs: `runSteps(entry, inputOverride)`, a pair picker, a side-by-side route with
shared transport controls.

**Decide the alignment axis before building any UI** — step *i* on the left is not
the same moment as step *i* on the right. Options: align on *n*-th comparison
(needs Item 0), on *n*-th array mutation, or two independent clocks. This choice
determines the data model, not just the visuals.

### Item 3 — Weakness map at step granularity

Track *which kind of step* a learner mispredicts. Record `{ opKind, algorithmType,
wasCorrect }` per answer; surface a weakness panel and bias question selection
toward weak op kinds.

**Constraint:** target Test Yourself (practice) **only**, never `/daily`. The daily
challenge is deterministically seeded so every visitor gets the same question —
personalizing it would break leaderboard fairness.

**Open decision:** weakness stats client-writable (cheap, no deploy; a user can
only forge their own profile) vs function-written (consistent with XP, costs a
deploy). Recommendation: client-writable, under a key leaderboard queries never
read. Revisit if weakness ever earns XP.

### Explicitly dropped — user-code diffing

Tracing the learner's own submission is blocked by architecture: the IDE is a
cross-origin OneCompiler `<iframe>` and nothing crosses back — no source, no
output, no trace. Delivering it means replacing the execution model entirely
(Pyodide ~6 MB wasm for Python; Java not viable client-side; Piston is dead;
running untrusted code in Cloud Functions is a security problem worth avoiding).
Item 1 delivers most of the pedagogical payoff for a fraction of the cost.

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
  widen the input shapes before trusting it.
