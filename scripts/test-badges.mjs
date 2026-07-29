import assert from 'node:assert'
import { BADGES, evaluateBadges, earnedBadgeCount } from '../src/utils/badges.js'

// catalog integrity: unique ids, positive thresholds, known tiers
const ids = BADGES.map(b => b.id)
assert.strictEqual(new Set(ids).size, ids.length, 'badge ids are unique')
for (const b of BADGES) {
  assert.ok(b.threshold > 0, `positive threshold: ${b.id}`)
  assert.ok(['bronze', 'silver', 'gold'].includes(b.tier), `known tier: ${b.id}`)
  assert.ok(typeof b.icon === 'string' && b.icon.length, `icon is a string: ${b.id}`)
  assert.ok(typeof b.stat === 'string' && b.stat.length, `stat key: ${b.id}`)
}

// empty stats → nothing earned, all at 0%
const empty = evaluateBadges({})
assert.strictEqual(empty.length, BADGES.length)
assert.ok(empty.every(b => !b.earned && b.progressPct === 0 && b.value === 0))
assert.strictEqual(earnedBadgeCount({}), 0)

// earned flag flips at the threshold; progress clamps to 100
const at = evaluateBadges({ learned: 10, solved: 0, streak: 3, daily: 0, level: 1 })
const learn10 = at.find(b => b.id === 'learn-10')
assert.strictEqual(learn10.earned, true)
assert.strictEqual(learn10.progressPct, 100)
const streak3 = at.find(b => b.id === 'streak-3')
assert.strictEqual(streak3.earned, true)
const streak7 = at.find(b => b.id === 'streak-7')
assert.strictEqual(streak7.earned, false)

// partial progress rounds and stays in [0,100]
const partial = evaluateBadges({ learned: 5 }).find(b => b.id === 'learn-10')
assert.strictEqual(partial.earned, false)
assert.strictEqual(partial.progressPct, 50) // 5/10
const over = evaluateBadges({ learned: 999 }).find(b => b.id === 'learn-1')
assert.strictEqual(over.progressPct, 100) // clamped

// earnedBadgeCount counts only earned
const stats = { learned: 25, solved: 10, streak: 7, daily: 5, level: 5 }
const count = earnedBadgeCount(stats)
assert.strictEqual(count, evaluateBadges(stats).filter(b => b.earned).length)
assert.ok(count >= 7, `expected several earned, got ${count}`)

console.log('OK test-badges')
