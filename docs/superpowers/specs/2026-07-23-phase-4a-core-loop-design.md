# Phase 4a — Core Loop: XP + Streaks + Daily Challenge — Design Spec

**Date:** 2026-07-23
**Status:** Approved (design)
**Depends on:** Phase 3b (`ProgressContext`, `users/{uid}` doc, `useAuth`), Phase 2 quiz (`src/game/*`, `ChallengeCard`), Phase 3 practice (`practiceProblems`, `/practice`).
**Roadmap:** first slice of Phase 4 (engagement loop). Badges (4b) and leaderboard (4c) are **out of scope** here.

## 1. Goal

A signed-in user gets a **quiz-of-the-day** at `/daily`; completing it earns **XP** and advances a **daily streak**. XP is also earned from the existing quiz (`/play`) and from self-marking practice problems as solved. XP, level, and streak surface in the header and on `/profile`. No backend, no public data.

## 2. Locked decisions

1. **Daily challenge = quiz-of-the-day**, deterministic from the date (same question for everyone, stable on reload), reusing the Phase 2 quiz generators.
2. **XP is derived from durable state + one capped accumulator** (farm-resistant):
   `totalXp = solvedCount×15 + dailyCount×20 + quizXp`.
   - Practice-solved XP (×15) and daily XP (×20) are **derived** from counts → un-mark/re-mark or re-complete can't farm.
   - `quizXp` is the only accumulator; **+5 per correct `/play` answer, capped at 100 XP/day**.
3. **Streak trigger = completing the daily challenge**, using **device-local date**. No backend; a rare cross-timezone off-by-one is acceptable.
4. **Placement:** streak flame + XP chip in the header (signed in) → links to `/daily`; the daily challenge on its own `/daily` route; XP/level/streak/solved detail on `/profile`.
5. **Signed-out users may attempt** the daily quiz but XP/streak only record when signed in (banner: "Sign in to earn XP and keep your streak"). Consistent with 3b (writes require auth).
6. **No auto-judging.** Live check (2026-07-23) confirmed the public Piston `execute` endpoint is HTTP 401 (whitelist-only since 2026-02-15); Judge0/JDoodle need API keys unsafe to ship in a static frontend. Practice "Solved" is a **self-marked toggle**. Verified judging would require a serverless proxy — a separate future phase.
7. **No Firestore rules change / no new `stats/site` counters.** All new fields live on the owner-only `users/{uid}` doc.

## 3. Data model — extend `users/{uid}` (owner-only; no rules change)

```
// Phase 3b (existing): learned{}, bookmarks{}
solved:       { [problemId]: <serverTimestamp> }   // practice self-solved → practiceXp = size×15
dailyCount:   number                               // daily completions → dailyXp = ×20
currentStreak: number
longestStreak: number
lastDailyDate: 'YYYY-MM-DD'                         // last day daily completed
quizXp:       number                               // capped-accumulated quiz XP
quizXpDate:   'YYYY-MM-DD'                          // day the cap counter applies to
quizXpToday:  number                               // XP already earned from quiz today (cap = 100)
```

`problemId` is the practice problem's unique `id` (e.g. `two-sum`) — no `/` or `.`, safe as a map key.

## 4. Architecture — units and boundaries

### 4.1 `src/utils/xp.js` — pure, unit-tested
- `computeXp({ solvedCount, dailyCount, quizXp }) → number` = `solvedCount*15 + dailyCount*20 + quizXp`.
- `levelForXp(xp) → number` (level = `Math.floor(xp / 100) + 1`).
- `xpToNext(xp) → { inLevel, needed, pct }` for the level bar.
- `nextStreak(lastDailyDate, todayStr, currentStreak, longestStreak) → { currentStreak, longestStreak, alreadyDone }` — `alreadyDone` when `lastDailyDate === todayStr`; consecutive (`lastDailyDate === yesterday`) → `+1`; otherwise reset to `1`; `longestStreak = max(...)`.
- `addCappedQuizXp(quizXp, quizXpToday, quizXpDate, todayStr, amount=5, cap=100) → { quizXp, quizXpToday, quizXpDate, awarded }` — resets the daily counter when the date rolls over, awards `min(amount, cap - quizXpToday)`.
- Depends on: nothing (dates passed in as `'YYYY-MM-DD'` strings; a `dateStr(date)` helper formats local date).

### 4.2 `src/game/dailyChallenge.js` — deterministic daily selection
- `dailySeed(dateStr) → number` — small string hash of `YYYY-MM-DD`.
- `mulberry32(seed) → () => number` — pure seeded PRNG.
- `makeDailyChallenge(dateStr, pool, names) → Promise<challenge>` — seeds a PRNG, deterministically picks one `(entry, challenge-type)` and generates it, threading the seeded `rng` into the generator so the result is identical for a given date. Same shape as `makeChallenge` in `TestYourself.jsx`.
- Depends on: `src/game/pool.js`, `src/game/runSteps.js`, and the generators (§4.3).

### 4.3 Generator `rng` param (small refactor)
`src/game/challenges/{complexity,nextOp,finalOutput,nameAlgorithm}.js` each take an optional `rng = Math.random` and use it wherever they currently call `Math.random()`. Default preserves `/play` behavior exactly; the daily path passes the seeded rng.

### 4.4 Extend `ProgressContext` (one subscription)
`ProgressContext` already subscribes to `users/{uid}`; surface the new fields and actions from the same snapshot:
- Exposes additionally: `xp` (derived via `computeXp`), `level`, `currentStreak`, `longestStreak`, `dailyDoneToday` (`lastDailyDate === today`), `solved` map, `isSolved(problemId)`.
- `completeDaily()` — no-op if `dailyDoneToday` or signed out; else compute `nextStreak(...)`, write `{ dailyCount: dailyCount+1, currentStreak, longestStreak, lastDailyDate: today }`.
- `awardQuizXp()` — no-op if signed out; compute `addCappedQuizXp(...)`, write `{ quizXp, quizXpToday, quizXpDate }` when `awarded > 0`.
- `toggleSolved(problemId)` — add/remove `solved[problemId]` (mirrors `toggleBookmark`; Firestore write via a `setSolved` in `progress.js`).
- New Firestore helpers in `src/firebase/progress.js`: `setSolved(uid, problemId, on)`, `updateEngagement(uid, fields)` (a thin `updateDoc` used by `completeDaily`/`awardQuizXp`).

### 4.5 `src/pages/Daily.jsx` — `/daily` route (lazy)
- Loads the pool, builds today's challenge via `makeDailyChallenge(dateStr(new Date()), pool, names)`, renders it through the existing `ChallengeCard`.
- On a **correct** answer: `completeDaily()` (once/day), then show a "Done for today — streak N 🔥, +20 XP, come back tomorrow" state. If already done today on load, show that state directly.
- Signed out: still renders/attempts the challenge; a banner prompts sign-in and no XP/streak is written.
- Uses `Seo`.

### 4.6 Existing-surface edits
- **`/play` (`TestYourself.jsx` / `ChallengeCard`)** — when a correct answer is scored and the user is signed in, call `awardQuizXp()`. A small "+5 XP (n/100 today)" acknowledgement is optional; the write is the requirement.
- **`/practice` (`PracticeProblemList.jsx`)** — add a "Solved" toggle on the active-problem ("NOW SOLVING") panel → `toggleSolved(problem.id)`; signed-out shows a sign-in prompt. Solved problems also get a small check indicator in the list rows.
- **`Header.jsx`** — when signed in, a compact streak flame (`currentStreak`) + XP/level chip that links to `/daily`. Reuses the existing chrome-var styling.
- **`Profile.jsx`** — an XP/level bar (`xpToNext`), current + longest streak, and solved-problem count, above the existing learned/bookmark sections.
- **`App.jsx`** — lazy `Daily` import + `<Route path="/daily" element={<Daily />} />`.

## 5. Data flow

Sign in → `ProgressContext` snapshot includes engagement fields → header shows streak/XP. Open `/daily` → deterministic challenge renders → correct answer → `completeDaily()` writes `dailyCount`/streak → snapshot updates → header streak flame + `/profile` bar update in real time. A correct `/play` answer → `awardQuizXp()` (capped) → XP updates. Marking a practice problem solved → `toggleSolved()` → solved count (hence XP) updates.

## 6. Security / errors

- **Rules:** unchanged — owner-only `users/{uid}` covers all new fields.
- **Anti-farm:** practice + daily XP are derived from counts/sets; quiz XP capped at 100/day. XP is still client-written (no backend), so it is trustworthy only for the owner's own view — acceptable because there is **no leaderboard in 4a**. Cross-user trust is a 4c concern.
- **Errors:** all writes are fire-and-forget with `catch → console.warn`; the snapshot is the source of truth (same pattern as 3b).
- **Signed out / `firebaseEnabled === false`:** engagement fields empty, actions no-op, header chip hidden, `/daily` still attemptable — no crashes.

## 7. Testing

- **Unit (node, TDD-first):** `scripts/test-xp.mjs` — `computeXp`, `levelForXp`/`xpToNext`, `nextStreak` (same-day `alreadyDone`, consecutive `+1`, gap reset, longest tracking), `addCappedQuizXp` (award, partial award at cap edge, day rollover reset). `scripts/test-daily-challenge.mjs` — `dailySeed` stable per date and `mulberry32` deterministic (same seed → same sequence; the daily pick is stable for a fixed date + pool).
- **Build:** `npm run build` succeeds; `Daily-*.js` chunk code-split.
- **Lint:** no new errors over baseline (~38 post-3b).
- **Manual smoke:** sign in → `/daily` renders today's question → correct answer increments streak + XP (header + `/profile`) → reload shows "done today" and the same question → a correct `/play` answer adds capped XP → mark a practice problem solved → solved count + XP rise; sign out hides the chip and blocks writes.

## 8. Out of scope (YAGNI)

Badges (4b); leaderboard / any public data (4c); learning-based XP; verified auto-judge (needs a serverless proxy — separate phase); per-day completion calendar; timezone configuration; XP-loss/penalties.

## 9. File summary

**New:** `src/utils/xp.js`, `src/game/dailyChallenge.js`, `src/pages/Daily.jsx`, `scripts/test-xp.mjs`, `scripts/test-daily-challenge.mjs`.
**Edit:** `src/game/challenges/{complexity,nextOp,finalOutput,nameAlgorithm}.js` (rng param), `src/firebase/progress.js` (`setSolved`, `updateEngagement`), `src/context/ProgressContext.jsx` (engagement state + actions), `src/pages/TestYourself.jsx` (award quiz XP), `src/components/game/ChallengeCard.jsx` (if the correct-answer hook lives there), `src/components/practice/PracticeProblemList.jsx` (Solved toggle), `src/components/Layout/Header.jsx` (streak/XP chip), `src/pages/Profile.jsx` (XP/streak section), `src/App.jsx` (`/daily` route).
**Unchanged:** `firestore.rules`.
