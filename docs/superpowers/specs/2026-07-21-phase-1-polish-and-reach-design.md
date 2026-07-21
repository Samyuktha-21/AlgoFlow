# Phase 1 — Polish & Reach (AlgoFlow)

**Date:** 2026-07-21
**Status:** Approved design, pending implementation plan
**Milestone context:** First of a 4-phase roadmap. Later phases (Learning depth, Accounts + progress, Engagement loop) are out of scope here and get their own spec → plan cycles.

## Goal

Improve the quality of the existing AlgoFlow experience without adding backend/data-model risk. Four independent workstreams: (1) fix the bundle-size warning and pass Lighthouse, (2) add a copy-code button and visualizer accessibility, (3) add per-page SEO metadata plus shareable visualizer links, (4) ship a real light theme for the app chrome and content pages.

Each workstream is independently shippable and independently revertable.

## Non-goals (explicitly out of scope)

- User accounts, progress tracking, streaks, gamification (Phases 3–4).
- Quizzes, "predict the next step", new languages (Phase 2).
- Build-time prerendering / SSR of routes (decided against for Phase 1; may become a later item).
- Per-algorithm generated OG images (a static default OG image is used instead).
- Converting the per-category themed visualizer stages to light mode (the stage stays dark by decision).

## Locked decisions

1. **Light-theme reach:** chrome + content pages only. The algorithm visualizer workspace (the split-screen stage on `Algorithm.jsx`) stays dark as an intentional "stage", matching the per-category theme scenes it already uses. This avoids clashing with the water/forest/etc. themed backgrounds and roughly halves the audit.
2. **SEO depth:** client-side React 19 native document metadata + one static default OG image. No prerendering in Phase 1. Google indexes fine (it executes JS); social unfurls fall back to the default OG card.

---

## Workstream 1 — Code-splitting & performance

**Problem.** `App.jsx` eagerly imports all 5 route pages. `VisualizerCanvas.jsx` eagerly imports all 10 visualizer components. `CodeBlock.jsx` eagerly imports 4 Prism language packs. Vendor libraries (`firebase`, `d3`, `framer-motion`, `prismjs`) all land in one chunk, producing Vite's >500 kB chunk-size warning and a large initial payload.

**Design.**
- `App.jsx`: convert the 5 route pages (`Home`, `Category`, `Algorithm`, `Interview`, `DiscussionPage`) to `React.lazy`. Wrap `<Routes>` in a single `<Suspense>` with a lightweight themed spinner fallback (reuse the existing loading spinner style from `Algorithm.jsx`).
- `VisualizerCanvas.jsx`: convert each entry in `VISUALIZER_MAP` to `React.lazy` so a page only downloads the one visualizer its algorithm type needs. Wrap the rendered `<VisualizerComponent>` in `<Suspense>` with a small inline fallback.
- `vite.config.js`: add `build.rollupOptions.output.manualChunks` splitting `react`/`react-dom`/`react-router-dom`, `firebase`, `d3`, `framer-motion`, and `prismjs` into named vendor chunks.
- Leave the `import.meta.glob` algorithm data loading unchanged — it is already per-route code-split.

**Files.** `src/App.jsx`, `src/components/Visualizer/VisualizerCanvas.jsx`, `vite.config.js`.

**Success criteria.** `npm run build` completes with no chunk-size warning; initial route JS is materially smaller (verify in build output); no visual or behavioral regression on any route; Lighthouse performance improves on Home and an Algorithm page.

## Workstream 2 — Copy-code button & accessibility

**Design.**
- **Copy button** added inside `CodeBlock.jsx` (shared by Algorithm and Interview pages), floating top-right of the scroll container. Uses `navigator.clipboard.writeText(code)`, shows a "Copied!" state for ~1.5s, has an `aria-label`, and is keyboard-focusable. Positioned so it does not overlap code line numbers or the horizontal scrollbar.
- **Visualizer accessibility** in `PlaybackControls.jsx`: every control is a real `<button>` with an `aria-label`; visible focus rings; keyboard shortcuts registered at the page level — Space = play/pause, ← / → = step back/forward, R = reset. Shortcuts are ignored when focus is in a text input/textarea (so the input panel keeps working). Shortcuts respect the `disabled` state.
- **Reduced motion:** add a `useReducedMotion()` (framer-motion) guard so the auto-play kickoff and animated transitions are skipped/instant when the user prefers reduced motion, consistent with the existing CSS `prefers-reduced-motion` blocks in `index.css`.

**Files.** `src/components/CodeDisplay/CodeBlock.jsx`, `src/components/Visualizer/PlaybackControls.jsx`, `src/pages/Algorithm.jsx` (page-level key handler), possibly a small `useReducedMotion` usage in `Algorithm.jsx`.

**Success criteria.** Copy button copies the currently displayed language's code and shows feedback; visualizer is fully operable by keyboard with visible focus; shortcuts do not fire while typing in the input; reduced-motion users get no auto-animation.

## Workstream 3 — SEO metadata, OG image & share links

**Design.**
- **Per-page metadata** via React 19 native document metadata rendered inside each page component (`<title>`, `<meta name="description">`, `<link rel="canonical">`, and `og:*` / `twitter:*` tags). React 19 hoists these into `<head>`.
  - `Home`: static title/description.
  - `Category`: dynamic from the category name/description.
  - `Algorithm`: dynamic from `metadata.name` + `metadata.description`.
  - `Interview`, `DiscussionPage`: static.
  - A small helper component (e.g. `src/components/Seo.jsx`) centralizes the tag rendering and default fallbacks to avoid duplication.
- **Default OG image.** Add one `1200×630` OG card to `/public` (e.g. `og-default.png`) referenced by the default `og:image` / `twitter:image`. Also set a sensible base `<title>`/description and OG tags in `index.html` as the crawler fallback.
- **Share links.** On `Algorithm.jsx`, read URL query params `?input=`, `?target=`, `?step=`, `?lang=` on load and seed the existing flow: pre-fill `InputPanel` and run `handleVisualize` with the shared input instead of the default (the auto-run effect at `Algorithm.jsx:438` becomes "use URL params if present, else defaults"); if `step` is present, advance the visualization to that index; if `lang` is present, select that language tab. Add a **Share** button (near the language tabs / controls) that builds this URL from the current input/step/language and copies it to the clipboard with feedback.

**Files.** new `src/components/Seo.jsx`; `src/pages/Home.jsx`, `src/pages/Category.jsx`, `src/pages/Algorithm.jsx`, `src/pages/Interview.jsx`, `src/pages/DiscussionPage.jsx`; `index.html`; `public/og-default.png`.

**Success criteria.** Each route renders a distinct, correct `<title>` and description in the DOM `<head>`; a shared Algorithm URL restores input, language, and step on load; the Share button produces a working link; social scrapers get at least the default OG card.

## Workstream 4 — Light theme (chrome + content pages)

**Current state.** `ThemeContext.jsx` is hardcoded to `{ isDark: true, toggle: () => {} }` and always adds the `.dark` class. `App.jsx` already has a light branch (`bg-white text-gray-900`) that never fires. `index.css:818` already defines `.light` CSS variable overrides. The homepage (`homepage-root`) and many components use hardcoded dark hex values.

**Design.**
- **Real `ThemeContext`:** state initialized from `localStorage` (`algoflow-theme`) falling back to `prefers-color-scheme`; `toggle()` flips it; an effect adds/removes `.dark` / `.light` on `<html>` and `<body>` and persists to `localStorage`. Keep the same `{ isDark, toggle }` shape so existing consumers (`App.jsx`, `CodeBlock.jsx`) keep working.
- **Theme toggle button** in `Header.jsx` (sun/moon icon, `aria-label`, `aria-pressed`).
- **Light styling** for chrome + content pages by replacing hardcoded dark hex with the existing CSS variables (`--text-*`, `--bg-*`, `--border-color` at `index.css:818`, and the `--color-*` system at `index.css:26`): Header, Footer, Home (Hero, LiveStats, CategoryGrid, FactsTicker, DiscussionSection, BottomCTA, etc.), Category, Interview, DiscussionPage, and the code/info panels' surrounding surfaces.
- **Stage stays dark:** the split-screen visualizer workspace on `Algorithm.jsx` (left visualization panel + right code panel + status bars) and the per-category `ThemeBackground` scenes remain dark regardless of user theme. The page chrome around them (breadcrumb, title, info tabs, input/controls surfaces) does adapt.

**Files.** `src/context/ThemeContext.jsx`, `src/components/Layout/Header.jsx`, `src/App.jsx`, `src/index.css`, homepage components under `src/components/HomePage/`, `src/pages/Category.jsx`, `src/pages/Interview.jsx`, `src/pages/DiscussionPage.jsx`, info panel components as needed.

**Success criteria.** Toggle switches the whole app chrome + content pages between a clean light and dark appearance with no unreadable (dark-on-dark / light-on-light) text; preference persists across reloads and respects OS default on first visit; the algorithm visualizer stage and themed scenes are visually unchanged; no regression to the existing dark experience.

---

## Testing & verification (whole phase)

- `npm run build` — no chunk-size warning; note bundle sizes before/after.
- `npm run lint` — no new violations (there are known pre-existing violations on main; do not increase them).
- Manual: exercise Home, a Category, several Algorithm types (sorting, graph, tree, dp, backtracking), Interview, Discussion in both themes.
- Manual: keyboard-only operation of the visualizer; copy button on both Algorithm and Interview code; a shared Algorithm URL round-trips input/lang/step.
- Lighthouse on Home + one Algorithm page (perf + a11y), compared against current.

## Sequencing note

Workstreams are independent and can be implemented/committed in any order, but a reasonable order is: (1) code-split → (2) copy + a11y → (3) SEO/share → (4) light theme (largest). The light theme touches the most files and should land last so earlier, safer wins ship first.
