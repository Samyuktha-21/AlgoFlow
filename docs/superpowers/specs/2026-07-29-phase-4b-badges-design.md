# Phase 4b — Achievement Badges — Design Spec

**Date:** 2026-07-29
**Status:** Draft (design) — implemented same session, batch review pending
**Depends on:** Phase 4a (`xp.js`, `ProgressContext` engagement fields), Phase 3b (`ProgressContext`, `users/{uid}`, `useAuth`), Phase 3 practice (`solved`).
**Roadmap:** second slice of Phase 4 (engagement loop). Leaderboard (4c) remains **out of scope** — it needs public cross-user data + a Firestore rules change + anti-cheat, which are deliberately deferred.

## 1. Goal

A signed-in user earns **achievement badges** for milestones they've already reached — algorithms learned, problems solved, streak length, daily completions, and level. Badges surface on `/profile` as an earned/locked grid with progress toward the next tier. No new data, no backend.

## 2. Locked decisions

1. **Badges are 100% derived** from existing durable state — the same farm-resistant signals Phase 4a already exposes: `learnedCount`, `solvedCount`, `longestStreak`, `dailyCount`, `level`. **No new Firestore fields, no rules change, no accumulator.** Un-mark/re-mark can't farm a badge because the underlying counts are themselves derived/durable.
2. **Longest streak, not current**, drives streak badges — a badge is a permanent achievement; losing a streak shouldn't revoke it.
3. **Data-driven catalog.** A flat `BADGES` array of `{ id, title, desc, tier, icon, stat, threshold }`; a badge is earned when `stats[stat] >= threshold`. Adding/tuning a badge = editing one array. Keeps the util pure and node-testable (icon is a *string* resolved in the component, so the util has no React import).
4. **Placement:** a "Badges" section on `/profile` (earned in full color, locked greyed with a progress bar to threshold), plus an earned-count in the section heading. No header chip in 4b (keeps chrome uncluttered; revisit with 4c).
5. **Signed-out / Firebase disabled:** the profile already gates on `user`; with empty stats every badge is simply locked at 0% — no crash, no writes.
6. **Tiers** are cosmetic only (`bronze`/`silver`/`gold`) — they set the accent color, they are not a separate unlock gate.

## 3. Data model

**None added.** Badges read the values `ProgressContext` already exposes. The Profile page assembles a plain stats object:

```
{ learned: learnedCount, solved: solvedCount, streak: longestStreak, daily: dailyCount, level }
```

`learnedCount = Object.keys(learned).length` (already available via `computeProgress(...).overall.learned`).

## 4. Architecture — units and boundaries

### 4.1 `src/utils/badges.js` — pure, unit-tested
- `BADGES: Array<{ id, title, desc, tier, icon, stat, threshold }>` — the catalog (see §5).
- `evaluateBadges(stats) → Array<{ ...badge, value, earned, progressPct }>` — `earned = value >= threshold`; `progressPct = clamp(round(value/threshold*100), 0, 100)`.
- `earnedBadgeCount(stats) → number`.
- Depends on: nothing (no React, no Firestore). Icons are strings.

### 4.2 `src/pages/Profile.jsx` — Badges section
- Builds the stats object from `useProgress()` + the already-computed `overall.learned`.
- Renders `evaluateBadges(stats)` as a responsive grid: earned badges in tier color, locked badges greyed with a thin progress bar and `value/threshold` label.
- A module-scope `ICONS` map resolves each badge's `icon` string to a lucide component (tree-shake-friendly, no dynamic import).
- Section heading shows `earnedBadgeCount(stats)` / total.

## 5. Badge catalog (initial — tunable)

| id | title | stat | threshold | tier |
| --- | --- | --- | --- | --- |
| `learn-1` | First Steps | learned | 1 | bronze |
| `learn-10` | Bookworm | learned | 10 | silver |
| `learn-25` | Scholar | learned | 25 | gold |
| `solve-1` | Problem Solver | solved | 1 | bronze |
| `solve-10` | Grinder | solved | 10 | silver |
| `solve-25` | Code Machine | solved | 25 | gold |
| `streak-3` | Warming Up | streak | 3 | bronze |
| `streak-7` | Week Warrior | streak | 7 | silver |
| `streak-30` | Unstoppable | streak | 30 | gold |
| `daily-5` | Regular | daily | 5 | bronze |
| `daily-20` | Devoted | daily | 20 | silver |
| `level-5` | Rising Star | level | 5 | silver |
| `level-10` | Veteran | level | 10 | gold |

Thresholds and titles are the main **review knobs** — all live in one array.

## 6. Security / errors

- **Rules:** unchanged. No new reads/writes at all — badges are computed client-side from data the owner already loads.
- **Anti-farm:** inherits 4a — every stat is derived from durable counts/sets; nothing new to game.
- **Signed out / `firebaseEnabled === false`:** empty stats → all locked, no crash.

## 7. Testing

- **Unit (node, TDD-first):** `scripts/test-badges.mjs` — `evaluateBadges` earned flags across thresholds, `progressPct` clamping (0, partial, ≥100 caps at 100), `earnedBadgeCount`, empty-stats → 0 earned, catalog integrity (unique ids, positive thresholds).
- **Build:** `npm run build` succeeds.
- **Lint:** no new errors over baseline (38).
- **Manual smoke:** signed in → `/profile` shows a Badges grid; earned badges highlighted, locked show progress; solving a problem / completing a daily flips the relevant badge as the count crosses its threshold.

## 8. Out of scope (YAGNI)

Leaderboard / any public or cross-user data (4c); badge toast/notification on unlock; header badge chip; per-badge earned-date; shareable badge cards; XP reward for earning a badge (would double-count derived XP).

## 9. File summary

**New:** `src/utils/badges.js`, `scripts/test-badges.mjs`.
**Edit:** `src/pages/Profile.jsx` (Badges section + `ICONS` map).
**Unchanged:** `firestore.rules`, `ProgressContext`, `progress.js`.
