/* Pure, node-safe seed + PRNG for the daily challenge. Kept separate from
   dailyChallenge.js (which imports Vite-only pool.js via import.meta.glob) so
   these can be unit-tested under plain Node ESM. */

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
