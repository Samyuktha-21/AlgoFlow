# Phase 3b — Accounts + Progress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a signed-in user mark algorithms as *learned*, *bookmark* them, and see a `/profile` progress dashboard, with learned/bookmark state also shown inline on Category cards and the Algorithm page.

**Architecture:** A pure `progressStats` util (keys + stats math, unit-tested) and a thin `progress.js` Firestore I/O module feed a `ProgressContext` that subscribes to the signed-in user's `users/{uid}` doc. All UI reads from that context; toggles write single map fields and let the snapshot reconcile. Everything is gated behind the existing Google sign-in.

**Tech Stack:** React 19, react-router-dom 7, framer-motion (present), lucide-react icons, Firebase Firestore (`firebase/firestore`), inline styles + existing `--chrome-*`/`--page-*` CSS vars, Vite 8 build, node built-in test scripts (`node:assert`).

## Global Constraints

- **Design spec:** `docs/superpowers/specs/2026-07-23-phase-3b-accounts-progress-design.md` (authoritative).
- **Gate behind sign-in.** Toggles only act when `user` is set; signed-out users get a "Sign in to track progress" affordance calling `signInWithGoogle()`. No anonymous/localStorage state.
- **Data model:** two maps on the existing `users/{uid}` doc — `learned` and `bookmarks` — keyed by `` `${categoryId}__${algorithmId}` `` → `serverTimestamp()`. Un-mark deletes the field via `deleteField()`.
- **Denominator = implemented algorithms only** (`registry[catId]` entries with `implemented === true`).
- **No Firestore rules change** (existing owner-only `users/{uid}` rule already covers it). **No profile-view telemetry** (would need a `stats/site` whitelist change — out of scope).
- **Provider order:** `ProgressProvider` mounts **inside** `AuthProvider` in `src/main.jsx`.
- **Lint:** `npm run lint` must add **no new errors** over the pre-existing baseline (~36 problems). Build: `npm run build`. Node tests: `node scripts/<name>.mjs` prints `OK ...`.
- **Commits:** plain messages, **no `Co-Authored-By` / Claude attribution** (project rule).
- **Integration note (branch off `main`):** Phase 3 (open PR #1, branch `feat/phase-3-practice`) also edits the `Algorithm.jsx` title row and `Category.jsx` `AlgoCard`. Expect a merge conflict in those two spots. Resolution: after PR #1 merges to `main`, rebase `feat/phase-3b-accounts-progress` onto `main` and keep both features' buttons/badges in the shared rows.

---

### Task 1: Pure progress util + unit test

**Files:**
- Create: `src/utils/progressStats.js`
- Test: `scripts/test-progress-stats.mjs`

**Interfaces:**
- Produces:
  - `progressKey(categoryId, algorithmId): string` → `"cat__algo"`
  - `splitKey(key): [categoryId, algorithmId]`
  - `computeProgress(learned, categories, registry): { overall:{learned,total,pct}, byCategory:{ [catId]:{learned,total,pct} } }` — `total`/`learned` count **implemented** algorithms only.

- [ ] **Step 1: Write the failing test** — `scripts/test-progress-stats.mjs`

```js
import assert from 'node:assert'
import { progressKey, splitKey, computeProgress } from '../src/utils/progressStats.js'

// key round-trip
assert.strictEqual(progressKey('graphs', 'bfs'), 'graphs__bfs')
assert.deepStrictEqual(splitKey('graphs__bfs'), ['graphs', 'bfs'])
assert.deepStrictEqual(splitKey(progressKey('linked-lists', 'reverseLinkedList')), ['linked-lists', 'reverseLinkedList'])

const categories = [{ id: 'sorting', name: 'Sorting' }, { id: 'graphs', name: 'Graphs' }]
const registry = {
  sorting: [{ id: 'quickSort', implemented: true }, { id: 'mergeSort', implemented: true }, { id: 'shellSort', implemented: false }],
  graphs:  [{ id: 'bfs', implemented: true }, { id: 'dfs', implemented: true }],
}

// empty → 0; implemented-only denominator (shellSort excluded)
let r = computeProgress({}, categories, registry)
assert.strictEqual(r.overall.total, 4)
assert.strictEqual(r.overall.learned, 0)
assert.strictEqual(r.overall.pct, 0)
assert.strictEqual(r.byCategory.sorting.total, 2)

// a learned key that is NOT implemented must not inflate learned or total
const learned = {
  [progressKey('sorting', 'quickSort')]: 1,
  [progressKey('sorting', 'shellSort')]: 1,
  [progressKey('graphs', 'bfs')]: 1,
}
r = computeProgress(learned, categories, registry)
assert.strictEqual(r.byCategory.sorting.learned, 1)
assert.strictEqual(r.byCategory.sorting.pct, 50)
assert.strictEqual(r.byCategory.graphs.learned, 1)
assert.strictEqual(r.byCategory.graphs.pct, 50)
assert.strictEqual(r.overall.learned, 2)
assert.strictEqual(r.overall.total, 4)
assert.strictEqual(r.overall.pct, 50)

console.log('OK test-progress-stats')
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/test-progress-stats.mjs`
Expected: FAIL — `Cannot find module '.../src/utils/progressStats.js'`.

- [ ] **Step 3: Write the implementation** — `src/utils/progressStats.js`

```js
/* Pure helpers for per-user learning progress. No React, no Firestore — the
   progress maps, categories, and algorithm registry are passed in, so this is
   fully unit-testable. See the Phase 3b design spec §3.2. */

/* Firestore map key for one algorithm. Field keys can't contain '/' or '.',
   so we join with '__' (mirrors the algoStats/{cat}__{algo} convention). */
export function progressKey(categoryId, algorithmId) {
  return `${categoryId}__${algorithmId}`
}

export function splitKey(key) {
  const i = key.indexOf('__')
  return i < 0 ? [key, ''] : [key.slice(0, i), key.slice(i + 2)]
}

/* Given the learned map and the site's categories + registry, compute learned
   counts and percentages. Only algorithms flagged implemented count toward
   either numerator or denominator. */
export function computeProgress(learned, categories, registry) {
  const map = learned || {}
  const byCategory = {}
  let oLearned = 0
  let oTotal = 0
  for (const c of categories) {
    const algos = (registry[c.id] || []).filter(a => a.implemented)
    const total = algos.length
    const learnedCount = algos.filter(a => map[progressKey(c.id, a.id)]).length
    byCategory[c.id] = { learned: learnedCount, total, pct: total ? Math.round((learnedCount / total) * 100) : 0 }
    oLearned += learnedCount
    oTotal += total
  }
  return {
    overall: { learned: oLearned, total: oTotal, pct: oTotal ? Math.round((oLearned / oTotal) * 100) : 0 },
    byCategory,
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node scripts/test-progress-stats.mjs`
Expected: `OK test-progress-stats`

- [ ] **Step 5: Commit**

```bash
git add src/utils/progressStats.js scripts/test-progress-stats.mjs
git commit -m "feat(progress): pure progress-stats util + tests"
```

---

### Task 2: Firestore I/O module

**Files:**
- Create: `src/firebase/progress.js`
- Reads (existing): `src/firebase/config.js` (`db`, `firebaseEnabled`), `src/utils/progressStats.js` (`progressKey`).

**Interfaces:**
- Consumes: `progressKey` (Task 1); `db`, `firebaseEnabled` from config.
- Produces:
  - `subscribeToProgress(uid, cb): () => void` — `cb({ learned, bookmarks })`; returns an unsubscribe (no-op when disabled).
  - `setLearned(uid, key, on): Promise<void>` / `setBookmark(uid, key, on): Promise<void>`.
  - re-exports `progressKey`.

- [ ] **Step 1: Write the module** — `src/firebase/progress.js`

```js
import {
  doc, onSnapshot, updateDoc, setDoc, deleteField, serverTimestamp,
} from 'firebase/firestore'
import { db, firebaseEnabled } from './config'
import { progressKey } from '../utils/progressStats'

export { progressKey }

/* Real-time subscription to the signed-in user's progress maps.
   cb receives { learned, bookmarks } (each defaulting to {}). */
export function subscribeToProgress(uid, cb) {
  if (!firebaseEnabled || !db || !uid) return () => {}
  try {
    return onSnapshot(
      doc(db, 'users', uid),
      snap => {
        const d = snap.exists() ? snap.data() : {}
        cb({ learned: d.learned || {}, bookmarks: d.bookmarks || {} })
      },
      e => console.warn('Progress subscription failed:', e.message),
    )
  } catch (e) {
    console.warn('Progress subscription failed:', e.message)
    return () => {}
  }
}

/* Set or clear one nested map field, e.g. learned["graphs__bfs"].
   updateDoc uses the dotted path; if the user doc doesn't exist yet we
   fall back to a merge create. */
async function setField(uid, field, key, on) {
  if (!firebaseEnabled || !db || !uid) return
  const ref = doc(db, 'users', uid)
  const value = on ? serverTimestamp() : deleteField()
  try {
    await updateDoc(ref, { [`${field}.${key}`]: value })
  } catch {
    try {
      await setDoc(ref, { [field]: { [key]: value } }, { merge: true })
    } catch (e2) {
      console.warn('Progress write failed:', e2.message)
    }
  }
}

export function setLearned(uid, key, on)  { return setField(uid, 'learned', key, on) }
export function setBookmark(uid, key, on) { return setField(uid, 'bookmarks', key, on) }
```

- [ ] **Step 2: Verify it builds & lints**

Run: `npm run build` → Expected: succeeds.
Run: `npm run lint` → Expected: no new errors referencing `progress.js`.
(No unit test: `progressKey` is already covered in Task 1; the rest is Firestore I/O verified by build + the manual smoke in Task 8.)

- [ ] **Step 3: Commit**

```bash
git add src/firebase/progress.js
git commit -m "feat(progress): Firestore I/O for learned/bookmarks maps"
```

---

### Task 3: ProgressContext + provider mount

**Files:**
- Create: `src/context/ProgressContext.jsx`
- Modify: `src/main.jsx` (wrap `<ProgressProvider>` inside `<AuthProvider>`)

**Interfaces:**
- Consumes: `useAuth()` (`user.uid`); `subscribeToProgress`, `setLearned`, `setBookmark`, `progressKey` (Task 2).
- Produces: `useProgress()` → `{ learned, bookmarks, loading, isLearned(c,a), isBookmarked(c,a), toggleLearned(c,a), toggleBookmark(c,a) }`; `ProgressProvider`.

- [ ] **Step 1: Write the context** — `src/context/ProgressContext.jsx`

```jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { subscribeToProgress, setLearned, setBookmark, progressKey } from '../firebase/progress'

/* Per-user learning progress. Subscribes to users/{uid} while signed in and
   exposes learned/bookmark state + toggles. Signed out (or Firebase disabled)
   → empty maps and no-op toggles; the UI gates on `user` before calling. */
const ProgressContext = createContext(null)

export function ProgressProvider({ children }) {
  const { user } = useAuth()
  const [learned, setLearnedMap] = useState({})
  const [bookmarks, setBookmarks] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) { setLearnedMap({}); setBookmarks({}); setLoading(false); return }
    setLoading(true)
    const unsub = subscribeToProgress(user.uid, ({ learned: l, bookmarks: b }) => {
      setLearnedMap(l); setBookmarks(b); setLoading(false)
    })
    return () => unsub()
  }, [user])

  const isLearned    = (c, a) => !!learned[progressKey(c, a)]
  const isBookmarked = (c, a) => !!bookmarks[progressKey(c, a)]

  const toggleLearned = (c, a) => {
    if (!user) return
    const key = progressKey(c, a)
    setLearned(user.uid, key, !learned[key])
  }
  const toggleBookmark = (c, a) => {
    if (!user) return
    const key = progressKey(c, a)
    setBookmark(user.uid, key, !bookmarks[key])
  }

  return (
    <ProgressContext.Provider value={{ learned, bookmarks, loading, isLearned, isBookmarked, toggleLearned, toggleBookmark }}>
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

- [ ] **Step 2: Mount the provider** — in `src/main.jsx`

Add the import after the `AuthProvider` import (line 8):

```jsx
import { ProgressProvider } from './context/ProgressContext.jsx'
```

Wrap `<ProgressProvider>` immediately inside `<AuthProvider>` (it needs `useAuth`). The render becomes:

```jsx
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <ProgressProvider>
          <BeginnerProvider>
            <VisualizationProvider>
              <App />
            </VisualizationProvider>
          </BeginnerProvider>
        </ProgressProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>,
)
```

- [ ] **Step 3: Verify it builds & lints**

Run: `npm run build` → Expected: succeeds.
Run: `npm run lint` → Expected: no new errors for `ProgressContext.jsx` / `main.jsx`.

- [ ] **Step 4: Commit**

```bash
git add src/context/ProgressContext.jsx src/main.jsx
git commit -m "feat(progress): ProgressContext + provider mount"
```

---

### Task 4: Algorithm page — learned + bookmark toggles

**Files:**
- Modify: `src/pages/Algorithm.jsx`

**Interfaces:**
- Consumes: `useAuth()` (`user`, `signInWithGoogle`), `useProgress()` (Task 3), lucide `Bookmark`/`BookmarkCheck`/`CheckCircle`, existing `categoryId`/`algorithmId`/`isLight`.

- [ ] **Step 1: Add imports** — in `src/pages/Algorithm.jsx`

Change the lucide import (line 3) to add `Bookmark, BookmarkCheck` (`CheckCircle` is already imported):

```jsx
import { ChevronRight, Target, BarChart2, Globe, CheckCircle, Share2, Check, Bookmark, BookmarkCheck } from 'lucide-react'
```

Add the two context hooks to the imports (place beside the other context imports near the top of the file, e.g. after the `useBeginner` import on line 6):

```jsx
import { useAuth } from '../context/AuthContext'
import { useProgress } from '../context/ProgressContext'
```

- [ ] **Step 2: Call the hooks** — immediately after `const { categoryId, algorithmId } = useParams()` (line 217), add:

```jsx
  const { user, signInWithGoogle } = useAuth()
  const { isLearned, isBookmarked, toggleLearned, toggleBookmark } = useProgress()
```

- [ ] **Step 3: Insert the toggles + shift Share** — in the page-title row, replace the `<AlgoViewsBadge .../>` + Share `<button>` block (lines 528–545) with:

```jsx
              <AlgoViewsBadge categoryId={categoryId} algorithmId={algorithmId} isLight={isLight} />
              {user ? (
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => toggleLearned(categoryId, algorithmId)}
                    title={isLearned(categoryId, algorithmId) ? 'Learned — click to unmark' : 'Mark as learned'}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      color: isLearned(categoryId, algorithmId) ? (isLight ? '#065f46' : '#6ee7b7') : (isLight ? '#334155' : '#cbd5e1'),
                      background: isLearned(categoryId, algorithmId) ? 'rgba(52,211,153,0.15)' : 'rgba(148,163,184,0.12)',
                      border: `1px solid ${isLearned(categoryId, algorithmId) ? 'rgba(52,211,153,0.5)' : 'rgba(148,163,184,0.3)'}`,
                      transition: 'all 0.15s', fontFamily: 'inherit',
                    }}
                  >
                    <CheckCircle size={14} /> {isLearned(categoryId, algorithmId) ? 'Learned' : 'Mark learned'}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleBookmark(categoryId, algorithmId)}
                    aria-label={isBookmarked(categoryId, algorithmId) ? 'Remove bookmark' : 'Bookmark this algorithm'}
                    title={isBookmarked(categoryId, algorithmId) ? 'Bookmarked — click to remove' : 'Bookmark'}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
                      color: isBookmarked(categoryId, algorithmId) ? '#fbbf24' : (isLight ? '#64748b' : '#94a3b8'),
                      background: isBookmarked(categoryId, algorithmId) ? 'rgba(251,191,36,0.15)' : 'rgba(148,163,184,0.12)',
                      border: `1px solid ${isBookmarked(categoryId, algorithmId) ? 'rgba(251,191,36,0.5)' : 'rgba(148,163,184,0.3)'}`,
                      transition: 'all 0.15s',
                    }}
                  >
                    {isBookmarked(categoryId, algorithmId) ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  style={{
                    marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    color: isLight ? '#1e40af' : '#93c5fd',
                    background: 'rgba(59,130,246,0.14)', border: '1px solid rgba(59,130,246,0.35)',
                    transition: 'all 0.15s', fontFamily: 'inherit',
                  }}
                >
                  <CheckCircle size={14} /> Sign in to track progress
                </button>
              )}
              <button
                type="button"
                onClick={handleShare}
                aria-label={shared ? 'Link copied' : 'Copy shareable link'}
                title="Copy a link to this input & step"
                style={{
                  marginLeft: 8, display:'flex', alignItems:'center', gap:6,
                  padding:'6px 12px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer',
                  color: shared ? '#34d399' : (isLight ? '#1e40af' : '#93c5fd'),
                  background: shared ? 'rgba(52,211,153,0.12)' : 'rgba(59,130,246,0.14)',
                  border: `1px solid ${shared ? 'rgba(52,211,153,0.5)' : 'rgba(59,130,246,0.35)'}`,
                  transition: 'all 0.15s',
                }}
              >
                {shared ? <Check size={14} /> : <Share2 size={14} />}
                {shared ? 'Copied!' : 'Share'}
              </button>
```

(The only change to the Share button itself is `marginLeft: 'auto'` → `marginLeft: 8`, since the learned/sign-in control now takes the `auto` slot.)

- [ ] **Step 4: Verify build + lint**

Run: `npm run build` → succeeds.
Run: `npm run lint` → no new errors in `Algorithm.jsx`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Algorithm.jsx
git commit -m "feat(progress): learned + bookmark toggles on Algorithm page"
```

---

### Task 5: Category cards — inline learned/bookmark indicators

**Files:**
- Modify: `src/pages/Category.jsx`

**Interfaces:**
- Consumes: `useProgress()` (Task 3), lucide `Check`/`Bookmark`; existing `AlgoCard` props (`categoryId`, `algo`, `contrast`).

- [ ] **Step 1: Add imports** — in `src/pages/Category.jsx`

Change the lucide import (line 3) to add `Check, Bookmark`:

```jsx
import { ChevronRight, ArrowRight, Eye, Check, Bookmark } from 'lucide-react'
```

Add the context import after the `Seo` import (line 9):

```jsx
import { useProgress } from '../context/ProgressContext'
```

- [ ] **Step 2: Read progress + render badges in `AlgoCard`** — at the top of the `AlgoCard` function (after its signature, before `const baseBg`), add:

```jsx
  const { isLearned, isBookmarked } = useProgress()
```

Then, in the right-hand cluster, insert the two badges immediately before the `<ArrowRight ... />` element (line ~304):

```jsx
        {isBookmarked(categoryId, algo.id) && (
          <Bookmark size={12} style={{ color: '#fbbf24', fill: '#fbbf24', flexShrink: 0 }} />
        )}
        {isLearned(categoryId, algo.id) && (
          <Check size={13} style={{ color: contrast.isLight ? '#059669' : '#34d399', flexShrink: 0 }} />
        )}
```

(These render nothing when signed out — the maps are empty — so the grid is unchanged for anonymous users.)

- [ ] **Step 3: Verify build + lint**

Run: `npm run build` → succeeds.
Run: `npm run lint` → no new errors in `Category.jsx`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Category.jsx
git commit -m "feat(progress): inline learned/bookmark badges on Category cards"
```

---

### Task 6: Header avatar dropdown (Dashboard / Sign out)

**Files:**
- Modify: `src/components/Layout/Header.jsx`

**Interfaces:**
- Consumes: existing `useAuth()` (`user`, `logout`), `Link`; adds react `useState/useEffect/useRef` and lucide `LayoutDashboard/LogOut/ChevronDown`.

- [ ] **Step 1: Add imports** — in `src/components/Layout/Header.jsx`

Add a react import as a new first line (the file currently imports no react hooks):

```jsx
import { useState, useEffect, useRef } from 'react'
```

Change the lucide import (line 2) to add the three icons:

```jsx
import { Zap, MessageSquare, Sun, Moon, Gamepad2, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react'
```

- [ ] **Step 2: Replace the signed-in branch of `LoginButton`** — swap the `if (user) { ... }` block (lines 74–85) for a dropdown. The `LoginButton` function keeps its existing first line; add the menu state right after it, and replace the `if (user)` return:

```jsx
function LoginButton() {
  const { user, loading, authError, signingIn, signInWithGoogle, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    const onDoc = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [menuOpen])

  if (loading) {
    return (
      <div style={{ width: 80, height: 32, borderRadius: 6, background: 'var(--chrome-btn-bg)', border: '1px solid var(--chrome-btn-border)' }} />
    )
  }

  if (user) {
    return (
      <div ref={menuRef} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setMenuOpen(o => !o)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          title="Account menu"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 8px 3px 12px', background: 'var(--chrome-btn-bg)', border: '1px solid var(--chrome-btn-border)', borderRadius: 24, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <span style={{ fontSize: 13, color: 'var(--chrome-text-muted)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name?.split(' ')[0]}
          </span>
          <img src={user.avatar} alt={user.name} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--chrome-border)' }} />
          <ChevronDown size={13} style={{ color: 'var(--chrome-text-muted)' }} />
        </button>
        {menuOpen && (
          <div role="menu" style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', minWidth: 170, background: 'var(--chrome-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--chrome-border)', borderRadius: 10, padding: 6, boxShadow: '0 8px 30px rgba(0,0,0,0.35)', zIndex: 60 }}>
            <Link
              to="/profile"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 7, fontSize: 13, fontWeight: 600, color: 'var(--chrome-text)', textDecoration: 'none' }}
            >
              <LayoutDashboard size={15} /> Dashboard
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => { setMenuOpen(false); logout() }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 7, fontSize: 13, fontWeight: 600, color: 'var(--chrome-text)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
            >
              <LogOut size={15} /> Sign out
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
```

(Everything from the signed-out `return (` onward is unchanged.)

- [ ] **Step 3: Verify build + lint**

Run: `npm run build` → succeeds.
Run: `npm run lint` → no new errors in `Header.jsx`.
Manual: signed in, the avatar opens a menu; **Dashboard** → `/profile`, **Sign out** logs out; clicking outside / Escape closes it.

- [ ] **Step 4: Commit**

```bash
git add src/components/Layout/Header.jsx
git commit -m "feat(progress): avatar dropdown with Dashboard + Sign out"
```

---

### Task 7: `/profile` dashboard page + route

**Files:**
- Create: `src/pages/Profile.jsx`
- Modify: `src/App.jsx` (lazy import + route)

**Interfaces:**
- Consumes: `useAuth()` (`user`, `signInWithGoogle`), `useProgress()` (`learned`, `bookmarks`), `computeProgress`/`splitKey` (Task 1), `categories.json`, `algorithmRegistry.json`, `Seo`.
- Produces: default export `Profile` (route component).

- [ ] **Step 1: Write the page** — `src/pages/Profile.jsx`

```jsx
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import Seo from '../components/Seo'
import categories from '../data/categories.json'
import registry from '../data/algorithmRegistry.json'
import { useAuth } from '../context/AuthContext'
import { useProgress } from '../context/ProgressContext'
import { computeProgress, splitKey } from '../utils/progressStats'

/* Progress dashboard: overall + per-topic completion, bookmarks, and recently
   learned. Signed out → a sign-in CTA. Gated behind the existing Google auth. */
const algoName = (cat, algo) => (registry[cat] || []).find(a => a.id === algo)?.name || algo
const catName  = (cat) => categories.find(c => c.id === cat)?.name || cat
const ts = ([, v]) => (v && typeof v.toMillis === 'function' ? v.toMillis() : 0)

function ProgressBar({ pct, label, sub, to, big }) {
  const body = (
    <div style={{ padding: big ? '14px 16px' : '10px 14px', borderRadius: 12, background: 'var(--page-surface)', border: '1px solid var(--page-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: big ? 15 : 13, fontWeight: 700, color: 'var(--chrome-text)' }}>{label}</span>
        <span style={{ fontSize: 12, color: '#64748b' }}>{sub || `${pct}%`}</span>
      </div>
      <div style={{ height: big ? 10 : 7, borderRadius: 6, background: 'var(--page-surface-2)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#f5811f,#fbbf24)', borderRadius: 6, transition: 'width 0.3s' }} />
      </div>
    </div>
  )
  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{body}</Link> : body
}

function ListCard({ title, empty, entries }) {
  return (
    <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--page-surface)', border: '1px solid var(--page-border)' }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--chrome-text)', margin: '0 0 10px' }}>{title}</h3>
      {entries.length === 0 ? (
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{empty}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {entries.map(([key]) => {
            const [cat, algo] = splitKey(key)
            return (
              <Link key={key} to={`/algorithm/${cat}/${algo}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13, color: 'var(--chrome-text)', textDecoration: 'none', padding: '6px 8px', borderRadius: 7, background: 'var(--page-surface-2)' }}>
                <span style={{ fontWeight: 600 }}>{algoName(cat, algo)}</span>
                <span style={{ color: '#64748b', fontSize: 11 }}>{catName(cat)}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Profile() {
  const { user, signInWithGoogle } = useAuth()
  const { learned, bookmarks } = useProgress()

  if (!user) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
        <Seo title="Your Progress" description="Track which algorithms you've learned and bookmarked on AlgoFlow." />
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--chrome-text)' }}>Your Progress</h1>
        <p style={{ color: '#64748b', maxWidth: 420, textAlign: 'center', lineHeight: 1.6 }}>
          Sign in to mark algorithms as learned, bookmark them, and track your progress across all {categories.length} topics.
        </p>
        <button type="button" onClick={signInWithGoogle} style={{ padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#fff', background: '#f5811f', border: 'none', fontFamily: 'inherit' }}>
          Sign in with Google
        </button>
      </div>
    )
  }

  const { overall, byCategory } = computeProgress(learned, categories, registry)
  const learnedEntries   = Object.entries(learned).sort((a, b) => ts(b) - ts(a)).slice(0, 10)
  const bookmarkEntries  = Object.entries(bookmarks).sort((a, b) => ts(b) - ts(a))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page-bg)' }}>
      <Seo title="Your Progress" description="Track which algorithms you've learned and bookmarked on AlgoFlow." />
      <div className="max-w-[1100px] mx-auto px-5 py-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 18, color: 'var(--chrome-text-muted)' }}>
          <Link to="/" style={{ color: 'var(--chrome-text-muted)', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={12} />
          <span style={{ fontWeight: 600, color: 'var(--chrome-text)' }}>Your Progress</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <img src={user.avatar} alt={user.name} style={{ width: 56, height: 56, borderRadius: '50%', border: '1px solid var(--page-border)' }} />
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--chrome-text)', margin: 0 }}>{user.name}</h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{overall.learned} of {overall.total} algorithms learned</p>
          </div>
        </div>

        <ProgressBar pct={overall.pct} label="Overall" big />

        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--chrome-text)', margin: '28px 0 12px' }}>By topic</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {categories.map(c => {
            const s = byCategory[c.id] || { learned: 0, total: 0, pct: 0 }
            return <ProgressBar key={c.id} pct={s.pct} label={c.name} sub={`${s.learned}/${s.total}`} to={`/category/${c.id}`} />
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 28 }}>
          <ListCard title="Bookmarks" empty="No bookmarks yet." entries={bookmarkEntries} />
          <ListCard title="Recently learned" empty="Nothing learned yet." entries={learnedEntries} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Register the route** — in `src/App.jsx`

Add the lazy import after the `TestYourself` line (line 17):

```jsx
const Profile        = lazy(() => import('./pages/Profile'))
```

Add the route after the `/play` route (line 92):

```jsx
            <Route path="/profile" element={<Profile />} />
```

- [ ] **Step 3: Verify build + smoke**

Run: `npm run build` → succeeds; output lists a separate `Profile-*.js` chunk (code-split).
Run: `npm run lint` → no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Profile.jsx src/App.jsx
git commit -m "feat(progress): /profile dashboard page + route"
```

---

### Task 8: Full verification pass

**Files:** none (verification only).

- [ ] **Step 1: Run the node test**

Run: `node scripts/test-progress-stats.mjs`
Expected: `OK test-progress-stats`.

- [ ] **Step 2: Build + lint**

Run: `npm run build` → succeeds; `Profile-*.js` chunk present; no chunk-size regression errors.
Run: `npm run lint` → total problems ≈ baseline (~36); no new errors from Phase 3b files.

- [ ] **Step 3: Manual smoke checklist** (`npm run dev`, requires a real Firebase project + Google sign-in)

- Signed out: Algorithm page shows "Sign in to track progress"; Category cards show no badges; `/profile` shows the sign-in CTA.
- Sign in → Algorithm page shows **Mark learned** + bookmark star; click both → button/star flip state.
- Navigate to that algorithm's Category page → the card shows the learned check + bookmark star.
- Open `/profile` (via the avatar dropdown → Dashboard) → overall % and that topic's bar reflect the learned algorithm; the algorithm appears under **Recently learned**, the bookmark under **Bookmarks**.
- Un-mark on the Algorithm page → check/star and dashboard % revert everywhere (real-time).
- Toggle light/dark → all new UI respects theme (via `--chrome-*`/`--page-*` vars).
- Avatar dropdown closes on outside-click and Escape; **Sign out** returns to the signed-out state (badges/toggles disappear).

- [ ] **Step 4: Final commit (only if manual fixups were needed)**

```bash
git add -A
git commit -m "chore(progress): Phase 3b verification fixups"
```

---

## Self-Review

**1. Spec coverage**

| Spec section | Task |
| --- | --- |
| §3.1 `progress.js` Firestore I/O | Task 2 |
| §3.2 `progressStats.js` pure compute | Task 1 |
| §3.3 `ProgressContext` + provider mount | Task 3 |
| §3.4 `/profile` dashboard | Task 7 |
| §3.5 Algorithm toggles | Task 4 |
| §3.5 Category inline indicators | Task 5 |
| §3.5 Header avatar dropdown | Task 6 |
| §3.5 App route + provider | Tasks 3, 7 |
| §4 data model (maps, key, serverTimestamp/deleteField) | Tasks 2, 3 |
| §6 no rules change | Respected (no `firestore.rules` edit in any task) |
| §8 testing (unit + build + lint + manual) | Tasks 1, 8 |
| §9 out-of-scope (no telemetry/rules/streaks) | Respected |

The spec's `recordProfileView` was dropped during spec self-review (§3.4/§9) — no task adds it, and `stats.js` is intentionally **not** in the file list.

**2. Placeholder scan:** No TBD/TODO. Every code step shows complete code; every command has an expected result.

**3. Type consistency:** `progressKey(categoryId, algorithmId)` and `splitKey(key)` identical across Task 1 (impl/test), Task 2 (import/re-export), Task 3 (context), Task 7 (dashboard). `computeProgress(learned, categories, registry) → {overall:{learned,total,pct}, byCategory:{[id]:{learned,total,pct}}}` identical between Task 1 and Task 7. `subscribeToProgress(uid, cb)`, `setLearned(uid,key,on)`, `setBookmark(uid,key,on)` identical between Task 2 (def) and Task 3 (use). `useProgress()` shape (`learned,bookmarks,loading,isLearned,isBookmarked,toggleLearned,toggleBookmark`) identical between Task 3 (def) and Tasks 4/5/7 (use).
