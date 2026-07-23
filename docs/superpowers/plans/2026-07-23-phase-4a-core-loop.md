# Phase 4a — Core Loop (XP + Streaks + Daily) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Signed-in users get a deterministic quiz-of-the-day at `/daily` that earns XP and advances a daily streak; XP also comes from `/play` correct answers (capped) and self-marking practice problems solved, all shown in the header and on `/profile`.

**Architecture:** A pure `xp.js` (XP math + streak transitions) and a pure-seeded `dailyChallenge.js` feed an extended `ProgressContext` (same single `users/{uid}` subscription as Phase 3b). XP is **derived** from durable counts plus one capped quiz accumulator, so nothing but the daily-capped quiz XP can be farmed. No backend, no rules change.

**Tech Stack:** React 19, react-router-dom 7, lucide-react, Firebase Firestore, existing `src/game/*` quiz engine (generators already accept an injectable `rng`), inline styles + `--chrome-*`/`--page-*` vars, Vite 8, node `node:assert` tests.

## Global Constraints

- **Spec:** `docs/superpowers/specs/2026-07-23-phase-4a-core-loop-design.md`.
- **Gate:** XP/streak writes require sign-in; signed-out may *attempt* `/daily` but nothing records. Toggles/actions are no-ops when signed out.
- **XP model:** `totalXp = solvedCount*15 + dailyCount*20 + quizXp`. Quiz XP: **+5 per correct `/play` answer, capped 100/day**. Daily completion: `dailyCount++` (once/day). Practice: `solved` set (self-mark).
- **Streak:** advances only on daily completion; **device-local date** (`YYYY-MM-DD`). `nextStreak`: same-day → `alreadyDone`; yesterday → `+1`; else → reset `1`.
- **Data:** new fields on owner-only `users/{uid}` — `solved{}`, `dailyCount`, `currentStreak`, `longestStreak`, `lastDailyDate`, `quizXp`, `quizXpDate`, `quizXpToday`. **No `firestore.rules` change. No `stats/site` counters.**
- **Determinism:** the daily challenge is the same for everyone on a date and stable on reload (date-seeded PRNG threaded into the existing generators).
- **Lint:** no new errors over the post-3b baseline (~38). Build: `npm run build`. Node tests: `node scripts/<name>.mjs` prints `OK ...`.
- **Commits:** plain messages, **no Co-Authored-By/Claude attribution**.

---

### Task 1: XP + streak pure util + unit test

**Files:**
- Create: `src/utils/xp.js`
- Test: `scripts/test-xp.mjs`

**Interfaces:**
- Produces: `computeXp({solvedCount,dailyCount,quizXp})`, `levelForXp(xp)`, `xpToNext(xp)`, `dateStr(date=new Date())`, `nextStreak(lastDailyDate,todayStr,currentStreak,longestStreak) → {currentStreak,longestStreak,alreadyDone}`, `addCappedQuizXp(quizXp,quizXpToday,quizXpDate,todayStr,amount=5,cap=100) → {quizXp,quizXpToday,quizXpDate,awarded}`.

- [ ] **Step 1: Write the failing test** — `scripts/test-xp.mjs`

```js
import assert from 'node:assert'
import { computeXp, levelForXp, xpToNext, dateStr, nextStreak, addCappedQuizXp } from '../src/utils/xp.js'

// computeXp
assert.strictEqual(computeXp({ solvedCount: 2, dailyCount: 3, quizXp: 25 }), 115) // 30+60+25
assert.strictEqual(computeXp({}), 0)

// levels
assert.strictEqual(levelForXp(0), 1)
assert.strictEqual(levelForXp(115), 2)
assert.strictEqual(levelForXp(250), 3)
assert.deepStrictEqual(xpToNext(115), { inLevel: 15, needed: 100, pct: 15 })

// dateStr — local components, tz-stable
assert.strictEqual(dateStr(new Date(2026, 6, 23)), '2026-07-23')
assert.strictEqual(dateStr(new Date(2026, 0, 5)), '2026-01-05')

// nextStreak
assert.deepStrictEqual(nextStreak('2026-07-23', '2026-07-23', 3, 5), { currentStreak: 3, longestStreak: 5, alreadyDone: true })
assert.deepStrictEqual(nextStreak('2026-07-22', '2026-07-23', 3, 5), { currentStreak: 4, longestStreak: 5, alreadyDone: false })
assert.deepStrictEqual(nextStreak('2026-07-22', '2026-07-23', 5, 5), { currentStreak: 6, longestStreak: 6, alreadyDone: false })
assert.deepStrictEqual(nextStreak('2026-07-20', '2026-07-23', 9, 9), { currentStreak: 1, longestStreak: 9, alreadyDone: false })
assert.deepStrictEqual(nextStreak('', '2026-07-23', 0, 0), { currentStreak: 1, longestStreak: 1, alreadyDone: false })

// addCappedQuizXp
assert.deepStrictEqual(addCappedQuizXp(0, 0, '', '2026-07-23'), { quizXp: 5, quizXpToday: 5, quizXpDate: '2026-07-23', awarded: 5 })
assert.deepStrictEqual(addCappedQuizXp(300, 100, '2026-07-22', '2026-07-23'), { quizXp: 305, quizXpToday: 5, quizXpDate: '2026-07-23', awarded: 5 }) // rollover resets counter
assert.deepStrictEqual(addCappedQuizXp(100, 100, '2026-07-23', '2026-07-23'), { quizXp: 100, quizXpToday: 100, quizXpDate: '2026-07-23', awarded: 0 }) // at cap
assert.deepStrictEqual(addCappedQuizXp(100, 98, '2026-07-23', '2026-07-23'), { quizXp: 102, quizXpToday: 100, quizXpDate: '2026-07-23', awarded: 2 }) // partial at edge

console.log('OK test-xp')
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/test-xp.mjs`
Expected: FAIL — `Cannot find module '.../src/utils/xp.js'`.

- [ ] **Step 3: Write the implementation** — `src/utils/xp.js`

```js
/* Pure XP + streak math for the Phase 4a engagement loop. No React, no
   Firestore, no ambient clock in the logic — dates are passed in as
   'YYYY-MM-DD' strings so everything is deterministic and unit-testable.
   totalXp = solvedCount*15 + dailyCount*20 + quizXp. See the 4a design spec. */

export function computeXp({ solvedCount = 0, dailyCount = 0, quizXp = 0 } = {}) {
  return solvedCount * 15 + dailyCount * 20 + quizXp
}

export function levelForXp(xp) {
  return Math.floor((xp || 0) / 100) + 1
}

export function xpToNext(xp) {
  const inLevel = (xp || 0) % 100
  return { inLevel, needed: 100, pct: inLevel }
}

/* Local-date 'YYYY-MM-DD' (device timezone). Default arg is the only place a
   clock is read; callers in tests pass an explicit Date. */
export function dateStr(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function prevDate(str) {
  const [y, m, d] = str.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() - 1)
  return dateStr(dt)
}

export function nextStreak(lastDailyDate, todayStr, currentStreak, longestStreak) {
  if (lastDailyDate === todayStr) {
    return { currentStreak: currentStreak || 0, longestStreak: longestStreak || 0, alreadyDone: true }
  }
  const consecutive = lastDailyDate === prevDate(todayStr)
  const cur = consecutive ? (currentStreak || 0) + 1 : 1
  return { currentStreak: cur, longestStreak: Math.max(longestStreak || 0, cur), alreadyDone: false }
}

export function addCappedQuizXp(quizXp, quizXpToday, quizXpDate, todayStr, amount = 5, cap = 100) {
  const todayCount = quizXpDate === todayStr ? (quizXpToday || 0) : 0
  const awarded = Math.max(0, Math.min(amount, cap - todayCount))
  return { quizXp: (quizXp || 0) + awarded, quizXpToday: todayCount + awarded, quizXpDate: todayStr, awarded }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node scripts/test-xp.mjs`
Expected: `OK test-xp`

- [ ] **Step 5: Commit**

```bash
git add src/utils/xp.js scripts/test-xp.mjs
git commit -m "feat(engagement): pure XP + streak util + tests"
```

---

### Task 2: Deterministic daily challenge + unit test

**Files:**
- Create: `src/game/dailyChallenge.js`
- Test: `scripts/test-daily-challenge.mjs`

**Interfaces:**
- Consumes (existing): `buildPool/loadEntry/allNames` (`src/game/pool.js`), `runSteps` (`src/game/runSteps.js`), `applicableTypes` (`src/game/session.js`), the 4 generators (each already accepts a trailing `rng` arg).
- Produces: `dailySeed(dateStr) → number`, `mulberry32(seed) → () => number`, `makeDailyChallenge(dateStr, pool, names) → Promise<challenge|null>`.

Note: `makeDailyChallenge` uses Vite-only `import.meta.glob` (via `pool.js`), so the node test covers only the two pure functions; `makeDailyChallenge` is covered by the manual smoke in Task 8.

- [ ] **Step 1: Write the failing test** — `scripts/test-daily-challenge.mjs`

```js
import assert from 'node:assert'
import { dailySeed, mulberry32 } from '../src/game/dailyChallenge.js'

// seed is stable per date and differs across dates
assert.strictEqual(dailySeed('2026-07-23'), dailySeed('2026-07-23'))
assert.notStrictEqual(dailySeed('2026-07-23'), dailySeed('2026-07-24'))

// mulberry32 is deterministic: same seed → same sequence
const a = mulberry32(12345), b = mulberry32(12345)
const seqA = [a(), a(), a()], seqB = [b(), b(), b()]
assert.deepStrictEqual(seqA, seqB)
// values are in [0,1)
for (const v of seqA) assert.ok(v >= 0 && v < 1, `in range: ${v}`)
// different seed → different sequence
const c = mulberry32(999)
assert.notDeepStrictEqual([c(), c(), c()], seqA)

console.log('OK test-daily-challenge')
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/test-daily-challenge.mjs`
Expected: FAIL — cannot find `src/game/dailyChallenge.js`.

- [ ] **Step 3: Write the implementation** — `src/game/dailyChallenge.js`

```js
/* Deterministic "quiz of the day". A date-seeded PRNG drives both the
   (algorithm, challenge-type) pick AND the generators (which already accept a
   trailing rng), so every visitor gets the same question on a given day and it
   is stable across reloads. Mirrors makeChallenge() in TestYourself.jsx. */
import { loadEntry } from './pool'
import { runSteps } from './runSteps'
import { applicableTypes } from './session'
import { generateComplexity } from './challenges/complexity'
import { generateNextOp } from './challenges/nextOp'
import { generateFinalOutput } from './challenges/finalOutput'
import { generateNameAlgorithm } from './challenges/nameAlgorithm'

export function dailySeed(dateStr) {
  let h = 2166136261
  for (let i = 0; i < dateStr.length; i++) {
    h ^= dateStr.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)]

export async function makeDailyChallenge(dateStr, pool, names) {
  if (!pool || !pool.length) return null
  const rng = mulberry32(dailySeed(dateStr))
  // stable ordering so the pick doesn't depend on pool build order
  const ordered = [...pool].sort((x, y) => (x.name < y.name ? -1 : x.name > y.name ? 1 : 0))
  for (let tries = 0; tries < 25; tries++) {
    const pm = pick(rng, ordered)
    const type = pick(rng, applicableTypes(pm))
    const entry = await loadEntry(pm)
    let ch = null
    if (type === 'complexity') {
      ch = generateComplexity(entry, rng)
    } else {
      const steps = runSteps(entry)
      if (steps) {
        if (type === 'nextOp') ch = generateNextOp(entry, steps, rng)
        else if (type === 'finalOutput') ch = generateFinalOutput(entry, steps, rng)
        else if (type === 'nameAlgorithm') ch = generateNameAlgorithm(entry, steps, names, rng)
      }
    }
    if (ch) return ch
  }
  for (const pm of ordered) {
    const ch = generateComplexity(await loadEntry(pm), rng)
    if (ch) return ch
  }
  return null
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node scripts/test-daily-challenge.mjs`
Expected: `OK test-daily-challenge`

- [ ] **Step 5: Commit**

```bash
git add src/game/dailyChallenge.js scripts/test-daily-challenge.mjs
git commit -m "feat(engagement): deterministic daily challenge + tests"
```

---

### Task 3: Firestore helpers + ProgressContext engagement state

**Files:**
- Modify: `src/firebase/progress.js`
- Modify: `src/context/ProgressContext.jsx`

**Interfaces:**
- Consumes: `computeXp`, `levelForXp`, `dateStr`, `nextStreak`, `addCappedQuizXp` (Task 1).
- Produces (from `useProgress()`, added to the existing keys): `xp`, `level`, `currentStreak`, `longestStreak`, `dailyDoneToday`, `solved`, `solvedCount`, `isSolved(id)`, `completeDaily()`, `awardQuizXp()`, `toggleSolved(id)`. New in `progress.js`: `setSolved(uid,id,on)`, `updateEngagement(uid,fields)`; `subscribeToProgress` now also returns the engagement fields.

- [ ] **Step 1: Extend `src/firebase/progress.js`** — replace the `subscribeToProgress` body to surface engagement fields, and add two exports at the end.

Replace the `onSnapshot` callback inside `subscribeToProgress`:

```js
      snap => {
        const d = snap.exists() ? snap.data() : {}
        cb({
          learned: d.learned || {},
          bookmarks: d.bookmarks || {},
          solved: d.solved || {},
          dailyCount: d.dailyCount || 0,
          currentStreak: d.currentStreak || 0,
          longestStreak: d.longestStreak || 0,
          lastDailyDate: d.lastDailyDate || '',
          quizXp: d.quizXp || 0,
          quizXpDate: d.quizXpDate || '',
          quizXpToday: d.quizXpToday || 0,
        })
      },
```

Add at the end of the file (after `setBookmark`):

```js
export function setSolved(uid, problemId, on) { return setField(uid, 'solved', problemId, on) }

/* Direct field update for engagement counters (xp/streak/daily). */
export async function updateEngagement(uid, fields) {
  if (!firebaseEnabled || !db || !uid) return
  const ref = doc(db, 'users', uid)
  try {
    await updateDoc(ref, fields)
  } catch {
    try { await setDoc(ref, fields, { merge: true }) } catch (e) { console.warn('Engagement write failed:', e.message) }
  }
}
```

- [ ] **Step 2: Rewrite `src/context/ProgressContext.jsx`** to carry engagement state + actions:

```jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { subscribeToProgress, setLearned, setBookmark, setSolved, updateEngagement, progressKey } from '../firebase/progress'
import { computeXp, levelForXp, dateStr, nextStreak, addCappedQuizXp } from '../utils/xp'

/* Per-user progress + engagement. One users/{uid} subscription feeds learned/
   bookmarks (Phase 3b) and xp/streak/daily/solved (Phase 4a). Signed out (or
   Firebase disabled) → empty state and no-op actions; the UI gates on `user`. */
const ProgressContext = createContext(null)
const EMPTY = { learned: {}, bookmarks: {}, solved: {}, dailyCount: 0, currentStreak: 0, longestStreak: 0, lastDailyDate: '', quizXp: 0, quizXpDate: '', quizXpToday: 0 }

export function ProgressProvider({ children }) {
  const { user } = useAuth()
  const [data, setData] = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) { setData(EMPTY); setLoading(false); return }
    setLoading(true)
    const unsub = subscribeToProgress(user.uid, (d) => { setData(d); setLoading(false) })
    return () => unsub()
  }, [user])

  const { learned, bookmarks, solved, dailyCount, currentStreak, longestStreak, lastDailyDate, quizXp, quizXpDate, quizXpToday } = data
  const solvedCount = Object.keys(solved).length
  const xp = computeXp({ solvedCount, dailyCount, quizXp })
  const level = levelForXp(xp)
  const dailyDoneToday = !!lastDailyDate && lastDailyDate === dateStr()

  const isLearned    = (c, a) => !!learned[progressKey(c, a)]
  const isBookmarked = (c, a) => !!bookmarks[progressKey(c, a)]
  const isSolved     = (id) => !!solved[id]

  const toggleLearned  = (c, a) => { if (!user) return; setLearned(user.uid, progressKey(c, a), !learned[progressKey(c, a)]) }
  const toggleBookmark = (c, a) => { if (!user) return; setBookmark(user.uid, progressKey(c, a), !bookmarks[progressKey(c, a)]) }
  const toggleSolved   = (id) => { if (!user) return; setSolved(user.uid, id, !solved[id]) }

  const completeDaily = () => {
    if (!user) return
    const today = dateStr()
    const res = nextStreak(lastDailyDate, today, currentStreak, longestStreak)
    if (res.alreadyDone) return
    updateEngagement(user.uid, { dailyCount: dailyCount + 1, currentStreak: res.currentStreak, longestStreak: res.longestStreak, lastDailyDate: today })
  }

  const awardQuizXp = () => {
    if (!user) return
    const res = addCappedQuizXp(quizXp, quizXpToday, quizXpDate, dateStr())
    if (res.awarded <= 0) return
    updateEngagement(user.uid, { quizXp: res.quizXp, quizXpToday: res.quizXpToday, quizXpDate: res.quizXpDate })
  }

  return (
    <ProgressContext.Provider value={{
      learned, bookmarks, solved, loading,
      isLearned, isBookmarked, isSolved,
      toggleLearned, toggleBookmark, toggleSolved,
      xp, level, currentStreak, longestStreak, solvedCount, dailyDoneToday,
      completeDaily, awardQuizXp,
    }}>
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgress = () => {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
```

- [ ] **Step 3: Verify build + lint**

Run: `npm run build` → succeeds.
Run: `npm run lint` → no new errors beyond the existing `ProgressContext.jsx` pattern (set-state-in-effect + react-refresh, same as before — count unchanged).

- [ ] **Step 4: Commit**

```bash
git add src/firebase/progress.js src/context/ProgressContext.jsx
git commit -m "feat(engagement): progress context xp/streak/daily/solved state + writes"
```

---

### Task 4: `/daily` page + route + ChallengeCard tweak

**Files:**
- Modify: `src/components/game/ChallengeCard.jsx` (make the Next button conditional)
- Create: `src/pages/Daily.jsx`
- Modify: `src/App.jsx` (lazy import + route)

**Interfaces:**
- Consumes: `buildPool/allNames` (pool), `makeDailyChallenge` (Task 2), `ChallengeCard`, `useAuth`, `useProgress` (Task 3), `dateStr` (Task 1).

- [ ] **Step 1: Make the Next button optional in `ChallengeCard.jsx`** — wrap it so it only renders when `onNext` is provided. Replace the button (lines 94–98):

```jsx
          {onNext && (
            <button type="button" onClick={onNext}
              style={{ marginTop: 14, padding: '10px 22px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#f5811f,#ff5722)', color: '#000', fontWeight: 700, fontSize: 14 }}>
              Next →
            </button>
          )}
```

(`/play` always passes `onNext`, so it is unchanged; `/daily` omits it.)

- [ ] **Step 2: Write the page** — `src/pages/Daily.jsx`

```jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Flame } from 'lucide-react'
import Seo from '../components/Seo'
import ChallengeCard from '../components/game/ChallengeCard'
import { buildPool, allNames } from '../game/pool'
import { makeDailyChallenge } from '../game/dailyChallenge'
import { dateStr } from '../utils/xp'
import { useAuth } from '../context/AuthContext'
import { useProgress } from '../context/ProgressContext'

/* Quiz of the day: a deterministic challenge for today. A correct answer (when
   signed in) completes the daily → +20 XP and advances the streak. Signed-out
   users can attempt it but nothing is recorded. See the Phase 4a design spec. */
export default function Daily() {
  const { user, signInWithGoogle } = useAuth()
  const { dailyDoneToday, currentStreak, xp, completeDaily } = useProgress()
  const [challenge, setChallenge] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answered, setAnswered] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  useEffect(() => {
    let live = true
    ;(async () => {
      const pool = buildPool([])
      const ch = await makeDailyChallenge(dateStr(), pool, allNames(pool))
      if (live) { setChallenge(ch); setLoading(false) }
    })()
    return () => { live = false }
  }, [])

  const onSelect = (i) => {
    if (answered) return
    setSelectedIndex(i)
    setAnswered(true)
    if (challenge?.options[i]?.isCorrect && user && !dailyDoneToday) completeDaily()
  }
  const retry = () => { setAnswered(false); setSelectedIndex(-1) }

  const correct = answered && challenge?.options[selectedIndex]?.isCorrect
  const done = dailyDoneToday || correct

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)' }}>
      <Seo title="Daily Challenge" description="Solve today's algorithm quiz challenge, earn XP, and keep your streak going on AlgoFlow." />
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '1.5rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 16, color: 'var(--chrome-text-muted)' }}>
          <Link to="/" style={{ color: 'var(--chrome-text-muted)', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={12} />
          <span style={{ fontWeight: 600, color: 'var(--chrome-text)' }}>Daily Challenge</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Flame size={24} style={{ color: '#fb923c' }} />
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--chrome-text)', margin: 0 }}>Daily Challenge</h1>
        </div>
        <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 18px' }}>
          One quiz question a day — same for everyone. {user ? `🔥 ${currentStreak}-day streak · ${xp} XP` : ''}
        </p>

        {!user && (
          <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 12, background: 'rgba(245,129,31,0.1)', border: '1px solid rgba(245,129,31,0.3)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: 'var(--chrome-text)' }}>Sign in to earn XP and keep your streak.</span>
            <button type="button" onClick={signInWithGoogle} style={{ marginLeft: 'auto', padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#f5811f', color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: 'inherit' }}>
              Sign in
            </button>
          </div>
        )}

        {dailyDoneToday ? (
          <DonePanel currentStreak={currentStreak} />
        ) : loading || !challenge ? (
          <div className="flex items-center justify-center" style={{ minHeight: 280 }}>
            <div className="w-8 h-8 border-[3px] border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <ChallengeCard challenge={challenge} answered={answered} selectedIndex={selectedIndex} onSelect={onSelect} />
            {answered && !correct && (
              <button type="button" onClick={retry}
                style={{ marginTop: 14, padding: '10px 22px', borderRadius: 10, border: '1px solid var(--page-border)', cursor: 'pointer', background: 'var(--page-surface-2)', color: 'var(--chrome-text)', fontWeight: 700, fontSize: 14 }}>
                Try again
              </button>
            )}
            {correct && <div style={{ marginTop: 14 }}><DonePanel currentStreak={currentStreak} justEarned={!!user} /></div>}
          </>
        )}
      </div>
    </div>
  )
}

function DonePanel({ currentStreak, justEarned }) {
  return (
    <div style={{ padding: '18px 20px', borderRadius: 14, background: 'var(--page-surface)', border: '1px solid rgba(52,211,153,0.4)' }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--chip-green-text)', marginBottom: 6 }}>✓ Daily complete!</div>
      <p style={{ fontSize: 14, color: 'var(--chrome-text-muted)', margin: 0 }}>
        {justEarned ? '+20 XP · ' : ''}🔥 {currentStreak}-day streak. Come back tomorrow for the next one.
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Register the route in `src/App.jsx`** — lazy import after the `Practice` line:

```jsx
const Daily          = lazy(() => import('./pages/Daily'))
```

Route after the `/practice` route:

```jsx
            <Route path="/daily" element={<Daily />} />
```

- [ ] **Step 4: Verify build + lint**

Run: `npm run build` → succeeds; a `Daily-*.js` chunk is present.
Run: `npm run lint` → no new errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/game/ChallengeCard.jsx src/pages/Daily.jsx src/App.jsx
git commit -m "feat(engagement): /daily quiz-of-the-day page + route"
```

---

### Task 5: Award capped quiz XP on `/play`

**Files:**
- Modify: `src/pages/TestYourself.jsx`

**Interfaces:**
- Consumes: `useProgress().awardQuizXp` (Task 3).

- [ ] **Step 1: Import the hook** — add after the challenge-generator imports (~line 13):

```jsx
import { useProgress } from '../context/ProgressContext'
```

- [ ] **Step 2: Call it on a correct answer** — inside the `TestYourself` component, read the hook near the other `useState`s (after line 44):

```jsx
  const { awardQuizXp } = useProgress()
```

Then in `onSelect`, award XP when the answer is correct (the no-op-when-signed-out and daily-cap guards live in the context):

```jsx
  const onSelect = (i) => {
    if (answered) return
    setSelectedIndex(i)
    setAnswered(true)
    const isCorrect = !!challenge.options[i]?.isCorrect
    if (isCorrect) awardQuizXp()
    setSession(s => recordType(scoreAnswer(s, isCorrect), challenge.type, isCorrect))
  }
```

- [ ] **Step 3: Verify build + lint**

Run: `npm run build` → succeeds.
Run: `npm run lint` → no new errors in `TestYourself.jsx`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/TestYourself.jsx
git commit -m "feat(engagement): award capped quiz XP on correct answers"
```

---

### Task 6: Practice "Solved" toggle

**Files:**
- Modify: `src/components/practice/PracticeProblemList.jsx`

**Interfaces:**
- Consumes: `useAuth` (`user`, `signInWithGoogle`), `useProgress` (`isSolved`, `toggleSolved`), lucide `CheckCircle2`.

- [ ] **Step 1: Add imports** — update the top of `PracticeProblemList.jsx`:

```jsx
import { useMemo } from 'react'
import { ExternalLink, CheckCircle2 } from 'lucide-react'
import categories from '../../data/categories.json'
import registry from '../../data/algorithmRegistry.json'
import { practiceProblems } from '../../data/practiceProblems'
import { filterProblems } from '../../utils/practiceFilter'
import { useAuth } from '../../context/AuthContext'
import { useProgress } from '../../context/ProgressContext'
```

- [ ] **Step 2: Read the hooks** — at the top of the component body (after the `active` useMemo, ~line 26):

```jsx
  const { user, signInWithGoogle } = useAuth()
  const { isSolved, toggleSolved } = useProgress()
```

- [ ] **Step 3: A solved check in each list row** — inside the row, immediately before the `<a href={p.url}...>` source link (~line 66), add:

```jsx
              {isSolved(p.id) && <CheckCircle2 size={14} style={{ color: '#22c55e', flexShrink: 0 }} />}
```

- [ ] **Step 4: A "Solved" toggle in the NOW SOLVING header** — in the active-problem panel header row, immediately before the "Open on {source}" link (the `<a>` with `marginLeft: 'auto'`, ~line 81), insert a button and change that `<a>`'s `marginLeft: 'auto'` to `marginLeft: 4`:

```jsx
            {user ? (
              <button type="button" onClick={() => toggleSolved(active.id)}
                style={{
                  marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  color: isSolved(active.id) ? '#065f46' : 'var(--chrome-text-muted)',
                  background: isSolved(active.id) ? 'rgba(34,197,94,0.16)' : 'var(--page-surface-2)',
                  border: `1px solid ${isSolved(active.id) ? 'rgba(34,197,94,0.5)' : 'var(--page-border)'}`,
                }}>
                <CheckCircle2 size={13} /> {isSolved(active.id) ? 'Solved' : 'Mark solved'}
              </button>
            ) : (
              <button type="button" onClick={signInWithGoogle}
                style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--chrome-text-muted)', background: 'var(--page-surface-2)', border: '1px solid var(--page-border)' }}>
                Sign in to track
              </button>
            )}
            <a href={active.url} target="_blank" rel="noopener noreferrer"
              style={{ marginLeft: 4, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#fdba74', textDecoration: 'none' }}>
              Open on {active.source} <ExternalLink size={12} />
            </a>
```

(This replaces the existing single `<a ...>Open on {active.source}...</a>` block in that header row.)

- [ ] **Step 5: Verify build + lint**

Run: `npm run build` → succeeds.
Run: `npm run lint` → no new errors in `PracticeProblemList.jsx`.

- [ ] **Step 6: Commit**

```bash
git add src/components/practice/PracticeProblemList.jsx
git commit -m "feat(engagement): practice 'Solved' toggle"
```

---

### Task 7: Header streak/XP entry + Profile engagement stats

**Files:**
- Modify: `src/components/Layout/Header.jsx`
- Modify: `src/pages/Profile.jsx`

**Interfaces:**
- Consumes: `useProgress` (`currentStreak`, `xp`, `level`, `longestStreak`, `solvedCount`), `useAuth` (`user`), lucide `Flame`, `xpToNext` (Task 1).

- [ ] **Step 1: Header — imports** — add `Flame` to the lucide import and `useProgress`:

```jsx
import { Zap, MessageSquare, Sun, Moon, Gamepad2, Code2, LayoutDashboard, LogOut, ChevronDown, Flame } from 'lucide-react'
import { useProgress } from '../../context/ProgressContext'
```

(Keep the existing `useAuth` import.)

- [ ] **Step 2: Header — a Daily button showing the streak** — in the `Header` default component body, after `const handlePractice = ...` and its `navigate` setup, add a hook read and a button factory. First add near the top of the component (after `const navigate = useNavigate()`):

```jsx
  const { user } = useAuth()
  const { currentStreak } = useProgress()
```

Then, alongside the other `*Btn` factories (after `practiceBtn`), add:

```jsx
  const dailyBtn = (big) => (
    <button type="button" className="nav-btn" onClick={() => navigate('/daily')} style={navBtn(big)}>
      <Flame size={big ? 13 : 12} /> {user && currentStreak > 0 ? `Daily · ${currentStreak}` : 'Daily'}
    </button>
  )
```

- [ ] **Step 3: Header — render it** — add `{dailyBtn(false)}` in the homepage cluster (before `{playBtn(false)}`) and `{dailyBtn(true)}` in the non-homepage cluster (before `{playBtn(true)}`):

Homepage cluster:
```jsx
            {dailyBtn(false)}
            {playBtn(false)}
```

Non-homepage cluster:
```jsx
          {dailyBtn(true)}
          {playBtn(true)}
```

- [ ] **Step 4: Profile — engagement stats block** — in `src/pages/Profile.jsx`, add the import and a stats row above the overall progress bar.

Add to imports:
```jsx
import { computeProgress, splitKey } from '../utils/progressStats'
import { xpToNext } from '../utils/xp'
```
(the `computeProgress, splitKey` line already exists — add the `xpToNext` line after it.)

Read the engagement fields from the hook (the existing destructure is `const { learned, bookmarks } = useProgress()` — extend it):
```jsx
  const { learned, bookmarks, xp, level, currentStreak, longestStreak, solvedCount } = useProgress()
```

Then, immediately before `<ProgressBar pct={overall.pct} label="Overall" big />`, insert an engagement row:
```jsx
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
          <Stat label="Level" value={level} sub={`${xpToNext(xp).inLevel}/100 to next`} />
          <Stat label="Total XP" value={xp} />
          <Stat label="Current streak" value={`🔥 ${currentStreak}`} sub={`longest ${longestStreak}`} />
          <Stat label="Problems solved" value={solvedCount} />
        </div>
```

And add a small `Stat` component next to `ProgressBar`/`ListCard` (module scope):
```jsx
function Stat({ label, value, sub }) {
  return (
    <div style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--page-surface)', border: '1px solid var(--page-border)' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--chrome-text)' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#64748b' }}>{label}{sub ? ` · ${sub}` : ''}</div>
    </div>
  )
}
```

- [ ] **Step 5: Verify build + lint**

Run: `npm run build` → succeeds.
Run: `npm run lint` → no new errors in `Header.jsx` / `Profile.jsx`.

- [ ] **Step 6: Commit**

```bash
git add src/components/Layout/Header.jsx src/pages/Profile.jsx
git commit -m "feat(engagement): header streak/daily entry + profile XP/streak stats"
```

---

### Task 8: Full verification pass

**Files:** none.

- [ ] **Step 1: Run node tests**

Run: `node scripts/test-xp.mjs && node scripts/test-daily-challenge.mjs`
Expected: `OK test-xp` then `OK test-daily-challenge`.

- [ ] **Step 2: Build + lint**

Run: `npm run build` → succeeds; `Daily-*.js` chunk present.
Run: `npm run lint` → total ≈ baseline (~38); no new errors from Phase 4a files.

- [ ] **Step 3: Manual smoke** (`npm run dev`, real Firebase + Google sign-in)

- Signed out: header shows "Daily"; `/daily` renders today's question and is attemptable; a sign-in banner shows; nothing records.
- Sign in → header shows "Daily · N" (streak). `/daily` correct answer → "Daily complete +20 XP", header streak/`/profile` XP update; reload → "done today" + the *same* question.
- `/play` correct answers raise XP (verify it stops after +100 in a day).
- `/practice` → "Mark solved" on a problem → row check + `/profile` solved count and XP rise; unmark reverts.
- `/profile` shows Level / Total XP / streak / solved; sign out hides the header streak and blocks writes.

- [ ] **Step 4: Final commit (only if fixups needed)**

```bash
git add -A
git commit -m "chore(engagement): Phase 4a verification fixups"
```

---

## Self-Review

**1. Spec coverage**

| Spec section | Task |
| --- | --- |
| §2 daily = deterministic quiz-of-day | Task 2, 4 |
| §2 derived+capped XP model | Tasks 1, 3 |
| §2 streak on daily, local date | Tasks 1, 3 |
| §2 placement (header + /daily + /profile) | Tasks 4, 7 |
| §2 signed-out can attempt, writes gated | Tasks 3, 4 |
| §2 no auto-judge → practice self-mark | Task 6 |
| §3 data model on users/{uid} | Task 3 |
| §4.1 xp.js | Task 1 |
| §4.2 dailyChallenge.js | Task 2 |
| §4.3 generator rng | Already present in codebase (no task needed) |
| §4.4 ProgressContext + progress.js | Task 3 |
| §4.5 Daily.jsx | Task 4 |
| §4.6 /play, /practice, Header, Profile, App route | Tasks 4, 5, 6, 7 |
| §6 no rules change | Respected (no `firestore.rules` edit) |
| §7 testing | Tasks 1, 2, 8 |

**2. Placeholder scan:** No TBD/TODO; every code step is complete; commands have expected output. Generator `rng` refactor from the spec (§4.3) is a no-op because the generators already accept `rng` — noted, not silently dropped.

**3. Type consistency:** `computeXp({solvedCount,dailyCount,quizXp})`, `nextStreak(lastDailyDate,todayStr,currentStreak,longestStreak)`, `addCappedQuizXp(quizXp,quizXpToday,quizXpDate,todayStr)`, `dateStr(date)` identical across Task 1 (impl/test), Task 3 (context). `useProgress()` additions (`xp,level,currentStreak,longestStreak,solvedCount,dailyDoneToday,isSolved,toggleSolved,completeDaily,awardQuizXp`) defined in Task 3 and consumed in Tasks 4/5/6/7 with matching names. `makeDailyChallenge(dateStr,pool,names)` defined Task 2, used Task 4. `setSolved(uid,id,on)`/`updateEngagement(uid,fields)` defined Task 3 (progress.js) and used Task 3 (context).
