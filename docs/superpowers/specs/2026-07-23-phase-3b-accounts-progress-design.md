# Phase 3b — Accounts + Progress — Design Spec

**Date:** 2026-07-23
**Status:** Approved (design)
**Depends on:** existing Google/Firebase Auth (`AuthContext`, `users/{uid}` docs, Firestore `db`).
**Roadmap:** the "Accounts + progress" step from the AlgoFlow 4-phase roadmap; foundation for Phase 4 (engagement loop). Phase 4 items (streaks/XP/badges/leaderboard) are explicitly **out of scope** here.

## 1. Goal

Let a **signed-in** user:
- **Mark an algorithm as learned** and un-mark it.
- **Bookmark** an algorithm and un-bookmark it.
- See a **progress dashboard** (`/profile`): overall %, per-category %, a bookmarks list, and a recently-learned list.
- See **learned/bookmark state inline** while browsing (Category cards + the Algorithm page).

Everything is **gated behind the existing Google sign-in**. There is no anonymous/localStorage state.

## 2. Locked decisions

1. **Gate behind sign-in.** Toggles only act when signed in; signed-out users get a "Sign in to track progress" affordance that triggers `signInWithGoogle()`. No local/anonymous progress, no merge/reconciliation layer.
2. **Data as maps on the existing `users/{uid}` doc** (not subcollections). The learnable set is bounded (~124 implemented algorithms) → one document read loads the entire dashboard, and each toggle is a single field write.
3. **Progress is surfaced in two places:** a dedicated `/profile` dashboard **and** inline indicators on Category cards + the Algorithm page.
4. **Denominator = implemented algorithms only.** Algorithms flagged not-implemented ("Soon") are excluded from both numerator and denominator.
5. **Avatar becomes a dropdown** (Dashboard / Sign out), replacing the current avatar-click-to-logout behavior, so `/profile` is reachable.
6. **Route name is `/profile`.**

## 3. Architecture — units and boundaries

Four new units, each with one purpose, plus edits to existing surfaces.

### 3.1 `src/firebase/progress.js` — Firestore I/O (only)
- `progressKey(categoryId, algorithmId) → \`${categoryId}__${algorithmId}\`` — the map key (mirrors the existing `algoStats/{cat}__{algo}` convention; Firestore field keys can't contain `/` or `.`).
- `subscribeToProgress(uid, cb) → unsubscribe` — one `onSnapshot` on `doc(db,'users',uid)`; calls `cb({ learned, bookmarks })` with the two maps (defaulting to `{}` when absent). Returns a no-op unsubscribe when `db`/uid is falsy.
- `setLearned(uid, key, on)` / `setBookmark(uid, key, on)` — `updateDoc` setting `\`learned.${key}\`` to `serverTimestamp()` when `on`, or `deleteField()` when `off`. Same for `bookmarks`. Falls back to `setDoc(..., {merge:true})` if the doc doesn't exist yet (defensive; AuthContext normally creates it at sign-in).
- Depends on: `../firebase/config` (`db`), `firebase/firestore`.

### 3.2 `src/utils/progressStats.js` — pure compute (testable)
- `computeProgress(learned, categories, registry) → { overall:{learned,total,pct}, byCategory:{ [catId]:{learned,total,pct} } }`.
  - `total` per category = count of **implemented** algorithms in `registry[catId]`.
  - `learned` per category = number of implemented algorithms whose `progressKey` is present in the `learned` map.
  - `pct` = `total ? Math.round(learned/total*100) : 0`.
  - `overall` sums across all categories.
- No React, no Firestore — pure function of its inputs. Unit-tested via a node script.
- Depends on: nothing (inputs are passed in).

### 3.3 `src/context/ProgressContext.jsx` — reactive state
- Depends on `useAuth()` (for `user.uid`) and `progress.js`.
- On `user` change: if signed in, `subscribeToProgress(uid, …)` into state; else clear to empty maps. Cleans up the previous subscription.
- Exposes:
  ```
  { learned, bookmarks, loading,
    isLearned(catId, algoId), isBookmarked(catId, algoId),
    toggleLearned(catId, algoId), toggleBookmark(catId, algoId) }
  ```
- `toggle*` are **no-ops when signed out** (UI gates before calling, but the guard is defensive). They call `setLearned/setBookmark` and let the snapshot reconcile state — no optimistic mutation.
- When `firebaseEnabled === false`: empty maps, everything inert (mirrors `AuthContext`).
- Provider is mounted in `App.jsx` **inside** `<AuthProvider>`.

### 3.4 `src/pages/Profile.jsx` — the dashboard (`/profile`, lazy)
- Signed out → a centered sign-in CTA (`signInWithGoogle`).
- Signed in → header (avatar, name), an **overall progress** bar/ring (`overall.pct`), a **per-category** list of progress bars (from `byCategory`, using existing category names/themes), a **Bookmarks** list (links to `/algorithm/{cat}/{algo}`), and a **Recently learned** list (learned entries sorted by timestamp desc, top ~10). Uses `Seo`.
- Reads everything from `ProgressContext` + `categories.json`/`algorithmRegistry.json` + `progressStats`. No direct Firestore reads.
- **No page-view telemetry.** A `profileViews` counter would write a new key to `stats/site`, which the deployed `siteKeysOk()` whitelist rejects (see §6) — not worth a rules deploy for a vanity metric.

### 3.5 Edits to existing surfaces
- **`src/pages/Algorithm.jsx`** (title row, beside the Practice/Share buttons): a **learned toggle** ("✓ Learned" active / "Mark as learned" inactive) and a **bookmark star** toggle. Signed out → a single "Sign in to track progress" button calling `signInWithGoogle`. Reads/writes via `ProgressContext`.
- **`src/pages/Category.jsx`** (`AlgoCard`): a small **learned check** and **bookmark star** badge when the current user has that state — read-only, from `ProgressContext`. Signed-out users see none.
- **`src/components/Layout/Header.jsx`**: replace avatar-click-logout with a small **dropdown** — **Dashboard** (`/profile`) and **Sign out** (`logout`). Closes on outside-click/Escape.
- **`src/App.jsx`**: wrap children in `<ProgressProvider>` inside `<AuthProvider>`; add lazy `const Profile = lazy(() => import('./pages/Profile'))` and `<Route path="/profile" element={<Profile />} />`.

## 4. Data model

On the existing `users/{uid}` document (alongside `name/email/avatar/joinedAt/role/...`):
```
learned:   { "graphs__bfs": <serverTimestamp>, "sorting__quickSort": <serverTimestamp>, ... }
bookmarks: { "arrays__maximumSubarray": <serverTimestamp>, ... }
```
- Key = `progressKey(categoryId, algorithmId)`.
- Value = `serverTimestamp()` (enables recency ordering). Un-marking uses `deleteField()`.
- Coexists with `AuthContext`'s `setDoc(..., {merge:true})` sign-in writes (disjoint keys).

## 5. Data flow

1. Sign in → `AuthContext` sets `user` → `ProgressContext` subscribes to `users/{uid}` → `learned`/`bookmarks` populate.
2. Toggle learned on the Algorithm page → `setLearned(uid, key, true)` → Firestore field write → `onSnapshot` fires → Algorithm page button, Category card badge, and `/profile` percentages all update reactively.
3. Sign out → subscription torn down, maps cleared, inline indicators and toggles revert to the signed-out state.

## 6. Security rules

**No change required for this phase's features.** The existing rule
```
match /users/{userId} { allow read, write: if request.auth != null && request.auth.uid == userId; }
```
already restricts read/write of `users/{uid}` (and therefore `learned`/`bookmarks`) to the owner. Progress data is inherently private; no public read path exists or is needed this phase (a Phase 4 leaderboard would denormalize public aggregates separately). We will **not** deploy a rules change.

## 7. Error handling & edge cases

- **Firestore write fails:** `catch → console.warn`; the `onSnapshot` remains the source of truth, so UI stays consistent (the toggle simply doesn't "stick" and can be retried).
- **Signed out:** toggles render as a sign-in prompt; `toggle*` guard is a no-op even if called.
- **`firebaseEnabled === false`** (no config, e.g. local without env): context inert, inline indicators hidden, `/profile` shows the sign-in CTA — no crashes (mirrors `AuthContext`).
- **User doc missing** when a toggle fires: `setDoc(..., {merge:true})` creates the field.
- **Not-implemented algorithms:** excluded by `progressStats`; the Algorithm page only renders for implemented algorithms already, so toggles never target "Soon" entries.

## 8. Testing

- **Unit (node, TDD-first like Phase 3):** `scripts/test-progress-stats.mjs` — verifies `computeProgress` counts/percentages (implemented-only denominator, empty map → 0, full category → 100, cross-category overall) and `progressKey` round-trip. Prints `OK test-progress-stats`.
- **Build:** `npm run build` succeeds; `Profile-*.js` chunk is code-split.
- **Lint:** `npm run lint` introduces no new errors over the ~36-problem baseline.
- **Manual smoke:** sign in → mark learned + bookmark on an Algorithm page → see the check/star on the Category grid and the % move on `/profile` → un-mark reverts everywhere → avatar dropdown reaches Dashboard and signs out → signed-out Algorithm page shows the sign-in prompt.

## 9. Out of scope (YAGNI)

Streaks / XP / badges / daily challenge / leaderboard (Phase 4); public or shareable profiles; account settings or deletion UI; per-algorithm notes; localStorage/anonymous progress; any Firestore rules deployment; profile-view telemetry.

## 10. File summary

**New:** `src/firebase/progress.js`, `src/utils/progressStats.js`, `src/context/ProgressContext.jsx`, `src/pages/Profile.jsx`, `scripts/test-progress-stats.mjs`.
**Edit:** `src/App.jsx`, `src/components/Layout/Header.jsx`, `src/pages/Algorithm.jsx`, `src/pages/Category.jsx`.
**Unchanged:** `firestore.rules`.

## 11. Related finding (not part of this phase)

During design review we found that Phase 3's `recordPracticeView()` (`stats.js`) writes a `practiceViews` field to `stats/site`, but the deployed `siteKeysOk()` whitelist doesn't list it — so those writes are silently rejected by the rules (swallowed by `bump`'s `catch`). This is a pre-existing Phase 3 bug, tracked separately (PR #1 is still open). Fix options: add `practiceViews` to the `siteKeysOk()`/`isOne`/`bumpsBy1` lists **and deploy rules**, or drop the counter. Not addressed here to keep Phase 3b free of rules changes.
