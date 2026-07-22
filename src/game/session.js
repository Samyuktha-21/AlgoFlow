/* Game session state + scoring. Pure (except localStorage helpers, guarded).
   Node-testable via injected state. */

const KEY = 'algoflow-play'

export function createSession({ mode, categoryIds = [], roundLength = 10 }) {
  return {
    mode,
    categoryIds,
    roundLength: mode === 'rounds' ? roundLength : 0,
    score: 0,
    streak: 0,
    maxStreak: 0,
    index: 0,
    total: mode === 'rounds' ? roundLength : 0,
    perType: {},
    over: false,
  }
}

export function scoreAnswer(s, isCorrect) {
  const next = { ...s, perType: { ...s.perType } }
  if (s.mode === 'endless') {
    if (isCorrect) {
      next.score = s.score + 10 + 2 * s.streak
      next.streak = s.streak + 1
      next.maxStreak = Math.max(s.maxStreak, next.streak)
    } else {
      next.streak = 0
    }
  } else {
    if (isCorrect) next.score = s.score + 1
    next.index = s.index + 1
    next.over = next.index >= s.total
  }
  return next
}

export function recordType(s, type, isCorrect) {
  const cur = s.perType[type] || { correct: 0, total: 0 }
  return {
    ...s,
    perType: {
      ...s.perType,
      [type]: { correct: cur.correct + (isCorrect ? 1 : 0), total: cur.total + 1 },
    },
  }
}

export function loadBest() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { bestScore: 0, bestStreak: 0 } }
  catch { return { bestScore: 0, bestStreak: 0 } }
}

export function saveBest(session) {
  try {
    const b = loadBest()
    const next = {
      bestScore: Math.max(b.bestScore, session.score),
      bestStreak: Math.max(b.bestStreak, session.maxStreak || 0),
    }
    localStorage.setItem(KEY, JSON.stringify(next))
    return next
  } catch { return null }
}

export const ALL_TYPES = ['nextOp', 'complexity', 'nameAlgorithm', 'finalOutput']

export function applicableTypes(entry) {
  const t = ['complexity']
  if (entry.hasSteps) t.push('nextOp', 'nameAlgorithm', 'finalOutput')
  return t
}
