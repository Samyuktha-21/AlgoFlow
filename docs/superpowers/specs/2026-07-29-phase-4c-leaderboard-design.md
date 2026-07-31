# Phase 4c — Verified Leaderboard — Design Spec

**Date:** 2026-07-29 · **Amended:** 2026-07-31
**Status:** Implemented; deploy pending (Blaze).
**Depends on:** Phase 4a (`/daily`, streak logic), Phase 3b (`useAuth`, `users/{uid}`), Firebase project `algoflow-d499d`.
**Roadmap:** final slice of Phase 4 (engagement loop). This is the first feature to add a **backend** (Cloud Functions) — a deliberate departure from the prior "no backend" constraint, approved by the user.

---

## ⚠️ Amendment (2026-07-31) — supersedes the daily-only design below

The board was reworked from "daily-only, server-verified" into a **server-authoritative total-XP** model. Where this amendment conflicts with §1–§9, the amendment wins.

**What changed and why:** the user chose to (a) keep Cloud Functions on the **Blaze** plan, (b) make **all** XP unspoofable (not just the board), and (c) score the board by **total XP (daily + quiz + practice)**.

1. **All XP is now server-authoritative.** Three callables own every XP write: `recordDailyCompletion`, `recordQuizXp`, `recordSolved` (`functions/index.js`; pure math in `functions/logic.js`). `firestore.rules` now **denies the client any XP-field write** on `users/{uid}` (client may write only profile + `learned`/`bookmarks`). This closes the old "edit your own `users/{uid}` XP in the console" hole that 4a/4b left open.
2. **Board score = total XP** = `solvedCount·15 + dailyCount·20 + quizXp` (matches `src/utils/xp.computeXp`). Decision §2's `dailyCount·20 + longestStreak·10` is retired.
3. **One source of truth (kills the dual-write clash).** Each callable, in one transaction, writes the canonical `users/{uid}` XP fields **and** mirrors the public subset (+ `score`, `xp`) to `leaderboard/{uid}`. The old 4a `updateEngagement` client write and the Daily.jsx dual `completeDaily()` + `recordDailyCompletion()` path are gone.
4. **UTC everywhere.** The client uses `utcDateStr()` for the daily challenge + done-check so it agrees with the server's UTC stamping (removes the §6 cross-midnight off-by-one).
5. **Anti-farm caps** (in `functions/logic.js`): 1 daily/UTC-day, quiz 100 XP/day, 30 new solves/UTC-day.
6. **Unchanged residual:** the daily answer + the random quiz are still **not** re-verified server-side (needs the `src/game` engine ported into functions) — those XP sources are rate-capped self-reports. Practice "solved" is inherently self-reported (external judges).

**Data model (amended):**
```
leaderboard/{uid}: { displayName, photoURL, score(=xp), xp, dailyCount,
                     currentStreak, longestStreak, updatedAt }   // Function-written only
users/{uid}: profile + learned/bookmarks (client)  +  server-only XP fields:
             solved{}, solvedCount, solvedToday, solvedDate,
             dailyCount, currentStreak, longestStreak, lastDailyDate,
             quizXp, quizXpToday, quizXpDate, xp
```
**Tests:** `scripts/test-functions-logic.mjs` (streak/quiz-cap/solve-cap/score) + `scripts/test-leaderboard.mjs` (score = total XP) + `scripts/test-xp.mjs` (`utcDateStr`).

**Deploy (unchanged, Blaze):** `cd functions && npm install && firebase deploy --only functions,firestore:rules`. Deploy functions **and** rules together — rules lock XP fields, so if the functions aren't live, XP earning fails closed.

---

## Original 2026-07-29 design (historical — see amendment above)

## 1. Goal

A **public leaderboard** at `/leaderboard` ranks players by daily-challenge performance. Unlike the personal XP in 4a/4b (client-written, only trusted for the owner's own view), the leaderboard score is **written only by a Cloud Function**, so it cannot be forged from the browser.

## 2. Locked decisions

1. **Score integrity via server-only writes.** A new public `leaderboard/{uid}` collection is **read-only to clients** (`allow write: if false`); the sole writer is the Admin-SDK Cloud Function `recordDailyCompletion`. The "just write `dailyCount: 9999`" attack is structurally impossible — there is no client write path.
2. **Score = server-verified daily signals only:** `score = dailyCount×20 + longestStreak×10`. Quiz/practice XP is client-written and **excluded** from the public board (untrusted). The board measures consistency, which the server can verify.
3. **Server owns the truth for the board.** The function stamps the date **server-side (UTC)**, recomputes the streak from its own `leaderboard/{uid}.lastDailyDate`, and runs in a transaction → idempotent, one credit/day, streak un-inflatable. The client's personal `users/{uid}` streak (4a) is independent and stays client-written.
4. **Identity from the token.** `displayName`/`photoURL` come from the verified auth token (`request.auth.token`), never from client input. This is the same name/avatar already public on discussions — no new PII exposure.
5. **v1 does not verify the answer.** Re-deriving today's challenge server-side needs the `src/game` engine ported into functions (it uses Vite `import.meta.glob`). v1 caps to one credit/day (defeats bulk inflation); showing up daily without truly solving is low-value and left as a documented follow-up (v2).
6. **Timezone:** leaderboard day = UTC; the personal 4a daily = device-local. A rare cross-midnight off-by-one is acceptable (consistent with 4a §2.3).

## 3. Data model

New public collection (Function-written only):

```
leaderboard/{uid}: {
  displayName, photoURL,          // from auth token
  dailyCount, currentStreak, longestStreak,
  lastDailyDate: 'YYYY-MM-DD',    // server UTC
  score,                          // = dailyCount*20 + longestStreak*10
  updatedAt                       // serverTimestamp
}
```

`users/{uid}` (4a) is unchanged.

## 4. Architecture — units and boundaries

### 4.1 `src/utils/leaderboard.js` — pure, unit-tested
- `leaderboardScore({ dailyCount, longestStreak }) → number` — same formula the function uses (kept in sync by hand).
- `rankEntries(entries) → [{ ...entry, rank }]` — sort by score desc (tie-break longestStreak, then dailyCount), standard competition ranking (ties share a rank, next skips). No mutation.

### 4.2 `functions/` — Firebase Cloud Functions (Node 20, v2 API)
- `recordDailyCompletion` (callable, `firebase-functions/v2/https` `onCall`): auth-gated; server UTC date; transactional read-modify-write of `leaderboard/{uid}`; idempotent per day; returns `{ alreadyDone, score, currentStreak }`.
- `firebase.json` gains a `functions` block; `functions/package.json` pins `firebase-admin`/`firebase-functions`.

### 4.3 `src/firebase/leaderboard.js` — client
- `recordDailyCompletion()` — `httpsCallable` wrapper; no-op/`null` when Firebase disabled or on error (fire-and-forget).
- `subscribeToLeaderboard(topN, cb)` — realtime `orderBy('score','desc').limit(topN)`.
- `src/firebase/config.js` now exports `app` (needed for `getFunctions`).

### 4.4 `src/pages/Leaderboard.jsx` — `/leaderboard` route (lazy)
- Subscribes to top 50, ranks via `rankEntries`, renders a medal-tinted ranked list; the signed-in user's own row is highlighted; empty + loading states. Uses `Seo`.

### 4.5 Existing-surface edits
- **`Daily.jsx`** — on a correct daily (signed in) also calls `recordDailyCompletion()` alongside the existing `completeDaily()`.
- **`Header.jsx`** — a "Ranks" (Trophy) nav button → `/leaderboard`, in both clusters.
- **`App.jsx`** — lazy `Leaderboard` import + route.
- **`firestore.rules`** — add the read-only `leaderboard/{uid}` block.

## 5. Security / errors

- **Unforgeable score:** no client write path to `leaderboard/*`; only the Admin SDK writes. Rules `allow read: if true; allow write: if false`.
- **Rate/streak integrity:** server date + transaction + one-credit-per-day; streak from server state.
- **Residual (documented):** answer-correctness not verified server-side in v1 (needs engine port). Client `users/{uid}` XP remains untrusted but is personal-only, never on the board.
- **Errors:** client calls are fire-and-forget with `catch → console.warn`; the board tolerates an empty/failed subscription (renders empty state).

## 6. Deploy (user's step — cannot run in this env)

```
cd functions && npm install
firebase deploy --only functions,firestore:rules   # needs Blaze plan for functions
```

Callable functions require the Blaze (pay-as-you-go) plan. Until deployed, the client call fails gracefully (console.warn, board just stays empty).

## 7. Testing

- **Unit (node, TDD-first):** `scripts/test-leaderboard.mjs` — `leaderboardScore` formula + zero/no-arg; `rankEntries` ordering, competition ranking with ties, tie-break, empty input.
- **Build/lint:** `npm run build` succeeds (`Leaderboard-*.js` chunk); lint at baseline.
- **Manual smoke (post-deploy):** sign in → complete `/daily` → `/leaderboard` shows your row with score; a second same-day completion doesn't double-credit; a second account appears and ranks correctly; signed-out can view the board read-only.
- **Function logic:** the streak/score math mirrors the tested pure util; the transactional handler itself is only verifiable against the emulator/live project (user's step).

## 8. Out of scope (YAGNI)

Server-side answer verification (v2 — engine port); weekly/all-time splits; pagination beyond top 50; anti-abuse beyond one-per-day; friends/following; including quiz/practice XP in the public score.

## 9. File summary

**New:** `src/utils/leaderboard.js`, `scripts/test-leaderboard.mjs`, `src/firebase/leaderboard.js`, `src/pages/Leaderboard.jsx`, `functions/{index.js,package.json,.gitignore}`.
**Edit:** `src/firebase/config.js` (export `app`), `src/pages/Daily.jsx` (call function), `src/components/Layout/Header.jsx` (Ranks nav), `src/App.jsx` (route), `firebase.json` (functions), `firestore.rules` (leaderboard collection).
