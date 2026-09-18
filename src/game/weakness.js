/*
 * Weakness map at step granularity — Item 3 of docs/NEXT_FEATURES.md.
 *
 * Tracks *which kind of step* a learner mispredicts, not how many problems
 * they finished. Every answered "what happens NEXT?" question contributes
 * { opKind, algorithmType, wasCorrect }; the op kind comes from Item 0's
 * classifier and rides on the challenge object, so the thing recorded is
 * always the thing that was asked.
 *
 * CONSTRAINT, from the plan and enforced by where this is called: Test
 * Yourself only, never the daily challenge. src/game/dailyChallenge.js is
 * deliberately seeded so every visitor gets the same question on a given day;
 * biasing it per learner would break that shared-question property and make
 * the leaderboard unfair to compare. Nothing in /daily's path touches this
 * module, and scripts/test-weakness.mjs asserts that.
 *
 * STORAGE — the plan left this open, recommending client-writable.
 * Client-writable it is. Two reasons it is safe here where it would not be for
 * XP: the data is not XP-bearing and no leaderboard query reads it, and the
 * only person a forged weakness profile misleads is its owner. Signed-out
 * learners keep theirs in localStorage, which is also the fallback when a
 * write fails, so the panel works without an account and without a deploy.
 * If weakness ever earns XP this has to move behind a Cloud Function, and the
 * note in firestore.rules says so.
 *
 * Pure except the guarded localStorage helpers. Node-testable.
 */

import { OP_KIND_LABELS, isInformativeKind } from './classifyStep.js'

const KEY = 'algoflow-weakness'

/* A tally is { [key]: { c: correct, t: total } }. Short keys because this is
   a Firestore document field written on every answer. */
export const emptyWeakness = () => ({ byKind: {}, byType: {} })

/* How many answers before a rate is worth showing or acting on. Below this,
   one unlucky question reads as a 0% weakness. */
export const MIN_SAMPLES = 4

/* Above this success rate a kind is not a weakness, whatever its sample. */
export const WEAK_RATE = 0.7

const bump = (tally, key, wasCorrect) => {
  const cur = tally[key] || { c: 0, t: 0 }
  return { ...tally, [key]: { c: cur.c + (wasCorrect ? 1 : 0), t: cur.t + 1 } }
}

/**
 * Fold one answered question into a map.
 * Uninformative kinds (init / no-op / inspect / unknown) are dropped: a
 * learner cannot be weak at "the state did not change", and counting them
 * would dilute every real signal.
 */
export function recordAnswer(map, { opKind, algorithmType, wasCorrect }) {
  const base = map && map.byKind ? map : emptyWeakness()
  if (!opKind || !isInformativeKind(opKind)) return base
  return {
    byKind: bump(base.byKind, opKind, wasCorrect),
    byType: algorithmType ? bump(base.byType, algorithmType, wasCorrect) : { ...base.byType },
  }
}

/** Rows for a panel, worst first. Only kinds with enough answers to mean it. */
export function weaknessRows(map, { minSamples = MIN_SAMPLES, dimension = 'byKind' } = {}) {
  const tally = (map && map[dimension]) || {}
  return Object.entries(tally)
    .filter(([, v]) => v.t >= minSamples)
    .map(([key, v]) => ({
      key,
      label: dimension === 'byKind' ? (OP_KIND_LABELS[key] || key) : key,
      correct: v.c,
      total: v.t,
      rate: v.c / v.t,
      missRate: 1 - v.c / v.t,
    }))
    .sort((a, b) => b.missRate - a.missRate || b.total - a.total)
}

/** The kinds worth steering questions toward. */
export function weakKinds(map, { minSamples = MIN_SAMPLES, weakRate = WEAK_RATE } = {}) {
  return new Set(
    weaknessRows(map, { minSamples })
      .filter(r => r.rate < weakRate)
      .map(r => r.key))
}

/** Every answer recorded so far — used to decide whether to show the panel. */
export function totalAnswered(map) {
  return Object.values((map && map.byKind) || {}).reduce((s, v) => s + v.t, 0)
}

/**
 * Pick one challenge from several candidates, preferring one that exercises a
 * kind the learner is weak at.
 *
 * Weighted rather than absolute on purpose: always serving the single worst
 * kind would narrow practice to one operation and stop the map ever learning
 * anything about the rest. A weak kind gets several times the weight of a
 * strong one, and an unseen kind is weighted above a mastered one so coverage
 * keeps growing.
 */
export function chooseByWeakness(candidates, map, rng = Math.random) {
  const list = (candidates || []).filter(Boolean)
  if (list.length <= 1) return list[0] || null
  const tally = (map && map.byKind) || {}
  const weak = weakKinds(map)

  const weightOf = (ch) => {
    const k = ch.opKind
    if (!k || !isInformativeKind(k)) return 1
    if (weak.has(k)) return 6
    const seen = tally[k]
    if (!seen || seen.t < MIN_SAMPLES) return 3   // unseen: worth exploring
    return 1
  }

  const weights = list.map(weightOf)
  const total = weights.reduce((a, b) => a + b, 0)
  let r = rng() * total
  for (let i = 0; i < list.length; i++) {
    r -= weights[i]
    if (r <= 0) return list[i]
  }
  return list[list.length - 1]
}

/** Merge two maps — a signed-out session folded into an account's history. */
export function mergeWeakness(a, b) {
  const out = emptyWeakness()
  for (const dim of ['byKind', 'byType']) {
    const x = (a && a[dim]) || {}, y = (b && b[dim]) || {}
    for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) {
      out[dim][k] = {
        c: (x[k]?.c || 0) + (y[k]?.c || 0),
        t: (x[k]?.t || 0) + (y[k]?.t || 0),
      }
    }
  }
  return out
}

/* ---------- local fallback ---------- */

export function loadLocalWeakness() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY))
    return raw && raw.byKind ? raw : emptyWeakness()
  } catch { return emptyWeakness() }
}

export function saveLocalWeakness(map) {
  try { localStorage.setItem(KEY, JSON.stringify(map)); return map }
  catch { return null }
}
