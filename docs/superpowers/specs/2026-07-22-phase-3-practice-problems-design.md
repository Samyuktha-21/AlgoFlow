# Phase 3 — Practice Problems + Embedded IDE — Design

**Date:** 2026-07-22
**Status:** Approved (design), pending implementation plan
**Predecessors:** Phase 1 (Polish & Reach), Phase 2 (Test Yourself game). See `phase1-polish-roadmap`.

---

## 1. Goal

Let learners **practice real coding-interview problems on AlgoFlow itself**. From any surface —
the homepage, a topic (category) page, or a single algorithm page — a user can reach a
**curated list of practice problems** (sourced from LeetCode / HackerRank / NeetCode) filtered to
the relevant topic and algorithm, read a few **example test cases**, and **write & run code in an
embedded in-site IDE** (Java / C / C++ / Python). Full problem statement and official submission
stay on the source site.

The whole feature funnels into **one `/practice` page**. Every other surface is just a deep-link
button that prefills that page via URL params — this keeps the code footprint small (one page, one
data file, a couple of components) and satisfies "reuse the same widget everywhere."

## 2. Locked decisions (from brainstorming)

| Decision | Choice | Rationale |
| --- | --- | --- |
| Surface | One dedicated `/practice` page + deep-link buttons | A real IDE needs screen space; the Category page is viewport-locked (`overflow:hidden`) and can't embed a list. Fewest moving parts. |
| Problem → topic mapping | **Per-algorithm where it fits, category-level fallback** | Makes the algorithm-page prefill genuinely useful; niche algorithms (Aho-Corasick, FFT…) fall back to their category. |
| Execution | **OneCompiler iframe embed** | Static Vite/Firebase app has no backend. Public Piston is whitelist-only since 2026-02-15; Judge0 needs a key/host. OneCompiler permits framing (no `X-Frame-Options`/CSP block) and supports all 4 languages. |
| Test cases / judging | **Show curated example cases; user self-checks in the IDE** | Hidden judge test cases are not obtainable from any of these sites (no public API, ToS/anti-bot). We curate the *public example* cases ourselves. No auto pass/fail — that would require an execution backend (deferred). |
| Dropdowns | Prefilled from URL, **still editable** | Reduces code and is better UX than locking them. |

### Hard constraint (documented so nobody re-litigates it)

**Official/hidden test cases from LeetCode, HackerRank, and NeetCode cannot be fetched.** There is
no public API for them; they sit behind auth/anti-bot and scraping them violates those sites' ToS.
What we use is the **example test cases visible in each public problem statement**, curated by hand
into our own dataset. Auto-judging against a hidden set is therefore out of scope for this phase.

## 3. Entry points

All four mirror the existing `Test Yourself / Interview / Discussion` nav pattern in
`components/Layout/Header.jsx`. The Interview button already deep-links `?algoId=&category=` when on
an algorithm page — the Practice button follows the same idea.

| Surface | Control | Target |
| --- | --- | --- |
| Header nav (all pages) | **Practice** button (lucide `Code2` or `Terminal` icon) | On `/algorithm/:cat/:algo` → `/practice?topic=<cat>&algo=<algo>`; elsewhere → `/practice` |
| Home hero | "Practice Problems" CTA | `/practice` |
| Category page header row | "Practice {Name} problems" button (in the auto-height header, **not** the locked grid) | `/practice?topic=<categoryId>` |
| Algorithm page | "Practice problems" button near the Share button | `/practice?topic=<categoryId>&algo=<algoId>` |

## 4. The `/practice` page

- New lazy route `<Route path="/play" .../>`-style: `const Practice = lazy(() => import('./pages/Practice'))`, registered in `App.jsx`, code-split like the other pages.
- Reads `?topic=` and `?algo=` (via `useSearchParams`) to seed filter state; the dropdowns remain editable and keep the URL in sync (so links are shareable, consistent with the Algorithm page's share pattern).
- `<Seo title="Practice" description="…" />`, breadcrumb, light/dark aware via existing `--page-*` / `--chrome-*` CSS vars.

### Layout (two-column split; stacks vertically under ~900px, same breakpoint as the Algorithm page)

```
/practice
┌─ Left: filters + problems ─────────┐  ┌─ Right: IDE (OneCompiler) ───────┐
│ Topic: [ Sorting ▼ ]               │  │ lang: [ Java ▼ ]           [ Run ]│
│ Algorithm: [ Quick Sort ▼ ]        │  │ ┌──────────────────────────────┐ │
│                                    │  │ │ public class Main { ... }     │ │
│ ▸ [Med] Sort an Array   LeetCode ↗ │  │ │                              │ │
│   [Med] Merge Intervals NeetCode ↗ │  │ └──────────────────────────────┘ │
│   [Easy] …                         │  │ ── output ────────────────────── │
│                                    │  │                                   │
│ ── Now solving: Sort an Array ──   │  │                                   │
│ prompt + example cases (in/out)    │  │                                   │
└────────────────────────────────────┘  └───────────────────────────────────┘
```

- **Filters:** Topic `<select>` = `All` + the 14 categories from `categories.json`. Algorithm `<select>` = `All` + algorithms of the selected topic from `algorithmRegistry.json` (disabled/`All` when topic is `All`).
- **Problem list:** filtered cards — difficulty badge (reuse Interview page `DIFF_STYLES`), title, source badge (LeetCode / NeetCode / HackerRank), external-link icon. Clicking a card (a) opens `url` in a new tab, and (b) **pins it as the active problem**.
- **Active problem panel** (left column, directly below the list, as shown in the layout): short `prompt`, a "Open full problem on {source} ↗" link, and the curated **example test cases** rendered as `input → expected`. This is what the user self-checks against while coding in the right-hand IDE.

## 5. Components

| File | Responsibility |
| --- | --- |
| `src/pages/Practice.jsx` | Orchestrator: URL params ⇄ filter state, holds `activeProblem`, composes the two panels. |
| `src/components/practice/PracticeProblemList.jsx` | Topic/Algorithm dropdowns + filtered cards + active-problem detail (prompt + example cases). Props: `initialTopic`, `initialAlgorithm`, `onSelectProblem`. |
| `src/components/practice/OneCompilerIDE.jsx` | The iframe wrapper: language selector, theme, optional starter-code preload, optional run-output read. Props: `language`, `onLanguageChange`, `starter?`. |
| `src/utils/practiceFilter.js` | Pure `filterProblems(all, topic, algo)` — unit-testable, no React. |

Keeping the filter as a pure util (not inline in the component) is what makes the logic testable and
the component small — consistent with the Phase 2 `describeStep`/`stepExplain` extraction.

## 6. Data model — `src/data/practiceProblems.js`

```js
export const practiceProblems = [
  {
    id: 'two-sum',                 // stable kebab id (may equal a LeetCode slug)
    title: 'Two Sum',
    source: 'LeetCode',            // 'LeetCode' | 'NeetCode' | 'HackerRank'
    url: 'https://leetcode.com/problems/two-sum/',
    difficulty: 'easy',            // 'easy' | 'medium' | 'hard'
    categoryId: 'hashing',         // must exist in categories.json
    algorithmId: 'twoSumHash',     // OPTIONAL — omitted = category-level fallback
    prompt: 'Return indices of the two numbers that add up to target.',   // our words, 1–2 sentences
    examples: [                    // curated from the public problem examples
      { input: 'nums=[2,7,11,15], target=9', output: '[0,1]' },
      { input: 'nums=[3,2,4], target=6',     output: '[1,2]' },
    ],
  },
  // …
]

export const SOURCES = ['LeetCode', 'NeetCode', 'HackerRank']
```

### Filter logic (`practiceFilter.js`)

```
topic = 'all'                → every problem
topic = X, algo = 'all'      → categoryId === X
topic = X, algo = Y          → categoryId === X && (algorithmId === Y || !algorithmId)   // fallback
```

### Curation scope (the bulk of the work)

- **3–6 problems per well-mapped algorithm** (twoSum, binarySearch, quickSort, bfs, dijkstra, lcs, nQueens…), each tagged with `categoryId` + `algorithmId`.
- **A category-level set for every one of the 14 categories** (`algorithmId` omitted) so no topic filter is ever empty, and niche algorithms without a clean single-problem mapping still surface relevant practice.
- Real, verified URLs (LeetCode problem slugs are stable; NeetCode + HackerRank where they add value). Each problem gets a short `prompt` in our own words and **≥1 curated example case** (from the public statement).

## 7. OneCompiler integration

- iframe: `https://onecompiler.com/embed/{lang}?theme={dark|light}&hideNew=true&hideNewFileOption=true&hideTitle=true&listenToEvents=true&availableLanguages=java,c,cpp,python`
- Language slugs: `java`, `c`, `cpp`, `python` (match the site's four). Switching language remounts the iframe (React `key={lang}`) or posts a message.
- **Enhancements (best-effort, must degrade gracefully):**
  - Preload a starter template (and, later, optionally the site's own algorithm code) via OneCompiler's `postMessage` embed API.
  - Read run output via the `listenToEvents` messages.
  - The exact `postMessage` event names are verified against OneCompiler's embed docs **during implementation**. If they differ or fail, the plain language-scoped embed is still a fully working IDE — the feature does not depend on them.
- Free tier shows OneCompiler branding — acceptable for this phase.

## 8. Edge cases & error handling

| Case | Behavior |
| --- | --- |
| Filter combo yields no problems | Friendly empty state: "No curated problems here yet — try the topic level or browse all." |
| `?topic`/`?algo` param invalid | Ignore silently, fall back to `All`. |
| Offline / iframe blocked | List + example cases + external links still work; small note: "The IDE needs a connection." |
| Reduced motion / theme | Respect `prefers-reduced-motion`; pass `theme` to the embed; use existing chrome vars. |

## 9. Testing (mirrors Phase 2 discipline — node scripts under `scripts/`)

1. **`filterProblems` unit test** — every combination: `all/all`, `topic/all`, `topic/algo` with a direct `algorithmId` hit, `topic/algo` falling back to a category-level entry, and empty results.
2. **Dataset validator** — for every entry: `categoryId ∈ categories.json`; if `algorithmId` present it ∈ `algorithmRegistry[categoryId]`; `source ∈ SOURCES`; `difficulty ∈ {easy,medium,hard}`; non-empty `title`/`url`/`prompt`; `examples.length ≥ 1` with non-empty `input`/`output`; `url` is http(s) and (soft check) host matches `source`.
3. **Build + lint** — `npm run build` clean, ESLint no new errors over baseline.

## 10. Out of scope (deferred)

- **Automatic pass/fail judging** and **hidden test cases** — needs an execution backend (self-hosted Piston/Judge0) + per-language driver harness + authored full test sets. Revisit as its own phase if desired.
- Fetching statements/starter code live from LeetCode (CORS + ToS) — we curate instead.
- Saving user code / progress (belongs with the deferred Accounts phase).

## 11. Telemetry (default, low-value, easy to drop)

A lightweight `recordPracticeView()` in `firebase/stats`, called on `/practice` mount, mirroring
`recordInterviewView()` — for parity with the other pages' live counters.
